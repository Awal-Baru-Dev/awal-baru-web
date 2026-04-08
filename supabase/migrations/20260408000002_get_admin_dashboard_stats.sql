CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS json
AS $$
DECLARE
  total_rev BIGINT;
  total_usr INTEGER;
  active_crs INTEGER;
  sales_24h INTEGER;
  daily_stats json;
  cutoff_date TIMESTAMP WITH TIME ZONE := '2026-04-03 00:00:00+07';
BEGIN
  -- 1. Total Revenue
  SELECT COALESCE(SUM(amount_paid), 0) INTO total_rev
  FROM enrollments
  WHERE payment_status = 'paid'
  AND purchased_at >= cutoff_date;

  -- 2. Total User
  SELECT COUNT(DISTINCT user_id) INTO total_usr
  FROM enrollments
  WHERE payment_status = 'paid'
  AND purchased_at >= cutoff_date;

  -- 3. Kursus Aktif
  SELECT COUNT(*) INTO active_crs
  FROM courses
  WHERE is_published = true;

  -- 4. Penjualan 24 Jam
  SELECT COUNT(DISTINCT payment_reference) INTO sales_24h
  FROM enrollments
  WHERE payment_status = 'paid' 
  AND created_at >= NOW() - INTERVAL '24 hours';

  -- 5. (FIX) Grafik Pendapatan 7 Hari Terakhir
  -- Menggunakan generate_series agar hari yang kosong tetap muncul sebagai 0
  SELECT json_agg(
    json_build_object(
      'date', to_char(days.day, 'DD Mon'),
      'total', COALESCE(daily_sales.total_amount, 0)
    ) ORDER BY days.day
  ) INTO daily_stats
  FROM (
    -- Generate 7 hari terakhir dalam timezone Jakarta
    SELECT generate_series(
      date_trunc('day', (NOW() AT TIME ZONE 'Asia/Jakarta') - INTERVAL '6 days'),
      date_trunc('day', (NOW() AT TIME ZONE 'Asia/Jakarta')),
      '1 day'::interval
    ) as day
  ) days
  LEFT JOIN (
    -- Join dengan data penjualan yang sudah dikonversi ke Jakarta
    SELECT 
      date_trunc('day', created_at AT TIME ZONE 'Asia/Jakarta') as sale_day,
      SUM(amount_paid) as total_amount
    FROM enrollments
    WHERE payment_status = 'paid'
      AND (created_at AT TIME ZONE 'Asia/Jakarta') >= (date_trunc('day', NOW() AT TIME ZONE 'Asia/Jakarta') - INTERVAL '6 days')
    GROUP BY 1
  ) daily_sales ON days.day = daily_sales.sale_day;

  RETURN json_build_object(
    'totalRevenue', total_rev,
    'totalUsers', total_usr,
    'activeCourses', active_crs,
    'sales24h', sales_24h,
    'revenueChart', COALESCE(daily_stats, '[]'::json)
  );
END;
$$;