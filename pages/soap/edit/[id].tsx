import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import SOAPForm from '@/components/SOAPForm/SOAPForm';
import { SOAPData } from '@/types/soap';
import { storageUtils } from '@/lib/utils/storage';

export default function EditSOAP() {
  const router = useRouter();
  const { id } = router.query;
  const [record, setRecord] = useState<SOAPData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (id && typeof id === 'string') {
      const foundRecord = storageUtils.getSOAPRecord(id);
      if (foundRecord) {
        setRecord(foundRecord);
      } else {
        router.push('/history');
      }
      setLoading(false);
    }
  }, [id, router]);

  const handleSubmitSuccess = (data: SOAPData) => {
    setShowSuccess(true);
    setTimeout(() => {
      router.push('/history');
    }, 2000);
  };

  const handleCancel = () => {
    router.push('/history');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (!record) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          Edit Catatan SOAP
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Edit catatan SOAP untuk pasien: <strong className="dark:text-white">{record.patientName}</strong>
        </p>
      </div>

      {showSuccess && (
        <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded">
          <p className="font-medium">✓ Catatan SOAP berhasil diperbarui!</p>
          <p className="text-sm">Mengalihkan ke halaman riwayat...</p>
        </div>
      )}

      <SOAPForm
        initialData={record}
        onSubmitSuccess={handleSubmitSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
}


