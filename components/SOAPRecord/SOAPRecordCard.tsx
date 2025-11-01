import React, { memo } from 'react';
import { SOAPData } from '@/types/soap';

interface SOAPRecordCardProps {
  record: SOAPData;
  onEdit?: (record: SOAPData) => void;
  onDelete?: (id: string) => void;
}

const SOAPRecordCard: React.FC<SOAPRecordCardProps> = ({
  record,
  onEdit,
  onDelete,
}) => {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">
            {record.patientName}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {formatDate(record.date)}
          </p>
        </div>
        <div className="flex space-x-2">
          {onEdit && (
            <button
              onClick={() => onEdit(record)}
              className="p-2 text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
              title="Edit"
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
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => record.id && onDelete(record.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
              title="Hapus"
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
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-gray-700 mb-2">Subjective</h4>
          <p className="text-gray-600 text-sm line-clamp-2">{record.subjective}</p>
        </div>
        <div>
          <h4 className="font-semibold text-gray-700 mb-2">Objective</h4>
          <p className="text-gray-600 text-sm line-clamp-2">{record.objective}</p>
        </div>
        <div>
          <h4 className="font-semibold text-gray-700 mb-2">Assessment</h4>
          <p className="text-gray-600 text-sm line-clamp-2">{record.assessment}</p>
        </div>
        <div>
          <h4 className="font-semibold text-gray-700 mb-2">Plan</h4>
          <p className="text-gray-600 text-sm line-clamp-2">{record.plan}</p>
        </div>
      </div>

      {record.updatedAt && (
        <p className="text-xs text-gray-400 mt-4">
          Diperbarui: {formatDate(record.updatedAt)}
        </p>
      )}
    </div>
  );
};

export default memo(SOAPRecordCard);


