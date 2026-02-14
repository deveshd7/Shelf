import React, { useEffect, useRef } from 'react';
import * as Lucide from 'lucide-react';

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
  const base = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-stone-400 disabled:pointer-events-none disabled:opacity-50";
  
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
        "flex h-9 w-full rounded-md border border-stone-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-stone-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-stone-400 disabled:cursor-not-allowed disabled:opacity-50 dark:border-stone-800 dark:placeholder:text-stone-600 dark:focus-visible:ring-stone-400",
        className
      )}
      {...props}
    />
  );
});

// --- Textarea ---
export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[60px] w-full rounded-md border border-stone-200 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-stone-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-stone-400 disabled:cursor-not-allowed disabled:opacity-50 dark:border-stone-800 dark:placeholder:text-stone-600",
        className
      )}
      {...props}
    />
  );
});

// --- Modal / Dialog ---
export interface ModalProps {
    isOpen: boolean; 
    onClose: () => void; 
    title?: string; 
    children: React.ReactNode; 
    maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, maxWidth = "max-w-md" }) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="fixed inset-0 bg-stone-950/20 backdrop-blur-sm dark:bg-stone-950/40 transition-opacity" 
        onClick={onClose} 
        aria-hidden="true"
      />
      <div 
        className={cn(
          "relative w-full transform rounded-xl border border-stone-200 bg-white p-6 shadow-xl transition-all dark:border-stone-800 dark:bg-stone-900 animate-in fade-in zoom-in-95 duration-200",
          maxWidth
        )}
      >
        <div className="flex items-center justify-between mb-4">
          {title && <h2 className="text-lg font-serif font-semibold text-stone-900 dark:text-stone-50">{title}</h2>}
          <button onClick={onClose} className="rounded-full p-1 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
            <Lucide.X size={18} className="text-stone-500" />
          </button>
        </div>
        {children}
      </div>
    </div>
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

// --- Sheet (Sidebar Slide-over) ---
export interface SheetProps {
    isOpen: boolean; 
    onClose: () => void; 
    children: React.ReactNode;
}

export const Sheet: React.FC<SheetProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="fixed inset-0 bg-stone-950/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex h-full w-3/4 max-w-xs flex-col overflow-y-auto border-r border-stone-200 bg-white p-6 shadow-xl dark:border-stone-800 dark:bg-stone-950 animate-in slide-in-from-left duration-300">
        <button onClick={onClose} className="absolute right-4 top-4 rounded-full p-2 hover:bg-stone-100 dark:hover:bg-stone-800">
          <Lucide.X size={18} className="text-stone-500" />
        </button>
        {children}
      </div>
    </div>
  );
};