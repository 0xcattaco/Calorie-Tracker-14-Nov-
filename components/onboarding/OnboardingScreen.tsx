import React, { useState } from 'react';
import { UserProfile } from '../../types';
import { StepContainer } from './StepContainer';
import { OptionButton, IconOptionButton } from './OptionButton';
import { ScrollPicker } from './ScrollPicker';
import { ThumbsDownIcon, ThumbsUpIcon, AppleIcon, GoogleIcon, CheckIcon, LeanIcon, MaintainIcon, BulkIcon } from '../icons';

interface OnboardingScreenProps {
  onComplete: (profile: UserProfile) => void;
}

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const days = Array.from({ length: 31 }, (_, i) => i + 1);
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

// Metric ranges
const heights = Array.from({ length: 151 }, (_, i) => 100 + i); // 100cm to 250cm
const weights = Array.from({ length: 201 }, (_, i) => 30 + i); // 30kg to 230kg

// --- Unit Conversion Logic ---
const KG_TO_LBS = 2.20462;
const LBS_TO_KG = 1 / KG_TO_LBS;
const IN_TO_CM = 2.54;
const CM_TO_IN = 1 / IN_TO_CM;

const cmToFtIn = (cm: number) => {
    const totalInches = cm * CM_TO_IN;
    let feet = Math.floor(totalInches / 12);
    let inches = Math.round(totalInches % 12);
    if (inches === 12) {
        feet += 1;
        inches = 0;
    }
    return { feet, inches };
};

const ftInToCm = (feet: number, inches: number) => {
    return (feet * 12 + inches) * IN_TO_CM;
}

const kgToLbs = (kg: number) => Math.round(kg * KG_TO_LBS);
const lbsToKg = (lbs: number) => lbs * LBS_TO_KG;

// Imperial picker items
const imperialHeights = (() => {
    const items: string[] = [];
    // Range from ~100cm (3'3") to ~250cm (8'2")
    for (let ft = 3; ft <= 8; ft++) {
        for (let inch = 0; inch < 12; inch++) {
            if (ft === 3 && inch < 3) continue;
            if (ft === 8 && inch > 2) break;
            items.push(`${ft}'${inch}"`);
        }
    }
    return items;
})();

const imperialWeights = Array.from({ length: (507 - 66) + 1 }, (_, i) => 66 + i); // ~30kg to ~230kg

const UnitToggle: React.FC<{
    unit: 'metric' | 'imperial';
    onToggle: (unit: 'metric' | 'imperial') => void;
}> = ({ unit, onToggle }) => {
    return (
        <div className="flex items-center justify-center p-1 bg-gray-200 rounded-full my-6 max-w-xs mx-auto">
            <button
                onClick={() => onToggle('imperial')}
                className={`w-1/2 text-center text-sm font-semibold px-4 py-2 rounded-full transition-all duration-300 ${
                    unit === 'imperial'
                        ? 'bg-white text-black shadow'
                        : 'bg-transparent text-gray-500'
                }`}
            >
                Imperial
            </button>
            <button
                onClick={() => onToggle('metric')}
                className={`w-1/2 text-center text-sm font-semibold px-4 py-2 rounded-full transition-all duration-300 ${
                    unit === 'metric'
                        ? 'bg-white text-black shadow'
                        : 'bg-transparent text-gray-500'
                }`}
            >
                Metric
            </button>
        </div>
    );
};


export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<UserProfile>({
    birthDate: { month: 'January', day: 1, year: 2000 },
    height: 173,
    weight: 90,
    desiredWeight: 65,
  });
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');

  const totalSteps = 10; // 0-9

  const updateProfile = (key: keyof UserProfile, value: any) => {
    setProfile(prev => ({ ...prev, [key]: value }));
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, totalSteps - 1));
  const prevStep = () => setStep(prev => Math.max(0, prev - 1));

  const isStepComplete = (currentStep: number): boolean => {
    switch (currentStep) {
      case 0: return true; // Welcome screen
      case 1: return !!profile.goal;
      case 2: return !!profile.gender;
      case 3: return !!profile.birthDate?.year;
      case 4: return !!profile.height && !!profile.weight;
      case 5: return !!profile.desiredWeight;
      case 6: return !!profile.workoutsPerWeek;
      case 7: return !!profile.diet;
      case 8: return true; // Plan created screen
      case 9: return true; // Auth screen
      default: return false;
    }
  };

  const progress = (step / (totalSteps - 1)) * 100;

  const renderStep = () => {
    switch (step) {
      case 0: // Landing Page
        return (
          <div className="bg-white min-h-screen flex flex-col font-sans">
            <div className="flex-grow flex flex-col items-center justify-center p-8 text-center">
                <AppleIcon className="w-16 h-16 text-black mb-6" />
                <h1 className="text-4xl font-bold mb-4">Welcome to Cal AI</h1>
                <p className="text-gray-600 max-w-sm">Your personal AI-powered calorie tracking assistant to help you reach your health goals.</p>
            </div>
            <div className="p-6 space-y-3">
                 <button onClick={nextStep} className="w-full bg-black text-white font-bold py-4 rounded-full">Get Started</button>
                 <button className="w-full bg-gray-100 text-black font-bold py-4 rounded-full flex items-center justify-center gap-2">
                    <GoogleIcon className="w-5 h-5" />
                    <span>Continue with Google</span>
                 </button>
            </div>
          </div>
        );
      case 1: // Goal
        return (
          <StepContainer
            title="What's your main goal?"
            onBack={prevStep}
            showBack={true}
            progress={progress}
            onContinue={nextStep}
            isContinueDisabled={!isStepComplete(step)}
          >
            <div className="space-y-3">
              <IconOptionButton label="Burn fat & get lean" icon={<LeanIcon />} isSelected={profile.goal === 'Lose weight'} onClick={() => updateProfile('goal', 'Lose weight')} />
              <IconOptionButton label="Stay at your current weight" icon={<MaintainIcon />} isSelected={profile.goal === 'Maintain'} onClick={() => updateProfile('goal', 'Maintain')} />
              <IconOptionButton label="Build muscle & bulk up" icon={<BulkIcon />} isSelected={profile.goal === 'Gain weight'} onClick={() => updateProfile('goal', 'Gain weight')} />
            </div>
          </StepContainer>
        );
      case 2: // Gender
        return (
          <StepContainer
            title="Tell us about yourself"
            subtitle="This helps us create your personalized plan"
            onBack={prevStep}
            showBack={true}
            progress={progress}
            onContinue={nextStep}
            isContinueDisabled={!isStepComplete(step)}
          >
            <div className="space-y-3">
              <OptionButton isSelected={profile.gender === 'Female'} onClick={() => updateProfile('gender', 'Female')}>Female</OptionButton>
              <OptionButton isSelected={profile.gender === 'Male'} onClick={() => updateProfile('gender', 'Male')}>Male</OptionButton>
            </div>
          </StepContainer>
        );
      case 3: // Birth Date
        return (
          <StepContainer
            title="What's your date of birth?"
            onBack={prevStep}
            showBack={true}
            progress={progress}
            onContinue={nextStep}
            isContinueDisabled={!isStepComplete(step)}
          >
            <div className="flex justify-center items-start gap-2">
              <div className="w-[40%]">
                <ScrollPicker items={months} value={profile.birthDate?.month} onChange={(v) => updateProfile('birthDate', { ...profile.birthDate, month: v as string })} showArrows />
              </div>
              <div className="w-[20%]">
                 <ScrollPicker items={days} value={profile.birthDate?.day} onChange={(v) => updateProfile('birthDate', { ...profile.birthDate, day: v as number })} showArrows />
              </div>
               <div className="w-[30%]">
                 <ScrollPicker items={years} value={profile.birthDate?.year} onChange={(v) => updateProfile('birthDate', { ...profile.birthDate, year: v as number })} showArrows />
              </div>
            </div>
          </StepContainer>
        );
      case 4: // Height & Weight
        const displayHeightValue = unitSystem === 'metric'
            ? profile.height
            : (() => {
                const { feet, inches } = cmToFtIn(profile.height || 173);
                return `${feet}'${inches}"`;
            })();

        const displayWeightValue = unitSystem === 'metric'
            ? profile.weight
            : kgToLbs(profile.weight || 90);

        const handleHeightChange = (value: string | number) => {
            if (unitSystem === 'metric') {
                updateProfile('height', value as number);
            } else {
                const [feet, inches] = (value as string).replace('"', '').split("'").map(Number);
                updateProfile('height', Math.round(ftInToCm(feet, inches)));
            }
        };
        
        const handleWeightChange = (value: string | number) => {
            if (unitSystem === 'metric') {
                updateProfile('weight', value as number);
            } else {
                updateProfile('weight', Math.round(lbsToKg(value as number)));
            }
        };
        return (
          <StepContainer
            title="Height & weight"
            subtitle="This will be used to calibrate your custom plan."
            onBack={prevStep}
            showBack={true}
            progress={progress}
            onContinue={nextStep}
            isContinueDisabled={!isStepComplete(step)}
          >
            <UnitToggle unit={unitSystem} onToggle={setUnitSystem} />
            <div className="flex gap-4">
                <div className="w-1/2">
                    <p className="font-bold text-center mb-2 text-gray-800">Height</p>
                    <ScrollPicker
                        items={unitSystem === 'metric' ? heights : imperialHeights}
                        value={displayHeightValue}
                        onChange={handleHeightChange}
                        unit={unitSystem === 'metric' ? 'cm' : ''}
                    />
                </div>
                <div className="w-1/2">
                    <p className="font-bold text-center mb-2 text-gray-800">Weight</p>
                    <ScrollPicker
                        items={unitSystem === 'metric' ? weights : imperialWeights}
                        value={displayWeightValue}
                        onChange={handleWeightChange}
                        unit={unitSystem === 'metric' ? 'kg' : 'lbs'}
                    />
                </div>
            </div>
          </StepContainer>
        );
       case 5: // Desired Weight
            const displayDesiredWeightValue = unitSystem === 'metric'
                ? profile.desiredWeight
                : kgToLbs(profile.desiredWeight || 65);

            const handleDesiredWeightChange = (value: string | number) => {
                if (unitSystem === 'metric') {
                    updateProfile('desiredWeight', value as number);
                } else {
                    updateProfile('desiredWeight', Math.round(lbsToKg(value as number)));
                }
            };
        return (
          <StepContainer
            title="What's your desired weight?"
            subtitle="This helps us create your personalized plan"
            onBack={prevStep}
            showBack={true}
            progress={progress}
            onContinue={nextStep}
            isContinueDisabled={!isStepComplete(step)}
          >
            <div className="max-w-xs mx-auto w-full">
              <ScrollPicker
                items={unitSystem === 'metric' ? weights : imperialWeights}
                value={displayDesiredWeightValue}
                onChange={handleDesiredWeightChange}
                unit={unitSystem === 'metric' ? 'kg' : 'lbs'}
              />
            </div>
          </StepContainer>
        );
      case 6: // Activity Level
        return (
          <StepContainer
            title="How many times a week do you workout?"
            onBack={prevStep}
            showBack={true}
            progress={progress}
            onContinue={nextStep}
            isContinueDisabled={!isStepComplete(step)}
          >
            <div className="space-y-3">
              <OptionButton isSelected={profile.workoutsPerWeek === '0-1'} onClick={() => updateProfile('workoutsPerWeek', '0-1')}>0-1 times</OptionButton>
              <OptionButton isSelected={profile.workoutsPerWeek === '1-3'} onClick={() => updateProfile('workoutsPerWeek', '1-3')}>1-3 times</OptionButton>
              <OptionButton isSelected={profile.workoutsPerWeek === '3-5'} onClick={() => updateProfile('workoutsPerWeek', '3-5')}>3-5 times</OptionButton>
              <OptionButton isSelected={profile.workoutsPerWeek === '5+'} onClick={() => updateProfile('workoutsPerWeek', '5+ times')}>5+ times</OptionButton>
            </div>
          </StepContainer>
        );
      case 7: // Diet
        return (
          <StepContainer
            title="Do you follow any of these diets?"
            subtitle="Choose all that apply, or none."
            onBack={prevStep}
            showBack={true}
            progress={progress}
            onContinue={nextStep}
            isContinueDisabled={!isStepComplete(step)}
          >
            <div className="space-y-3">
              <OptionButton isSelected={profile.diet === 'None'} onClick={() => updateProfile('diet', 'None')}>None</OptionButton>
              <OptionButton isSelected={profile.diet === 'Vegetarian'} onClick={() => updateProfile('diet', 'Vegetarian')}>Vegetarian</OptionButton>
              <OptionButton isSelected={profile.diet === 'Vegan'} onClick={() => updateProfile('diet', 'Vegan')}>Vegan</OptionButton>
              <OptionButton isSelected={profile.diet === 'Keto'} onClick={() => updateProfile('diet', 'Keto')}>Keto</OptionButton>
              <OptionButton isSelected={profile.diet === 'Paleo'} onClick={() => updateProfile('diet', 'Paleo')}>Paleo</OptionButton>
            </div>
          </StepContainer>
        );
      case 8: // Plan created
        return (
            <StepContainer
                title="We've created a plan for you!"
                onBack={prevStep}
                showBack={true}
                progress={progress}
                onContinue={nextStep}
                isContinueDisabled={!isStepComplete(step)}
                continueText="Start Tracking"
            >
                <div className="text-center space-y-6">
                    <div className="flex justify-center">
                        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckIcon className="w-12 h-12 text-green-600" />
                        </div>
                    </div>
                    <p className="text-gray-600">Based on your goals and profile, we've calculated a personalized daily nutrition plan to help you succeed.</p>
                </div>
            </StepContainer>
        );
      case 9: // Save progress
        return (
            <StepContainer
                title="Save your progress"
                onBack={prevStep}
                showBack={true}
                progress={100}
                showProgress={false}
                onContinue={() => {}}
                isContinueDisabled={true}
                showContinue={false}
            >
                <div className="w-full space-y-4">
                     <button onClick={() => onComplete(profile)} className="w-full bg-black text-white font-bold py-4 rounded-full flex items-center justify-center gap-2 transition-opacity hover:opacity-90">
                        <AppleIcon className="w-6 h-6" />
                        <span>Sign in with Apple</span>
                     </button>
                     <button onClick={() => onComplete(profile)} className="w-full bg-white text-black font-bold py-4 rounded-full border border-gray-300 hover:bg-gray-100 flex items-center justify-center gap-2 transition-colors">
                        <GoogleIcon className="w-5 h-5" />
                        <span>Sign in with Google</span>
                     </button>
                </div>
            </StepContainer>
        );
      default:
        return null;
    }
  };

  return renderStep();
};