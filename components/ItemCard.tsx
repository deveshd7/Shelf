import React from 'react';
import { Item, Collection } from '../types';
import { cn, Icon } from './UI';
import * as Lucide from 'lucide-react';
import { motion } from 'framer-motion';

interface ItemCardProps {
  item: Item;
  collection: Collection;
  onClick: () => void;
  index?: number;
  showCollectionBadge?: boolean;
}

const collectionBadgeBg: Record<string, string> = {
  stone:   'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300',
  amber:   'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  rose:    'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  indigo:  'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
};

const cardAccentBorder: Record<string, string> = {
  stone:   'border-l-stone-300 dark:border-l-stone-600',
  amber:   'border-l-amber-400 dark:border-l-amber-600',
  rose:    'border-l-rose-400 dark:border-l-rose-500',
  indigo:  'border-l-indigo-400 dark:border-l-indigo-500',
  emerald: 'border-l-emerald-400 dark:border-l-emerald-500',
};

const getStatusStyle = (status: string): string => {
  const s = status.toLowerCase();
  if (s === 'done' || s === 'complete' || s === 'completed' || s === 'watched' || s === 'read') {
    return 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800/40 dark:text-emerald-400';
  }
  if (s.endsWith('ing')) {
    return 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800/40 dark:text-amber-400';
  }
  return 'bg-stone-50 border-stone-200 text-stone-500 dark:bg-stone-800/60 dark:border-stone-700 dark:text-stone-400';
};

export const ItemCard: React.FC<ItemCardProps> = React.memo(({ item, collection, onClick, index = 0, showCollectionBadge = false }) => {
  const titleField = collection.fields.find(f => f.name.toLowerCase() === 'title') || collection.fields[0];
  const imageField = collection.fields.find(f => f.type === 'image');
  const ratingField = collection.fields.find(f => f.type === 'rating');
  const statusField = collection.fields.find(f => f.type === 'status');
  const tagsField = collection.fields.find(f => f.type === 'tags');
  const textField = collection.fields.find(f => f.type === 'text' && f.id !== titleField?.id);

  const title = titleField ? item.fieldValues[titleField.id] : 'Untitled';
  const imageUrl = imageField ? item.fieldValues[imageField.id] : null;
  const rating = ratingField ? item.fieldValues[ratingField.id] : null;
  const status = statusField ? item.fieldValues[statusField.id] : null;

  return (
    <motion.div
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
      role="button"
      tabIndex={0}
      aria-label={`Open ${String(title || 'item')}${item.isFavorite ? ' (favorited)' : ''}`}
      className={cn(
        "group relative break-inside-avoid rounded-xl border bg-white dark:bg-stone-900 shadow-sm hover:shadow-md cursor-pointer overflow-hidden mb-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2",
        item.isFavorite
          ? "border-amber-300/60 dark:border-amber-600/30 ring-1 ring-amber-200/60 dark:ring-amber-700/20"
          : "border-stone-200 dark:border-stone-800",
        !imageUrl && "border-l-[3px]",
        !imageUrl && (cardAccentBorder[collection.color] || 'border-l-stone-300 dark:border-l-stone-600')
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28, delay: Math.min(index * 0.04, 0.25) }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Cover Image — portrait ratio for books/movies */}
      {imageUrl && (
        <div className="aspect-[2/3] w-full overflow-hidden bg-stone-100 dark:bg-stone-800 relative">
          <img
            src={imageUrl}
            alt={String(title)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent" />

          {/* Favorite badge */}
          {item.isFavorite && (
            <div className="absolute top-2.5 right-2.5">
              <div className="bg-amber-400/90 backdrop-blur-sm rounded-full p-1 shadow-sm">
                <Lucide.Heart size={10} className="fill-white text-white" />
              </div>
            </div>
          )}

          {/* Star rating over image */}
          {rating !== undefined && rating !== null && Number(rating) > 0 && (
            <div className="absolute bottom-2.5 left-3 flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Lucide.Star
                  key={i}
                  size={10}
                  className={cn(
                    "drop-shadow-sm",
                    i < Number(rating) ? "fill-amber-400 text-amber-400" : "fill-white/25 text-white/25"
                  )}
                />
              ))}
            </div>
          )}

          {/* Status badge over image */}
          {status && (
            <div className="absolute bottom-2.5 right-3">
              <span className="text-[9px] font-semibold uppercase tracking-wide text-white/90 bg-black/30 backdrop-blur-sm px-1.5 py-0.5 rounded-md">
                {status}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Card Content */}
      <div className={cn("space-y-2", imageUrl ? "p-4" : "px-4 py-4")}>
        {/* Title row */}
        <div className="flex items-start justify-between gap-2">
          <h3 className={cn(
            "font-semibold text-stone-900 dark:text-stone-100 leading-snug line-clamp-2",
            !imageUrl ? "text-base" : "text-sm"
          )}>
            {title || <span className="text-stone-400 italic font-normal">No Title</span>}
          </h3>
          {item.isFavorite && !imageUrl && (
            <Lucide.Heart size={13} className="fill-amber-400 text-amber-400 flex-shrink-0 mt-0.5" />
          )}
        </div>

        {/* Secondary text (e.g. Author / Director) */}
        {textField && item.fieldValues[textField.id] && (
          <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-1">
            {item.fieldValues[textField.id]}
          </p>
        )}

        {/* Rating + Status (only shown when there's no image) */}
        {!imageUrl && (rating !== null && rating !== undefined || status) && (
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            {rating !== undefined && rating !== null && Number(rating) > 0 && (
              <div className="flex text-amber-400 gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Lucide.Star
                    key={i}
                    size={11}
                    className={cn(i < Number(rating) ? "fill-current" : "text-stone-200 dark:text-stone-700")}
                  />
                ))}
              </div>
            )}
            {status && (
              <span className={cn(
                "px-1.5 py-0.5 rounded-md text-[10px] font-medium border leading-none",
                getStatusStyle(String(status))
              )}>
                {status}
              </span>
            )}
          </div>
        )}

        {/* Tags */}
        {tagsField && Array.isArray(item.fieldValues[tagsField.id]) && item.fieldValues[tagsField.id].length > 0 && (
          <div className="flex flex-wrap gap-1 pt-0.5">
            {item.fieldValues[tagsField.id].slice(0, 3).map((tag: string, i: number) => (
              <span key={i} className="text-[10px] text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-1.5 py-0.5 rounded">
                #{tag}
              </span>
            ))}
            {item.fieldValues[tagsField.id].length > 3 && (
              <span className="text-[10px] text-stone-400 dark:text-stone-600 px-1">
                +{item.fieldValues[tagsField.id].length - 3}
              </span>
            )}
          </div>
        )}

        {/* Collection badge — shown in "All Items" view */}
        {showCollectionBadge && (
          <div className="pt-0.5">
            <span className={cn(
              "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wide",
              collectionBadgeBg[collection.color] || collectionBadgeBg.stone
            )}>
              <Icon name={collection.icon} size={9} />
              {collection.name}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
});
