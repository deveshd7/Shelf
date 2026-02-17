import React, { useState } from 'react';
import { Collection, Item } from '../types';
import { cn, Icon } from './UI';
import * as Lucide from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  collections: Collection[];
  activeView: string;
  onSelectView: (view: string) => void;
  className?: string;
  onAddCollection: () => void;
  onEditCollection: (col: Collection) => void;
  onDeleteCollection: (col: Collection) => void;
  items: Record<string, Item>;
}

interface NavItemProps {
  id: string;
  icon: any;
  label: string;
  count?: number;
  color?: string;
  onClick: (id: string) => void;
  isActive: boolean;
}

const collectionIconColor: Record<string, string> = {
  stone:   'text-stone-500 dark:text-stone-400',
  amber:   'text-amber-500 dark:text-amber-400',
  rose:    'text-rose-500 dark:text-rose-400',
  indigo:  'text-indigo-500 dark:text-indigo-400',
  emerald: 'text-emerald-500 dark:text-emerald-400',
};

const NavItem: React.FC<NavItemProps> = React.memo(({ id, icon, label, count, color, onClick, isActive }) => {
  return (
    <motion.button
      onClick={() => onClick(id)}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors duration-150 mb-0.5 group cursor-pointer",
        isActive
          ? "bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900 shadow-sm font-medium"
          : "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800/60 hover:text-stone-900 dark:hover:text-stone-200"
      )}
      whileHover={{ x: 2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      <div className="flex items-center gap-2.5">
        <span className={cn(
          "transition-colors",
          isActive
            ? "text-stone-400 dark:text-stone-600"
            : color
              ? collectionIconColor[color] || 'text-stone-400'
              : "text-stone-400 dark:text-stone-500 group-hover:text-stone-600 dark:group-hover:text-stone-300"
        )} aria-hidden="true">
          {typeof icon === 'string' ? <Icon name={icon} size={15} /> : icon}
        </span>
        <span className="truncate">{label}</span>
      </div>
      {count !== undefined && (
        <span className={cn(
          "text-[10px] py-0.5 px-1.5 rounded-full min-w-[1.25rem] text-center font-medium transition-all",
          isActive
            ? "bg-white/15 dark:bg-black/10 text-stone-300 dark:text-stone-600"
            : "text-stone-400 bg-stone-200/70 dark:bg-stone-700/70"
        )} aria-label={`${count} item${count !== 1 ? 's' : ''}`}>
          {count}
        </span>
      )}
    </motion.button>
  );
});

interface CollectionNavItemProps {
  collection: Collection;
  isActive: boolean;
  itemCount: number;
  onSelect: (id: string) => void;
  onEdit: (col: Collection) => void;
  onDelete: (col: Collection) => void;
}

const CollectionNavItem: React.FC<CollectionNavItemProps> = React.memo(({
  collection,
  isActive,
  itemCount,
  onSelect,
  onEdit,
  onDelete,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative mb-0.5"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.button
        onClick={() => onSelect(collection.id)}
        aria-current={isActive ? 'page' : undefined}
        className={cn(
          "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors duration-150 group cursor-pointer",
          isActive
            ? "bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900 shadow-sm font-medium"
            : "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800/60 hover:text-stone-900 dark:hover:text-stone-200"
        )}
        whileHover={{ x: 2 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className={cn(
            "transition-colors shrink-0",
            isActive
              ? "text-stone-400 dark:text-stone-600"
              : collectionIconColor[collection.color] || 'text-stone-400'
          )} aria-hidden="true">
            <Icon name={collection.icon} size={15} />
          </span>
          <span className="truncate">{collection.name}</span>
        </div>

        <AnimatePresence mode="wait">
          {isHovered && !isActive ? (
            <motion.div
              key="actions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="flex items-center gap-0.5 shrink-0"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(collection); }}
                aria-label={`Edit ${collection.name}`}
                className="p-1 rounded text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 dark:hover:text-stone-200 dark:hover:bg-stone-700/60 transition-colors"
              >
                <Lucide.Pencil size={12} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(collection); }}
                aria-label={`Delete ${collection.name}`}
                className="p-1 rounded text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <Lucide.Trash2 size={12} />
              </button>
            </motion.div>
          ) : (
            <motion.span
              key="count"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              className={cn(
                "text-[10px] py-0.5 px-1.5 rounded-full min-w-[1.25rem] text-center font-medium transition-all shrink-0",
                isActive
                  ? "bg-white/15 dark:bg-black/10 text-stone-300 dark:text-stone-600"
                  : "text-stone-400 bg-stone-200/70 dark:bg-stone-700/70"
              )}
              aria-label={`${itemCount} item${itemCount !== 1 ? 's' : ''}`}
            >
              {itemCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
});

export const Sidebar = React.memo(({
  collections,
  activeView,
  onSelectView,
  className,
  onAddCollection,
  onEditCollection,
  onDeleteCollection,
  items,
}: SidebarProps) => {
  const totalItems = Object.keys(items).length;
  const favoriteCount = Object.values(items).filter(i => i.isFavorite).length;

  return (
    <div className={cn(
      "flex flex-col h-full bg-white dark:bg-stone-950 border-r border-stone-100 dark:border-stone-800/60 p-3",
      className
    )}>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-2 mb-6 pt-1">
        <div className="w-7 h-7 bg-stone-900 dark:bg-stone-50 rounded-lg flex items-center justify-center shadow-sm ring-1 ring-black/5 dark:ring-white/10" aria-hidden="true">
          <Lucide.BookMarked size={13} className="text-stone-50 dark:text-stone-900" />
        </div>
        <span className="font-serif font-semibold text-[17px] tracking-tight text-stone-900 dark:text-stone-100">Shelf</span>
      </div>

      <nav aria-label="Shelf navigation" className="flex-1 overflow-y-auto no-scrollbar space-y-5">
        {/* Library Views */}
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-600 px-3 mb-1.5" aria-hidden="true">Library</p>
          <NavItem
            id="all"
            icon={<Lucide.Layers size={15} />}
            label="All Items"
            count={totalItems}
            isActive={activeView === 'all'}
            onClick={onSelectView}
          />
          <NavItem
            id="favorites"
            icon={<Lucide.Heart size={15} />}
            label="Favorites"
            count={favoriteCount}
            isActive={activeView === 'favorites'}
            onClick={onSelectView}
          />
        </div>

        {/* Collections */}
        <div>
          <div className="flex items-center justify-between px-3 mb-1.5">
            <p className="text-[9px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-600" aria-hidden="true">Collections</p>
            <button
              onClick={onAddCollection}
              aria-label="New collection"
              className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-300 transition-colors p-0.5 rounded cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400"
            >
              <Lucide.Plus size={13} />
            </button>
          </div>

          {collections.length === 0 ? (
            <div className="px-3 py-4 text-center space-y-1.5">
              <p className="text-xs text-stone-400 dark:text-stone-600">No collections yet</p>
              <button
                onClick={onAddCollection}
                className="text-xs font-medium text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 transition-colors underline underline-offset-2"
              >
                Create one
              </button>
            </div>
          ) : (
            collections.map(col => {
              const itemCount = Object.values(items).filter(i => i.collectionId === col.id).length;
              return (
                <CollectionNavItem
                  key={col.id}
                  collection={col}
                  isActive={activeView === col.id}
                  itemCount={itemCount}
                  onSelect={onSelectView}
                  onEdit={onEditCollection}
                  onDelete={onDeleteCollection}
                />
              );
            })
          )}
        </div>
      </nav>
    </div>
  );
});
