import React from 'react';
import { HomeIcon, ProgressIcon, GroupIcon, AddIcon } from './icons';

interface BottomNavProps {
    onAddClick: () => void;
    currentScreen: 'home' | 'progress';
    onNavigate: (screen: 'home' | 'progress') => void;
}

const NavItem: React.FC<{ icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }> = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-colors w-16 ${active ? 'text-black' : 'text-gray-400 hover:text-black'}`}>
    <div className="w-6 h-6">{icon}</div>
    <span className="text-xs font-semibold">{label}</span>
  </button>
);

export const BottomNav: React.FC<BottomNavProps> = ({ onAddClick, currentScreen, onNavigate }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto h-24 bg-white/70 backdrop-blur-lg border-t border-gray-200">
      <div className="flex justify-around items-center h-full px-4">
        <NavItem icon={<HomeIcon />} label="Home" active={currentScreen === 'home'} onClick={() => onNavigate('home')} />
        <NavItem icon={<ProgressIcon />} label="Progress" active={currentScreen === 'progress'} onClick={() => onNavigate('progress')} />
        
        <button onClick={onAddClick} className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center shadow-lg -translate-y-6 transform transition-transform hover:scale-110">
            <AddIcon className="w-8 h-8" />
        </button>

        <NavItem icon={<GroupIcon />} label="Group" />
        <NavItem 
            icon={<img src="https://picsum.photos/id/237/24/24" alt="Profile" className="w-6 h-6 rounded-full" />} 
            label="Profile" 
        />
      </div>
    </div>
  );
};