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

-- 3. Create Chat Sessions Table (History)
CREATE TABLE public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT DEFAULT 'New Conversation',
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Create Messages Table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.chat_sessions ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 6. Set Up Policies

-- Profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Study Stats
CREATE POLICY "Users can view own stats" ON public.study_stats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own stats" ON public.study_stats FOR UPDATE USING (auth.uid() = user_id);

-- Chat Sessions
CREATE POLICY "Users can view own chats" ON public.chat_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own chats" ON public.chat_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own chats" ON public.chat_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own chats" ON public.chat_sessions FOR DELETE USING (auth.uid() = user_id);

-- Messages
-- Users can only see messages belonging to their own sessions
CREATE POLICY "Users can view own messages" ON public.messages FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.chat_sessions WHERE id = session_id AND user_id = auth.uid()));

CREATE POLICY "Users can insert own messages" ON public.messages FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM public.chat_sessions WHERE id = session_id AND user_id = auth.uid()));

-- 7. Automatic Profile Creation Trigger
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
-- 8. GNM Learning OS: Revision Hub Tables

-- Subjects Table (Custom subjects like Anatomy, MSN, Ward Work)
CREATE TABLE public.subjects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Topics Table (Specific topics with Spaced Repetition tracking)
CREATE TABLE public.topics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  status TEXT CHECK (status IN ('Not Started', 'Learning', 'Needs Revision', 'Mastered')) DEFAULT 'Not Started',
  confidence_score INTEGER DEFAULT 0, -- 1 to 5 scale
  next_review_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Topic Details (Extensive Workspace Content)
CREATE TABLE public.topic_details (
  topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE PRIMARY KEY,
  smart_notes JSONB DEFAULT '{}'::jsonb, -- {quick: "", detailed: "", exam: ""}
  recall_questions JSONB DEFAULT '{}'::jsonb, -- {m2: [], m5: [], m10: []}
  summaries JSONB DEFAULT '{}'::jsonb, -- {level1: "", level2: "", level3: ""}
  mind_map JSONB DEFAULT '{}'::jsonb,
  personal_notes TEXT DEFAULT '',
  mastery_metrics JSONB DEFAULT '{"read": false, "recall": false, "notes": false, "revision": false}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Revision Logs (For Weak Area Detection & History)
CREATE TABLE public.revision_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE NOT NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  score INTEGER NOT NULL
);

-- Study Sessions (Track time spent per subject)
CREATE TABLE public.study_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  duration_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topic_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revision_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

-- POLICIES
CREATE POLICY "Users can manage their own subjects" ON public.subjects FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage topics in their subjects" ON public.topics FOR ALL USING (
  EXISTS (SELECT 1 FROM public.subjects WHERE id = topics.subject_id AND user_id = auth.uid())
);
CREATE POLICY "Users can manage topic details" ON public.topic_details FOR ALL USING (
  EXISTS (SELECT 1 FROM public.topics JOIN public.subjects ON public.topics.subject_id = public.subjects.id WHERE public.topics.id = topic_details.topic_id AND public.subjects.user_id = auth.uid())
);
CREATE POLICY "Users can manage revision logs" ON public.revision_logs FOR ALL USING (
  EXISTS (SELECT 1 FROM public.topics JOIN public.subjects ON public.topics.subject_id = public.subjects.id WHERE public.topics.id = revision_logs.topic_id AND public.subjects.user_id = auth.uid())
);
CREATE POLICY "Users can manage their study sessions" ON public.study_sessions FOR ALL USING (auth.uid() = user_id);
