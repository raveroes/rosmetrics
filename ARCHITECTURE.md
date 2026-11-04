# ARCHITECTURE.md — RosMetrics (Supabase)

## Gambaran Umum

**RosMetrics** adalah platform analitik kesehatan organisasi untuk UMKM berbasis web. Pemilik UMKM dan pegawainya mengisi formulir penilaian **6 faktor kesehatan organisasi** (OH-Index), lalu aplikasi menampilkan skor, dashboard, dan perbandingan antar UMKM.

Arsitektur: **frontend statis** (HTML/CSS/Vanilla JS) → **Supabase Edge Function** (REST API, TypeScript/Deno) → **Supabase PostgreSQL**.

---

## Struktur Direktori

```
rosmetrics-supabase/
├── frontend/
│   ├── index.html              # Single Page Application
│   ├── data_asli.csv           # Dataset untuk analitik di dashboard
│   ├── css/  (auth.css, main.css)
│   └── js/
│       ├── config.js           # URL Edge Function (API_BASE)
│       ├── api.js              # HTTP client
│       ├── auth.js             # Login, register, logout
│       ├── form.js             # Formulir 6 faktor & validasi sisi klien
│       └── main.js             # Router view + Chart.js dashboard
└── supabase/
    ├── config.toml             # verify_jwt = false untuk function `api`
    ├── migrations/
    │   └── 20260101000000_init_nexaumkm.sql   # skema, seed referensi, view, RLS
    └── functions/api/index.ts  # REST API: router, JWT, validator, query
```

---

## Arsitektur Sistem

```
┌───────────────────────────────────────────────┐
│ Browser — frontend statis (Vercel/Netlify/...)│
│  config.js → api.js → fetch(API_BASE?action=) │
└──────────────────────┬────────────────────────┘
                       │ HTTPS/JSON (Authorization: Bearer <JWT>)
                       ▼
┌───────────────────────────────────────────────┐
│ Supabase Edge Function  `api`                 │
│  router → requireAuth (JWT HS256, JWT_SECRET) │
│        → validator (6 faktor) → query         │
└──────────────────────┬────────────────────────┘
                       │ koneksi Postgres langsung (SUPABASE_DB_URL)
                       ▼
┌───────────────────────────────────────────────┐
│ Supabase PostgreSQL                           │
│  users, submissions, answers, validation_log, │
│  factor_definitions, question_definitions,    │
│  v_submission_summary, v_factor_averages      │
│  RLS aktif, tanpa policy (hanya via function) │
└───────────────────────────────────────────────┘
```

---

## REST API Endpoints

Semua endpoint: `{SUPABASE_URL}/functions/v1/api?action=<nama_action>`

| Method | Action            | Auth | Deskripsi                                        |
|--------|-------------------|:----:|--------------------------------------------------|
| POST   | `register`        | ✗    | Daftar akun baru (owner / employee)              |
| POST   | `login`           | ✗    | Login, mendapatkan JWT                           |
| POST   | `submit`          | ✓    | Kirim formulir penilaian (sekali per user)       |
| GET    | `dashboard`       | ✓    | Statistik agregat + rata-rata faktor             |
| GET    | `umkm_list`       | ✓    | Daftar UMKM + skor komposit (`limit`,`offset`,`q`) |
| GET    | `factor_averages` | ✓    | Rata-rata skor per faktor                        |
| GET    | `me`              | ✓    | Profil user yang sedang login                    |
| GET    | `health`          | ✗    | Cek koneksi database                             |

### Autentikasi
- JWT **HS256** buatan sendiri (bukan Supabase Auth), header `Authorization: Bearer <token>`.
- Masa berlaku **8 jam**. Secret: `JWT_SECRET` (Supabase secret, min. 32 karakter).
- Password disimpan sebagai **bcrypt** (cost 10).

---

## 6 Faktor Kesehatan Organisasi (OH-Index)

Penilaian menggunakan **33 pertanyaan** yang dikelompokkan ke dalam 6 faktor:

| Kode  | Nama Faktor              | Kode Pertanyaan    | Skala Maks |
|-------|--------------------------|--------------------|:----------:|
| `INS` | Institutional (Kelembagaan) | OH-1 s/d OH-6  | 3          |
| `OV`  | Organizational Values    | OH-18 s/d OH-25    | 5          |
| `LDI` | Leadership & Decision    | OH-7 s/d OH-12     | 5          |
| `WEQ` | Workforce Equity         | OH-13 s/d OH-17    | 5          |
| `OPS` | Operational Systems      | OH-26 s/d OH-31    | 5          |
| `ECT` | External & Compliance    | OH-32 s/d OH-35    | 5          |

Skor tiap faktor dinormalisasi ke skala 0–5, kemudian digabungkan menjadi **skor komposit** dan dikategorikan sebagai label kesehatan organisasi (health_category).

---

## Alur Data Utama

### Alur Submit Penilaian (Owner)
```
User isi form  →  form.js validasi client-side
               →  api.js POST /api.php?action=submit (+ JWT)
               →  validator.php validasi server-side
               →  Hitung skor 6 faktor & komposit
               →  INSERT ke tabel submissions & answers
               →  Return skor + health_category ke frontend
               →  main.js tampilkan hasil di dashboard
```

### Alur Submit Penilaian (Pegawai)
```
User isi form  →  (sama seperti owner, namun role = 'employee')
               →  Skor pegawai dirata-rata dengan skor owner UMKM yang sama
               →  Skor komposit UMKM diperbarui
```

---

## Teknologi yang Digunakan

| Layer      | Teknologi                                      |
|------------|------------------------------------------------|
| Frontend   | HTML, Vanilla JS, CSS (hosting statis)         |
| Charting   | Chart.js 4.4.1 (CDN)                           |
| Backend    | Supabase Edge Functions (Deno + TypeScript)    |
| Database   | PostgreSQL 15+ (Supabase)                      |
| Driver DB  | postgres.js (`npm:postgres`)                   |
| Auth       | JWT HS256 (Web Crypto) + bcryptjs              |
| Font       | Plus Jakarta Sans (Google Fonts)               |

---

## Catatan Keamanan

- Tabel memakai **Row Level Security** tanpa policy dan hak `anon`/`authenticated` dicabut: tabel tidak dapat diakses langsung dari browser.
- Query memakai **parameter terikat** (postgres.js tagged template) → aman dari SQL Injection.
- `JWT_SECRET`, `CORS_ORIGIN` disimpan sebagai **Supabase secrets**, bukan di repositori. Lihat `.env.example`.
- Jangan menaruh `service_role` key atau `JWT_SECRET` di `frontend/`.
