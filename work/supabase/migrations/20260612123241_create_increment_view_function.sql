CREATE OR REPLACE FUNCTION increment_view_count()
RETURNS void AS $$
BEGIN
  UPDATE view_counts SET total_views = total_views + 1 WHERE id = 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
