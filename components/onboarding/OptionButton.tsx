import React from 'react';

interface OptionButtonProps {
  children: React.ReactNode;
  isSelected: boolean;
  onClick: () => void;
  className?: string;
}

export const OptionButton: React.FC<OptionButtonProps> = ({ children, isSelected, onClick, className }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left font-semibold p-4 rounded-xl border transition-all duration-200 ${
        isSelected
          ? 'bg-black text-white border-black scale-105'
          : 'bg-white text-black border-gray-200 hover:border-gray-400'
      } ${className}`}
    >
      {children}
    </button>
  );
};

interface IconOptionButtonProps {
    icon: React.ReactNode;
    label: string;
    isSelected: boolean;
    onClick: () => void;
}

export const IconOptionButton: React.FC<IconOptionButtonProps> = ({ icon, label, isSelected, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`w-full text-left p-4 rounded-xl border flex items-center gap-4 transition-all duration-200 ${
                isSelected 
                ? 'bg-white border-black ring-2 ring-black' 
                : 'bg-white border-gray-200 hover:border-gray-400'
            }`}
        >
            <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">{icon}</div>
            <p className="font-semibold text-gray-800">{label}</p>
        </button>
    )
}