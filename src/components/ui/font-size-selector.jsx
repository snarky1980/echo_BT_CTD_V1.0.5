import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const FontSizeSelector = ({ value, onChange, sizes, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleSelect = (sizeValue) => {
    onChange(sizeValue);
    setIsOpen(false);
  };

  const selectedSize = sizes.find(s => s.value === value) || sizes[1]; // Default to 'Normal'

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full min-w-[120px] px-3 py-1.5 text-sm
          border border-slate-300 rounded bg-white
          flex items-center justify-between gap-2
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-slate-400'}
          focus:outline-none focus:ring-2 focus:ring-slate-400
        `}
      >
        <span className="truncate">{selectedSize.label}</span>
        <ChevronDown className={`h-4 w-4 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full min-w-[140px] bg-white border border-slate-300 rounded shadow-lg z-50">
          {sizes.map((size) => (
            <button
              key={size.value}
              type="button"
              onClick={() => handleSelect(size.value)}
              className={`
                w-full px-3 py-2 text-left
                hover:bg-slate-100 transition-colors
                ${size.value === value ? 'bg-slate-50' : ''}
              `}
              style={{ fontSize: size.value }}
            >
              {size.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default FontSizeSelector;
