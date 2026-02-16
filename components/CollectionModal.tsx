import React, { useState } from 'react';
import { Collection, FieldDefinition, FieldType } from '../types';
import { Button, Input, Modal, cn } from './UI';
import { ICONS, COLORS } from '../constants';
import * as Lucide from 'lucide-react';
import { v4 as uuidv4 } from 'uuid'; // Mocking

interface CollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (collection: Collection) => void;
}

const AVAILABLE_TYPES: { type: FieldType; label: string; icon: any }[] = [
    { type: 'text', label: 'Short Text', icon: Lucide.Type },
    { type: 'long_text', label: 'Paragraph / Notes', icon: Lucide.AlignLeft },
    { type: 'rating', label: 'Star Rating', icon: Lucide.Star },
    { type: 'status', label: 'Status (Select)', icon: Lucide.ListTodo },
    { type: 'tags', label: 'Tags', icon: Lucide.Tag },
    { type: 'image', label: 'Image / Cover', icon: Lucide.Image },
    { type: 'url', label: 'Link', icon: Lucide.Link },
    { type: 'date', label: 'Date', icon: Lucide.Calendar },
];

export const CollectionModal = ({ isOpen, onClose, onSave }: CollectionModalProps) => {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('Folder');
  const [color, setColor] = useState('stone');
  const [description, setDescription] = useState('');
  
  // Default fields: Title is mandatory.
  const [fields, setFields] = useState<FieldDefinition[]>([
    { id: 'title', name: 'Title', type: 'text' }
  ]);

  const addField = (type: FieldType) => {
    const newField: FieldDefinition = {
      id: Math.random().toString(36).substr(2, 9),
      name: type.charAt(0).toUpperCase() + type.slice(1),
      type,
      options: type === 'status' ? ['To Do', 'Done'] : undefined
    };
    setFields([...fields, newField]);
  };

  const updateFieldName = (id: string, newName: string) => {
    setFields(fields.map(f => f.id === id ? { ...f, name: newName } : f));
  };

  const removeField = (id: string) => {
    if (id === 'title') return; // Cannot delete title
    setFields(fields.filter(f => f.id !== id));
  };

  const handleSave = () => {
    if (!name.trim()) return;
    
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
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setName('');
    setIcon('Folder');
    setColor('stone');
    setDescription('');
    setFields([{ id: 'title', name: 'Title', type: 'text' }]);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Collection" maxWidth="max-w-2xl">
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
                    "p-2 rounded-md border transition-all",
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

            <div className="space-y-3">
                {fields.map((field, idx) => (
                    <div key={field.id} className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg border border-stone-100 dark:bg-stone-900 dark:border-stone-800">
                        <div className="p-2 bg-white dark:bg-stone-800 rounded shadow-sm text-stone-500">
                            {AVAILABLE_TYPES.find(t => t.type === field.type)?.icon && React.createElement(AVAILABLE_TYPES.find(t => t.type === field.type)!.icon, {size: 14})}
                        </div>
                        <Input
                            value={field.name}
                            onChange={e => updateFieldName(field.id, e.target.value)}
                            aria-label={`${AVAILABLE_TYPES.find(t => t.type === field.type)?.label ?? field.type} field name`}
                            className="h-8 bg-transparent border-none shadow-none focus:ring-0 px-0 font-medium text-stone-800 dark:text-stone-200"
                        />
                        <div className="text-xs text-stone-400 bg-stone-200/50 dark:bg-stone-800 px-2 py-1 rounded" aria-hidden="true">
                            {AVAILABLE_TYPES.find(t => t.type === field.type)?.label}
                        </div>
                        {field.id !== 'title' && (
                            <button
                                onClick={() => removeField(field.id)}
                                aria-label={`Remove ${field.name} field`}
                                className="text-stone-400 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 rounded"
                            >
                                <Lucide.X size={16} />
                            </button>
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
            <Button onClick={handleSave}>Create Collection</Button>
        </div>
      </div>
    </Modal>
  );
};