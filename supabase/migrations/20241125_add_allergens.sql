-- Add allergens column to specials table
ALTER TABLE specials 
ADD COLUMN IF NOT EXISTS allergens JSONB DEFAULT '[]'::JSONB;

-- Update existing rows to have empty array instead of null (optional but good for consistency)
UPDATE specials 
SET allergens = '[]'::JSONB 
WHERE allergens IS NULL;
