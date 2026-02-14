import React from 'react';
import { Collection } from '../types';
import { cn, Icon } from './UI';
import * as Lucide from 'lucide-react';

interface SidebarProps {
  collections: Collection[];
  activeView: string;
  onSelectView: (view: string) => void;
  className?: string;
  onAddCollection: () => void;
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

const NavItem: React.FC<NavItemProps> = React.memo(({ id, icon, label, count, onClick, isActive }) => {
  return (
    <button
      onClick={() => onClick(id)}
      className={cn(
        "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-150 mb-0.5 group",
        isActive
          ? "bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900 shadow-sm font-medium"
          : "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800/60 hover:text-stone-900 dark:hover:text-stone-200"
      )}
    >
      <div className="flex items-center gap-2.5">
        <span className={cn(
          "transition-colors",
          isActive
            ? "text-stone-400 dark:text-stone-600"
            : "text-stone-400 dark:text-stone-500 group-hover:text-stone-600 dark:group-hover:text-stone-300"
        )}>
          {typeof icon === 'string' ? <Icon name={icon} size={15} /> : icon}
        </span>
        <span className="truncate">{label}</span>
      </div>
      {count !== undefined && (
        <span className={cn(
          "text-[10px] py-0.5 px-1.5 rounded-full min-w-[1.25rem] text-center font-medium transition-all",
          isActive
            ? "bg-white/15 dark:bg-black/10 text-stone-300 dark:text-stone-600"
            : "text-stone-400 opacity-0 group-hover:opacity-100 bg-stone-200/70 dark:bg-stone-700/70"
        )}>
          {count}
        </span>
      )}
    </button>
  );
});

export const Sidebar = React.memo(({ collections, activeView, onSelectView, className, onAddCollection }: SidebarProps) => {
  return (
    <div className={cn(
      "flex flex-col h-full bg-white dark:bg-stone-950 border-r border-stone-100 dark:border-stone-800/60 p-3",
      className
    )}>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-2 mb-6 pt-1">
        <div className="w-7 h-7 bg-stone-900 dark:bg-stone-50 rounded-lg flex items-center justify-center shadow-sm">
          <span className="text-stone-50 dark:text-stone-900 font-serif font-bold text-[15px] leading-none">S</span>
        </div>
        <span className="font-serif font-semibold text-[17px] tracking-tight text-stone-900 dark:text-stone-100">Shelf</span>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar space-y-5">
        {/* Library Views */}
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-600 px-3 mb-1.5">Library</p>
          <NavItem
            id="all"
            icon={<Lucide.Layers size={15} />}
            label="All Items"
            isActive={activeView === 'all'}
            onClick={onSelectView}
          />
          <NavItem
            id="favorites"
            icon={<Lucide.Heart size={15} />}
            label="Favorites"
            isActive={activeView === 'favorites'}
            onClick={onSelectView}
          />
        </div>

        {/* Collections */}
        <div>
          <div className="flex items-center justify-between px-3 mb-1.5">
            <p className="text-[9px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-600">Collections</p>
            <button
              onClick={onAddCollection}
              className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-300 transition-colors p-0.5 rounded"
              title="New Collection"
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
            collections.map(col => (
              <NavItem
                key={col.id}
                id={col.id}
                icon={col.icon}
                label={col.name}
                count={col.itemIds.length}
                color={col.color}
                isActive={activeView === col.id}
                onClick={onSelectView}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
});
