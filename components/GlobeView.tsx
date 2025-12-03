
import React, { useEffect, useState, useRef, useMemo } from 'react';
import Globe, { GlobeMethods } from 'react-globe.gl';
import * as THREE from 'three';
import { GeoJsonFeature, ExplorationMode } from '../types';
import LayerControls, { GlobeVisualOptions } from './LayerControls';
import { useSolarSystem } from '../hooks/useSolarSystem';
import { useGeographicMode } from '../hooks/useGeographicMode';
import { 
    selectionGlowVertexShader, 
    selectionGlowFragmentShader, 
    starVertexShader, 
    starFragmentShader 
} from '../utils/shaders';

interface GlobeViewProps {
  countries: GeoJsonFeature[];
  onCountryClick: (name: string, properties: any) => void;
  selectedCountryName: string | null;
  isInteractionDisabled?: boolean;
  explorationMode?: ExplorationMode;
  onModeChange?: (mode: ExplorationMode) => void;
}

const textureUrls = {
  day: '//unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
  night: '//unpkg.com/three-globe/example/img/earth-night.jpg',
  topo: '//unpkg.com/three-globe/example/img/earth-topology.png',
};

const GlobeView: React.FC<GlobeViewProps> = ({ 
    countries, 
    onCountryClick, 
    selectedCountryName, 
    isInteractionDisabled = false,
    explorationMode = 'geographic',
    onModeChange 
}) => {
  const globeEl = useRef<GlobeMethods | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const [globeWidth, setGlobeWidth] = useState(window.innerWidth);
  const [globeHeight, setGlobeHeight] = useState(window.innerHeight);
  const [visualOptions, setVisualOptions] = useState<GlobeVisualOptions>({
    texture: 'realtime',
    showClouds: true,
    showAtmosphere: true,
    showBorders: true,
    showStars: true,
    starBrightness: 1.0,
    showCelestialBodies: true,
    showOrbits: true,
  });
  
  const savedTextureRef = useRef<string | null>(null);
  const intendedSelectionRef = useRef<string | null>(null);
  const [dynamicAtmosphereColor, setDynamicAtmosphereColor] = useState('#5c95ff');
  
  // Refs for scene objects
  const animationFrameRef = useRef<number | null>(null);
  const starsRef = useRef<THREE.Points | null>(null);
  
  // Ref para el GRUPO de la mirilla (contiene esfera, anillos y marcadores)
  const selectionGroupRef = useRef<THREE.Group | null>(null);
  const selectionRingsRef = useRef<THREE.Mesh[]>([]); // Para animar rotación

  // Transition state
  const isTransitioningRef = useRef(false);
  const transitionStartTimeRef = useRef(0);
  const transitionStartPosRef = useRef(new THREE.Vector3());
  const transitionStartTargetRef = useRef(new THREE.Vector3());

  // --- HOOKS DE MODOS ---
  
  // 1. Lógica Geográfica (Países, Colores, Atmósfera, Interacción en Tierra)
  const { 
      getPolygonCapColor, 
      getPolygonSideColor, 
      getPolygonStrokeColor, 
      getPolygonAltitude,
      getPolygonLabel,
      onPolygonHover,
      onPolygonClick
  } = useGeographicMode({
      globeEl,
      explorationMode,
      visualOptions,
      selectedCountryName,
      onCountryClick,
      isInteractionDisabled
  });

  // 2. Lógica Sistema Solar (Planetas, Órbitas, Cámara Espacial)
  const { getInteractableObjects, getObjectByName } = useSolarSystem({
      globeEl,
      explorationMode,
      visualOptions,
      selectedObjectName: selectedCountryName
  });

  // --- HANDLERS GENERALES ---

  const handleOptionsChange = (newOptions: Partial<GlobeVisualOptions>) => {
    setVisualOptions(prev => ({ ...prev, ...newOptions }));
  };

  useEffect(() => {
    intendedSelectionRef.current = selectedCountryName;
  }, [selectedCountryName]);

  useEffect(() => {
    if (visualOptions.texture === 'classic') {
        setDynamicAtmosphereColor('#88ccff'); 
    } else if (visualOptions.texture === 'dark') {
        setDynamicAtmosphereColor('#1e293b'); 
    } else {
        setDynamicAtmosphereColor('#5c95ff');
    }
  }, [visualOptions.texture]);
  
  // Manejo de Transición de Texturas entre Modos
  useEffect(() => {
    if (explorationMode === 'solar_system') {
        setVisualOptions(prev => {
            savedTextureRef.current = prev.texture;
            return { ...prev, texture: 'realtime', showClouds: true };
        });
        // Movimiento inicial de cámara para alejarse
        if (globeEl.current) {
            globeEl.current.pointOfView({ lat: 20, lng: 0, altitude: 45 }, 2500);
        }
    } else {
        if (savedTextureRef.current) {
            setVisualOptions(prev => ({ ...prev, texture: savedTextureRef.current as any }));
        }
        // Movimiento inicial de cámara para acercarse
        if (globeEl.current) {
            globeEl.current.pointOfView({ lat: 20, lng: -90, altitude: 2.5 }, 2000);
        }
    }
  }, [explorationMode]);

  
  const handleContainerClick = (event: React.MouseEvent) => {
    if (isInteractionDisabled || !globeEl.current) return;

    // Solo procesamos clics de objetos celestes aquí. 
    // Los clics en países los maneja el hook useGeographicMode vía onPolygonClick.
    
    // Raycasting para objetos 3D (Planetas, Sol, etc.)
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    const camera = globeEl.current.camera();
    const scene = globeEl.current.scene();

    if (camera && scene) {
      raycaster.setFromCamera(mouse, camera);
      const clickableObjects: THREE.Object3D[] = getInteractableObjects();
      const intersects = raycaster.intersectObjects(clickableObjects);

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        const name = hit.userData.name;
        if (name) {
            onCountryClick(name, { isPlanet: true });
        }
      }
    }
  };


  // --- VISUAL EFFECTS LOOP (Stars, Selection Mirilla) ---
  useEffect(() => {
    const globe = globeEl.current;
    if (!globe) return;
    const scene = globe.scene();

    // 1. STARS
    if (!starsRef.current) {
        const starsGeometry = new THREE.BufferGeometry();
        const starsCount = 3000;
        const posArray = new Float32Array(starsCount * 3);
        const randomArray = new Float32Array(starsCount);
        for(let i = 0; i < starsCount * 3; i+=3) {
            const r = 4000 + Math.random() * 4000; 
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            posArray[i] = r * Math.sin(phi) * Math.cos(theta);
            posArray[i+1] = r * Math.sin(phi) * Math.sin(theta);
            posArray[i+2] = r * Math.cos(phi);
            randomArray[i/3] = Math.random();
        }
        starsGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        starsGeometry.setAttribute('aRandom', new THREE.BufferAttribute(randomArray, 1));
        const starsMaterial = new THREE.ShaderMaterial({
            uniforms: { uTime: { value: 0 }, uColor: { value: new THREE.Color(0xffffff) }, uSize: { value: 2.0 * window.devicePixelRatio } },
            vertexShader: starVertexShader, fragmentShader: starFragmentShader, transparent: true, depthWrite: false,
        });
        const starField = new THREE.Points(starsGeometry, starsMaterial);
        scene.add(starField);
        starsRef.current = starField;
    }
    if (starsRef.current) {
        starsRef.current.visible = visualOptions.showStars;
    }

    // 2. SELECTION MIRILLA (TARGET HUD)
    if (!selectionGroupRef.current) {
        const group = new THREE.Group();
        selectionRingsRef.current = [];

        // A. Holographic Sphere (Inner Shield)
        const glowGeo = new THREE.SphereGeometry(1.0, 32, 32);
        const glowMat = new THREE.ShaderMaterial({
            uniforms: { uTime: { value: 0 } },
            vertexShader: selectionGlowVertexShader, fragmentShader: selectionGlowFragmentShader,
            transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.FrontSide
        });
        const shieldMesh = new THREE.Mesh(glowGeo, glowMat);
        shieldMesh.name = 'shield';
        group.add(shieldMesh);

        // B. Inner Ring (Rotating)
        const innerRingGeo = new THREE.TorusGeometry(1.2, 0.02, 16, 100);
        const innerRingMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.8 });
        const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
        selectionRingsRef.current.push(innerRing);
        group.add(innerRing);

        // C. Outer Ring (Rotating Counter)
        const outerRingGeo = new THREE.TorusGeometry(1.4, 0.03, 16, 100);
        const outerRingMat = new THREE.MeshBasicMaterial({ color: 0x0088ff, transparent: true, opacity: 0.6 });
        const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat);
        selectionRingsRef.current.push(outerRing);
        group.add(outerRing);

        // D. Crosshairs (Static ticks relative to HUD)
        const tickGeo = new THREE.BoxGeometry(0.1, 0.4, 0.05);
        const tickMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
        const tickTop = new THREE.Mesh(tickGeo, tickMat); tickTop.position.set(0, 1.6, 0);
        const tickBottom = new THREE.Mesh(tickGeo, tickMat); tickBottom.position.set(0, -1.6, 0);
        const tickLeft = new THREE.Mesh(tickGeo, tickMat); tickLeft.position.set(-1.6, 0, 0); tickLeft.rotation.z = Math.PI / 2;
        const tickRight = new THREE.Mesh(tickGeo, tickMat); tickRight.position.set(1.6, 0, 0); tickRight.rotation.z = Math.PI / 2;
        
        group.add(tickTop, tickBottom, tickLeft, tickRight);

        group.visible = false;
        scene.add(group);
        selectionGroupRef.current = group;
    } else {
        if (!scene.children.includes(selectionGroupRef.current)) {
            scene.add(selectionGroupRef.current);
        }
    }

    // 3. CLEANUP DEFAULT LIGHTS (Solar hook adds Sun)
    const lightsToRemove: THREE.Object3D[] = [];
    scene.traverse((child) => {
        if ((child instanceof THREE.DirectionalLight || child instanceof THREE.PointLight) && child.userData.source !== 'SolarSystem') {
             lightsToRemove.push(child);
        }
    });
    lightsToRemove.forEach(l => scene.remove(l));


    // 4. ANIMATION & CAMERA TRACKING
    const animate = () => {
      const now = new Date();
      const time = now.getTime() * 0.001;
      
      if (starsRef.current && starsRef.current.material instanceof THREE.ShaderMaterial) {
          starsRef.current.material.uniforms.uTime.value = time;
          starsRef.current.rotation.y = time * 0.005; 
      }

      const camera = globeEl.current?.camera();
      const controls = globeEl.current?.controls();

      if (camera && controls) {
        
        // --- LIVE TARGET LOOKUP ---
        let liveTarget: THREE.Object3D | null = null;
        if (intendedSelectionRef.current) {
            liveTarget = getObjectByName(intendedSelectionRef.current);
        }

        // --- CAMERA TRACKING LOGIC ---
        if (liveTarget && selectionGroupRef.current) {
            const targetPos = liveTarget.position.clone();
            
            // 1. Position and Visibility
            selectionGroupRef.current.visible = true;
            selectionGroupRef.current.position.copy(targetPos);
            
            // 2. Billboard Effect (Always face camera)
            selectionGroupRef.current.lookAt(camera.position);

            // 3. Update Shield Shader Time
            const shield = selectionGroupRef.current.children.find(c => c.name === 'shield') as THREE.Mesh;
            if (shield && shield.material instanceof THREE.ShaderMaterial) {
                shield.material.uniforms.uTime.value = time;
            }

            // 4. Animate Rings (HUD Rotation)
            if (selectionRingsRef.current.length >= 2) {
                selectionRingsRef.current[0].rotation.z = time * 0.5;  // Inner ring
                selectionRingsRef.current[1].rotation.z = -time * 0.3; // Outer ring
            }
            
            // 5. Calculate Scale
            let radius = 5; 
            if ((liveTarget as THREE.Mesh).geometry) {
                const geo = (liveTarget as THREE.Mesh).geometry as THREE.SphereGeometry;
                if (geo.parameters && geo.parameters.radius) radius = geo.parameters.radius;
            } else if (liveTarget.userData.name === 'Earth') radius = 100;
            
            // Breathe effect on scale
            const pulse = 1.0 + Math.sin(time * 2.0) * 0.02;
            const baseScale = radius * 1.3;
            selectionGroupRef.current.scale.set(baseScale * pulse, baseScale * pulse, baseScale * pulse);

            // The solar system now moves, so the camera target is always the origin.
            controls.target.set(0,0,0);
            controls.update();

        } else {
            if (selectionGroupRef.current) selectionGroupRef.current.visible = false;
            controls.enableDamping = true; 
        }

        // --- AUTOMATIC MODE SWITCHING (Based on camera distance from origin) ---
        if (!intendedSelectionRef.current && onModeChange) {
            const distToCenter = camera.position.length();
            if (distToCenter > 1000 && explorationMode === 'geographic') {
                onModeChange('solar_system');
            } else if (distToCenter < 600 && explorationMode === 'solar_system') {
                onModeChange('geographic');
            }
        }
      }
      
      // Cloud Rotation
      if (globeEl.current && visualOptions.showClouds) {
            try {
                const cloudsMesh = globeEl.current.scene().children.find((obj: any) => obj.type === 'Clouds');
                if (cloudsMesh) cloudsMesh.rotation.y += 0.001;
            } catch (e) { }
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      // Cleanup visual refs if needed handled by React-Globe scene clearing
    };
  }, [visualOptions.showClouds, visualOptions.showStars, visualOptions.texture, explorationMode, getInteractableObjects, getObjectByName]);


  // Zooms the camera to frame the selected object
  useEffect(() => {
    if (!globeEl.current) return;
    const globe = globeEl.current;

    if (selectedCountryName) {
        const liveTarget = getObjectByName(selectedCountryName);
        let radius = 100; // Default to Earth's size
        if (liveTarget && (liveTarget as THREE.Mesh).geometry) {
            const geo = (liveTarget as THREE.Mesh).geometry as THREE.SphereGeometry;
            if (geo.parameters && geo.parameters.radius) {
                radius = geo.parameters.radius;
            }
        }

        // Determine ideal altitude based on object size
        const isEarth = selectedCountryName === 'Earth';
        const altitude = isEarth ? 2.5 : Math.max(radius / 10, 1.5);

        globe.pointOfView({ lat: 20, lng: 0, altitude }, 1500);

    } else {
        // No object selected, reset to default view
        if (explorationMode === 'geographic') {
            globe.pointOfView({ lat: 20, lng: -90, altitude: 2.5 }, 1500);
        } else {
            globe.pointOfView({ lat: 20, lng: 0, altitude: 45 }, 1500);
        }
    }
  }, [selectedCountryName, explorationMode, getObjectByName]);

  
  useEffect(() => {
    const handleResize = () => {
      setGlobeWidth(window.innerWidth);
      setGlobeHeight(window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- UI ACTIONS ---
  const stopAutoRotate = () => { if (globeEl.current) globeEl.current.controls().autoRotate = false; };

  const handleZoom = (factor: number) => {
    if (!globeEl.current) return;
    stopAutoRotate();
    const { lat, lng, altitude } = globeEl.current.pointOfView();
    const maxAlt = explorationMode === 'solar_system' ? 200 : 60;
    const nextAlt = Math.min(maxAlt, Math.max(0.1, altitude * factor));
    globeEl.current.pointOfView({ lat, lng, altitude: nextAlt }, 200);
  };

  const handleRotate = (dLat: number, dLng: number) => {
    if (!globeEl.current) return;
    stopAutoRotate();
    const currentPos = globeEl.current.pointOfView();
    const newLat = Math.max(-85, Math.min(85, currentPos.lat + dLat));
    globeEl.current.pointOfView({ lat: newLat, lng: (currentPos.lng + dLng + 360) % 360, altitude: currentPos.altitude }, 100);
  };
  
  const handleReset = () => {
    if (!globeEl.current) return;
    if (selectionGroupRef.current) selectionGroupRef.current.visible = false;
    const controls = globeEl.current.controls();
    controls.target.set(0,0,0);
    controls.enablePan = true; 
    
    if (explorationMode === 'solar_system') {
        globeEl.current.pointOfView({ lat: 20, lng: 0, altitude: 45 }, 1000);
    } else {
        globeEl.current.pointOfView({ lat: 20, lng: -90, altitude: 2.5 }, 1000);
        setTimeout(() => { if(globeEl.current) globeEl.current.controls().autoRotate = true; }, 1000);
    }
  };

  const globeMaterial = useMemo(() => {
    if (visualOptions.texture === 'classic') return new THREE.MeshPhongMaterial({ color: '#bfdbfe', shininess: 30 }); 
    if (visualOptions.texture === 'dark') return new THREE.MeshPhongMaterial({ color: '#020617', shininess: 10 }); 
    return undefined; 
  }, [visualOptions.texture]);

  const getGlobeImageUrl = () => {
      if (visualOptions.texture === 'classic' || visualOptions.texture === 'dark') return null; 
      if (visualOptions.texture === 'realtime') return textureUrls.day; 
      return textureUrls[visualOptions.texture as keyof typeof textureUrls];
  };

  const navButtonClass = "w-10 h-10 bg-slate-600 hover:bg-slate-500 text-white rounded-lg font-bold text-xl flex items-center justify-center shadow-md transition-transform active:scale-95";

  return (
    <div ref={containerRef} className="absolute inset-0 z-0 bg-black cursor-crosshair" onClick={handleContainerClick}>
      <LayerControls options={visualOptions} onChange={handleOptionsChange} explorationMode={explorationMode}/>
      
      <Globe
        ref={globeEl}
        width={globeWidth}
        height={globeHeight}
        backgroundColor="#000000" 
        
        globeImageUrl={getGlobeImageUrl()}
        globeMaterial={globeMaterial}
        
        {...({
            nightImageUrl: visualOptions.texture === 'realtime' ? textureUrls.night : undefined,
            cloudsImageUrl: visualOptions.showClouds ? 'https://vasturiano.github.io/three-globe/example/img/clouds.png' : undefined,
            cloudsAltitude: 0.25
        } as any)}
        
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        
        atmosphereColor={dynamicAtmosphereColor}
        atmosphereAltitude={visualOptions.showAtmosphere ? 0.1 : 0} 

        // --- DATOS GEOGRÁFICOS (Delegados al Hook) ---
        polygonsData={countries}
        polygonAltitude={getPolygonAltitude}
        polygonCapColor={getPolygonCapColor}
        polygonSideColor={getPolygonSideColor}
        polygonStrokeColor={getPolygonStrokeColor}
        polygonLabel={getPolygonLabel}
        onPolygonHover={onPolygonHover}
        onPolygonClick={onPolygonClick}
      />

      {/* Navigation UI */}
      <div className="absolute bottom-4 right-4 flex flex-col items-center gap-4 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 shadow-xl z-10" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col gap-2">
            <button onClick={() => handleZoom(0.8)} className="w-12 h-12 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-bold text-2xl flex items-center justify-center shadow-lg transition-transform active:scale-95" title="Acercar">+</button>
            <button onClick={() => handleZoom(1.25)} className="w-12 h-12 bg-sky-500 hover:bg-sky-400 text-white rounded-xl font-bold text-2xl flex items-center justify-center shadow-lg transition-transform active:scale-95" title="Alejar">-</button>
        </div>
        <div className="grid grid-cols-3 gap-1.5 justify-items-center items-center">
            <div />
            <button onClick={() => handleRotate(10, 0)} className={navButtonClass} title="Girar Arriba">▲</button>
            <div />
            <button onClick={() => handleRotate(0, -10)} className={navButtonClass} title="Girar Izquierda">◀</button>
            <button onClick={handleReset} className="w-10 h-10 bg-slate-700 hover:bg-slate-600 text-white rounded-full font-bold text-xl flex items-center justify-center shadow-lg transition-transform active:scale-95" title="Reiniciar Vista">⟲</button>
            <button onClick={() => handleRotate(0, 10)} className={navButtonClass} title="Girar Derecha">▶</button>
            <div />
            <button onClick={() => handleRotate(-10, 0)} className={navButtonClass} title="Girar Abajo">▼</button>
            <div />
        </div>
      </div>
    </div>
  );
};

export default GlobeView;
