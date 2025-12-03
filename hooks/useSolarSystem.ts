import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { GlobeMethods } from 'react-globe.gl';
import { GlobeVisualOptions } from '../components/LayerControls';
import { ExplorationMode } from '../types';
import { createLabelSprite } from '../utils/threeHelpers';
import {
  SCALED_SOLAR_SYSTEM_DATA, // Use scaled data
  COMETS_DATA,
  getOrbitPoints3D,
  calculateOrbitalPosition,
  getMoonOrbitPoints,
  getMoonPosition,
  PlanetData
} from '../services/astroService';

interface UseSolarSystemProps {
  globeEl: React.MutableRefObject<GlobeMethods | undefined>;
  explorationMode: ExplorationMode;
  visualOptions: GlobeVisualOptions;
  selectedObjectName: string | null; // Pass in the selected object
}

export const useSolarSystem = ({ globeEl, explorationMode, visualOptions, selectedObjectName }: UseSolarSystemProps) => {
  const solarSystemObjects = useRef(new Map());
  const cometObjects = useRef(new Map());
  const moonSphereRef = useRef<THREE.Mesh | null>(null);
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const earthHitboxRef = useRef<THREE.Mesh | null>(null);
  const solarSystemGroupRef = useRef<THREE.Group | null>(null); // Master group for the entire system

  const isSolarMode = explorationMode === 'solar_system';

  useEffect(() => {
    if (!isSolarMode || !globeEl.current) return;
    const globe = globeEl.current;
    const controls = globe.controls();
    controls.autoRotate = false; 
    controls.minDistance = 150;
    controls.maxDistance = 25000;
    controls.zoomSpeed = 2.0;     
  }, [isSolarMode]);

  useEffect(() => {
    const globe = globeEl.current;
    if (!globe) return;
    const scene = globe.scene();
    const textureLoader = new THREE.TextureLoader();

    // Create the master group for the solar system
    const solarSystemGroup = new THREE.Group();
    scene.add(solarSystemGroup);
    solarSystemGroupRef.current = solarSystemGroup;

    // Luces
    const sunLight = new THREE.DirectionalLight(0xffffff, 2.5);
    solarSystemGroup.add(sunLight); // Add light to the group
    sunLightRef.current = sunLight;
    const ambientLight = new THREE.AmbientLight(0x404040, 0.1);
    solarSystemGroup.add(ambientLight);

    // Hitbox Tierra (Invisible, para clicks)
    const hbGeo = new THREE.SphereGeometry(100, 32, 32);
    const hbMat = new THREE.MeshBasicMaterial({ visible: false });
    const earthHitbox = new THREE.Mesh(hbGeo, hbMat);
    earthHitbox.userData = { name: "Earth", isCelestial: true };
    scene.add(earthHitbox); // Hitbox stays at origin, as the globe is there
    earthHitboxRef.current = earthHitbox;

    // Luna (Visualización Geocéntrica - AHORA DENTRO DEL GRUPO)
    const moonTexture = textureLoader.load('//unpkg.com/three-globe/example/img/moon.jpg');
    const moonGeometry = new THREE.SphereGeometry(2, 32, 32);
    const moonMaterial = new THREE.MeshStandardMaterial({ map: moonTexture, fog: false });
    const moonSphere = new THREE.Mesh(moonGeometry, moonMaterial);
    moonSphere.userData = { name: "Moon" };
    moonSphereRef.current = moonSphere;
    
    const moonLabel = createLabelSprite('Luna', 18, '#E0E0E0');
    moonSphere.add(moonLabel);
    solarSystemGroup.add(moonSphere);

    const moonOrbitPoints = getMoonOrbitPoints();
    const moonOrbitGeom = new THREE.BufferGeometry().setFromPoints(moonOrbitPoints);
    const moonOrbitMat = new THREE.LineBasicMaterial({ color: 0xaaaaaa, opacity: 0.4, transparent: true });
    const moonOrbitLine = new THREE.Line(moonOrbitGeom, moonOrbitMat);
    solarSystemGroup.add(moonOrbitLine);

    // --- PLANETAS DEL SISTEMA SOLAR ---
    SCALED_SOLAR_SYSTEM_DATA.forEach(planet => {
        const objects: { [key: string]: any } = {};

        // 1. Línea de Órbita (Eclíptica)
        if (planet.name !== 'Sun') {
            const orbitPoints = getOrbitPoints3D(planet);
            const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
            const orbitMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.2, transparent: true });
            const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
            solarSystemGroup.add(orbitLine);
            objects.orbit = orbitLine;
        }

        if (planet.name !== 'Earth') {
            const tiltGroup = new THREE.Group();
            const obliquityRad = planet.obliquity * (Math.PI / 180);
            tiltGroup.rotation.z = obliquityRad;
            
            solarSystemGroup.add(tiltGroup);
            objects.tiltGroup = tiltGroup;

            const planetGeometry = new THREE.SphereGeometry(planet.radius, 32, 32);
            const planetMaterial = planet.name === 'Sun'
                ? new THREE.MeshBasicMaterial({ map: textureLoader.load(planet.textureUrl), fog: false })
                : new THREE.MeshStandardMaterial({ map: textureLoader.load(planet.textureUrl) });
            const planetMesh = new THREE.Mesh(planetGeometry, planetMaterial);
            planetMesh.userData = { name: planet.name }; 
            
            tiltGroup.add(planetMesh);
            objects.mesh = planetMesh; 

            // Etiquetas (Fuera del mesh para no rotar con la textura, pero dentro del tiltGroup para seguir posición)
            const labelText = planet.label;
            const labelSize = planet.name === 'Sun' ? 24 : 16;
            const labelColor = planet.name === 'Sun' ? '#FFD700' : '#FFFFFF';
            const planetLabel = createLabelSprite(labelText, labelSize, labelColor);
            tiltGroup.add(planetLabel);
            objects.label = planetLabel;

            // Anillos (Saturno, Urano...)
            if (planet.rings) {
                const ringGeometry = new THREE.RingGeometry(planet.rings.innerRadius, planet.rings.outerRadius, 64);
                const ringMaterial = new THREE.MeshBasicMaterial({
                    map: textureLoader.load(planet.rings.textureUrl),
                    side: THREE.DoubleSide,
                    transparent: true,
                    opacity: 0.8
                });
                const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
                ringMesh.rotation.x = Math.PI / 2; // Anillos planos en el ecuador (X-Z local)
                tiltGroup.add(ringMesh); // Se inclinan con el grupo
                objects.rings = ringMesh;
            }

            // Lunas (Orbitan en el ecuador inclinado)
            if (planet.moons && planet.moons.length > 0) {
                objects.moons = [];
                planet.moons.forEach(moon => {
                    const moonGeo = new THREE.SphereGeometry(moon.radius, 16, 16);
                    const moonMat = new THREE.MeshStandardMaterial({ color: moon.color });
                    const moonMesh = new THREE.Mesh(moonGeo, moonMat);
                    moonMesh.userData = { name: moon.name };
                    
                    tiltGroup.add(moonMesh);

                    const mLabel = createLabelSprite(moon.label || moon.name, 12, '#cccccc');
                    // Add label to scene or manage separately? Adding to mesh creates rotation issues.
                    // Adding to tiltGroup is better, will update pos manually.
                    tiltGroup.add(mLabel);

                    // Órbita de la luna (Calculada relativa al centro local 0,0,0)
                    const mOrbitPoints = getOrbitPoints3D(moon); 
                    const mOrbitGeo = new THREE.BufferGeometry().setFromPoints(mOrbitPoints);
                    const mOrbitMat = new THREE.LineBasicMaterial({ color: moon.color, opacity: 0.3, transparent: true });
                    const mOrbitLine = new THREE.Line(mOrbitGeo, mOrbitMat);
                    tiltGroup.add(mOrbitLine);

                    objects.moons.push({
                       mesh: moonMesh,
                       orbit: mOrbitLine,
                       label: mLabel,
                       data: moon
                    });
                });
            }
        }
        solarSystemObjects.current.set(planet.name, objects);
    });

    // --- COMETAS ---
    COMETS_DATA.forEach(comet => {
        const objects: { [key: string]: any } = {};
        
        // Órbita Kepleriana
        const orbitPoints = getOrbitPoints3D(comet);
        const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
        const orbitMaterial = new THREE.LineBasicMaterial({ color: comet.color, opacity: 0.3, transparent: true });
        const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
        scene.add(orbitLine);
        objects.orbit = orbitLine;

        // Cuerpo
        const cometGeo = new THREE.SphereGeometry(comet.radius, 8, 8);
        const cometMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const cometMesh = new THREE.Mesh(cometGeo, cometMat);
        cometMesh.userData = { name: comet.name };
        scene.add(cometMesh);
        objects.mesh = cometMesh;

        const label = createLabelSprite(comet.label, 14, '#aaddff');
        cometMesh.add(label);
        objects.label = label;

        // Cola
        const tailGeo = new THREE.ConeGeometry(comet.radius * 2, 40, 32, 1, true);
        const tailMat = new THREE.MeshBasicMaterial({ 
             color: comet.color, transparent: true, opacity: 0.3, side: THREE.DoubleSide, depthWrite: false
        });
        const tailMesh = new THREE.Mesh(tailGeo, tailMat);
        scene.add(tailMesh);
        objects.tail = tailMesh;

        objects.data = comet;
        cometObjects.current.set(comet.name, objects);
    });

    // --- ANIMATION LOOP ---
    const animate = () => {
      if (!solarSystemGroupRef.current) return;
      const now = new Date();
      const time = now.getTime() * 0.001;

      // Determine the center of the universe for this frame
      const centerObjectName = selectedObjectName || 'Earth';
      const centerObjectData = SCALED_SOLAR_SYSTEM_DATA.find(p => p.name === centerObjectName);
      let centerObjectPosition = new THREE.Vector3(0, 0, 0);

      if (centerObjectData) {
          const pos = calculateOrbitalPosition(centerObjectData, now);
          centerObjectPosition.set(pos.x, pos.y, pos.z);
      }
      
      // Move the entire solar system to keep the selected object at the origin
      solarSystemGroupRef.current.position.copy(centerObjectPosition).negate();

      let sunGeoPos = new THREE.Vector3();

      // Update Planets
      SCALED_SOLAR_SYSTEM_DATA.forEach(planet => {
        const objects = solarSystemObjects.current.get(planet.name);
        
        if (planet.name !== 'Earth' && objects) {
            const posData = calculateOrbitalPosition(planet, now);
            const pos = new THREE.Vector3(posData.x, posData.y, posData.z);

            if (objects.tiltGroup) objects.tiltGroup.position.copy(pos);
            if (objects.orbit) objects.orbit.position.set(0,0,0); // Orbits are relative to the sun
                
                // Rotación Axial (Día/Noche) - Rota sobre eje Y local del tiltGroup
                if (objects.mesh) {
                    const rotationSpeed = (2 * Math.PI) / (Math.abs(planet.rotationPeriod) * 3600 / 50000); // Scale factor for visuals
                    // Si rotationPeriod es negativo (Venus, Urano), gira al revés
                    const direction = Math.sign(planet.rotationPeriod);
                    objects.mesh.rotation.y = time * direction * 0.1; 
                }

                if (planet.name === 'Sun') {
                    sunGeoPos.copy(pos);
                    if (sunLightRef.current) sunLightRef.current.position.copy(pos);
                }

                if (objects.moons) {
                    objects.moons.forEach((m: any) => {
                        const moonPosData = calculateOrbitalPosition(m.data, now);
                        const moonPos = new THREE.Vector3(moonPosData.x, moonPosData.y, moonPosData.z);
                        if (m.mesh) m.mesh.position.copy(moonPos);
                        if (m.label) {
                            m.label.position.copy(moonPos);
                            m.label.position.y += m.data.radius * 2 + 2;
                        }
                    });
                }
            }
        });

      COMETS_DATA.forEach(comet => {
        const objects = cometObjects.current.get(comet.name);
        if (objects) {
             const posData = calculateOrbitalPosition(comet, now);
             const pos = new THREE.Vector3(posData.x, posData.y, posData.z);
             if (objects.mesh) objects.mesh.position.copy(pos);
             if (objects.orbit) objects.orbit.position.set(0,0,0);
             if (objects.tail) {
                 objects.tail.position.copy(pos);
                 const sunToComet = new THREE.Vector3().subVectors(pos, sunGeoPos).normalize();
                 const lookTarget = new THREE.Vector3().copy(pos).add(sunToComet);
                 objects.tail.lookAt(lookTarget);
                 const distToSun = pos.distanceTo(sunGeoPos);
                 const scale = Math.max(0.5, 800 / (distToSun + 10)); 
                 objects.tail.scale.set(scale, 1, scale);
             }
        }
      });
      
      const moonPosData = getMoonPosition(now);
      const earthData = SCALED_SOLAR_SYSTEM_DATA.find(p => p.name === 'Earth');
      const earthPos = earthData ? calculateOrbitalPosition(earthData, now) : {x:0,y:0,z:0};
      const finalMoonPos = new THREE.Vector3(moonPosData.x + earthPos.x, moonPosData.y + earthPos.y, moonPosData.z + earthPos.z);
      if (moonSphereRef.current) moonSphereRef.current.position.copy(finalMoonPos);

      const camera = globeEl.current?.camera();
      if (camera) {
        SCALED_SOLAR_SYSTEM_DATA.forEach(planet => {
             const obj = solarSystemObjects.current.get(planet.name);
             if (obj && obj.label && obj.tiltGroup) {
                 const worldPos = new THREE.Vector3();
                 obj.tiltGroup.getWorldPosition(worldPos);
                 const dist = worldPos.distanceTo(camera.position);
                 const scale = Math.max(10, dist / 40);
                 obj.label.scale.set(scale, scale, 1);
                 obj.label.position.set(0, planet.radius * 1.5 + scale * 0.2, 0); 
             }
        });
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      try {
        const scene = globeEl.current?.scene();
        if(scene && solarSystemGroupRef.current) {
            scene.remove(solarSystemGroupRef.current);
        }
        if(scene && earthHitboxRef.current) {
            scene.remove(earthHitboxRef.current);
        }
      } catch(e){ console.error("Error cleaning up scene:", e); }
    };
  }, []); // Should only run once on mount

  // Helpers para interacción (Raycasting)
  const getInteractableObjects = useCallback(() => {
      const objects: THREE.Object3D[] = [];
      if (earthHitboxRef.current) objects.push(earthHitboxRef.current);
      
      solarSystemObjects.current.forEach((obj: any) => {
          if (obj.mesh) objects.push(obj.mesh);
      });
      
      cometObjects.current.forEach((obj: any) => {
          if (obj.mesh) objects.push(obj.mesh);
      });
      return objects;
  }, []);

  const getObjectByName = useCallback((name: string) => {
      if (name === 'Earth') return earthHitboxRef.current;

      const planetObj = solarSystemObjects.current.get(name);
      // Devolver el tiltGroup si existe, ya que contiene la posición mundial correcta.
      // El mesh por sí solo tiene una posición local relativa al grupo.
      if (planetObj && planetObj.tiltGroup) {
          return planetObj.tiltGroup;
      }
      if (planetObj && planetObj.mesh) { // Fallback para el Sol si no tuviera tiltGroup
          return planetObj.mesh;
      }

      const cometObj = cometObjects.current.get(name);
      if (cometObj && cometObj.mesh) return cometObj.mesh;
      
      // Buscar lunas
      let moonMesh = null;
      solarSystemObjects.current.forEach((obj: any) => {
          if (obj.moons) {
              const found = obj.moons.find((m: any) => m.data.name === name);
              if (found) moonMesh = found.mesh;
          }
      });
      return moonMesh;
  }, []);

  return { getInteractableObjects, getObjectByName };
};