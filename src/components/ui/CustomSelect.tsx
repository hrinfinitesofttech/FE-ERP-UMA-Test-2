'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Check, Search, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface SelectOption {
  value: string | number;
  label: string;
  icon?: React.ReactNode;
  description?: string;
  disabled?: boolean;
}

export interface CustomSelectProps {
  value?: string | number;
  onChange?: (value: any, event?: any) => void;
  options?: SelectOption[];
  children?: React.ReactNode;
  placeholder?: string;
  label?: string;
  required?: boolean;
  error?: string;
  prefix?: React.ReactNode;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  disabled?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  name?: string;
  id?: string;
  align?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export function CustomSelect({
  value,
  onChange,
  options: propOptions,
  children,
  placeholder = 'Select...',
  label,
  required = false,
  error,
  prefix,
  className,
  buttonClassName,
  menuClassName,
  disabled = false,
  searchable = false,
  clearable = false,
  name,
  id,
  align = 'left',
  size = 'md',
  fullWidth = true,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Extract options from props or children (<option> tags)
  const options: SelectOption[] = useMemo(() => {
    if (propOptions && propOptions.length > 0) {
      return propOptions.filter(Boolean);
    }
    const extracted: SelectOption[] = [];
    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child) && child.type === 'option') {
        const props = (child as React.ReactElement<{ value?: any; children?: any; disabled?: boolean }>).props;
        const val = props.value !== undefined ? props.value : props.children;
        const lbl = props.children ? String(props.children) : String(val);
        extracted.push({
          value: val,
          label: lbl,
          disabled: props.disabled,
        });
      }
    });
    return extracted.filter(Boolean);
  }, [propOptions, children]);

  // Find currently selected option
  const selectedOption = useMemo(() => {
    return options.find((opt) => opt && String(opt.value ?? '') === String(value ?? ''));
  }, [options, value]);

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

  // Auto-focus search input on open
  useEffect(() => {
    if (isOpen && (searchable || options.length > 6) && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, searchable, options.length]);

  const handleSelect = (option: SelectOption) => {
    if (disabled || option.disabled) return;
    if (onChange) {
      // Create synthetic event for compatibility with forms expecting e.target.value
      const fakeEvent = {
        target: { value: option.value, name: name || id || '' },
        currentTarget: { value: option.value, name: name || id || '' },
        value: option.value,
      };

      try {
        onChange(option.value, fakeEvent);
      } catch {
        onChange(fakeEvent as any);
      }
    }
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    if (onChange) {
      const fakeEvent = {
        target: { value: '', name: name || id || '' },
        currentTarget: { value: '', name: name || id || '' },
        value: '',
      };
      onChange('', fakeEvent);
    }
  };

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const q = searchQuery.toLowerCase();
    return options.filter((opt) => {
      if (!opt) return false;
      const labelMatch = String(opt.label || '').toLowerCase().includes(q);
      const descMatch = opt.description ? String(opt.description).toLowerCase().includes(q) : false;
      return labelMatch || descMatch;
    });
  }, [options, searchQuery]);

  // Size styling classes
  const sizeClasses = {
    sm: 'py-1 px-2.5 text-xs rounded-lg',
    md: 'py-2 px-3 text-xs rounded-lg',
    lg: 'py-2.5 px-3.5 text-sm rounded-xl',
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative text-left',
        fullWidth ? 'w-full' : 'inline-block',
        className
      )}
    >
      {/* Label */}
      {label && (
        <label
          htmlFor={id}
          className="text-[11.5px] font-semibold text-[#475569] flex items-center gap-0.5 mb-1"
        >
          <span>{label}</span>
          {required && <span className="text-rose-500 font-bold ml-0.5">*</span>}
        </label>
      )}

      {/* Trigger Button */}
      <button
        id={id}
        name={name}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center justify-between gap-2 border transition-all duration-150 select-none cursor-pointer shadow-2xs group',
          sizeClasses[size],
          'bg-white border-[#CBD5E1] text-[#1E293B]',
          'hover:bg-[#FAF7F2]/60 hover:border-[#94A3B8]',
          'focus:outline-none focus:ring-2 focus:ring-crm-brand-700/20 focus:border-crm-brand-700',
          disabled && 'opacity-60 cursor-not-allowed bg-[#F8FAFC] border-[#E2E8F0] text-[#94A3B8]',
          isOpen && 'ring-2 ring-crm-brand-700/20 border-crm-brand-700 bg-white',
          error && 'border-rose-400 focus:border-rose-500 focus:ring-rose-200',
          buttonClassName
        )}
      >
        <span className="flex items-center gap-2 truncate min-w-0">
          {prefix && <span className="shrink-0 text-[#64748B]">{prefix}</span>}
          {selectedOption?.icon && <span className="shrink-0">{selectedOption.icon}</span>}
          <span className={cn('truncate font-medium', !selectedOption && 'text-[#94A3B8]')}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </span>

        <div className="flex items-center gap-1 shrink-0 ml-1">
          {clearable && selectedOption && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              title="Clear selection"
              className="p-0.5 text-[#94A3B8] hover:text-[#475569] rounded transition cursor-pointer"
            >
              <X className="w-3 h-3" />
            </span>
          )}
          <ChevronDown
            className={cn(
              'w-3.5 h-3.5 text-[#94A3B8] transition-transform duration-200 shrink-0',
              isOpen && 'rotate-180 text-crm-brand-700'
            )}
          />
        </div>
      </button>

      {/* Hidden input for native form serialization */}
      <input type="hidden" name={name} id={id ? `${id}-hidden` : undefined} value={value ?? ''} />

      {/* Floating Menu Popover */}
      {isOpen && (
        <div
          className={cn(
            'absolute mt-1.5 min-w-[200px] w-full z-50 rounded-xl shadow-2xl border overflow-hidden animate-in fade-in zoom-in-95 duration-150',
            'bg-white border-[#E2E8F0] ring-1 ring-black/5',
            align === 'right' ? 'right-0' : 'left-0',
            menuClassName
          )}
        >
          {/* Search Box inside dropdown if > 6 options or explicitly searchable */}
          {(searchable || options.length > 6) && (
            <div className="p-2 border-b border-[#F1F5F9] bg-[#F8FAFC]">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search options..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-[#E2E8F0] rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-crm-brand-700/20 focus:border-crm-brand-700 transition"
                />
              </div>
            </div>
          )}

          {/* Options List */}
          <div className="p-1 max-h-60 overflow-y-auto space-y-0.5 scrollbar-thin">
            {filteredOptions.length === 0 ? (
              <div className="py-3 px-3 text-center text-xs text-[#94A3B8]">
                No matching options found
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = String(opt.value) === String(value);
                return (
                  <button
                    key={String(opt.value)}
                    type="button"
                    disabled={opt.disabled}
                    onClick={() => handleSelect(opt)}
                    className={cn(
                      'w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium text-left transition-colors cursor-pointer group',
                      opt.disabled && 'opacity-40 cursor-not-allowed hover:bg-transparent',
                      isSelected
                        ? 'bg-crm-brand-700 text-white font-bold shadow-xs'
                        : 'text-[#334155] hover:bg-[#FAF7F2] hover:text-crm-brand-900'
                    )}
                  >
                    <div className="flex items-center gap-2 truncate min-w-0">
                      {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                      <div className="truncate">
                        <span className="truncate block font-semibold">{opt.label}</span>
                        {opt.description && (
                          <span className={cn('text-[10px] block truncate', isSelected ? 'text-white/80' : 'text-[#64748B]')}>
                            {opt.description}
                          </span>
                        )}
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 shrink-0 text-white stroke-[2.5] ml-2" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Error message */}
      {error && <span className="text-[10.5px] text-rose-500 font-medium mt-1 block">{error}</span>}
    </div>
  );
}

// Export aliases
export const ERPDropdown = CustomSelect;
export default CustomSelect;
