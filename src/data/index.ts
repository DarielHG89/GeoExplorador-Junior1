import { CountryData } from '../types';
import { AMERICA_DATA } from './america';
import { EUROPE_DATA } from './europe';
import { ASIA_DATA } from './asia';
import { AFRICA_DATA } from './africa';
import { OCEANIA_DATA } from './oceania';
import { SOLAR_SYSTEM_INFO } from './solarSystem';
import { ANTARCTICA_DATA } from './antarctica';

// =================================================================================
//  Base de datos offline COMPLETA
// ---------------------------------------------------------------------------------
// Combina todos los continentes y el sistema solar para su uso en la app.
// =================================================================================

export const OFFLINE_DB: Record<string, CountryData> = {
  ...AMERICA_DATA,
  ...EUROPE_DATA,
  ...ASIA_DATA,
  ...AFRICA_DATA,
  ...OCEANIA_DATA,
  ...ANTARCTICA_DATA,
  ...SOLAR_SYSTEM_INFO
};