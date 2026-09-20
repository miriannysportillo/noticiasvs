import type { Author } from '@/lib/supabase';

export type SocialLink = {
  label: string;
  url: string;
  platform: 'x' | 'linkedin' | 'instagram' | 'youtube' | 'web';
};

export type AuthorProfile = {
  name: string;
  role: string;
  bio: string;
  avatar: string;
  socialLinks: SocialLink[];
};

export const AUTHOR_PROFILES: Record<string, AuthorProfile> = {
  'María González': {
    name: 'María González',
    role: 'Corresponsal de Medio Ambiente',
    bio: 'Periodista especializada en sostenibilidad, territorio y transición climática. Escribe desde una mirada de campo sobre la relación entre ambiente, comunidad y futuro.',
    avatar: 'MG',
    socialLinks: [
      { label: 'X', platform: 'x', url: 'https://x.com/' },
      { label: 'LinkedIn', platform: 'linkedin', url: 'https://www.linkedin.com/' },
      { label: 'Instagram', platform: 'instagram', url: 'https://www.instagram.com/' },
    ],
  },
  'Roberto Méndez': {
    name: 'Roberto Méndez',
    role: 'Analista político',
    bio: 'Especialista en política pública y debates institucionales. Su enfoque combina rigor analítico con perspectiva ciudadana y periodismo explicativo.',
    avatar: 'RM',
    socialLinks: [
      { label: 'X', platform: 'x', url: 'https://x.com/' },
      { label: 'LinkedIn', platform: 'linkedin', url: 'https://www.linkedin.com/' },
    ],
  },
  'Ana Torres': {
    name: 'Ana Torres',
    role: 'Editora de tecnología',
    bio: 'Cobertura de innovación, IA y transformación digital con foco en impacto social, startups y cultura tecnológica.',
    avatar: 'AT',
    socialLinks: [
      { label: 'X', platform: 'x', url: 'https://x.com/' },
      { label: 'LinkedIn', platform: 'linkedin', url: 'https://www.linkedin.com/' },
      { label: 'YouTube', platform: 'youtube', url: 'https://www.youtube.com/' },
    ],
  },
  'Diego Fernández': {
    name: 'Diego Fernández',
    role: 'Columnista deportivo',
    bio: 'Cobertura de fútbol, rendimiento y cultura deportiva con un enfoque en la historia del juego y la identidad local.',
    avatar: 'DF',
    socialLinks: [
      { label: 'X', platform: 'x', url: 'https://x.com/' },
      { label: 'Instagram', platform: 'instagram', url: 'https://www.instagram.com/' },
    ],
  },
  'Javier Ríos': {
    name: 'Javier Ríos',
    role: 'Economista y editor',
    bio: 'Periodista económico con foco en mercados, finanzas y bienestar social. Explica cómo las decisiones macroimpactan la vida cotidiana.',
    avatar: 'JR',
    socialLinks: [
      { label: 'LinkedIn', platform: 'linkedin', url: 'https://www.linkedin.com/' },
      { label: 'X', platform: 'x', url: 'https://x.com/' },
    ],
  },
  'Lucía Vega': {
    name: 'Lucía Vega',
    role: 'Columnista de cultura',
    bio: 'Escritora y crítica cultural que explora arte, cine, creatividad y nuevas expresiones contemporáneas desde la región.',
    avatar: 'LV',
    socialLinks: [
      { label: 'Instagram', platform: 'instagram', url: 'https://www.instagram.com/' },
      { label: 'X', platform: 'x', url: 'https://x.com/' },
      { label: 'Web', platform: 'web', url: 'https://example.com/' },
    ],
  },
};

export function getAuthorProfile(name: string): AuthorProfile | undefined {
  return AUTHOR_PROFILES[name] ?? undefined;
}

export function mapAuthorProfile(author: Author): AuthorProfile {
  return {
    name: author.name,
    role: author.role,
    bio: author.bio,
    avatar: author.avatar || author.name.slice(0, 2).toUpperCase(),
    socialLinks: author.social_links,
  };
}
