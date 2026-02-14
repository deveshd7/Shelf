import React, { useState, useEffect, useMemo } from 'react';
import { AppState, Item, Collection, SortOption } from './types';
import { SEED_DATA, COLORS } from './constants';
import { Sidebar } from './components/Sidebar';
import { ItemCard } from './components/ItemCard';
import { ItemModal } from './components/ItemModal';
import { CollectionModal } from './components/CollectionModal';
import { Button, Input, Sheet, Icon, cn } from './components/UI';
import * as Lucide from 'lucide-react';

// Hook for localStorage persistence
function useStickyState<T>(defaultValue: T, key: string): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    const stickyValue = window.localStorage.getItem(key);
    return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

const App = () => {
  // --- State ---
  const [appState, setAppState] = useStickyState<AppState>(SEED_DATA, 'shelf-app-data-v1');
  const [activeView, setActiveView] = useState<string>('all'); // 'all', 'favorites', or collection ID
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('date_desc');
  
  // UI State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [collectionModalOpen, setCollectionModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  // --- Derived State ---
  const currentCollection = appState.collections.find(c => c.id === activeView);

  const filteredItems = useMemo(() => {
    let items = Object.values(appState.items);

    // 1. View Filter
    if (activeView === 'favorites') {
      items = items.filter(i => i.isFavorite);
    } else if (activeView !== 'all') {
      items = items.filter(i => i.collectionId === activeView);
    }

    // 2. Search Filter
    if (searchQuery) {
      const lowerQ = searchQuery.toLowerCase();
      items = items.filter(i => {
        // Search in all field values
        return Object.values(i.fieldValues).some(val => 
          String(val).toLowerCase().includes(lowerQ)
        );
      });
    }

    // 3. Sorting
    return items.sort((a, b) => {
      // Helper to find title field for a generic sort
      const getTitle = (itm: Item) => {
        const col = appState.collections.find(c => c.id === itm.collectionId);
        const titleField = col?.fields.find(f => f.name === 'Title') || col?.fields[0];
        return titleField ? String(itm.fieldValues[titleField.id] || '') : '';
      };

      const getRating = (itm: Item) => {
         const col = appState.collections.find(c => c.id === itm.collectionId);
         const ratingField = col?.fields.find(f => f.type === 'rating');
         return ratingField ? Number(itm.fieldValues[ratingField.id] || 0) : 0;
      }

      switch (sortOption) {
        case 'date_asc': return new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime();
        case 'date_desc': return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
        case 'title_asc': return getTitle(a).localeCompare(getTitle(b));
        case 'rating_desc': return getRating(b) - getRating(a);
        default: return 0;
      }
    });
  }, [appState.items, activeView, searchQuery, sortOption, appState.collections]);

  // --- Handlers ---

  const handleCreateCollection = (newCol: Collection) => {
    setAppState(prev => ({
      ...prev,
      collections: [...prev.collections, newCol]
    }));
    setActiveView(newCol.id);
  };

  const handleSaveItem = (item: Item) => {
    setAppState(prev => {
      const isNew = !prev.items[item.id];
      const updatedItems = { ...prev.items, [item.id]: item };
      
      let updatedCollections = prev.collections;
      if (isNew) {
        updatedCollections = prev.collections.map(c => 
          c.id === item.collectionId 
            ? { ...c, itemIds: [item.id, ...c.itemIds] }
            : c
        );
      }

      return {
        ...prev,
        items: updatedItems,
        collections: updatedCollections
      };
    });
  };

  const handleDeleteItem = (itemId: string) => {
      setAppState(prev => {
          const item = prev.items[itemId];
          if (!item) return prev;

          const newItems = { ...prev.items };
          delete newItems[itemId];

          const newCollections = prev.collections.map(c => 
            c.id === item.collectionId ? { ...c, itemIds: c.itemIds.filter(id => id !== itemId) } : c
          );

          return { ...prev, items: newItems, collections: newCollections };
      });
  };

  const openNewItemModal = () => {
    if (activeView === 'all' || activeView === 'favorites') {
        // If in overview, assume adding to the first collection or prompt (simplification: first collection)
        if (appState.collections.length > 0) {
            setActiveView(appState.collections[0].id);
        }
    }
    setSelectedItem(null);
    setItemModalOpen(true);
  };

  const toggleDarkMode = () => {
    setAppState(prev => ({ ...prev, darkMode: !prev.darkMode }));
  };

  // --- Effects ---
  useEffect(() => {
    if (appState.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [appState.darkMode]);


  // --- Render ---

  // Determine which collection definition to use for the "Add Item" modal
  // If in 'All' or 'Favorites', we pick the first collection as a default fallback or disable adding
  const modalCollection = currentCollection || appState.collections[0];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-50 font-sans">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 h-full shrink-0">
        <Sidebar 
          collections={appState.collections} 
          activeView={activeView} 
          onSelectView={setActiveView}
          onAddCollection={() => setCollectionModalOpen(true)}
        />
      </aside>

      {/* Mobile Sidebar Sheet */}
      <Sheet isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)}>
         <Sidebar 
          collections={appState.collections} 
          activeView={activeView} 
          onSelectView={(id) => { setActiveView(id); setIsSidebarOpen(false); }}
          className="bg-transparent border-none p-0"
          onAddCollection={() => { setCollectionModalOpen(true); setIsSidebarOpen(false); }}
        />
      </Sheet>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full min-w-0 relative">
        
        {/* Top Header */}
        <header className="h-16 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between px-4 sm:px-8 bg-white/50 dark:bg-stone-950/50 backdrop-blur-sm z-10">
            <div className="flex items-center gap-4">
                <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 -ml-2 text-stone-500">
                    <Lucide.Menu size={20} />
                </button>
                <div className="flex flex-col">
                    <h1 className="font-serif font-bold text-xl leading-none">
                        {currentCollection ? currentCollection.name : (activeView === 'favorites' ? 'Favorites' : 'All Items')}
                    </h1>
                    {currentCollection && (
                        <span className="text-xs text-stone-500 hidden sm:inline-block mt-1">
                            {currentCollection.description || `${filteredItems.length} items`}
                        </span>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="relative hidden sm:block">
                    <Lucide.Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" size={14} />
                    <input 
                        type="text" 
                        placeholder="Search..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-9 w-48 lg:w-64 rounded-full bg-stone-100 dark:bg-stone-900 border-none pl-9 pr-4 text-sm focus:ring-1 focus:ring-stone-400 outline-none transition-all"
                    />
                </div>
                
                <button onClick={toggleDarkMode} className="p-2 text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors">
                    {appState.darkMode ? <Lucide.Sun size={18} /> : <Lucide.Moon size={18} />}
                </button>
            </div>
        </header>

        {/* Toolbar (Sort/Filter) */}
        <div className="h-12 border-b border-stone-200 dark:border-stone-800 flex items-center px-4 sm:px-8 gap-4 overflow-x-auto no-scrollbar bg-stone-50/30 dark:bg-stone-950/30">
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Sort by</span>
            <select 
                value={sortOption} 
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="bg-transparent text-sm font-medium text-stone-600 dark:text-stone-300 border-none outline-none cursor-pointer hover:text-stone-900"
            >
                <option value="date_desc">Newest First</option>
                <option value="date_asc">Oldest First</option>
                <option value="title_asc">Title (A-Z)</option>
                <option value="rating_desc">Highest Rated</option>
            </select>
            
            <div className="w-px h-4 bg-stone-300 dark:bg-stone-700 mx-2" />
            
            <span className="text-xs text-stone-400">{filteredItems.length} items found</span>
        </div>

        {/* Grid Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
            {filteredItems.length > 0 ? (
                <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6 pb-20">
                    {filteredItems.map(item => {
                        const col = appState.collections.find(c => c.id === item.collectionId);
                        if (!col) return null;
                        return (
                            <ItemCard 
                                key={item.id} 
                                item={item} 
                                collection={col} 
                                onClick={() => {
                                    setSelectedItem(item);
                                    setItemModalOpen(true);
                                }} 
                            />
                        );
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-stone-400 pb-20">
                    <div className="w-16 h-16 bg-stone-100 dark:bg-stone-900 rounded-full flex items-center justify-center mb-4">
                        <Lucide.PackageOpen size={32} className="opacity-50" />
                    </div>
                    <p className="text-lg font-serif mb-2">The shelf is empty</p>
                    <p className="text-sm">Start collecting your interests.</p>
                </div>
            )}
        </div>

        {/* Floating Action Button */}
        {currentCollection && (
            <button 
                onClick={openNewItemModal}
                className="absolute bottom-8 right-8 h-14 w-14 rounded-full bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900 shadow-lg hover:scale-105 hover:shadow-xl transition-all flex items-center justify-center z-20 group"
            >
                <Lucide.Plus size={24} className="group-hover:rotate-90 transition-transform duration-300" />
            </button>
        )}
      </main>

      {/* Modals */}
      {itemModalOpen && modalCollection && (
        <ItemModal 
            isOpen={itemModalOpen}
            onClose={() => setItemModalOpen(false)}
            item={selectedItem}
            collection={modalCollection} // If viewing "All", selectedItem defines collection. If adding, uses currentCollection.
            onSave={handleSaveItem}
            onDelete={handleDeleteItem}
        />
      )}

      <CollectionModal 
        isOpen={collectionModalOpen}
        onClose={() => setCollectionModalOpen(false)}
        onSave={handleCreateCollection}
      />
    </div>
  );
};

export default App;