
import React from 'react';
import { ExerciseIcon, SavedIcon, SearchIcon, ScanIcon } from './icons';

interface AddMealModalProps {
  onClose: () => void;
  onScanFood: () => void;
}

const ModalButton: React.FC<{ icon: React.ReactNode; label: string; onClick?: () => void }> = ({ icon, label, onClick }) => (
  <button onClick={onClick} className="flex flex-col items-center justify-center bg-white rounded-2xl p-4 shadow-md aspect-square transition-transform hover:scale-105">
    <div className="w-8 h-8 text-gray-700 mb-2">{icon}</div>
    <span className="font-semibold text-gray-800 text-center text-sm">{label}</span>
  </button>
);

export const AddMealModal: React.FC<AddMealModalProps> = ({ onClose, onScanFood }) => {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 flex items-end justify-center" onClick={onClose}>
      <div className="w-full max-w-md p-4" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gray-100/80 backdrop-blur-xl p-4 rounded-3xl shadow-lg">
          <div className="grid grid-cols-2 gap-4">
            <ModalButton icon={<ExerciseIcon />} label="Log exercise" />
            <ModalButton icon={<SavedIcon />} label="Saved foods" />
            <ModalButton icon={<SearchIcon />} label="Food Database" />
            <ModalButton icon={<ScanIcon />} label="Scan food" onClick={onScanFood} />
          </div>
        </div>
      </div>
    </div>
  );
};
