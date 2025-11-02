import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useSOAPFlow } from '@/contexts/SOAPFlowContext';

export default function Step1Subjective() {
  const router = useRouter();
  const { flowData, updateFlowData } = useSOAPFlow();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    patientName: flowData.patientName || '',
    date: flowData.date || new Date().toISOString().split('T')[0],
    subjective: flowData.subjective || '',
  });

  const handleGenerateObjectiveForm = useCallback(async () => {
    if (!formData.subjective.trim()) {
      setError('Harap isi keluhan subjektif terlebih dahulu');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Save current data to context
      updateFlowData({
        patientName: formData.patientName,
        date: formData.date,
        subjective: formData.subjective,
      });

      // Generate Objective form
      const response = await fetch('/api/generate-objective-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subjective: formData.subjective,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal generate form Objective');
      }

      const { form } = await response.json();

      // Save generated form to context
      updateFlowData({
        objective: form,
      });

      // Navigate to step 2
      router.push('/soap/step/2');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan';
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  }, [formData, updateFlowData, router]);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary-600 dark:bg-primary-500 text-white flex items-center justify-center font-bold">
              1
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Subjective (S)</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Keluhan Subjektif Pasien</p>
            </div>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Step 1 dari 4</div>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div className="bg-primary-600 dark:bg-primary-500 h-2 rounded-full" style={{ width: '25%' }}></div>
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

      {/* Form - Focus on Subjective Only */}
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md transition-colors">
        {/* Minimal Patient Info - Only if not set */}
        {(!formData.patientName || !formData.date) && (
          <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-md font-semibold mb-4 text-gray-700 dark:text-gray-300">Informasi Pasien</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Nama Pasien
                </label>
                <input
                  type="text"
                  value={formData.patientName}
                  onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white text-sm"
                  placeholder="Nama pasien"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Tanggal
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Subjective Field - Main Focus */}
        <div>
          <label className="block text-2xl font-bold text-gray-800 dark:text-white mb-3">
            Subjective (S)
          </label>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Masukkan keluhan subjektif pasien: Chief Complaint, HPI (History of Present Illness), dan Review of Systems.
          </p>
          <textarea
            value={formData.subjective}
            onChange={(e) => setFormData({ ...formData, subjective: e.target.value })}
            rows={20}
            className="w-full px-6 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white resize-y text-base"
            placeholder="Masukkan keluhan subjektif pasien...

Contoh:
CC: Nyeri kepala sejak 3 hari yang lalu

HPI: Pasien mengeluh nyeri kepala tipe tekan di bagian temporal, onset gradual, memberat dengan aktivitas, tidak ada mual/muntah, reda dengan istirahat.

ROS: Sistem lainnya dalam batas normal"
            autoFocus
          />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 text-right">
            {formData.subjective.length} karakter
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between gap-4 pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="px-5 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleGenerateObjectiveForm}
            disabled={isGenerating || !formData.subjective.trim()}
            className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-md hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 font-semibold shadow-lg"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Mengenerate Form Objective...
              </>
            ) : (
              <>
                Lanjut ke Objective →
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

