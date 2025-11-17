import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const FontSelector = ({ value, onChange, fonts, disabled = false }) => {
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

  const handleSelect = (fontValue) => {
    onChange(fontValue);
    setIsOpen(false);
  };

  const selectedFont = fonts.find(f => f.value === value) || fonts[0];

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full min-w-[160px] px-3 py-1.5 text-sm
          border border-slate-300 rounded bg-white
          flex items-center justify-between gap-2
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-slate-400'}
          focus:outline-none focus:ring-2 focus:ring-slate-400
        `}
        style={{ fontFamily: selectedFont.value }}
      >
        <span className="truncate">{selectedFont.name}</span>
        <ChevronDown className={`h-4 w-4 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full min-w-[200px] bg-white border border-slate-300 rounded shadow-lg z-50 max-h-[300px] overflow-y-auto">
          {fonts.map((font) => (
            <button
              key={font.value}
              type="button"
              onClick={() => handleSelect(font.value)}
              className={`
                w-full px-3 py-2.5 text-left text-base
                hover:bg-slate-100 transition-colors
                ${font.value === value ? 'bg-slate-50' : ''}
              `}
              style={{ fontFamily: font.value }}
            >
              {font.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default FontSelector;
