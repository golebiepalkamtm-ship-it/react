-- Create references table
CREATE TABLE IF NOT EXISTS public.references (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "breederName" TEXT NOT NULL,
    location TEXT NOT NULL,
    rating INTEGER DEFAULT 5,
    opinion TEXT,
    experience TEXT,
    achievements TEXT, -- JSON stored as text or simple text
    "pigeonName" TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    "isApproved" BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.references ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public can view approved references" ON public.references
    FOR SELECT
    USING ("isApproved" = true);

CREATE POLICY "Authenticated users can insert references" ON public.references
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Admins can do everything
CREATE POLICY "Admins can do everything with references" ON public.references
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'ADMIN'
        )
    );
