-- Add gallery_url column for optimized gallery images (~600px)
-- This variant reduces GPU memory from ~295MB to ~28MB for 20 photos on mobile
ALTER TABLE photos ADD COLUMN gallery_url VARCHAR(500) AFTER thumb_url;
