<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Prisma-6.19-2D3748?style=for-the-badge&logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4.0-06B6D4?style=for-the-badge&logo=tailwindcss" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/Vercel_AI_SDK-6.0-000?style=for-the-badge&logo=vercel" alt="AI SDK" />
  <img src="https://img.shields.io/badge/PostgreSQL-17-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
</p>

<h1 align="center">🌿 SITOBAT-AI</h1>
<h3 align="center"><em>Sistem Informasi Toga Berbasis Artificial Intelligence</em></h3>

<p align="center">
  Aplikasi web cerdas untuk <strong>mengelola data tanaman obat keluarga (TOGA)</strong> dan melakukan <strong>diagnosa kesehatan berbasis AI</strong> secara real-time dengan teknologi <em>streaming structured output</em> dan <em>retrieval-augmented generation (RAG)</em>.
</p>

---

## 📑 Daftar Isi

- [Fitur Utama](#-fitur-utama)
- [Arsitektur Sistem](#-arsitektur-sistem)
- [Tech Stack](#-tech-stack)
- [Prasyarat](#-prasyarat)
- [Instalasi & Setup](#-instalasi--setup)
- [Panduan Ganti Provider AI](#-panduan-ganti-provider-ai)
- [Struktur Proyek](#-struktur-proyek)
- [Database Schema](#-database-schema)
- [API Reference](#-api-reference)
- [Scripts](#-scripts)
- [Troubleshooting](#-troubleshooting)
- [FAQ](#-faq)
- [Lisensi](#-lisensi)

---

## ✨ Fitur Utama

### 🤖 Diagnosa AI Interaktif

Fitur utama aplikasi — pengguna mendeskripsikan gejala kesehatannya melalui chat interface, lalu AI akan:

1. **Menganalisis gejala** yang disebutkan pengguna
2. **Mencocokkan** dengan database penyakit menggunakan teknik RAG (Retrieval-Augmented Generation)
3. **Merekomendasikan tanaman obat** yang sesuai, lengkap dengan link langsung ke halaman detail tanaman
4. **Streaming real-time** — hasil diagnosis muncul secara bertahap, sehingga pengguna tidak perlu menunggu lama

> AI menggunakan `streamObject()` dari Vercel AI SDK untuk menghasilkan output terstruktur (JSON) sesuai schema Zod, bukan teks bebas biasa.

### 📷 Scan QR Code Tanaman

Setiap tanaman dalam database memiliki QR code unik. Pengguna bisa:

- Memindai QR code menggunakan kamera smartphone
- Otomatis diarahkan ke halaman detail tanaman
- Melihat informasi lengkap seperti khasiat, kandungan senyawa, dan resep pengolahan

### 🌱 Katalog Tanaman Obat

Database lengkap tanaman TOGA dengan informasi:

- Nama lokal & nama latin
- Deskripsi dan khasiat utama
- Kandungan senyawa aktif
- Lokasi tanam di kebun
- Resep pengolahan / cara racik
- Gambar tanaman
- QR code untuk tiap tanaman

### 🏥 Basis Pengetahuan Medis

Sistem knowledge base yang menghubungkan:

- **Penyakit** ↔ **Gejala** (many-to-many)
- **Penyakit** ↔ **Tanaman Obat** (many-to-many)
- Data ini digunakan AI sebagai sumber RAG untuk diagnosa yang akurat

### 🔧 Admin Dashboard

Panel admin lengkap dengan fitur CRUD untuk:

- 📋 Data Tanaman (tambah, edit, hapus, lihat detail)
- 🦠 Data Penyakit
- 💊 Data Gejala
- 🤖 **Kelola Model AI** (tambah model baru, ganti ID model, set default, toggle aktif/nonaktif)
- 📊 Dashboard statistik dan riwayat diagnosa

### 🔄 Dynamic AI Model Management

Bukan lagi hardcoded! Sekarang pengguna bisa memilih model AI langsung dari halaman diagnosa, dan admin bisa mengelolanya dari dashboard:

- ✅ Google AI Studio (Gemini)
- ✅ OpenRouter (Mistral, DeepSeek, dll.)
- ✅ Tambah/hapus model tanpa menyentuh kode

---

## 🏗️ Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
│  Next.js 16 (App Router) + Tailwind CSS + Framer Motion     │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐   │
│  │ Landing  │  │ Diagnosa │  │ Scan QR  │  │  Katalog   │   │
│  │  Page    │  │ AI Chat  │  │  Code    │  │  Tanaman   │   │
│  └──────────┘  └────┬─────┘  └──────────┘  └────────────┘   │
│                     │ useObject() streaming                 │
├─────────────────────┼───────────────────────────────────────┤
│                     ▼           BACKEND                     │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              API Route: /api/chat                   │    │
│  │  ┌─────────┐  ┌────────────┐  ┌──────────────────┐  │    │
│  │  │  RAG    │  │  Provider  │  │   streamObject() │  │    │
│  │  │ Context │──│  Selector  │──│   Zod Schema     │  │    │
│  │  │(Prisma) │  │(Google/OR) │  │   Structured Out │  │    │
│  │  └─────────┘  └────────────┘  └──────────────────┘  │    │
│  └─────────────────────────────────────────────────────┘    │
│                     │                                       │
├─────────────────────┼───────────────────────────────────────┤
│                     ▼          DATABASE                     │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              PostgreSQL + Prisma ORM                │    │
│  │  Tanaman ↔ Penyakit ↔ Gejala ↔ Resep                │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Kategori        | Teknologi                   | Versi | Keterangan                  |
| --------------- | --------------------------- | ----- | --------------------------- |
| **Framework**   | Next.js (App Router)        | 16.1  | Server & Client Components  |
| **Language**    | TypeScript                  | 5.9   | Type-safe development       |
| **Database**    | PostgreSQL                  | 17+   | Relational database         |
| **ORM**         | Prisma                      | 6.19  | Type-safe database queries  |
| **AI SDK**      | Vercel AI SDK               | 6.0   | Streaming structured output |
| **AI Provider** | Google AI / OpenRouter      | -     | Multi-provider, switchable  |
| **Styling**     | Tailwind CSS                | 4.0   | Utility-first CSS           |
| **Animation**   | Framer Motion               | 12.34 | Smooth UI animations        |
| **Icons**       | Lucide React                | -     | Modern icon set             |
| **Form**        | React Hook Form + Zod       | -     | Validation & form handling  |
| **QR Code**     | html5-qrcode + qrcode.react | -     | Scan & generate QR          |

---

## 📋 Prasyarat

Sebelum memulai, pastikan sudah terinstall:

- **Node.js** v18 ke atas — [Download](https://nodejs.org/)
- **PostgreSQL** database yang aktif — [Download](https://www.postgresql.org/download/)
- **npm** (sudah termasuk bersama Node.js)
- **API Key** dari salah satu provider AI:
  - [Google AI Studio](https://aistudio.google.com/app/apikey) — gratis
  - [OpenRouter](https://openrouter.ai/settings/keys) — gratis untuk model tertentu

---

## 🚀 Instalasi & Setup

### 1️⃣ Clone Repository

```bash
git clone https://github.com/username/sitoga-ai.git
cd sitoga-ai
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Konfigurasi Environment

Salin file `.env.example` lalu isi dengan data sebenarnya:

```bash
cp .env.example .env
```

Edit file `.env`:

```env
# ───────────── DATABASE ─────────────
DATABASE_URL="postgresql://username:password@localhost:5432/sitoga_ai_db"

# ───────────── AI CONFIG (FALLBACK) ─────────────
# Note: Utama diatur via Database Admin. Isi ini hanya sebagai cadangan.
# Pilih provider default: "google" atau "openrouter"
AI_PROVIDER=google

# Nama model default yang dipakai (Fallback)
AI_MODEL=gemini-2.5-flash

# ───────────── API KEYS ─────────────
# Dapatkan di: https://aistudio.google.com/app/apikey
GOOGLE_GENERATIVE_AI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXX

# Dapatkan di: https://openrouter.ai/settings/keys
OPENROUTER_API_KEY=sk-or-v1-XXXXXXXXXXXXXXXXXXXXXXXXX
```

> [!IMPORTANT]
>
> - API key **JANGAN** dibungkus tanda kutip `"`
> - Pastikan **tidak ada spasi** di awal/akhir key
> - Isi **kedua** API key jika ingin bisa switch provider kapan saja

### 4️⃣ Setup Database

Buat database PostgreSQL terlebih dahulu, lalu jalankan migrasi dan seeder:

```bash
# Jalankan migrasi schema
npx prisma migrate dev

# Isi data awal (tanaman, penyakit, gejala)
npx prisma db seed
```

> [!TIP]
> Gunakan `npx prisma studio` untuk melihat dan mengedit data di browser secara visual.

### 5️⃣ Jalankan Aplikasi

```bash
npm run dev
```

Buka **[http://localhost:3000](http://localhost:3000)** di browser. 🎉

---

Salah satu fitur unggulan proyek ini — **Manajemen model secara dinamis via Database**. Namun, Anda masih bisa menetapkan nilai default di `.env` sebagai cadangan (_fallback_).

### Cara Kerja (Prioritas)

```
1. Request UI ──→ 2. Ambil Pilihan di Database (Admin) ──→ 3. Jika Kosong, ambil .env (Fallback)
                                     │
                                     ▼
                      getModel() ──→ Vercel AI SDK ──→ Chat AI
```

```
.env (AI_PROVIDER) ──→ getModel() function ──→ Vercel AI SDK ──→ streamObject()
        │                      │
        ├─ "google"    ──→ @ai-sdk/google (Gemini)
        └─ "openrouter" ──→ @openrouter/ai-sdk-provider
```

File `app/api/chat/route.ts` secara otomatis prioritaskan model dari database, lalu membaca `AI_PROVIDER` dan `AI_MODEL` dari `.env` hanya jika data database tidak ditemukan.

---

### 🔵 Opsi 1: Google AI Studio (Gemini)

```env
AI_PROVIDER=google
AI_MODEL=gemini-2.5-flash
```

**Kelebihan:**

- ✅ Gratis dengan kuota harian yang besar
- ✅ Respons cepat dan stabil
- ✅ Tidak perlu credit card

**Cara mendapatkan API key:**

1. Buka [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Login dengan akun Google
3. Klik **"Create API Key"**
4. Copy dan paste ke `GOOGLE_GENERATIVE_AI_API_KEY` di `.env`

---

### 🟢 Opsi 2: OpenRouter

```env
AI_PROVIDER=openrouter
AI_MODEL=mistralai/mistral-small-3.1-24b-instruct:free
```

**Kelebihan:**

- ✅ Banyak pilihan model (Mistral, DeepSeek, dll.)
- ✅ Model gratis tersedia (tag `:free`)
- ✅ Bisa switch model tanpa ganti provider

**Cara mendapatkan API key:**

1. Buka [OpenRouter](https://openrouter.ai/settings/keys)
2. Buat akun atau login
3. Klik **"Create Key"**
4. Copy dan paste ke `OPENROUTER_API_KEY` di `.env`

---

### 📋 Daftar Model yang Didukung

#### Google AI Studio

| Model                    | Keterangan                             | Harga    |
| ------------------------ | -------------------------------------- | -------- |
| `gemini-3-flash-preview` | Canggih, serbaguna                     | Gratis\* |
| `gemini-2.5-flash`       | Cepat, cocok untuk production          | Gratis\* |
| `gemini-2.5-flash-lite`  | Sangat cepat, cocok untuk tugas ringan | Gratis\* |

_\*gratis dengan kuota harian_

#### OpenRouter (diverifikasi kompatibel dengan `streamObject`)

| Model                                                           | Keterangan                         | Harga       |
| --------------------------------------------------------------- | ---------------------------------- | ----------- |
| `mistralai/mistral-small-3.1-24b-instruct:free`                 | Cepat dan ringan                   | 🟢 Gratis   |
| `arcee-ai/trinity-large-preview:free`                           | Model besar, powerful              | 🟢 Gratis   |
| `cognitivecomputations/dolphin-mistral-24b-venice-edition:free` | Uncensored output                  | 🟢 Gratis   |
| `deepseek/deepseek-v3.2`                                        | Sangat powerful, analisis mendalam | 🔴 Berbayar |

> [!WARNING]
> **Jangan** gunakan model **image generation** (seperti `sourceful/riverflow-v2-fast`).
> Proyek ini menggunakan `streamObject()` yang membutuhkan output teks/JSON, bukan gambar.

---

### ⚡ Quick Switch

Setelah mengubah `.env`, **restart dev server** agar perubahan diterapkan:

```bash
# Hentikan server (Ctrl+C), lalu:
npm run dev
```

---

## 📁 Struktur Proyek

```
sitoga-ai/
│
├── 📂 app/                          # Next.js App Router
│   ├── 📂 api/
│   │   └── 📂 chat/
│   │       └── route.ts             # ⭐ API endpoint diagnosa AI (RAG + streaming)
│   ├── 📂 admin/
│   │   ├── layout.tsx               # Layout admin dengan sidebar
│   │   ├── page.tsx                 # Dashboard admin
│   │   ├── 📂 tanaman/              # CRUD tanaman obat
│   │   ├── 📂 penyakit/             # CRUD data penyakit
│   │   └── 📂 gejala/               # CRUD data gejala
│   ├── 📂 diagnosa/
│   │   └── page.tsx                 # ⭐ Halaman chat AI diagnosa
│   ├── 📂 scan/
│   │   └── page.tsx                 # Scanner QR code tanaman
│   ├── 📂 tanaman/
│   │   ├── page.tsx                 # Katalog daftar tanaman
│   │   └── 📂 [id]/
│   │       └── page.tsx             # Detail tanaman + QR code
│   ├── layout.tsx                   # Root layout
│   ├── page.tsx                     # Landing page
│   └── globals.css                  # Global styles + design tokens
│
├── 📂 actions/                      # Server Actions (backend logic)
│   ├── tanaman.ts                   # CRUD operations tanaman
│   ├── penyakit.ts                  # CRUD operations penyakit
│   ├── gejala.ts                    # CRUD operations gejala
│   ├── models.ts                    # ⭐ CRUD operations AI Models
│   └── riwayat.ts                   # Logging riwayat diagnosa
│
├── 📂 components/                   # Komponen UI reusable
│   ├── Navbar.tsx                   # Navigasi utama
│   ├── Footer.tsx                   # Footer
│   ├── MobileBottomNav.tsx          # Bottom navigation (mobile)
│   ├── PlantQRCode.tsx              # Generator QR code tanaman
│   └── QRButton.tsx                 # Tombol QR shortcut
│
├── 📂 prisma/
│   ├── schema.prisma                # ⭐ Skema database lengkap
│   └── seed.ts                      # Seeder data awal
│
├── 📂 public/                       # Asset statis (gambar, dll.)
│
├── .env.example                     # Template environment variables
├── package.json                     # Dependencies & scripts
└── tsconfig.json                    # TypeScript config
```

---

## 🗄️ Database Schema

Diagram relasi antar tabel dalam database:

```
┌──────────────┐       ┌───────────────────┐       ┌──────────────┐
│    Tanaman   │       │  TanamanPenyakit  │       │   Penyakit   │
├──────────────┤       ├───────────────────┤       ├──────────────┤
│ id           │◄──────│ tanamanId         │       │ id           │
│ namaLokal    │       │ penyakitId        │──────►│ nama         │
│ namaLatin    │       └───────────────────┘       │ deskripsi    │
│ deskripsi    │                                   └──────┬───────┘
│ kandungan    │                                          │
│ khasiatUtama │       ┌───────────────────┐              │
│ lokasiTanam  │       │  PenyakitGejala   │              │
│ gambarUrl    │       ├───────────────────┤       ┌──────┴───────┐
└──────┬───────┘       │ penyakitId        │──────►│   Gejala     │
       │               │ gejalaId          │       ├──────────────┤
       │               └───────────────────┘       │ id           │
┌──────┴───────┐                                   │ nama         │
│    Resep     │       ┌───────────────────┐       └──────────────┘
├──────────────┤       │ RiwayatDiagnosa   │
│ id           │       ├───────────────────┤
│ tanamanId    │       │ id                │
│ langkah      │       │ keluhanPengguna   │
└──────────────┘       │ hasilDiagnosa     │
                       │ createdAt         │
                       └───────────────────┘
│
│       ┌───────────────────┐
│       │      AiModel      │
│       ├───────────────────┤
│       │ id                │
│       │ provider          │
│       │ modelId           │
│       │ label             │
│       │ badge             │
│       │ isActive          │
│       │ isDefault         │
│       └───────────────────┘
```

**Relasi utama:**

- `Tanaman` ↔ `Penyakit` — Many-to-Many (via `TanamanPenyakit`)
- `Penyakit` ↔ `Gejala` — Many-to-Many (via `PenyakitGejala`)
- `Tanaman` → `Resep` — One-to-Many (cara pengolahan)
- `RiwayatDiagnosa` — Log semua sesi diagnosa AI

---

## 📡 API Reference

### `POST /api/chat`

Endpoint utama untuk diagnosa AI. Menerima riwayat chat dan mengembalikan streaming structured output. Mendukung pemilihan model secara dinamis via request body.

**Request Body:**

```json
{
  "messages": [
    { "role": "user", "content": "Saya sakit kepala dan mual sejak pagi" }
  ],
  "provider": "google", // Opsional, default dari .env
  "model": "gemini-3-flash-preview" // Opsional, default dari .env
}
```

**Response** (streamed JSON object):

```json
{
  "nama_penyakit": "Masuk Angin",
  "gejala_terdeteksi": ["sakit kepala", "mual"],
  "rekomendasi_tanaman": [
    { "id": "cuid_xxx", "nama": "Jahe Merah" },
    { "id": "cuid_yyy", "nama": "Temulawak" }
  ],
  "penjelasan_singkat": "Berdasarkan gejala sakit kepala dan mual, kemungkinan besar Anda mengalami masuk angin."
}
```

**Bagaimana RAG bekerja:**

1. API mengambil seluruh data penyakit, gejala, dan tanaman dari database via Prisma
2. Data di-format menjadi knowledge base string
3. Knowledge base dimasukkan ke system prompt AI
4. AI mencocokkan gejala pengguna dengan database dan mengembalikan diagnosa terstruktur

---

## 📜 Scripts

| Perintah                 | Keterangan                                         |
| ------------------------ | -------------------------------------------------- |
| `npm run dev`            | 🟢 Jalankan development server di `localhost:3000` |
| `npm run build`          | 📦 Build aplikasi untuk production                 |
| `npm run start`          | 🚀 Jalankan production server                      |
| `npm run lint`           | 🔍 Jalankan ESLint untuk cek kualitas kode         |
| `npx prisma migrate dev` | 🗄️ Jalankan migrasi database                       |
| `npx prisma db seed`     | 🌱 Isi database dengan data awal                   |
| `npx prisma studio`      | 🖥️ Buka GUI database di browser                    |
| `npx prisma generate`    | ⚙️ Re-generate Prisma Client                       |

---

## 🔧 Troubleshooting

<details>
<summary><strong>❌ Error 401 — "User Not Found" / "Invalid API Key"</strong></summary>

**Penyebab:** API key salah format di `.env`

**Solusi:**

1. Pastikan key tidak dibungkus tanda kutip: `OPENROUTER_API_KEY=sk-or-v1-xxx` ✅
2. Pastikan tidak ada spasi di akhir key
3. Pastikan key belum expired — generate key baru jika perlu
</details>

<details>
<summary><strong>❌ Error 404 — "Model Not Found"</strong></summary>

**Penyebab:** Nama model salah di `AI_MODEL`

**Solusi:**

1. Cek penulisan model — harus persis sesuai yang ada di website provider
2. Untuk OpenRouter, cek di [openrouter.ai/models](https://openrouter.ai/models)
3. Pastikan model masih tersedia (beberapa model bisa di-retire)
</details>

<details>
<summary><strong>❌ Error 524 — Timeout</strong></summary>

**Penyebab:** Model overload atau terlalu lambat

**Solusi:**

1. Ganti ke model yang lebih ringan (misal: `mistral-small`)
2. Coba lagi dalam beberapa menit
3. Jika pakai OpenRouter, cek status di [status.openrouter.ai](https://status.openrouter.ai)
</details>

<details>
<summary><strong>❌ "Requires more credits"</strong></summary>

**Penyebab:** Model berbayar dan saldo habis

**Solusi:**

1. Ganti ke model gratis (ada tag `:free` di nama model)
2. Atau isi saldo di dashboard OpenRouter
</details>

<details>
<summary><strong>❌ AI tidak merespons / chat kosong</strong></summary>

**Penyebab:** Bisa bermacam-macam

**Checklist:**

1. Buka DevTools (F12) → tab Console, cek error
2. Pastikan `AI_PROVIDER` dan `AI_MODEL` sudah diisi di `.env`
3. Pastikan API key valid
4. Restart dev server setelah ubah `.env`
5. Cek apakah database sudah di-seed (`npx prisma db seed`)
</details>

<details>
<summary><strong>❌ Database error / Prisma error</strong></summary>

**Solusi:**

```bash
# Reset dan migrasi ulang database
npx prisma migrate reset
npx prisma db seed
```

</details>

---

## ❓ FAQ

<details>
<summary><strong>Apakah bisa menambah provider AI lain selain Google dan OpenRouter?</strong></summary>

Bisa! Vercel AI SDK mendukung banyak provider. Anda perlu:

1. Install SDK provider baru (misal: `@ai-sdk/anthropic`)
2. Tambahkan kondisi baru di fungsi `getModel()` di `app/api/chat/route.ts`
3. Tambahkan API key baru di `.env`
</details>

<details>
<summary><strong>Apakah data diagnosa disimpan?</strong></summary>

Ya, setiap sesi diagnosa disimpan di tabel `RiwayatDiagnosa` secara otomatis, berisi keluhan pengguna dan hasil diagnosa AI dalam format JSON.

</details>

<details>
<summary><strong>Bagaimana cara menambah tanaman baru?</strong></summary>

Ada dua cara:

1. **Lewat Admin Panel** — Buka `/admin/tanaman` → klik "Tambah Tanaman"
2. **Lewat Seeder** — Edit `prisma/seed.ts` lalu jalankan `npx prisma db seed`
</details>

<details>
<summary><strong>Apakah aplikasi ini bisa di-deploy?</strong></summary>

Ya! Aplikasi ini siap deploy ke **Vercel** dengan langkah:

1. Push repository ke GitHub
2. Import project di [vercel.com](https://vercel.com)
3. Set environment variables di Vercel dashboard
4. Deploy! 🚀
</details>

---

## 📄 Lisensi

Proyek ini dikembangkan sebagai **Tugas Akhir / Skripsi** untuk keperluan edukasi dan penelitian tanaman obat keluarga (TOGA).

---

<p align="center">
  Dibuat dengan 💚 menggunakan Next.js, Vercel AI SDK, dan Prisma
</p>
