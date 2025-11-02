import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenAI } from '@google/genai';
import { GeminiResponse } from '@/types/soap';

interface GeminiRequest {
  section: 'subjective' | 'objective' | 'assessment' | 'plan';
  context: string;
}

// Helper function to extract JSON from response
function extractJSON(text: string): any {
  try {
    // Try to find JSON in code blocks
    const jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }
    
    // Try to find JSON object directly
    const objectMatch = text.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      return JSON.parse(objectMatch[0]);
    }
    
    // If no JSON found, return null
    return null;
  } catch (error) {
    console.error('[Extract JSON] Error:', error);
    return null;
  }
}

// Helper function to format JSON to readable text
function formatJSONToText(data: any, section: string): string {
  try {
    if (section === 'subjective') {
      return `Chief Complaint (CC):\n${data.cc || '[Belum diisi]'}\n\nHistory of Present Illness (HPI):\n${data.hpi || '[Belum diisi]'}\n\nReview of Systems (ROS):\n${data.ros || '[Belum diisi]'}\n\nRingkasan:\n${data.summary || '[Belum diisi]'}`;
    }
    
    if (section === 'objective') {
      const vs = data.vitalSigns || {};
      return `VITAL SIGNS:\n- TD: ${vs.td || '[kosong]'}\n- Nadi: ${vs.nadi || '[kosong]'}\n- RR: ${vs.rr || '[kosong]'}\n- Suhu: ${vs.suhu || '[kosong]'}\n- SpO2: ${vs.spo2 || '[kosong]'}\n\nTAMPILAN UMUM:\n${data.generalAppearance || '[Belum diisi]'}\n\nPEMERIKSAAN FISIK:\n${data.physicalExamination || '[Belum diisi]'}\n\nLABORATORIUM/INVESTIGASI:\n${data.laboratory || '[Belum diisi]'}`;
    }
    
    if (section === 'assessment') {
      const primary = data.primaryDiagnosis || {};
      const differential = Array.isArray(data.differentialDiagnosis) ? data.differentialDiagnosis : [];
      const problems = Array.isArray(data.problemList) ? data.problemList : [];
      
      return `DIAGNOSIS UTAMA:\n${primary.diagnosis || '[Belum diisi]'}${primary.icd10 ? ` (ICD-10: ${primary.icd10})` : ''}\n\nDIAGNOSIS BANDING:\n${differential.map((d: string, i: number) => `${i + 1}. ${d}`).join('\n') || '[Belum ada diagnosis banding]'}\n\nPENALARAN KLINIS:\n${data.clinicalReasoning || '[Belum diisi]'}\n\nDAFTAR MASALAH:\n${problems.map((p: string, i: number) => `${i + 1}. ${p}`).join('\n') || '[Belum ada masalah teridentifikasi]'}`;
    }
    
    if (section === 'plan') {
      const meds = Array.isArray(data.medications) ? data.medications : [];
      const inv = Array.isArray(data.investigations) ? data.investigations : [];
      const proc = Array.isArray(data.procedures) ? data.procedures : [];
      
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
      
      planText += `EDUKASI PASIEN:\n${data.education || '[Belum diisi]'}\n\nFOLLOW-UP:\n${data.followUp || '[Belum diisi]'}\n\nRUJUKAN:\n${data.consultation || '[Tidak ada rujukan]'}`;
      
      return planText;
    }
    
    // Fallback: return JSON stringified
    return JSON.stringify(data, null, 2);
  } catch (error) {
    console.error('[Format JSON] Error:', error);
    return JSON.stringify(data, null, 2);
  }
}

const PROMPTS = {
  subjective: `Anda adalah asisten medis profesional yang membantu dokter mengisi bagian Subjective (S) dalam catatan SOAP.
Berikan saran struktur keluhan subjektif pasien yang jelas dan sistematis.

WAJIB: Response HANYA dalam format JSON berikut, tanpa tambahan teks apapun:
{
  "cc": "Chief Complaint - Keluhan utama pasien",
  "hpi": "History of Present Illness - Riwayat penyakit dengan LOCATES",
  "ros": "Review of Systems - Tinjauan sistem tubuh",
  "summary": "Ringkasan singkat keluhan subjektif"
}`,

  objective: `Anda adalah asisten medis profesional yang membantu dokter mengisi bagian Objective (O) dalam catatan SOAP.
Berikan saran struktur temuan objektif yang sistematis.

WAJIB: Response HANYA dalam format JSON berikut, tanpa tambahan teks apapun:
{
  "vitalSigns": {
    "td": "Tekanan darah (contoh: 120/80 mmHg atau [kosong])",
    "nadi": "Denyut nadi (contoh: 80x/menit atau [kosong])",
    "rr": "Respirasi rate (contoh: 20x/menit atau [kosong])",
    "suhu": "Suhu tubuh (contoh: 36.5°C atau [kosong])",
    "spo2": "SpO2 (contoh: 98% atau [kosong])"
  },
  "generalAppearance": "Tampilan umum pasien (contoh atau [kosong])",
  "physicalExamination": "Temuan pemeriksaan fisik sesuai sistem tubuh",
  "laboratory": "Hasil laboratorium atau pemeriksaan penunjang (jika ada)"
}`,

  assessment: `Anda adalah asisten medis profesional yang membantu dokter membuat Assessment (A) dalam catatan SOAP.
PENTING: Assessment adalah TITIK KRITIS pengambilan keputusan klinis.

WAJIB: Response HANYA dalam format JSON berikut, tanpa tambahan teks apapun:
{
  "primaryDiagnosis": {
    "diagnosis": "Diagnosis utama",
    "icd10": "Kode ICD-10 (jika relevan)"
  },
  "differentialDiagnosis": ["Diagnosis banding 1", "Diagnosis banding 2"],
  "clinicalReasoning": "Penalaran klinis yang menghubungkan gejala dan temuan",
  "problemList": ["Masalah 1", "Masalah 2", "Masalah 3"]
}`,

  plan: `Anda adalah asisten medis profesional yang membantu dokter menyusun Plan (P) dalam catatan SOAP.
Berikan rekomendasi rencana perawatan komprehensif.

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
}`,
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GeminiResponse | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error('GEMINI_API_KEY is not set');
    return res.status(500).json({
      error: 'Gemini API key tidak dikonfigurasi. Silakan set GEMINI_API_KEY di file .env',
    });
  }

  try {
    const { section, context }: GeminiRequest = req.body;

    if (!section || !['subjective', 'objective', 'assessment', 'plan'].includes(section)) {
      return res.status(400).json({ error: 'Section tidak valid' });
    }

    // The client gets the API key from environment variable GEMINI_API_KEY
    const ai = new GoogleGenAI({ apiKey });
    
    const contextSection = context || 'Belum ada input dari dokter';
    
    let enhancedPrompt = '';
    if (section === 'assessment' || section === 'plan') {
      // Untuk Assessment dan Plan, beri konteks lebih lengkap
      enhancedPrompt = `${PROMPTS[section]}

KONTEKS DATA:
${contextSection}

${section === 'assessment' 
  ? 'HUBUNGKAN gejala subjektif dengan temuan objektif untuk membuat analisis klinis yang komprehensif.'
  : 'BUAT rencana perawatan yang spesifik dan dapat ditindaklanjuti berdasarkan assessment di atas.'}

PENTING: Response HARUS berupa JSON valid, tanpa teks tambahan apapun. Gunakan Bahasa Indonesia untuk semua nilai.`;
    } else {
      // Untuk Subjective dan Objective, template sederhana
      enhancedPrompt = `${PROMPTS[section]}

KONTEKS SAAT INI:
${contextSection}

PENTING: Response HARUS berupa JSON valid, tanpa teks tambahan apapun. Gunakan Bahasa Indonesia untuk semua nilai.`;
    }

    console.log('[Gemini API] Section:', section);
    console.log('[Gemini API] Prompt length:', enhancedPrompt.length);
    
    // Use the new API pattern
    const result = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: enhancedPrompt,
    });
    
    const rawResponse = result.text || '';
    console.log('[Gemini API] Raw response:', rawResponse.substring(0, 200));

    // Extract JSON from response
    const jsonData = extractJSON(rawResponse);
    
    if (jsonData) {
      // Format JSON to readable text for display
      const formattedText = formatJSONToText(jsonData, section);
      
      return res.status(200).json({
        suggestion: formattedText,
        data: jsonData, // Also return structured data
        confidence: 0.8,
      } as GeminiResponse);
    } else {
      // Fallback: return raw text if JSON parsing fails
      console.warn('[Gemini API] Failed to extract JSON, using raw text');
      return res.status(200).json({
        suggestion: rawResponse.trim(),
        confidence: 0.7,
      } as GeminiResponse);
    }
  } catch (error) {
    console.error('[Gemini API] Error details:', error);
    console.error('[Gemini API] Error type:', typeof error);
    console.error('[Gemini API] Error stack:', error instanceof Error ? error.stack : 'No stack');
    
    // Get more detailed error message
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error && typeof error === 'object') {
      errorMessage = JSON.stringify(error);
    }
    
    return res.status(500).json({
      error: `Gagal mengambil saran dari Gemini API: ${errorMessage}`,
    });
  }
}


