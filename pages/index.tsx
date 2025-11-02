import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { storageUtils } from '@/lib/utils/storage';
import { SOAPData } from '@/types/soap';
import SOAPRecordCard from '@/components/SOAPRecord/SOAPRecordCard';

export default function Home() {
  const [recentRecords, setRecentRecords] = useState<SOAPData[]>([]);
  const [stats, setStats] = useState({
    totalRecords: 0,
    totalPatients: 0,
  });

  useEffect(() => {
    const records = storageUtils.getSOAPRecords();
    const patients = storageUtils.getPatients();

    // Sort by date (most recent first)
    const sortedRecords = [...records].sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.date).getTime();
      const dateB = new Date(b.updatedAt || b.date).getTime();
      return dateB - dateA;
    });

    setRecentRecords(sortedRecords.slice(0, 6));
    setStats({
      totalRecords: records.length,
      totalPatients: patients.length,
    });
  }, []);

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus catatan ini?')) {
      storageUtils.deleteSOAPRecord(id);
      // Refresh records
      const records = storageUtils.getSOAPRecords();
      const sortedRecords = [...records].sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.date).getTime();
        const dateB = new Date(b.updatedAt || b.date).getTime();
        return dateB - dateA;
      });
      setRecentRecords(sortedRecords.slice(0, 6));
      setStats((prev) => ({ ...prev, totalRecords: records.length }));
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg shadow-lg p-8 text-white">
        <h1 className="text-4xl font-bold mb-4">
          Selamat Datang di Sistem Dokumentasi SOAP
        </h1>
        <p className="text-lg text-primary-100 mb-6">
          Sistem dokumentasi medis yang membantu Anda dalam mencatat dan
          mengelola data SOAP dengan bantuan AI.
        </p>
        <div className="flex gap-4">
          <Link
            href="/soap/step/1"
            className="inline-block bg-white text-primary-600 px-6 py-3 rounded-md font-semibold hover:bg-primary-50 transition-colors shadow-md"
          >
            🚀 Mulai SOAP Flow Baru (Multi-Step)
          </Link>
          <Link
            href="/soap/new"
            className="inline-block bg-primary-700 text-white px-6 py-3 rounded-md font-semibold hover:bg-primary-600 transition-colors border border-primary-500"
          >
            Buat SOAP Manual
          </Link>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Total Catatan</p>
              <p className="text-3xl font-bold text-gray-800">
                {stats.totalRecords}
              </p>
            </div>
            <div className="text-4xl">📋</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Total Pasien</p>
              <p className="text-3xl font-bold text-gray-800">
                {stats.totalPatients}
              </p>
            </div>
            <div className="text-4xl">👥</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">AI Assisted</p>
              <p className="text-3xl font-bold text-gray-800">✨</p>
            </div>
            <div className="text-4xl">🤖</div>
          </div>
        </div>
      </div>

      {/* Recent Records */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Catatan Terbaru
          </h2>
          <Link
            href="/history"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Lihat Semua →
          </Link>
        </div>

        {recentRecords.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentRecords.map((record) => (
              <SOAPRecordCard
                key={record.id}
                record={record}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg mb-4">
              Belum ada catatan SOAP
            </p>
            <Link
              href="/soap/new"
              className="inline-block text-primary-600 hover:text-primary-700 font-medium"
            >
              Buat catatan pertama →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}


