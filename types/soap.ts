export interface SOAPData {
  id?: string;
  patientId: string;
  patientName: string;
  date: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Patient {
  id: string;
  name: string;
  age?: number;
  gender?: string;
  medicalRecordNumber?: string;
  createdAt?: string;
}

export interface GeminiResponse {
  suggestion: string;
  confidence?: number;
  data?: any; // Structured JSON data from AI
}


