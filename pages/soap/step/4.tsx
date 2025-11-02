import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useSOAPFlow } from '@/contexts/SOAPFlowContext';

export default function Step4SummaryPlan() {
  const router = useRouter();
  const { flowData, updateFlowData, saveToStorage } = useSOAPFlow();
  const [plan, setPlan] = useState(flowData.plan || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate Plan on mount if not exists
  useEffect(() => {
    const generatePlan = async () => {
      if (!plan && flowData.subjective && flowData.objective && flowData.assessment) {
        setIsGenerating(true);
        try {
          const response = await fetch('/api/generate-plan', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              subjective: flowData.subjective,
              objective: flowData.objective,
              assessment: flowData.assessment,
            }),
          });

          if (response.ok) {
            const { plan: generatedPlan } = await response.json();
            setPlan(generatedPlan);
            updateFlowData({ plan: generatedPlan });
          }
        } catch (err) {
          console.error('Error generating plan:', err);
        } finally {
          setIsGenerating(false);
        }
      }
    };

    generatePlan();
  }, [plan, flowData, updateFlowData]);

  const handleSave = useCallback(async () => {
    if (!flowData.subjective || !flowData.objective || !flowData.assessment || !plan) {
      setError('Data tidak lengkap');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      // Update final data
      updateFlowData({
        plan: plan,
      });

      // Save to storage
      const savedRecord = await saveToStorage();

      // Navigate to history
      router.push('/history');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan saat menyimpan';
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  }, [flowData, plan, updateFlowData, saveToStorage, router]);

  if (!flowData.subjective || !flowData.objective || !flowData.assessment) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md">
          <p className="font-medium">Data tidak lengkap</p>
          <p className="text-sm">Silakan lengkapi semua step terlebih dahulu.</p>
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
            <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">
              ✓
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Summary & Plan</h2>
              <p className="text-sm text-gray-500">Ringkasan & Rencana Perawatan</p>
            </div>
          </div>
          <div className="text-sm text-gray-500">Step 4 dari 4</div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-green-600 h-2 rounded-full" style={{ width: '100%' }}></div>
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

      {/* Summary Cards */}
      <div className="space-y-6">
        {/* Patient Info Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Informasi Pasien</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Nama Pasien</p>
              <p className="font-semibold text-gray-800">{flowData.patientName || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Tanggal</p>
              <p className="font-semibold text-gray-800">{flowData.date || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">ID Pasien</p>
              <p className="font-semibold text-gray-800">{flowData.patientId || '-'}</p>
            </div>
          </div>
        </div>

        {/* Subjective Summary */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-3 text-gray-800 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">S</span>
            Subjective
          </h3>
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
              {flowData.subjective}
            </pre>
          </div>
        </div>

        {/* Objective Summary */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-3 text-gray-800 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold text-sm">O</span>
            Objective
          </h3>
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
              {flowData.objective}
            </pre>
          </div>
        </div>

        {/* Assessment Summary */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-3 text-gray-800 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm">A</span>
            Assessment
          </h3>
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
              {flowData.assessment}
            </pre>
          </div>
        </div>

        {/* Plan */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-3 text-gray-800 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm">P</span>
            Plan
          </h3>
          {isGenerating ? (
            <div className="bg-gray-50 border border-gray-200 rounded-md p-4 flex items-center gap-3">
              <svg className="animate-spin h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-sm text-gray-600">Mengenerate Plan...</span>
            </div>
          ) : (
            <>
              <div className="bg-purple-50 border border-purple-200 rounded-md p-4 mb-4">
                <p className="text-sm text-purple-700">Plan telah di-generate berdasarkan Subjective, Objective, dan Assessment. Silakan review dan edit jika diperlukan.</p>
              </div>
              <textarea
                value={plan}
                onChange={(e) => {
                  setPlan(e.target.value);
                  updateFlowData({ plan: e.target.value });
                }}
                rows={12}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 resize-y"
                placeholder="Plan akan muncul di sini setelah di-generate..."
              />
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between gap-4 pt-4">
          <button
            type="button"
            onClick={() => router.push('/soap/step/3')}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            ← Kembali
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || isGenerating || !plan.trim()}
            className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-md hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Menyimpan...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Simpan SOAP
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

