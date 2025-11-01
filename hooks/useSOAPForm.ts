import { useState, useCallback, useMemo } from 'react';
import { SOAPData } from '@/types/soap';
import { validateSOAPData, generateId } from '@/lib/utils/validation';
import { storageUtils } from '@/lib/utils/storage';

interface UseSOAPFormProps {
  initialData?: SOAPData;
  onSubmitSuccess?: (data: SOAPData) => void;
}

interface FormErrors {
  [key: string]: string;
}

export const useSOAPForm = ({ initialData, onSubmitSuccess }: UseSOAPFormProps = {}) => {
  const [formData, setFormData] = useState<Partial<SOAPData>>({
    patientName: initialData?.patientName || '',
    patientId: initialData?.patientId || '',
    date: initialData?.date || new Date().toISOString().split('T')[0],
    subjective: initialData?.subjective || '',
    objective: initialData?.objective || '',
    assessment: initialData?.assessment || '',
    plan: initialData?.plan || '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = useCallback((field: keyof SOAPData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  const validate = useCallback((): boolean => {
    const validationErrors = validateSOAPData(formData);
    
    if (validationErrors.length > 0) {
      const errorMap: FormErrors = {};
      validationErrors.forEach((error) => {
        errorMap[error.field] = error.message;
      });
      setErrors(errorMap);
      return false;
    }

    setErrors({});
    return true;
  }, [formData]);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const soapRecord: SOAPData = {
        ...formData,
        id: initialData?.id || generateId(),
        patientId: formData.patientId || generateId(),
        patientName: formData.patientName || '',
        date: formData.date || new Date().toISOString().split('T')[0],
        subjective: formData.subjective || '',
        objective: formData.objective || '',
        assessment: formData.assessment || '',
        plan: formData.plan || '',
      };

      storageUtils.saveSOAPRecord(soapRecord);
      
      if (onSubmitSuccess) {
        onSubmitSuccess(soapRecord);
      }

      return soapRecord;
    } catch (error) {
      console.error('Error saving SOAP record:', error);
      setErrors({ submit: 'Gagal menyimpan data. Silakan coba lagi.' });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, initialData, validate, onSubmitSuccess]);

  const reset = useCallback(() => {
    setFormData({
      patientName: '',
      patientId: '',
      date: new Date().toISOString().split('T')[0],
      subjective: '',
      objective: '',
      assessment: '',
      plan: '',
    });
    setErrors({});
  }, []);

  const isFormValid = useMemo(() => {
    return Object.keys(errors).length === 0 && 
           formData.patientName && 
           formData.subjective && 
           formData.objective && 
           formData.assessment && 
           formData.plan;
  }, [errors, formData]);

  return {
    formData,
    errors,
    isSubmitting,
    isFormValid,
    updateField,
    handleSubmit,
    validate,
    reset,
  };
};


