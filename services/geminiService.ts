import { GoogleGenAI, Type } from "@google/genai";
import { CountryData } from '../types';
import { OFFLINE_DB } from '../src/data';

// Initialize the Gemini API client
// The API key must be obtained exclusively from the environment variable process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const countryCache: Record<string, CountryData> = {};

export const fetchCountryInfo = async (countryName: string): Promise<CountryData> => {
  // 1. Check Memory Cache
  if (countryCache[countryName]) {
    return countryCache[countryName];
  }

  // 2. Check Offline Database (Instant match without API)
  const offlineMatch = Object.keys(OFFLINE_DB).find(key => 
    key.toLowerCase() === countryName.toLowerCase() || 
    OFFLINE_DB[key].name.toLowerCase() === countryName.toLowerCase()
  );

  if (offlineMatch) {
    const data = OFFLINE_DB[offlineMatch];
    countryCache[countryName] = data; 
    return data;
  }

  // 3. If not in cache or offline DB, try Gemini API
  const prompt = `Eres un profesor de geografía divertido para niños de 8 años. 
  Información sobre: "${countryName}".
  
  Reglas:
  1. Español.
  2. Lenguaje sencillo.
  3. "Área": compara con objetos (ej: campos de fútbol).
  4. "Población": números redondos.
  5. "Flag": Devuelve SOLO el emoji de la bandera de este país.
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
            name: { type: Type.STRING, description: "Nombre común en Español" },
            population: { type: Type.STRING, description: "Habitantes simplificado" },
            area: { type: Type.STRING, description: "Comparación de tamaño" },
            language: { type: Type.STRING, description: "Idioma principal" },
            capital: { type: Type.STRING, description: "Capital" },
            funFact: { type: Type.STRING, description: "Dato curioso para niños" },
            description: { type: Type.STRING, description: "Breve descripción geográfica" },
            flag: { type: Type.STRING, description: "Emoji de la bandera" },
            continent: { type: Type.STRING, description: "Continente" },
            currency: { type: Type.STRING, description: "Moneda" },
          },
          required: ["name", "population", "area", "language", "capital", "funFact", "description", "flag", "continent", "currency"],
        },
      },
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No response text");

    const data = JSON.parse(jsonText) as CountryData;
    countryCache[countryName] = data;
    return data;

  } catch (error) {
    console.warn("Gemini API failed, using generic fallback:", error);
    
    // 4. Ultimate Fallback if everything fails
    return {
      name: countryName,
      population: "Muchos habitantes",
      area: "Un gran territorio",
      language: "Desconocido",
      capital: "¿?",
      funFact: "¡Este lugar es tan misterioso que mis mapas no cargaron!",
      description: "Intenta conectar a internet para saber más.",
      flag: "🏳️",
      continent: "Mundo",
      currency: "Dinero"
    };
  }
};