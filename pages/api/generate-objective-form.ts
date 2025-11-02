import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenAI } from '@google/genai';

interface GenerateObjectiveFormRequest {
  subjective: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ form: string } | { error: string }>
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
    const { subjective }: GenerateObjectiveFormRequest = req.body;

    if (!subjective) {
      return res.status(400).json({ error: 'Subjective data diperlukan' });
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `Berdasarkan keluhan subjektif pasien berikut, generate form struktur untuk bagian Objective (O) dalam SOAP.

KELUHAN SUBJEKTIF:
${subjective}

Buatkan struktur form Objective yang mencakup:
1. Vital Signs (TD, Nadi, RR, Suhu, SpO2) - dengan field kosong untuk diisi
2. General Appearance - dengan field kosong untuk diisi
3. Physical Examination - dengan struktur sesuai sistem tubuh yang relevan berdasarkan keluhan
4. Laboratory/Investigations - sarankan pemeriksaan yang relevan berdasarkan keluhan

Format output: JSON structure atau list dengan field yang jelas. Berikan dalam Bahasa Indonesia.`;

    const result = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: prompt,
    });

    const form = result.text;

    return res.status(200).json({
      form: form.trim(),
    });
  } catch (error) {
    console.error('[Generate Objective Form] Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return res.status(500).json({
      error: `Gagal generate form Objective: ${errorMessage}`,
    });
  }
}

