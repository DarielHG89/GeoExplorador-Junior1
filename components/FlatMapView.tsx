import React, { useState, useEffect } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import MapStyleControls, { MapStyle } from './MapStyleControls';

// Using a standard TopoJSON file
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
const STORAGE_KEY_TOPOJSON = 'geoexplorador_topojson_data_v1';

interface FlatMapViewProps {
  onCountryClick: (name: string, properties: any) => void;
  selectedCountryName: string | null;
  isInteractionDisabled?: boolean;
}

const stylesByTheme = {
  classic: {
    defaultFill: "#3b82f6",
    selectedFill: "#fbbf24",
    hoverFill: "#60a5fa",
    stroke: "#1e293b",
    hoverStroke: "#ffffff",
  },
  dark: {
    defaultFill: "#475569", // slate-600
    selectedFill: "#fbbf24",
    hoverFill: "#64748b", // slate-500
    stroke: "#94a3b8", // slate-400
    hoverStroke: "#ffffff",
  },
  satellite: {
    defaultFill: "rgba(255, 255, 255, 0.15)",
    selectedFill: "rgba(251, 191, 36, 0.6)",
    hoverFill: "rgba(255, 255, 255, 0.3)",
    stroke: "rgba(255, 255, 255, 0.8)",
    hoverStroke: "#ffffff",
  },
};


const FlatMapView: React.FC<FlatMapViewProps> = ({ onCountryClick, selectedCountryName, isInteractionDisabled = false }) => {
  const [tooltipContent, setTooltipContent] = useState("");
  const [mapData, setMapData] = useState<string | object>(geoUrl);
  
  const [position, setPosition] = useState({ coordinates: [0, 20] as [number, number], zoom: 1 });
  const [mapStyle, setMapStyle] = useState<MapStyle>('classic');

  useEffect(() => {
    // 1. Check local cache
    const cached = localStorage.getItem(STORAGE_KEY_TOPOJSON);
    if (cached) {
      try {
        setMapData(JSON.parse(cached));
      } catch (e) { console.error("TopoJSON cache error"); }
    }

    // 2. Fetch and cache
    fetch(geoUrl)
      .then(res => res.json())
      .then(data => {
        try {
          localStorage.setItem(STORAGE_KEY_TOPOJSON, JSON.stringify(data));
          setMapData(data); // Update with fresh data
        } catch(e) { console.warn("Cache full"); }
      })
      .catch(err => console.log("Using cached or fallback for flat map"));
  }, []);

  const handleZoomIn = () => {
    if (position.zoom >= 8) return;
    setPosition((pos) => ({ ...pos, zoom: pos.zoom * 1.5 }));
  };

  const handleZoomOut = () => {
    if (position.zoom <= 1) {
        handleReset();
        return;
    }
    setPosition((pos) => ({ ...pos, zoom: pos.zoom / 1.5 }));
  };

  const handleReset = () => {
    setPosition({ coordinates: [0, 20], zoom: 1 });
  };

  const handleMoveEnd = (position: { coordinates: [number, number]; zoom: number }) => {
    setPosition(position);
  };
  
  const handlePan = (dx: number, dy: number) => {
    const step = 20 / position.zoom;
    setPosition((pos) => ({
      ...pos,
      coordinates: [
        pos.coordinates[0] + dx * step,
        pos.coordinates[1] + dy * step,
      ],
    }));
  };

  const getContainerStyle = (): React.CSSProperties => {
    switch (mapStyle) {
      case 'satellite':
        return {
          backgroundImage: `url(//unpkg.com/three-globe/example/img/earth-blue-marble.jpg)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        };
      case 'dark':
        return { backgroundColor: '#0f172a' }; // Slate 900 base
      case 'classic':
      default:
        return { backgroundColor: '#1e293b' }; // Slate 800 base
    }
  };

  const currentGeographyStyle = stylesByTheme[mapStyle];
  const panButtonClass = "w-10 h-10 bg-slate-600 hover:bg-slate-500 text-white rounded-lg font-bold text-xl flex items-center justify-center shadow-md transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden relative transition-colors duration-500" style={getContainerStyle()}>
      
      {/* Background Pattern (Stardust) - Classic Only */}
      {mapStyle === 'classic' && (
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-40 pointer-events-none z-0"></div>
      )}

      {/* Atmospheric Fog / Vignette Overlay */}
      {/* This creates the depth effect by darkening the edges */}
      <div 
        className="absolute inset-0 pointer-events-none z-10 transition-all duration-700 ease-in-out"
        style={{
            background: mapStyle === 'dark' 
                ? 'radial-gradient(circle at center, transparent 30%, rgba(15, 23, 42, 1) 95%)' // Deep dark fog
                : mapStyle === 'classic'
                ? 'radial-gradient(circle at center, rgba(59, 130, 246, 0.05) 30%, rgba(15, 23, 42, 0.7) 100%)' // Blueish mist
                : 'radial-gradient(circle at center, transparent 50%, rgba(0, 0, 0, 0.7) 100%)' // Satellite vignette
        }}
      />
      
      {/* Map Container */}
      <ComposableMap 
        projection="geoEqualEarth" 
        projectionConfig={{ scale: 160, center: [0, 15] }}
        style={{ width: "100%", height: "100%", zIndex: 5 }}
      >
        <ZoomableGroup 
          zoom={position.zoom}
          center={position.coordinates}
          onMoveEnd={handleMoveEnd}
          minZoom={1}
          maxZoom={8}
        >
          <Geographies geography={mapData}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const isSelected = geo.properties.name === selectedCountryName;
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => {
                      if (isInteractionDisabled) return;
                      const name = geo.properties.name;
                      onCountryClick(name, geo.properties);
                    }}
                    onMouseEnter={() => {
                      if (isInteractionDisabled) return;
                      setTooltipContent(geo.properties.name);
                    }}
                    onMouseLeave={() => {
                      setTooltipContent("");
                    }}
                    style={{
                      default: {
                        fill: isSelected ? currentGeographyStyle.selectedFill : currentGeographyStyle.defaultFill,
                        stroke: currentGeographyStyle.stroke,
                        strokeWidth: 0.5 / position.zoom, // Keep lines thin when zoomed in
                        outline: "none",
                        transition: "all 0.3s ease"
                      },
                      hover: {
                        fill: currentGeographyStyle.hoverFill,
                        stroke: currentGeographyStyle.hoverStroke,
                        strokeWidth: 0.8 / position.zoom,
                        outline: "none",
                        cursor: "pointer",
                      },
                      pressed: {
                        fill: currentGeographyStyle.selectedFill,
                        outline: "none",
                      },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {/* Tooltip */}
      {tooltipContent && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-full text-lg font-bold pointer-events-none z-50 shadow-lg border border-white/20">
          {tooltipContent}
        </div>
      )}

      <div className="z-50 relative">
        <MapStyleControls currentStyle={mapStyle} onStyleChange={setMapStyle} />
      </div>
      
      {/* Navigation Controls */}
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col items-center gap-4 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 shadow-xl z-50">
        {/* Zoom Controls */}
        <div className="flex flex-col gap-2">
            <button 
                onClick={handleZoomIn}
                disabled={position.zoom >= 8}
                className="w-12 h-12 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-bold text-2xl flex items-center justify-center shadow-lg transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Acercar"
            >
                +
            </button>
            <button 
                onClick={handleZoomOut}
                disabled={position.zoom <= 1}
                className="w-12 h-12 bg-sky-500 hover:bg-sky-400 text-white rounded-xl font-bold text-2xl flex items-center justify-center shadow-lg transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Alejar"
            >
                -
            </button>
        </div>

        {/* Pan & Reset Controls */}
        <div className="grid grid-cols-3 gap-1.5 justify-items-center items-center">
            <div /> {/* Top-left empty */}
            <button onClick={() => handlePan(0, -1)} className={panButtonClass} title="Mover Arriba">▲</button>
            <div /> {/* Top-right empty */}
            
            <button onClick={() => handlePan(-1, 0)} className={panButtonClass} title="Mover Izquierda">◀</button>
            <button 
                onClick={handleReset} 
                className="w-10 h-10 bg-slate-700 hover:bg-slate-600 text-white rounded-full font-bold text-xl flex items-center justify-center shadow-lg transition-transform active:scale-95" 
                title="Reiniciar Vista">
                ⟲
            </button>
            <button onClick={() => handlePan(1, 0)} className={panButtonClass} title="Mover Derecha">▶</button>
            
            <div /> {/* Bottom-left empty */}
            <button onClick={() => handlePan(0, 1)} className={panButtonClass} title="Mover Abajo">▼</button>
            <div /> {/* Bottom-right empty */}
        </div>
      </div>

      <div className="absolute bottom-24 left-4 text-white/50 text-xs pointer-events-none z-10">
        Usa los controles o arrastra el mapa
      </div>
    </div>
  );
};

export default FlatMapView;