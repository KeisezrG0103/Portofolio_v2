# TUGAS
Bangun web portofolio pribadi 3D "Cosmic Observatory" untuk **Nicholas Ivan (FullStack Developer)** memakai **React + JavaScript (bukan TypeScript)**. Sinematik, elegan, minimalis: ruang kosmis gelap yang luas, kamera terbang halus, tipografi bersih. HINDARI panel sci-fi yang ramai dan bingkai/garis tebal.

# STACK (wajib)
- Vite + React 18 (JSX, tanpa TypeScript), ESLint + Prettier.
- three, @react-three/fiber, @react-three/drei (useGLTF, useProgress, Preload, Stars/Sparkles bila perlu).
- zustand untuk state global. CSS biasa atau CSS Modules (tanpa Tailwind/UI kit). Font: Fraunces (serif) dan Montserrat (sans), lewat Google Fonts atau @fontsource.
- Opsional: @react-three/postprocessing (Bloom sangat tipis untuk Matahari saja). Jangan menambah library lain tanpa alasan kuat.
- Referensi perilaku: bila bisa diakses, buka demo vanilla https://claude.ai/artifact/GSokh7FQseXtXa5LKbjVp3 dan tiru gerak kamera, tata letak, dan interaksinya. Jika tidak bisa, ikuti spesifikasi di bawah.

# ASET (di /public/assets/, semua .glb)
earth, mercury, venus, mars, jupiter, saturn, uranus, neptune, sky_pano_-_milkyway, Astronaut, Satelite_Aquarius (A), Advanced Composition Explorer, Asteroid_2d (±18 MB), meteor.
- Ubah nama menjadi snake_case tanpa spasi/kurung (satelite_aquarius.glb, advanced_composition_explorer.glb, dst).
- Muat dengan `useGLTF` + decoder Draco/Meshopt bila file terkompres. Kompres Asteroid_2d.glb dan sky pano dengan gltf-transform (`npx @gltf-transform/cli optimize`) bila terlalu berat, simpan hasilnya terpisah dan jangan timpa file asli.
- Setiap model wajib melewati komponen `<Model>` yang: (1) menghitung Box3, lalu menormalkan ke radius target; (2) memusatkan pivot; (3) `scene.clone(true)` agar aman dipakai ulang; (4) menonaktifkan frustum culling hanya bila perlu.
- Bungkus tiap model dengan `<Suspense>` + ErrorBoundary: bila gagal dimuat, tampilkan bola fallback (SphereGeometry + warna planet) dan `console.warn`, jangan crash.
- Layar loading minimalis (garis progres tipis + persentase, pakai `useProgress`), fade-out saat selesai. Panggil `useGLTF.preload`.

# PERAN OBJEK
PLANET = bagian konten (interaktif). NON-PLANET = HIASAN SAJA (tidak bisa diklik, tidak membawa konten):
- sky_pano_-_milkyway: bola langit besar (BackSide, tidak terkena fog), posisinya mengikuti kamera tiap frame.
- Astronaut: sangat kecil, mengambang pelan di sudut kanan-bawah layar (desktop) atau kanan-atas (mobile), ikut kamera (render sebagai anak kamera via `createPortal` atau `<PerspectiveCamera makeDefault>` dengan children), bobbing + rotasi lambat, tampil di semua mode.
- Satelite_Aquarius: mengorbit Bumi (radius ±4.6, kecepatan ±0.4 rad/s).
- Advanced Composition Explorer: hanyut pelan di dekat Uranus (posisi sekitar x=3, y=2, z=-285), berputar lambat.
- Asteroid_2d + meteor: sabuk asteroid antara Mars dan Jupiter (z ±-176 sampai -202, x menyebar ±15 mengikuti jalur Mars→Jupiter). Gunakan InstancedMesh: ±280 batu kecil + ±18 batu besar; ambil geometry/material dari model. Kamera melewati sabuk saat terbang.
- Debu bintang: Points aditif, ±2200 titik di sepanjang jalur (x ±50, y ±30, z +30 sampai -380).
- Matahari: bola emissive + sprite glow aditif, posisi (0,-4,-14), glow berdenyut halus.

# 8 PLANET → KONTEN (urutan Tata Surya)
Posisi: z = -42 × indeks, x selang-seling, y acak kecil (±1.5, tetap/seeded).
| # | Planet | Konten | x | radius | jarak kamera |
|---|---|---|---|---|---|
| 1 | Mercury | Edukasi | 5 | 1.3 | 8 |
| 2 | Venus | Pengalaman | -6 | 2.2 | 8.5 |
| 3 | Earth | Tentang Saya | 7 | 2.6 | 9.5 |
| 4 | Mars | Proyek | -7 | 1.7 | 7.5 |
| 5 | Jupiter | Kemampuan | 9 | 5 | 20 |
| 6 | Saturn | Sertifikasi & Prestasi | -9 | 3.6 | 14 |
| 7 | Uranus | Minat & Hobi | 8 | 3 | 12 |
| 8 | Neptune | Kontak | -6 | 2.9 | 11 |
Warna legenda: Mercury #9a958d, Venus #d9b27a, Earth #4b86e8, Mars #c0643a, Jupiter #d8b894, Saturn #e3cf9f, Uranus #9fd8dc, Neptune #3a66d6.
Semua data planet (posisi, radius, jarak, warna, file) ada di `src/data/planets.js`. Semua teks ada di `src/data/content.js` (JS object: judul, kicker, paragraf, daftar linimasa {periode, judul, deskripsi}, skills [{nama, persen}], chips, tautan kontak). Isi dengan teks contoh berlabel "[contoh]". Panel dan legenda dibangkitkan dari data yang sama (jangan di-hardcode di komponen).
Isi konten: Mercury = linimasa pendidikan; Venus = linimasa kerja; Earth = profil singkat + chips nilai pribadi; Mars = daftar proyek; Jupiter = bar keahlian tipis (React, Three.js, Node.js, Python, PostgreSQL, Docker & Cloud); Saturn = sertifikasi/prestasi; Uranus = paragraf + chips minat; Neptune = tautan (email, GitHub, LinkedIn) + form pesan demo (nama, email, pesan, tombol; hanya UI, tampilkan "Sinyal terkirim (demo) ✓").

# STATE (zustand, `src/store.js`)
mode: 'landing' | 'voyage' | 'free'; index (0=Matahari, 1-8); panel: {open, index, side: 'l'|'r'}; sound (bool); legendOpen (bool). Nilai yang berubah tiap frame (posisi kamera, yaw, pitch, velocity, tombol yang ditekan, progres terbang) disimpan di **useRef / objek mutable**, JANGAN di React state agar tidak re-render 60x per detik. Di dalam useFrame baca store lewat `useStore.getState()`.

# KAMERA (`<CameraRig>` dengan useFrame; tanpa OrbitControls)
Landing: kamera di (0,1,24), lookAt (0,-2,-14).
MODE PERJALANAN
- Navigasi: tombol "Start Mission" (landing), panah ←/→, 8 titik progres (klik), scroll mouse, swipe, tombol keyboard (←→↑↓/Spasi), klik planet, klik baris legenda. Beri jeda 1.7 detik antar-navigasi untuk scroll/swipe.
- Penghitung pojok kanan atas: "03 / 08 · EARTH". Di planet terakhir tombol → menjadi ↺ (kembali ke Matahari).
- Terbang: interpolasi posisi dan titik pandang dengan ease-out cubic `1-(1-t)^3`; durasi = clamp(2800 + jarak×26, , 5600) ms. Posisi tiba = planet + (0, 0.5, jarakKamera). Titik pandang digeser ke samping: x += side × jarak × 0.4 (desktop), atau y -= jarak × 0.17 (mobile) agar planet di satu sisi layar dan panel di sisi lain. `side` selang-seling: planet ganjil → panel kanan, genap → panel kiri.
- Panel fade-in saat ±78% durasi (pakai penanda token/ref agar timer basi dibatalkan bila user navigasi lagi), panel memudar cepat saat mulai terbang.
- Camera drift: offset ±(x 2.2, y 1.4) mengikuti posisi mouse, di-lerp 0.02 (nonaktif bila prefers-reduced-motion).
MODE JELAJAH BEBAS (tombol "✦ Jelajah bebas" kanan bawah; toggle)
- Masuk: ambil arah kamera saat ini menjadi yaw/pitch (rotation order 'YXZ'), pindahkan kontrol ke kondisi bebas, sembunyikan bar navigasi, hero, dan penghitung; tampilkan petunjuk tipis: "W A S D bergerak · Q/E turun-naik · Shift lebih cepat · seret untuk melihat · klik planet untuk terbang mendekat · deskripsi muncul · Esc keluar".
- Kontrol: WASD, Q/E (atau Spasi naik), Shift = cepat (16 unit/s normal, 60 cepat). Kecepatan dengan inersia: `vel.lerp(target, 1 - exp(-dt*3))`, dt dibatasi 0.05. Seret mouse untuk melihat (yaw -= dx×0.003, pitch dibatasi ±1.5). Bersihkan state tombol saat window blur.
- Collision: dorong kamera keluar dari radius planet × 1.3 dan Matahari (radius 5). Batas area: x ±150, y ±70, z dari +80 sampai -420.
- Label nama planet tipis (HTML overlay yang diproyeksi tiap frame, via ref + transform langsung ke DOM, bukan state) yang memudar saat dekat dan hilang bila di belakang kamera.
- Hover planet: cursor pointer. Cursor grab di ruang kosong.
- KLIK PLANET di mode bebas (abaikan jika drag > 5 px; gunakan `e.delta` dari event R3F + `e.stopPropagation()`): kamera otomatis terbang mendekat dengan ease-out cubic (durasi clamp(2200 + jarak×22, , 4500) ms) ke titik di sepanjang garis dari planet menuju posisi kamera saat ini, berhenti pada jarak kamera planet itu, sambil menoleh ke planet (yaw/pitch diinterpolasi lewat selisih sudut terpendek), dengan planet di sisi layar berlawanan dengan panel (yaw digeser ±0.34 rad, atau pitch -0.2 di mobile). Sisi panel ditentukan dari posisi layar planet saat diklik (di kiri → panel kanan). Panel deskripsi fade-in di ±78% durasi. Tetap di mode bebas. Menekan WASD/Q/E atau menyeret >8 px saat terbang membatalkan terbang dan panel tertunda.
- Di panel ada tombol "Kembali ke perjalanan →": keluar dari mode bebas dan terbang ke planet itu di mode perjalanan. Klik ruang kosong atau Esc menutup panel; Esc lagi keluar dari mode bebas. Keluar mode bebas = terbang halus kembali ke sektor terakhir.

# LEGENDA
Pojok kiri atas, di bawah logo "N.I.": daftar 8 baris "● Nama → Bagian" (contoh "● Jupiter → Kemampuan"), titik berwarna sesuai warna planet dengan glow kecil, tanpa kotak/bingkai, font 11px, text-shadow lembut. Klik baris: mode perjalanan → terbang ke planet itu; mode bebas → pendekatan + deskripsi. Baris planet aktif digarisbawahi tipis. Memudar otomatis saat panel tampil di sisi kiri; bisa dilipat dengan tombol "◐ Legenda"; default tertutup di mobile (<800px). Dibangkitkan dari `planets.js`/`content.js`.


# UI (komponen React di luar `<Canvas>`)
`Hero` (nama "Nicholas Ivan" serif besar, `clamp(44px, 9vw, 124px)`, light 300; di bawahnya "FullStack Developer" sans, uppercase, letter-spacing .5em), `Brand` ("N.I." kiri atas, klik = kembali ke Matahari), `Counter`, `NavBar` (← | titik-titik | →, tombol bundar tipis; di landing hanya tombol "Start Mission ↓"), `Legend`, `Panel`, `FreeModeButton`, `SoundButton`, `Hint`, `LoadingScreen`.
Panel glassmorphism: background rgba(255,255,255,.055), `backdrop-filter: blur(26px) saturate(1.2)`, border 1px rgba(255,255,255,.1), radius 24px, bayangan lembut, lebar min(430px, 88vw), max-height 70vh scroll. Tipografi: kicker 10px uppercase letter-spacing .38em; judul Fraunces 33px; isi Montserrat 14.5px, line-height 1.85, warna rgba(233,236,245,.64) dengan judul #e9ecf5 (kontras, tidak menyilaukan). Animasi fade + translateY ringan (transition 1.3-1.6s, cubic-bezier(.2,.8,.2,1)). Bar keahlian setebal 2px, terisi dengan transisi 1.8s saat panel muncul. Banyak ruang negatif, tanpa garis teknis berlebihan.
Mobile (<800px): panel menjadi bottom sheet (bottom 118px, max-height 44vh), jarak dan posisi astronaut disesuaikan, legenda tertutup default; mode bebas cukup geser untuk melihat + ketuk planet (WASD hanya desktop).

# PENCAHAYAAN & RENDER
`<Canvas dpr={[1,2]} camera={{fov:50, near:.1, far:1400}} gl={{toneMapping: ACESFilmicToneMapping}}>`. Ambient biru gelap (#1a2240, 0.45), directionalLight hangat (#fff0dd, 2.3) dari arah Matahari (-14,8,40), rim light biru lembut (#6f9bff, 1.5) dari (18,-5,-40). Halo atmosfer tipis di Bumi (sphere BackSide aditif, #5b8cff, opacity .14). Cincin Saturnus (r 4.6-7.8, opacity .42) dan Uranus (4-4.6, opacity .18) buatan sendiri bila model tidak memilikinya. Planet berputar sangat pelan.

# SUARA
Hook `useAmbient`: WebAudio drone kosmis (5 oscillator sine 55/82.4/110/164.8/220 Hz dengan detune acak ±8 cent, masing-masing gain kecil dengan LFO lambat, melewati lowpass 700 Hz). TIDAK autoplay; hidup lewat tombol "♪ Suara ambient: mati/hidup" (kiri bawah), fade-in/out 3 detik, buat AudioContext hanya saat klik pertama. Bersihkan di unmount dan aman terhadap React StrictMode (jangan membuat dua konteks).

# STRUKTUR
src/{main.jsx, App.jsx, store.js, data/{planets.js,content.js}, scene/{Scene.jsx, CameraRig.jsx, Planet.jsx, Model.jsx, Sky.jsx, Sun.jsx, AsteroidBelt.jsx, Satellite.jsx, Probe.jsx, AstronautMascot.jsx, Dust.jsx, Rings.jsx}, ui/{Hero,Brand,Counter,NavBar,Legend,Panel,FreeModeButton,SoundButton,Hint,LoadingScreen}.jsx, hooks/{useAmbient.js,useKeys.js,useFreeLook.js}, styles/*.css}.

# ATURAN KUALITAS
- Per-frame logic hanya di useFrame dan ref; jangan setState di dalam useFrame kecuali saat transisi (misal membuka panel).
- Semua timer/token terbang disimpan di ref dan dibersihkan saat unmount atau navigasi baru.
- Dispose geometry/material/texture yang dibuat manual; event listener window dibersihkan di cleanup.
- Hormati prefers-reduced-motion (matikan drift, percepat transisi).
- Aksesibilitas: semua tombol HTML ber-aria-label, fokus terlihat, Esc menutup panel, panel `role="dialog"`. Setelah klik tombol, blur-kan agar Spasi tidak memicu klik ulang.
- Hindari typo font fallback: berikan fallback stack (Fraunces, Georgia, serif / Montserrat, Lato, system-ui, sans-serif).

# KRITERIA SELESAI
1. `npm install && npm run dev` berjalan tanpa error/warning berarti; `npm run build` sukses.
2. Semua .glb termuat; bila satu gagal, ada fallback bola dan aplikasi tetap jalan.
3. Perjalanan Start → Mercury → … → Neptune mulus, panel tiap planet benar, ↺ kembali ke awal.
4. Mode jelajah bebas lengkap (WASD, look, collision, label, klik planet = terbang mendekat + deskripsi, Esc, kembali ke perjalanan).
5. Legenda berfungsi (klik, highlight, fade, lipat).
6. Non-planet tidak bisa diklik dan tidak membuka panel.
7. ±60 fps di laptop biasa, tidak ada re-render React per frame (cek dengan React DevTools Profiler).
8. README singkat: cara menjalankan, mengganti konten (`content.js`), mengganti urutan/posisi planet (`planets.js`), mengompres model, dan deploy ke Vercel/Netlify.

# CARA KERJA
Mulai dengan rencana singkat, lalu kerjakan bertahap dan jalankan dev server di tiap tahap: (1) scaffolding + loader model + scene statis; (2) mode perjalanan + panel; (3) legenda + UI polish; (4) mode jelajah bebas + klik-mendekat; (5) suara, performa, mobile, README. Setelah tiap tahap, ringkas apa yang sudah jalan dan apa yang belum. Jika ada model yang orientasi/skalanya aneh, laporkan dan perbaiki di `Model.jsx` (jangan ubah file asli).