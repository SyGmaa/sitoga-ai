# Panduan Konfigurasi AI Provider (Google / OpenRouter)

Proyek ini mendukung **dua AI provider** yang bisa diganti-ganti hanya melalui file `.env`, tanpa perlu mengubah kode sama sekali.

---

## Cara Ganti Provider

Buka file `.env` dan ubah `AI_PROVIDER` serta `AI_MODEL`:

### Menggunakan Google AI Studio (langsung):

```env
AI_PROVIDER=google
AI_MODEL=gemini-2.5-flash
```

### Menggunakan OpenRouter:

```env
AI_PROVIDER=openrouter
AI_MODEL=mistralai/mistral-small-3.1-24b-instruct:free
```

> **Catatan:** Restart dev server (`npm run dev`) setiap kali mengubah `.env`.

---

## Setup Awal (Satu Kali)

### 1. Instalasi Library

```bash
npm install @openrouter/ai-sdk-provider @ai-sdk/google
```

### 2. Konfigurasi `.env`

Pastikan kedua API key tersedia di `.env`:

```env
DATABASE_URL="postgresql://..."

# Pilih provider: "google" atau "openrouter"
AI_PROVIDER=openrouter
AI_MODEL=mistralai/mistral-small-3.1-24b-instruct:free

# API Keys
GOOGLE_GENERATIVE_AI_API_KEY=AIzaSyXXXXXX
OPENROUTER_API_KEY=sk-or-v1-XXXXXXX
```

**Catatan Penting untuk API Key:**

- Hapus tanda kutip `"` di awal dan akhir key jika ada.
- Pastikan tidak ada spasi ekstra di akhir key.

---

## Model yang Tersedia

### Google AI Studio:

- `gemini-2.5-flash` (Default, cepat)
- `gemini-2.0-flash` (Stabil)

### OpenRouter (diverifikasi kompatibel dengan `streamObject`):

- `mistralai/mistral-small-3.1-24b-instruct:free` (Cepat dan gratis)
- `arcee-ai/trinity-large-preview:free` (Model besar, powerful, gratis)
- `cognitivecomputations/dolphin-mistral-24b-venice-edition:free` (Gratis, uncensored)
- `deepseek/deepseek-v3.2` (Berbayar, sangat powerful)

> **⚠️ Perhatian:** Jangan gunakan model **image generation** (seperti `sourceful/riverflow-v2-fast`) karena tidak kompatibel dengan `streamObject` yang membutuhkan output teks/JSON.

---

## Troubleshooting

| Error                   | Penyebab                    | Solusi                                      |
| ----------------------- | --------------------------- | ------------------------------------------- |
| 401 (User Not Found)    | API Key salah format        | Cek spasi, tanda kutip, atau typo di `.env` |
| 404 (Not Found)         | Nama model salah            | Cek penulisan model di website OpenRouter   |
| 524 (Timeout)           | Model overload              | Ganti ke model lain dari daftar             |
| "requires more credits" | Model berbayar, saldo habis | Ganti ke model `:free` atau isi saldo       |
