export interface CountryData {
  name: string;
  population: string; // Used as "Diameter/Size" for planets
  area: string;       // Used as "Distance from Sun" for planets
  language: string;   // Used as "Temperature" for planets
  capital: string;    // Used as "Type" (Planet/Star) for planets
  funFact: string;
  description: string;
  flag: string;      // Emoji
  continent: string; // "Sistema Solar" for planets
  currency: string;  // Used as "Orbital Period" or "Day Length"
  isPlanet?: boolean; // New flag to distinguish UI
}

export interface GeoJsonFeature {
  type: string;
  properties: {
    ISO_A2?: string;
    ISO_A3?: string;
    NAME?: string;
    NAME_LONG?: string;
    admin?: string; // Common name in some datasets
    [key: string]: any;
  };
  geometry: any;
}

export type ViewMode = '3d' | '2d';
export type ExplorationMode = 'geographic' | 'solar_system';

// Used for Gemini API response mapping
export interface GeminiResponse {
  name: string;
  population: string;
  area: string;
  language: string;
  capital: string;
  funFact: string;
  description: string;
  flag: string;
  continent: string;
  currency: string;
}

export interface QuizQuestion {
  flag: string;
  options: string[];
  correctAnswer: string;
  geoJsonName: string; // The English name used in GeoJSON properties
}