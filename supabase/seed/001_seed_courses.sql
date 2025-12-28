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
-- Duration: 1:42:05 (6125 seconds), Video ID: 5inp6y66ic
(
  'dv-lottery-green-card',
  'DV Lottery Visa (Green Card)',
  'Panduan lengkap memenangkan DV Lottery dan persiapan interview dari pemenang langsung. Pelajari strategi, tips, dan pengalaman nyata bekerja sebagai Jr. Executive Sous Chef di Sofitel New York, USA.',
  149000,
  299000,
  'https://gwdtwvoykaznscrisyry.supabase.co/storage/v1/object/public/course-assets/dv-lottery-green-card.jpg',
  'hu02uiarql',
  'Teddy Cahyadi',
  'DV Lottery Winner & Jr. Executive Sous Chef',
  'Pemula',
  'Imigrasi & Visa',
  102,
  10,
  true,
  true,
  1,
  '{
    "sections": [
      {
        "id": "01",
        "title": "Pengenalan DV Lottery",
        "lessons": [
          {"title": "Selamat Datang di Kursus", "duration": "10:12", "videoId": "5inp6y66ic", "isFree": true, "startTime": 0},
          {"title": "Apa itu DV Lottery?", "duration": "10:12", "videoId": "5inp6y66ic", "isFree": true, "startTime": 612},
          {"title": "Syarat & Kelayakan", "duration": "10:12", "videoId": "5inp6y66ic", "isFree": false, "startTime": 1224}
        ]
      },
      {
        "id": "02",
        "title": "Proses Pendaftaran",
        "lessons": [
          {"title": "Persiapan Dokumen & Foto", "duration": "10:12", "videoId": "5inp6y66ic", "isFree": false, "startTime": 1836},
          {"title": "Mengisi Formulir Entry", "duration": "10:12", "videoId": "5inp6y66ic", "isFree": false, "startTime": 2448},
          {"title": "Tips Meningkatkan Peluang", "duration": "10:12", "videoId": "5inp6y66ic", "isFree": false, "startTime": 3060}
        ]
      },
      {
        "id": "03",
        "title": "Setelah Menang & Interview",
        "lessons": [
          {"title": "Form DS-260 & Dokumen", "duration": "10:12", "videoId": "5inp6y66ic", "isFree": false, "startTime": 3672},
          {"title": "Persiapan Interview Konsulat", "duration": "10:12", "videoId": "5inp6y66ic", "isFree": false, "startTime": 4284},
          {"title": "Medical Exam & Vaksinasi", "duration": "10:12", "videoId": "5inp6y66ic", "isFree": false, "startTime": 4896},
          {"title": "Penutup & Next Steps", "duration": "10:29", "videoId": "5inp6y66ic", "isFree": false, "startTime": 5508}
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
      "10 video pelajaran",
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
-- Duration: 1:08:38 (4118 seconds), Video ID: mtakj95z0k
(
  'tourist-visa-b2',
  'Tourist Visa (B-2)',
  'Panduan lengkap mengurus Tourist Visa ke Amerika. Pelajari cara aplikasi, tips interview, dan explore destinasi wisata populer di USA dari pengalaman nyata.',
  99000,
  199000,
  'https://gwdtwvoykaznscrisyry.supabase.co/storage/v1/object/public/course-assets/tourist-visa-b2.jpg',
  'mtakj95z0k',
  'Riko Nugraha',
  'Travel Enthusiast & Visa Consultant',
  'Pemula',
  'Visa & Travel',
  69,
  8,
  true,
  false,
  2,
  '{
    "sections": [
      {
        "id": "01",
        "title": "Pengenalan Tourist Visa",
        "lessons": [
          {"title": "Welcome & Apa itu B1/B2 Visa?", "duration": "8:35", "videoId": "mtakj95z0k", "isFree": true, "startTime": 0},
          {"title": "Persyaratan & Biaya", "duration": "8:35", "videoId": "mtakj95z0k", "isFree": true, "startTime": 515}
        ]
      },
      {
        "id": "02",
        "title": "Persiapan Dokumen & DS-160",
        "lessons": [
          {"title": "Checklist Dokumen Lengkap", "duration": "8:35", "videoId": "mtakj95z0k", "isFree": false, "startTime": 1030},
          {"title": "Bukti Finansial & Sponsor", "duration": "8:35", "videoId": "mtakj95z0k", "isFree": false, "startTime": 1545},
          {"title": "Mengisi Form DS-160", "duration": "8:35", "videoId": "mtakj95z0k", "isFree": false, "startTime": 2060}
        ]
      },
      {
        "id": "03",
        "title": "Interview Konsulat",
        "lessons": [
          {"title": "Persiapan Interview", "duration": "8:35", "videoId": "mtakj95z0k", "isFree": false, "startTime": 2575},
          {"title": "Pertanyaan Umum & Jawaban", "duration": "8:35", "videoId": "mtakj95z0k", "isFree": false, "startTime": 3090},
          {"title": "Tips Sukses & Penutup", "duration": "8:38", "videoId": "mtakj95z0k", "isFree": false, "startTime": 3605}
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
      "8 video pelajaran",
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
-- Duration: 1:06:51 (4011 seconds), Video ID: 5pb0c21duu
(
  'j1-visa-fullbright',
  'J1 Visa (Exchange Visitor Visa) : Penerima Beasiswa Fullbright',
  'Strategi mendapatkan beasiswa Fullbright untuk program Master di universitas top Amerika. Pengalaman kuliah di Rutgers University dan tips aplikasi beasiswa.',
  99000,
  199000,
  'https://gwdtwvoykaznscrisyry.supabase.co/storage/v1/object/public/course-assets/j1-visa-fullbright.jpg',
  '5pb0c21duu',
  'Mutiara Indah Puspita Sari, S.Ars',
  'Fullbright Scholar & Master Student at Rutgers',
  'Menengah',
  'Beasiswa & Pendidikan',
  67,
  8,
  true,
  true,
  3,
  '{
    "sections": [
      {
        "id": "01",
        "title": "Pengenalan Fullbright",
        "lessons": [
          {"title": "Apa itu Beasiswa Fullbright?", "duration": "8:21", "videoId": "5pb0c21duu", "isFree": true, "startTime": 0},
          {"title": "Jenis Program & Timeline", "duration": "8:21", "videoId": "5pb0c21duu", "isFree": true, "startTime": 501}
        ]
      },
      {
        "id": "02",
        "title": "Persiapan Aplikasi",
        "lessons": [
          {"title": "Persyaratan & Dokumen", "duration": "8:21", "videoId": "5pb0c21duu", "isFree": false, "startTime": 1002},
          {"title": "Memilih Universitas & TOEFL", "duration": "8:21", "videoId": "5pb0c21duu", "isFree": false, "startTime": 1503}
        ]
      },
      {
        "id": "03",
        "title": "Essay & Statement of Purpose",
        "lessons": [
          {"title": "Menulis Essay yang Kuat", "duration": "8:21", "videoId": "5pb0c21duu", "isFree": false, "startTime": 2004},
          {"title": "Recommendation Letters", "duration": "8:21", "videoId": "5pb0c21duu", "isFree": false, "startTime": 2505}
        ]
      },
      {
        "id": "04",
        "title": "Interview Preparation",
        "lessons": [
          {"title": "Persiapan Interview", "duration": "8:21", "videoId": "5pb0c21duu", "isFree": false, "startTime": 3006},
          {"title": "Mock Interview & Penutup", "duration": "8:45", "videoId": "5pb0c21duu", "isFree": false, "startTime": 3507}
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
      "8 video pelajaran",
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
-- Duration: 55:40 (3340 seconds), Video ID: v7fd4wxbb5
(
  'j1-visa-au-pair',
  'Visa Au Pair J1 (Exchange Visitor Visa) : Bekerja Sebagai Au Pair di Amerika',
  'Panduan lengkap program Au Pair untuk bekerja dan tinggal di Amerika. Pelajari proses aplikasi, kehidupan sebagai Au Pair, dan pengalaman nyata di USA.',
  99000,
  199000,
  'https://gwdtwvoykaznscrisyry.supabase.co/storage/v1/object/public/course-assets/j1-visa-au-pair.jpg',
  'v7fd4wxbb5',
  'Miftakhul Ma''rifah, S.Pd',
  'Former Au Pair & Education Specialist',
  'Pemula',
  'Work & Cultural Exchange',
  56,
  7,
  true,
  false,
  4,
  '{
    "sections": [
      {
        "id": "01",
        "title": "Introduction to Au Pair Program",
        "lessons": [
          {"title": "Apa itu Program Au Pair?", "duration": "7:57", "videoId": "v7fd4wxbb5", "isFree": true, "startTime": 0},
          {"title": "Persyaratan & Timeline", "duration": "7:57", "videoId": "v7fd4wxbb5", "isFree": true, "startTime": 477}
        ]
      },
      {
        "id": "02",
        "title": "Memilih Agency & Aplikasi",
        "lessons": [
          {"title": "Agency & Proses Aplikasi", "duration": "7:57", "videoId": "v7fd4wxbb5", "isFree": false, "startTime": 954},
          {"title": "Membuat Profile Menarik", "duration": "7:57", "videoId": "v7fd4wxbb5", "isFree": false, "startTime": 1431}
        ]
      },
      {
        "id": "03",
        "title": "Host Family & Visa",
        "lessons": [
          {"title": "Interview dengan Host Family", "duration": "7:57", "videoId": "v7fd4wxbb5", "isFree": false, "startTime": 1908},
          {"title": "Proses Visa J1", "duration": "7:57", "videoId": "v7fd4wxbb5", "isFree": false, "startTime": 2385},
          {"title": "Life as Au Pair & Penutup", "duration": "7:55", "videoId": "v7fd4wxbb5", "isFree": false, "startTime": 2862}
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
      "7 video pelajaran",
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
-- Duration: 59:31 (3571 seconds), Video ID: vlfwvsrsrr
(
  'j1-visa-line-cook',
  'J1 Visa (Work & Travel / Intern / Trainee) : Kerja Sebagai Line Cook di Hotel New York',
  'Membangun karir di industri kuliner dan hospitality New York. Pengalaman bekerja sebagai Hotel Line Cook dan tips masuk industri restoran Amerika.',
  99000,
  199000,
  'https://gwdtwvoykaznscrisyry.supabase.co/storage/v1/object/public/course-assets/j1-visa-line-cook.jpg',
  'vlfwvsrsrr',
  'Marcello Josua S',
  'Hotel Line Cook at NYC',
  'Menengah',
  'Career & Hospitality',
  60,
  7,
  true,
  false,
  5,
  '{
    "sections": [
      {
        "id": "01",
        "title": "Introduction to Hospitality Career",
        "lessons": [
          {"title": "Overview Industri Kuliner Amerika", "duration": "8:30", "videoId": "vlfwvsrsrr", "isFree": true, "startTime": 0},
          {"title": "Jenis Pekerjaan & Salary", "duration": "8:30", "videoId": "vlfwvsrsrr", "isFree": true, "startTime": 510}
        ]
      },
      {
        "id": "02",
        "title": "J1 Visa untuk Culinary",
        "lessons": [
          {"title": "Program J1 & Sponsor", "duration": "8:30", "videoId": "vlfwvsrsrr", "isFree": false, "startTime": 1020},
          {"title": "Persyaratan & Timeline", "duration": "8:30", "videoId": "vlfwvsrsrr", "isFree": false, "startTime": 1530}
        ]
      },
      {
        "id": "03",
        "title": "Job Hunting & Interview",
        "lessons": [
          {"title": "Mencari Host Company", "duration": "8:30", "videoId": "vlfwvsrsrr", "isFree": false, "startTime": 2040},
          {"title": "Resume & Interview Tips", "duration": "8:30", "videoId": "vlfwvsrsrr", "isFree": false, "startTime": 2550},
          {"title": "Working in Kitchen & Penutup", "duration": "8:31", "videoId": "vlfwvsrsrr", "isFree": false, "startTime": 3060}
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
      "7 video pelajaran",
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
-- Duration: 50:52 (3052 seconds), Video ID: dwgyj4f0qe
(
  'j1-visa-accountant',
  'J1 Visa (Intern/Trainee) : Kerja sebagai Accountant di New York Amerika',
  'Panduan membangun karir sebagai Accountant di Amerika melalui J1 Visa. Pengalaman kerja di New Jersey dan tips masuk industri akuntansi USA.',
  99000,
  199000,
  'https://gwdtwvoykaznscrisyry.supabase.co/storage/v1/object/public/course-assets/j1-visa-accountant.jpg',
  'dwgyj4f0qe',
  'Grace Gevani Aritonang, S.Ak',
  'Accountant in New Jersey',
  'Menengah',
  'Career & Finance',
  51,
  6,
  true,
  false,
  6,
  '{
    "sections": [
      {
        "id": "01",
        "title": "Accounting Career Overview",
        "lessons": [
          {"title": "Overview Karir Akuntan di Amerika", "duration": "8:29", "videoId": "dwgyj4f0qe", "isFree": true, "startTime": 0},
          {"title": "J1 Visa & Persyaratan", "duration": "8:29", "videoId": "dwgyj4f0qe", "isFree": true, "startTime": 509}
        ]
      },
      {
        "id": "02",
        "title": "US GAAP & Job Application",
        "lessons": [
          {"title": "US GAAP vs PSAK", "duration": "8:29", "videoId": "dwgyj4f0qe", "isFree": false, "startTime": 1018},
          {"title": "Resume & Job Hunting", "duration": "8:29", "videoId": "dwgyj4f0qe", "isFree": false, "startTime": 1527}
        ]
      },
      {
        "id": "03",
        "title": "Interview & CPA",
        "lessons": [
          {"title": "Interview Preparation", "duration": "8:29", "videoId": "dwgyj4f0qe", "isFree": false, "startTime": 2036},
          {"title": "CPA Pathway & Penutup", "duration": "8:32", "videoId": "dwgyj4f0qe", "isFree": false, "startTime": 2545}
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
      "6 video pelajaran",
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
-- Duration: 1:06:21 (3981 seconds), Video ID: gal6htd0ge
(
  'j1-visa-nyu-lpdp',
  'J1 Visa (Exchange Visitor Visa) : Kuliah di Universitas Swasta Di New York University (LPDP Scholarship)',
  'Strategi mendapatkan beasiswa LPDP untuk kuliah Master di NYU. Pengalaman kuliah Industrial Engineering dan tips aplikasi beasiswa pemerintah Indonesia.',
  99000,
  199000,
  'https://gwdtwvoykaznscrisyry.supabase.co/storage/v1/object/public/course-assets/j1-visa-nyu-lpdp.jpg',
  'gal6htd0ge',
  'Fauzan Rahman',
  'LPDP Scholar & Master Student at NYU',
  'Menengah',
  'Beasiswa & Pendidikan',
  66,
  8,
  true,
  true,
  7,
  '{
    "sections": [
      {
        "id": "01",
        "title": "Pengenalan LPDP",
        "lessons": [
          {"title": "Apa itu LPDP?", "duration": "8:18", "videoId": "gal6htd0ge", "isFree": true, "startTime": 0},
          {"title": "Jenis Beasiswa & Timeline", "duration": "8:18", "videoId": "gal6htd0ge", "isFree": true, "startTime": 498}
        ]
      },
      {
        "id": "02",
        "title": "Memilih Universitas & LoA",
        "lessons": [
          {"title": "Memilih Universitas Target", "duration": "8:18", "videoId": "gal6htd0ge", "isFree": false, "startTime": 996},
          {"title": "Statement of Purpose & LoR", "duration": "8:18", "videoId": "gal6htd0ge", "isFree": false, "startTime": 1494}
        ]
      },
      {
        "id": "03",
        "title": "Aplikasi LPDP",
        "lessons": [
          {"title": "Dokumen & Essay LPDP", "duration": "8:18", "videoId": "gal6htd0ge", "isFree": false, "startTime": 1992},
          {"title": "Tips Essay yang Kuat", "duration": "8:18", "videoId": "gal6htd0ge", "isFree": false, "startTime": 2490}
        ]
      },
      {
        "id": "04",
        "title": "Wawancara & Keberangkatan",
        "lessons": [
          {"title": "Persiapan Wawancara & LGD", "duration": "8:18", "videoId": "gal6htd0ge", "isFree": false, "startTime": 2988},
          {"title": "Visa & Keberangkatan", "duration": "8:33", "videoId": "gal6htd0ge", "isFree": false, "startTime": 3486}
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
      "8 video pelajaran",
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
-- Duration: 1:09:02 (4142 seconds), Video ID: a23hrvv2zg
(
  'f1-visa-student',
  'F1 Visa (Student Visa) : Kuliah di Universitas Negeri di New York, Amerika',
  'Panduan lengkap kuliah S1 di Amerika dengan F1 Visa. Pengalaman di CUNY Baruch College, public university terbaik, dan tips aplikasi universitas USA.',
  99000,
  199000,
  'https://gwdtwvoykaznscrisyry.supabase.co/storage/v1/object/public/course-assets/f1-visa-student.jpg',
  'a23hrvv2zg',
  'Eric Salim Marlie',
  'Undergraduate Student at CUNY Baruch College',
  'Pemula',
  'Pendidikan & Student Life',
  69,
  8,
  true,
  false,
  8,
  '{
    "sections": [
      {
        "id": "01",
        "title": "Planning Your US Education",
        "lessons": [
          {"title": "Kenapa Kuliah di Amerika?", "duration": "8:38", "videoId": "a23hrvv2zg", "isFree": true, "startTime": 0},
          {"title": "Public vs Private University", "duration": "8:38", "videoId": "a23hrvv2zg", "isFree": true, "startTime": 518}
        ]
      },
      {
        "id": "02",
        "title": "Memilih Universitas & Tests",
        "lessons": [
          {"title": "Memilih Program & Universitas", "duration": "8:38", "videoId": "a23hrvv2zg", "isFree": false, "startTime": 1036},
          {"title": "SAT/ACT & TOEFL", "duration": "8:38", "videoId": "a23hrvv2zg", "isFree": false, "startTime": 1554}
        ]
      },
      {
        "id": "03",
        "title": "Application & Financial Aid",
        "lessons": [
          {"title": "Common App & Essay", "duration": "8:38", "videoId": "a23hrvv2zg", "isFree": false, "startTime": 2072},
          {"title": "Financial Aid & Scholarships", "duration": "8:38", "videoId": "a23hrvv2zg", "isFree": false, "startTime": 2590}
        ]
      },
      {
        "id": "04",
        "title": "F1 Visa & Student Life",
        "lessons": [
          {"title": "F1 Visa Process", "duration": "8:38", "videoId": "a23hrvv2zg", "isFree": false, "startTime": 3108},
          {"title": "Student Life & OPT", "duration": "8:34", "videoId": "a23hrvv2zg", "isFree": false, "startTime": 3626}
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
      "8 video pelajaran",
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
-- Duration: 1:14:13 (4453 seconds), Video ID: gzpq5sedf0
(
  'j1-visa-postdoc',
  'J1 Visa (Research/Scholar) : Postdoc Research Fellow di Amerika',
  'Panduan lengkap menempuh PhD dan menjadi Postdoctoral Research Fellow di Amerika. Strategi riset, publikasi, dan membangun karir akademik di USA.',
  99000,
  199000,
  'https://gwdtwvoykaznscrisyry.supabase.co/storage/v1/object/public/course-assets/j1-visa-postdoc.jpg',
  'gzpq5sedf0',
  'Endin Nokik Stuyanna, MD, PhD',
  'Postdoctoral Research Fellow',
  'Lanjutan',
  'Riset & Akademik',
  74,
  9,
  true,
  false,
  9,
  '{
    "sections": [
      {
        "id": "01",
        "title": "Introduction to PhD",
        "lessons": [
          {"title": "PhD di Amerika vs Indonesia", "duration": "8:15", "videoId": "gzpq5sedf0", "isFree": true, "startTime": 0},
          {"title": "Struktur Program & Funding", "duration": "8:15", "videoId": "gzpq5sedf0", "isFree": true, "startTime": 495}
        ]
      },
      {
        "id": "02",
        "title": "PhD Application",
        "lessons": [
          {"title": "Memilih Program & Advisor", "duration": "8:15", "videoId": "gzpq5sedf0", "isFree": false, "startTime": 990},
          {"title": "SOP & CV Akademik", "duration": "8:15", "videoId": "gzpq5sedf0", "isFree": false, "startTime": 1485}
        ]
      },
      {
        "id": "03",
        "title": "Visa & First Year",
        "lessons": [
          {"title": "F1 vs J1 Visa", "duration": "8:15", "videoId": "gzpq5sedf0", "isFree": false, "startTime": 1980},
          {"title": "Coursework & Qualifying Exams", "duration": "8:15", "videoId": "gzpq5sedf0", "isFree": false, "startTime": 2475}
        ]
      },
      {
        "id": "04",
        "title": "Research & Postdoc",
        "lessons": [
          {"title": "Research & Publication", "duration": "8:15", "videoId": "gzpq5sedf0", "isFree": false, "startTime": 2970},
          {"title": "Postdoc Applications", "duration": "8:15", "videoId": "gzpq5sedf0", "isFree": false, "startTime": 3465},
          {"title": "Career Planning & Penutup", "duration": "8:28", "videoId": "gzpq5sedf0", "isFree": false, "startTime": 3960}
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
      "9 video pelajaran",
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
-- Duration: 1:00:42 (3642 seconds), Video ID: 3i1m0738a3
(
  'community-solutions-fellowship',
  'Community Solutions Program: Fellowship di Amerika',
  'Panduan lengkap mendapatkan fellowship Community Solutions Program dari U.S. Department of State. Pengalaman 4 bulan bekerja di NGO Amerika dan membangun jaringan internasional.',
  99000,
  199000,
  'https://gwdtwvoykaznscrisyry.supabase.co/storage/v1/object/public/course-assets/community-solutions-fellowship.jpg',
  '3i1m0738a3',
  'Dinar Pratiwi, S.Sos',
  'Community Solutions Program Fellow',
  'Menengah',
  'Fellowship & Community Development',
  61,
  7,
  true,
  false,
  10,
  '{
    "sections": [
      {
        "id": "01",
        "title": "Pengenalan CSP",
        "lessons": [
          {"title": "Apa itu CSP?", "duration": "8:40", "videoId": "3i1m0738a3", "isFree": true, "startTime": 0},
          {"title": "Benefit & Persyaratan", "duration": "8:40", "videoId": "3i1m0738a3", "isFree": true, "startTime": 520}
        ]
      },
      {
        "id": "02",
        "title": "Menulis Aplikasi",
        "lessons": [
          {"title": "Personal Statement", "duration": "8:40", "videoId": "3i1m0738a3", "isFree": false, "startTime": 1040},
          {"title": "Project Proposal & Resume", "duration": "8:40", "videoId": "3i1m0738a3", "isFree": false, "startTime": 1560}
        ]
      },
      {
        "id": "03",
        "title": "Interview & Fellowship",
        "lessons": [
          {"title": "Persiapan Interview", "duration": "8:40", "videoId": "3i1m0738a3", "isFree": false, "startTime": 2080},
          {"title": "Pengalaman di Amerika", "duration": "8:40", "videoId": "3i1m0738a3", "isFree": false, "startTime": 2600},
          {"title": "Alumni Network & Penutup", "duration": "8:42", "videoId": "3i1m0738a3", "isFree": false, "startTime": 3120}
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
      "7 video pelajaran",
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
-- Total from all 10 courses: 675 min (~11 hours), 78 lessons
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
  675,
  78,
  true,
  true,
  0,
  '{ "sections": [] }',
  '{
    "isBundle": true,
    "features": [
      "Akses ke semua kursus",
      "Total 11+ jam konten video",
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
