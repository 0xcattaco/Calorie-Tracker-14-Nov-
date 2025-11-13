import { GoogleGenAI, Type } from "@google/genai";
import { NutritionInfo, UserProfile } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const fileToGenerativePart = (base64Data: string, mimeType: string) => {
  return {
    inlineData: {
      data: base64Data,
      mimeType,
    },
  };
};

export interface FoodAnalysis {
  dishName: string;
  analysis: string;
}

export const analyzeFoodImage = async (base64Image: string, mimeType: string): Promise<FoodAnalysis> => {
  try {
    const imagePart = fileToGenerativePart(base64Image, mimeType);
    const prompt = `You are a world-class culinary expert with deep knowledge of global cuisines. Your task is to precisely identify the dish in this image. Analyze all visual elements meticulously: main ingredients, side components, sauces, textures, colors, and the preparation method (e.g., fried, braised, stewed). Pay close attention to details that might indicate a specific regional or cultural origin.
    
Provide the most specific and accurate name for the dish. For instance, if you see a noodle soup, don't just say 'noodle soup'; identify it as 'Vietnamese Beef Pho' or 'Japanese Tonkotsu Ramen' if the evidence supports it.
    
Return your answer ONLY in a valid JSON format with two keys: "dishName" (a string with the most specific name) and "analysis" (a detailed string breakdown of your reasoning).`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, { text: prompt }] },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              dishName: { type: Type.STRING, description: "The most specific and accurate name for the dish." },
              analysis: { type: Type.STRING, description: "A detailed breakdown of the culinary analysis." },
            },
            required: ['dishName', 'analysis'],
          },
        },
    });
    
    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as FoodAnalysis;
  } catch (error) {
    console.error("Error analyzing food image:", error);
    throw new Error("Failed to analyze image. Please try again.");
  }
};

const parseJsonFromMarkdown = (md: string): any => {
    const jsonMatch = md.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch && jsonMatch[1]) {
        try { return JSON.parse(jsonMatch[1]); } catch (e) { /* ignore */}
    }
    // Fallback for cases where the model doesn't use markdown
    try {
      return JSON.parse(md);
    } catch (e) {
      console.error("Failed to parse JSON directly", e);
    }
    throw new Error("Could not parse JSON from response.");
};


export const getNutritionalInfo = async (foodDescription: string): Promise<NutritionInfo> => {
  try {
    const prompt = `You are a nutrition analysis expert. For the food item "${foodDescription}", provide a detailed and accurate nutritional breakdown. Estimate the serving size from the description if not provided. Return the answer ONLY in a valid JSON format with keys for "calories", "protein", "carbs", and "fat". All values must be integers.`;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            calories: { type: Type.NUMBER },
            protein: { type: Type.NUMBER },
            carbs: { type: Type.NUMBER },
            fat: { type: Type.NUMBER },
          },
          required: ['calories', 'protein', 'carbs', 'fat'],
        },
      },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as NutritionInfo;
  } catch (error) {
    console.error("Error getting nutritional info:", error);
    throw new Error("Failed to get nutritional information. Please try again.");
  }
};


export const generateCustomPlan = async (profile: UserProfile): Promise<NutritionInfo> => {
    const age = profile.birthDate ? new Date().getFullYear() - profile.birthDate.year : 30;
    const prompt = `
        As an expert nutritionist AI, create a daily nutritional plan for a user with the following profile.

        User Profile:
        - Goal: ${profile.goal}
        - Gender: ${profile.gender}
        - Current Weight: ${profile.weight} kg
        - Height: ${profile.height} cm
        - Age: ${age}
        - Workouts per week: ${profile.workoutsPerWeek}
        - Desired Weight: ${profile.desiredWeight} kg
        - Diet preference: ${profile.diet || 'None'}

        Your calculation should follow these steps:
        1. Calculate the user's Basal Metabolic Rate (BMR) using a suitable formula like the Mifflin-St Jeor equation.
        2. Determine the Total Daily Energy Expenditure (TDEE) by applying an appropriate activity multiplier based on their weekly workouts (e.g., Sedentary=1.2, Lightly active=1.375, Moderately active=1.55, Very active=1.725).
        3. Adjust the TDEE based on their goal:
            - For 'Lose weight', create a safe caloric deficit of approximately 500 calories, but do not go below 1200 calories for women or 1500 for men.
            - For 'Gain weight', create a caloric surplus of approximately 300-500 calories.
            - For 'Maintain', keep the calories close to the TDEE.
        4. Distribute the final calorie count into macronutrients (protein, carbs, fat) in grams. Aim for a balanced distribution (e.g., 40% carbs, 30% protein, 30% fat), but consider the user's diet preference if specified (e.g., higher fat for Keto).

        Return the answer ONLY as a valid JSON object with the following keys: "calories", "protein", "carbs", "fat". The values must be integers.
        Example: {
          "calories": 2100,
          "protein": 150,
          "carbs": 200,
          "fat": 70
        }
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
             config: {
                responseMimeType: "application/json",
                responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                    calories: { type: Type.NUMBER },
                    protein: { type: Type.NUMBER },
                    carbs: { type: Type.NUMBER },
                    fat: { type: Type.NUMBER },
                  },
                  required: ['calories', 'protein', 'carbs', 'fat'],
                },
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as NutritionInfo;
    } catch (error) {
        console.error("Error generating custom plan:", error);
        // Return a sensible default if AI fails
        return { calories: 2000, protein: 150, carbs: 200, fat: 65 };
    }
};