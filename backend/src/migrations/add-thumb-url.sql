-- Add thumb_url column to photos table for thumbnail support
-- Run this migration before deploying the new upload endpoint

ALTER TABLE photos ADD COLUMN thumb_url VARCHAR(500) DEFAULT NULL AFTER url;

-- Note: Existing photos won't have thumbnails. They'll be generated only for new uploads.
-- To generate thumbnails for existing photos, run: node src/migrations/generate-thumbs.js
