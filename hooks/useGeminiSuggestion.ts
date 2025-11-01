import { useState, useCallback } from 'react';
import { GeminiResponse } from '@/types/soap';

interface UseGeminiSuggestionProps {
  onError?: (error: Error) => void;
}

export const useGeminiSuggestion = ({ onError }: UseGeminiSuggestionProps = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSuggestion = useCallback(async (
    section: 'subjective' | 'objective' | 'assessment' | 'plan',
    context: string
  ): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          section,
          context,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: GeminiResponse | { error: string } = await response.json();
      
      // Check if API returned an error
      if ('error' in data) {
        throw new Error(data.error);
      }
      
      return data.suggestion || null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan saat mengambil saran';
      setError(errorMessage);
      
      if (onError && err instanceof Error) {
        onError(err);
      }
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [onError]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    getSuggestion,
    isLoading,
    error,
    clearError,
  };
};


