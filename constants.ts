import { AppState } from './types';

export const COLORS = [
  { name: 'Stone', value: 'stone', class: 'bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-200' },
  { name: 'Amber', value: 'amber', class: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200' },
  { name: 'Rose', value: 'rose', class: 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-200' },
  { name: 'Indigo', value: 'indigo', class: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200' },
  { name: 'Emerald', value: 'emerald', class: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200' },
];

export const ICONS = ['Library', 'Film', 'Music', 'Utensils', 'Plane', 'Lightbulb', 'BookOpen', 'Camera', 'Coffee', 'Heart'];

export const SEED_DATA: AppState = {
  darkMode: false,
  sidebarOpen: true,
  collections: [],
  items: {},
};
