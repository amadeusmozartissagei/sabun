import { SOAPData } from '@/types/soap';

export const VALIDATION_RULES = {
  PATIENT_NAME_MIN_LENGTH: 2,
  PATIENT_NAME_MAX_LENGTH: 100,
  SOAP_FIELD_MIN_LENGTH: 10,
  SOAP_FIELD_MAX_LENGTH: 5000,
} as const;

export interface ValidationError {
  field: string;
  message: string;
}

export const validateSOAPData = (data: Partial<SOAPData>): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!data.patientName || data.patientName.trim().length < VALIDATION_RULES.PATIENT_NAME_MIN_LENGTH) {
    errors.push({
      field: 'patientName',
      message: `Nama pasien harus minimal ${VALIDATION_RULES.PATIENT_NAME_MIN_LENGTH} karakter`,
    });
  }

  if (data.patientName && data.patientName.length > VALIDATION_RULES.PATIENT_NAME_MAX_LENGTH) {
    errors.push({
      field: 'patientName',
      message: `Nama pasien maksimal ${VALIDATION_RULES.PATIENT_NAME_MAX_LENGTH} karakter`,
    });
  }

  if (!data.subjective || data.subjective.trim().length < VALIDATION_RULES.SOAP_FIELD_MIN_LENGTH) {
    errors.push({
      field: 'subjective',
      message: `Subjective harus minimal ${VALIDATION_RULES.SOAP_FIELD_MIN_LENGTH} karakter`,
    });
  }

  if (!data.objective || data.objective.trim().length < VALIDATION_RULES.SOAP_FIELD_MIN_LENGTH) {
    errors.push({
      field: 'objective',
      message: `Objective harus minimal ${VALIDATION_RULES.SOAP_FIELD_MIN_LENGTH} karakter`,
    });
  }

  if (!data.assessment || data.assessment.trim().length < VALIDATION_RULES.SOAP_FIELD_MIN_LENGTH) {
    errors.push({
      field: 'assessment',
      message: `Assessment harus minimal ${VALIDATION_RULES.SOAP_FIELD_MIN_LENGTH} karakter`,
    });
  }

  if (!data.plan || data.plan.trim().length < VALIDATION_RULES.SOAP_FIELD_MIN_LENGTH) {
    errors.push({
      field: 'plan',
      message: `Plan harus minimal ${VALIDATION_RULES.SOAP_FIELD_MIN_LENGTH} karakter`,
    });
  }

  return errors;
};

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};


