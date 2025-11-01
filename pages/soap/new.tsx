import React, { useState } from 'react';
import { useRouter } from 'next/router';
import SOAPForm from '@/components/SOAPForm/SOAPForm';
import { SOAPData } from '@/types/soap';

export default function NewSOAP() {
  const router = useRouter();
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmitSuccess = (data: SOAPData) => {
    setShowSuccess(true);
    setTimeout(() => {
      router.push('/history');
    }, 2000);
  };

  const handleCancel = () => {
    router.push('/');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Catat SOAP Baru
        </h1>
        <p className="text-gray-600">
          Isi formulir di bawah ini untuk membuat catatan SOAP baru. Gunakan
          tombol "Dapatkan Saran AI" untuk mendapatkan bantuan dari Gemini AI.
        </p>
      </div>

      {showSuccess && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          <p className="font-medium">✓ Catatan SOAP berhasil disimpan!</p>
          <p className="text-sm">Mengalihkan ke halaman riwayat...</p>
        </div>
      )}

      <SOAPForm onSubmitSuccess={handleSubmitSuccess} onCancel={handleCancel} />
    </div>
  );
}


