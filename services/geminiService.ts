import { GoogleGenAI, GenerateContentResponse, Part } from "@google/genai";
import { AppMode, UserLocation, GroundingMetadata } from "../types";

interface GenerateParams {
  prompt: string;
  attachments: { mimeType: string; data: string }[];
  mode: AppMode;
  location?: UserLocation;
}

export const generateImage = async (prompt: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateImages({
    model: 'imagen-4.0-generate-001',
    prompt: prompt,
    config: {
      numberOfImages: 1,
      aspectRatio: '1:1',
      outputMimeType: 'image/png',
    },
  });
  
  const base64Data = response.generatedImages[0].image.imageBytes;
  return `data:image/png;base64,${base64Data}`;
};

export const generateResponse = async ({
  prompt,
  attachments,
  mode,
  location
}: GenerateParams): Promise<{ text: string; grounding?: GroundingMetadata; imageUrl?: string }> => {
  
  if (mode === AppMode.IMAGE) {
    const imageUrl = await generateImage(prompt);
    return { text: "Here is the image I generated for you:", imageUrl };
  }

  // Create instance inside the function to ensure up-to-date API key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  let modelName = 'gemini-3-flash-preview'; 
  let config: any = {};

  const hasMedia = attachments.length > 0;

  // Model Selection Logic
  if (mode === AppMode.THINKING) {
    modelName = 'gemini-3-pro-preview';
    config = {
      thinkingConfig: { thinkingBudget: 32768 },
    };
  } else if (mode === AppMode.SEARCH) {
    modelName = 'gemini-3-flash-preview';
    config = {
      tools: [{ googleSearch: {} }],
    };
  } else if (mode === AppMode.MAPS) {
    modelName = 'gemini-2.5-flash-lite-latest';
    config = {
      tools: [{ googleMaps: {} }],
      toolConfig: location ? {
        retrievalConfig: {
          latLng: {
            latitude: location.latitude,
            longitude: location.longitude
          }
        }
      } : undefined
    };
  } else if (mode === AppMode.CODE) {
    modelName = 'gemini-3-pro-preview';
    config = {
      systemInstruction: "You are a world-class senior software engineer. Provide concise, efficient, and well-documented code solutions. Explain complex logic clearly.",
    };
  } else if (hasMedia) {
    modelName = 'gemini-3-pro-preview';
  } else if (mode === AppMode.SMART) {
    modelName = 'gemini-3-pro-preview';
  } else {
    modelName = 'gemini-3-flash-preview';
  }

  const parts: Part[] = [];
  
  attachments.forEach(att => {
    parts.push({
      inlineData: {
        mimeType: att.mimeType,
        data: att.data
      }
    });
  });

  parts.push({ text: prompt });

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelName,
      contents: { parts },
      config: config,
    });

    const text = response.text || "I couldn't generate a text response.";

    let grounding: GroundingMetadata = {};
    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
      const chunks = candidates[0].groundingMetadata?.groundingChunks;
      if (chunks) {
        const searchChunks = chunks.filter((c: any) => c.web);
        const mapChunks = chunks.filter((c: any) => c.maps);
        
        if (searchChunks.length > 0) grounding.searchChunks = searchChunks;
        if (mapChunks.length > 0) grounding.mapChunks = mapChunks;
      }
    }

    return { text, grounding };

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error?.message?.includes("Requested entity was not found") || error?.message?.includes("unavailable")) {
        console.warn("Service might require project re-selection.");
    }
    throw error;
  }
};