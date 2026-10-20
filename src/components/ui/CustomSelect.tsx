'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface SelectOption {
  value: string | number;
  label: string;
  icon?: React.ReactNode;
}

export interface CustomSelectProps {
  value?: string | number;
  onChange?: (value: any) => void;
  options?: SelectOption[];
  children?: React.ReactNode;
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  disabled?: boolean;
  searchable?: boolean;
  name?: string;
  id?: string;
}

export function CustomSelect({
  value,
  onChange,
  options: propOptions,
  children,
  placeholder = 'Select...',
  className,
  buttonClassName,
  menuClassName,
  disabled = false,
  searchable = false,
  name,
  id,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Extract options from props or children (<option> tags)
  const options: SelectOption[] = React.useMemo(() => {
    if (propOptions && propOptions.length > 0) {
      return propOptions;
    }
    const extracted: SelectOption[] = [];
    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child) && child.type === 'option') {
        const props = (child as React.ReactElement<{ value?: any; children?: any }>).props;
        const val = props.value !== undefined ? props.value : props.children;
        const lbl = props.children ? String(props.children) : String(val);
        extracted.push({
          value: val,
          label: lbl,
        });
      }
    });
    return extracted;
  }, [propOptions, children]);

  // Find currently selected option
  const selectedOption = options.find(
    (opt) => String(opt.value) === String(value)
  );

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery('');
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setSearchQuery('');
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus search input on open
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, searchable]);

  const handleSelect = (option: SelectOption) => {
    if (disabled) return;
    if (onChange) {
      // Support both direct value or fake event object for compatibility
      const fakeEvent = {
        target: { value: option.value, name: name || id || '' },
        currentTarget: { value: option.value, name: name || id || '' },
      };
      // Try calling as event or value
      try {
        onChange(option.value as any);
      } catch {
        onChange(fakeEvent as any);
      }
    }
    setIsOpen(false);
    setSearchQuery('');
  };

  const filteredOptions = options.filter((opt) =>
    !searchQuery.trim() ||
    opt.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      ref={containerRef}
      className={cn('relative inline-block text-left', className)}
    >
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center justify-between gap-2.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all shadow-2xs select-none cursor-pointer',
          'bg-[var(--crm-surface-card,#FFFFFF)] border-[var(--crm-border-default,#EBE3DB)] text-[var(--crm-text-primary,#211B17)]',
          'hover:bg-[var(--crm-surface-subtle,#FAF7F2)] hover:border-[var(--crm-border-strong,#D5CAC0)]',
          'focus:outline-none focus:ring-2 focus:ring-crm-brand-700/20 focus:border-crm-brand-700',
          disabled && 'opacity-50 cursor-not-allowed',
          isOpen && 'ring-2 ring-crm-brand-700/20 border-crm-brand-700',
          buttonClassName
        )}
      >
        <span className="flex items-center gap-2 truncate">
          {selectedOption?.icon}
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </span>
        <ChevronDown
          className={cn(
            'w-3.5 h-3.5 text-[var(--crm-text-secondary,#8D827A)] transition-transform duration-200 flex-shrink-0',
            isOpen && 'rotate-180 text-crm-brand-700'
          )}
        />
      </button>

      {/* Floating Menu Popover */}
      {isOpen && (
        <div
          className={cn(
            'absolute left-0 mt-1.5 min-w-[180px] w-full max-w-xs z-50 rounded-xl shadow-2xl border overflow-hidden animate-in fade-in zoom-in-95 duration-150',
            'bg-[var(--crm-surface-card,#FFFFFF)] border-[var(--crm-border-default,#EDE5DC)]',
            menuClassName
          )}
        >
          {/* Optional Search inside dropdown */}
          {(searchable || options.length > 8) && (
            <div className="p-2 border-b border-[var(--crm-border-default,#EDE5DC)] bg-[var(--crm-surface-subtle,#FAF7F2)]">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--crm-text-secondary,#8D827A)]" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[var(--crm-surface-card,#FFFFFF)] border border-[var(--crm-border-default,#EDE5DC)] rounded-lg pl-8 pr-2 py-1 text-xs text-[var(--crm-text-primary,#211B17)] placeholder-[var(--crm-text-secondary,#8D827A)] focus:outline-none focus:ring-1 focus:ring-crm-brand-700"
                />
              </div>
            </div>
          )}

          {/* Options List */}
          <div className="p-1 max-h-60 overflow-y-auto space-y-0.5 scrollbar-thin">
            {filteredOptions.length === 0 ? (
              <div className="py-3 px-2 text-center text-xs text-[var(--crm-text-secondary,#8D827A)]">
                No options found
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = String(opt.value) === String(value);
                return (
                  <button
                    key={String(opt.value)}
                    type="button"
                    onClick={() => handleSelect(opt)}
                    className={cn(
                      'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold text-left transition-colors cursor-pointer group',
                      isSelected
                        ? 'bg-crm-brand-700 text-white font-bold shadow-2xs'
                        : 'text-[var(--crm-text-primary,#211B17)] hover:bg-[var(--crm-surface-subtle,#FAF7F2)] hover:text-crm-brand-700'
                    )}
                  >
                    <span className="flex items-center gap-2 truncate">
                      {opt.icon}
                      <span className="truncate">{opt.label}</span>
                    </span>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 flex-shrink-0 text-white stroke-[2.5]" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomSelect;
