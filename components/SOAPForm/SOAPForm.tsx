import React, { memo, useCallback } from 'react';
import { useSOAPForm } from '@/hooks/useSOAPForm';
import { SOAPData } from '@/types/soap';
import SOAPField from './SOAPField';
import { useGeminiSuggestion } from '@/hooks/useGeminiSuggestion';

interface SOAPFormProps {
  initialData?: SOAPData;
  onSubmitSuccess?: (data: SOAPData) => void;
  onCancel?: () => void;
}

const SOAPForm: React.FC<SOAPFormProps> = ({
  initialData,
  onSubmitSuccess,
  onCancel,
}) => {
  const {
    formData,
    errors,
    isSubmitting,
    updateField,
    handleSubmit,
  } = useSOAPForm({
    initialData,
    onSubmitSuccess,
  });

  const { getSuggestion, isLoading: isGeminiLoading, error: geminiError, clearError } = useGeminiSuggestion({
    onError: (error) => {
      console.error('Gemini API error:', error);
    },
  });

  const buildContextForAI = useCallback((section: 'subjective' | 'objective' | 'assessment' | 'plan'): string => {
    const currentValue = formData[section] || '';
    
    // Untuk Assessment dan Plan, kirim konteks lengkap dari section sebelumnya
    if (section === 'assessment') {
      const subjective = formData.subjective || '';
      const objective = formData.objective || '';
      
      return `SUBJECTIVE (S):
${subjective || '(Belum diisi)'}

OBJECTIVE (O):
${objective || '(Belum diisi)'}

ASSESSMENT SAAT INI (A):
${currentValue || '(Belum diisi)'}

--- Analisis dan berikan rekomendasi diagnosa berdasarkan data di atas.`;
    }
    
    if (section === 'plan') {
      const subjective = formData.subjective || '';
      const objective = formData.objective || '';
      const assessment = formData.assessment || '';
      
      return `SUBJECTIVE (S):
${subjective || '(Belum diisi)'}

OBJECTIVE (O):
${objective || '(Belum diisi)'}

ASSESSMENT (A):
${assessment || '(Belum diisi)'}

PLAN SAAT INI (P):
${currentValue || '(Belum diisi)'}

--- Berikan rekomendasi rencana perawatan berdasarkan assessment di atas.`;
    }
    
    // Untuk Subjective dan Objective, kirim nilai saat ini saja
    return currentValue;
  }, [formData]);
  
  const handleGeminiSuggest = useCallback(async (
    section: 'subjective' | 'objective' | 'assessment' | 'plan'
  ) => {
    clearError(); // Clear previous errors before new request
    const context = buildContextForAI(section);
    const suggestion = await getSuggestion(section, context);
    
    if (suggestion) {
      updateField(section, suggestion);
    }
  }, [buildContextForAI, getSuggestion, updateField, clearError]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Gemini AI Error Alert */}
      {geminiError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex justify-between items-center">
          <div>
            <p className="font-medium">⚠️ Gagal mengambil saran dari AI</p>
            <p className="text-sm">{geminiError}</p>
          </div>
          <button
            type="button"
            onClick={clearError}
            className="text-red-500 hover:text-red-700 font-bold text-xl"
            title="Tutup pesan error"
          >
            ×
          </button>
        </div>
      )}

      {/* Patient Info */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Informasi Pasien
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="patientName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Nama Pasien <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="patientName"
              value={formData.patientName || ''}
              onChange={(e) => updateField('patientName', e.target.value)}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.patientName
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-primary-500'
              }`}
              placeholder="Masukkan nama pasien"
            />
            {errors.patientName && (
              <p className="mt-1 text-sm text-red-500">{errors.patientName}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="date"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Tanggal <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="date"
              value={formData.date || ''}
              onChange={(e) => updateField('date', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* SOAP Fields */}
      <SOAPField
        label="Subjective"
        value={formData.subjective || ''}
        onChange={(value) => updateField('subjective', value)}
        error={errors.subjective}
        onGeminiSuggest={() => handleGeminiSuggest('subjective')}
        isGeminiLoading={isGeminiLoading}
        placeholder="Masukkan keluhan subjektif pasien (gejala yang dirasakan pasien)"
      />

      <SOAPField
        label="Objective"
        value={formData.objective || ''}
        onChange={(value) => updateField('objective', value)}
        error={errors.objective}
        onGeminiSuggest={() => handleGeminiSuggest('objective')}
        isGeminiLoading={isGeminiLoading}
        placeholder="Masukkan temuan objektif (hasil pemeriksaan fisik, tanda vital, dll)"
      />

      <SOAPField
        label="Assessment"
        value={formData.assessment || ''}
        onChange={(value) => updateField('assessment', value)}
        error={errors.assessment}
        onGeminiSuggest={() => handleGeminiSuggest('assessment')}
        isGeminiLoading={isGeminiLoading}
        placeholder="Masukkan assessment (diagnosa atau analisis kondisi pasien)"
      />

      <SOAPField
        label="Plan"
        value={formData.plan || ''}
        onChange={(value) => updateField('plan', value)}
        error={errors.plan}
        onGeminiSuggest={() => handleGeminiSuggest('plan')}
        isGeminiLoading={isGeminiLoading}
        placeholder="Masukkan rencana tindakan (pengobatan, follow-up, dll)"
      />

      {/* Error message */}
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {errors.submit}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={isSubmitting}
          >
            Batal
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting || isGeminiLoading}
          className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Menyimpan...' : 'Simpan SOAP'}
        </button>
      </div>
    </form>
  );
};

export default memo(SOAPForm);


