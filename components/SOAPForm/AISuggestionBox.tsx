import React, { memo } from 'react';

interface AISuggestionBoxProps {
  suggestion: string;
  onUse: () => void;
  onDismiss: () => void;
  sectionLabel: string;
}

const AISuggestionBox: React.FC<AISuggestionBoxProps> = ({
  suggestion,
  onUse,
  onDismiss,
  sectionLabel,
}) => {
  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-lg p-5 shadow-lg animate-fade-in transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 dark:from-purple-600 dark:to-pink-600 p-2 rounded-lg">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">
              Saran AI untuk {sectionLabel}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Dari Gemini AI</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          title="Tutup saran"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Suggestion Content */}
      <div className="bg-white dark:bg-gray-800 rounded-md p-4 mb-4 border border-purple-100 dark:border-purple-900/50 max-h-96 overflow-y-auto transition-colors">
        <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 font-sans">
          {suggestion}
        </pre>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onUse}
          className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-md hover:from-purple-600 hover:to-pink-600 transition-all font-medium flex items-center justify-center gap-2 shadow-md"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          Gunakan Saran Ini
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
        >
          Abaikan
        </button>
      </div>

      {/* Info Badge */}
      <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>Silakan review dan edit saran ini sesuai kebutuhan sebelum digunakan</span>
      </div>
    </div>
  );
};

export default memo(AISuggestionBox);

