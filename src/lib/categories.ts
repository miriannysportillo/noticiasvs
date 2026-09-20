export const CATEGORIES = [
  'Política',
  'Tecnología',
  'Deportes',
  'Economía',
  'Cultura',
  'Medio Ambiente',
] as const;

export const CATEGORY_SLUGS: Record<string, string> = {
  'Política': 'politica',
  'Tecnología': 'tecnologia',
  'Deportes': 'deportes',
  'Economía': 'economia',
  'Cultura': 'cultura',
  'Medio Ambiente': 'medio-ambiente',
};

export const SLUG_TO_CATEGORY: Record<string, string> = Object.entries(CATEGORY_SLUGS).reduce(
  (acc, [cat, slug]) => {
    acc[slug] = cat;
    return acc;
  },
  {} as Record<string, string>
);
