import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Item, Collection, FieldDefinition } from '../types';
import { Button, Input, Textarea, TagInput, cn } from './UI';
import * as Lucide from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ItemModalProps {
  item: Item | null; // If null, we are creating a new item
  collection: Collection;
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Item) => void;
  onDelete: (itemId: string) => void;
}

// --- Link Preview Hook ---
interface LinkPreviewData {
  title: string | null;
  image: string | null;
  domain: string | null;
}

function useLinkPreview(url: string): { data: LinkPreviewData | null; loading: boolean } {
  const [data, setData] = useState<LinkPreviewData | null>(null);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    const isValidUrl = /^https?:\/\/.+/.test(url);
    if (!isValidUrl) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    timerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}`);
        const json = await res.json();
        if (json.status === 'success') {
          let domain: string | null = null;
          try { domain = new URL(url).hostname.replace('www.', ''); } catch {}
          setData({
            title: json.data?.title ?? null,
            image: json.data?.image?.url ?? null,
            domain,
          });
        } else {
          setData(null);
        }
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    }, 700);

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [url]);

  return { data, loading };
}

export const ItemModal = ({ item, collection, isOpen, onClose, onSave, onDelete }: ItemModalProps) => {
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (item) {
        setFieldValues(item.fieldValues);
        setIsFavorite(item.isFavorite);
      } else {
        setFieldValues({});
        setIsFavorite(false);
      }
    }
  }, [isOpen, item]);

  // Escape key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleFieldChange = useCallback((fieldId: string, value: any) => {
    setFieldValues(prev => ({ ...prev, [fieldId]: value }));
  }, []);

  const handleSave = () => {
    const newItem: Item = {
      id: item ? item.id : Math.random().toString(36).substr(2, 9),
      collectionId: collection.id,
      dateAdded: item ? item.dateAdded : new Date().toISOString(),
      isFavorite,
      fieldValues,
    };
    onSave(newItem);
    onClose();
  };

  // --- Link preview ---
  const urlField = collection.fields.find(f => f.type === 'url');
  const imageField = collection.fields.find(f => f.type === 'image');
  const watchedUrl = urlField ? (fieldValues[urlField.id] || '') : '';
  const { data: previewData, loading: previewLoading } = useLinkPreview(watchedUrl);

  // Auto-fill image field from link preview (only when image field is empty)
  useEffect(() => {
    if (previewData?.image && imageField) {
      const currentImage = fieldValues[imageField.id];
      if (!currentImage) {
        handleFieldChange(imageField.id, previewData.image);
      }
    }
  }, [previewData]);

  // --- Clipboard paste for image fields ---
  const handleImagePaste = useCallback((e: React.ClipboardEvent<HTMLInputElement>, fieldId: string) => {
    const items = Array.from(e.clipboardData.items);
    const imageItem = items.find(i => i.type.startsWith('image/'));
    if (!imageItem) return;
    e.preventDefault();
    const file = imageItem.getAsFile();
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        handleFieldChange(fieldId, reader.result);
      }
    };
    reader.readAsDataURL(file);
  }, [handleFieldChange]);

  // Field Renderer — inputs get id=`item-field-${field.id}` for label association
  const renderFieldInput = (field: FieldDefinition) => {
    const value = fieldValues[field.id];
    const inputId = `item-field-${field.id}`;

    switch (field.type) {
      case 'text':
      case 'url':
        return (
          <>
            <Input
              id={inputId}
              value={value || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              type={field.type === 'url' ? 'url' : 'text'}
            />
            {/* Link preview card — only for the watched URL field */}
            {field.type === 'url' && urlField && field.id === urlField.id && (
              <AnimatePresence>
                {(previewLoading || previewData) && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                    className="mt-2 rounded-lg border border-stone-200 dark:border-stone-700 overflow-hidden flex gap-3 bg-stone-50 dark:bg-stone-800/60"
                  >
                    {previewLoading ? (
                      <div className="flex items-center gap-2 px-3 py-2.5 text-xs text-stone-400">
                        <Lucide.Loader2 size={13} className="animate-spin" />
                        Fetching preview…
                      </div>
                    ) : previewData ? (
                      <>
                        {previewData.image && (
                          <img
                            src={previewData.image}
                            alt=""
                            className="w-16 h-16 object-cover shrink-0"
                          />
                        )}
                        <div className="py-2 pr-3 min-w-0">
                          {previewData.title && (
                            <p className="text-xs font-medium text-stone-800 dark:text-stone-200 line-clamp-2 leading-snug">{previewData.title}</p>
                          )}
                          {previewData.domain && (
                            <p className="text-[10px] text-stone-400 mt-0.5">{previewData.domain}</p>
                          )}
                        </div>
                      </>
                    ) : null}
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </>
        );
      case 'image':
        return (
          <div className="space-y-2">
            <Input
              id={inputId}
              value={value || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              onPaste={(e) => handleImagePaste(e, field.id)}
              placeholder="Paste image URL, or Ctrl+V to paste from clipboard"
              type="text"
            />
            <AnimatePresence>
              {value && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                  className="relative inline-block"
                >
                  <img
                    src={value}
                    alt="Preview"
                    className="w-20 h-20 object-cover rounded-lg border border-stone-200 dark:border-stone-700"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  <button
                    type="button"
                    onClick={() => handleFieldChange(field.id, '')}
                    aria-label="Clear image"
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-stone-800 text-white flex items-center justify-center hover:bg-red-500 transition-colors shadow-sm"
                  >
                    <Lucide.X size={10} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      case 'long_text':
        return (
          <Textarea
            id={inputId}
            value={value || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className="min-h-[120px] font-sans"
          />
        );
      case 'rating':
        return (
          <div className="flex gap-1" role="group" aria-label={`${field.name} — select rating`}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                aria-label={`${star} star${star !== 1 ? 's' : ''}`}
                aria-pressed={(value || 0) >= star}
                onClick={() => handleFieldChange(field.id, star)}
                className="transition-transform active:scale-95 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-1 p-0.5"
              >
                <Lucide.Star
                  size={20}
                  className={cn(
                    "transition-colors",
                    (value || 0) >= star ? "fill-amber-400 text-amber-400" : "text-stone-300 dark:text-stone-700"
                  )}
                  aria-hidden="true"
                />
              </button>
            ))}
          </div>
        );
      case 'status':
      case 'select':
        return (
          <div className="flex flex-wrap gap-2" role="group" aria-label={`Select ${field.name}`}>
            {field.options?.map((opt) => (
              <button
                key={opt}
                type="button"
                aria-pressed={value === opt}
                onClick={() => handleFieldChange(field.id, opt)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium border transition-all",
                  value === opt
                    ? "bg-stone-900 text-white border-stone-900 dark:bg-stone-100 dark:text-stone-900"
                    : "bg-transparent text-stone-600 border-stone-200 hover:border-stone-400 dark:text-stone-400 dark:border-stone-700"
                )}
              >
                {opt}
              </button>
            ))}
          </div>
        );
      case 'toggle':
        return (
          <button
            type="button"
            role="switch"
            aria-checked={!!value}
            aria-label={field.name}
            onClick={() => handleFieldChange(field.id, !value)}
            className={cn(
              "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2",
              value ? "bg-amber-500" : "bg-stone-200 dark:bg-stone-700"
            )}
          >
            <span className={cn(
              "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
              value ? "translate-x-6" : "translate-x-1"
            )} />
          </button>
        );
      case 'tags':
        return (
          <TagInput
            id={inputId}
            value={Array.isArray(value) ? value : (value ? String(value).split(',').map((s: string) => s.trim()).filter(Boolean) : [])}
            onChange={(tags) => handleFieldChange(field.id, tags)}
          />
        );
      case 'date':
        return (
          <Input
            id={inputId}
            type="date"
            value={value || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className="w-full sm:w-auto"
          />
        );
      default:
        return null;
    }
  };

  // Determine if a field type uses a standard input (for htmlFor connection)
  const isLabelable = (type: string) =>
    ['text', 'url', 'image', 'long_text', 'date', 'tags'].includes(type);

  // Find image for cover
  const imageUrl = imageField ? fieldValues[imageField.id] : null;

  const titleField = collection.fields.find(f => f.name.toLowerCase() === 'title') || collection.fields[0];
  const itemTitle = titleField ? fieldValues[titleField.id] : null;
  const panelLabel = item ? `Edit ${itemTitle || 'item'}` : `New ${collection.name} item`;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-stone-950/20 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Slide-in Panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={panelLabel}
            className="relative w-full max-w-2xl bg-white dark:bg-stone-900 h-full shadow-2xl flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          >
            {/* Header / Cover */}
            <div className="relative shrink-0">
              {imageUrl ? (
                <div className="h-48 w-full bg-stone-100 dark:bg-stone-800 relative group">
                  <img src={imageUrl} className="w-full h-full object-cover opacity-90" alt={String(itemTitle || 'Cover image')} />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/90 to-transparent dark:from-stone-900/90" aria-hidden="true" />
                  <button
                    onClick={onClose}
                    aria-label="Close panel"
                    className="absolute top-4 right-4 bg-black/20 text-white p-2 rounded-full backdrop-blur hover:bg-black/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    <Lucide.X size={20} />
                  </button>
                </div>
              ) : (
                <div className="h-24 w-full bg-stone-50 border-b border-stone-200 dark:bg-stone-950 dark:border-stone-800 flex justify-end p-4">
                  <button
                    onClick={onClose}
                    aria-label="Close panel"
                    className="bg-stone-100 text-stone-500 p-2 rounded-full hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400"
                  >
                    <Lucide.X size={20} />
                  </button>
                </div>
              )}
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-8 pt-4">
              <div className="max-w-xl mx-auto space-y-8">

                {/* Top Actions */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono uppercase tracking-widest text-stone-400">
                    {collection.name}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsFavorite(!isFavorite)}
                      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                      aria-pressed={isFavorite}
                      className={cn(
                        "p-2 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400",
                        isFavorite ? "bg-amber-100 text-amber-500 dark:bg-amber-900/30" : "text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                      )}
                    >
                      <Lucide.Heart size={20} className={isFavorite ? "fill-current" : ""} aria-hidden="true" />
                    </button>
                    {item && (
                      <button
                        onClick={() => onDelete(item.id)}
                        aria-label="Delete item"
                        className="p-2 rounded-full text-stone-400 hover:bg-red-50 hover:text-red-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                      >
                        <Lucide.Trash2 size={20} aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-6">
                  {collection.fields.map((field, i) => (
                    <motion.div
                      key={field.id}
                      className="space-y-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 28, delay: i * 0.04 }}
                    >
                      <label
                        className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1"
                        htmlFor={isLabelable(field.type) ? `item-field-${field.id}` : undefined}
                      >
                        {field.name}
                      </label>
                      {renderFieldInput(field)}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 flex justify-end gap-3">
              <Button variant="ghost" onClick={onClose}>Cancel</Button>
              <Button onClick={handleSave} className="bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 w-32">
                Save Item
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
