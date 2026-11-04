export const CATEGORIES = [
  { slug: 'earrings', name: 'Earrings', tagline: 'Everyday light, evening lustre' },
  { slug: 'churi', name: 'Churi', tagline: 'Hand-finished bangles in warm gold' },
  { slug: 'jumka', name: 'Jumka', tagline: 'Heritage chandeliers for celebration' },
  { slug: 'gungur', name: 'Gungur', tagline: 'A whisper of bells at every step' },
  { slug: 'necklace', name: 'Necklace', tagline: 'Sculpted lines for the décolletage' },
  { slug: 'chocolate', name: 'Chocolate', tagline: 'Small-batch gifting, beautifully boxed' },
  { slug: 'jewelry-sets', name: 'Jewelry Sets', tagline: 'Complete looks, thoughtfully paired' },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]['slug'];
export type CategoryName = (typeof CATEGORIES)[number]['name'];

export const CATEGORY_NAMES: string[] = CATEGORIES.map((c) => c.name);

export function categoryBySlug(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function categoryByName(name: string) {
  return CATEGORIES.find((c) => c.name.toLowerCase() === name.toLowerCase());
}

export function categorySlugOf(name: string): string {
  return categoryByName(name)?.slug ?? name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}
