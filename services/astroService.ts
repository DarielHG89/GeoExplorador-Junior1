import * as THREE from 'three';

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface CelestialBodyData {
  name: string;
  label: string;
  radius: number; // visual radius
  distance: number; // semi-major axis (visual scale)
  period: number; // orbital period in Earth days
  eccentricity: number;
  inclination: number; // degrees relative to ecliptic
  ascendingNode: number; // Longitude of ascending node (degrees)
  obliquity: number; // Axial tilt in degrees
  rotationPeriod: number; // Hours for full rotation
  initialAngle: number; // Mean anomaly at epoch
  color?: number;
  textureUrl?: string;
}

export interface MoonData extends CelestialBodyData {
  parentName?: string;
}

export interface PlanetData extends CelestialBodyData {
  rings?: { innerRadius: number; outerRadius: number; textureUrl: string; };
  moons?: MoonData[];
}

export interface CometData extends CelestialBodyData {
  semiMajorAxis: number;
}

const textureHost = 'https://raw.githubusercontent.com/jeromeetienne/threex.planets/master/images/';

// Helper to convert degrees to radians
const rad = (deg: number) => deg * (Math.PI / 180);

export const SOLAR_SYSTEM_DATA: PlanetData[] = [
  { 
    name: 'Sun', label: 'Sol', radius: 40, distance: 0, period: 1, eccentricity: 0, 
    inclination: 0, ascendingNode: 0, obliquity: 0, rotationPeriod: 600, initialAngle: 0,
    textureUrl: `${textureHost}sunmap.jpg` 
  },
  { 
    name: 'Mercury', label: 'Mercurio', radius: 2, distance: 220, period: 88, eccentricity: 0.205, 
    inclination: 7.0, ascendingNode: 48, obliquity: 0.03, rotationPeriod: 1407, initialAngle: 174,
    textureUrl: `${textureHost}mercurymap.jpg` 
  },
  { 
    name: 'Venus', label: 'Venus', radius: 4, distance: 300, period: 225, eccentricity: 0.007, 
    inclination: 3.4, ascendingNode: 76, obliquity: 177.3, rotationPeriod: -5832, initialAngle: 50, // Retrograde
    textureUrl: `${textureHost}venusmap.jpg` 
  },
  { 
    name: 'Earth', label: 'Tierra', radius: 0, distance: 450, period: 365.25, eccentricity: 0.017, 
    inclination: 0, ascendingNode: 0, obliquity: 23.4, rotationPeriod: 24, initialAngle: 358,
    textureUrl: '' 
  },
  { 
    name: 'Mars', label: 'Marte', radius: 3, distance: 600, period: 687, eccentricity: 0.093, 
    inclination: 1.85, ascendingNode: 49, obliquity: 25.2, rotationPeriod: 24.6, initialAngle: 19,
    textureUrl: `${textureHost}marsmap.jpg`,
    moons: [
      { name: 'Phobos', label: 'Fobos', radius: 0.8, distance: 6, period: 0.3, eccentricity: 0.015, inclination: 1.09, ascendingNode: 0, obliquity: 0, rotationPeriod: 7, initialAngle: 0, color: 0x888888 },
      { name: 'Deimos', label: 'Deimos', radius: 0.5, distance: 10, period: 1.2, eccentricity: 0.0002, inclination: 0.93, ascendingNode: 0, obliquity: 0, rotationPeriod: 30, initialAngle: 120, color: 0xaaaaaa }
    ]
  },
  {
    name: 'Ceres', label: 'Ceres', radius: 1.0, distance: 800, period: 1680, eccentricity: 0.079,
    inclination: 10.6, ascendingNode: 80, obliquity: 4, rotationPeriod: 9, initialAngle: 0,
    textureUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Ceres_-_RC3_-_Haulani_Crater_%2822381131691%29_%28cropped%29.jpg/800px-Ceres_-_RC3_-_Haulani_Crater_%2822381131691%29_%28cropped%29.jpg'
  },
  { 
    name: 'Jupiter', label: 'Júpiter', radius: 20, distance: 1200, period: 4333, eccentricity: 0.048, 
    inclination: 1.3, ascendingNode: 100, obliquity: 3.1, rotationPeriod: 9.9, initialAngle: 20,
    textureUrl: `${textureHost}jupitermap.jpg`,
    moons: [
      { name: 'Io', label: 'Ío', radius: 1.5, distance: 30, period: 1.7, eccentricity: 0.004, inclination: 0.05, ascendingNode: 0, obliquity: 0, rotationPeriod: 42, initialAngle: 0, color: 0xffffaa },
      { name: 'Europa', label: 'Europa', radius: 1.2, distance: 40, period: 3.5, eccentricity: 0.009, inclination: 0.47, ascendingNode: 0, obliquity: 0, rotationPeriod: 85, initialAngle: 90, color: 0xaaccff },
      { name: 'Ganymede', label: 'Ganimedes', radius: 2.2, distance: 55, period: 7.1, eccentricity: 0.001, inclination: 0.2, ascendingNode: 0, obliquity: 0, rotationPeriod: 171, initialAngle: 180, color: 0xdddddd },
      { name: 'Callisto', label: 'Calisto', radius: 2.0, distance: 75, period: 16.7, eccentricity: 0.007, inclination: 0.2, ascendingNode: 0, obliquity: 0, rotationPeriod: 400, initialAngle: 270, color: 0x887766 }
    ]
  },
  { 
    name: 'Saturn', label: 'Saturno', radius: 18, distance: 1800, period: 10759, eccentricity: 0.056, 
    inclination: 2.48, ascendingNode: 113, obliquity: 26.7, rotationPeriod: 10.7, initialAngle: 317,
    textureUrl: `${textureHost}saturnmap.jpg`, 
    rings: { innerRadius: 25, outerRadius: 40, textureUrl: `${textureHost}saturnringcolor.jpg` },
    moons: [
      { name: 'Titan', label: 'Titán', radius: 2.2, distance: 100, period: 15.9, eccentricity: 0.028, inclination: 0.3, ascendingNode: 0, obliquity: 0, rotationPeriod: 382, initialAngle: 0, color: 0xffaa00 },
      { name: 'Enceladus', label: 'Encélado', radius: 0.9, distance: 52, period: 1.4, eccentricity: 0.004, inclination: 0.01, ascendingNode: 0, obliquity: 0, rotationPeriod: 33, initialAngle: 120, color: 0xffffff }
    ]
  },
  { 
    name: 'Uranus', label: 'Urano', radius: 10, distance: 2400, period: 30687, eccentricity: 0.046, 
    inclination: 0.77, ascendingNode: 74, obliquity: 97.8, rotationPeriod: -17.2, initialAngle: 142,
    textureUrl: `${textureHost}uranusmap.jpg`, 
    rings: { innerRadius: 15, outerRadius: 22, textureUrl: `${textureHost}uranusringcolour.jpg` },
    moons: [
      { name: 'Titania', label: 'Titania', radius: 1.3, distance: 46, period: 8.7, eccentricity: 0.001, inclination: 0.3, ascendingNode: 0, obliquity: 0, rotationPeriod: 209, initialAngle: 0, color: 0xdddddd },
      { name: 'Oberon', label: 'Oberón', radius: 1.2, distance: 54, period: 13.5, eccentricity: 0.001, inclination: 0.05, ascendingNode: 0, obliquity: 0, rotationPeriod: 323, initialAngle: 180, color: 0xbbbbbb }
    ]
  },
  { 
    name: 'Neptune', label: 'Neptuno', radius: 9, distance: 3000, period: 60190, eccentricity: 0.009, 
    inclination: 1.77, ascendingNode: 131, obliquity: 28.3, rotationPeriod: 16.1, initialAngle: 256,
    textureUrl: `${textureHost}neptunemap.jpg`,
    moons: [
      { name: 'Triton', label: 'Tritón', radius: 1.4, distance: 25, period: -5.8, eccentricity: 0, inclination: 156, ascendingNode: 0, obliquity: 0, rotationPeriod: 141, initialAngle: 0, color: 0xffcccc }
    ]
  },
  { 
     name: 'Pluto', label: 'Plutón', radius: 1.5, distance: 3800, period: 90560, eccentricity: 0.248, 
     inclination: 17.1, ascendingNode: 110, obliquity: 122.5, rotationPeriod: -153, initialAngle: 14,
     textureUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e1/Pluto_%28New_Horizons%29.jpg',
     moons: [
       { name: 'Charon', label: 'Caronte', radius: 0.8, distance: 5, period: 6.4, eccentricity: 0, inclination: 0, ascendingNode: 0, obliquity: 0, rotationPeriod: 153, initialAngle: 0, color: 0x888888 }
     ]
  },
  {
     name: 'Eris', label: 'Eris', radius: 1.4, distance: 4500, period: 204000, eccentricity: 0.44, 
     inclination: 44, ascendingNode: 35, obliquity: 78, rotationPeriod: 25.9, initialAngle: 30,
     textureUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Eris_and_dysnomia2.jpg/800px-Eris_and_dysnomia2.jpg'
  }
];

export const COMETS_DATA: CometData[] = [
  {
    name: 'Halley', label: 'Cometa Halley', radius: 1.0, distance: 88, semiMajorAxis: 1500, period: 27000, 
    eccentricity: 0.967, inclination: 162.2, ascendingNode: 58, obliquity: 0, rotationPeriod: 50, initialAngle: 0,
    color: 0x00ffff
  },
  {
    name: 'HaleBopp', label: 'Hale-Bopp', radius: 1.2, distance: 120, semiMajorAxis: 2500, period: 45000, 
    eccentricity: 0.995, inclination: 89.4, ascendingNode: 282, obliquity: 0, rotationPeriod: 11, initialAngle: 180,
    color: 0xffaa00
  }
];

/**
 * Calculates a 3D position based on Keplerian orbital elements.
 * Returns Vector3D {x, y, z} where Y is "Up" in Three.js (Ecliptic Normal), 
 * X is Vernal Equinox, Z is 90 deg.
 */
export function calculateOrbitalPosition(body: CelestialBodyData, date: Date): Vector3D {
  if (body.distance === 0) return { x: 0, y: 0, z: 0 }; // Sun

  const daysSinceEpoch = date.getTime() / (1000 * 60 * 60 * 24);
  
  // 1. Mean Anomaly (M)
  const n = (2 * Math.PI) / body.period; // Mean motion
  const M = rad(body.initialAngle) + n * daysSinceEpoch;

  // 2. Eccentric Anomaly (E) - Solve Kepler's Equation M = E - e*sin(E)
  let E = M;
  for (let i = 0; i < 5; i++) {
    E = M + body.eccentricity * Math.sin(E);
  }

  // 3. Position in Orbital Plane (2D)
  // X axis is along the semi-major axis (towards periapsis)
  const a = (body as any).semiMajorAxis || body.distance;
  const x_orb = a * (Math.cos(E) - body.eccentricity);
  const y_orb = a * Math.sqrt(1 - body.eccentricity ** 2) * Math.sin(E);
  // z_orb = 0 in the orbital plane

  // 4. Rotate to 3D Ecliptic Coordinates
  // Standard transformation:
  // - Rotate by Argument of Periapsis (w) around Z (orbit normal) - Simplified to 0 here/merged with initialAngle
  // - Rotate by Inclination (i) around X (Line of Nodes)
  // - Rotate by Longitude of Ascending Node (Omega) around Z (Ecliptic Pole) - But we map Z to Y for Three.js

  const i = rad(body.inclination);
  const omega = rad(body.ascendingNode);

  // Apply Inclination (Rotate around X axis)
  // y_inc = y_orb * cos(i)
  // z_inc = y_orb * sin(i)
  // Wait, in Three.js Y is UP. 
  // Let's assume the Orbital Plane starts on X-Z plane (Y=0).
  // x_plane = x_orb
  // z_plane = y_orb
  // y_plane = 0
  
  // Inclination rotates "Up" from the plane.
  // new_y = z_plane * sin(i)
  // new_z = z_plane * cos(i)
  
  let x = x_orb;
  let y = y_orb * Math.sin(i);
  let z = y_orb * Math.cos(i);

  // Apply Ascending Node (Rotate around Y axis - The Ecliptic Pole)
  const x_final = x * Math.cos(omega) - z * Math.sin(omega);
  const z_final = x * Math.sin(omega) + z * Math.cos(omega);
  const y_final = y;

  return { x: x_final, y: y_final, z: z_final };
}

/**
 * Generates the 3D orbit line points.
 */
export function getOrbitPoints3D(body: CelestialBodyData): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  const segments = 128;
  const a = (body as any).semiMajorAxis || body.distance;
  const b = a * Math.sqrt(1 - body.eccentricity ** 2);
  const i = rad(body.inclination);
  const omega = rad(body.ascendingNode);

  for (let s = 0; s <= segments; s++) {
      const E = (s / segments) * 2 * Math.PI;
      const x_orb = a * (Math.cos(E) - body.eccentricity);
      const y_orb = b * Math.sin(E); 
      // z_orb = 0

      // Rotate for Inclination (around X)
      // Assuming plane is X-Z, Y is up.
      let x = x_orb;
      let y = y_orb * Math.sin(i);
      let z = y_orb * Math.cos(i);

      // Rotate for Ascending Node (around Y)
      const x_final = x * Math.cos(omega) - z * Math.sin(omega);
      const z_final = x * Math.sin(omega) + z * Math.cos(omega);

      points.push(new THREE.Vector3(x_final, y, z_final));
  }
  return points;
}

// Helpers for backward compatibility
export const getPlanetPosition = (planet: PlanetData, date: Date) => calculateOrbitalPosition(planet, date);
export const getOrbitPoints = (planet: PlanetData) => getOrbitPoints3D(planet);
export const getMoonPosition = (date: Date) => {
    // Earth's Moon specific approx relative to Ecliptic
    const moonData: MoonData = { 
        name: 'Moon', label: '', radius: 0, distance: 150, period: 27.3, eccentricity: 0.055, 
        inclination: 5.1, ascendingNode: 0, obliquity: 0, rotationPeriod: 0, initialAngle: 0 
    };
    return calculateOrbitalPosition(moonData, date);
}
export const getMoonOrbitPoints = () => {
    const moonData: MoonData = { 
        name: 'Moon', label: '', radius: 0, distance: 150, period: 27.3, eccentricity: 0.055, 
        inclination: 5.1, ascendingNode: 0, obliquity: 0, rotationPeriod: 0, initialAngle: 0 
    };
    return getOrbitPoints3D(moonData);
}