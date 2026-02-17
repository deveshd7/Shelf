import React, { useState, useEffect, useRef } from 'react';
import { Collection, FieldDefinition, FieldType } from '../types';
import { Button, Input, Modal, cn } from './UI';
import { ICONS, COLORS } from '../constants';
import * as Lucide from 'lucide-react';

interface CollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (collection: Collection) => void;
  collection?: Collection | null;
}

const AVAILABLE_TYPES: { type: FieldType; label: string; icon: any }[] = [
    { type: 'text', label: 'Short Text', icon: Lucide.Type },
    { type: 'long_text', label: 'Paragraph / Notes', icon: Lucide.AlignLeft },
    { type: 'rating', label: 'Star Rating', icon: Lucide.Star },
    { type: 'status', label: 'Status (Select)', icon: Lucide.ListTodo },
    { type: 'select', label: 'Select', icon: Lucide.ChevronDown },
    { type: 'tags', label: 'Tags', icon: Lucide.Tag },
    { type: 'image', label: 'Image / Cover', icon: Lucide.Image },
    { type: 'url', label: 'Link', icon: Lucide.Link },
    { type: 'date', label: 'Date', icon: Lucide.Calendar },
];

// --- OptionsEditor sub-component ---
interface OptionsEditorProps {
  fieldId: string;
  options: string[];
  onChange: (id: string, opts: string[]) => void;
}

const OptionsEditor: React.FC<OptionsEditorProps> = ({ fieldId, options, onChange }) => {
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const commit = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onChange(fieldId, [...options, trimmed]);
    setDraft('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); commit(); }
    else if (e.key === 'Backspace' && draft === '' && options.length > 0) {
      onChange(fieldId, options.slice(0, -1));
    }
  };

  const removeOption = (index: number) => {
    onChange(fieldId, options.filter((_, i) => i !== index));
  };

  return (
    <div className="mt-2 ml-10 pl-3 border-l-2 border-stone-200 dark:border-stone-700 space-y-2">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Options</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-xs rounded px-2 py-0.5"
          >
            {opt}
            <button
              type="button"
              onClick={() => removeOption(i)}
              aria-label={`Remove option ${opt}`}
              className="text-stone-400 hover:text-red-500 transition-colors"
            >
              <Lucide.X size={10} />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="New option…"
          className="flex-1 h-7 text-xs rounded border border-stone-200 dark:border-stone-700 bg-transparent px-2 outline-none focus:ring-1 focus:ring-stone-400 placeholder:text-stone-400"
        />
        <button
          type="button"
          onClick={commit}
          className="h-7 px-2.5 text-xs rounded border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
        >
          Add
        </button>
      </div>
    </div>
  );
};

// --- CollectionModal ---
export const CollectionModal = ({ isOpen, onClose, onSave, collection }: CollectionModalProps) => {
  const isEditing = !!collection;

  const [name, setName] = useState('');
  const [icon, setIcon] = useState('Folder');
  const [color, setColor] = useState('stone');
  const [description, setDescription] = useState('');
  const [fields, setFields] = useState<FieldDefinition[]>([
    { id: 'title', name: 'Title', type: 'text' }
  ]);

  // Sync form state when modal opens or collection changes
  useEffect(() => {
    if (isOpen) {
      if (collection) {
        setName(collection.name);
        setIcon(collection.icon);
        setColor(collection.color);
        setDescription(collection.description || '');
        setFields(collection.fields);
      } else {
        setName('');
        setIcon('Folder');
        setColor('stone');
        setDescription('');
        setFields([{ id: 'title', name: 'Title', type: 'text' }]);
      }
    }
  }, [isOpen, collection]);

  const addField = (type: FieldType) => {
    const defaults: Partial<Record<FieldType, string[]>> = {
      status: ['To Do', 'In Progress', 'Done'],
      select: ['Option 1', 'Option 2'],
    };
    const newField: FieldDefinition = {
      id: Math.random().toString(36).substr(2, 9),
      name: AVAILABLE_TYPES.find(t => t.type === type)?.label ?? (type.charAt(0).toUpperCase() + type.slice(1)),
      type,
      options: defaults[type],
    };
    setFields(prev => [...prev, newField]);
  };

  const updateFieldName = (id: string, newName: string) => {
    setFields(prev => prev.map(f => f.id === id ? { ...f, name: newName } : f));
  };

  const updateFieldOptions = (id: string, opts: string[]) => {
    setFields(prev => prev.map(f => f.id === id ? { ...f, options: opts } : f));
  };

  const removeField = (id: string) => {
    if (id === 'title') return;
    setFields(prev => prev.filter(f => f.id !== id));
  };

  const moveField = (id: string, direction: 'up' | 'down') => {
    setFields(prev => {
      const idx = prev.findIndex(f => f.id === id);
      if (idx < 0) return prev;
      const newIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (newIdx < 1 || newIdx >= prev.length) return prev; // index 0 is always title
      const next = [...prev];
      [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
      return next;
    });
  };

  const handleSave = () => {
    if (!name.trim()) return;

    if (isEditing && collection) {
      // Preserve id and itemIds; only allow name/options changes on existing fields
      const savedCollection: Collection = {
        ...collection,
        name,
        icon,
        color,
        description,
        fields,
      };
      onSave(savedCollection);
    } else {
      const newCollection: Collection = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        icon,
        color,
        description,
        fields,
        itemIds: []
      };
      onSave(newCollection);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit "${collection?.name}"` : 'New Collection'}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6 max-h-[70vh] overflow-y-auto p-1">

        {/* Basic Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="col-name-input" className="text-xs font-semibold uppercase text-stone-500">Name</label>
            <Input id="col-name-input" autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Films, Places" />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase text-stone-500" id="col-icon-label">Icon</p>
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar" role="group" aria-labelledby="col-icon-label">
              {ICONS.map(i => (
                <button
                  key={i}
                  onClick={() => setIcon(i)}
                  aria-label={i}
                  aria-pressed={icon === i}
                  className={cn(
                    "p-2 rounded-md border transition-all shrink-0",
                    icon === i
                      ? "bg-stone-900 text-white border-stone-900"
                      : "bg-white text-stone-500 border-stone-200 hover:border-stone-400 dark:bg-stone-900 dark:border-stone-700 dark:text-stone-400"
                  )}
                >
                  {(Lucide as any)[i] ? React.createElement((Lucide as any)[i], { size: 16, 'aria-hidden': true }) : null}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase text-stone-500" id="col-theme-label">Theme</p>
          <div className="flex gap-3" role="group" aria-labelledby="col-theme-label">
            {COLORS.map(c => (
              <button
                key={c.value}
                onClick={() => setColor(c.value)}
                aria-label={c.name}
                aria-pressed={color === c.value}
                title={c.name}
                className={cn(
                  "w-8 h-8 rounded-full border-2 transition-all",
                  c.value === 'stone' ? 'bg-stone-200' :
                  c.value === 'amber' ? 'bg-amber-400' :
                  c.value === 'rose' ? 'bg-rose-400' :
                  c.value === 'indigo' ? 'bg-indigo-400' : 'bg-emerald-400',
                  color === c.value ? "border-stone-900 scale-110" : "border-transparent"
                )}
              />
            ))}
          </div>
        </div>

        {/* Schema Builder */}
        <div className="border-t border-stone-200 pt-6 dark:border-stone-800">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-serif font-medium text-lg">Properties</h3>
                <span className="text-xs text-stone-500">Define what each item tracks</span>
            </div>

            <div className="space-y-2">
                {fields.map((field, idx) => (
                    <div key={field.id}>
                      <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg border border-stone-100 dark:bg-stone-900 dark:border-stone-800">
                          {/* Reorder buttons */}
                          <div className="flex flex-col gap-0.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => moveField(field.id, 'up')}
                              disabled={idx <= 1}
                              aria-label={`Move ${field.name} up`}
                              className="text-stone-300 hover:text-stone-600 dark:text-stone-700 dark:hover:text-stone-400 disabled:opacity-0 disabled:pointer-events-none transition-colors"
                            >
                              <Lucide.ChevronUp size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveField(field.id, 'down')}
                              disabled={idx === 0 || idx === fields.length - 1}
                              aria-label={`Move ${field.name} down`}
                              className="text-stone-300 hover:text-stone-600 dark:text-stone-700 dark:hover:text-stone-400 disabled:opacity-0 disabled:pointer-events-none transition-colors"
                            >
                              <Lucide.ChevronDown size={12} />
                            </button>
                          </div>
                          <div className="p-2 bg-white dark:bg-stone-800 rounded shadow-sm text-stone-500 shrink-0">
                              {AVAILABLE_TYPES.find(t => t.type === field.type)?.icon && React.createElement(AVAILABLE_TYPES.find(t => t.type === field.type)!.icon, {size: 14})}
                          </div>
                          <Input
                              value={field.name}
                              onChange={e => updateFieldName(field.id, e.target.value)}
                              aria-label={`${AVAILABLE_TYPES.find(t => t.type === field.type)?.label ?? field.type} field name`}
                              className="h-8 bg-transparent border-none shadow-none focus:ring-0 px-0 font-medium text-stone-800 dark:text-stone-200"
                          />
                          <div className="text-xs text-stone-400 bg-stone-200/50 dark:bg-stone-800 px-2 py-1 rounded shrink-0" aria-hidden="true">
                              {AVAILABLE_TYPES.find(t => t.type === field.type)?.label}
                          </div>
                          {field.id !== 'title' && (
                              <button
                                  onClick={() => removeField(field.id)}
                                  aria-label={`Remove ${field.name} field`}
                                  className="text-stone-400 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 rounded shrink-0"
                              >
                                  <Lucide.X size={16} />
                              </button>
                          )}
                      </div>
                      {/* Options editor for status/select fields */}
                      {(field.type === 'status' || field.type === 'select') && (
                        <OptionsEditor
                          fieldId={field.id}
                          options={field.options || []}
                          onChange={updateFieldOptions}
                        />
                      )}
                    </div>
                ))}
            </div>

            <div className="mt-4">
                <p className="text-xs font-semibold uppercase text-stone-500 mb-2">Add Property</p>
                <div className="flex flex-wrap gap-2">
                    {AVAILABLE_TYPES.filter(t => t.type !== 'text').map(t => (
                        <button
                            key={t.type}
                            onClick={() => addField(t.type)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-stone-200 bg-white text-xs font-medium text-stone-600 hover:bg-stone-50 dark:bg-stone-900 dark:border-stone-800 dark:text-stone-400 dark:hover:bg-stone-800 transition-colors"
                        >
                            <t.icon size={12} />
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave}>
              {isEditing ? 'Save Changes' : 'Create Collection'}
            </Button>
        </div>
      </div>
    </Modal>
  );
};
