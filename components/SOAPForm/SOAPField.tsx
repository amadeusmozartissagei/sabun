import React, { memo } from 'react';
import AISuggestionBox from './AISuggestionBox';

interface SOAPFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  onGeminiSuggest?: () => void;
  isGeminiLoading?: boolean;
  placeholder?: string;
  aiSuggestion?: string;
  onUseAISuggestion?: () => void;
  onDismissAISuggestion?: () => void;
}

const SOAPField: React.FC<SOAPFieldProps> = ({
  label,
  value,
  onChange,
  error,
  onGeminiSuggest,
  isGeminiLoading = false,
  placeholder,
  aiSuggestion,
  onUseAISuggestion,
  onDismissAISuggestion,
}) => {
  const characterCount = value.length;
  const maxLength = 5000;

  return (
    <div className="space-y-4">
      {/* Main Field */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md transition-colors">
        <div className="flex justify-between items-center mb-4">
          <label className="text-lg font-semibold text-gray-800 dark:text-white">
            {label} <span className="text-red-500 dark:text-red-400">*</span>
          </label>
          {onGeminiSuggest && (
            <button
              type="button"
              onClick={onGeminiSuggest}
              disabled={isGeminiLoading}
              className="px-4 py-2 text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-md hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              title="Dapatkan saran dari AI"
            >
              {isGeminiLoading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Memproses AI...
                </>
              ) : (
                <>
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
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  Dapatkan Saran AI
                </>
              )}
            </button>
          )}
        </div>

        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={6}
          maxLength={maxLength}
          className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 resize-y dark:bg-gray-700 dark:text-white ${
            error
              ? 'border-red-500 dark:border-red-500 focus:ring-red-500'
              : 'border-gray-300 dark:border-gray-600 focus:ring-primary-500'
          }`}
          placeholder={placeholder}
        />

        <div className="flex justify-between items-center mt-2">
          {error && (
            <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
          )}
          <p
            className={`text-sm ml-auto ${
              characterCount > maxLength * 0.9
                ? 'text-orange-500 dark:text-orange-400'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {characterCount} / {maxLength} karakter
          </p>
        </div>
      </div>

      {/* AI Suggestion Box - Separate Section */}
      {aiSuggestion && onUseAISuggestion && onDismissAISuggestion && (
        <AISuggestionBox
          suggestion={aiSuggestion}
          onUse={onUseAISuggestion}
          onDismiss={onDismissAISuggestion}
          sectionLabel={label}
        />
      )}
    </div>
  );
};

export default memo(SOAPField);


