-- Fix carts table - add session_id column if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'carts' AND column_name = 'session_id'
  ) THEN
    ALTER TABLE carts ADD COLUMN session_id TEXT;
  END IF;
END $$;

-- Create index for session_id if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_carts_session_id ON carts(session_id);

-- Verify the column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'carts' 
ORDER BY ordinal_position;
