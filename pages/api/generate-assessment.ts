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

WAJIB: Response HANYA dalam format JSON berikut, tanpa tambahan teks apapun:
{
  "primaryDiagnosis": {
    "diagnosis": "Diagnosis utama",
    "icd10": "Kode ICD-10 (jika relevan)"
  },
  "differentialDiagnosis": ["Diagnosis banding 1", "Diagnosis banding 2"],
  "clinicalReasoning": "Penalaran klinis yang menghubungkan gejala dan temuan",
  "problemList": ["Masalah 1", "Masalah 2"]
}

HUBUNGKAN gejala subjektif dengan temuan objektif untuk membuat analisis klinis yang komprehensif.
PENTING: Response HARUS berupa JSON valid, tanpa teks tambahan apapun. Gunakan Bahasa Indonesia.`;

    const result = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: prompt,
    });

    const rawResponse = result.text;
    
    // Extract JSON from response
    const extractJSON = (text: string): any => {
      try {
        const jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[1]);
        }
        const objectMatch = text.match(/\{[\s\S]*\}/);
        if (objectMatch) {
          return JSON.parse(objectMatch[0]);
        }
        return null;
      } catch (error) {
        console.error('[Extract JSON] Error:', error);
        return null;
      }
    };

    const jsonData = extractJSON(rawResponse);
    
    if (jsonData) {
      // Format to readable text
      const primary = jsonData.primaryDiagnosis || {};
      const differential = Array.isArray(jsonData.differentialDiagnosis) ? jsonData.differentialDiagnosis : [];
      const problems = Array.isArray(jsonData.problemList) ? jsonData.problemList : [];
      
      const formattedText = `DIAGNOSIS UTAMA:\n${primary.diagnosis || '[Belum diisi]'}${primary.icd10 ? ` (ICD-10: ${primary.icd10})` : ''}\n\nDIAGNOSIS BANDING:\n${differential.map((d: string, i: number) => `${i + 1}. ${d}`).join('\n') || '[Belum ada diagnosis banding]'}\n\nPENALARAN KLINIS:\n${jsonData.clinicalReasoning || '[Belum diisi]'}\n\nDAFTAR MASALAH:\n${problems.map((p: string, i: number) => `${i + 1}. ${p}`).join('\n') || '[Belum ada masalah teridentifikasi]'}`;
      
      return res.status(200).json({
        assessment: formattedText,
        data: jsonData,
      });
    } else {
      // Fallback to raw text
      return res.status(200).json({
        assessment: rawResponse.trim(),
      });
    }
  } catch (error) {
    console.error('[Generate Assessment] Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return res.status(500).json({
      error: `Gagal generate Assessment: ${errorMessage}`,
    });
  }
}

