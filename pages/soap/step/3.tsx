import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useSOAPFlow } from '@/contexts/SOAPFlowContext';

export default function Step3Assessment() {
  const router = useRouter();
  const { flowData, updateFlowData } = useSOAPFlow();
  const [assessment, setAssessment] = useState(flowData.assessment || '');
  const [error, setError] = useState<string | null>(null);

  // Load assessment on mount
  useEffect(() => {
    if (flowData.assessment && !assessment) {
      setAssessment(flowData.assessment);
    }
  }, [flowData.assessment, assessment]);

  const handleApprove = useCallback(() => {
    if (!assessment.trim()) {
      setError('Harap isi assessment terlebih dahulu');
      return;
    }

    if (!flowData.subjective || !flowData.objective) {
      setError('Data tidak lengkap. Silakan kembali ke step sebelumnya.');
      return;
    }

    // Save assessment
    updateFlowData({
      assessment: assessment,
    });

    // Navigate to summary page (step 4)
    router.push('/soap/step/4');
  }, [assessment, flowData, updateFlowData, router]);

  if (!flowData.subjective || !flowData.objective) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md">
          <p className="font-medium">Data tidak lengkap</p>
          <p className="text-sm">Silakan lengkapi Subjective dan Objective terlebih dahulu.</p>
          <div className="mt-3 flex gap-3">
            <button
              onClick={() => router.push('/soap/step/1')}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Kembali ke Step 1
            </button>
            <button
              onClick={() => router.push('/soap/step/2')}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Kembali ke Step 2
            </button>
          </div>
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
              3
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Assessment (A)</h2>
              <p className="text-sm text-gray-500">Diagnosa & Analisis</p>
            </div>
          </div>
          <div className="text-sm text-gray-500">Step 3 dari 4</div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-primary-600 h-2 rounded-full" style={{ width: '75%' }}></div>
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

      {/* Form - Focus on Assessment Only */}
      <div className="bg-white p-8 rounded-lg shadow-md">
        {/* Info Card - Minimal */}
        {assessment && (
          <div className="bg-purple-50 border border-purple-200 rounded-md p-3 mb-4">
            <p className="text-sm text-purple-700">
              ✅ Assessment telah di-generate. Silakan review dan edit sesuai kebutuhan.
            </p>
          </div>
        )}

        {/* Assessment Field - Main Focus */}
        <div>
          <label className="block text-2xl font-bold text-gray-800 mb-3">
            Assessment (A)
          </label>
          <p className="text-sm text-gray-600 mb-4">
            Review dan edit assessment. Pastikan diagnosis, differential diagnosis, clinical reasoning, dan problem list sudah sesuai.
          </p>
          <textarea
            value={assessment}
            onChange={(e) => setAssessment(e.target.value)}
            rows={20}
            className="w-full px-6 py-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-y text-base"
            placeholder={assessment ? "Review dan edit assessment di atas..." : "Assessment akan di-generate dari Subjective & Objective. Tunggu sebentar..."}
            autoFocus
          />
          <p className="text-sm text-gray-500 mt-3 text-right">
            {assessment.length} karakter
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between gap-4 pt-6 mt-6 border-t">
          <button
            type="button"
            onClick={() => router.push('/soap/step/2')}
            className="px-5 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            ← Kembali
          </button>
          <button
            type="button"
            onClick={handleApprove}
            disabled={!assessment.trim()}
            className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-md hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 font-semibold shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Approve & Lanjut ke Summary →
          </button>
        </div>
      </div>
    </div>
  );
}

