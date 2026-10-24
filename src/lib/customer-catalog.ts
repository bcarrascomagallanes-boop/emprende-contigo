export const experts = [
  { id: 'gina', name: 'Gina Magallanes', specialty: 'Keratinas, alisados, manicure y pedicure', initials: 'GM', featured: true },
  { id: 'karla', name: 'Karla Benítez', specialty: 'Uñas y nail art', initials: 'KB', featured: false },
  { id: 'patricia', name: 'Patricia Mendoza', specialty: 'Maquillaje social', initials: 'PM', featured: false },
];
export const services = [
  { id: 'keratina', expert: 'gina', name: 'Alisado de Keratina Orgánica Premium', category: 'Cabello', price: 80, minutes: 150 },
  { id: 'manicure', expert: 'gina', name: 'Manicura Rusa + Spa Rejuvenecedor', category: 'Uñas', price: 18, minutes: 60 },
  { id: 'pedicure', expert: 'gina', name: 'Pedicura Clínica + Tratamiento de Parafina', category: 'Uñas', price: 25, minutes: 60 },
  { id: 'brillo', expert: 'gina', name: 'Tratamiento Sellador de Brillo Espejo', category: 'Cabello', price: 35, minutes: 60 },
  { id: 'unas', expert: 'karla', name: 'Uñas Acrílicas Esculturales', category: 'Uñas', price: 32, minutes: 90 },
  { id: 'maquillaje', expert: 'patricia', name: 'Maquillaje Social de Larga Duración', category: 'Maquillaje', price: 45, minutes: 75 },
];
export type Service = typeof services[number];
export const money = (value: number) => `$${value.toFixed(2)}`;
export const customerHead = (title: string, description: string) => ({ meta: [
  { title: `${title} · BiAn Beauty` }, { name: 'description', content: description },
  { property: 'og:title', content: `${title} · BiAn Beauty` }, { property: 'og:description', content: description },
  { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' },
] });