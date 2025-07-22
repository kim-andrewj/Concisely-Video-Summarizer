# Concisely

**Summarize long-form videos into structured insights in minutes.**  
Built with **Next.js**, **TypeScript**, **FastAPI**, and **PostgreSQL**.

---

## 🧠 Overview

**Concisely** is a full-stack web application that allows users to upload long-form videos (e.g. lectures, podcasts, meetings) and receive:

- 📝 **Executive Summary**
- 📌 **Action Items**
- 🧩 **Topic Highlights**

The system is designed to process videos up to from upload to final summary, using an optimized batch pipeline and multi-stage summarization.

---

## 🔧 Tech Stack

- **Frontend**: Next.js, TypeScript
- **Backend**: FastAPI, PostgreSQL
- **AI Pipeline**: whisper.cpp, FFmpeg, OpenAI GPT-4 API

---

## 🚀 Features

- 🎥 **Modular Upload & Viewer**  
  Built with reusable React components to support file uploads, summary display, and view toggling.

- 🧠 **Multi-stage AI Summarization**  
  Transcripts are segmented and processed in stages for GPT-4 to generate summaries with higher coherence and structure.

- ⚙️ **Efficient Transcription Pipeline**  
  Utilizes `whisper.cpp` for fast CPU-based transcription and `FFmpeg` for audio preprocessing.

- 🛠️ **Batch Processing**  
  Large transcripts are split into chunks to avoid token overflow and are summarized in a distributed batch pipeline.

- 🗂️ **Persistent Storage**  
  Summaries and transcripts are stored and retrieved using a PostgreSQL database.

---

## 🧪 Example Use Case
1. Upload a 90-minute lecture video via the UI.
2. Audio is extracted and transcribed locally using `whisper.cpp`.
3. Transcript is segmented and passed through GPT-4 in batches.
4. Final summaries are rendered on the frontend with view tabs for:
   - Executive Summary  
   - Action Items  
   - Topic Highlights

---

## 📈 Performance
- 📹 **2-hour lecture → Summary in under 5 minutes**
- ⚡ Fast transcription enabled by `whisper.cpp` and optimized chunking
- 🧠 Summaries generated via GPT-4 with structured outputs

---

## 🛠️ Future Improvements
- Docker-based deployment
- User authentication and summary history
- Replace local PostgreSQL with a managed cloud service like Supabase

---

## 🛠 Getting Started

### Prerequisites

- Node.js ≥ 18
- Python ≥ 3.10
- FFmpeg installed and added to PATH
- (Optional but recommended) OpenAI API key

---

### ⚙️ Frontend Setup (Next.js)
- cd concisely-frontend
- npm install
- npm run dev

### ⚙️ Backend Setup (FastAPI)
- cd concisely-backend
- python -m venv venv
- source venv/bin/activate  # On Windows: venv\Scripts\activate
- pip install -r requirements.txt
- uvicorn main:app --reload --port 8000  # You can change the port if needed
