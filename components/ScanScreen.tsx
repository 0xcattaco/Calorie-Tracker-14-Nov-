import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CloseIcon, QuestionIcon, ScanIcon, BarcodeIcon, LabelIcon, LibraryIcon, FlashIcon } from './icons';
import { analyzeFoodImage, getNutritionalInfo } from '../services/geminiService';
import { Meal, NutritionInfo } from '../types';

interface ScanScreenProps {
  onClose: () => void;
  onFoodScanned: (meal: Meal) => void;
}

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
        if (typeof reader.result === 'string') {
            resolve(reader.result.split(',')[1]);
        } else {
            reject(new Error("Failed to read blob as base64 string"));
        }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const fileToBase64 = (file: File): Promise<{base64: string, dataUrl: string, mimeType: string}> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                resolve({
                    base64: reader.result.split(',')[1],
                    dataUrl: reader.result,
                    mimeType: file.type
                });
            } else {
                reject(new Error("Failed to read file as base64 string"));
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

export const ScanScreen: React.FC<ScanScreenProps> = ({ onClose, onFoodScanned }) => {
  const [activeTab, setActiveTab] = useState('Scan Food');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    const startCamera = async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Could not access the camera. Please check permissions.");
      }
    };
    if (activeTab !== 'Library') {
        startCamera();
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [activeTab]);

  const processImage = useCallback(async (base64: string, dataUrl: string, mimeType: string) => {
    setIsLoading(true);
    setError(null);
    try {
        const foodAnalysis = await analyzeFoodImage(base64, mimeType);
        const nutritionInfo = await getNutritionalInfo(foodAnalysis.dishName);

        const newMeal: Meal = {
            id: new Date().toISOString(),
            name: foodAnalysis.dishName,
            description: foodAnalysis.analysis,
            image: dataUrl,
            nutrition: nutritionInfo
        };

        onFoodScanned(newMeal);
    } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
        setIsLoading(false);
    }
  }, [onFoodScanned]);


  const handleCapture = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        const base64 = dataUrl.split(',')[1];
        processImage(base64, dataUrl, 'image/jpeg');
      }
    }
  }, [processImage]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        const { base64, dataUrl, mimeType } = await fileToBase64(file);
        await processImage(base64, dataUrl, mimeType);
    }
    // Reset the input value to allow selecting the same file again.
    if (event.target) {
        event.target.value = '';
    }
  };

  const handleLibraryClick = () => {
    fileInputRef.current?.click();
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
        {isLoading && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-20">
                <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                <p className="text-white mt-4">Analyzing your meal...</p>
            </div>
        )}
        {error && (
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-100 text-red-700 p-4 rounded-lg z-20 text-center">
                <p>Error: {error}</p>
                <button onClick={() => setError(null)} className="mt-2 px-4 py-1 bg-red-500 text-white rounded">Try Again</button>
            </div>
        )}

      <video ref={videoRef} autoPlay playsInline className="absolute w-full h-full object-cover"></video>
      <canvas ref={canvasRef} className="hidden"></canvas>
      <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />

      {/* Overlay UI */}
      <div className="absolute inset-0 flex flex-col justify-between p-4">
        {/* Top Bar */}
        <div className="flex justify-between items-center pt-safe">
          <button onClick={onClose} className="bg-black/30 text-white rounded-full p-2">
            <CloseIcon className="w-6 h-6" />
          </button>
          <button className="bg-black/30 text-white rounded-full p-2">
            <QuestionIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Focus Rectangle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] aspect-square">
            <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-white rounded-tl-lg"></div>
            <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-white rounded-tr-lg"></div>
            <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-white rounded-bl-lg"></div>
            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-white rounded-br-lg"></div>
        </div>

        {/* Bottom Controls */}
        <div className="pb-safe space-y-6">
          <div className="flex justify-center">
            <div className="bg-black/40 backdrop-blur-md rounded-full p-1 flex items-center gap-1">
              {['Scan Food', 'Barcode', 'Food label', 'Library'].map(tab => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab)
                    if (tab === 'Library') handleLibraryClick();
                  }}
                  className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${activeTab === tab ? 'bg-white text-black' : 'text-white'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-around items-center">
            <button className="bg-black/30 rounded-full p-3 text-white">
                <FlashIcon className="w-6 h-6"/>
            </button>
            <button onClick={handleCapture} className="w-20 h-20 rounded-full bg-white border-4 border-black/20"></button>
            <div className="w-12 h-12"></div> {/* Spacer */}
          </div>
        </div>
      </div>
    </div>
  );
};