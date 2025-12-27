-- Seed: 001_seed_courses
-- Description: Course data for AwalBaru.com (10 courses)
-- Date: 2025-01-01
-- Updated: 2025-12-26
-- Note: Run this after migrations to populate course data
-- IMPORTANT: Replace YOUR_PROJECT_ID with your actual Supabase project ID

-- Placeholder URL format:
-- https://YOUR_PROJECT_ID.supabase.co/storage/v1/object/public/course-assets/[image-name].jpg

INSERT INTO courses (
  slug,
  title,
  short_description,
  price,
  original_price,
  thumbnail_url,
  preview_video_url,
  instructor_name,
  instructor_title,
  level,
  category,
  duration_minutes,
  lessons_count,
  is_published,
  is_featured,
  display_order,
  content,
  metadata
) VALUES

-- Course 1: DV Lottery Visa (Green Card)
(
  'dv-lottery-green-card',
  'DV Lottery Visa (Green Card)',
  'Panduan lengkap memenangkan DV Lottery dan persiapan interview dari pemenang langsung. Pelajari strategi, tips, dan pengalaman nyata bekerja sebagai Jr. Executive Sous Chef di Sofitel New York, USA.',
  149000,
  299000,
  'https://gwdtwvoykaznscrisyry.supabase.co/storage/v1/object/public/course-assets/dv-lottery-green-card.jpg',
  '5inp6y66ic',
  'Teddy Cahyadi',
  'DV Lottery Winner & Jr. Executive Sous Chef',
  'Pemula',
  'Imigrasi & Visa',
  360,
  24,
  true,
  true,
  1,
  '{
    "sections": [
      {
        "id": "01",
        "title": "Pengenalan DV Lottery",
        "lessons": [
          {"title": "Selamat Datang di Kursus", "duration": "3:00", "videoId": "intro1", "isFree": true},
          {"title": "Apa itu DV Lottery?", "duration": "8:00", "videoId": "intro2", "isFree": true},
          {"title": "Syarat & Kelayakan", "duration": "12:00", "videoId": "intro3", "isFree": false},
          {"title": "Timeline & Jadwal Penting", "duration": "7:00", "videoId": "intro4", "isFree": false},
          {"title": "Peluang & Statistik", "duration": "5:00", "videoId": "intro5", "isFree": false}
        ]
      },
      {
        "id": "02",
        "title": "Proses Pendaftaran",
        "lessons": [
          {"title": "Persiapan Dokumen", "duration": "15:00", "videoId": "reg1", "isFree": false},
          {"title": "Foto Requirements", "duration": "10:00", "videoId": "reg2", "isFree": false},
          {"title": "Mengisi Formulir Entry", "duration": "25:00", "videoId": "reg3", "isFree": false},
          {"title": "Tips Meningkatkan Peluang", "duration": "15:00", "videoId": "reg4", "isFree": false},
          {"title": "Common Mistakes to Avoid", "duration": "10:00", "videoId": "reg5", "isFree": false}
        ]
      },
      {
        "id": "03",
        "title": "Setelah Menang",
        "lessons": [
          {"title": "Notifikasi & Confirmation Number", "duration": "8:00", "videoId": "win1", "isFree": false},
          {"title": "Form DS-260 Step by Step", "duration": "20:00", "videoId": "win2", "isFree": false},
          {"title": "Supporting Documents", "duration": "12:00", "videoId": "win3", "isFree": false},
          {"title": "Paying Fees", "duration": "5:00", "videoId": "win4", "isFree": false}
        ]
      },
      {
        "id": "04",
        "title": "Persiapan Interview",
        "lessons": [
          {"title": "Dokumen yang Dibawa ke Konsulat", "duration": "15:00", "videoId": "int1", "isFree": false},
          {"title": "Pertanyaan Interview Umum", "duration": "25:00", "videoId": "int2", "isFree": false},
          {"title": "Tips Menjawab dengan Percaya Diri", "duration": "20:00", "videoId": "int3", "isFree": false},
          {"title": "Dress Code & Etika", "duration": "10:00", "videoId": "int4", "isFree": false},
          {"title": "Simulasi Interview", "duration": "20:00", "videoId": "int5", "isFree": false}
        ]
      },
      {
        "id": "05",
        "title": "Medical Exam & Vaksinasi",
        "lessons": [
          {"title": "Persiapan Medical Exam", "duration": "12:00", "videoId": "med1", "isFree": false},
          {"title": "Vaksinasi yang Diperlukan", "duration": "15:00", "videoId": "med2", "isFree": false},
          {"title": "Biaya dan Prosedur", "duration": "13:00", "videoId": "med3", "isFree": false}
        ]
      }
    ]
  }',
  '{
    "whatYouWillLearn": [
      "Memahami syarat kelayakan DV Lottery secara detail",
      "Mengisi formulir DS-260 dengan benar dan lengkap",
      "Tips meningkatkan peluang menang DV Lottery",
      "Persiapan dokumen untuk interview konsulat",
      "Teknik menjawab pertanyaan interview dengan percaya diri",
      "Memahami proses medical exam dan vaksinasi",
      "Langkah-langkah setelah mendapat approval visa",
      "Cara menghindari kesalahan umum yang sering terjadi"
    ],
    "features": [
      "Akses 12 bulan",
      "24 video pelajaran",
      "Akses komunitas eksklusif",
      "Update materi gratis"
    ],
    "tags": ["best-seller", "populer"],
    "stats": {
      "students": 1250,
      "rating": 4.9,
      "reviews": 342
    }
  }'
),

-- Course 2: Tourist Visa (B-2)
(
  'tourist-visa-b2',
  'Tourist Visa (B-2)',
  'Panduan lengkap mengurus Tourist Visa ke Amerika. Pelajari cara aplikasi, tips interview, dan explore destinasi wisata populer di USA dari pengalaman nyata.',
  99000,
  199000,
  'https://gwdtwvoykaznscrisyry.supabase.co/storage/v1/object/public/course-assets/tourist-visa-b2.jpg',
  'tourist123preview',
  'Riko Nugraha',
  'Travel Enthusiast & Visa Consultant',
  'Pemula',
  'Visa & Travel',
  180,
  15,
  true,
  false,
  2,
  '{
    "sections": [
      {
        "id": "01",
        "title": "Pengenalan Tourist Visa",
        "lessons": [
          {"title": "Welcome & Course Overview", "duration": "3:00", "videoId": "tv1", "isFree": true},
          {"title": "Apa itu B1/B2 Visa?", "duration": "8:00", "videoId": "tv2", "isFree": true},
          {"title": "Siapa yang Perlu Tourist Visa?", "duration": "7:00", "videoId": "tv3", "isFree": false},
          {"title": "Biaya dan Timeline", "duration": "7:00", "videoId": "tv4", "isFree": false}
        ]
      },
      {
        "id": "02",
        "title": "Persiapan Dokumen",
        "lessons": [
          {"title": "Checklist Dokumen Lengkap", "duration": "10:00", "videoId": "tv5", "isFree": false},
          {"title": "Bukti Finansial yang Kuat", "duration": "12:00", "videoId": "tv6", "isFree": false},
          {"title": "Surat Sponsor (jika ada)", "duration": "8:00", "videoId": "tv7", "isFree": false},
          {"title": "Itinerary dan Booking", "duration": "15:00", "videoId": "tv8", "isFree": false}
        ]
      },
      {
        "id": "03",
        "title": "Mengisi Form DS-160",
        "lessons": [
          {"title": "Cara Akses Form DS-160", "duration": "5:00", "videoId": "tv9", "isFree": false},
          {"title": "Step by Step Mengisi Form", "duration": "30:00", "videoId": "tv10", "isFree": false},
          {"title": "Upload Foto yang Benar", "duration": "10:00", "videoId": "tv11", "isFree": false}
        ]
      },
      {
        "id": "04",
        "title": "Interview Konsulat",
        "lessons": [
          {"title": "Persiapan Sebelum Interview", "duration": "12:00", "videoId": "tv12", "isFree": false},
          {"title": "Pertanyaan Umum & Jawaban", "duration": "20:00", "videoId": "tv13", "isFree": false},
          {"title": "Tips Sukses Interview", "duration": "8:00", "videoId": "tv14", "isFree": false}
        ]
      }
    ]
  }',
  '{
    "whatYouWillLearn": [
      "Memahami jenis visa turis Amerika",
      "Mengisi formulir DS-160 dengan benar",
      "Persiapan dokumen yang lengkap",
      "Tips menjawab pertanyaan interview dengan percaya diri"
    ],
    "features": [
      "Akses 12 bulan",
      "15 video pelajaran",
      "Template dokumen",
      "Update materi gratis"
    ],
    "tags": [],
    "stats": {
      "students": 850,
      "rating": 4.8,
      "reviews": 156
    }
  }'
),

-- Course 3: J1 Visa - Fullbright
(
  'j1-visa-fullbright',
  'J1 Visa (Exchange Visitor Visa) : Penerima Beasiswa Fullbright',
  'Strategi mendapatkan beasiswa Fullbright untuk program Master di universitas top Amerika. Pengalaman kuliah di Rutgers University dan tips aplikasi beasiswa.',
  99000,
  199000,
  'https://gwdtwvoykaznscrisyry.supabase.co/storage/v1/object/public/course-assets/j1-visa-fullbright.jpg',
  'fullbright123preview',
  'Mutiara Indah Puspita Sari, S.Ars',
  'Fullbright Scholar & Master Student at Rutgers',
  'Menengah',
  'Beasiswa & Pendidikan',
  480,
  32,
  true,
  true,
  3,
  '{
    "sections": [
      {
        "id": "01",
        "title": "Pengenalan Fullbright",
        "lessons": [
          {"title": "Apa itu Beasiswa Fullbright?", "duration": "10:00", "videoId": "fb1", "isFree": true},
          {"title": "Jenis Program Fullbright", "duration": "12:00", "videoId": "fb2", "isFree": true},
          {"title": "Timeline Aplikasi", "duration": "8:00", "videoId": "fb3", "isFree": false},
          {"title": "Kisah Sukses Alumni", "duration": "10:00", "videoId": "fb4", "isFree": false}
        ]
      },
      {
        "id": "02",
        "title": "Persiapan Aplikasi",
        "lessons": [
          {"title": "Persyaratan Akademis", "duration": "15:00", "videoId": "fb5", "isFree": false},
          {"title": "Checklist Dokumen", "duration": "12:00", "videoId": "fb6", "isFree": false},
          {"title": "Memilih Universitas Target", "duration": "18:00", "videoId": "fb7", "isFree": false},
          {"title": "TOEFL/IELTS Preparation", "duration": "15:00", "videoId": "fb8", "isFree": false}
        ]
      },
      {
        "id": "03",
        "title": "Essay & Statement of Purpose",
        "lessons": [
          {"title": "Struktur Essay yang Baik", "duration": "20:00", "videoId": "fb9", "isFree": false},
          {"title": "Tips Menulis Statement of Purpose", "duration": "25:00", "videoId": "fb10", "isFree": false},
          {"title": "Study Objectives yang Kuat", "duration": "20:00", "videoId": "fb11", "isFree": false},
          {"title": "Review & Editing", "duration": "15:00", "videoId": "fb12", "isFree": false}
        ]
      },
      {
        "id": "04",
        "title": "Letter of Recommendation",
        "lessons": [
          {"title": "Memilih Recommender", "duration": "12:00", "videoId": "fb13", "isFree": false},
          {"title": "Briefing Recommender", "duration": "10:00", "videoId": "fb14", "isFree": false},
          {"title": "Follow-up yang Sopan", "duration": "8:00", "videoId": "fb15", "isFree": false}
        ]
      },
      {
        "id": "05",
        "title": "Interview Preparation",
        "lessons": [
          {"title": "Format Interview Fullbright", "duration": "15:00", "videoId": "fb16", "isFree": false},
          {"title": "Pertanyaan Umum", "duration": "20:00", "videoId": "fb17", "isFree": false},
          {"title": "Mock Interview", "duration": "25:00", "videoId": "fb18", "isFree": false},
          {"title": "Tips Pasca Interview", "duration": "10:00", "videoId": "fb19", "isFree": false}
        ]
      }
    ]
  }',
  '{
    "whatYouWillLearn": [
      "Memahami program beasiswa Fullbright",
      "Menyiapkan dokumen aplikasi yang lengkap",
      "Menulis essay dan statement of purpose yang menarik",
      "Strategi memilih universitas target",
      "Teknik interview yang efektif"
    ],
    "features": [
      "Akses 12 bulan",
      "32 video pelajaran",
      "Template essay",
      "Update materi gratis"
    ],
    "tags": ["populer"],
    "stats": {
      "students": 620,
      "rating": 4.9,
      "reviews": 218
    }
  }'
),

-- Course 4: J1 Visa - Au Pair
(
  'j1-visa-au-pair',
  'Visa Au Pair J1 (Exchange Visitor Visa) : Bekerja Sebagai Au Pair di Amerika',
  'Panduan lengkap program Au Pair untuk bekerja dan tinggal di Amerika. Pelajari proses aplikasi, kehidupan sebagai Au Pair, dan pengalaman nyata di USA.',
  99000,
  199000,
  'https://gwdtwvoykaznscrisyry.supabase.co/storage/v1/object/public/course-assets/j1-visa-au-pair.jpg',
  'aupair123preview',
  'Miftakhul Ma''rifah, S.Pd',
  'Former Au Pair & Education Specialist',
  'Pemula',
  'Work & Cultural Exchange',
  300,
  20,
  true,
  false,
  4,
  '{
    "sections": [
      {
        "id": "01",
        "title": "Introduction to Au Pair Program",
        "lessons": [
          {"title": "Apa itu Program Au Pair?", "duration": "8:00", "videoId": "ap1", "isFree": true},
          {"title": "Benefit Menjadi Au Pair", "duration": "10:00", "videoId": "ap2", "isFree": true},
          {"title": "Persyaratan Dasar", "duration": "12:00", "videoId": "ap3", "isFree": false},
          {"title": "Timeline Program", "duration": "5:00", "videoId": "ap4", "isFree": false}
        ]
      },
      {
        "id": "02",
        "title": "Memilih Agency & Aplikasi",
        "lessons": [
          {"title": "List Agency Terpercaya", "duration": "15:00", "videoId": "ap5", "isFree": false},
          {"title": "Proses Aplikasi Online", "duration": "20:00", "videoId": "ap6", "isFree": false},
          {"title": "Membuat Profile yang Menarik", "duration": "18:00", "videoId": "ap7", "isFree": false},
          {"title": "Video Introduction Tips", "duration": "12:00", "videoId": "ap8", "isFree": false}
        ]
      },
      {
        "id": "03",
        "title": "Matching dengan Host Family",
        "lessons": [
          {"title": "Interview dengan Host Family", "duration": "20:00", "videoId": "ap9", "isFree": false},
          {"title": "Pertanyaan yang Harus Ditanyakan", "duration": "15:00", "videoId": "ap10", "isFree": false},
          {"title": "Red Flags yang Perlu Diwaspadai", "duration": "12:00", "videoId": "ap11", "isFree": false},
          {"title": "Membuat Keputusan Final", "duration": "10:00", "videoId": "ap12", "isFree": false}
        ]
      },
      {
        "id": "04",
        "title": "J1 Visa & Pre-Departure",
        "lessons": [
          {"title": "Proses Visa J1", "duration": "15:00", "videoId": "ap13", "isFree": false},
          {"title": "Dokumen yang Diperlukan", "duration": "12:00", "videoId": "ap14", "isFree": false},
          {"title": "Persiapan Keberangkatan", "duration": "10:00", "videoId": "ap15", "isFree": false}
        ]
      },
      {
        "id": "05",
        "title": "Life as an Au Pair",
        "lessons": [
          {"title": "Adaptasi dengan Host Family", "duration": "15:00", "videoId": "ap16", "isFree": false},
          {"title": "Mengurus Anak di Amerika", "duration": "18:00", "videoId": "ap17", "isFree": false},
          {"title": "Hak dan Kewajiban Au Pair", "duration": "12:00", "videoId": "ap18", "isFree": false},
          {"title": "Mengatasi Tantangan", "duration": "10:00", "videoId": "ap19", "isFree": false},
          {"title": "Extend atau Pulang?", "duration": "8:00", "videoId": "ap20", "isFree": false}
        ]
      }
    ]
  }',
  '{
    "whatYouWillLearn": [
      "Memahami program Au Pair dari A-Z",
      "Memilih agency yang terpercaya",
      "Tips interview dengan host family",
      "Proses visa J1 untuk Au Pair",
      "Kehidupan sehari-hari sebagai Au Pair"
    ],
    "features": [
      "Akses 12 bulan",
      "20 video pelajaran",
      "Template aplikasi",
      "Update materi gratis"
    ],
    "tags": [],
    "stats": {
      "students": 480,
      "rating": 4.7,
      "reviews": 189
    }
  }'
),

-- Course 5: J1 Visa - Line Cook
(
  'j1-visa-line-cook',
  'J1 Visa (Work & Travel / Intern / Trainee) : Kerja Sebagai Line Cook di Hotel New York',
  'Membangun karir di industri kuliner dan hospitality New York. Pengalaman bekerja sebagai Hotel Line Cook dan tips masuk industri restoran Amerika.',
  99000,
  199000,
  'https://gwdtwvoykaznscrisyry.supabase.co/storage/v1/object/public/course-assets/j1-visa-line-cook.jpg',
  'linecook123preview',
  'Marcello Josua S',
  'Hotel Line Cook at NYC',
  'Menengah',
  'Career & Hospitality',
  360,
  25,
  true,
  false,
  5,
  '{
    "sections": [
      {
        "id": "01",
        "title": "Introduction to Hospitality Career in USA",
        "lessons": [
          {"title": "Overview Industri Kuliner Amerika", "duration": "10:00", "videoId": "lc1", "isFree": true},
          {"title": "Jenis Pekerjaan yang Tersedia", "duration": "12:00", "videoId": "lc2", "isFree": true},
          {"title": "Salary & Benefits", "duration": "8:00", "videoId": "lc3", "isFree": false}
        ]
      },
      {
        "id": "02",
        "title": "J1 Visa untuk Culinary",
        "lessons": [
          {"title": "Program J1 Trainee vs Intern", "duration": "15:00", "videoId": "lc4", "isFree": false},
          {"title": "Sponsor Organizations", "duration": "12:00", "videoId": "lc5", "isFree": false},
          {"title": "Timeline dan Biaya", "duration": "10:00", "videoId": "lc6", "isFree": false},
          {"title": "Persyaratan Lengkap", "duration": "15:00", "videoId": "lc7", "isFree": false}
        ]
      },
      {
        "id": "03",
        "title": "Job Hunting di USA",
        "lessons": [
          {"title": "Mencari Host Company", "duration": "18:00", "videoId": "lc8", "isFree": false},
          {"title": "Resume Format Amerika", "duration": "15:00", "videoId": "lc9", "isFree": false},
          {"title": "Cover Letter yang Efektif", "duration": "12:00", "videoId": "lc10", "isFree": false},
          {"title": "LinkedIn Optimization", "duration": "10:00", "videoId": "lc11", "isFree": false}
        ]
      },
      {
        "id": "04",
        "title": "Interview & Onboarding",
        "lessons": [
          {"title": "Tips Interview Online", "duration": "15:00", "videoId": "lc12", "isFree": false},
          {"title": "Pertanyaan Umum Interview", "duration": "20:00", "videoId": "lc13", "isFree": false},
          {"title": "Negosiasi & Kontrak", "duration": "12:00", "videoId": "lc14", "isFree": false}
        ]
      },
      {
        "id": "05",
        "title": "Working in Professional Kitchen",
        "lessons": [
          {"title": "Kitchen Hierarchy & Culture", "duration": "15:00", "videoId": "lc15", "isFree": false},
          {"title": "Food Safety Standards", "duration": "18:00", "videoId": "lc16", "isFree": false},
          {"title": "Communication in Kitchen", "duration": "12:00", "videoId": "lc17", "isFree": false},
          {"title": "Career Progression", "duration": "15:00", "videoId": "lc18", "isFree": false}
        ]
      }
    ]
  }',
  '{
    "whatYouWillLearn": [
      "Memahami industri kuliner Amerika",
      "Proses J1 Visa untuk hospitality",
      "Strategi mencari host company",
      "Tips interview yang efektif",
      "Bekerja di professional kitchen"
    ],
    "features": [
      "Akses 12 bulan",
      "25 video pelajaran",
      "Template resume",
      "Update materi gratis"
    ],
    "tags": [],
    "stats": {
      "students": 380,
      "rating": 4.8,
      "reviews": 167
    }
  }'
),

-- Course 6: J1 Visa - Accountant
(
  'j1-visa-accountant',
  'J1 Visa (Intern/Trainee) : Kerja sebagai Accountant di New York Amerika',
  'Panduan membangun karir sebagai Accountant di Amerika melalui J1 Visa. Pengalaman kerja di New Jersey dan tips masuk industri akuntansi USA.',
  99000,
  199000,
  'https://gwdtwvoykaznscrisyry.supabase.co/storage/v1/object/public/course-assets/j1-visa-accountant.jpg',
  'accountant123preview',
  'Grace Gevani Aritonang, S.Ak',
  'Accountant in New Jersey',
  'Menengah',
  'Career & Finance',
  420,
  28,
  true,
  false,
  6,
  '{
    "sections": [
      {
        "id": "01",
        "title": "Accounting Career in USA Overview",
        "lessons": [
          {"title": "Overview Karir Akuntan di Amerika", "duration": "10:00", "videoId": "ac1", "isFree": true},
          {"title": "Jenis Perusahaan & Posisi", "duration": "12:00", "videoId": "ac2", "isFree": true},
          {"title": "Salary Expectations", "duration": "8:00", "videoId": "ac3", "isFree": false}
        ]
      },
      {
        "id": "02",
        "title": "J1 Visa untuk Accounting",
        "lessons": [
          {"title": "J1 Trainee Program Explained", "duration": "15:00", "videoId": "ac4", "isFree": false},
          {"title": "Persyaratan dan Timeline", "duration": "12:00", "videoId": "ac5", "isFree": false},
          {"title": "Memilih Sponsor Organization", "duration": "15:00", "videoId": "ac6", "isFree": false}
        ]
      },
      {
        "id": "03",
        "title": "US GAAP vs Indonesian Standards",
        "lessons": [
          {"title": "Perbedaan Utama GAAP vs PSAK", "duration": "20:00", "videoId": "ac7", "isFree": false},
          {"title": "Financial Statements di Amerika", "duration": "18:00", "videoId": "ac8", "isFree": false},
          {"title": "Software Akuntansi Populer", "duration": "12:00", "videoId": "ac9", "isFree": false}
        ]
      },
      {
        "id": "04",
        "title": "Job Application Strategy",
        "lessons": [
          {"title": "Resume untuk Accounting", "duration": "18:00", "videoId": "ac10", "isFree": false},
          {"title": "LinkedIn & Networking", "duration": "15:00", "videoId": "ac11", "isFree": false},
          {"title": "Job Boards & Recruiters", "duration": "12:00", "videoId": "ac12", "isFree": false},
          {"title": "Cover Letter Tips", "duration": "10:00", "videoId": "ac13", "isFree": false}
        ]
      },
      {
        "id": "05",
        "title": "Interview & Work Preparation",
        "lessons": [
          {"title": "Technical Interview Questions", "duration": "20:00", "videoId": "ac14", "isFree": false},
          {"title": "Behavioral Questions", "duration": "18:00", "videoId": "ac15", "isFree": false},
          {"title": "Case Studies", "duration": "15:00", "videoId": "ac16", "isFree": false}
        ]
      },
      {
        "id": "06",
        "title": "CPA Certification Pathway",
        "lessons": [
          {"title": "Apa itu CPA?", "duration": "12:00", "videoId": "ac17", "isFree": false},
          {"title": "CPA Exam Overview", "duration": "18:00", "videoId": "ac18", "isFree": false},
          {"title": "Study Plan & Resources", "duration": "15:00", "videoId": "ac19", "isFree": false}
        ]
      }
    ]
  }',
  '{
    "whatYouWillLearn": [
      "Memahami karir akuntan di Amerika",
      "Proses J1 Visa untuk accounting",
      "Perbedaan US GAAP vs PSAK",
      "Strategi job hunting yang efektif",
      "Pathway menuju CPA certification"
    ],
    "features": [
      "Akses 12 bulan",
      "28 video pelajaran",
      "Template resume",
      "Update materi gratis"
    ],
    "tags": [],
    "stats": {
      "students": 320,
      "rating": 4.9,
      "reviews": 145
    }
  }'
),

-- Course 7: J1 Visa - NYU LPDP
(
  'j1-visa-nyu-lpdp',
  'J1 Visa (Exchange Visitor Visa) : Kuliah di Universitas Swasta Di New York University (LPDP Scholarship)',
  'Strategi mendapatkan beasiswa LPDP untuk kuliah Master di NYU. Pengalaman kuliah Industrial Engineering dan tips aplikasi beasiswa pemerintah Indonesia.',
  99000,
  199000,
  'https://gwdtwvoykaznscrisyry.supabase.co/storage/v1/object/public/course-assets/j1-visa-nyu-lpdp.jpg',
  'nyulpdp123preview',
  'Fauzan Rahman',
  'LPDP Scholar & Master Student at NYU',
  'Menengah',
  'Beasiswa & Pendidikan',
  480,
  35,
  true,
  true,
  7,
  '{
    "sections": [
      {
        "id": "01",
        "title": "Pengenalan LPDP",
        "lessons": [
          {"title": "Apa itu LPDP?", "duration": "10:00", "videoId": "lpdp1", "isFree": true},
          {"title": "Jenis Beasiswa LPDP", "duration": "12:00", "videoId": "lpdp2", "isFree": true},
          {"title": "Timeline Aplikasi", "duration": "8:00", "videoId": "lpdp3", "isFree": false},
          {"title": "Success Rate & Statistics", "duration": "10:00", "videoId": "lpdp4", "isFree": false}
        ]
      },
      {
        "id": "02",
        "title": "Memilih Universitas & Program",
        "lessons": [
          {"title": "Universitas Top di Amerika", "duration": "15:00", "videoId": "lpdp5", "isFree": false},
          {"title": "Memilih Program yang Tepat", "duration": "18:00", "videoId": "lpdp6", "isFree": false},
          {"title": "Ranking vs Fit", "duration": "12:00", "videoId": "lpdp7", "isFree": false}
        ]
      },
      {
        "id": "03",
        "title": "Mendapatkan Letter of Acceptance",
        "lessons": [
          {"title": "Application Timeline", "duration": "15:00", "videoId": "lpdp8", "isFree": false},
          {"title": "Statement of Purpose", "duration": "25:00", "videoId": "lpdp9", "isFree": false},
          {"title": "Recommendation Letters", "duration": "15:00", "videoId": "lpdp10", "isFree": false},
          {"title": "GRE/GMAT Preparation", "duration": "20:00", "videoId": "lpdp11", "isFree": false}
        ]
      },
      {
        "id": "04",
        "title": "Aplikasi LPDP: Dokumen & Essay",
        "lessons": [
          {"title": "Checklist Dokumen", "duration": "15:00", "videoId": "lpdp12", "isFree": false},
          {"title": "Essay Rencana Studi", "duration": "25:00", "videoId": "lpdp13", "isFree": false},
          {"title": "Essay Kontribusi", "duration": "20:00", "videoId": "lpdp14", "isFree": false},
          {"title": "Tips Menulis Essay yang Kuat", "duration": "18:00", "videoId": "lpdp15", "isFree": false}
        ]
      },
      {
        "id": "05",
        "title": "Wawancara LPDP",
        "lessons": [
          {"title": "Format Wawancara", "duration": "12:00", "videoId": "lpdp16", "isFree": false},
          {"title": "Pertanyaan Umum", "duration": "20:00", "videoId": "lpdp17", "isFree": false},
          {"title": "LGD (Leaderless Group Discussion)", "duration": "18:00", "videoId": "lpdp18", "isFree": false},
          {"title": "Tips Pasca Wawancara", "duration": "10:00", "videoId": "lpdp19", "isFree": false}
        ]
      },
      {
        "id": "06",
        "title": "Setelah Lolos: Persiapan Keberangkatan",
        "lessons": [
          {"title": "Proses Visa F1/J1", "duration": "15:00", "videoId": "lpdp20", "isFree": false},
          {"title": "Mencari Tempat Tinggal", "duration": "12:00", "videoId": "lpdp21", "isFree": false},
          {"title": "Persiapan Finansial", "duration": "10:00", "videoId": "lpdp22", "isFree": false}
        ]
      }
    ]
  }',
  '{
    "whatYouWillLearn": [
      "Memahami beasiswa LPDP secara lengkap",
      "Strategi memilih universitas dan program",
      "Mendapatkan Letter of Acceptance",
      "Menulis essay LPDP yang kuat",
      "Tips wawancara dan LGD"
    ],
    "features": [
      "Akses 12 bulan",
      "35 video pelajaran",
      "Template essay",
      "Update materi gratis"
    ],
    "tags": ["populer"],
    "stats": {
      "students": 520,
      "rating": 4.8,
      "reviews": 203
    }
  }'
),

-- Course 8: F1 Visa - Student
(
  'f1-visa-student',
  'F1 Visa (Student Visa) : Kuliah di Universitas Negeri di New York, Amerika',
  'Panduan lengkap kuliah S1 di Amerika dengan F1 Visa. Pengalaman di CUNY Baruch College, public university terbaik, dan tips aplikasi universitas USA.',
  99000,
  199000,
  'https://gwdtwvoykaznscrisyry.supabase.co/storage/v1/object/public/course-assets/f1-visa-student.jpg',
  'f1student123preview',
  'Eric Salim Marlie',
  'Undergraduate Student at CUNY Baruch College',
  'Pemula',
  'Pendidikan & Student Life',
  360,
  27,
  true,
  false,
  8,
  '{
    "sections": [
      {
        "id": "01",
        "title": "Planning Your US College Education",
        "lessons": [
          {"title": "Kenapa Kuliah di Amerika?", "duration": "10:00", "videoId": "f1s1", "isFree": true},
          {"title": "Public vs Private University", "duration": "12:00", "videoId": "f1s2", "isFree": true},
          {"title": "Biaya Kuliah & Living Cost", "duration": "10:00", "videoId": "f1s3", "isFree": false},
          {"title": "Timeline Persiapan", "duration": "8:00", "videoId": "f1s4", "isFree": false}
        ]
      },
      {
        "id": "02",
        "title": "Choosing Universities",
        "lessons": [
          {"title": "Research Universitas", "duration": "15:00", "videoId": "f1s5", "isFree": false},
          {"title": "Program & Major Selection", "duration": "18:00", "videoId": "f1s6", "isFree": false},
          {"title": "Application Strategy", "duration": "15:00", "videoId": "f1s7", "isFree": false}
        ]
      },
      {
        "id": "03",
        "title": "Standardized Tests",
        "lessons": [
          {"title": "SAT vs ACT", "duration": "12:00", "videoId": "f1s8", "isFree": false},
          {"title": "TOEFL/IELTS Requirements", "duration": "15:00", "videoId": "f1s9", "isFree": false},
          {"title": "Test Preparation Tips", "duration": "18:00", "videoId": "f1s10", "isFree": false}
        ]
      },
      {
        "id": "04",
        "title": "College Application Process",
        "lessons": [
          {"title": "Common App Overview", "duration": "15:00", "videoId": "f1s11", "isFree": false},
          {"title": "Personal Essay Tips", "duration": "25:00", "videoId": "f1s12", "isFree": false},
          {"title": "Recommendation Letters", "duration": "12:00", "videoId": "f1s13", "isFree": false},
          {"title": "Extracurricular Activities", "duration": "10:00", "videoId": "f1s14", "isFree": false}
        ]
      },
      {
        "id": "05",
        "title": "Financial Aid & Scholarships",
        "lessons": [
          {"title": "Types of Financial Aid", "duration": "12:00", "videoId": "f1s15", "isFree": false},
          {"title": "Scholarship Search", "duration": "15:00", "videoId": "f1s16", "isFree": false},
          {"title": "FAFSA & CSS Profile", "duration": "12:00", "videoId": "f1s17", "isFree": false}
        ]
      },
      {
        "id": "06",
        "title": "F1 Visa Process",
        "lessons": [
          {"title": "I-20 Document", "duration": "12:00", "videoId": "f1s18", "isFree": false},
          {"title": "DS-160 Form", "duration": "15:00", "videoId": "f1s19", "isFree": false},
          {"title": "Visa Interview Preparation", "duration": "18:00", "videoId": "f1s20", "isFree": false}
        ]
      },
      {
        "id": "07",
        "title": "Student Life in USA",
        "lessons": [
          {"title": "Campus Life", "duration": "12:00", "videoId": "f1s21", "isFree": false},
          {"title": "Part-time Job Options", "duration": "15:00", "videoId": "f1s22", "isFree": false},
          {"title": "CPT & OPT Explained", "duration": "18:00", "videoId": "f1s23", "isFree": false}
        ]
      }
    ]
  }',
  '{
    "whatYouWillLearn": [
      "Memilih universitas yang tepat",
      "Persiapan standardized tests",
      "Proses aplikasi yang lengkap",
      "Mencari financial aid & scholarships",
      "Proses visa F1"
    ],
    "features": [
      "Akses 12 bulan",
      "27 video pelajaran",
      "Template essay",
      "Update materi gratis"
    ],
    "tags": [],
    "stats": {
      "students": 420,
      "rating": 4.7,
      "reviews": 178
    }
  }'
),

-- Course 9: J1 Visa - Postdoc
(
  'j1-visa-postdoc',
  'J1 Visa (Research/Scholar) : Postdoc Research Fellow di Amerika',
  'Panduan lengkap menempuh PhD dan menjadi Postdoctoral Research Fellow di Amerika. Strategi riset, publikasi, dan membangun karir akademik di USA.',
  99000,
  199000,
  'https://gwdtwvoykaznscrisyry.supabase.co/storage/v1/object/public/course-assets/j1-visa-postdoc.jpg',
  'postdoc123preview',
  'Endin Nokik Stuyanna, MD, PhD',
  'Postdoctoral Research Fellow',
  'Lanjutan',
  'Riset & Akademik',
  600,
  40,
  true,
  false,
  9,
  '{
    "sections": [
      {
        "id": "01",
        "title": "Introduction to PhD in USA",
        "lessons": [
          {"title": "PhD di Amerika vs Indonesia", "duration": "12:00", "videoId": "pd1", "isFree": true},
          {"title": "Struktur Program PhD", "duration": "15:00", "videoId": "pd2", "isFree": true},
          {"title": "Funding & Stipend", "duration": "12:00", "videoId": "pd3", "isFree": false}
        ]
      },
      {
        "id": "02",
        "title": "PhD Application Strategy",
        "lessons": [
          {"title": "Memilih Program & Advisor", "duration": "20:00", "videoId": "pd4", "isFree": false},
          {"title": "Statement of Purpose", "duration": "25:00", "videoId": "pd5", "isFree": false},
          {"title": "CV Akademik", "duration": "15:00", "videoId": "pd6", "isFree": false},
          {"title": "Recommendation Letters", "duration": "15:00", "videoId": "pd7", "isFree": false}
        ]
      },
      {
        "id": "03",
        "title": "Funding Your PhD",
        "lessons": [
          {"title": "Types of Funding", "duration": "15:00", "videoId": "pd8", "isFree": false},
          {"title": "TA/RA Positions", "duration": "12:00", "videoId": "pd9", "isFree": false},
          {"title": "External Fellowships", "duration": "18:00", "videoId": "pd10", "isFree": false}
        ]
      },
      {
        "id": "04",
        "title": "Visa Process: F1 vs J1",
        "lessons": [
          {"title": "F1 Student Visa", "duration": "12:00", "videoId": "pd11", "isFree": false},
          {"title": "J1 Exchange Visitor", "duration": "12:00", "videoId": "pd12", "isFree": false},
          {"title": "Which One to Choose?", "duration": "10:00", "videoId": "pd13", "isFree": false}
        ]
      },
      {
        "id": "05",
        "title": "First Year: Coursework & Rotations",
        "lessons": [
          {"title": "Coursework Requirements", "duration": "15:00", "videoId": "pd14", "isFree": false},
          {"title": "Lab Rotations", "duration": "18:00", "videoId": "pd15", "isFree": false},
          {"title": "Qualifying Exams", "duration": "15:00", "videoId": "pd16", "isFree": false}
        ]
      },
      {
        "id": "06",
        "title": "Research & Dissertation",
        "lessons": [
          {"title": "Choosing Research Topic", "duration": "20:00", "videoId": "pd17", "isFree": false},
          {"title": "Working with Advisor", "duration": "15:00", "videoId": "pd18", "isFree": false},
          {"title": "Writing Dissertation", "duration": "25:00", "videoId": "pd19", "isFree": false},
          {"title": "Defense Preparation", "duration": "20:00", "videoId": "pd20", "isFree": false}
        ]
      },
      {
        "id": "07",
        "title": "Publication Strategy",
        "lessons": [
          {"title": "How to Publish", "duration": "18:00", "videoId": "pd21", "isFree": false},
          {"title": "Choosing Journals", "duration": "15:00", "videoId": "pd22", "isFree": false},
          {"title": "Peer Review Process", "duration": "12:00", "videoId": "pd23", "isFree": false}
        ]
      },
      {
        "id": "08",
        "title": "Teaching Experience",
        "lessons": [
          {"title": "TA Responsibilities", "duration": "12:00", "videoId": "pd24", "isFree": false},
          {"title": "Building Teaching Portfolio", "duration": "15:00", "videoId": "pd25", "isFree": false}
        ]
      },
      {
        "id": "09",
        "title": "Postdoc Applications",
        "lessons": [
          {"title": "When to Apply", "duration": "10:00", "videoId": "pd26", "isFree": false},
          {"title": "Finding Postdoc Positions", "duration": "18:00", "videoId": "pd27", "isFree": false},
          {"title": "Application Materials", "duration": "15:00", "videoId": "pd28", "isFree": false},
          {"title": "Interview Process", "duration": "18:00", "videoId": "pd29", "isFree": false}
        ]
      },
      {
        "id": "10",
        "title": "Career Planning Beyond Postdoc",
        "lessons": [
          {"title": "Academia vs Industry", "duration": "15:00", "videoId": "pd30", "isFree": false},
          {"title": "Faculty Applications", "duration": "20:00", "videoId": "pd31", "isFree": false},
          {"title": "Industry Transition", "duration": "15:00", "videoId": "pd32", "isFree": false}
        ]
      }
    ]
  }',
  '{
    "whatYouWillLearn": [
      "Memahami struktur PhD di Amerika",
      "Strategi aplikasi PhD yang efektif",
      "Funding dan fellowship options",
      "Research dan publication strategy",
      "Postdoc applications dan career planning"
    ],
    "features": [
      "Akses 12 bulan",
      "40 video pelajaran",
      "Template CV akademik",
      "Update materi gratis"
    ],
    "tags": [],
    "stats": {
      "students": 280,
      "rating": 4.9,
      "reviews": 124
    }
  }'
),

-- Course 10: Community Solutions Fellowship
(
  'community-solutions-fellowship',
  'Community Solutions Program: Fellowship di Amerika',
  'Panduan lengkap mendapatkan fellowship Community Solutions Program dari U.S. Department of State. Pengalaman 4 bulan bekerja di NGO Amerika dan membangun jaringan internasional.',
  99000,
  199000,
  'https://gwdtwvoykaznscrisyry.supabase.co/storage/v1/object/public/course-assets/community-solutions-fellowship.jpg',
  'csp123preview',
  'Dinar Pratiwi, S.Sos',
  'Community Solutions Program Fellow',
  'Menengah',
  'Fellowship & Community Development',
  300,
  22,
  true,
  false,
  10,
  '{
    "sections": [
      {
        "id": "01",
        "title": "Pengenalan Community Solutions Program",
        "lessons": [
          {"title": "Apa itu CSP?", "duration": "10:00", "videoId": "csp1", "isFree": true},
          {"title": "Benefit Program", "duration": "12:00", "videoId": "csp2", "isFree": true},
          {"title": "Alumni Success Stories", "duration": "10:00", "videoId": "csp3", "isFree": false}
        ]
      },
      {
        "id": "02",
        "title": "Eligibility dan Persiapan",
        "lessons": [
          {"title": "Persyaratan Aplikasi", "duration": "12:00", "videoId": "csp4", "isFree": false},
          {"title": "Focus Areas Program", "duration": "15:00", "videoId": "csp5", "isFree": false},
          {"title": "Timeline Aplikasi", "duration": "8:00", "videoId": "csp6", "isFree": false}
        ]
      },
      {
        "id": "03",
        "title": "Menulis Aplikasi yang Kuat",
        "lessons": [
          {"title": "Personal Statement", "duration": "20:00", "videoId": "csp7", "isFree": false},
          {"title": "Project Proposal", "duration": "25:00", "videoId": "csp8", "isFree": false},
          {"title": "Resume & CV Tips", "duration": "15:00", "videoId": "csp9", "isFree": false},
          {"title": "Recommendation Letters", "duration": "12:00", "videoId": "csp10", "isFree": false}
        ]
      },
      {
        "id": "04",
        "title": "Persiapan Interview",
        "lessons": [
          {"title": "Format Interview CSP", "duration": "12:00", "videoId": "csp11", "isFree": false},
          {"title": "Pertanyaan Umum", "duration": "18:00", "videoId": "csp12", "isFree": false},
          {"title": "Mock Interview Practice", "duration": "15:00", "videoId": "csp13", "isFree": false}
        ]
      },
      {
        "id": "05",
        "title": "Pengalaman Fellowship di Amerika",
        "lessons": [
          {"title": "Pre-Departure Preparation", "duration": "12:00", "videoId": "csp14", "isFree": false},
          {"title": "Working at US NGO", "duration": "18:00", "videoId": "csp15", "isFree": false},
          {"title": "Networking & Professional Development", "duration": "15:00", "videoId": "csp16", "isFree": false},
          {"title": "Cultural Exchange", "duration": "12:00", "videoId": "csp17", "isFree": false}
        ]
      },
      {
        "id": "06",
        "title": "Pasca-Fellowship dan Alumni Network",
        "lessons": [
          {"title": "Return Project Implementation", "duration": "15:00", "videoId": "csp18", "isFree": false},
          {"title": "Alumni Network Benefits", "duration": "12:00", "videoId": "csp19", "isFree": false},
          {"title": "Continuing Your Impact", "duration": "10:00", "videoId": "csp20", "isFree": false}
        ]
      }
    ]
  }',
  '{
    "whatYouWillLearn": [
      "Memahami Community Solutions Program",
      "Menulis aplikasi yang kuat",
      "Persiapan interview yang efektif",
      "Pengalaman fellowship di Amerika",
      "Membangun jaringan alumni internasional"
    ],
    "features": [
      "Akses 12 bulan",
      "22 video pelajaran",
      "Template aplikasi",
      "Update materi gratis"
    ],
    "tags": [],
    "stats": {
      "students": 350,
      "rating": 4.8,
      "reviews": 134
    }
  }'
),

-- Course 11: Paket Semua Kursus (Bundle - All Courses)
(
  'paket-semua-kursus',
  'Paket Semua Kursus',
  'Akses semua kursus premium dengan satu pembelian. Hemat lebih dari 75%!',
  249000,
  999000,
  'https://gwdtwvoykaznscrisyry.supabase.co/storage/v1/object/public/course-assets/paket-semua-kursus.jpg',
  NULL,
  'AwalBaru.com',
  'Tim AwalBaru',
  'Semua Level',
  'Bundle',
  2400,
  270,
  true,
  true,
  0,
  '{ "sections": [] }',
  '{
    "isBundle": true,
    "features": [
      "Akses ke semua kursus",
      "Total 40+ jam konten video",
      "Akses 12 bulan",
      "Update materi gratis"
    ],
    "stats": {
      "students": 500,
      "rating": 4.9,
      "reviews": 89
    }
  }'
)

ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  short_description = EXCLUDED.short_description,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  thumbnail_url = EXCLUDED.thumbnail_url,
  preview_video_url = EXCLUDED.preview_video_url,
  instructor_name = EXCLUDED.instructor_name,
  instructor_title = EXCLUDED.instructor_title,
  level = EXCLUDED.level,
  category = EXCLUDED.category,
  duration_minutes = EXCLUDED.duration_minutes,
  lessons_count = EXCLUDED.lessons_count,
  is_published = EXCLUDED.is_published,
  is_featured = EXCLUDED.is_featured,
  display_order = EXCLUDED.display_order,
  content = EXCLUDED.content,
  metadata = EXCLUDED.metadata,
  updated_at = now();
