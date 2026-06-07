-- 1. Create Profiles Table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  full_name TEXT,
  college_name TEXT,
  year_level INTEGER DEFAULT 1,
  avatar_url TEXT,
  level INTEGER DEFAULT 1,
  streak INTEGER DEFAULT 0,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Create Study Stats Table (Dashboard Data)
CREATE TABLE public.study_stats (
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  syllabus_coverage INTEGER DEFAULT 0,
  mastered_flashcards INTEGER DEFAULT 0,
  weekly_progress INTEGER DEFAULT 0,
  current_goal TEXT DEFAULT 'Complete your first lesson'
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_stats ENABLE ROW LEVEL SECURITY;

-- 4. Set Up Policies
-- Profiles: Users can only see and update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Study Stats: Users can only see and update their own stats
CREATE POLICY "Users can view own stats" ON public.study_stats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own stats" ON public.study_stats FOR UPDATE USING (auth.uid() = user_id);

-- 5. Automatic Profile Creation Trigger
-- This function inserts a row into public.profiles and public.study_stats 
-- whenever a new user signs up in auth.users.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  
  INSERT INTO public.study_stats (user_id)
  VALUES (new.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
