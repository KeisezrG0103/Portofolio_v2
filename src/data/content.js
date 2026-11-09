/**
 * Centralized Portfolio Content for Nicholas Ivan ("Cosmic Observatory").
 * Sourced from verified data in .agent/profile.md & .agent/master.md.
 */

export const PROFILE_META = {
  name: 'Nicholas Ivan',
  role: 'FullStack Developer',
  brand: 'N.I.',
  location: 'Yogyakarta, Indonesia',
};

export const CONTENT = {
  mercury: {
    id: 'mercury',
    index: 1,
    kicker: '01 · Mercury',
    title: 'Edukasi',
    type: 'timeline',
    timeline: [
      {
        period: '2025 — 2026',
        title: 'Magister Informatika (S2) · Universitas Atma Jaya Yogyakarta',
        description:
          'Konsentrasi: Machine Learning & Kecerdasan Buatan · IPK 3.98 / 4.00. Fokus riset tesis pada Sistem Deteksi Berita Palsu (Fake News Detection) menggunakan Natural Language Processing (NLP) & Deep Learning.',
      },
      {
        period: '2021 — 2025',
        title: 'Sarjana Informatika (S1) · Universitas Atma Jaya Yogyakarta',
        description:
          'Konsentrasi: Application Developer · IPK 3.80 / 4.00 (Cum Laude). Fokus pada Rekayasa Perangkat Lunak, Arsitektur Web & Mobile, Algoritma, dan Basis Data Relasional.',
      },
    ],
  },

  venus: {
    id: 'venus',
    index: 2,
    kicker: '02 · Venus',
    title: 'Pengalaman',
    type: 'timeline',
    timeline: [
      {
        period: '2025',
        title: 'Frontend Web Engineer (Freelance) · VAPubs',
        description:
          'Merombak dan mengoptimasi arsitektur frontend perusahaan dari WordPress ke Next.js (SSR/SSG, lazy loading, optimasi DOM & aset), meningkatkan skor Google Lighthouse dari 70 menjadi 98.',
      },
      {
        period: '2024 — 2025',
        title: 'Application Developer Intern · PT Hartono Istana Teknologi (Polytron)',
        description:
          'Mengembangkan fitur enterprise seperti User Logout Flow, optimasi cutoff struktur tabel database, RESTful API Sales Data, serta menyelesaikan masalah broken image path pada aplikasi web.',
      },
      {
        period: '2022 — 2026',
        title: 'Asisten Dosen & Praktikum · Universitas Atma Jaya Yogyakarta',
        description:
          'Merancang modul praktikum dan panduan teknis implementasi Natural Language Processing (NLP), serta membimbing & mengevaluasi 100+ mahasiswa pada mata kuliah NLP, Matematika Diskrit, dan Statistika.',
      },
      {
        period: '2023 — 2024',
        title: 'Frontend Developer · Proyek Pamdesku (Gunung Kidul)',
        description:
          'Membangun antarmuka web pencatatan dan pembayaran tagihan air mandiri bagi masyarakat Gunung Kidul, berkolaborasi via GitHub, serta menyusun dokumentasi sistem secara menyeluruh.',
      },
      {
        period: '2023',
        title: 'Lead AI Researcher · Kompetisi OCR Plat Nomor Kendaraan',
        description:
          'Mengembangkan sistem Optical Character Recognition (OCR) berbasis Python, OpenCV, dan TensorFlow untuk deteksi plat nomor Indonesia dengan F1-Score 79% (Peringkat 59 dari 120 tim nasional).',
      },
    ],
  },

  earth: {
    id: 'earth',
    index: 3,
    kicker: '03 · Earth',
    title: 'Tentang Saya',
    type: 'about',
    paragraphs: [
      'Saya Nicholas Ivan, lulusan Magister Informatika (IPK 3.98) dan Sarjana Informatika (IPK 3.80) Universitas Atma Jaya Yogyakarta yang berfokus pada pengembangan aplikasi Full Stack serta integrasi kecerdasan buatan.',
    ],
    chips: [
      'Full Stack Engineering',
      'Ketelitian Arsitektur',
      'Web Performance',
      'Machine Learning & NLP',
      'Kolaborasi Tim',
    ],
  },

  mars: {
    id: 'mars',
    index: 4,
    kicker: '04 · Mars',
    title: 'Proyek',
    type: 'timeline',
    timeline: [
      {
        period: '2025 · Freelance',
        title: 'Modernisasi Antarmuka Web VAPubs',
        description:
          'Next.js, React, SSR/SSG · Perombakan arsitektur frontend dan optimasi Core Web Vitals yang mendongkrak skor performa Google Lighthouse dari 70 ke 98.',
      },
      {
        period: '2025 — 2026 · Tesis S2',
        title: 'Sistem Deteksi Berita Palsu (Fake News Detection)',
        description:
          'Python, NLP, Deep Learning · Model klasifikasi semantik untuk mendeteksi disinformasi dan berita palsu berbahasa Indonesia secara akurat.',
      },
      {
        period: '2023 — 2024 · Pengabdian',
        title: 'Platform Web Mandiri Pamdesku',
        description:
          'React, REST API, Git · Sistem informasi pencatatan meteran dan pembayaran tagihan air masyarakat Gunung Kidul beserta dokumentasi operasional.',
      },
      {
        period: '2023 · Kompetisi Nasional',
        title: 'Sistem OCR Deteksi Plat Nomor Kendaraan',
        description:
          'Python, OpenCV, TensorFlow · Pipeline computer vision untuk segmentasi dan rekognisi karakter plat nomor kendaraan Indonesia (F1-Score 79%).',
      },
      {
        period: '2026 · Interactive WebGL',
        title: '3D Portfolio',
        description:
          'React, Three.js, React Three Fiber, Zustand · Observatorium kosmis interaktif 3D dengan navigasi kamera sinematik dan mode penjelajahan bebas.',
      },
    ],
  },

  jupiter: {
    id: 'jupiter',
    index: 5,
    kicker: '05 · Jupiter',
    title: 'Kemampuan',
    type: 'skills',
    skills: [
      { name: 'React / Next.js & Modern Frontend', percent: 85 },
      { name: 'JavaScript (ES6+), HTML5 & CSS3', percent: 85 },
      { name: 'Node.js, Laravel & RESTful API', percent: 85 },
      { name: 'Python, Machine Learning & NLP', percent: 85 },
      { name: 'SQL (PostgreSQL / MySQL) & Schema Design', percent: 85 },
      { name: 'Three.js / WebGL & Agentic AI Workflows', percent: 72 },
    ],
    chips: [
      'JavaScript',
      'Python',
      'PHP',
      'SQL',
      'Next.js',
      'React',
      'Node.js',
      'Laravel',
      'TensorFlow',
      'OpenCV',
      'Git & GitHub',
      'Antigravity / Codex',
    ],
  },

  saturn: {
    id: 'saturn',
    index: 6,
    kicker: '06 · Saturn',
    title: 'Sertifikasi & Prestasi',
    type: 'timeline',
    timeline: [
      {
        period: 'Feb 2024 · Educative',
        title: 'Web Development Interview Handbook',
        description: 'Credential ID: vgA3wPF4zZ683Eo2MtwnDREx13XMCl · Arsitektur web full-stack & sistem modern.',
      },
      {
        period: 'Agu 2023 · Educative',
        title: 'Intermediate Redux with Redux Toolkit',
        description: 'Credential ID: XMP98LjkmG9Ckq7XD8KjYVIrGBJQOA3VyFL · Manajemen state aplikasi skala besar.',
      },
      {
        period: 'Feb 2024 · HackerRank',
        title: 'JavaScript, Python & SQL (Basic) Certificates',
        description: 'Credential IDs: 74b0eef3c8d0 (JS) · fc6dd26fc2b4 (Python) · 50fec8da6982 (SQL).',
      },
      {
        period: 'Des 2023 · HackerRank',
        title: 'Problem Solving (Basic) Certificate',
        description: 'Credential ID: 7522124f4c84 · Algoritma, struktur data, dan pemecahan masalah komputasional.',
      },
      {
        period: '2023 · Kompetisi Nasional',
        title: 'Peringkat 59 dari 120 Tim Peserta Nasional',
        description: 'Lomba Pengembangan Sistem OCR untuk Deteksi Plat Nomor Kendaraan Indonesia (F1-Score 79%).',
      },
    ],
  },

  uranus: {
    id: 'uranus',
    index: 7,
    kicker: '07 · Uranus',
    title: 'Minat & Hobi',
    type: 'interests',
    paragraphs: [
      'Fokus eksplorasi saya berpusat pada perancangan alur kerja agen AI, optimasi performa web, serta eksperimen visual yang memadukan estetika dengan efisiensi sistem.',
    ],
    chips: [
      'Full Stack Architecture',
      'Natural Language Processing',
      'Agentic AI Composition',
      'WebGL & 3D Web',
      'Web Performance Tuning',
    ],
  },

  neptune: {
    id: 'neptune',
    index: 8,
    kicker: '08 · Neptune',
    title: 'Kontak',
    type: 'contact',
    paragraphs: [
      'Anda telah tiba di orbit terjauh observatorium ini. Mari berkolaborasi untuk membangun aplikasi web skala penuh, integrasi sistem, atau solusi cerdas berbasis AI.',
    ],
    links: [
      {
        label: 'nicholas.ivan.christ@gmail.com',
        href: 'mailto:nicholas.ivan.christ@gmail.com',
      },
      {
        label: 'github.com/KeisezrG0103',
        href: 'https://github.com/KeisezrG0103',
      },
      {
        label: 'linkedin.com/in/nicholas-ivan-christiaffri-wibowo',
        href: 'https://linkedin.com/in/nicholas-ivan-christiaffri-wibowo',
      }, {
        label: 'leetcode.com/u/KeisezrG0103',
        href: 'https://leetcode.com/u/KeisezrG0103',
      }
    ],
  },
};

export function getContentByIndex(index) {
  const keys = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
  if (!index || index < 1 || index > keys.length) return null;
  return CONTENT[keys[index - 1]];
}
