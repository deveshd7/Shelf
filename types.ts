export type FieldType = 
  | 'text' 
  | 'long_text' 
  | 'rating' 
  | 'status' 
  | 'tags' 
  | 'url' 
  | 'date' 
  | 'image' 
  | 'toggle' 
  | 'select';

export interface FieldDefinition {
  id: string;
  name: string;
  type: FieldType;
  options?: string[]; // For status, select
}

export interface Item {
  id: string;
  collectionId: string;
  dateAdded: string; // ISO string
  isFavorite: boolean;
  fieldValues: Record<string, any>; // Keyed by FieldDefinition.id
}

export interface Collection {
  id: string;
  name: string;
  icon: string; // Lucide icon name or emoji
  color: string; // Tailwind color class key (e.g., 'amber', 'rose')
  description?: string;
  fields: FieldDefinition[];
  itemIds: string[]; // Ordered list of item IDs
}

export interface AppState {
  collections: Collection[];
  items: Record<string, Item>; // Normalized item store
  darkMode: boolean;
  sidebarOpen: boolean;
}

export type SortOption = 'date_desc' | 'date_asc' | 'title_asc' | 'title_desc' | 'rating_desc' | 'rating_asc' | 'status_asc';

export interface FilterOptions {
  onlyHasRating: boolean;
  statusValues: string[];
}