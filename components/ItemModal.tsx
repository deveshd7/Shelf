import React, { useState, useEffect } from 'react';
import { Item, Collection, FieldDefinition } from '../types';
import { Button, Input, Textarea, cn, Icon } from './UI';
import * as Lucide from 'lucide-react';

interface ItemModalProps {
  item: Item | null; // If null, we are creating a new item
  collection: Collection;
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Item) => void;
  onDelete: (itemId: string) => void;
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

  const handleFieldChange = (fieldId: string, value: any) => {
    setFieldValues(prev => ({ ...prev, [fieldId]: value }));
  };

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

  // Field Renderer — inputs get id=`item-field-${field.id}` for label association
  const renderFieldInput = (field: FieldDefinition) => {
    const value = fieldValues[field.id];
    const inputId = `item-field-${field.id}`;

    switch (field.type) {
      case 'text':
      case 'url':
      case 'image':
        return (
          <Input
            id={inputId}
            value={value || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.type === 'image' ? 'https://...' : ''}
            type={field.type === 'url' ? 'url' : 'text'}
          />
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
          <Input
            id={inputId}
            value={Array.isArray(value) ? value.join(', ') : (value || '')}
            onChange={(e) => handleFieldChange(field.id, e.target.value.split(',').map((s: string) => s.trim()))}
            placeholder="Separate tags with commas..."
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
  const imageField = collection.fields.find(f => f.type === 'image');
  const imageUrl = imageField ? fieldValues[imageField.id] : null;

  const titleField = collection.fields.find(f => f.name.toLowerCase() === 'title') || collection.fields[0];
  const itemTitle = titleField ? fieldValues[titleField.id] : null;
  const panelLabel = item ? `Edit ${itemTitle || 'item'}` : `New ${collection.name} item`;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-stone-950/20 backdrop-blur-sm transition-opacity" onClick={onClose} aria-hidden="true" />

      {/* Slide-in Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={panelLabel}
        className="relative w-full max-w-2xl bg-white dark:bg-stone-900 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
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
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this item?')) {
                        onDelete(item.id);
                        onClose();
                      }
                    }}
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
              {collection.fields.map(field => (
                <div key={field.id} className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationFillMode: 'backwards' }}>
                  <label
                    className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1"
                    htmlFor={isLabelable(field.type) ? `item-field-${field.id}` : undefined}
                  >
                    {field.name}
                  </label>
                  {renderFieldInput(field)}
                </div>
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
      </div>
    </div>
  );
};
