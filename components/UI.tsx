import React, { useEffect, useRef, useId, useState } from 'react';
import * as Lucide from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' ');

// --- Icons ---
export const Icon = ({ name, className, size = 18 }: { name: string; className?: string; size?: number }) => {
  const IconComp = (Lucide as any)[name] || Lucide.Box;
  return <IconComp size={size} className={className} />;
};

// --- Button ---
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', size = 'md', className, ...props }) => {
  const base = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50";

  const variants = {
    primary: "bg-stone-900 text-stone-50 hover:bg-stone-900/90 dark:bg-stone-50 dark:text-stone-900 dark:hover:bg-stone-50/90 shadow-sm",
    secondary: "bg-white text-stone-900 border border-stone-200 hover:bg-stone-100 dark:bg-stone-800 dark:text-stone-50 dark:border-stone-700 dark:hover:bg-stone-700",
    ghost: "hover:bg-stone-100 hover:text-stone-900 dark:hover:bg-stone-800 dark:hover:text-stone-50",
    danger: "bg-red-500 text-white hover:bg-red-600 shadow-sm",
  };

  const sizes = {
    sm: "h-8 px-3 text-xs",
    md: "h-9 px-4 py-2 text-sm",
    lg: "h-10 px-8 text-base",
    icon: "h-9 w-9",
  };

  return <button className={cn(base, variants[variant], sizes[size], className)} {...props} />;
};

// --- Input ---
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "flex h-9 w-full rounded-md border border-stone-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 dark:border-stone-800 dark:placeholder:text-stone-600",
        className
      )}
      {...props}
    />
  );
});
Input.displayName = 'Input';

// --- Textarea ---
export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[60px] w-full rounded-md border border-stone-200 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 dark:border-stone-800 dark:placeholder:text-stone-600",
        className
      )}
      {...props}
    />
  );
});
Textarea.displayName = 'Textarea';

// --- Modal / Dialog ---
export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, maxWidth = "max-w-md" }) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) return;

    // Focus the first focusable element when modal opens
    const timer = setTimeout(() => {
      const el = dialogRef.current;
      if (!el) return;
      const first = el.querySelector<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      first?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key !== 'Tab') return;

      const el = dialogRef.current;
      if (!el) return;
      const focusable = Array.from(el.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      ));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div
            className="fixed inset-0 bg-stone-950/20 backdrop-blur-sm dark:bg-stone-950/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            className={cn(
              "relative w-full rounded-xl border border-stone-200 bg-white p-6 shadow-xl dark:border-stone-800 dark:bg-stone-900",
              maxWidth
            )}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: 'spring', stiffness: 340, damping: 30 }}
          >
            <div className="flex items-center justify-between mb-4">
              {title && <h2 id={titleId} className="text-lg font-serif font-semibold text-stone-900 dark:text-stone-50">{title}</h2>}
              <button
                onClick={onClose}
                aria-label="Close dialog"
                className="rounded-full p-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors ml-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400"
              >
                <Lucide.X size={18} className="text-stone-500" />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// --- Badge ---
export const Badge = ({ children, className, variant = "default" }: { children: React.ReactNode; className?: string; variant?: "default" | "outline" | "secondary" }) => {
  const variants = {
    default: "bg-stone-900 text-stone-50 hover:bg-stone-900/80 dark:bg-stone-50 dark:text-stone-900",
    secondary: "bg-stone-100 text-stone-900 hover:bg-stone-100/80 dark:bg-stone-800 dark:text-stone-50",
    outline: "text-stone-900 border border-stone-200 dark:text-stone-50 dark:border-stone-700",
  };
  return (
    <div className={cn("inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-2", variants[variant], className)}>
      {children}
    </div>
  );
};

// --- AlertDialog ---
export interface AlertDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
  onConfirm: () => void;
  onCancel: () => void;
}

export const AlertDialog: React.FC<AlertDialogProps> = ({
  isOpen,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    if (isOpen) document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            className="fixed inset-0 bg-stone-950/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onCancel}
            aria-hidden="true"
          />
          <motion.div
            role="alertdialog"
            aria-modal="true"
            className="relative w-full max-w-sm rounded-xl border border-stone-200 bg-white p-6 shadow-2xl dark:border-stone-800 dark:bg-stone-900"
            initial={{ opacity: 0, scale: 0.94, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 8 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          >
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-11 h-11 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                <Lucide.AlertTriangle size={22} className="text-red-500" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-stone-900 dark:text-stone-50">{title}</h2>
                <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{description}</p>
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={onCancel}>{cancelLabel}</Button>
              <Button
                variant={variant === 'danger' ? 'danger' : 'primary'}
                className="flex-1"
                onClick={onConfirm}
              >
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// --- TagInput ---
export interface TagInputProps {
  id?: string;
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export const TagInput: React.FC<TagInputProps> = ({ id, value, onChange, placeholder = 'Add a tag…' }) => {
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const commitDraft = () => {
    const trimmed = draft.trim().replace(/^,+|,+$/g, '');
    if (!trimmed) { setDraft(''); return; }
    const newTags = trimmed.split(',').map(s => s.trim()).filter(Boolean);
    const unique = newTags.filter(t => !value.includes(t));
    if (unique.length > 0) onChange([...value, ...unique]);
    setDraft('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commitDraft();
    } else if (e.key === 'Backspace' && draft === '' && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const removeTag = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div
      className="flex flex-wrap gap-1.5 min-h-[36px] w-full rounded-md border border-stone-200 dark:border-stone-800 bg-transparent px-2.5 py-1.5 cursor-text focus-within:ring-2 focus-within:ring-stone-400 focus-within:ring-offset-1"
      onClick={() => inputRef.current?.focus()}
    >
      <AnimatePresence initial={false}>
        {value.map((tag, i) => (
          <motion.span
            key={tag}
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="inline-flex items-center gap-1 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-xs rounded px-1.5 py-0.5"
          >
            <span className="text-stone-400">#</span>{tag}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeTag(i); }}
              aria-label={`Remove tag ${tag}`}
              className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors ml-0.5 leading-none"
            >
              <Lucide.X size={10} />
            </button>
          </motion.span>
        ))}
      </AnimatePresence>
      <input
        ref={inputRef}
        id={id}
        type="text"
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={commitDraft}
        placeholder={value.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[80px] bg-transparent text-sm outline-none placeholder:text-stone-400 dark:placeholder:text-stone-600"
      />
    </div>
  );
};

// --- Sheet (Sidebar Slide-over) ---
export interface SheetProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

export const Sheet: React.FC<SheetProps> = ({ isOpen, onClose, children }) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <motion.div
            className="fixed inset-0 bg-stone-950/20 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            className="relative flex h-full w-3/4 max-w-xs flex-col overflow-y-auto border-r border-stone-200 bg-white p-6 shadow-xl dark:border-stone-800 dark:bg-stone-950"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          >
            <button
              onClick={onClose}
              aria-label="Close navigation menu"
              className="absolute right-4 top-4 rounded-full p-2 hover:bg-stone-100 dark:hover:bg-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400"
            >
              <Lucide.X size={18} className="text-stone-500" />
            </button>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
