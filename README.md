# Sistem Dokumentasi SOAP

Sistem dokumentasi medis berbasis Next.js yang membantu dalam pencatatan dan pengelolaan data SOAP (Subjective, Objective, Assessment, Plan) dengan integrasi Gemini AI untuk memberikan saran yang relevan.

## 🚀 Fitur Utama

- ✅ **Formulir SOAP Lengkap**: Input untuk Subjective, Objective, Assessment, dan Plan
- 🤖 **Integrasi Gemini AI**: Dapatkan saran AI untuk setiap bagian SOAP
- 👥 **Manajemen Pasien**: Kelola data pasien dengan mudah
- 📋 **Riwayat Catatan**: Lihat dan kelola semua catatan SOAP
- 🔍 **Pencarian**: Cari catatan berdasarkan nama pasien atau isi catatan
- ✏️ **Edit & Hapus**: Edit atau hapus catatan yang sudah dibuat
- 📱 **Responsive Design**: Tampilan yang optimal di desktop dan mobile

## 🛠️ Teknologi yang Digunakan

- **Next.js 14**: Framework React untuk production
- **TypeScript**: Type safety untuk kode yang lebih robust
- **Tailwind CSS**: Utility-first CSS framework
- **Google Gemini AI**: Integrasi AI untuk memberikan saran
- **Local Storage**: Penyimpanan data (dapat diubah ke database untuk production)

## 📦 Instalasi

1. **Clone atau download project ini**

2. **Install dependencies**:
```bash
npm install
# atau
yarn install
# atau
pnpm install
```

3. **Setup environment variables**:
```bash
cp .env.example .env
```

4. **Edit file `.env` dan tambahkan Gemini API Key**:
```
GEMINI_API_KEY=your_gemini_api_key_here
```

   Untuk mendapatkan Gemini API Key:
   - Kunjungi [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Buat API key baru
   - Salin dan paste ke file `.env`

5. **Jalankan development server**:
```bash
npm run dev
# atau
yarn dev
# atau
pnpm dev
```

6. **Buka browser di** [http://localhost:3000](http://localhost:3000)

## 📁 Struktur Project

```
SOAP-project/
├── components/          # Komponen React reusable
│   ├── Layout/         # Layout komponen
│   ├── SOAPForm/       # Form komponen SOAP
│   └── SOAPRecord/     # Komponen untuk menampilkan catatan
├── hooks/              # Custom React hooks
│   ├── useSOAPForm.ts  # Hook untuk form SOAP
│   └── useGeminiSuggestion.ts  # Hook untuk Gemini API
├── lib/                # Utility functions
│   └── utils/          # Helper functions
├── pages/              # Next.js pages
│   ├── api/            # API routes
│   │   └── gemini.ts   # Gemini API endpoint
│   ├── soap/           # Halaman SOAP
│   ├── index.tsx       # Halaman utama
│   ├── history.tsx     # Halaman riwayat
│   └── patients.tsx    # Halaman pasien
├── styles/             # Global styles
├── types/              # TypeScript type definitions
└── public/             # Static files
```

## 🎯 Penggunaan

### Membuat Catatan SOAP Baru

1. Klik "SOAP Baru" di menu navigasi
2. Isi informasi pasien (nama dan tanggal)
3. Isi setiap bagian SOAP (Subjective, Objective, Assessment, Plan)
4. (Opsional) Klik "Dapatkan Saran AI" untuk mendapatkan saran dari Gemini
5. Klik "Simpan SOAP"

### Mengelola Pasien

1. Buka halaman "Pasien"
2. Klik "Tambah Pasien" untuk menambah pasien baru
3. Isi informasi pasien (nama, usia, jenis kelamin, no. rekam medis)
4. Klik "Simpan"

### Melihat Riwayat

1. Buka halaman "Riwayat"
2. Gunakan search bar untuk mencari catatan
3. Klik tombol edit untuk mengubah catatan
4. Klik tombol hapus untuk menghapus catatan

## 🔒 Keamanan & Privasi

⚠️ **Penting**: Project ini menggunakan Local Storage untuk menyimpan data, yang berarti data disimpan di browser pengguna. 

Untuk penggunaan production:
- Gunakan database yang aman (PostgreSQL, MongoDB, dll)
- Implementasikan autentikasi dan autorisasi
- Enkripsi data sensitif
- Sesuaikan dengan regulasi kesehatan yang berlaku (HIPAA, dll)

## 🚀 Deployment

### Vercel (Recommended)

1. Push code ke GitHub
2. Import project di [Vercel](https://vercel.com)
3. Tambahkan environment variable `GEMINI_API_KEY`
4. Deploy!

### Build untuk Production

```bash
npm run build
npm start
```

## 📝 Catatan Pengembangan

- Data disimpan di Local Storage browser (tidak persistent antar device)
- Gemini API key harus diset di environment variables
- Untuk production, pertimbangkan untuk menggunakan database yang lebih robust

## 🤝 Kontribusi

Kontribusi sangat diterima! Silakan buat issue atau pull request.

## 📄 Lisensi

MIT License

## 🙏 Acknowledgments

- Next.js Team
- Google Gemini AI
- Tailwind CSS

---

Dibuat dengan ❤️ menggunakan Next.js dan Gemini AI


