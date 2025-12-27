-- Update all courses with correct Wistia video IDs
-- Each course has unique preview and full video IDs from reference data
-- Run this in Supabase SQL Editor to update existing course data

-- =====================================================
-- COURSE VIDEO ID MAPPING:
-- =====================================================
-- 1. dv-lottery-green-card      | Preview: hu02uiarql | Full: 5inp6y66ic
-- 2. tourist-visa-b2            | Preview: rl4g0kxmzi | Full: mtakj95z0k
-- 3. j1-visa-fullbright         | Preview: anogj1s4s9 | Full: 5pb0c21duu
-- 4. j1-visa-au-pair            | Preview: kq5y10yvic | Full: v7fd4wxbb5
-- 5. j1-visa-line-cook          | Preview: 6fujmfkm1n | Full: vlfwvsrsrr
-- 6. j1-visa-accountant         | Preview: 0sxtqyhxf1 | Full: dwgyj4f0qe
-- 7. j1-visa-nyu-lpdp           | Preview: 6lb1rtyt27 | Full: gal6htd0ge
-- 8. f1-visa-student            | Preview: hsh7vk1m5d | Full: a23hrvv2zg
-- 9. j1-visa-postdoc            | Preview: j5mgirr4gd | Full: gzpq5sedf0
-- 10. community-solutions-fellowship | Preview: qevchmmumy | Full: 3i1m0738a3
-- =====================================================

-- Update preview_video_url for each course
UPDATE courses SET preview_video_url = 'hu02uiarql' WHERE slug = 'dv-lottery-green-card';
UPDATE courses SET preview_video_url = 'rl4g0kxmzi' WHERE slug = 'tourist-visa-b2';
UPDATE courses SET preview_video_url = 'anogj1s4s9' WHERE slug = 'j1-visa-fullbright';
UPDATE courses SET preview_video_url = 'kq5y10yvic' WHERE slug = 'j1-visa-au-pair';
UPDATE courses SET preview_video_url = '6fujmfkm1n' WHERE slug = 'j1-visa-line-cook';
UPDATE courses SET preview_video_url = '0sxtqyhxf1' WHERE slug = 'j1-visa-accountant';
UPDATE courses SET preview_video_url = '6lb1rtyt27' WHERE slug = 'j1-visa-nyu-lpdp';
UPDATE courses SET preview_video_url = 'hsh7vk1m5d' WHERE slug = 'f1-visa-student';
UPDATE courses SET preview_video_url = 'j5mgirr4gd' WHERE slug = 'j1-visa-postdoc';
UPDATE courses SET preview_video_url = 'qevchmmumy' WHERE slug = 'community-solutions-fellowship';

-- Update all videoId fields in content.sections[].lessons[] for each course
-- Using a function to recursively replace all videoId values in JSONB

-- Course 1: dv-lottery-green-card -> 5inp6y66ic
UPDATE courses
SET content = (
  SELECT jsonb_set(
    content,
    '{sections}',
    (
      SELECT jsonb_agg(
        jsonb_set(
          section,
          '{lessons}',
          (
            SELECT jsonb_agg(
              CASE
                WHEN lesson ? 'videoId' THEN jsonb_set(lesson, '{videoId}', '"5inp6y66ic"')
                ELSE lesson
              END
            )
            FROM jsonb_array_elements(section->'lessons') AS lesson
          )
        )
      )
      FROM jsonb_array_elements(content->'sections') AS section
    )
  )
)
WHERE slug = 'dv-lottery-green-card'
  AND content IS NOT NULL
  AND content->'sections' IS NOT NULL;

-- Course 2: tourist-visa-b2 -> mtakj95z0k
UPDATE courses
SET content = (
  SELECT jsonb_set(
    content,
    '{sections}',
    (
      SELECT jsonb_agg(
        jsonb_set(
          section,
          '{lessons}',
          (
            SELECT jsonb_agg(
              CASE
                WHEN lesson ? 'videoId' THEN jsonb_set(lesson, '{videoId}', '"mtakj95z0k"')
                ELSE lesson
              END
            )
            FROM jsonb_array_elements(section->'lessons') AS lesson
          )
        )
      )
      FROM jsonb_array_elements(content->'sections') AS section
    )
  )
)
WHERE slug = 'tourist-visa-b2'
  AND content IS NOT NULL
  AND content->'sections' IS NOT NULL;

-- Course 3: j1-visa-fullbright -> 5pb0c21duu
UPDATE courses
SET content = (
  SELECT jsonb_set(
    content,
    '{sections}',
    (
      SELECT jsonb_agg(
        jsonb_set(
          section,
          '{lessons}',
          (
            SELECT jsonb_agg(
              CASE
                WHEN lesson ? 'videoId' THEN jsonb_set(lesson, '{videoId}', '"5pb0c21duu"')
                ELSE lesson
              END
            )
            FROM jsonb_array_elements(section->'lessons') AS lesson
          )
        )
      )
      FROM jsonb_array_elements(content->'sections') AS section
    )
  )
)
WHERE slug = 'j1-visa-fullbright'
  AND content IS NOT NULL
  AND content->'sections' IS NOT NULL;

-- Course 4: j1-visa-au-pair -> v7fd4wxbb5
UPDATE courses
SET content = (
  SELECT jsonb_set(
    content,
    '{sections}',
    (
      SELECT jsonb_agg(
        jsonb_set(
          section,
          '{lessons}',
          (
            SELECT jsonb_agg(
              CASE
                WHEN lesson ? 'videoId' THEN jsonb_set(lesson, '{videoId}', '"v7fd4wxbb5"')
                ELSE lesson
              END
            )
            FROM jsonb_array_elements(section->'lessons') AS lesson
          )
        )
      )
      FROM jsonb_array_elements(content->'sections') AS section
    )
  )
)
WHERE slug = 'j1-visa-au-pair'
  AND content IS NOT NULL
  AND content->'sections' IS NOT NULL;

-- Course 5: j1-visa-line-cook -> vlfwvsrsrr
UPDATE courses
SET content = (
  SELECT jsonb_set(
    content,
    '{sections}',
    (
      SELECT jsonb_agg(
        jsonb_set(
          section,
          '{lessons}',
          (
            SELECT jsonb_agg(
              CASE
                WHEN lesson ? 'videoId' THEN jsonb_set(lesson, '{videoId}', '"vlfwvsrsrr"')
                ELSE lesson
              END
            )
            FROM jsonb_array_elements(section->'lessons') AS lesson
          )
        )
      )
      FROM jsonb_array_elements(content->'sections') AS section
    )
  )
)
WHERE slug = 'j1-visa-line-cook'
  AND content IS NOT NULL
  AND content->'sections' IS NOT NULL;

-- Course 6: j1-visa-accountant -> dwgyj4f0qe
UPDATE courses
SET content = (
  SELECT jsonb_set(
    content,
    '{sections}',
    (
      SELECT jsonb_agg(
        jsonb_set(
          section,
          '{lessons}',
          (
            SELECT jsonb_agg(
              CASE
                WHEN lesson ? 'videoId' THEN jsonb_set(lesson, '{videoId}', '"dwgyj4f0qe"')
                ELSE lesson
              END
            )
            FROM jsonb_array_elements(section->'lessons') AS lesson
          )
        )
      )
      FROM jsonb_array_elements(content->'sections') AS section
    )
  )
)
WHERE slug = 'j1-visa-accountant'
  AND content IS NOT NULL
  AND content->'sections' IS NOT NULL;

-- Course 7: j1-visa-nyu-lpdp -> gal6htd0ge
UPDATE courses
SET content = (
  SELECT jsonb_set(
    content,
    '{sections}',
    (
      SELECT jsonb_agg(
        jsonb_set(
          section,
          '{lessons}',
          (
            SELECT jsonb_agg(
              CASE
                WHEN lesson ? 'videoId' THEN jsonb_set(lesson, '{videoId}', '"gal6htd0ge"')
                ELSE lesson
              END
            )
            FROM jsonb_array_elements(section->'lessons') AS lesson
          )
        )
      )
      FROM jsonb_array_elements(content->'sections') AS section
    )
  )
)
WHERE slug = 'j1-visa-nyu-lpdp'
  AND content IS NOT NULL
  AND content->'sections' IS NOT NULL;

-- Course 8: f1-visa-student -> a23hrvv2zg
UPDATE courses
SET content = (
  SELECT jsonb_set(
    content,
    '{sections}',
    (
      SELECT jsonb_agg(
        jsonb_set(
          section,
          '{lessons}',
          (
            SELECT jsonb_agg(
              CASE
                WHEN lesson ? 'videoId' THEN jsonb_set(lesson, '{videoId}', '"a23hrvv2zg"')
                ELSE lesson
              END
            )
            FROM jsonb_array_elements(section->'lessons') AS lesson
          )
        )
      )
      FROM jsonb_array_elements(content->'sections') AS section
    )
  )
)
WHERE slug = 'f1-visa-student'
  AND content IS NOT NULL
  AND content->'sections' IS NOT NULL;

-- Course 9: j1-visa-postdoc -> gzpq5sedf0
UPDATE courses
SET content = (
  SELECT jsonb_set(
    content,
    '{sections}',
    (
      SELECT jsonb_agg(
        jsonb_set(
          section,
          '{lessons}',
          (
            SELECT jsonb_agg(
              CASE
                WHEN lesson ? 'videoId' THEN jsonb_set(lesson, '{videoId}', '"gzpq5sedf0"')
                ELSE lesson
              END
            )
            FROM jsonb_array_elements(section->'lessons') AS lesson
          )
        )
      )
      FROM jsonb_array_elements(content->'sections') AS section
    )
  )
)
WHERE slug = 'j1-visa-postdoc'
  AND content IS NOT NULL
  AND content->'sections' IS NOT NULL;

-- Course 10: community-solutions-fellowship -> 3i1m0738a3
UPDATE courses
SET content = (
  SELECT jsonb_set(
    content,
    '{sections}',
    (
      SELECT jsonb_agg(
        jsonb_set(
          section,
          '{lessons}',
          (
            SELECT jsonb_agg(
              CASE
                WHEN lesson ? 'videoId' THEN jsonb_set(lesson, '{videoId}', '"3i1m0738a3"')
                ELSE lesson
              END
            )
            FROM jsonb_array_elements(section->'lessons') AS lesson
          )
        )
      )
      FROM jsonb_array_elements(content->'sections') AS section
    )
  )
)
WHERE slug = 'community-solutions-fellowship'
  AND content IS NOT NULL
  AND content->'sections' IS NOT NULL;

-- Verify the updates
SELECT
  slug,
  preview_video_url,
  content->'sections'->0->'lessons'->0->>'videoId' as first_lesson_video_id
FROM courses
WHERE slug != 'paket-semua-kursus'
ORDER BY display_order;
