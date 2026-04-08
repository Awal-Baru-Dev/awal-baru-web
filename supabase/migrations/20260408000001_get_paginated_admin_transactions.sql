-- Function to get paginated admin transactions with grouping and filtering
CREATE OR REPLACE FUNCTION get_paginated_admin_transactions(
  p_page INT,
  p_limit INT,
  p_search_query TEXT DEFAULT '',
  p_status_filter TEXT DEFAULT 'all'
)
RETURNS TABLE (
  data JSONB,
  total_count BIGINT
) AS $$
DECLARE
  v_offset INT;
BEGIN
  v_offset := GREATEST(0, (p_page - 1) * p_limit);

  RETURN QUERY
  WITH raw_data AS (
    SELECT 
      e.id,
      e.user_id,
      e.course_id,
      e.created_at,
      CASE 
        WHEN e.payment_status = 'pending' AND e.expires_at < NOW() THEN 'expired'
        ELSE e.payment_status 
      END as payment_status,
      e.amount_paid,
      e.payment_method,
      e.payment_channel,
      e.payment_reference,
      e.expires_at,
      p.full_name as user_name,
      p.avatar_url as user_avatar,
      p.whatsapp_number as user_whatsapp,
      u.email as user_email,
      c.title as course_title
    FROM public.enrollments e
    JOIN public.profiles p ON e.user_id = p.id
    JOIN auth.users u ON e.user_id = u.id
    JOIN public.courses c ON e.course_id = c.id
  ),
  grouped_trx AS (
    SELECT 
      COALESCE(payment_reference, user_id::text || '-' || created_at::text) as unique_key,
      MIN(id::text)::uuid as id,
      MIN(created_at) as created_at,
      MAX(payment_status) as payment_status,
      SUM(amount_paid) as total_amount,
      MAX(payment_method) as payment_method,
      MAX(payment_channel) as payment_channel,
      MAX(payment_reference) as payment_reference,
      MAX(user_name) as user_name,
      MAX(user_email) as user_email,
      MAX(user_avatar) as user_avatar,
      MAX(user_whatsapp) as user_whatsapp,
      ARRAY_AGG(course_title) as all_titles,
      COUNT(*) as item_count,
      MAX(expires_at) as expires_at
    FROM raw_data
    GROUP BY unique_key
  ),
  filtered_trx AS (
    SELECT * 
    FROM grouped_trx
    WHERE 
      (p_status_filter = 'all' OR payment_status::text = p_status_filter)
      AND (
        p_search_query = '' 
        OR user_name ILIKE '%' || p_search_query || '%'
        OR user_email ILIKE '%' || p_search_query || '%'
        OR (item_count > 1 AND 'paket semua kursus' ILIKE '%' || p_search_query || '%')
        OR EXISTS (SELECT 1 FROM unnest(all_titles) t WHERE t ILIKE '%' || p_search_query || '%')
      )
  )
  SELECT 
    (SELECT COALESCE(jsonb_agg(q), '[]'::jsonb) FROM (
      SELECT * FROM filtered_trx 
      ORDER BY created_at DESC 
      LIMIT p_limit OFFSET v_offset
    ) q) as data,
    (SELECT count(*) FROM filtered_trx) as total_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION get_paginated_admin_transactions TO anon, authenticated, service_role;
