# Nicholas Ivan — Cosmic Observatory (3D Portfolio)

Portofolio interaktif 3D bertema **Cosmic Observatory** milik **Nicholas Ivan (FullStack Developer & Machine Learning Specialist)**, dibangun dengan React, Three.js (`@react-three/fiber`, `@react-three/drei`), dan Zustand.

---

## 1. Cara Menjalankan Proyek

Pastikan Node.js (v18+) sudah terpasang:

```bash
# 1. Instal dependensi
npm install

# 2. Jalankan server pengembangan (http://localhost:3000)
npm run dev

# 3. Jalankan pengujian unit (TDD math, trajectory & Zustand store)
npm test

# 4. Jalankan linting & build produksi
npm run lint
npm run build
```

---

## 2. Mengganti Konten Portofolio (`src/data/content.js`)

Seluruh teks biografi, linimasa edukasi, pengalaman kerja, daftar proyek, persentase keahlian, sertifikasi, minat, dan tautan kontak terpusat di [`src/data/content.js`](./src/data/content.js) (merujuk pada profil di [`.agent/profile.md`](./.agent/profile.md)):

- **`mercury`** ➔ Linimasa Edukasi (`timeline: [{ period, title, description }]`)
- **`venus`** ➔ Linimasa Pengalaman (`timeline: [{ period, title, description }]`)
- **`earth`** ➔ Tentang Saya (`paragraphs: [...]`, `chips: [...]`)
- **`mars`** ➔ Proyek Unggulan (`timeline: [{ period, title, description }]`)
- **`jupiter`** ➔ Kemampuan Teknis (`skills: [{ name, percent }]`, `chips: [...]`)
- **`saturn`** ➔ Sertifikasi & Prestasi (`timeline: [{ period, title, description }]`)
- **`uranus`** ➔ Minat & Hobi (`paragraphs: [...]`, `chips: [...]`)
- **`neptune`** ➔ Kontak & Form Demo (`links: [{ label, href }]`)

Komponen panel (`src/ui/Panel.jsx`) dan legenda (`src/ui/Legend.jsx`) membaca objek tersebut secara dinamis.

---

## 3. Mengganti Urutan / Posisi Planet (`src/data/planets.js`)

Konfigurasi 8 planet utama dan aset dekoratif berada di [`src/data/planets.js`](./src/data/planets.js):

- **`position`**: Koordinat `[x, y, z]` di ruang 3D (default `z = -42 * index`).
- **`radius`**: Radius target normalisasi model (`<Model>` secara otomatis menghitung `Box3`, menormalkan skala ke `radius`, dan memusatkan pivot).
- **`cameraDistance`**: Jarak berhenti kamera saat tiba di planet pada mode perjalanan maupun pendekatan mode bebas.
- **`color`**: Warna indikator legenda dan bola fallback prosedural.
- **`file`**: Jalur file `.glb` di dalam `/public/assets/`.

---

## 4. Mengompres Model 3D (`.glb`) Tanpa Menimpa Aset Asli

Apabila terdapat model `.glb` berukuran besar (seperti `Asteroid_2d.glb` atau `sky_pano_-_milkyway.glb`), kompres ke file terpisah menggunakan `@gltf-transform/cli` (**jangan menimpa file asli**):

```bash
npx @gltf-transform/cli optimize public/assets/Asteroid_2d.glb public/assets/asteroid_2d_opt.glb --compress draco --texture-compress webp
```

Setelah file hasil optimasi dibuat, arahkan properti `file` di `src/data/planets.js` ke nama file baru tersebut.

---

## 5. Deploy ke Vercel / Netlify

### **Vercel**
1. Hubungkan repositori GitHub ke [Vercel](https://vercel.com).
2. Gunakan preset **Next.js** (`Build Command`: `npm run build`, `Output Directory`: `.next`).
3. Klik **Deploy**.

### **Netlify**
1. Hubungkan repositori ke [Netlify](https://www.netlify.com).
2. Atur `Build command` ke `npm run build` dan gunakan plugin `@netlify/plugin-nextjs` (otomatis terdeteksi).
3. Klik **Deploy site**.
