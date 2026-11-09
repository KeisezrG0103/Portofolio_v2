<!-- BEGIN:nextjs-agent-rules -->

# Agent Guardrails & Anti-Reckless Operating Protocols: "Cosmic Observatory" 3D Portfolio

> Agen dilarang bertindak gegabah, merusak kode yang ada, melakukan refaktor massal tanpa rencana, mengabaikan batasan arsitektur, atau menambahkan dependensi secara sembarangan. Setiap tindakan harus terukur, teruji, berkinerja tinggi, dan non-destruktif.
>
> **Mandat Standar Keahlian (Active System Skills):**  
> Agen wajib menginternalisasi dan mengaktifkan 3 peran keahlian sistem secara terpadu di setiap eksekusi:
> 1. **Senior Programmer (`senior-frontend` / `senior-fullstack`):** Standar arsitektur bersih (SOLID, DRY), pemisahan tanggung jawab (*separation of concerns*), pencegahan *memory leak*, dan performa WebGL tanpa kompromi.
> 2. **UI/UX Engineer (`modern-web-guidance`):** Estetika observatorium minimalis, *glassmorphism* elegan, hierarki tipografi (*Fraunces* & *Montserrat*), ergonomi interaksi responsif (Desktop vs. Mobile Bottom Sheet), serta standar aksesibilitas ketat (A11y/WCAG).
> 3. **TDD Practitioner (`tdd-guide`):** Disiplin *Red-Green-Refactor*, pengujian unit untuk logika matematika/kamera dan *store*, serta verifikasi kestabilan sebelum tugas diserahkan.

---

## 1. Anti-Reckless Protocols

1. **Langkah Inkremental & Terisolasi:**
   - Dilarang merombak banyak file inti secara bersamaan. Kerjakan satu modul/fitur secara bertahap (scaffold ➔ implementasi ➔ verifikasi ➔ integrasi).
   - Sebelum menyentuh file yang sudah berjalan, baca dan pahami dependensi antar-komponen terlebih dahulu.

2. **Kebijakan Non-Destruktif (Preservasi Aset & Kode):**
   - **JANGAN PERNAH** menimpa, menghapus, atau memodifikasi file model 3D asli (`.glb` di `/public/assets/`). Jika melakukan kompresi (`gltf-transform`), simpan ke file terpisah dengan penamaan jelas.
   - Jangan menghapus komentar, instruksi konfigurasi, atau blok sistem yang sudah ada tanpa alasan yang valid.

3. **Larangan Halusinasi Dependensi & Stack Enforcing:**
   - **Bahasa & Framework:** Wajib menggunakan **JavaScript / JSX (React > 18)**. DILARANG beralih ke TypeScript atau mengubah ekstensi ke `.ts`/`.tsx` kecuali diminta eksplisit oleh pengguna.
   - **3D & State:** Gunakan Three.js, `@react-three/fiber`, `@react-three/drei`, dan **Zustand**.
   - **Styling:** Gunakan CSS bersih / CSS Modules. Dilarang memasang framework UI raksasa (seperti Tailwind, MUI, AntD, Chakra) yang membebani bundle atau bertabrakan dengan desain estetika minimalis.
   - **Kompabilitas Next.js & React 19:** Waspadai perbedaan API versi baru. Jika ada masalah hidrasi (*hydration error*) atau eksekusi *client-only* pada canvas 3D, isolasi dengan `'use client'` dan dynamic import dengan `{ ssr: false }`.

4. **Verifikasi Mandiri Sebelum Selesai:**
   - Selalu lakukan uji lint / build / kompilasi (`npm run build` atau tes terminal terkait) sebelum mendeklarasikan pekerjaan selesai.
   - Dilarang membuat asumsi "kode pasti jalan" tanpa pembuktian error-free.

---

## 2. Standar Senior Programmer (Arsitektur & Zero 60fps Re-render Overhead)

1. **Dilarang Menaruh State Per-Frame di React State:**
   - **MUTLAK:** Variabel yang berubah setiap frame (posisi kamera, target lerp, rotasi, velocity, mouse yaw/pitch, scroll progress, delta waktu) **WAJIB** disimpan dalam `useRef` atau objek mutable.
   - **DILARANG KERAS** memanggil `setState` atau hook Zustand yang mentrigger re-render di dalam callback `useFrame` setiap frame. Hal ini menyebabkan overhead 60fps re-render dan membuat browser lag/macet.

2. **Akses Store di useFrame:**
   - Di dalam loop animasi atau `useFrame`, baca nilai store secara langsung melalui `useStore.getState()`. Jangan gunakan reactive selector yang memicu render ulang per tick.

3. **Pencegahan Canvas Crash (Suspense & Error Boundary):**
   - Setiap model 3D wajib dibungkus dalam `<Suspense fallback={...}>` dan `<ErrorBoundary>`.
   - Jika file `.glb` gagal dimuat (network error, path broken, corrupt), tampilkan objek fallback prosedural (misal: `<sphereGeometry>` dengan material warna planet terkait) dan `console.warn`. **Canvas WebGL tidak boleh crash total hanya karena satu aset bermasalah.**

4. **Pembersihan Memori & Resource Disposal:**
   - Bersihkan dan `dispose()` objek geometry, material, dan texture yang dibuat secara dinamis saat komponen unmount untuk mencegah *memory leak* pada WebGL context.
   - Semua event listener window (`keydown`, `keyup`, `pointermove`, `resize`, `blur`) wajib dibersihkan di fungsi return `useEffect`.

5. **Interaksi & Pergerakan Kamera Sinematik:**
   - Semua pergerakan perpindahan kamera wajib menggunakan interpolasi halus (*ease-out cubic* atau *damped lerp*). Dilarang melakukan *instant snapping*.
   - Batasi delta waktu (`const dt = Math.min(delta, 0.05)`) untuk menghindari *jump glitch* saat tab diminimalkan atau frame drop.

---

## 3. Standar UI/UX Engineer (Desain, Ergonomi & Aksesibilitas)

1. **Gaya Glassmorphism Minimalis & Elegan:**
   - Hindari UI bertema sci-fi yang ramai, garis bingkai tebal, sudut kaku, atau HUD militer futuristik yang bising.
   - Pertahankan estetika observatorium yang tenang: panel kaca halus (`background: rgba(255, 255, 255, 0.055)`, `backdrop-filter: blur(26px) saturate(1.2)`), border sangat tipis (`rgba(255, 255, 255, 0.1)`), radius melengkung elegan (20-24px), serta ruang negatif (*whitespace*) yang lega.

2. **Standar Tipografi & Kontras:**
   - **Heading / Judul Utama:** `Fraunces` (serif kontemporer, elegan, berkarakter).
   - **Body / Subtitle / HUD:** `Montserrat` (sans-serif bersih, mudah dibaca, letter-spacing rapi).
   - Gunakan warna teks lembut yang ramah di mata (`#e9ecf5` untuk judul utama, `rgba(233, 236, 245, 0.64)` untuk body), hindari warna putih murni `#ffffff` yang menyilaukan pada latar gelap pekat.

3. **Responsivitas & Adaptabilitas Mobile (<800px):**
   - Pada layar kecil (<800px), panel samping bertransformasi menjadi *bottom sheet drawer* dengan ketinggian maksimal 44vh.
   - Legenda kosmis otomatis terlipat secara default pada mobile.
   - Mode jelajah bebas pada perangkat layar sentuh menggunakan gestur geser (drag) dan tap planet untuk mendekat.

4. **Keamanan Audio & Aksesibilitas (A11y):**
   - Suara latar (ambient soundscape) **TIDAK BOLEH AUTOPLAY**. `AudioContext` hanya boleh diinisialisasi setelah interaksi pertama pengguna (klik tombol audio) dan tahan terhadap *React StrictMode double-mounting*.
   - Semua tombol kontrol HTML wajib memiliki `aria-label` deskriptif.
   - Panel dialog wajib menggunakan atribut `role="dialog"` dan `aria-modal="true"`.
   - Tombol keyboard `Escape` harus menutup panel yang aktif, dan menekan `Escape` kembali akan keluar dari mode jelajah bebas.
   - Lepaskan fokus tombol setelah diklik (`element.blur()`) agar spasi tidak memicu klik ulang saat pengguna bermanuver.
   - Hormati `prefers-reduced-motion` (nonaktifkan camera drift acak dan perpendek durasi transisi).

---

## 4. Standar TDD (Test-Driven Development & Verifikasi Mutu)

1. **Pengujian Logika Murni & Kalkulasi Matematis:**
   - Setiap fungsi kalkulasi lintasan kamera, normalisasi bounding box 3D, *clamping*, interpolasi *ease-out cubic*, dan helper koordinat planet wajib memiliki unit test terisolasi.
   - Pastikan edge case (nilai delta besar, transisi di batas array indeks 0 s/d 8, null ref) teruji dengan benar.

2. **Pengujian State Store (Zustand):**
   - Uji aksi-aksi store (perubahan mode: `landing` ➔ `voyage` ➔ `free`, buka/tutup panel, mute/unmute audio, buka/tutup legenda) agar menghasilkan state mutasi yang prediktif tanpa *side effect* liar.

3. **Siklus Red-Green-Refactor:**
   - Definisikan ekspektasi output sebelum melakukan perubahan logika besar.
   - Tulis kode implementasi minimal yang lulus tes, lalu lakukan *clean code refactoring*.
   - Pastikan tes regresi tidak merusak alur navigasi yang sudah berjalan.

---

## 5. Tata Kelola Data & Konten

1. **Sentralisasi Data (No Hardcoded Content):**
   - **Data Konten:** Semua teks, biografi, linimasa edukasi, pengalaman, keahlian, dan tautan kontak harus bersumber dari `src/data/content.js` (merujuk pada data terverifikasi di `.agent/profile.md`).
   - **Data Tata Surya:** Posisi koordinat, radius, rotasi, warna legenda, dan jarak kamera planet harus terpusat di `src/data/planets.js`.
   - Komponen UI, panel informasi, dan legenda membaca data tersebut secara dinamis. Dilarang meng-hardcode teks portofolio langsung di komponen visual.

2. **Hierarki & Peran Objek Kosmis:**
   - **Node Interaktif (Planet):** Hanya 8 planet utama (Mercury s/d Neptune) yang memiliki interaksi klik, hover pointer, dan membuka panel konten.
   - **Elemen Ambien / Dekoratif (Non-Planet):** Sky panorama Milky Way, Astronaut, Satelit Aquarius, Advanced Composition Explorer, Asteroid Belt, Meteor, dan Matahari bersifat dekoratif/pendukung atmosfer. Dilarang memasang trigger klik atau panel konten pada objek non-planet.

---

## 6. Checklist Verifikasi Mandiri Agen

Sebelum menyelesaikan atau menyerahkan tugas kepada pengguna, agen wajib memverifikasi checklist berikut:
- [ ] **Senior Dev:** Apakah ada file/model 3D yang tertimpa secara tidak sengaja? (Harus: TIDAK).
- [ ] **Senior Dev:** Apakah kode menggunakan React State di dalam useFrame? (Harus: TIDAK ADA, wajib mutable/ref).
- [ ] **Senior Dev:** Apakah model 3D terbungkus Suspense + fallback aman dari crash canvas?
- [ ] **UI/UX Eng:** Apakah estetika *glassmorphism*, tipografi *Fraunces*/*Montserrat*, kontras, dan layout responsif (<800px) terjaga?
- [ ] **UI/UX Eng:** Apakah aksesibilitas (aria-label, dialog role, tombol Esc, blur on click, reduced-motion) berfungsi?
- [ ] **TDD:** Apakah helper kalkulasi dan store Zustand telah teruji tanpa galat atau regresi fungsi?
- [ ] **Data:** Apakah teks konten konsisten dengan `.agent/profile.md` dan bersumber dari `content.js`?
- [ ] **Build:** Apakah proses build (`npm run build`) berjalan sukses tanpa galat fatal atau peringatan lint kritis?

---

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
