# Nicholas Ivan — Cosmic Observatory
> **Full Stack Developer & Machine Learning Specialist**  
> Rekayasa sistem web berkinerja tinggi, implementasi kecerdasan buatan terapan (*Applied Artificial Intelligence / Machine Learning*), dan visualisasi interaktif WebGL 3D.

[![Next.js](https://img.shields.io/badge/Next.js-16+-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19+-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-R3F-black?style=flat-square&logo=three.js)](https://threejs.org/)
[![Zustand](https://img.shields.io/badge/State-Zustand-443e38?style=flat-square)](https://github.com/pmndrs/zustand)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python)](https://python.org/)
[![PyTorch](https://img.shields.io/badge/PyTorch-AI%20Research-EE4C2C?style=flat-square&logo=pytorch)](https://pytorch.org/)
[![Lighthouse](https://img.shields.io/badge/Lighthouse-98%2F100-success?style=flat-square&logo=googlechrome)](https://developers.google.com/web/tools/lighthouse)

---

## Deskripsi Sistem

**Cosmic Observatory** merupakan media portofolio interaktif tiga dimensi (3D) yang dikembangkan dengan mengadaptasi pemodelan tata surya. Masing-masing entitas kosmis merepresentasikan klasifikasi rekam jejak serta kompetensi profesional:

```
  [ Matahari ] ➔ Halaman Utama: Observatorium Kosmis
       │
  [ Merkurius ]➔ 01 · Riwayat Pendidikan (S1 Informatika & S2 Magister Informatika UAJY)
  [   Venus   ]➔ 02 · Pengalaman Kerja & Akademik (VAPubs, Polytron, Asisten Dosen)
  [   Bumi    ]➔ 03 · Profil Profesional & Prinsip Rekayasa
  [   Mars    ]➔ 04 · Proyek Unggulan (Full Stack Web, AI & Computer Vision)
  [  Yupiter  ]➔ 05 · Kompetensi Teknis (Frontend, Backend, Database, Machine Learning)
  [  Saturnus ]➔ 06 · Sertifikasi & Prestasi Akademik
  [  Uranus   ]➔ 07 · Fokus Eksplorasi (AI Agent Composition & Web Performance)
  [  Neptunus ]➔ 08 · Kanal Komunikasi & Transmisi Kontak
```

Sistem menyediakan dua mekanisme navigasi:
- **Mode Navigasi Terpandu (*Guided Voyage*):** Transisi kamera sinematik antar-orbit berbasis interpolasi *ease-out cubic* teroptimasi serta penyajian informasi melalui panel *glassmorphism*.
- **Mode Eksplorasi Mandiri (*Free-fly Mode*):** Kendali kamera 360 derajat secara bebas menggunakan masukan *keyboard* dan *pointer* (`WASD` / seret layar) dengan kapabilitas pemilihan objek terarah (*approach to target*).

---

## Profil Profesional

Lulusan **Magister Informatika (S2)** dengan konsentrasi *Machine Learning* (**IPK 3.98 / 4.00**) serta **Sarjana Informatika (S1)** pada bidang Rekayasa Perangkat Lunak (**IPK 3.80 / 4.00, Cum Laude**) dari Universitas Atma Jaya Yogyakarta.

- **Rekayasa Web Skala Penuh (*Full Stack Web Development*):** Berpengalaman dalam perancangan dan implementasi aplikasi berbasis Next.js, React, Node.js, Express, dan Laravel, disertai rekam jejak optimasi performa web terukur (peningkatan skor Google Lighthouse dari 70 menjadi 98 pada proyek VAPubs).
- **Kecerdasan Buatan Terapan (*Applied AI & Data Science*):** Berfokus pada riset serta penerapan *Natural Language Processing* (NLP) untuk deteksi disinformasi (*Fake News Detection* berbasis Transformers) dan *Computer Vision* (pengembangan *pipeline* deteksi karakter plat nomor kendaraan dengan perolehan F1-Score 79%).
- **Pengajaran & Bimbingan Akademik:** Berpengalaman membimbing dan mengevaluasi lebih dari 100 mahasiswa sebagai Asisten Dosen pada mata kuliah *Natural Language Processing*, *Matematika Diskrit*, dan *Statistika*.

---

## Kompetensi Teknis

| Bidang Keahlian | Teknologi & Perangkat Lunak |
| :--- | :--- |
| **Bahasa Pemrograman** | JavaScript (ES6+), Python, PHP, SQL, HTML5, CSS3 / Modern CSS |
| **Pengembangan Frontend** | React.js, Next.js (App Router, SSR, SSG), Three.js, React Three Fiber (`@react-three/fiber`), `@react-three/drei`, Zustand |
| **Pengembangan Backend** | Node.js, Express.js, Laravel, RESTful API Architecture, Manajemen Sesi & Autentikasi |
| **Sistem Basis Data** | PostgreSQL, MySQL, Perancangan Skema Relasional, Optimasi Kueri & Indeks |
| **Machine Learning & AI** | PyTorch, TensorFlow, Hugging Face Transformers, OpenCV, Scikit-learn, NumPy, Pandas |
| **Metodologi & Alat Bantu** | Google Lighthouse (Core Web Vitals), Git, GitHub, Docker, Metodologi Agile/Scrum, Vite, Postman |

---

## Portofolio Proyek Unggulan

### 1. Cosmic Observatory — 3D Interactive Portfolio
- **Teknologi:** React 19, Next.js, Three.js, React Three Fiber, React Three Drei, Zustand, CSS Modules
- **Spesifikasi:** Pergerakan kamera stabil pada 60 FPS tanpa beban render ulang per frame (*zero per-frame state re-renders*), mekanisme pencegahan tabrakan kamera, *fallback* prosedural saat terjadi anomali pemuatan aset 3D, serta antarmuka responsif untuk perangkat bergerak (*mobile*).

### 2. VAPubs Web Modernization & Performance Overhaul
- **Peran:** *Frontend Architect & Performance Engineer*
- **Teknologi:** Next.js, React, *Server-Side Rendering* (SSR), Core Web Vitals Analytics
- **Dampak Teknis:** Restrukturisasi arsitektur situs monolitik ke Next.js modern, percepatan metrik *First Contentful Paint* (FCP), dan peningkatan skor evaluasi **Google Lighthouse dari 70 menjadi 98**.

### 3. Sistem Deteksi Berita Palsu Berbahasa Indonesia (Tesis Magister S2)
- **Peran:** *AI & NLP Researcher*
- **Teknologi:** Python, PyTorch, Transformers, Hugging Face, Scikit-learn, FastAPI
- **Fokus Riset:** Pengembangan model representasi semantik lanjutan berbasis *transfer learning* untuk mengidentifikasi hoaks dan disinformasi teks berbahasa Indonesia dengan akurasi terukur.

### 4. Pipeline Deteksi & Rekognisi Plat Nomor Kendaraan Nasional
- **Peran:** *Lead Computer Vision Researcher*
- **Teknologi:** Python, OpenCV, TensorFlow, NumPy
- **Capaian:** Membangun *pipeline* OCR adaptif terhadap dinamika pencahayaan luar ruang dengan raihan F1-Score 79%, mengantarkan tim pada peringkat ke-59 dari 120 peserta nasional.

### 5. Pamdesku — Sistem Tata Kelola Air Mandiri Pedesaan
- **Peran:** *Frontend Developer & Technical Lead*
- **Teknologi:** React, JavaScript, Responsive CSS, REST API
- **Dampak Sosial:** Digitalisasi proses pencatatan meteran dan transparansi penagihan iuran air bagi warga pedesaan di Gunung Kidul.

---

## Riwayat Pendidikan

- **Magister Informatika (S2)** — Universitas Atma Jaya Yogyakarta *(2025 – 2026)*  
  *Indeks Prestasi Kumulatif (IPK): 3.98 / 4.00*  
  Bidang Keahlian: *Machine Learning & Natural Language Processing*
- **Sarjana Informatika (S1)** — Universitas Atma Jaya Yogyakarta *(2021 – 2025)*  
  *Indeks Prestasi Kumulatif (IPK): 3.80 / 4.00 (Cum Laude)*  
  Bidang Keahlian: Rekayasa Perangkat Lunak (*Application Development*)

---

## Saluran Komunikasi

Untuk komunikasi profesional, eksplorasi peluang kerja sama, maupun pertukaran informasi teknis, silakan merujuk pada kontak berikut:

- **Pos-el (Email):** [nicholas.ivan.christ@gmail.com](mailto:nicholas.ivan.christ@gmail.com)
- **LinkedIn:** [linkedin.com/in/nicholas-ivan-christiaffri-wibowo](https://www.linkedin.com/in/nicholas-ivan-christiaffri-wibowo)
- **GitHub:** [github.com/KeisezrG0103](https://github.com/KeisezrG0103)
- **LeetCode:** [leetcode.com/u/KeisezrG0103](https://leetcode.com/u/KeisezrG0103)

---

<details>
<summary><b>Petunjuk Menjalankan Proyek Secara Lokal</b></summary>

```bash
# Klon repositori
git clone https://github.com/KeisezrG0103/portofolio.git
cd portofolio

# Instalasi dependensi
npm install

# Menjalankan server pengembangan
npm run dev

# Eksekusi pengujian unit
npm test

# Kompilasi build produksi
npm run build
```
</details>

<p align="center">
  <i>Dikembangkan oleh <b>Nicholas Ivan Christiaffri Wibowo</b> · 2026</i>
</p>
