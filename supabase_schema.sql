-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUMS
CREATE TYPE user_level AS ENUM ('CURIOSO', 'FERVENDO', 'INCENDIARIO');
CREATE TYPE post_type AS ENUM ('photo', 'video', 'status');

-- 2. TABLES

-- PROFILES (Extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  level user_level DEFAULT 'CURIOSO',
  xp INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PLACES (Venues)
CREATE TABLE public.places (
  id TEXT PRIMARY KEY, -- Google Place ID
  name TEXT NOT NULL,
  category TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  heat_score INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CHECKINS (Live Activity)
CREATE TABLE public.checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  place_id TEXT REFERENCES public.places(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '4 hours')
);

-- POSTS (Feed)
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  place_id TEXT REFERENCES public.places(id) NOT NULL,
  media_url TEXT,
  content TEXT,
  type post_type DEFAULT 'status',
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- LIKES
CREATE TABLE public.likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, post_id) -- Prevent double likes
);

-- 3. ROW LEVEL SECURITY (RLS)
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Places Policies
CREATE POLICY "Places are viewable by everyone" ON public.places FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create places" ON public.places FOR INSERT WITH CHECK (auth.role() = 'authenticated');
-- Note: Places might be auto-created by backend/edge functions to ensure quality, but for now allow authenticated users.

-- Checkins Policies
CREATE POLICY "Checkins are viewable by everyone" ON public.checkins FOR SELECT USING (true);
CREATE POLICY "Users can insert their own checkin" ON public.checkins FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Posts Policies
CREATE POLICY "Posts are viewable by everyone" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Users can create posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Likes Policies
CREATE POLICY "Likes are viewable by everyone" ON public.likes FOR SELECT USING (true);
CREATE POLICY "Users can toggle likes" ON public.likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove likes" ON public.likes FOR DELETE USING (auth.uid() = user_id);


-- 4. FUNCTIONS & TRIGGERS

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, username)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url',
    new.email -- Fallback username
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Auto-update Heat Score (Simplified)
-- This counts valid checkins for a place
CREATE OR REPLACE FUNCTION update_heat_score()
RETURNS TRIGGER AS $$
BEGIN
  -- Logic to update heat_score in public.places based on count of active checkins
  -- This is a simplified example. In production, this might be a scheduled job or edge function to avoid write-heavy triggers.
  UPDATE public.places
  SET heat_score = (
    SELECT COUNT(*) * 10 -- 10 points per person
    FROM public.checkins
    WHERE place_id = NEW.place_id
    AND expires_at > NOW()
  )
  WHERE id = NEW.place_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_checkin_added
  AFTER INSERT ON public.checkins
  FOR EACH ROW EXECUTE PROCEDURE update_heat_score();
