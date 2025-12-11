import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../constants';
import { PatientData } from '../types';

export const analyzeCrisis = async (
  patient: PatientData,
  scenario: string,
  imageBase64?: string | null,
  audioBase64?: string | null
): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // 1. Construct Text Prompt part
  const textPrompt = `
    CRITICAL SCENARIO ANALYSIS REQUEST
    
    PATIENT DATA:
    - Weight: ${patient.weight ? patient.weight + ' kg' : 'Unknown'}
    - Age: ${patient.age || 'Unknown'}
    - Gender: ${patient.gender || 'Unknown'}
    - Pertinent History: ${patient.history || 'None'}
    
    CLINICAL SIGNS/SCENARIO:
    ${scenario}
    
    INSTRUCTIONS:
    Analyze the scenario, image (if provided), and audio (if provided). 
    Provide the Crisis Action Plan strictly following the system instruction format.
    If audio contains monitor sounds, infer urgency. 
    If image contains waveforms, analyze for obstruction/loss of capture/ischemia.
  `;

  const parts: any[] = [{ text: textPrompt }];

  // 2. Add Image part if available
  if (imageBase64) {
    parts.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: imageBase64
      }
    });
  }

  // 3. Add Audio part if available
  if (audioBase64) {
    parts.push({
      inlineData: {
        mimeType: 'audio/webm', // Browsers typically record to webm
        data: audioBase64
      }
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        thinkingConfig: { thinkingBudget: 2048 }, 
        temperature: 0.2,
      },
    });

    return response.text || "Analysis complete but no text returned.";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to analyze crisis scenario.");
  }
};