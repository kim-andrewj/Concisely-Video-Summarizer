
import { Libre_Bodoni } from 'next/font/google';
import {NextResponse} from 'next/server';

export async function POST(request: Request) {
  console.log('📩 /api/upload hit!');

  const formData = await request.formData();
  const file = formData.get('video') as File;

  if (!file) {
    console.log('❌ No file found in formData');
    return NextResponse.json({error: 'No file uploaded.'}, {status: 400});
  }

  const blob = file as Blob;
  const fastApiFormData = new FormData();
  fastApiFormData.append('video', blob, file.name);

  try {
    const fastApiRes = await fetch('http://localhost:8000/summarize', {
      method: 'POST',
      body: fastApiFormData,
    });

    if (!fastApiRes.ok) {
      throw new Error('FastAPI summarization failed');
    }

    const result = await fastApiRes.json();
    return NextResponse.json({summary: result});
  } catch (error) {
    console.error('Error forwarding to FastAPI:', error);
    return NextResponse.json({error: 'Internal server error'}, {status: 500});
  }
}