import React, { useState, useMemo } from 'react';
import { HomeScreen } from './components/HomeScreen';
import { ProgressScreen } from './components/ProgressScreen';
import { BMIScreen } from './components/BMIScreen';
import { ScanScreen } from './components/ScanScreen';
import { EditWeightScreen } from './components/EditWeightScreen';
import { BottomNav } from './components/BottomNav';
import { AddMealModal } from './components/AddMealModal';
import { Meal, NutritionInfo, UserProfile } from './types';
import { OnboardingScreen } from './components/onboarding/OnboardingScreen';
import { generateCustomPlan } from './services/geminiService';

const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const App: React.FC = () => {
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<'home' | 'scan' | 'progress' | 'bmi' | 'editWeight'>('home');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [goals, setGoals] = useState<NutritionInfo>({ calories: 2197, protein: 205, carbs: 206, fat: 60 });
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const [userProfile, setUserProfile] = useState<UserProfile>({
    height: 173,
    weight: 90, // Starting weight
    desiredWeight: 80,
  });

  const [weightHistory, setWeightHistory] = useState([
    { date: toDateKey(new Date(Date.now() - 12 * 86400000)), weight: 90.0 }, // Oct 26
    { date: toDateKey(new Date(Date.now() - 9 * 86400000)), weight: 90.0 }, // Oct 29
    { date: toDateKey(new Date(Date.now() - 6 * 86400000)), weight: 90.0 }, // Nov 1
    { date: toDateKey(new Date(Date.now() - 3 * 86400000)), weight: 89.5 }, // Nov 4
    { date: toDateKey(new Date(Date.now() - 0 * 86400000)), weight: 87.7 }, // Nov 7
  ]);
  
  const currentWeight = useMemo(() => {
    if (weightHistory.length === 0) return userProfile.weight || 0;
    const sortedHistory = [...weightHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return sortedHistory[0].weight;
  }, [weightHistory, userProfile.weight]);

  const [dailyData, setDailyData] = useState<Record<string, { consumed: NutritionInfo; meals: Meal[] }>>({
    [toDateKey(new Date())]: {
        consumed: { calories: 674, protein: 39, carbs: 78, fat: 20 },
        meals: [
            { id: '1', name: 'Mee Goreng and M...', image: 'https://i.imgur.com/RPg0Jb1.jpeg', nutrition: { calories: 554, protein: 33, carbs: 66, fat: 15 }},
            { id: '2', name: 'Cafe Latte', image: 'https://i.imgur.com/2nB6Uf3.jpeg', nutrition: { calories: 120, protein: 6, carbs: 12, fat: 5 }},
        ]
    }
  });

  const streak = useMemo(() => {
    const loggedDateStrings = new Set(Object.keys(dailyData));
    if (loggedDateStrings.size === 0) {
        return 0;
    }

    let currentStreak = 0;
    let dateToCheck = new Date(); // Start with today
    dateToCheck.setHours(0, 0, 0, 0);

    if (!loggedDateStrings.has(toDateKey(dateToCheck))) {
        dateToCheck.setDate(dateToCheck.getDate() - 1);
    }

    while (loggedDateStrings.has(toDateKey(dateToCheck))) {
        currentStreak++;
        dateToCheck.setDate(dateToCheck.getDate() - 1);
    }

    return currentStreak;
  }, [dailyData]);
  
  const bmi = useMemo(() => {
    if (!userProfile.height || !currentWeight) return 0;
    const heightInMeters = userProfile.height / 100;
    return currentWeight / (heightInMeters * heightInMeters);
  }, [userProfile.height, currentWeight]);

  const handleOnboardingComplete = async (profileData: UserProfile) => {
    setUserProfile(profileData);
    if (profileData.weight) {
      setWeightHistory([{date: toDateKey(new Date()), weight: profileData.weight}]);
    }
    const customPlan = await generateCustomPlan(profileData);
    setGoals(customPlan);
    setIsOnboardingComplete(true);
  };
  
  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  const handleNavigate = (screen: 'home' | 'progress') => {
    setCurrentScreen(screen);
  };

  const handleAddMeal = (newMeal: Meal) => {
    const dateKey = toDateKey(selectedDate);
    const dayData = dailyData[dateKey] || {
        consumed: { calories: 0, protein: 0, carbs: 0, fat: 0 },
        meals: [],
    };

    setDailyData(prev => ({
        ...prev,
        [dateKey]: {
            consumed: {
                calories: dayData.consumed.calories + newMeal.nutrition.calories,
                protein: dayData.consumed.protein + newMeal.nutrition.protein,
                carbs: dayData.consumed.carbs + newMeal.nutrition.carbs,
                fat: dayData.consumed.fat + newMeal.nutrition.fat,
            },
            meals: [newMeal, ...dayData.meals]
        }
    }));
    setCurrentScreen('home');
  };

  const openScanScreen = () => {
    setIsModalOpen(false);
    setCurrentScreen('scan');
  };

  const handleSaveWeight = (newWeight: number) => {
    const todayKey = toDateKey(new Date());
    setWeightHistory(prev => {
        const todayEntryIndex = prev.findIndex(entry => entry.date === todayKey);
        const newHistory = [...prev];
        if (todayEntryIndex > -1) {
            newHistory[todayEntryIndex] = { ...newHistory[todayEntryIndex], weight: newWeight };
        } else {
            newHistory.push({ date: todayKey, weight: newWeight });
        }
        return newHistory;
    });
    setCurrentScreen('progress');
  };

  const dateKey = toDateKey(selectedDate);
  const currentDayData = dailyData[dateKey] || {
    consumed: { calories: 0, protein: 0, carbs: 0, fat: 0 },
    meals: [],
  };

  if (!isOnboardingComplete) {
    if (Object.keys(dailyData).length > 1) {
        setIsOnboardingComplete(true);
    } else {
        return <OnboardingScreen onComplete={handleOnboardingComplete} />;
    }
  }
  
  const renderScreen = () => {
    switch(currentScreen) {
        case 'home':
            return <HomeScreen
                caloriesConsumed={currentDayData.consumed.calories}
                proteinConsumed={currentDayData.consumed.protein}
                carbsConsumed={currentDayData.consumed.carbs}
                fatConsumed={currentDayData.consumed.fat}
                calorieGoal={goals.calories}
                proteinGoal={goals.protein}
                carbGoal={goals.carbs}
                fatGoal={goals.fat}
                meals={currentDayData.meals}
                onAddMeal={() => setIsModalOpen(true)}
                selectedDate={selectedDate}
                onDateChange={handleDateChange}
                streak={streak}
            />;
        case 'progress':
            return <ProgressScreen 
                userProfile={userProfile} 
                currentWeight={currentWeight}
                streak={streak}
                dailyData={dailyData}
                onShowBmiDetails={() => setCurrentScreen('bmi')}
                bmi={bmi}
                onEditWeight={() => setCurrentScreen('editWeight')}
                weightHistory={weightHistory}
            />;
        case 'scan':
            return <ScanScreen 
                onClose={() => setCurrentScreen('home')} 
                onFoodScanned={handleAddMeal} 
            />;
        case 'bmi':
            return <BMIScreen 
                bmi={bmi}
                onBack={() => setCurrentScreen('progress')}
            />;
        case 'editWeight':
            return <EditWeightScreen
                initialWeight={currentWeight}
                onSave={handleSaveWeight}
                onBack={() => setCurrentScreen('progress')}
            />;
        default:
            return null;
    }
  }

  return (
    <div className="w-full min-h-screen font-sans antialiased text-gray-900">
      <div className="max-w-md mx-auto relative bg-gray-50">
        {renderScreen()}
        {currentScreen !== 'scan' && currentScreen !== 'bmi' && currentScreen !== 'editWeight' && (
            <>
                <BottomNav 
                    currentScreen={currentScreen}
                    onNavigate={handleNavigate}
                    onAddClick={() => setIsModalOpen(true)} 
                />
                {isModalOpen && <AddMealModal onClose={() => setIsModalOpen(false)} onScanFood={openScanScreen} />}
            </>
        )}
      </div>
    </div>
  );
}

export default App;
