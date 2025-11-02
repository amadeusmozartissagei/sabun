import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useSOAPFlow } from '@/contexts/SOAPFlowContext';

export default function Step2Objective() {
  const router = useRouter();
  const { flowData, updateFlowData } = useSOAPFlow();
  const [objective, setObjective] = useState(flowData.objective || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load generated form on mount
  useEffect(() => {
    if (flowData.objective && !objective) {
      setObjective(flowData.objective);
    }
  }, [flowData.objective, objective]);

  const handleGenerateAssessment = useCallback(async () => {
    if (!objective.trim()) {
      setError('Harap isi temuan objektif terlebih dahulu');
      return;
    }

    if (!flowData.subjective) {
      setError('Data Subjective tidak ditemukan. Silakan kembali ke step 1.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Save current data
      updateFlowData({
        objective: objective,
      });

      // Generate Assessment
      const response = await fetch('/api/generate-assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subjective: flowData.subjective,
          objective: objective,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal generate Assessment');
      }

      const { assessment } = await response.json();

      // Save generated assessment
      updateFlowData({
        assessment: assessment,
      });

      // Navigate to step 3
      router.push('/soap/step/3');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan';
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  }, [objective, flowData.subjective, updateFlowData, router]);

  if (!flowData.subjective) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md">
          <p className="font-medium">Data tidak lengkap</p>
          <p className="text-sm">Silakan kembali ke step 1 untuk mengisi Subjective terlebih dahulu.</p>
          <button
            onClick={() => router.push('/soap/step/1')}
            className="mt-3 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Kembali ke Step 1
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold">
              2
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Objective (O)</h2>
              <p className="text-sm text-gray-500">Temuan Objektif</p>
            </div>
          </div>
          <div className="text-sm text-gray-500">Step 2 dari 4</div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-primary-600 h-2 rounded-full" style={{ width: '50%' }}></div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex justify-between items-center">
          <div>
            <p className="font-medium">⚠️ {error}</p>
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700 font-bold text-xl"
          >
            ×
          </button>
        </div>
      )}

      {/* Form - Focus on Objective Only */}
      <div className="bg-white p-8 rounded-lg shadow-md">
        {/* Info Card - Minimal */}
        {objective && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
            <p className="text-sm text-blue-700">
              💡 Form Objective telah di-generate. Silakan lengkapi sesuai temuan pemeriksaan.
            </p>
          </div>
        )}

        {/* Objective Field - Main Focus */}
        <div>
          <label className="block text-2xl font-bold text-gray-800 mb-3">
            Objective (O)
          </label>
          <p className="text-sm text-gray-600 mb-4">
            Isi temuan objektif: Vital Signs, General Appearance, Physical Examination, dan Laboratory/Investigations.
          </p>
          <textarea
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            rows={20}
            className="w-full px-6 py-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-y text-base"
            placeholder={objective ? "Lengkapi form Objective di atas sesuai temuan pemeriksaan fisik dan hasil laboratorium..." : "Form Objective akan di-generate dari Subjective. Tunggu sebentar..."}
            autoFocus
          />
          <p className="text-sm text-gray-500 mt-3 text-right">
            {objective.length} karakter
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between gap-4 pt-6 mt-6 border-t">
          <button
            type="button"
            onClick={() => router.push('/soap/step/1')}
            className="px-5 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            ← Kembali
          </button>
          <button
            type="button"
            onClick={handleGenerateAssessment}
            disabled={isGenerating || !objective.trim()}
            className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-md hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 font-semibold shadow-lg"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Mengenerate Assessment...
              </>
            ) : (
              <>
                Lanjut ke Assessment →
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

