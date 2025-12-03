
import { useState, useEffect, useCallback, useRef } from 'react';
import * as THREE from 'three';
import { GlobeMethods } from 'react-globe.gl';
import { GeoJsonFeature, ExplorationMode } from '../types';
import { GlobeVisualOptions } from '../components/LayerControls';
import { atmosphereVertexShader, atmosphereFragmentShader } from '../utils/shaders';

interface UseGeographicModeProps {
  globeEl: React.MutableRefObject<GlobeMethods | undefined>;
  explorationMode: ExplorationMode;
  visualOptions: GlobeVisualOptions;
  selectedCountryName: string | null;
  onCountryClick: (name: string, properties: any) => void;
  isInteractionDisabled: boolean;
}

export const useGeographicMode = ({
  globeEl,
  explorationMode,
  visualOptions,
  selectedCountryName,
  onCountryClick,
  isInteractionDisabled
}: UseGeographicModeProps) => {
  const [hoverD, setHoverD] = useState<GeoJsonFeature | null>(null);
  const atmosphereRef = useRef<THREE.Mesh | null>(null);

  const isGeoMode = explorationMode === 'geographic';

  // 1. Configuración de Cámara para Modo Geográfico
  useEffect(() => {
    if (!isGeoMode || !globeEl.current) return;

    const controls = globeEl.current.controls();

    // Restaurar límites de cámara para la Tierra
    controls.minDistance = 200;
    controls.maxDistance = 6000;
    controls.zoomSpeed = 1.0;
    
    // Si no hay selección activa, rotar suavemente
    if (!selectedCountryName) {
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.5;
    }
  }, [isGeoMode, selectedCountryName, globeEl]);

  // 2. Efecto de Atmósfera (Movido aquí desde GlobeView)
  useEffect(() => {
    const globe = globeEl.current;
    if (!globe) return;

    const scene = globe.scene();
    
    // Crear la malla si no existe
    if (!atmosphereRef.current) {
        const atmGeometry = new THREE.SphereGeometry(100, 64, 64);
        const atmMaterial = new THREE.ShaderMaterial({
          vertexShader: atmosphereVertexShader,
          fragmentShader: atmosphereFragmentShader,
          blending: THREE.AdditiveBlending,
          side: THREE.BackSide,
          transparent: true,
          depthWrite: false,
        });
        const atmosphereGlow = new THREE.Mesh(atmGeometry, atmMaterial);
        atmosphereGlow.scale.set(1.15, 1.15, 1.15); 
        atmosphereGlow.raycast = () => {}; // No bloquear interacciones
        atmosphereRef.current = atmosphereGlow;
    }

    // Gestionar visibilidad y presencia en escena
    const mesh = atmosphereRef.current;
    
    // Solo mostramos la atmósfera custom en modo geográfico y si la opción está activada
    const shouldShow = isGeoMode && visualOptions.showAtmosphere;

    if (shouldShow) {
        if (!scene.children.includes(mesh)) {
            scene.add(mesh);
        }
    } else {
        if (scene.children.includes(mesh)) {
            scene.remove(mesh);
        }
    }

    // Cleanup al desmontar el hook o cambiar dependencias críticas (aunque mantenemos la ref)
    return () => {
        if (mesh && scene.children.includes(mesh)) {
            scene.remove(mesh);
        }
    };
  }, [globeEl, isGeoMode, visualOptions.showAtmosphere]);


  // 3. Lógica de Estilos de Polígonos (Países)
  const getPolygonCapColor = useCallback((d: object) => {
    if (!isGeoMode) return 'rgba(0,0,0,0)'; // Invisible en modo solar

    const feat = d as GeoJsonFeature;
    const name = feat.properties.ADMIN || feat.properties.NAME;
    
    // Estilo Clásico (Mapa Político)
    if (visualOptions.texture === 'classic') {
         if (name === selectedCountryName) return '#fbbf24'; // Amber-400
         if (feat === hoverD) return '#fcd34d'; // Amber-300
         return '#dcfce7'; // Green-100 base
    }
    // Estilo Oscuro (Cyberpunk/Minimal)
    if (visualOptions.texture === 'dark') {
         if (name === selectedCountryName) return '#fbbf24'; 
         if (feat === hoverD) return '#475569'; // Slate-600
         return '#1e293b'; // Slate-800
    }

    // Estilo Realista/Satélite (Highlight sutil)
    if (name === selectedCountryName) return 'rgba(251, 191, 36, 0.6)';
    if (feat === hoverD) return 'rgba(14, 165, 233, 0.4)';
    return 'rgba(255, 255, 255, 0.0)';
  }, [isGeoMode, visualOptions.texture, selectedCountryName, hoverD]);

  const getPolygonSideColor = useCallback((d: object) => {
     if (!isGeoMode) return 'rgba(0,0,0,0)';
     
     const feat = d as GeoJsonFeature;
     const name = feat.properties.ADMIN || feat.properties.NAME;
     
     if (visualOptions.texture === 'classic' || visualOptions.texture === 'dark') {
         if (name === selectedCountryName) return '#f59e0b';
         return 'rgba(0,0,0,0.2)';
     }

     if (name === selectedCountryName || feat === hoverD) return 'rgba(255, 255, 255, 0.8)';
     return 'rgba(0,0,0,0)';
  }, [isGeoMode, visualOptions.texture, selectedCountryName, hoverD]);

  const getPolygonStrokeColor = useCallback((d: object) => {
    if (!isGeoMode) return 'rgba(0,0,0,0)';
    if (!visualOptions.showBorders) return 'rgba(0,0,0,0)';
    
    const feat = d as GeoJsonFeature;
    const name = feat.properties.ADMIN || feat.properties.NAME;
    
    if (visualOptions.texture === 'classic') return '#3b82f6'; // Blue borders
    if (visualOptions.texture === 'dark') return '#94a3b8'; // Slate borders
    
    if (name === selectedCountryName) return '#ffffff';
    if (feat === hoverD) return '#ffffff';
    return 'rgba(255,255,255, 0.2)'; 
  }, [isGeoMode, visualOptions.showBorders, visualOptions.texture, selectedCountryName, hoverD]);

  const getPolygonAltitude = useCallback((d: object) => {
    if (!isGeoMode) return 0;
    const feat = d as GeoJsonFeature;
    const name = feat.properties.ADMIN || feat.properties.NAME;
    return (feat === hoverD || name === selectedCountryName) ? 0.06 : 0.01;
  }, [isGeoMode, hoverD, selectedCountryName]);

  // 4. Etiquetas (Labels)
  const getPolygonLabel = useCallback((d: object) => {
      if (!isGeoMode) return '';

      const feat = d as GeoJsonFeature;
      const name = feat.properties.ADMIN || feat.properties.NAME || "Desconocido";
      return `
        <div style="
          background: rgba(15, 23, 42, 0.9); 
          color: #fbbf24; 
          padding: 6px 12px; 
          border-radius: 8px; 
          font-family: 'Fredoka', sans-serif;
          font-weight: bold;
          border: 1px solid #fbbf24;
          box-shadow: 0 4px 6px rgba(0,0,0,0.3);
          pointer-events: none;
        ">
          ${name}
        </div>
      `;
  }, [isGeoMode]);

  // 5. Manejadores de Eventos
  const onPolygonHover = useCallback((d: object | null) => {
    if (isInteractionDisabled || !isGeoMode) return;
    setHoverD(d as GeoJsonFeature | null);
    
    if (globeEl.current) {
        // Pausar rotación si hacemos hover
        if (!selectedCountryName) {
            globeEl.current.controls().autoRotate = !d;
        }
        document.body.style.cursor = d ? 'pointer' : 'default';
    }
  }, [isInteractionDisabled, isGeoMode, selectedCountryName, globeEl]);

  const onPolygonClick = useCallback((d: object) => {
    if (isInteractionDisabled || !d || !isGeoMode) return;
    const feat = d as GeoJsonFeature;
    const name = feat.properties.ADMIN || feat.properties.NAME || "Unknown";
    onCountryClick(name, feat.properties);
  }, [isInteractionDisabled, isGeoMode, onCountryClick]);

  return {
    hoverD,
    getPolygonCapColor,
    getPolygonSideColor,
    getPolygonStrokeColor,
    getPolygonAltitude,
    getPolygonLabel,
    onPolygonHover,
    onPolygonClick
  };
};
