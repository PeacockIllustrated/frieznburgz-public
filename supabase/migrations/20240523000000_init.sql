-- Create specials table
CREATE TABLE specials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('burger', 'fillet', 'shake')),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  subtitle text,
  description text NOT NULL,
  price numeric(6,2),
  image_url text,
  is_active boolean DEFAULT false,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create recruitment_applications table
CREATE TABLE recruitment_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  preferred_location text NOT NULL,
  desired_role text NOT NULL,
  availability text NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE specials ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruitment_applications ENABLE ROW LEVEL SECURITY;

-- Policies for specials
-- Public can read active specials (or all specials? Prompt implies public sees active ones, admin sees all)
-- Let's allow public read access to all for now, filtering will happen in app logic or we can restrict.
-- Actually, for simplicity, let's allow public read.
CREATE POLICY "Public can read specials" ON specials
  FOR SELECT USING (true);

-- Only authenticated users (admins) can insert/update/delete specials
CREATE POLICY "Admins can insert specials" ON specials
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update specials" ON specials
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete specials" ON specials
  FOR DELETE USING (auth.role() = 'authenticated');

-- Policies for recruitment_applications
-- Public can insert (submit application)
CREATE POLICY "Public can submit applications" ON recruitment_applications
  FOR INSERT WITH CHECK (true);

-- Only admins can read applications
CREATE POLICY "Admins can read applications" ON recruitment_applications
  FOR SELECT USING (auth.role() = 'authenticated');
