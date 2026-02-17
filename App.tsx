import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AppState, Item, Collection, SortOption, FilterOptions } from './types';
import { SEED_DATA, COLORS } from './constants';
import { Sidebar } from './components/Sidebar';
import { ItemCard } from './components/ItemCard';
import { ItemModal } from './components/ItemModal';
import { CollectionModal } from './components/CollectionModal';
import { Button, Input, Sheet, Icon, cn, AlertDialog } from './components/UI';
import * as Lucide from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

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
  const [appState, setAppState] = useStickyState<AppState>(SEED_DATA, 'shelf-app-data-v2');
  const [activeView, setActiveView] = useState<string>('all'); // 'all', 'favorites', or collection ID
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('date_desc');

  // UI State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [collectionModalOpen, setCollectionModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  // Edit collection state
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);

  // AlertDialog state
  const [alertDialog, setAlertDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  } | null>(null);

  // Filter state (ephemeral — resets on reload)
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({ onlyHasRating: false, statusValues: [] });

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
        return Object.values(i.fieldValues).some(val =>
          String(val).toLowerCase().includes(lowerQ)
        );
      });
    }

    // 3. Filter options
    if (filterOptions.onlyHasRating) {
      items = items.filter(i => {
        const col = appState.collections.find(c => c.id === i.collectionId);
        const ratingField = col?.fields.find(f => f.type === 'rating');
        return ratingField ? Number(i.fieldValues[ratingField.id] || 0) > 0 : false;
      });
    }
    if (filterOptions.statusValues.length > 0) {
      items = items.filter(i => {
        const col = appState.collections.find(c => c.id === i.collectionId);
        const sf = col?.fields.find(f => f.type === 'status');
        return sf ? filterOptions.statusValues.includes(String(i.fieldValues[sf.id] || '')) : false;
      });
    }

    // 4. Sorting
    return items.sort((a, b) => {
      const getTitle = (itm: Item) => {
        const col = appState.collections.find(c => c.id === itm.collectionId);
        const titleField = col?.fields.find(f => f.name === 'Title') || col?.fields[0];
        return titleField ? String(itm.fieldValues[titleField.id] || '') : '';
      };

      const getRating = (itm: Item) => {
        const col = appState.collections.find(c => c.id === itm.collectionId);
        const ratingField = col?.fields.find(f => f.type === 'rating');
        return ratingField ? Number(itm.fieldValues[ratingField.id] || 0) : 0;
      };

      const getStatus = (itm: Item) => {
        const col = appState.collections.find(c => c.id === itm.collectionId);
        const sf = col?.fields.find(f => f.type === 'status');
        return sf ? String(itm.fieldValues[sf.id] || '') : '';
      };

      switch (sortOption) {
        case 'date_asc': return new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime();
        case 'date_desc': return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
        case 'title_asc': return getTitle(a).localeCompare(getTitle(b));
        case 'title_desc': return getTitle(b).localeCompare(getTitle(a));
        case 'rating_desc': return getRating(b) - getRating(a);
        case 'rating_asc': return getRating(a) - getRating(b);
        case 'status_asc': return getStatus(a).localeCompare(getStatus(b));
        default: return 0;
      }
    });
  }, [appState.items, activeView, searchQuery, sortOption, appState.collections, filterOptions]);

  const availableStatuses = useMemo(() => {
    const set = new Set<string>();
    filteredItems.forEach(item => {
      const col = appState.collections.find(c => c.id === item.collectionId);
      const sf = col?.fields.find(f => f.type === 'status');
      if (sf && item.fieldValues[sf.id]) set.add(String(item.fieldValues[sf.id]));
    });
    return Array.from(set).sort();
  }, [filteredItems, appState.collections]);

  // --- Handlers ---

  const handleCreateCollection = useCallback((newCol: Collection) => {
    setAppState(prev => ({
      ...prev,
      collections: [...prev.collections, newCol]
    }));
    setActiveView(newCol.id);
  }, []);

  const handleEditCollection = useCallback((col: Collection) => {
    setEditingCollection(col);
    setCollectionModalOpen(true);
  }, []);

  const handleEditCollectionSave = useCallback((col: Collection) => {
    setAppState(prev => ({
      ...prev,
      collections: prev.collections.map(c => c.id === col.id ? col : c)
    }));
    setEditingCollection(null);
  }, []);

  const handleDeleteCollection = useCallback((id: string) => {
    setAppState(prev => {
      const newItems = { ...prev.items };
      Object.values(newItems).forEach(item => {
        if (item.collectionId === id) delete newItems[item.id];
      });
      return {
        ...prev,
        collections: prev.collections.filter(c => c.id !== id),
        items: newItems,
      };
    });
    setActiveView(prev => prev === id ? 'all' : prev);
  }, []);

  const confirmDeleteCollection = useCallback((col: Collection) => {
    const itemCount = Object.values(appState.items).filter(i => i.collectionId === col.id).length;
    setAlertDialog({
      open: true,
      title: `Delete "${col.name}"?`,
      description: itemCount > 0
        ? `This will permanently delete the collection and all ${itemCount} item${itemCount !== 1 ? 's' : ''} inside it.`
        : 'This will permanently delete the collection.',
      onConfirm: () => {
        handleDeleteCollection(col.id);
        setAlertDialog(null);
      },
    });
  }, [appState.items, handleDeleteCollection]);

  const confirmDeleteItem = useCallback((itemId: string) => {
    setAlertDialog({
      open: true,
      title: 'Delete item?',
      description: 'This will permanently remove this item from your shelf.',
      onConfirm: () => {
        handleDeleteItem(itemId);
        setItemModalOpen(false);
        setAlertDialog(null);
      },
    });
  }, []);

  const handleSaveItem = useCallback((item: Item) => {
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
  }, []);

  const handleDeleteItem = useCallback((itemId: string) => {
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
  }, []);

  const openNewItemModal = useCallback(() => {
    if (activeView === 'all' || activeView === 'favorites') {
      if (appState.collections.length > 0) {
        setActiveView(appState.collections[0].id);
      }
    }
    setSelectedItem(null);
    setItemModalOpen(true);
  }, [activeView, appState.collections]);

  const toggleDarkMode = useCallback(() => {
    setAppState(prev => ({ ...prev, darkMode: !prev.darkMode }));
  }, []);

  const handleOpenCollectionModal = useCallback(() => {
    setEditingCollection(null);
    setCollectionModalOpen(true);
  }, []);

  const toggleStatusFilter = (status: string) => {
    setFilterOptions(prev => ({
      ...prev,
      statusValues: prev.statusValues.includes(status)
        ? prev.statusValues.filter(s => s !== status)
        : [...prev.statusValues, status],
    }));
  };

  const hasActiveFilters = filterOptions.onlyHasRating || filterOptions.statusValues.length > 0;

  // --- Effects ---
  useEffect(() => {
    if (appState.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [appState.darkMode]);

  // --- Render ---

  const modalCollection = currentCollection || appState.collections[0];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-50 font-sans">

      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-60 h-full shrink-0" aria-label="Navigation">
        <Sidebar
          collections={appState.collections}
          activeView={activeView}
          onSelectView={setActiveView}
          onAddCollection={handleOpenCollectionModal}
          onEditCollection={handleEditCollection}
          onDeleteCollection={confirmDeleteCollection}
          items={appState.items}
        />
      </aside>

      {/* Mobile Sidebar Sheet */}
      <Sheet isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)}>
        <Sidebar
          collections={appState.collections}
          activeView={activeView}
          onSelectView={(id) => { setActiveView(id); setIsSidebarOpen(false); }}
          className="bg-transparent border-none p-0"
          onAddCollection={() => { handleOpenCollectionModal(); setIsSidebarOpen(false); }}
          onEditCollection={(col) => { handleEditCollection(col); setIsSidebarOpen(false); }}
          onDeleteCollection={(col) => { confirmDeleteCollection(col); setIsSidebarOpen(false); }}
          items={appState.items}
        />
      </Sheet>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full min-w-0 relative">

        {/* Top Header */}
        <header className="h-16 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between px-4 sm:px-8 bg-white/50 dark:bg-stone-950/50 backdrop-blur-sm z-10">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    aria-label="Open navigation"
                    aria-expanded={isSidebarOpen}
                    className="md:hidden p-2 -ml-2 text-stone-500 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                >
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
                <button
                    onClick={() => setMobileSearchOpen(v => !v)}
                    aria-label={mobileSearchOpen ? 'Close search' : 'Search items'}
                    aria-expanded={mobileSearchOpen}
                    className="sm:hidden p-2 text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
                >
                    {mobileSearchOpen ? <Lucide.X size={18} /> : <Lucide.Search size={18} />}
                </button>

                <div className="relative hidden sm:block">
                    <Lucide.Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" size={14} aria-hidden="true" />
                    <input
                        type="search"
                        aria-label="Search items"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-9 w-48 lg:w-64 rounded-full bg-stone-100 dark:bg-stone-900 border-none pl-9 pr-8 text-sm focus:ring-2 focus:ring-stone-400 outline-none transition-all"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            aria-label="Clear search"
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-300 transition-colors rounded-full p-0.5"
                        >
                            <Lucide.X size={13} />
                        </button>
                    )}
                </div>

                <button
                    onClick={toggleDarkMode}
                    aria-label={appState.darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                    className="p-2 text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
                >
                    {appState.darkMode ? <Lucide.Sun size={18} /> : <Lucide.Moon size={18} />}
                </button>
            </div>
        </header>

        {/* Mobile Search Bar */}
        {mobileSearchOpen && (
          <div className="sm:hidden px-4 py-2.5 border-b border-stone-100 dark:border-stone-800/60 bg-stone-50/50 dark:bg-stone-950/50">
            <div className="relative">
              <Lucide.Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" size={14} aria-hidden="true" />
              <input
                autoFocus
                type="search"
                aria-label="Search items"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full rounded-full bg-stone-100 dark:bg-stone-900 border-none pl-9 pr-8 text-sm focus:ring-2 focus:ring-stone-400 outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-300 transition-colors cursor-pointer"
                >
                  <Lucide.X size={13} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Toolbar (Sort/Filter) */}
        <div className="min-h-[44px] border-b border-stone-100 dark:border-stone-800/60 flex flex-wrap items-center px-4 sm:px-8 gap-x-3 gap-y-1.5 py-1.5 overflow-x-auto no-scrollbar bg-stone-50/50 dark:bg-stone-950/50">
            <div className="flex items-center gap-2">
                <Lucide.ArrowUpDown size={12} className="text-stone-400" aria-hidden="true" />
                <label htmlFor="sort-select" className="sr-only">Sort items by</label>
                <select
                    id="sort-select"
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value as SortOption)}
                    className="bg-transparent text-xs font-medium text-stone-500 dark:text-stone-400 border-none outline-none cursor-pointer hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
                >
                    <option value="date_desc">Newest first</option>
                    <option value="date_asc">Oldest first</option>
                    <option value="title_asc">Title (A–Z)</option>
                    <option value="title_desc">Title (Z–A)</option>
                    <option value="rating_desc">Highest rated</option>
                    <option value="rating_asc">Lowest rated</option>
                    <option value="status_asc">Status (A–Z)</option>
                </select>
            </div>

            <div className="w-px h-3.5 bg-stone-200 dark:bg-stone-700 shrink-0" aria-hidden="true" />

            {/* Filter chips */}
            <div className="flex items-center gap-1.5 flex-wrap">
                <button
                    onClick={() => setFilterOptions(prev => ({ ...prev, onlyHasRating: !prev.onlyHasRating }))}
                    aria-pressed={filterOptions.onlyHasRating}
                    className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border transition-colors",
                        filterOptions.onlyHasRating
                            ? "bg-amber-100 border-amber-300 text-amber-700 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-400"
                            : "bg-transparent border-stone-200 text-stone-500 hover:border-stone-400 dark:border-stone-700 dark:text-stone-400"
                    )}
                >
                    <Lucide.Star size={9} className={filterOptions.onlyHasRating ? "fill-current" : ""} />
                    Rated
                </button>
                {availableStatuses.map(status => (
                    <button
                        key={status}
                        onClick={() => toggleStatusFilter(status)}
                        aria-pressed={filterOptions.statusValues.includes(status)}
                        className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border transition-colors",
                            filterOptions.statusValues.includes(status)
                                ? "bg-stone-900 border-stone-900 text-white dark:bg-stone-100 dark:border-stone-100 dark:text-stone-900"
                                : "bg-transparent border-stone-200 text-stone-500 hover:border-stone-400 dark:border-stone-700 dark:text-stone-400"
                        )}
                    >
                        {status}
                    </button>
                ))}
                {hasActiveFilters && (
                    <button
                        onClick={() => setFilterOptions({ onlyHasRating: false, statusValues: [] })}
                        className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-medium text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
                    >
                        <Lucide.X size={9} />
                        Clear
                    </button>
                )}
            </div>

            <span role="status" aria-live="polite" aria-atomic="true" className="text-xs text-stone-400 dark:text-stone-600 tabular-nums ml-auto">
                {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
            </span>
        </div>

        {/* Grid Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
            {filteredItems.length > 0 ? (
                <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6 pb-20">
                    {filteredItems.map((item, index) => {
                        const col = appState.collections.find(c => c.id === item.collectionId);
                        if (!col) return null;
                        return (
                            <ItemCard
                                key={item.id}
                                index={index}
                                item={item}
                                collection={col}
                                showCollectionBadge={activeView === 'all'}
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
                    <div className="w-14 h-14 bg-stone-100 dark:bg-stone-900 rounded-2xl flex items-center justify-center mb-5">
                        {searchQuery
                            ? <Lucide.SearchX size={26} className="opacity-40" />
                            : activeView === 'favorites'
                                ? <Lucide.Heart size={26} className="opacity-40" />
                                : <Lucide.PackageOpen size={26} className="opacity-40" />
                        }
                    </div>
                    <p className="text-xl font-serif text-stone-700 dark:text-stone-300 mb-1.5">
                        {searchQuery
                            ? 'No results found'
                            : activeView === 'favorites'
                                ? 'No favorites yet'
                                : appState.collections.length === 0
                                    ? 'Create a collection'
                                    : 'Nothing here yet'}
                    </p>
                    <p className="text-sm text-stone-400 mb-6">
                        {searchQuery
                            ? `No items match "${searchQuery}"`
                            : activeView === 'favorites'
                                ? 'Heart any item to save it here'
                                : appState.collections.length === 0
                                    ? 'Organise your interests into collections.'
                                    : 'Add items to start filling this shelf.'}
                    </p>
                    {searchQuery ? (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="flex items-center gap-2 px-4 py-2 bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900 rounded-lg text-sm font-medium hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors shadow-sm"
                        >
                            <Lucide.X size={15} />
                            Clear search
                        </button>
                    ) : appState.collections.length === 0 ? (
                        <button
                            onClick={() => setCollectionModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900 rounded-lg text-sm font-medium hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors shadow-sm"
                        >
                            <Lucide.Plus size={15} />
                            New Collection
                        </button>
                    ) : currentCollection && (
                        <button
                            onClick={openNewItemModal}
                            className="flex items-center gap-2 px-4 py-2 bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900 rounded-lg text-sm font-medium hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors shadow-sm"
                        >
                            <Lucide.Plus size={15} />
                            Add Item
                        </button>
                    )}
                </div>
            )}
        </div>

        {/* Floating Action Button */}
        {appState.collections.length > 0 && (
            <button
                onClick={openNewItemModal}
                aria-label="Add new item"
                className="absolute bottom-8 right-8 h-13 w-13 rounded-full bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900 shadow-lg hover:-translate-y-1 hover:shadow-xl transition-all flex items-center justify-center z-20 group cursor-pointer"
                style={{ height: '3.25rem', width: '3.25rem' }}
            >
                <Lucide.Plus size={22} className="group-hover:rotate-90 transition-transform duration-300" aria-hidden="true" />
            </button>
        )}
      </main>

      {/* Modals */}
      {modalCollection && (
        <ItemModal
            isOpen={itemModalOpen}
            onClose={() => setItemModalOpen(false)}
            item={selectedItem}
            collection={modalCollection}
            onSave={handleSaveItem}
            onDelete={confirmDeleteItem}
        />
      )}

      <CollectionModal
        isOpen={collectionModalOpen}
        onClose={() => { setCollectionModalOpen(false); setEditingCollection(null); }}
        onSave={editingCollection ? handleEditCollectionSave : handleCreateCollection}
        collection={editingCollection}
      />

      {alertDialog && (
        <AlertDialog
          isOpen={alertDialog.open}
          title={alertDialog.title}
          description={alertDialog.description}
          confirmLabel="Delete"
          variant="danger"
          onConfirm={alertDialog.onConfirm}
          onCancel={() => setAlertDialog(null)}
        />
      )}
    </div>
  );
};

export default App;
