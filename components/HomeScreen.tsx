import React, { useMemo, useRef, useEffect } from 'react';
import { AppleIcon, FlameIcon, ProteinIcon, CarbsIcon, FatIcon } from './icons';
import { CircularProgress } from './CircularProgress';
import { Meal } from '../types';

interface HomeScreenProps {
  caloriesConsumed: number;
  proteinConsumed: number;
  carbsConsumed: number;
  fatConsumed: number;
  calorieGoal: number;
  proteinGoal: number;
  carbGoal: number;
  fatGoal: number;
  meals: Meal[];
  onAddMeal: () => void;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  streak: number;
}

const Header: React.FC<{ streak: number }> = ({ streak }) => (
  <header className="flex justify-between items-center p-4">
    <div className="flex items-center gap-2">
      <AppleIcon className="w-7 h-7 text-black" />
      <h1 className="text-2xl font-bold">Cal AI</h1>
    </div>
    <button className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full shadow-sm">
      <span className="text-orange-500 text-lg">🔥</span>
      <span className="font-bold text-sm">{streak}</span>
    </button>
  </header>
);

const isSameDay = (d1: Date, d2: Date): boolean => {
    const date1 = new Date(d1);
    const date2 = new Date(d2);
    date1.setHours(0, 0, 0, 0);
    date2.setHours(0, 0, 0, 0);
    return date1.getTime() === date2.getTime();
};

const DatePicker: React.FC<{ selectedDate: Date; onDateSelect: (date: Date) => void }> = ({ selectedDate, onDateSelect }) => {
    const dates = useMemo(() => {
        const arr: Date[] = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize to start of day
        const pastDays = 100;
        const futureDays = 100;
        for (let i = -pastDays; i <= futureDays; i++) {
            const d = new Date(today);
            d.setDate(d.getDate() + i);
            arr.push(d);
        }
        return arr;
    }, []);

    const selectedDateRef = useRef<HTMLButtonElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Refs for drag-to-scroll logic to avoid re-renders
    const isDraggingRef = useRef(false);
    const hasDraggedRef = useRef(false);
    const startXRef = useRef(0);
    const scrollLeftRef = useRef(0);

    useEffect(() => {
        // Prevent scrollIntoView from interfering with user dragging
        if (selectedDateRef.current && !isDraggingRef.current) {
            selectedDateRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    }, [selectedDate]);

    const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!scrollContainerRef.current) return;
        isDraggingRef.current = true;
        hasDraggedRef.current = false; // Reset drag status on new mousedown
        startXRef.current = e.pageX - scrollContainerRef.current.offsetLeft;
        scrollLeftRef.current = scrollContainerRef.current.scrollLeft;
        scrollContainerRef.current.style.cursor = 'grabbing';
        scrollContainerRef.current.style.userSelect = 'none';
    };

    const onMouseLeave = () => {
        if (isDraggingRef.current && scrollContainerRef.current) {
            isDraggingRef.current = false;
            scrollContainerRef.current.style.cursor = 'grab';
            scrollContainerRef.current.style.userSelect = 'auto';
        }
    };

    const onMouseUp = () => {
        if (scrollContainerRef.current) {
            isDraggingRef.current = false;
            scrollContainerRef.current.style.cursor = 'grab';
            scrollContainerRef.current.style.userSelect = 'auto';
            // Use a timeout to allow the click event to process `hasDraggedRef` before resetting it.
            setTimeout(() => {
                hasDraggedRef.current = false;
            }, 0);
        }
    };

    const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDraggingRef.current || !scrollContainerRef.current) return;
        e.preventDefault();
        const x = e.pageX - scrollContainerRef.current.offsetLeft;
        const walk = x - startXRef.current;
        // Set a threshold to prevent tiny movements from being registered as a drag
        if (Math.abs(walk) > 5) {
            hasDraggedRef.current = true;
        }
        scrollContainerRef.current.scrollLeft = scrollLeftRef.current - walk;
    };

    const handleDateClick = (date: Date) => {
        if (!hasDraggedRef.current) {
            onDateSelect(date);
        }
    };

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="pl-4">
            <div
                ref={scrollContainerRef}
                className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
                style={{ cursor: 'grab' }}
                onMouseDown={onMouseDown}
                onMouseLeave={onMouseLeave}
                onMouseUp={onMouseUp}
                onMouseMove={onMouseMove}
            >
                {dates.map((d) => {
                    const isSelected = isSameDay(d, selectedDate);
                    return (
                        <button
                            key={d.toISOString()}
                            ref={isSelected ? selectedDateRef : null}
                            onClick={() => handleDateClick(d)}
                            className={`flex-shrink-0 flex flex-col items-center justify-center w-14 h-[72px] rounded-2xl transition-colors select-none ${isSelected ? 'bg-black text-white shadow-lg' : 'bg-white text-black'}`}
                        >
                            <span className="text-sm font-medium opacity-70 pointer-events-none">{daysOfWeek[d.getDay()]}</span>
                            <span className="font-bold text-xl pointer-events-none">{d.getDate()}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

const FlameShapeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C8.68629 2 6 4.68629 6 8C6 11.3137 12 18 12 18C12 18 18 11.3137 18 8C18 4.68629 15.3137 2 12 2Z" />
    </svg>
);


interface MacroCardProps {
    title: string;
    consumed: number;
    goal: number;
    icon: React.ReactNode;
    color: string;
    size?: 'large' | 'small';
}

const MacroCard: React.FC<MacroCardProps> = ({ title, consumed, goal, icon, color, size = 'small' }) => {
    const progress = goal > 0 ? Math.min(100, Math.max(0, (consumed / goal) * 100)) : 0;

    const consumedDisplay = (
        <div className="flex items-baseline gap-1">
            <span className={`font-bold ${size === 'large' ? 'text-4xl' : 'text-2xl'}`}>
                {Math.round(consumed)}
            </span>
            <span className={`text-gray-500 ${size === 'large' ? 'text-lg' : 'text-base'}`}>
                / {Math.round(goal)}{size === 'small' ? 'g' : ''}
            </span>
        </div>
    );

    if (size === 'large') {
        return (
            <div className="bg-white rounded-3xl p-6 shadow-sm flex justify-between items-center">
                <div>
                    {consumedDisplay}
                    <p className="text-gray-500 mt-1">Calories eaten</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>🔥 +200</span>
                        <span className="flex items-center">
                            <ProteinIcon className="w-3 h-3 text-red-400"/>
                            <CarbsIcon className="w-3 h-3 text-yellow-400 ml-0.5"/>
                            <FatIcon className="w-3 h-3 text-blue-400 ml-0.5"/>
                            <span className="ml-1">+134</span>
                        </span>
                    </div>
                </div>
                <CircularProgress progress={progress} color="#1F2937" size={80} strokeWidth={7}>
                    <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                        <FlameShapeIcon className="w-6 h-6 text-white" />
                    </div>
                </CircularProgress>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl p-4 shadow-sm flex flex-col justify-between h-full">
            <div>
                {consumedDisplay}
                <p className="text-gray-500 text-sm mt-1">{title}</p>
            </div>
            <div className="self-center mt-2">
                <CircularProgress progress={progress} color={color} size={70} strokeWidth={7}>
                    {icon}
                </CircularProgress>
            </div>
        </div>
    );
};

const RecentlyUploaded: React.FC<{ meals: Meal[], onAddMeal: () => void }> = ({ meals, onAddMeal }) => (
    <div className="px-4 mt-8">
        <h2 className="text-xl font-bold mb-4">Recently uploaded</h2>
        {meals.length === 0 ? (
            <button onClick={onAddMeal} className="w-full bg-white rounded-2xl p-4 flex items-center gap-4 text-left shadow-sm">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                     <img src="https://i.imgur.com/JCIp4d5.png" alt="Meal icon" className="w-12 h-12 opacity-50" />
                </div>
                <div>
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                    <p className="text-gray-500 text-sm">Tap + to add your first meal of the day</p>
                </div>
            </button>
        ) : (
             <div className="space-y-3">
                {meals.map((meal) => (
                    <div key={meal.id} className="bg-white rounded-2xl p-3 flex items-center gap-4 shadow-sm">
                        <img src={meal.image} alt={meal.name} className="w-16 h-16 bg-gray-100 rounded-lg object-cover"/>
                        <div className="flex-grow">
                            <div className="flex justify-between items-start">
                                <p className="font-semibold capitalize flex-grow pr-2">{meal.name}</p>
                                <p className="text-xs text-gray-400 flex-shrink-0">12:17 PM</p>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                                <span className="font-semibold">{meal.nutrition.calories} calories</span>
                                <div className="flex items-center gap-2 text-xs">
                                    <span className="flex items-center gap-1"><ProteinIcon className="w-3 h-3 text-red-400"/> {meal.nutrition.protein}g</span>
                                    <span className="flex items-center gap-1"><CarbsIcon className="w-3 h-3 text-yellow-400"/> {meal.nutrition.carbs}g</span>
                                    <span className="flex items-center gap-1"><FatIcon className="w-3 h-3 text-blue-400"/> {meal.nutrition.fat}g</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
             </div>
        )}
    </div>
);


export const HomeScreen: React.FC<HomeScreenProps> = (props) => {
  return (
    <div className="bg-gray-50 min-h-screen pb-28">
      <div className="max-w-md mx-auto">
        <Header streak={props.streak} />
        <main className="space-y-6 mt-2">
          <DatePicker selectedDate={props.selectedDate} onDateSelect={props.onDateChange} />
          <div className="px-4">
            <MacroCard
              size="large"
              title="Calories eaten"
              consumed={props.caloriesConsumed}
              goal={props.calorieGoal}
              icon={<div />}
              color="#1F2937"
            />
          </div>
          <div className="px-4 grid grid-cols-3 gap-4">
            <MacroCard
              title="Protein eaten"
              consumed={props.proteinConsumed}
              goal={props.proteinGoal}
              icon={<ProteinIcon className="w-5 h-5 text-red-500" />}
              color="#F87171"
            />
            <MacroCard
              title="Carbs eaten"
              consumed={props.carbsConsumed}
              goal={props.carbGoal}
              icon={<CarbsIcon className="w-5 h-5 text-yellow-500" />}
              color="#FBBF24"
            />
            <MacroCard
              title="Fat eaten"
              consumed={props.fatConsumed}
              goal={props.fatGoal}
              icon={<FatIcon className="w-5 h-5 text-blue-500" />}
              color="#60A5FA"
            />
          </div>
          <div className="flex justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-black"></div>
            <div className="w-2 h-2 rounded-full bg-gray-300"></div>
            <div className="w-2 h-2 rounded-full bg-gray-300"></div>
          </div>
          <RecentlyUploaded meals={props.meals} onAddMeal={props.onAddMeal} />
        </main>
      </div>
    </div>
  );
};