import React, { useState, useRef, useEffect, useCallback } from 'react';
import { BackIcon } from './icons';

const KG_TO_LBS = 2.20462;
const LBS_TO_KG = 0.453592;
const MIN_KG = 30;
const MAX_KG = 200;
const MIN_LBS = MIN_KG * KG_TO_LBS;
const MAX_LBS = MAX_KG * KG_TO_LBS;

// Ruler component for weight selection
const Ruler: React.FC<{
  value: number;
  onValueChange: (value: number) => void;
  min: number;
  max: number;
  isMetric: boolean;
}> = ({ value, onValueChange, min, max, isMetric }) => {
  const rulerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const scrollTimeout = useRef<number | null>(null);
  const isSnapping = useRef(false);

  const tickSpacing = 10; // pixels between each 0.1 unit
  const totalWidth = (max - min) * 10 * tickSpacing;
  
  const valueToScroll = useCallback((val: number) => (val - min) * 10 * tickSpacing, [min]);

  useEffect(() => {
    if (rulerRef.current && !isDragging.current) {
        const targetScroll = valueToScroll(value);
        if (Math.abs(rulerRef.current.scrollLeft - targetScroll) > tickSpacing) {
            rulerRef.current.scrollTo({ left: targetScroll, behavior: 'smooth' });
        }
    }
  }, [value, valueToScroll, isMetric]);

  const snapToNearest = useCallback(() => {
    if (rulerRef.current && !isSnapping.current) {
        isSnapping.current = true;
        const currentScroll = rulerRef.current.scrollLeft;
        const snappedScroll = Math.round(currentScroll / tickSpacing) * tickSpacing;
        
        rulerRef.current.scrollTo({ left: snappedScroll, behavior: 'smooth' });
        
        const newValue = min + Math.round(snappedScroll / tickSpacing) / 10;
        onValueChange(parseFloat(newValue.toFixed(1)));

        setTimeout(() => { isSnapping.current = false; }, 300); // Prevent scroll events during animation
    }
  }, [min, onValueChange]);

  const onMouseDown = (e: React.MouseEvent) => {
    if (!rulerRef.current) return;
    isDragging.current = true;
    startX.current = e.pageX - rulerRef.current.offsetLeft;
    scrollLeft.current = rulerRef.current.scrollLeft;
    rulerRef.current.style.cursor = 'grabbing';
    rulerRef.current.style.scrollSnapType = 'none';
  };

  const onMouseUp = () => {
    if (!rulerRef.current || !isDragging.current) return;
    isDragging.current = false;
    rulerRef.current.style.cursor = 'grab';
    rulerRef.current.style.scrollSnapType = 'x mandatory';
    snapToNearest();
  };
  
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !rulerRef.current) return;
    e.preventDefault();
    const x = e.pageX - rulerRef.current.offsetLeft;
    const walk = (x - startX.current);
    const newScrollLeft = scrollLeft.current - walk;
    rulerRef.current.scrollLeft = newScrollLeft;

    const newValue = min + Math.round(newScrollLeft / tickSpacing) / 10;
    onValueChange(parseFloat(newValue.toFixed(1)));
  };

  const renderTicks = () => {
    const ticks = [];
    for (let i = Math.floor(min * 10); i <= Math.ceil(max * 10); i++) {
      const isMajorTick = i % 10 === 0;
      const isHalfTick = i % 5 === 0 && !isMajorTick;
      ticks.push(
        <div key={i} className="flex-shrink-0" style={{ width: `${tickSpacing}px` }}>
          <div className={`mx-auto bg-gray-300 ${isMajorTick ? 'h-8 w-0.5' : isHalfTick ? 'h-6 w-px' : 'h-4 w-px'}`}></div>
        </div>
      );
    }
    return ticks;
  };

  return (
    <div className="relative w-full h-12"
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onMouseMove={onMouseMove}
    >
      <div 
        ref={rulerRef} 
        className="absolute inset-0 overflow-x-scroll scrollbar-hide" 
        style={{ cursor: 'grab' }}
      >
        <div className="flex items-end" style={{ width: `${totalWidth + window.innerWidth}px` }}>
          <div style={{ width: `calc(50vw - ${tickSpacing/2}px)` }}></div>
          {renderTicks()}
          <div style={{ width: `50vw` }}></div>
        </div>
      </div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-12 w-0.5 bg-black"></div>
    </div>
  );
};

const ToggleSwitch: React.FC<{ checked: boolean, onChange: (checked: boolean) => void }> = ({ checked, onChange }) => {
    return (
        <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only peer" />
            <div className="w-14 h-8 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-black"></div>
        </label>
    );
}

interface EditWeightScreenProps {
  initialWeight: number; // Always in kg
  onSave: (newWeight: number) => void; // Always in kg
  onBack: () => void;
}

export const EditWeightScreen: React.FC<EditWeightScreenProps> = ({ initialWeight, onSave, onBack }) => {
  const [weightInKg, setWeightInKg] = useState(initialWeight);
  const [isMetric, setIsMetric] = useState(true);

  const displayWeight = isMetric ? weightInKg : weightInKg * KG_TO_LBS;
  const unitLabel = isMetric ? 'kg' : 'lbs';
  const rulerMin = isMetric ? MIN_KG : MIN_LBS;
  const rulerMax = isMetric ? MAX_KG : MAX_LBS;

  const handleRulerChange = (valueFromRuler: number) => {
    if (isMetric) {
      setWeightInKg(valueFromRuler);
    } else {
      setWeightInKg(valueFromRuler * LBS_TO_KG);
    }
  };

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <div className="max-w-md mx-auto w-full flex-grow flex flex-col p-4">
        {/* Header */}
        <header className="relative flex items-center justify-center h-12">
          <button onClick={onBack} className="absolute left-0 p-2 -ml-2">
            <BackIcon className="w-6 h-6 text-gray-800" />
          </button>
          <h1 className="text-lg font-bold">Edit Weight</h1>
        </header>

        <main className="flex-grow flex flex-col justify-center">
            <div className="flex items-center justify-center space-x-4 my-8">
                <span className={`font-semibold transition-colors ${!isMetric ? 'text-black' : 'text-gray-400'}`}>Imperial</span>
                <ToggleSwitch checked={isMetric} onChange={setIsMetric} />
                <span className={`font-semibold transition-colors ${isMetric ? 'text-black' : 'text-gray-400'}`}>Metric</span>
            </div>
            
            <div className="text-center my-8">
                <p className="text-gray-600 text-lg">Current Weight</p>
                <p className="text-6xl font-bold my-2">
                    {displayWeight.toFixed(1)}
                    <span className="text-4xl text-gray-400 font-semibold ml-2">{unitLabel}</span>
                </p>
            </div>

            <Ruler 
                value={displayWeight} 
                onValueChange={handleRulerChange}
                min={rulerMin}
                max={rulerMax}
                isMetric={isMetric}
            />
        </main>
        
        <footer className="py-4">
            <button
                onClick={() => onSave(weightInKg)}
                className="w-full bg-black text-white font-bold py-4 rounded-full"
            >
                Save changes
            </button>
        </footer>
      </div>
    </div>
  );
};
