import React from 'react';
import { BackIcon } from './icons';

interface BMIScreenProps {
  bmi: number;
  onBack: () => void;
}

const getBmiCategory = (bmiValue: number) => {
    if (bmiValue < 18.5) return { name: 'Underweight', color: 'bg-blue-400' };
    if (bmiValue < 25) return { name: 'Healthy', color: 'bg-green-400' };
    if (bmiValue < 30) return { name: 'Overweight', color: 'bg-yellow-400' };
    return { name: 'Obese', color: 'bg-red-400' };
};

export const BMIScreen: React.FC<BMIScreenProps> = ({ bmi, onBack }) => {
  const bmiCategory = getBmiCategory(bmi);
  // Normalize BMI value (15-40 range) to a 0-100 percentage for positioning the indicator
  const normalizedBmi = Math.max(0, Math.min(100, ((bmi - 15) / (40 - 15)) * 100));

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-md mx-auto p-4">
        {/* Header */}
        <header className="relative flex items-center justify-center h-12">
          <button onClick={onBack} className="absolute left-0 p-2 -ml-2">
            <BackIcon className="w-6 h-6 text-gray-800" />
          </button>
          <h1 className="text-lg font-bold">BMI</h1>
        </header>

        <main className="mt-8">
          {/* BMI Value Display */}
          <div className="text-center">
            <p className="text-gray-600">
              Your weight is{' '}
              <span className={`px-2 py-0.5 rounded-md text-sm font-bold bg-yellow-400 bg-opacity-30 text-yellow-600`}>
                {bmiCategory.name}
              </span>
            </p>
            <p className="text-6xl font-bold my-2">{bmi.toFixed(1)}</p>
          </div>

          {/* BMI Scale */}
          <div className="mt-6">
             <div className="relative h-2 rounded-full flex overflow-hidden">
                <div className="bg-blue-400" style={{ width: '25%' }}></div>
                <div className="bg-green-400" style={{ width: '25%' }}></div>
                <div className="bg-yellow-400" style={{ width: '25%' }}></div>
                <div className="bg-red-400" style={{ width: '25%' }}></div>
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-px" style={{ left: `${normalizedBmi}%` }}>
                    <div className="w-0.5 h-4 bg-black rounded-full"></div>
                </div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2 px-1">
                 <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-400"></div>Underweight</span>
                 <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>Healthy</span>
                 <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>Overweight</span>
                 <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>Obese</span>
            </div>
          </div>

          {/* Text Content */}
          <div className="mt-10 space-y-6 text-gray-700">
            <div>
              <h2 className="text-xl font-bold mb-2">Disclaimer</h2>
              <p>As with most measures of health, BMI is not a perfect test. For example, results can be thrown off by pregnancy or high muscle mass, and it may not be a good measure of health for children or the elderly.</p>
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">So then, why does BMI matter?</h2>
              <p className="mb-3">In general, the higher your BMI, the higher the risk of developing a range of conditions linked with excess weight, including:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>diabetes</li>
                <li>arthritis</li>
                <li>liver disease</li>
                <li>several types of cancer (such as those of the breast, colon, and prostate)</li>
                <li>high blood pressure (hypertension)</li>
                <li>high cholesterol</li>
                <li>sleep apnea.</li>
              </ul>
            </div>
            <a href="#" className="text-blue-600 underline">Source</a>
          </div>
        </main>
      </div>
    </div>
  );
};
