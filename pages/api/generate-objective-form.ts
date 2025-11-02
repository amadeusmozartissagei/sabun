import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenAI } from '@google/genai';

interface GenerateObjectiveFormRequest {
  subjective: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ 
    form: string; 
    checklist?: {
      vitalSigns: string[];
      physicalExam: string[];
      laboratory: string[];
      notes: string;
    };
    data?: any;
  } | { error: string }>
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

    const prompt = `Anda adalah asisten medis di PUSKESMAS yang membantu dokter membuat CHECKLIST SINGKAT dan SEDERHANA untuk pemeriksaan Objective (O) berdasarkan keluhan pasien.

KELUHAN SUBJEKTIF:
${subjective}

WAJIB: Response HANYA dalam format JSON berikut, SANGAT SINGKAT dan FOKUS pada checklist pemeriksaan yang relevan dan bisa dilakukan di PUSKESMAS:
{
  "vitalSigns": {
    "checklist": ["TD", "Nadi", "RR", "Suhu", "SpO2"]
  },
  "physicalExamChecklist": [
    "Item pemeriksaan fisik 1 yang relevan (sangat singkat)",
    "Item pemeriksaan fisik 2 yang relevan (sangat singkat)",
    "Item pemeriksaan fisik 3 yang relevan (sangat singkat)"
  ],
  "laboratorySuggestions": [
    "Pemeriksaan lab sederhana di puskesmas (jika diperlukan)",
    "Pemeriksaan lab sederhana di puskesmas (jika diperlukan)"
  ],
  "notes": "Catatan singkat pemeriksaan prioritas berdasarkan keluhan (maksimal 2 kalimat)"
}

INSTRUKSI PENTING:
- Checklist harus SANGAT SINGKAT (maksimal 5-7 item untuk physical exam)
- Fokus pada pemeriksaan yang BISA DILAKUKAN DI PUSKESMAS (tidak perlu alat canggih)
- Hanya sarankan pemeriksaan lab SEDERHANA yang tersedia di puskesmas (misal: darah rutin, urin, gula darah)
- Gunakan Bahasa Indonesia yang mudah dipahami
- Jangan tambahkan pemeriksaan yang memerlukan alat khusus atau rujukan
- Format harus berupa checklist yang mudah diikuti dokter

PENTING: Response HARUS berupa JSON valid, tanpa teks tambahan apapun.`;

    const result = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: prompt,
    });

    const rawResponse = result.text || '';
    
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
      // Format checklist to readable text (SANGAT SINGKAT)
      const vsChecklist = Array.isArray(jsonData.vitalSigns?.checklist) 
        ? jsonData.vitalSigns.checklist 
        : ['TD', 'Nadi', 'RR', 'Suhu', 'SpO2'];
      
      const physicalChecklist = Array.isArray(jsonData.physicalExamChecklist) 
        ? jsonData.physicalExamChecklist 
        : [];
      
      const labSuggestions = Array.isArray(jsonData.laboratorySuggestions) 
        ? jsonData.laboratorySuggestions 
        : [];
      
      let formattedText = `CHECKLIST PEMERIKSAAN OBJEKTIF:\n\n`;
      
      // Vital Signs Checklist
      formattedText += `☑ VITAL SIGNS:\n`;
      vsChecklist.forEach((item: string) => {
        formattedText += `   ☐ ${item}\n`;
      });
      
      // Physical Exam Checklist
      if (physicalChecklist.length > 0) {
        formattedText += `\n☑ PEMERIKSAAN FISIK:\n`;
        physicalChecklist.forEach((item: string) => {
          formattedText += `   ☐ ${item}\n`;
        });
      }
      
      // Laboratory Suggestions
      if (labSuggestions.length > 0) {
        formattedText += `\n☑ SARAN LABORATORIUM (Jika diperlukan):\n`;
        labSuggestions.forEach((item: string) => {
          formattedText += `   ☐ ${item}\n`;
        });
      }
      
      // Notes
      if (jsonData.notes) {
        formattedText += `\n📝 CATATAN: ${jsonData.notes}`;
      }
      
      return res.status(200).json({
        form: formattedText.trim(),
        checklist: {
          vitalSigns: vsChecklist,
          physicalExam: physicalChecklist,
          laboratory: labSuggestions,
          notes: jsonData.notes || '',
        },
        data: jsonData,
      });
    } else {
      // Fallback to raw text
      return res.status(200).json({
        form: rawResponse.trim(),
      });
    }
  } catch (error) {
    console.error('[Generate Objective Form] Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return res.status(500).json({
      error: `Gagal generate form Objective: ${errorMessage}`,
    });
  }
}

