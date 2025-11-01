import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenAI } from '@google/genai';
import { GeminiResponse } from '@/types/soap';

interface GeminiRequest {
  section: 'subjective' | 'objective' | 'assessment' | 'plan';
  context: string;
}

const PROMPTS = {
  subjective: `Anda adalah asisten medis profesional yang membantu dokter mengisi bagian Subjective (S) dalam catatan SOAP.
Tugas Anda: Berikan saran struktur keluhan subjektif pasien yang jelas dan sistematis.
Format yang disarankan: 
- CC (Chief Complaint): Keluhan utama
- HPI (History of Present Illness): Riwayat penyakit sekarang dengan LOCATES (Location, Onset, Character, Associated symptoms, Timing, Exacerbating/Relieving factors, Severity)
- ROS (Review of Systems): Tinjauan sistem tubuh
Berikan saran yang profesional dan sesuai standar medis.`,

  objective: `Anda adalah asisten medis profesional yang membantu dokter mengisi bagian Objective (O) dalam catatan SOAP.
Tugas Anda: Berikan saran struktur temuan objektif yang sistematis.
Format yang disarankan:
- Vital Signs: TD, Nadi, RR, Suhu, SpO2
- General Appearance: Tampilan umum pasien
- Physical Examination: Temuan pemeriksaan fisik sesuai sistem tubuh
- Laboratory/Investigations: Hasil laboratorium atau pemeriksaan penunjang
Berikan saran yang jelas dan terstruktur sesuai standar medis.`,

  assessment: `Anda adalah asisten medis profesional yang membantu dokter membuat Assessment (A) dalam catatan SOAP.
Tugas Anda: Berikan analisis diagnosis dan evaluasi klinis berdasarkan data Subjective dan Objective.
PENTING: Assessment adalah TITIK KRITIS pengambilan keputusan klinis.
Format yang disarankan:
- Primary Diagnosis: Diagnosis utama dengan ICD-10 jika relevan
- Differential Diagnosis: Diagnosis banding yang perlu dipertimbangkan
- Clinical Reasoning: Penalaran klinis yang menghubungkan gejala dan temuan
- Problem List: Daftar masalah kesehatan yang ditemukan
Berikan analisis yang kritis, evidence-based, dan membantu pengambilan keputusan klinis.`,

  plan: `Anda adalah asisten medis profesional yang membantu dokter menyusun Plan (P) dalam catatan SOAP.
Tugas Anda: Berikan rekomendasi rencana perawatan komprehensif berdasarkan assessment.
Format yang disarankan mengikuti SOAPIE:
- Medications: Obat-obatan dengan dosis, rute, dan durasi
- Investigations: Pemeriksaan lanjutan yang diperlukan
- Procedures: Prosedur yang akan dilakukan
- Education: Edukasi pasien
- Follow-up: Rencana kontrol dan monitoring
- Consultation: Rujukan spesialis jika diperlukan
Berikan rencana yang spesifik, actionable, dan berdasarkan evidence-based medicine.`,
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

INFORMASI YANG SUDAH TERKUNPUL:
${contextSection}

${section === 'assessment' 
  ? 'HUBUNGKAN gejala subjektif dengan temuan objektif untuk membuat analisis klinis yang komprehensif.'
  : 'BUAT rencana perawatan yang spesifik dan dapat ditindaklanjuti berdasarkan assessment di atas.'}

Berikan output dalam Bahasa Indonesia yang profesional:`;
    } else {
      // Untuk Subjective dan Objective, template sederhana
      enhancedPrompt = `${PROMPTS[section]}

KONTEKS SAAT INI:
${contextSection}

Berikan saran yang relevan, jelas, dan profesional dalam Bahasa Indonesia:`;
    }

    console.log('[Gemini API] Section:', section);
    console.log('[Gemini API] Prompt length:', enhancedPrompt.length);
    
    // Use the new API pattern
    const result = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: enhancedPrompt,
    });
    
    const suggestion = result.text;

    console.log('[Gemini API] Response length:', suggestion.length);

    return res.status(200).json({
      suggestion: suggestion.trim(),
      confidence: 0.8, // Placeholder confidence score
    });
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


