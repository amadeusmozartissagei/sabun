import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenAI } from '@google/genai';

interface GeneratePlanRequest {
  subjective: string;
  objective: string;
  assessment: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ plan: string } | { error: string }>
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
    const { subjective, objective, assessment }: GeneratePlanRequest = req.body;

    if (!subjective || !objective || !assessment) {
      return res.status(400).json({ error: 'Subjective, Objective, dan Assessment data diperlukan' });
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `Anda adalah asisten medis profesional yang membantu dokter menyusun Plan (P) dalam catatan SOAP.

SUBJECTIVE (S):
${subjective}

OBJECTIVE (O):
${objective}

ASSESSMENT (A):
${assessment}

Berdasarkan data di atas, buatkan rencana perawatan komprehensif yang mencakup:
- Medications: Obat-obatan dengan dosis, rute, dan durasi
- Investigations: Pemeriksaan lanjutan yang diperlukan
- Procedures: Prosedur yang akan dilakukan
- Education: Edukasi pasien
- Follow-up: Rencana kontrol dan monitoring
- Consultation: Rujukan spesialis jika diperlukan

Berikan rencana yang spesifik, actionable, dan berdasarkan evidence-based medicine. Format dalam Bahasa Indonesia yang profesional.`;

    const result = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: prompt,
    });

    const plan = result.text;

    return res.status(200).json({
      plan: plan.trim(),
    });
  } catch (error) {
    console.error('[Generate Plan] Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return res.status(500).json({
      error: `Gagal generate Plan: ${errorMessage}`,
    });
  }
}

