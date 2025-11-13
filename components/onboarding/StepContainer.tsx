import React from 'react';
import { BackIcon } from '../icons';

interface StepContainerProps {
  title: string;
  subtitle?: string;
  onBack: () => void;
  showBack: boolean;
  progress: number;
  onContinue: () => void;
  isContinueDisabled: boolean;
  continueText?: string;
  showContinue?: boolean;
  showProgress?: boolean;
  children: React.ReactNode;
}

export const StepContainer: React.FC<StepContainerProps> = ({
  title,
  subtitle,
  onBack,
  showBack,
  progress,
  onContinue,
  isContinueDisabled,
  continueText = "Continue",
  showContinue = true,
  showProgress = true,
  children,
}) => {
  return (
    <div className="bg-gray-50 min-h-screen flex flex-col font-sans">
      <div className="max-w-md mx-auto w-full flex-grow flex flex-col p-6">
        <header className="h-16">
          <div className="relative flex items-center justify-center h-full">
            {showBack && (
              <button onClick={onBack} className="absolute left-0 p-2">
                <BackIcon className="w-6 h-6 text-gray-600" />
              </button>
            )}
            {showProgress && (
                <div className="absolute top-4 w-full px-12">
                    <div className="w-full bg-gray-200 rounded-full h-1">
                        <div 
                            className="bg-black h-1 rounded-full transition-all duration-500" 
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>
            )}
          </div>
        </header>

        <main className="flex-grow flex flex-col justify-center py-8">
          <div className="text-left mb-8">
            <h1 className="text-3xl font-bold mb-2 text-black" dangerouslySetInnerHTML={{ __html: title }}></h1>
            {subtitle && <p className="text-gray-500">{subtitle}</p>}
          </div>
          {children}
        </main>

        {showContinue && (
            <footer className="py-4">
            <button
                onClick={onContinue}
                disabled={isContinueDisabled}
                className="w-full bg-black text-white font-bold py-4 rounded-full disabled:bg-gray-300 transition-colors"
            >
                {continueText}
            </button>
            </footer>
        )}
      </div>
    </div>
  );
};