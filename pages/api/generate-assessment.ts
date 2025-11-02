import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenAI } from '@google/genai';

interface GenerateAssessmentRequest {
  subjective: string;
  objective: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ assessment: string } | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: 'Gemini API key tidak dikonfigurasi',
    });
  }

  try {
    const { subjective, objective }: GenerateAssessmentRequest = req.body;

    if (!subjective || !objective) {
      return res.status(400).json({ error: 'Subjective dan Objective data diperlukan' });
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `Anda adalah asisten medis profesional yang membantu dokter membuat Assessment (A) dalam catatan SOAP.

SUBJECTIVE (S):
${subjective}

OBJECTIVE (O):
${objective}

Berdasarkan data Subjective dan Objective di atas, buatkan Assessment yang mencakup:
- Primary Diagnosis: Diagnosis utama dengan ICD-10 jika relevan
- Differential Diagnosis: Diagnosis banding yang perlu dipertimbangkan
- Clinical Reasoning: Penalaran klinis yang menghubungkan gejala dan temuan
- Problem List: Daftar masalah kesehatan yang ditemukan

Berikan analisis yang kritis, evidence-based, dan membantu pengambilan keputusan klinis. Format dalam Bahasa Indonesia yang profesional.`;

    const result = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: prompt,
    });

    const assessment = result.text;

    return res.status(200).json({
      assessment: assessment.trim(),
    });
  } catch (error) {
    console.error('[Generate Assessment] Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return res.status(500).json({
      error: `Gagal generate Assessment: ${errorMessage}`,
    });
  }
}

