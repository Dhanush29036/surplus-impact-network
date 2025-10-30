-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  organization_name TEXT,
  user_type TEXT CHECK (user_type IN ('donor', 'ngo', 'volunteer', 'admin')) DEFAULT 'donor',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create donations table
CREATE TABLE public.donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  item_type TEXT CHECK (item_type IN ('food', 'clothes', 'books', 'hygiene', 'devices')) NOT NULL,
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit TEXT DEFAULT 'items',
  description TEXT,
  image_url TEXT,
  classification_result JSONB,
  freshness_score INTEGER CHECK (freshness_score >= 0 AND freshness_score <= 100),
  condition_score INTEGER CHECK (condition_score >= 0 AND condition_score <= 100),
  expiry_date DATE,
  pickup_location TEXT NOT NULL,
  pickup_time TIMESTAMP WITH TIME ZONE,
  status TEXT CHECK (status IN ('pending', 'scheduled', 'picked_up', 'delivered', 'cancelled')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- Donations policies
CREATE POLICY "Users can view own donations"
  ON public.donations FOR SELECT
  USING (auth.uid() = donor_id);

CREATE POLICY "Users can insert own donations"
  ON public.donations FOR INSERT
  WITH CHECK (auth.uid() = donor_id);

CREATE POLICY "Users can update own donations"
  ON public.donations FOR UPDATE
  USING (auth.uid() = donor_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, user_type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'donor')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_donations_updated_at
  BEFORE UPDATE ON public.donations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();