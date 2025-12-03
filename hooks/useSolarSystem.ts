import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GlobeMethods } from 'react-globe.gl';
import { GlobeVisualOptions } from '../components/LayerControls';
import { ExplorationMode } from '../types';
import { createLabelSprite } from '../utils/threeHelpers';
import {
  SOLAR_SYSTEM_DATA,
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
}

export const useSolarSystem = ({ globeEl, explorationMode, visualOptions }: UseSolarSystemProps) => {
  const solarSystemObjects = useRef(new Map());
  const cometObjects = useRef(new Map());
  const moonSphereRef = useRef<THREE.Mesh | null>(null);
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const earthHitboxRef = useRef<THREE.Mesh | null>(null);

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

    // Luces
    const sunLight = new THREE.DirectionalLight(0xffffff, 2.5);
    scene.add(sunLight);
    sunLightRef.current = sunLight;
    const ambientLight = new THREE.AmbientLight(0x404040, 0.1);
    scene.add(ambientLight);

    // Hitbox Tierra (Invisible, para clicks)
    const hbGeo = new THREE.SphereGeometry(100, 32, 32);
    const hbMat = new THREE.MeshBasicMaterial({ visible: false });
    const earthHitbox = new THREE.Mesh(hbGeo, hbMat);
    earthHitbox.userData = { name: "Earth", isCelestial: true };
    scene.add(earthHitbox);
    earthHitboxRef.current = earthHitbox;

    // Luna (Visualización Geográfica - Geocéntrica)
    const moonTexture = textureLoader.load('//unpkg.com/three-globe/example/img/moon.jpg');
    const moonGeometry = new THREE.SphereGeometry(2, 32, 32);
    const moonMaterial = new THREE.MeshStandardMaterial({ map: moonTexture, fog: false });
    const moonSphere = new THREE.Mesh(moonGeometry, moonMaterial);
    moonSphere.userData = { name: "Moon" };
    moonSphereRef.current = moonSphere;
    
    const moonLabel = createLabelSprite('Luna', 18, '#E0E0E0');
    moonSphere.add(moonLabel);
    scene.add(moonSphere);

    const moonOrbitPoints = getMoonOrbitPoints();
    const moonOrbitGeom = new THREE.BufferGeometry().setFromPoints(moonOrbitPoints);
    const moonOrbitMat = new THREE.LineBasicMaterial({ color: 0xaaaaaa, opacity: 0.4, transparent: true });
    const moonOrbitLine = new THREE.Line(moonOrbitGeom, moonOrbitMat);
    scene.add(moonOrbitLine);

    // --- PLANETAS DEL SISTEMA SOLAR ---
    SOLAR_SYSTEM_DATA.forEach(planet => {
        const objects: { [key: string]: any } = {};

        // 1. Línea de Órbita (Eclíptica)
        if (planet.name !== 'Sun') {
            const orbitPoints = getOrbitPoints3D(planet);
            const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
            const orbitMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.2, transparent: true });
            const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
            scene.add(orbitLine);
            objects.orbit = orbitLine;
        }

        if (planet.name !== 'Earth') {
            // 2. Grupo "Tilt" (Aplica la Oblicuidad/Peralte del planeta)
            // Este grupo contendrá el Mesh del planeta y sus Lunas.
            // Al rotar este grupo, todo el sistema local del planeta se inclina.
            const tiltGroup = new THREE.Group();
            
            // Convertir grados a radianes y aplicar rotación en Z (inclinación del eje)
            // Z es el eje "adelante" en vista estándar, pero aquí usamos Z como eje de inclinación lateral en el plano 2D vertical
            const obliquityRad = planet.obliquity * (Math.PI / 180);
            tiltGroup.rotation.z = obliquityRad;
            
            scene.add(tiltGroup);
            objects.tiltGroup = tiltGroup;

            // 3. Malla del Planeta (Rota sobre su eje Y local)
            const planetGeometry = new THREE.SphereGeometry(planet.radius, planet.name === 'Sun' ? 32 : 32, planet.name === 'Sun' ? 32 : 32);
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
      const now = new Date();
      const time = now.getTime() * 0.001; // Seconds
      
      // 1. Calcular posición de la Tierra para centrar el sistema
      // (La cámara siempre orbita 0,0,0, así que movemos el universo para que la Tierra esté en 0,0,0)
      const earthData = SOLAR_SYSTEM_DATA.find(p => p.name === 'Earth')!;
      const earthPos3D = calculateOrbitalPosition(earthData, now);
      const earthVec = new THREE.Vector3(earthPos3D.x, earthPos3D.y, earthPos3D.z);
      const geoTransform = new THREE.Vector3().copy(earthVec).negate();
      
      let sunGeoPos = new THREE.Vector3();

      // 2. Actualizar Planetas
      SOLAR_SYSTEM_DATA.forEach(planet => {
        const objects = solarSystemObjects.current.get(planet.name);
        
        if (planet.name === 'Earth') {
            // La Tierra es el globo de react-globe.gl, fijo en 0,0,0.
        } else {
            if (objects) {
                // Posición Orbital Global
                const posData = calculateOrbitalPosition(planet, now);
                const pos = new THREE.Vector3(posData.x, posData.y, posData.z);
                const finalPos = new THREE.Vector3().copy(pos).add(geoTransform);
                
                // Mover el Grupo Inclinado
                if (objects.tiltGroup) objects.tiltGroup.position.copy(finalPos);
                // Mover la línea de órbita (que es estática en forma, solo se traslada con el sistema)
                if (objects.orbit) objects.orbit.position.copy(geoTransform);
                
                // Rotación Axial (Día/Noche) - Rota sobre eje Y local del tiltGroup
                if (objects.mesh) {
                    const rotationSpeed = (2 * Math.PI) / (Math.abs(planet.rotationPeriod) * 3600 / 50000); // Scale factor for visuals
                    // Si rotationPeriod es negativo (Venus, Urano), gira al revés
                    const direction = Math.sign(planet.rotationPeriod);
                    objects.mesh.rotation.y = time * direction * 0.1; 
                }

                if (planet.name === 'Sun') {
                    sunGeoPos.copy(finalPos);
                    if (sunLightRef.current) sunLightRef.current.position.copy(finalPos);
                }

                // Actualizar Lunas
                if (objects.moons) {
                    objects.moons.forEach((m: any) => {
                        // Calcular posición relativa al planeta (centro 0,0,0 del tiltGroup)
                        const moonPosData = calculateOrbitalPosition(m.data, now);
                        const moonPos = new THREE.Vector3(moonPosData.x, moonPosData.y, moonPosData.z);
                        if (m.mesh) m.mesh.position.copy(moonPos);
                        
                        // Actualizar label de luna para que siga al mesh
                        if (m.label) {
                            m.label.position.copy(moonPos);
                            m.label.position.y += m.data.radius * 2 + 2; // Offset
                            // Billboarding manual si fuera necesario debido al tilt
                        }
                    });
                }
            }
        }
      });

      // 3. Actualizar Cometas
      COMETS_DATA.forEach(comet => {
        const objects = cometObjects.current.get(comet.name);
        if (objects) {
             const posData = calculateOrbitalPosition(comet, now);
             const pos = new THREE.Vector3(posData.x, posData.y, posData.z);
             const finalPos = new THREE.Vector3().copy(pos).add(geoTransform);

             if (objects.mesh) objects.mesh.position.copy(finalPos);
             if (objects.orbit) objects.orbit.position.copy(geoTransform);
             
             if (objects.tail) {
                 objects.tail.position.copy(finalPos);
                 // La cola apunta siempre lejos del Sol
                 const sunToComet = new THREE.Vector3().subVectors(finalPos, sunGeoPos).normalize();
                 // Posicionar cola detrás del cometa respecto al sol
                 const lookTarget = new THREE.Vector3().copy(finalPos).add(sunToComet);
                 objects.tail.lookAt(lookTarget);
                 
                 // Escalar cola según cercanía al sol (más cerca = más cola)
                 const distToSun = finalPos.distanceTo(sunGeoPos);
                 const scale = Math.max(0.5, 800 / (distToSun + 10)); 
                 objects.tail.scale.set(scale, 1, scale);
             }
        }
      });
      
      // 4. Luna Terrestre (Geocéntrica)
      const moonPosData = getMoonPosition(now);
      const moonPos = new THREE.Vector3(moonPosData.x, moonPosData.y, moonPosData.z);
      if (moonSphereRef.current) moonSphereRef.current.position.copy(moonPos);

      // 5. Scaling de Etiquetas (Billboarding y tamaño constante en pantalla)
      const camera = globeEl.current?.camera();
      if (camera) {
        SOLAR_SYSTEM_DATA.forEach(planet => {
             const obj = solarSystemObjects.current.get(planet.name);
             if (obj && obj.label && obj.tiltGroup) {
                 // Distancia a cámara
                 const dist = obj.tiltGroup.position.distanceTo(camera.position);
                 // Escalar label
                 const scale = Math.max(10, dist / 40);
                 obj.label.scale.set(scale, scale, 1);
                 
                 // Ajustar altura para que no quede dentro del planeta
                 // Como el label está dentro del tiltGroup, "y" es local (inclinado). 
                 // Está bien, queremos que esté sobre el polo norte del planeta
                 obj.label.position.set(0, planet.radius * 1.5 + scale * 0.2, 0); 
             }
        });
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      // Cleanup visual objects
      try {
        const scene = globeEl.current?.scene();
        if(scene) {
            scene.remove(sunLight);
            scene.remove(ambientLight);
            if(earthHitbox) scene.remove(earthHitbox);
            if(moonSphere) scene.remove(moonSphere);
            if(moonOrbitLine) scene.remove(moonOrbitLine);
            solarSystemObjects.current.forEach((obj: any) => {
                if(obj.tiltGroup) scene.remove(obj.tiltGroup);
                if(obj.orbit) scene.remove(obj.orbit);
            });
            cometObjects.current.forEach((obj: any) => {
                if(obj.mesh) scene.remove(obj.mesh);
                if(obj.orbit) scene.remove(obj.orbit);
                if(obj.tail) scene.remove(obj.tail);
            });
        }
      } catch(e){}
    };
  }, []);

  // Helpers para interacción (Raycasting)
  const getInteractableObjects = () => {
      const objects: THREE.Object3D[] = [];
      if (earthHitboxRef.current) objects.push(earthHitboxRef.current);
      
      solarSystemObjects.current.forEach((obj: any) => {
          if (obj.mesh) objects.push(obj.mesh);
      });
      
      cometObjects.current.forEach((obj: any) => {
          if (obj.mesh) objects.push(obj.mesh);
      });
      return objects;
  };

  const getObjectByName = (name: string) => {
      if (name === 'Earth') return earthHitboxRef.current;
      const planetObj = solarSystemObjects.current.get(name);
      if (planetObj && planetObj.mesh) return planetObj.mesh;
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
  };

  return { getInteractableObjects, getObjectByName };
};