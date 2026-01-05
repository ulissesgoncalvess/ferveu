
import { GoogleGenAI } from "@google/genai";

// Fix: Strictly use process.env.API_KEY as per instructions
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getNightStrategy = async (userName: string, userLevel: string, activePlaces: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are the "Ferveu Concierge", a nightlife expert for an app that shows where the parties are in real-time. 
      User: ${userName} (Level: ${userLevel}). 
      Current Scene: ${activePlaces}.
      Provide a 2-sentence "Night Strategy" in Brazilian Portuguese that sounds cool, hype-focused, and encourages them to increase their status by posting and checking in. 
      Use slang appropriate for 20-year-olds in Brazil (e.g., 'rolê', 'vibe', 'tá fervendo').`,
      config: {
        temperature: 0.8,
        topP: 0.95,
      }
    });
    // Fix: Access response.text directly (property, not method)
    return response.text || "A noite está só começando. Bora esquentar esse mapa!";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "O rolê te espera. Onde vamos ferver hoje?";
  }
};
