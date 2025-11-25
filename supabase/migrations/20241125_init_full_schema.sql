-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create specials table
CREATE TABLE IF NOT EXISTS specials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL CHECK (type IN ('burger', 'fillet', 'shake')),
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    subtitle TEXT,
    description TEXT NOT NULL,
    price NUMERIC,
    image_url TEXT,
    is_active BOOLEAN DEFAULT false,
    allergens JSONB DEFAULT '[]'::JSONB,
    starts_at TIMESTAMP WITH TIME ZONE,
    ends_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create recruitment_applications table
CREATE TABLE IF NOT EXISTS recruitment_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    preferredLocation TEXT NOT NULL,
    desiredRole TEXT NOT NULL,
    availability TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE specials ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruitment_applications ENABLE ROW LEVEL SECURITY;

-- Policies for specials
-- Public can view active specials (or all, depending on logic. Let's allow public read for now)
CREATE POLICY "Public can view specials" ON specials
    FOR SELECT USING (true);

-- Only authenticated users (admins) can insert/update/delete specials
CREATE POLICY "Admins can manage specials" ON specials
    FOR ALL USING (auth.role() = 'authenticated');

-- Policies for recruitment_applications
-- Public can insert applications
CREATE POLICY "Public can submit applications" ON recruitment_applications
    FOR INSERT WITH CHECK (true);

-- Only authenticated users (admins) can view applications
CREATE POLICY "Admins can view applications" ON recruitment_applications
    FOR SELECT USING (auth.role() = 'authenticated');

-- Create Storage Bucket for specials images if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('specials', 'specials', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'specials');
CREATE POLICY "Auth Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'specials' AND auth.role() = 'authenticated');
CREATE POLICY "Auth Update" ON storage.objects FOR UPDATE USING (bucket_id = 'specials' AND auth.role() = 'authenticated');
CREATE POLICY "Auth Delete" ON storage.objects FOR DELETE USING (bucket_id = 'specials' AND auth.role() = 'authenticated');
