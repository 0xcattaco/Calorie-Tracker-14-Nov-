import React, { useState, useMemo } from 'react';
import { AddIcon, QuestionIcon, CheckIcon, FlameIcon, ProteinIcon, CarbsIcon, FatIcon } from './icons';
import { UserProfile, NutritionInfo, Meal } from '../types';

interface ProgressScreenProps {
    userProfile: UserProfile;
    currentWeight: number;
    streak: number;
    dailyData: Record<string, { consumed: NutritionInfo; meals: Meal[] }>;
    onShowBmiDetails: () => void;
    bmi: number;
    onEditWeight: () => void;
    weightHistory: { date: string; weight: number }[];
}

const toDateKey = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const MyWeightCard: React.FC<{ 
    currentWeight: number; 
    startWeight: number; 
    goalWeight?: number;
    onClick: () => void;
}> = ({ currentWeight, startWeight, goalWeight = 80, onClick }) => {
    const totalWeightToLose = startWeight - goalWeight;
    const weightLost = startWeight - currentWeight;
    const progress = totalWeightToLose > 0 ? Math.min(100, Math.max(0, (weightLost / totalWeightToLose) * 100)) : 0;
    
    return (
        <button onClick={onClick} className="bg-white rounded-3xl p-4 shadow-sm flex flex-col justify-between h-full text-left w-full">
            <p className="text-gray-500 font-semibold">My Weight</p>
            <div className="my-2">
                <span className="text-4xl font-bold">{currentWeight.toFixed(1)}</span>
                <span className="text-xl font-semibold text-gray-500"> kg</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 my-1">
                <div className="bg-black h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 font-semibold mt-1">
                <span>Goal: {goalWeight} kg</span>
                <span>Next weigh-in: 7d</span>
            </div>
        </button>
    );
};

const DayStreakCard: React.FC<{ streak: number }> = ({ streak }) => {
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const todayIndex = new Date().getDay(); // Sunday = 0, Saturday = 6

    return (
        <div className="bg-white rounded-3xl p-4 shadow-sm flex flex-col items-center justify-center text-center h-full">
             <div className="w-16 h-16 flex items-center justify-center">
                 <span className="text-orange-500 text-5xl">🔥</span>
             </div>
            <p className="font-bold text-lg mt-1">{streak} Day Streak</p>
            <div className="flex justify-center gap-2 mt-2 w-full">
                {days.map((day, i) => {
                    const isChecked = streak > 0 && (todayIndex - i + 7) % 7 < streak;
                    return (
                        <div key={i} className={`w-6 h-6 rounded-full flex items-center justify-center ${isChecked ? 'bg-orange-400 text-white' : 'bg-gray-100 text-gray-400'}`}>
                            {isChecked ? <CheckIcon className="w-3 h-3 stroke-current" strokeWidth="4" /> : <span className="text-xs font-bold">{day}</span>}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

interface GoalProgressCardProps {
    weightHistory: { date: string; weight: number }[];
    startWeight: number;
    goalWeight: number;
}

const GoalProgressCard: React.FC<GoalProgressCardProps> = ({ weightHistory, startWeight, goalWeight }) => {
    const [filter, setFilter] = useState('90 Days');
    const filters = ['90 Days', '6 Months', '1 Year', 'All time'];

    const fullSortedHistory = useMemo(() => [...weightHistory]
        .filter(d => d.date && typeof d.weight === 'number')
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()), [weightHistory]);

    const chartData = useMemo(() => {
        if (filter === 'All time' || fullSortedHistory.length < 2) return fullSortedHistory;

        const now = new Date();
        const cutoff = new Date();

        if (filter === '90 Days') cutoff.setDate(now.getDate() - 90);
        else if (filter === '6 Months') cutoff.setMonth(now.getMonth() - 6);
        else if (filter === '1 Year') cutoff.setFullYear(now.getFullYear() - 1);
        
        let filtered = fullSortedHistory.filter(d => new Date(d.date) >= cutoff);

        if (filtered.length > 0 && filtered.length < fullSortedHistory.length) {
            const firstDataPointIndex = fullSortedHistory.indexOf(filtered[0]);
            if (firstDataPointIndex > 0) {
                 filtered = [fullSortedHistory[firstDataPointIndex - 1], ...filtered];
            }
        }
        
        return filtered.length > 0 ? filtered : fullSortedHistory;
    }, [filter, fullSortedHistory]);

    if (chartData.length < 2) {
        return (
             <div className="bg-white rounded-3xl p-4 shadow-sm h-80 flex flex-col">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="font-bold text-lg">Goal Progress</h2>
                </div>
                <div className="flex-grow flex items-center justify-center">
                    <p className="text-gray-500 text-center text-sm p-4">Log your weight for a few days to see your progress chart here.</p>
                </div>
            </div>
        );
    }
    
    const currentWeight = chartData[chartData.length - 1].weight;
    const totalWeightToChange = startWeight - goalWeight;
    const weightChanged = startWeight - currentWeight;
    let percentageOfGoal = 0;
    if (totalWeightToChange !== 0) {
        percentageOfGoal = (weightChanged / totalWeightToChange) * 100;
    } else if (weightChanged === 0) {
        percentageOfGoal = 100;
    }
    const displayPercentage = Math.round(Math.max(0, percentageOfGoal));

    const weights = chartData.map(d => d.weight);
    const dataMinWeight = Math.min(...weights);
    const dataMaxWeight = Math.max(...weights);
    
    const yAxisMin = Math.floor(dataMinWeight);
    let yAxisRange = Math.ceil(dataMaxWeight) - yAxisMin;

    if (yAxisRange < 4) {
        yAxisRange = 4;
    } else if (yAxisRange % 4 !== 0) {
        yAxisRange = Math.ceil(yAxisRange / 4) * 4;
    }
    const finalYAxisMax = yAxisMin + yAxisRange;
    
    const startDate = new Date(chartData[0].date);
    const endDate = new Date(chartData[chartData.length - 1].date);
    const timeRange = endDate.getTime() - startDate.getTime() || 1;

    const dataPath = useMemo(() => {
        const points = chartData.map(d => {
            const x = timeRange === 0 ? 50 : ((new Date(d.date).getTime() - startDate.getTime()) / timeRange) * 100;
            const y = 40 - (((d.weight - yAxisMin) / yAxisRange) * 40);
            return `${x.toFixed(2)} ${y.toFixed(2)}`;
        });
        return "M " + points.join(' L ');
    }, [chartData, startDate, timeRange, yAxisMin, yAxisRange]);

    const yAxisLabels = useMemo(() => 
        Array.from({ length: 5 }, (_, i) => finalYAxisMax - i * (yAxisRange / 4)).map(l => Math.round(l)),
        [finalYAxisMax, yAxisRange]
    );

    const xAxisLabels = useMemo(() => 
        Array.from({ length: 5 }, (_, i) => {
            const date = new Date(startDate.getTime() + i * (timeRange / 4));
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }),
        [startDate, timeRange]
    );
    
    return (
        <div className="bg-white rounded-3xl p-4 shadow-sm">
            <div className="flex justify-between items-center mb-2">
                <h2 className="font-bold text-lg">Goal Progress</h2>
                <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded-md">{displayPercentage}% of goal</span>
            </div>
            <div className="bg-gray-100 p-1 rounded-full flex items-center justify-between text-sm my-4">
                {filters.map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-3 py-1.5 rounded-full font-semibold transition-colors w-full ${filter === f ? 'bg-white text-black shadow-sm' : 'bg-transparent text-gray-500'}`}
                    >
                        {f}
                    </button>
                ))}
            </div>
            
            <div className="relative h-48 mt-8">
                <div className="absolute -left-4 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-400 font-semibold h-full py-1.5" style={{paddingTop: '0.1rem', paddingBottom: '0.4rem'}}>
                    {yAxisLabels.map(label => <span key={label}>{label}</span>)}
                </div>
                <div className="absolute inset-0 pl-2">
                    <div className="h-full w-full flex flex-col justify-between">
                        {yAxisLabels.map((_, i) => (
                           <div key={i} className={`w-full ${i !== 4 ? 'border-t border-dashed border-gray-200' : ''}`}></div>
                        ))}
                    </div>
                </div>

                <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                    <path d={dataPath} fill="none" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                
                 <div className="absolute -bottom-5 left-0 right-0 flex justify-between text-xs text-gray-400 font-semibold pl-2">
                    {xAxisLabels.map(label => <span key={label}>{label}</span>)}
                </div>
            </div>
            
            <div className="mt-8 bg-green-100 text-green-800 text-center text-sm font-semibold p-2 rounded-lg">
                Great job! Consistency is key, and you're mastering it!
            </div>
        </div>
    );
};


const ProgressPhotos: React.FC = () => (
    <div className="bg-white rounded-3xl p-4 shadow-sm">
        <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-lg">Progress Photos</h2>
            <button className="text-sm font-semibold text-gray-600">See all</button>
        </div>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide">
            <button className="flex-shrink-0 flex flex-col items-center justify-center w-20 h-20 bg-gray-100 rounded-lg text-gray-500">
                <AddIcon className="w-6 h-6" />
                <span className="text-xs mt-1 text-center">Upload Photo</span>
            </button>
            {[
                'https://i.imgur.com/r6pE0lo.jpeg',
                'https://i.imgur.com/7gAD1rv.jpeg',
                'https://i.imgur.com/83SA1s2.jpeg',
                'https://i.imgur.com/lpg4iV5.jpeg',
                'https://i.imgur.com/pkhsR38.jpeg'
            ].map((src, i) => (
                <img key={i} src={src} alt={`Progress photo ${i + 1}`} className="flex-shrink-0 w-20 h-20 rounded-lg object-cover" />
            ))}
        </div>
    </div>
);

const TimeFilter: React.FC<{ selected: string; onSelect: (filter: string) => void }> = ({ selected, onSelect }) => {
    const filters = ['This week', 'Last week', '2 wks. ago', '3 wks. ago'];
    return (
        <div className="bg-gray-100 p-1 rounded-full flex items-center justify-between text-sm">
            {filters.map(filter => (
                <button
                    key={filter}
                    onClick={() => onSelect(filter)}
                    className={`px-3 py-1.5 rounded-full font-semibold transition-colors w-full ${selected === filter ? 'bg-white text-black shadow-sm' : 'bg-transparent text-gray-500'}`}
                >
                    {filter}
                </button>
            ))}
        </div>
    );
};

interface DailyCalorieData {
    day: string;
    protein: number;
    carbs: number;
    fat: number;
    total: number;
}

const TotalCaloriesCard: React.FC<{ data: DailyCalorieData[] }> = ({ data }) => {
    const [hoveredData, setHoveredData] = useState<{ day: DailyCalorieData; index: number; } | null>(null);
    const totalCalories = useMemo(() => data.reduce((sum, day) => sum + day.total, 0), [data]);
    
    const maxDailyCals = useMemo(() => {
        const actualMax = Math.max(...data.map(d => d.total));
        if (actualMax === 0) return 1000; // Default for empty weeks
        return Math.ceil(actualMax / 500) * 500;
    }, [data]);

    return (
        <div className="bg-white rounded-3xl p-4 shadow-sm">
            <h2 className="font-bold text-lg">Total Calories</h2>
            <div className="flex items-baseline gap-2 mt-1">
                <span className="text-4xl font-bold">{totalCalories.toLocaleString()}</span>
                <span className="text-gray-500 font-semibold">cals</span>
                <span className="text-red-500 font-semibold text-sm">↓ -44%</span>
            </div>
            
            <div className="mt-4 h-40 flex gap-2">
                {/* Y-Axis Labels */}
                <div className="flex flex-col justify-between text-xs text-gray-400 font-semibold h-full py-1 text-right">
                    <span>{maxDailyCals.toLocaleString()}</span>
                    <span>{(maxDailyCals / 2).toLocaleString()}</span>
                    <span>0</span>
                </div>
                
                {/* Chart Area */}
                <div className="flex-grow relative">
                    {/* Grid Lines */}
                    <div className="absolute inset-0 h-full w-full flex flex-col justify-between">
                        <div className="w-full border-t border-dashed border-gray-200"></div>
                        <div className="w-full border-t border-dashed border-gray-200"></div>
                        <div className="w-full border-b border-gray-200"></div>
                    </div>

                    {/* Bars */}
                    <div className="absolute inset-0 h-full flex justify-between items-end gap-3 px-1">
                        {data.map((dayData, index) => {
                            const proteinCals = dayData.protein * 4;
                            const carbsCals = dayData.carbs * 4;
                            const fatCals = dayData.fat * 9;
                            const totalMacroCals = proteinCals + carbsCals + fatCals || 1;

                            const proteinHeight = (proteinCals / totalMacroCals) * 100;
                            const carbsHeight = (carbsCals / totalMacroCals) * 100;
                            const fatHeight = (fatCals / totalMacroCals) * 100;

                            return (
                                <div 
                                    key={index} 
                                    className="relative w-full h-full flex flex-col items-center justify-end"
                                    onMouseEnter={() => setHoveredData({ day: dayData, index })}
                                    onMouseLeave={() => setHoveredData(null)}
                                >
                                    {hoveredData && hoveredData.index === index && (() => {
                                        const total = hoveredData.day.total;
                                        
                                        let tooltipPositionClass = 'left-1/2 -translate-x-1/2';
                                        let pointerPositionClass = 'left-1/2 -translate-x-1/2';

                                        if (hoveredData.index <= 1) { // First two bars
                                            tooltipPositionClass = 'left-0';
                                            pointerPositionClass = 'left-1/4 -translate-x-1/2'; 
                                        } else if (hoveredData.index >= 5) { // Last two bars
                                            tooltipPositionClass = 'right-0';
                                            pointerPositionClass = 'left-3/4 -translate-x-1/2';
                                        }

                                        return (
                                            <div 
                                                className={`absolute bg-white rounded-lg p-3 shadow-lg pointer-events-none z-10 w-40 ${tooltipPositionClass}`}
                                                style={{ bottom: `calc(${(total / maxDailyCals) * 100}% + 10px)`}}
                                            >
                                                <div className="flex flex-col gap-1 text-xs">
                                                    <div className="flex justify-between items-center">
                                                        <span className="flex items-center gap-1.5 font-semibold text-gray-700"><FlameIcon className="w-4 h-4 text-gray-800"/> Calories</span>
                                                        <span className="font-bold">{hoveredData.day.total.toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="flex items-center gap-1.5 font-semibold text-gray-700"><ProteinIcon className="w-4 h-4 text-red-500"/> Protein</span>
                                                        <span className="font-bold">{hoveredData.day.protein}g</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="flex items-center gap-1.5 font-semibold text-gray-700"><CarbsIcon className="w-4 h-4 text-yellow-500"/> Carbs</span>
                                                        <span className="font-bold">{hoveredData.day.carbs}g</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="flex items-center gap-1.5 font-semibold text-gray-700"><FatIcon className="w-4 h-4 text-blue-500"/> Fats</span>
                                                        <span className="font-bold">{hoveredData.day.fat}g</span>
                                                    </div>
                                                </div>
                                                <p className="text-center font-bold text-gray-500 mt-2 text-[10px] uppercase tracking-wider">{hoveredData.day.day}</p>
                                                <div className={`absolute -bottom-2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-white ${pointerPositionClass}`}></div>
                                            </div>
                                        );
                                    })()}
                                    <div
                                        className="w-full max-w-[24px] mx-auto rounded-t-md flex flex-col-reverse overflow-hidden transition-opacity"
                                        style={{ 
                                            height: dayData.total > 0 ? `${(dayData.total / maxDailyCals) * 100}%` : '0%',
                                            opacity: hoveredData && hoveredData.index !== index ? 0.5 : 1,
                                        }}
                                    >
                                        <div className="bg-blue-400" style={{ height: `${fatHeight}%` }}></div>
                                        <div className="bg-yellow-400" style={{ height: `${carbsHeight}%` }}></div>
                                        <div className="bg-red-400" style={{ height: `${proteinHeight}%` }}></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            {/* X-Axis Labels */}
            <div className="flex justify-between text-xs text-gray-500 font-semibold mt-1 ml-[30px] pr-1">
                {data.map(d => <span key={d.day} className="text-center w-full">{d.day}</span>)}
            </div>

            <div className="flex justify-center items-center gap-6 mt-4 text-sm font-semibold text-gray-700">
                <span className="flex items-center gap-2"><ProteinIcon className="w-4 h-4 text-red-400"/> Protein</span>
                <span className="flex items-center gap-2"><CarbsIcon className="w-4 h-4 text-yellow-400"/> Carbs</span>
                <span className="flex items-center gap-2"><FatIcon className="w-4 h-4 text-blue-400"/> Fats</span>
            </div>
        </div>
    );
};

const YourBMICard: React.FC<{ bmi: number; onShowBmiDetails: () => void }> = ({ bmi, onShowBmiDetails }) => {
    const getBmiCategory = (bmiValue: number) => {
        if (bmiValue < 18.5) return { name: 'Underweight' };
        if (bmiValue < 25) return { name: 'Healthy' };
        if (bmiValue < 30) return { name: 'Overweight' };
        return { name: 'Obese' };
    };

    const bmiCategory = getBmiCategory(bmi);

    const bmiScale = [
        { name: 'Underweight', color: 'bg-blue-400', width: '25%' },
        { name: 'Healthy', color: 'bg-green-400', width: '25%' },
        { name: 'Overweight', color: 'bg-yellow-400', width: '25%' },
        { name: 'Obese', color: 'bg-red-400', width: '25%' },
    ];
    
    const normalizedBmi = Math.max(0, Math.min(100, ((bmi - 15) / (40 - 15)) * 100));

    return (
        <div className="bg-white rounded-3xl p-4 shadow-sm">
            <div className="flex justify-between items-start">
                <h2 className="font-bold text-lg">Your BMI</h2>
                <button onClick={onShowBmiDetails} className="text-gray-400">
                    <QuestionIcon className="w-5 h-5" />
                </button>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
                <span className="text-4xl font-bold">{bmi.toFixed(1)}</span>
                <span className="font-semibold text-gray-600">
                    Your weight is{' '}
                    <span className={`px-2 py-0.5 rounded-md text-sm font-bold bg-yellow-400 bg-opacity-20 text-yellow-500`}>
                        {bmiCategory.name}
                    </span>
                </span>
            </div>
            <div className="mt-4">
                <div className="relative h-2 rounded-full flex overflow-hidden">
                    {bmiScale.map((s, i) => (
                        <div key={i} className={`${s.color}`} style={{ width: s.width }}></div>
                    ))}
                    <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2" style={{ left: `${normalizedBmi}%` }}>
                        <div className="w-4 h-4 rounded-full bg-white border-2 border-gray-500 shadow-md"></div>
                    </div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                    {bmiScale.map(s => <span key={s.name}>{s.name}</span>)}
                </div>
            </div>
        </div>
    );
};


const getWeekData = (
    dailyData: Record<string, { consumed: NutritionInfo }>,
    weekOffset: number
): DailyCalorieData[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dayOfWeek = today.getDay(); // 0 for Sunday, 6 for Saturday
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - dayOfWeek - (weekOffset * 7));

    const weekData: DailyCalorieData[] = [];

    for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        const dateKey = toDateKey(date);

        const dayData = dailyData[dateKey]?.consumed;
        
        weekData.push({
            day: date.toLocaleDateString('en-US', { weekday: 'short' }),
            protein: dayData?.protein || 0,
            carbs: dayData?.carbs || 0,
            fat: dayData?.fat || 0,
            total: dayData?.calories || 0,
        });
    }
    return weekData;
};

export const ProgressScreen: React.FC<ProgressScreenProps> = ({ userProfile, currentWeight, streak, dailyData, onShowBmiDetails, bmi, onEditWeight, weightHistory }) => {
    const [calorieTimeFilter, setCalorieTimeFilter] = useState('This week');
    const startWeight = userProfile.weight || currentWeight;

    const activeData = useMemo(() => {
        const filterMap = {
            'This week': 0,
            'Last week': 1,
            '2 wks. ago': 2,
            '3 wks. ago': 3,
        };
        const offset = filterMap[calorieTimeFilter as keyof typeof filterMap] || 0;
        return getWeekData(dailyData, offset);
    }, [dailyData, calorieTimeFilter]);

    return (
        <div className="bg-gray-50 min-h-screen pb-28">
            <div className="max-w-md mx-auto p-4 space-y-6">
                <h1 className="text-3xl font-bold px-2">Progress</h1>
                
                <div className="grid grid-cols-2 gap-4">
                    <MyWeightCard 
                        currentWeight={currentWeight} 
                        startWeight={startWeight}
                        goalWeight={userProfile.desiredWeight}
                        onClick={onEditWeight}
                    />
                    <DayStreakCard streak={streak} />
                </div>

                <GoalProgressCard 
                    weightHistory={weightHistory}
                    startWeight={startWeight}
                    goalWeight={userProfile.desiredWeight || startWeight}
                />
                
                <ProgressPhotos />
                
                <div className="space-y-4">
                    <TimeFilter selected={calorieTimeFilter} onSelect={setCalorieTimeFilter} />
                    <TotalCaloriesCard data={activeData} />
                </div>

                <YourBMICard bmi={bmi} onShowBmiDetails={onShowBmiDetails} />
            </div>
        </div>
    );
};