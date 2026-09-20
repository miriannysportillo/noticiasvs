import { createClient } from '@supabase/supabase-js';

export type { Session } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'missing-anon-key'
);

export type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  image_url: string;
  featured: boolean;
  status: 'draft' | 'published';
  published_at: string;
  created_at: string;
  updated_at: string;
};

export type Author = {
  id: string;
  name: string;
  role: string;
  bio: string;
  avatar: string;
  social_links: Array<{
    label: string;
    url: string;
    platform: 'x' | 'linkedin' | 'instagram' | 'youtube' | 'web';
  }>;
  created_at: string;
  updated_at: string;
};
