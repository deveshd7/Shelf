import React from 'react';
import { Collection } from '../types';
import { cn, Icon } from './UI';
import * as Lucide from 'lucide-react';

interface SidebarProps {
  collections: Collection[];
  activeView: string; // 'all', 'favorites', or collectionId
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

const NavItem: React.FC<NavItemProps> = ({ id, icon, label, count, color, onClick, isActive }) => {
  return (
    <button
      onClick={() => onClick(id)}
      className={cn(
        "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors mb-1 group",
        isActive 
          ? "bg-stone-200 dark:bg-stone-800 text-stone-900 dark:text-stone-50 font-medium" 
          : "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-900"
      )}
    >
      <div className="flex items-center gap-3">
        <span className={cn("transition-colors", isActive ? "text-stone-900 dark:text-stone-50" : "text-stone-400")}>
          {typeof icon === 'string' ? <Icon name={icon} size={16} /> : icon}
        </span>
        <span className="truncate">{label}</span>
      </div>
      {count !== undefined && (
        <span className={cn(
            "text-[10px] py-0.5 px-1.5 rounded-full transition-all",
            isActive ? "bg-white dark:bg-stone-700 shadow-sm" : "bg-transparent text-stone-400 opacity-0 group-hover:opacity-100"
        )}>
          {count}
        </span>
      )}
    </button>
  );
};

export const Sidebar = ({ collections, activeView, onSelectView, className, onAddCollection }: SidebarProps) => {

  return (
    <div className={cn("flex flex-col h-full bg-stone-50/50 dark:bg-stone-950/50 backdrop-blur-sm border-r border-stone-200 dark:border-stone-800 p-4", className)}>
      <div className="flex items-center gap-3 px-3 mb-8">
        <div className="w-8 h-8 bg-stone-900 dark:bg-stone-100 rounded-lg flex items-center justify-center text-white dark:text-stone-900 font-serif font-bold text-lg">
            S
        </div>
        <span className="font-serif font-semibold text-xl tracking-tight text-stone-900 dark:text-stone-100">Shelf</span>
      </div>

      <div className="space-y-6 flex-1 overflow-y-auto no-scrollbar">
        {/* Main Views */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 px-3 mb-2">Library</div>
          <NavItem 
            id="all" 
            icon={<Lucide.Layers size={16} />} 
            label="All Items" 
            isActive={activeView === 'all'}
            onClick={onSelectView}
          />
          <NavItem 
            id="favorites" 
            icon={<Lucide.Heart size={16} />} 
            label="Favorites" 
            isActive={activeView === 'favorites'}
            onClick={onSelectView}
          />
        </div>

        {/* Collections */}
        <div>
           <div className="flex items-center justify-between px-3 mb-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Collections</div>
                <button 
                    onClick={onAddCollection}
                    className="text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
                >
                    <Lucide.Plus size={14} />
                </button>
           </div>
           
           {collections.length === 0 && (
               <div className="px-3 py-4 text-center">
                   <p className="text-xs text-stone-400">No collections yet.</p>
               </div>
           )}

           {collections.map(col => (
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
           ))}
        </div>
      </div>

      {/* Footer / User */}
      <div className="border-t border-stone-200 dark:border-stone-800 pt-4 mt-2">
        <div className="flex items-center gap-3 px-3">
             <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-200 to-amber-500" />
             <div className="flex flex-col">
                 <span className="text-xs font-medium text-stone-900 dark:text-stone-100">My Space</span>
                 <span className="text-[10px] text-stone-500">Free Plan</span>
             </div>
        </div>
      </div>
    </div>
  );
};