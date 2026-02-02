-- Create metrics table for tracking analytics
CREATE TABLE IF NOT EXISTS public.metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scope TEXT NOT NULL CHECK (scope IN ('SITE', 'AUCTION', 'GALLERY_IMAGE')),
    target_id TEXT,
    count INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(scope, target_id)
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_metrics_scope ON public.metrics(scope);
CREATE INDEX IF NOT EXISTS idx_metrics_target_id ON public.metrics(target_id);

-- Enable RLS
ALTER TABLE public.metrics ENABLE ROW LEVEL SECURITY;

-- Create RLS policy to allow public read access
CREATE POLICY "Allow public read access" ON public.metrics
    FOR SELECT USING (true);

-- Create RLS policy to allow public insert/update
CREATE POLICY "Allow public insert and update" ON public.metrics
    FOR ALL USING (true);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_metrics_updated_at 
    BEFORE UPDATE ON public.metrics 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();