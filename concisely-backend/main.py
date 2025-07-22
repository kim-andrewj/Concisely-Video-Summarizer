import os
import subprocess
import re
from datetime import datetime
from uuid import uuid4
from typing import Optional
from openai import OpenAI
from fastapi import FastAPI, File, UploadFile, Depends, APIRouter, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from db.database import SessionLocal, engine
from db.base_class import Base
from models.video import Video
from tiktoken import encoding_for_model
from dotenv import load_dotenv


app = FastAPI()

Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
router = APIRouter()
load_dotenv()  # this must come before os.getenv()
client = OpenAI(api_key=os.getenv("CONCISELY_API_KEY"))

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = {".mp4", ".mov", ".mkv"}



def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def extract_audio(video_path):
    audio_path = video_path + ".wav"
    subprocess.run([
        "ffmpeg", "-i", video_path, "-ar", "16000", "-ac", "1", "-f", "wav", audio_path
    ], check=True)
    return audio_path

def transcribe_with_whisper_cpp(audio_path):
    whisper_cpp_path = os.path.join(os.path.dirname(__file__), "whisper.cpp", "build", "bin", "whisper-cli")
    model_path = os.path.join(os.path.dirname(__file__), "whisper.cpp", "models", "ggml-base.en.bin")

    subprocess.run([
        whisper_cpp_path, "-f", audio_path, "-m", model_path, "-osrt"
    ], check=True)

    srt_path = audio_path + ".srt"
    with open(srt_path, "r") as f:
        return f.read()

def parse_srt_to_segments(srt_text, max_lines_per_segment=4):
    entries = srt_text.strip().split("\n\n")
    segments = []
    current_segment = []
    current_start_time = None

    def clean(text):
        return text.strip().replace("♪", "").replace("-", "").strip()

    def extract_hms(timestamp_line):
        try:
            start_time = timestamp_line.split(" --> ")[0].strip()
            h, m, s = start_time.split(":")
            s = s.split(",")[0]
            return f"{h}:{m}:{s}"
        except:
            return "00:00:00"

    for entry in entries:
        lines = entry.strip().splitlines()
        if len(lines) < 2:
            continue

        timestamp_line = lines[0] if "-->" in lines[0] else lines[1]
        text_lines = lines[2:] if "-->" in lines[1] else lines[1:]

        start_time = extract_hms(timestamp_line)
        combined_text = " ".join([clean(line) for line in text_lines if clean(line)])

        if not combined_text:
            continue

        if current_start_time is None:
            current_start_time = start_time

        current_segment.append(combined_text)

        if (
            len(current_segment) >= max_lines_per_segment
            or combined_text.endswith("?")
            or combined_text.endswith("!")
        ):
            segments.append({"timestamp": current_start_time, "content": " ".join(current_segment)})
            current_segment = []
            current_start_time = None

    if current_segment:
        segments.append({"timestamp": current_start_time, "content": " ".join(current_segment)})

    return segments

def count_tokens(text, model="gpt-4"):
    enc = encoding_for_model(model)
    return len(enc.encode(text))

def chunk_transcript(transcript_lines, max_tokens=5000):
    chunks = []
    current_chunk = []
    current_token_count = 0
    enc = encoding_for_model("gpt-4")

    for line in transcript_lines:
        line_token_count = len(enc.encode(line))
        if current_token_count + line_token_count > max_tokens:
            chunks.append(current_chunk)
            current_chunk = []
            current_token_count = 0
        current_chunk.append(line)
        current_token_count += line_token_count

    if current_chunk:
        chunks.append(current_chunk)
    return chunks

def extract_sections_from_gpt_output(output_text):
    executive_summary = ""
    action_items = []
    highlights = []

    # check if text starts with 1. 2. etc
    exec_match = re.search(r"1\.\s*Executive Summary[:\-]?\s*(.*?)(?=2\.|Action Items:|Topic Highlights:|$)", output_text, re.DOTALL)
    if not exec_match:
        # fallback to unnumbered format
        exec_match = re.search(r"Executive Summary[:\-]?\s*(.*?)(?=Action Items:|Topic Highlights:|$)", output_text, re.DOTALL)
    if exec_match:
        executive_summary = exec_match.group(1).strip()

    action_match = re.search(r"2\.\s*Action Items[:\-]?\s*(.*?)(?=3\.|Topic Highlights:|$)", output_text, re.DOTALL)
    if not action_match:
        action_match = re.search(r"Action Items[:\-]?\s*(.*?)(?=Topic Highlights:|$)", output_text, re.DOTALL)
    if action_match:
        items_text = action_match.group(1).strip()
        action_items = [line.strip("-•* ").strip() for line in items_text.splitlines() if line.strip() and "no action items" not in line.lower()]

    highlight_match = re.search(r"3\.\s*Topic Highlights[:\-]?\s*(.*)", output_text, re.DOTALL)
    if not highlight_match:
        highlight_match = re.search(r"Topic Highlights[:\-]?\s*(.*)", output_text, re.DOTALL)
    if highlight_match:
        lines = highlight_match.group(1).strip().splitlines()
        for line in lines:
            match = re.match(r"- \[(.*?)\]\s*(.+?)\s*[-—]\s*(.*)", line)
            if match:
                highlights.append({
                    "timestamp": match.group(1).strip(),
                    "title": match.group(2).strip(),
                    "description": match.group(3).strip()
                })

    return executive_summary, action_items, highlights


def hms_to_seconds(hms):
    h, m, s = map(int, hms.split(":"))
    return h * 3600 + m * 60 + s


# app start
@app.post("/summarize")
async def summarize(video: UploadFile = File(...), role: Optional[str] = Form(None), db: Session = Depends(get_db)):
    try:
        ext = os.path.splitext(video.filename)[1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            return {"error": "Invalid file type."}

        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        base, ext = os.path.splitext(video.filename)
        ext = ext.lower()
        filename = f"{timestamp}_{base}{ext}"

        video_path = os.path.join(UPLOAD_DIR, filename)

        with open(video_path, "wb") as f:
            f.write(await video.read())

        audio_path = extract_audio(video_path)
        srt_text = transcribe_with_whisper_cpp(audio_path)
        segments = parse_srt_to_segments(srt_text)
        transcript_lines = [f"[{seg['timestamp']}] {seg['content']}" for seg in segments]
        transcript_chunks = chunk_transcript(transcript_lines)

        all_summaries = []
        all_action_items = []
        all_highlights = []

        for chunk in transcript_chunks:
            chunk_text = "\n".join(chunk)
            if role:
                role_context = f"""
            You are summarizing this meeting for someone whose role is: "{role}". Tailor the summary and action items to be especially relevant to this role's interests and responsibilities.
            """
            else:
                role_context = ""

            gpt_prompt = f"""
            {role_context}

            You are an AI assistant summarizing a Zoom recording. Below is a timestamped transcript chunk.

            1. Executive Summary (2-3 sentences)
            2. Action Items (bulleted list)
            3. Topic Highlights: List a few key segments from the transcript that are important. Format each like this:
            - [hh:mm:ss] Title — Description

            The title should be short, such as 'Boarding the Flight'.

            The description should be a sentence, such as 'The speaker recounts the relief of finally being able to board a flight to Norfolk.'

            If the transcript is longer than 15 minutes, make the executive summary 4-6 sentences instead. 

            Transcript:
            {chunk_text}
            """



            print("=== GPT PROMPT START ===")
            print(gpt_prompt)
            print("=== GPT PROMPT END ===")
            print("Chunk token count:", count_tokens(chunk_text))


            response = client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You summarize videos."},
                    {"role": "user", "content": gpt_prompt}
                ],
                temperature=0.3,
            )

            output = response.choices[0].message.content.strip()

            print("=== GPT RAW OUTPUT START ===")
            print(output)
            print("=== GPT RAW OUTPUT END ===")

            summary, items, highlights = extract_sections_from_gpt_output(output)
            all_summaries.append(summary)
            all_action_items.extend(items)
            all_highlights.extend(highlights)


            action_items_final = list(dict.fromkeys(all_action_items))
            highlights_final = sorted(all_highlights, key=lambda x: hms_to_seconds(x["timestamp"]))

            # if tokens go over limit, more than 1 chunk; repeat process n times
            if len(transcript_chunks) > 1:
                combined_summary = "\n".join(all_summaries).strip()
                combined_actions = "\n".join(f"- {item}" for item in action_items_final)

                role_merge_context = (
                    f"The user reviewing this video is in the role of '{role}'. Tailor the summary and action items to this role's needs.\n\n"
                    if role else ""
                )

                final_merge_prompt = f"""
                {role_merge_context}
                Below are draft Executive Summaries and Action Items from multiple parts of a single video.

                Please refine and merge them into:
                1. A cohesive Executive Summary 
                2. A clean, concise list of Action Items (bulleted list)

                --- Executive Summaries ---
                {combined_summary}

                --- Action Items ---
                {combined_actions}
                """


                final_response = client.chat.completions.create(
                    model="gpt-4",
                    messages=[
                        {"role": "system", "content": "You polish and consolidate summaries."},
                        {"role": "user", "content": final_merge_prompt}
                    ],
                    temperature=0.3,
                )

                final_output = final_response.choices[0].message.content.strip()
                summary, items, _ = extract_sections_from_gpt_output(final_output)
                final_summary = summary
                action_items_final = list(dict.fromkeys(items)) 
            else:
                final_summary = all_summaries[0] if all_summaries else ""
                
        video_record = Video(
            title=video.filename,
            summary=final_summary,
            transcript="\n".join(transcript_lines),
            timestamp=datetime.now()
        )
        db.add(video_record)
        db.commit()

        return {
            "executiveSummary": final_summary,
            "actionItems": action_items_final,
            "transcript": transcript_lines,
            "highlights": highlights_final
        }

    except subprocess.CalledProcessError:
        return {"error": "Audio extraction or transcription failed."}
    except Exception as e:
        return {"error": str(e)}

@router.post("/upload-video/")
async def upload_video(video: UploadFile = File(...)):
    # ext = video.filename.split('.')[-1]
    ext = os.path.splitext(video.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        return JSONResponse(status_code=400, content={"error": "Unsupported file format."})

    filename = f"{uuid4()}.{ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    with open(file_path, "wb") as buffer:
        buffer.write(await video.read())

    # returning a URL like /uploads/<filename>
    return JSONResponse(content={"videoUrl": f"/uploads/{filename}"})

app.include_router(router)

























































