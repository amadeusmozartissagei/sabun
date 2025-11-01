import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { storageUtils } from '@/lib/utils/storage';
import { SOAPData } from '@/types/soap';
import SOAPRecordCard from '@/components/SOAPRecord/SOAPRecordCard';

export default function History() {
  const router = useRouter();
  const [records, setRecords] = useState<SOAPData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRecords, setFilteredRecords] = useState<SOAPData[]>([]);

  useEffect(() => {
    const allRecords = storageUtils.getSOAPRecords();
    const sortedRecords = [...allRecords].sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.date).getTime();
      const dateB = new Date(b.updatedAt || b.date).getTime();
      return dateB - dateA;
    });
    setRecords(sortedRecords);
    setFilteredRecords(sortedRecords);
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredRecords(records);
    } else {
      const filtered = records.filter(
        (record) =>
          record.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.subjective.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.objective.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.assessment.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.plan.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRecords(filtered);
    }
  }, [searchTerm, records]);

  const handleEdit = (record: SOAPData) => {
    if (record.id) {
      router.push(`/soap/edit/${record.id}`);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus catatan ini?')) {
      storageUtils.deleteSOAPRecord(id);
      const updatedRecords = storageUtils.getSOAPRecords();
      const sortedRecords = [...updatedRecords].sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.date).getTime();
        const dateB = new Date(b.updatedAt || b.date).getTime();
        return dateB - dateA;
      });
      setRecords(sortedRecords);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Riwayat SOAP</h1>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <input
          type="text"
          placeholder="Cari berdasarkan nama pasien atau isi catatan..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Records List */}
      {filteredRecords.length > 0 ? (
        <>
          <p className="text-gray-600">
            Menampilkan {filteredRecords.length} dari {records.length} catatan
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecords.map((record) => (
              <SOAPRecordCard
                key={record.id}
                record={record}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-500 text-lg mb-4">
            {searchTerm
              ? 'Tidak ada catatan yang sesuai dengan pencarian'
              : 'Belum ada catatan SOAP'}
          </p>
          {!searchTerm && (
            <a
              href="/soap/new"
              className="inline-block text-primary-600 hover:text-primary-700 font-medium"
            >
              Buat catatan pertama →
            </a>
          )}
        </div>
      )}
    </div>
  );
}


