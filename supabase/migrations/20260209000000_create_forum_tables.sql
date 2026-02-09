-- Migration: Create Forum Tables
-- Description: Adds tables for forum categories, topics, and posts with RLS policies.

-- 1. Forum Categories
CREATE TABLE IF NOT EXISTS public.forum_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    slug TEXT UNIQUE NOT NULL,
    icon TEXT,
    "order" INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Forum Topics
CREATE TABLE IF NOT EXISTS public.forum_topics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    category_id UUID NOT NULL REFERENCES public.forum_categories(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    is_pinned BOOLEAN DEFAULT false,
    is_locked BOOLEAN DEFAULT false,
    views_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Forum Posts
CREATE TABLE IF NOT EXISTS public.forum_posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    topic_id UUID NOT NULL REFERENCES public.forum_topics(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_forum_topics_category_id ON public.forum_topics(category_id);
CREATE INDEX IF NOT EXISTS idx_forum_topics_author_id ON public.forum_topics(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_topic_id ON public.forum_posts(topic_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_author_id ON public.forum_posts(author_id);

-- Enable RLS
ALTER TABLE public.forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Categories: Read for everyone, Write for Admins
CREATE POLICY "Anyone can view categories" ON public.forum_categories FOR SELECT USING (true);
-- Assuming 'ADMIN' role exists in users.role
CREATE POLICY "Admins can manage categories" ON public.forum_categories FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN')
);

-- Topics: Read for everyone, Create for authenticated, Update/Delete for Author or Admin
CREATE POLICY "Anyone can view topics" ON public.forum_topics FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create topics" ON public.forum_topics FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authors or Admins can update topics" ON public.forum_topics FOR UPDATE USING (
    auth.uid() = author_id OR 
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN')
);
CREATE POLICY "Authors or Admins can delete topics" ON public.forum_topics FOR DELETE USING (
    auth.uid() = author_id OR 
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN')
);

-- Posts: Read for everyone, Create for authenticated, Update/Delete for Author or Admin
CREATE POLICY "Anyone can view posts" ON public.forum_posts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create posts" ON public.forum_posts FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authors or Admins can update posts" ON public.forum_posts FOR UPDATE USING (
    auth.uid() = author_id OR 
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN')
);
CREATE POLICY "Authors or Admins can delete posts" ON public.forum_posts FOR DELETE USING (
    auth.uid() = author_id OR 
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN')
);

-- Updated_at triggers
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'forum_categories_updated_at_trigger') THEN
    CREATE TRIGGER forum_categories_updated_at_trigger BEFORE UPDATE ON public.forum_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'forum_topics_updated_at_trigger') THEN
    CREATE TRIGGER forum_topics_updated_at_trigger BEFORE UPDATE ON public.forum_topics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'forum_posts_updated_at_trigger') THEN
    CREATE TRIGGER forum_posts_updated_at_trigger BEFORE UPDATE ON public.forum_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Initial Seed Data
INSERT INTO public.forum_categories (name, description, slug, icon, "order") VALUES
('Ogólne dyskusje', 'Rozmowy na każdy temat związany z gołębiami.', 'ogolne-dyskusje', 'MessageCircle', 1),
('Zdrowie i hodowla', 'Porady dotyczące pielęgnacji, chorób i karmienia.', 'zdrowie-i-hodowla', 'Stethoscope', 2),
('Loty i wyniki', 'Informacje o lotach, konkursach i rankingach PZHGP.', 'loty-i-wyniki', 'Trophy', 3),
('Giełda i ogłoszenia', 'Miejsce na kupno i sprzedaż gołębi oraz akcesoriów.', 'gielda', 'ShoppingBag', 4);
