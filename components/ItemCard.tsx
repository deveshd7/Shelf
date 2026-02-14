import React from 'react';
import { Item, Collection, FieldDefinition } from '../types';
import { cn, Icon, Badge } from './UI';
import * as Lucide from 'lucide-react';

interface ItemCardProps {
  item: Item;
  collection: Collection;
  onClick: () => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item, collection, onClick }) => {
  // Helpers to find specific fields to render in the card preview
  const titleField = collection.fields.find(f => f.name.toLowerCase() === 'title') || collection.fields[0];
  const imageField = collection.fields.find(f => f.type === 'image');
  const ratingField = collection.fields.find(f => f.type === 'rating');
  const statusField = collection.fields.find(f => f.type === 'status');
  const tagsField = collection.fields.find(f => f.type === 'tags');
  const textField = collection.fields.find(f => f.type === 'text' && f.id !== titleField?.id); // Secondary text

  const title = titleField ? item.fieldValues[titleField.id] : 'Untitled';
  const imageUrl = imageField ? item.fieldValues[imageField.id] : null;
  const rating = ratingField ? item.fieldValues[ratingField.id] : null;
  const status = statusField ? item.fieldValues[statusField.id] : null;

  return (
    <div 
      onClick={onClick}
      className={cn(
        "group relative break-inside-avoid rounded-xl border border-stone-200 bg-white dark:bg-stone-900 dark:border-stone-800 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md cursor-pointer overflow-hidden mb-6",
        item.isFavorite && "ring-1 ring-amber-400 dark:ring-amber-500/50"
      )}
    >
      {/* Cover Image */}
      {imageUrl && (
        <div className="aspect-[3/2] w-full overflow-hidden bg-stone-100 dark:bg-stone-800 relative">
          <img 
            src={imageUrl} 
            alt={String(title)} 
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      )}

      {/* Content */}
      <div className="p-4 space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className={cn("font-medium text-stone-900 dark:text-stone-100 leading-tight", !imageUrl && "text-lg")}>
            {title || <span className="text-stone-400 italic">No Title</span>}
          </h3>
          {item.isFavorite && (
            <Lucide.Heart size={14} className="fill-amber-400 text-amber-400 flex-shrink-0 mt-1" />
          )}
        </div>

        {/* Metadata Row */}
        <div className="flex flex-wrap items-center gap-2">
          {rating !== undefined && rating !== null && (
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Lucide.Star 
                  key={i} 
                  size={12} 
                  className={cn(i < Number(rating) ? "fill-current" : "text-stone-200 dark:text-stone-700")} 
                />
              ))}
            </div>
          )}

          {status && (
            <span className={cn(
              "px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider border",
              "bg-stone-50 border-stone-200 text-stone-600 dark:bg-stone-800 dark:border-stone-700 dark:text-stone-400"
            )}>
              {status}
            </span>
          )}
        </div>
        
        {/* Secondary Text (e.g. Author/Director) */}
        {textField && item.fieldValues[textField.id] && (
            <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-1">
                {item.fieldValues[textField.id]}
            </p>
        )}

        {/* Tags */}
        {tagsField && Array.isArray(item.fieldValues[tagsField.id]) && item.fieldValues[tagsField.id].length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {item.fieldValues[tagsField.id].slice(0, 3).map((tag: string, i: number) => (
              <span key={i} className="text-[10px] text-stone-500 bg-stone-100 dark:bg-stone-800 dark:text-stone-400 px-1.5 rounded-sm">
                #{tag}
              </span>
            ))}
            {item.fieldValues[tagsField.id].length > 3 && (
                <span className="text-[10px] text-stone-400 px-1">+More</span>
            )}
          </div>
        )}
      </div>

      {/* Hover Action */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="bg-white/90 dark:bg-black/80 backdrop-blur rounded-full p-1.5 shadow-sm text-stone-600 dark:text-stone-300">
            <Lucide.MoreHorizontal size={14} />
        </div>
      </div>
    </div>
  );
};