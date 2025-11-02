import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useSOAPFlow } from '@/contexts/SOAPFlowContext';

export default function Step2Objective() {
  const router = useRouter();
  const { flowData, updateFlowData } = useSOAPFlow();
  const [objective, setObjective] = useState(flowData.objective || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingChecklist, setIsLoadingChecklist] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checklist, setChecklist] = useState<{
    vitalSigns: string[];
    physicalExam: string[];
    laboratory: string[];
    notes: string;
  } | null>(null);

  // Auto-generate checklist on mount
  useEffect(() => {
    if (!flowData.subjective) {
      router.push('/soap/step/1');
      return;
    }

    // Generate checklist if not already generated
    const generateChecklist = async () => {
      setIsLoadingChecklist(true);
      setError(null);
      
      try {
        const response = await fetch('/api/generate-objective-form', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subjective: flowData.subjective }),
        });
        
        if (!response.ok) {
          throw new Error('Gagal generate checklist');
        }
        
        const data = await response.json();
        
        if (data.checklist) {
          setChecklist(data.checklist);
        }
        
        // If objective is not set yet, use the formatted form
        if (!flowData.objective && data.form) {
          setObjective(data.form);
        }
      } catch (err) {
        console.error('Error generating checklist:', err);
        // Don't show error for checklist, just continue
      } finally {
        setIsLoadingChecklist(false);
      }
    };

    generateChecklist();
  }, [flowData.subjective, router, flowData.objective]);

  // Load existing objective if available
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
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400 px-4 py-3 rounded-md">
          <p className="font-medium">Data tidak lengkap</p>
          <p className="text-sm">Silakan kembali ke step 1 untuk mengisi Subjective terlebih dahulu.</p>
          <button
            onClick={() => router.push('/soap/step/1')}
            className="mt-3 px-4 py-2 bg-primary-600 dark:bg-primary-500 text-white rounded-md hover:bg-primary-700 dark:hover:bg-primary-600"
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
            <div className="w-10 h-10 rounded-full bg-primary-600 dark:bg-primary-500 text-white flex items-center justify-center font-bold">
              2
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Objective (O)</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Temuan Objektif</p>
            </div>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Step 2 dari 4</div>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div className="bg-primary-600 dark:bg-primary-500 h-2 rounded-full" style={{ width: '50%' }}></div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md flex justify-between items-center">
          <div>
            <p className="font-medium">⚠️ {error}</p>
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-bold text-xl"
          >
            ×
          </button>
        </div>
      )}

      {/* Checklist Section - Separate from Input */}
      {isLoadingChecklist ? (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6 transition-colors">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 dark:border-primary-400 mr-3"></div>
            <p className="text-gray-600 dark:text-gray-400">Mengenerate checklist pemeriksaan...</p>
          </div>
        </div>
      ) : checklist ? (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800 p-6 rounded-lg shadow-md mb-6 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-500 dark:bg-green-600 p-2 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                📋 Checklist Pemeriksaan (Puskesmas)
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Saran singkat pemeriksaan yang dapat dilakukan di puskesmas
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Vital Signs */}
            {checklist.vitalSigns.length > 0 && (
              <div className="bg-white dark:bg-gray-700/50 p-4 rounded-md">
                <h4 className="font-semibold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
                  <span className="text-green-600 dark:text-green-400">☑</span>
                  Vital Signs
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {checklist.vitalSigns.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500 dark:text-gray-400">☐</span>
                      <span className="text-gray-700 dark:text-gray-300">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Physical Exam */}
            {checklist.physicalExam.length > 0 && (
              <div className="bg-white dark:bg-gray-700/50 p-4 rounded-md">
                <h4 className="font-semibold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
                  <span className="text-green-600 dark:text-green-400">☑</span>
                  Pemeriksaan Fisik
                </h4>
                <div className="space-y-1">
                  {checklist.physicalExam.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm">
                      <span className="text-gray-500 dark:text-gray-400 mt-1">☐</span>
                      <span className="text-gray-700 dark:text-gray-300">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Laboratory */}
            {checklist.laboratory.length > 0 && (
              <div className="bg-white dark:bg-gray-700/50 p-4 rounded-md">
                <h4 className="font-semibold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
                  <span className="text-green-600 dark:text-green-400">☑</span>
                  Saran Laboratorium (Jika diperlukan)
                </h4>
                <div className="space-y-1">
                  {checklist.laboratory.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm">
                      <span className="text-gray-500 dark:text-gray-400 mt-1">☐</span>
                      <span className="text-gray-700 dark:text-gray-300">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {checklist.notes && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-3 rounded-md">
                <div className="flex items-start gap-2">
                  <span className="text-yellow-600 dark:text-yellow-400 text-lg">📝</span>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{checklist.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Input Objective Section - Separate */}
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md transition-colors">
        <div className="mb-4">
          <label className="block text-2xl font-bold text-gray-800 dark:text-white mb-3">
            Hasil Pemeriksaan Objektif (O)
          </label>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Isi temuan objektif berdasarkan pemeriksaan yang telah dilakukan. Gunakan checklist di atas sebagai panduan.
          </p>
        </div>

        <textarea
          value={objective}
          onChange={(e) => setObjective(e.target.value)}
          rows={15}
          className="w-full px-6 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white resize-y text-base"
          placeholder="Masukkan hasil pemeriksaan objektif... (contoh: TD 120/80 mmHg, Nadi 80x/menit, dll)"
          autoFocus
        />
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 text-right">
          {objective.length} karakter
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between gap-4 pt-6 mt-6">
        <button
          type="button"
          onClick={() => router.push('/soap/step/1')}
          className="px-5 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
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
  );
}

