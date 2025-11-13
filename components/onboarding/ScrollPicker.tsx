import React, { useRef, useEffect } from 'react';
import { ChevronUpIcon, ChevronDownIcon } from '../icons';

interface ScrollPickerProps {
  items: (string | number)[];
  value: string | number | undefined;
  onChange: (value: string | number) => void;
  unit?: string;
  showArrows?: boolean;
}

export const ScrollPicker: React.FC<ScrollPickerProps> = ({ items, value, onChange, unit, showArrows }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollTimeout = useRef<number | null>(null);
  const itemHeight = 48; // h-12 in Tailwind

  useEffect(() => {
    const selectedIndex = items.findIndex(item => item === value);
    if (selectedIndex !== -1 && containerRef.current) {
      containerRef.current.scrollTo({ top: selectedIndex * itemHeight, behavior: 'auto' });
    }
  }, [value, items, itemHeight]);

  const handleScroll = () => {
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }
    scrollTimeout.current = window.setTimeout(() => {
        if (containerRef.current) {
            const scrollTop = containerRef.current.scrollTop;
            const selectedIndex = Math.round(scrollTop / itemHeight);
            const newValue = items[selectedIndex];
            if (newValue !== undefined && newValue !== value) {
                onChange(newValue);
            }
        }
    }, 150);
  };
  
  return (
    <div className="relative h-72 text-center">
      <div className="absolute top-1/2 left-2 right-2 -translate-y-1/2 h-12 bg-gray-100 rounded-lg pointer-events-none"></div>

      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        style={{
          maskImage: 'linear-gradient(to bottom, transparent, black 35%, black 65%, transparent)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 35%, black 65%, transparent)',
        }}
      >
        <div style={{ height: `calc(50% - ${itemHeight / 2}px)` }}></div>
        {items.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-center h-12 snap-center text-2xl"
          >
            <span className={`transition-colors duration-150 ${item === value ? 'font-bold text-black' : 'font-semibold text-gray-400'}`}>
              {item}{unit ? `${unit}` : ''}
            </span>
          </div>
        ))}
        <div style={{ height: `calc(50% - ${itemHeight / 2}px)` }}></div>
      </div>

      {showArrows && (
        <>
          <ChevronUpIcon className="absolute top-[calc(35%-1rem)] left-1/2 -translate-x-1/2 w-6 h-6 text-gray-300 pointer-events-none" />
          <ChevronDownIcon className="absolute bottom-[calc(35%-1rem)] left-1/2 -translate-x-1/2 w-6 h-6 text-gray-300 pointer-events-none" />
        </>
      )}
    </div>
  );
};