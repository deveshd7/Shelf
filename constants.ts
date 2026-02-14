import { AppState, Collection, Item, FieldDefinition } from './types';
import { v4 as uuidv4 } from 'uuid'; // We will mock uuid since we can't install packages

// Simple UUID generator for this environment
const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

export const COLORS = [
  { name: 'Stone', value: 'stone', class: 'bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-200' },
  { name: 'Amber', value: 'amber', class: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200' },
  { name: 'Rose', value: 'rose', class: 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-200' },
  { name: 'Indigo', value: 'indigo', class: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200' },
  { name: 'Emerald', value: 'emerald', class: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200' },
];

export const ICONS = ['Library', 'Film', 'Music', 'Utensils', 'Plane', 'Lightbulb', 'BookOpen', 'Camera', 'Coffee', 'Heart'];

// Seed Data
const filmsId = generateId();
const booksId = generateId();

const f_title = generateId();
const f_image = generateId();
const f_director = generateId();
const f_rating = generateId();
const f_status = generateId();
const f_notes = generateId();

const b_title = generateId();
const b_author = generateId();
const b_cover = generateId();
const b_rating = generateId();
const b_status = generateId();

const filmFields: FieldDefinition[] = [
  { id: f_title, name: 'Title', type: 'text' },
  { id: f_image, name: 'Poster', type: 'image' },
  { id: f_director, name: 'Director', type: 'text' },
  { id: f_rating, name: 'Rating', type: 'rating' },
  { id: f_status, name: 'Status', type: 'status', options: ['To Watch', 'Watching', 'Watched'] },
  { id: f_notes, name: 'Thoughts', type: 'long_text' },
];

const bookFields: FieldDefinition[] = [
  { id: b_title, name: 'Title', type: 'text' },
  { id: b_cover, name: 'Cover', type: 'image' },
  { id: b_author, name: 'Author', type: 'text' },
  { id: b_rating, name: 'Rating', type: 'rating' },
  { id: b_status, name: 'Status', type: 'status', options: ['To Read', 'Reading', 'Read'] },
];

const item1Id = generateId();
const item2Id = generateId();
const item3Id = generateId();
const item4Id = generateId();

export const SEED_DATA: AppState = {
  darkMode: false,
  sidebarOpen: true,
  collections: [
    {
      id: filmsId,
      name: 'Films to Watch',
      icon: 'Film',
      color: 'indigo',
      description: 'A curated list of visual masterpieces and weekend watches.',
      fields: filmFields,
      itemIds: [item1Id, item2Id],
    },
    {
      id: booksId,
      name: 'Library',
      icon: 'BookOpen',
      color: 'amber',
      description: 'Books I have read and books I pretend I will read.',
      fields: bookFields,
      itemIds: [item3Id, item4Id],
    },
  ],
  items: {
    [item1Id]: {
      id: item1Id,
      collectionId: filmsId,
      dateAdded: new Date().toISOString(),
      isFavorite: true,
      fieldValues: {
        [f_title]: 'Interstellar',
        [f_image]: 'https://picsum.photos/id/237/400/600',
        [f_director]: 'Christopher Nolan',
        [f_rating]: 5,
        [f_status]: 'Watched',
        [f_notes]: 'Absolutely mind-bending visuals. The soundtrack by Zimmer is essential.',
      },
    },
    [item2Id]: {
      id: item2Id,
      collectionId: filmsId,
      dateAdded: new Date().toISOString(),
      isFavorite: false,
      fieldValues: {
        [f_title]: 'Past Lives',
        [f_image]: 'https://picsum.photos/id/64/400/600',
        [f_director]: 'Celine Song',
        [f_rating]: 4,
        [f_status]: 'To Watch',
        [f_notes]: '',
      },
    },
    [item3Id]: {
      id: item3Id,
      collectionId: booksId,
      dateAdded: new Date().toISOString(),
      isFavorite: true,
      fieldValues: {
        [b_title]: 'Dune',
        [b_cover]: 'https://picsum.photos/id/96/400/600',
        [b_author]: 'Frank Herbert',
        [b_rating]: 5,
        [b_status]: 'Read',
      },
    },
    [item4Id]: {
      id: item4Id,
      collectionId: booksId,
      dateAdded: new Date().toISOString(),
      isFavorite: false,
      fieldValues: {
        [b_title]: 'Design of Everyday Things',
        [b_cover]: 'https://picsum.photos/id/20/400/600',
        [b_author]: 'Don Norman',
        [b_rating]: 0,
        [b_status]: 'Reading',
      },
    },
  },
};