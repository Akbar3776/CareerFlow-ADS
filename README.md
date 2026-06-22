# CareerFlow (ADS Kel14 P1)

Website application untuk **pendaftaran & tracking lowongan magang**.

- **Frontend**: React (Vite)
- **Backend**: Flask
- **Database**: PostgreSQL
- **Auth**: JWT (berdasarkan role)

## Fitur Utama

### Mahasiswa
- Registrasi akun (signup) + OTP
- Login + JWT
- Lihat daftar lowongan (`GET /lowongan`)
- Detail lowongan (`GET /lowongan/<id>`)
- Melamar lowongan (`POST /lamaran`)
- Tracking dashboard lamaran (`GET /mahasiswa/dashboard`)
- Update status lamaran (`PUT /lamaran/<id>/status`)
- Hapus lamaran (`DELETE /lamaran/<id>`)
- Profile (`GET/PUT /profile`)

### Admin
- Kelola lowongan magang (CRUD):
  - Tambah (`POST /admin/lowongan`)
  - Update (`PUT /admin/lowongan/<id>`)
  - Hapus (`DELETE /admin/lowongan/<id>`)

## Struktur Folder

- `fe_careerflow/` → aplikasi React (Vite)
- `magang_platform/` → aplikasi Flask API
- `docker-compose.yml` → orchestrasi Docker untuk PostgreSQL + backend + frontend

## Prasyarat

- **Docker** dan **Docker Compose** (untuk mode container)
- (Opsional untuk mode lokal)
  - **Node.js** (untuk frontend)
  - **Python 3.10+** + `pip` (untuk backend)
  - PostgreSQL (jika tidak pakai Docker)

## Konfigurasi Environment Variables

### A) Backend (Flask)
Backend membaca environment berikut:
- `DATABASE_URL` → koneksi ke PostgreSQL
- `JWT_SECRET_KEY` → secret untuk JWT
- `FRONTEND_URL` → allowed origin untuk CORS (default `http://localhost:3001`)

### B) Docker Compose (.env di root project)
`docker-compose.yml` menggunakan variabel:
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `DATABASE_URL`
- `JWT_SECRET_KEY`

**Buat file** `.env` di root project (contoh):

```env
# PostgreSQL
DB_USER=careerflow
DB_PASSWORD=careerflow123
DB_NAME=careerflow_db

# Gunakan koneksi dari dalam container backend
# (host bernama "db" sesuai docker-compose)
DATABASE_URL=postgresql://careerflow:careerflow123@db:5432/careerflow_db

# JWT secret
JWT_SECRET_KEY=change_this_secret

# Opsional
# FRONTEND_URL=http://localhost:3001
```

### C) Frontend (Vite)
Frontend menggunakan:
- `VITE_API_URL` di `fe_careerflow/src/api.js`

**Buat file** `.env` di `fe_careerflow/` (contoh):

```env
VITE_API_URL=http://localhost:5001
```

> Catatan: saat memakai Docker Compose, frontend berjalan sebagai static build (Nginx), tetapi base URL tetap diset ke `http://localhost:5001` dari sisi host.

## Cara Instalasi & Run Development (Non-Docker)

### 1) Jalankan Backend (Flask)

```bash
cd magang_platform
pip install -r requirements.txt
python app.py
```

Backend berjalan di:
- `http://localhost:5001`

### 2) Jalankan Frontend (React/Vite)

```bash
cd fe_careerflow
npm install
npm run dev
```

Frontend berjalan di alamat yang ditampilkan Vite (biasanya `http://localhost:5173` saat dev lokal).

> Pastikan `VITE_API_URL` mengarah ke backend (`http://localhost:5001`).

## Cara Run Development / Deployment dengan Docker Compose

1) Pastikan sudah membuat file `.env` di root project.
2) Jalankan:

```bash
docker compose up --build
```

Layanan yang aktif:
- **PostgreSQL**: berjalan di container `db`
  - diekspos ke host: `5433:5432`
- **Backend** (Flask + Gunicorn): `careerflow-backend`
  - diekspos ke host: `http://localhost:5001`
- **Frontend** (React build + Nginx): `careerflow-frontend`
  - diekspos ke host: `http://localhost:3001`

## Dockerfile Singkat

- `magang_platform/Dockerfile`
  - image Python 3.10 slim
  - install dependencies dari `requirements.txt`
  - jalankan Flask dengan Gunicorn `app:app` pada port `5001`

- `fe_careerflow/Dockerfile`
  - multi-stage build: Node (build Vite) → Nginx (serve build `/dist`)

## Tips Penggunaan

- Cek CORS: backend mengizinkan origin dari `FRONTEND_URL` (default `http://localhost:3001`).
- Pastikan DB dan JWT secret sudah benar sebelum run Docker Compose.

---

## Reference Endpoint
- Auth:
  - `POST /signup`
  - `POST /login`
  - `POST /signup/send-otp`
  - `POST /signup/verify-otp`
  - `POST /forgot-password/send-otp`
  - `POST /forgot-password/verify-otp`
  - `POST /forgot-password/reset`
  - `GET/PUT /profile`
- Lowongan:
  - `GET /lowongan`
  - `GET /lowongan/<id>`
- Lamaran:
  - `POST /lamaran`
  - `GET /mahasiswa/dashboard`
  - `PUT /lamaran/<id>/status`
  - `DELETE /lamaran/<id>`
- Admin:
  - `POST /admin/lowongan`
  - `PUT /admin/lowongan/<id>`
  - `DELETE /admin/lowongan/<id>`

 ---
 
## Tim Pengembang

| Nama                       | NIM           | Peran                                          |
| -------------------------- | ------------- | ---------------------------------------------- |
| _Muhammad Fauzan Akbar_    | _G6401231045_ | Integrator, Database, Deployment, Backend      |
| _Hanifah Syahidah_         | _G6401231067_ | Frontend, UI & UX Designer                     |
| _M Ibnu Fadhil_            | _G6401231073_ | Backend, Project Manager                       |


