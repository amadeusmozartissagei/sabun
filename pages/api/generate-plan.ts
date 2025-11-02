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

WAJIB: Response HANYA dalam format JSON berikut, tanpa tambahan teks apapun:
{
  "medications": [
    {
      "nama": "Nama obat",
      "dosis": "Dosis",
      "rute": "Rute pemberian (oral/IV/IM/dll)",
      "durasi": "Durasi pengobatan"
    }
  ],
  "investigations": ["Pemeriksaan 1", "Pemeriksaan 2"],
  "procedures": ["Prosedur 1", "Prosedur 2"],
  "education": "Edukasi pasien",
  "followUp": "Rencana kontrol dan monitoring",
  "consultation": "Rujukan spesialis (jika diperlukan)"
}

BUAT rencana perawatan yang spesifik dan dapat ditindaklanjuti berdasarkan assessment di atas.
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
      const meds = Array.isArray(jsonData.medications) ? jsonData.medications : [];
      const inv = Array.isArray(jsonData.investigations) ? jsonData.investigations : [];
      const proc = Array.isArray(jsonData.procedures) ? jsonData.procedures : [];
      
      let planText = '';
      
      if (meds.length > 0) {
        planText += `OBAT-OBATAN:\n${meds.map((m: any, i: number) => 
          `${i + 1}. ${m.nama || 'Obat'} - ${m.dosis || ''} ${m.rute || ''}, ${m.durasi || ''}`
        ).join('\n')}\n\n`;
      }
      
      if (inv.length > 0) {
        planText += `PEMERIKSAAN LANJUTAN:\n${inv.map((item: string, i: number) => `${i + 1}. ${item}`).join('\n')}\n\n`;
      }
      
      if (proc.length > 0) {
        planText += `PROSEDUR:\n${proc.map((item: string, i: number) => `${i + 1}. ${item}`).join('\n')}\n\n`;
      }
      
      planText += `EDUKASI PASIEN:\n${jsonData.education || '[Belum diisi]'}\n\nFOLLOW-UP:\n${jsonData.followUp || '[Belum diisi]'}\n\nRUJUKAN:\n${jsonData.consultation || '[Tidak ada rujukan]'}`;
      
      return res.status(200).json({
        plan: planText,
        data: jsonData,
      });
    } else {
      // Fallback to raw text
      return res.status(200).json({
        plan: rawResponse.trim(),
      });
    }
  } catch (error) {
    console.error('[Generate Plan] Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return res.status(500).json({
      error: `Gagal generate Plan: ${errorMessage}`,
    });
  }
}

