import React, { useState } from 'react';
import { ExplorationMode } from '../types';

export interface GlobeVisualOptions {
  texture: 'day' | 'night' | 'topo' | 'realtime' | 'classic' | 'dark';
  showClouds: boolean;
  showAtmosphere: boolean;
  showBorders: boolean;
  showStars: boolean;
  starBrightness: number;
  showCelestialBodies: boolean;
  showOrbits: boolean;
}

interface LayerControlsProps {
  options: GlobeVisualOptions;
  onChange: (newOptions: Partial<GlobeVisualOptions>) => void;
  explorationMode?: ExplorationMode;
}

const LayerControls: React.FC<LayerControlsProps> = ({ options, onChange, explorationMode = 'geographic' }) => {
  const [isOpen, setIsOpen] = useState(false);

  const buttonBaseClass = "w-full text-left px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2";
  const buttonActiveClass = "bg-sky-500 text-white shadow-md";
  const buttonInactiveClass = "bg-slate-600/50 hover:bg-slate-500/80 text-white/80";
  
  const toggleBaseClass = "relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-400";
  const toggleActiveClass = "bg-sky-500";
  const toggleInactiveClass = "bg-slate-600";

  return (
    <div className="absolute top-24 left-4 z-20 text-white">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-full shadow-lg border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
        title="Capas del mapa"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
          <polyline points="2 17 12 22 22 17"></polyline>
          <polyline points="2 12 12 17 22 12"></polyline>
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-0 left-16 w-64 bg-slate-800/90 backdrop-blur-md rounded-2xl border border-white/20 p-4 shadow-xl animate-in fade-in slide-in-from-left-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
          
          {/* Map Style Section - Hidden in Solar System Mode */}
          {explorationMode === 'geographic' && (
            <div className="mb-4">
              <h3 className="font-bold text-lg mb-2 text-sky-300">Estilo del Mapa</h3>
              <div className="space-y-1">
                <button
                  onClick={() => onChange({ texture: 'realtime' })}
                  className={`${buttonBaseClass} ${options.texture === 'realtime' ? buttonActiveClass : buttonInactiveClass}`}
                >
                  <span className="text-xl">☀️</span> <span>Tiempo Real</span>
                </button>
                <button
                  onClick={() => onChange({ texture: 'classic' })}
                  className={`${buttonBaseClass} ${options.texture === 'classic' ? buttonActiveClass : buttonInactiveClass}`}
                >
                  <span className="text-xl">🗺️</span> <span>Clásico (Vector)</span>
                </button>
                <button
                  onClick={() => onChange({ texture: 'dark' })}
                  className={`${buttonBaseClass} ${options.texture === 'dark' ? buttonActiveClass : buttonInactiveClass}`}
                >
                  <span className="text-xl">🌙</span> <span>Modo Oscuro</span>
                </button>
                <button
                  onClick={() => onChange({ texture: 'day' })}
                  className={`${buttonBaseClass} ${options.texture === 'day' ? buttonActiveClass : buttonInactiveClass}`}
                >
                  <span className="text-xl">🛰️</span> <span>Satélite (Día)</span>
                </button>
                <button
                  onClick={() => onChange({ texture: 'night' })}
                  className={`${buttonBaseClass} ${options.texture === 'night' ? buttonActiveClass : buttonInactiveClass}`}
                >
                  <span className="text-xl">🌃</span> <span>Satélite (Noche)</span>
                </button>
                <button
                  onClick={() => onChange({ texture: 'topo' })}
                  className={`${buttonBaseClass} ${options.texture === 'topo' ? buttonActiveClass : buttonInactiveClass}`}
                >
                  <span className="text-xl">🏔️</span> <span>Topográfico</span>
                </button>
              </div>
            </div>
          )}
          
          <div>
            <h3 className="font-bold text-lg mb-3 text-sky-300">Capas Visuales</h3>
            <div className="space-y-3">
              {/* Stars Toggle */}
              <div className="flex justify-between items-center">
                <label htmlFor="stars-toggle" className="font-semibold cursor-pointer">✨ Estrellas</label>
                <button
                  id="stars-toggle"
                  role="switch"
                  aria-checked={options.showStars}
                  onClick={() => onChange({ showStars: !options.showStars })}
                  className={`${toggleBaseClass} ${options.showStars ? toggleActiveClass : toggleInactiveClass}`}
                >
                  <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${options.showStars ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

               {/* Star Brightness Slider */}
               {options.showStars && (
                <div className="px-1 pb-1">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Brillo</span>
                    <span>{Math.round(options.starBrightness * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={options.starBrightness}
                    onChange={(e) => onChange({ starBrightness: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-sky-400"
                  />
                </div>
              )}

              <div className="h-px bg-white/10 my-2"></div>

              {/* Other Toggles */}
              <div className="flex justify-between items-center">
                <label htmlFor="clouds-toggle" className="font-semibold cursor-pointer">☁️ Nubes</label>
                <button
                  id="clouds-toggle"
                  role="switch"
                  aria-checked={options.showClouds}
                  onClick={() => onChange({ showClouds: !options.showClouds })}
                  className={`${toggleBaseClass} ${options.showClouds ? toggleActiveClass : toggleInactiveClass}`}
                >
                  <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${options.showClouds ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              <div className="flex justify-between items-center">
                <label htmlFor="atmosphere-toggle" className="font-semibold cursor-pointer">🌫️ Atmósfera</label>
                <button
                  id="atmosphere-toggle"
                  role="switch"
                  aria-checked={options.showAtmosphere}
                  onClick={() => onChange({ showAtmosphere: !options.showAtmosphere })}
                  className={`${toggleBaseClass} ${options.showAtmosphere ? toggleActiveClass : toggleInactiveClass}`}
                >
                  <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${options.showAtmosphere ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              <div className="flex justify-between items-center">
                <label htmlFor="borders-toggle" className="font-semibold cursor-pointer">〰️ Fronteras</label>
                <button
                  id="borders-toggle"
                  role="switch"
                  aria-checked={options.showBorders}
                  onClick={() => onChange({ showBorders: !options.showBorders })}
                  className={`${toggleBaseClass} ${options.showBorders ? toggleActiveClass : toggleInactiveClass}`}
                >
                  <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${options.showBorders ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="h-px bg-white/10 my-2"></div>

              <div className="flex justify-between items-center">
                <label htmlFor="celestial-toggle" className="font-semibold cursor-pointer">🪐 Planetas y Astros</label>
                <button
                  id="celestial-toggle"
                  role="switch"
                  aria-checked={options.showCelestialBodies}
                  onClick={() => onChange({ showCelestialBodies: !options.showCelestialBodies })}
                  className={`${toggleBaseClass} ${options.showCelestialBodies ? toggleActiveClass : toggleInactiveClass}`}
                >
                  <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${options.showCelestialBodies ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              <div className="flex justify-between items-center">
                <label htmlFor="orbits-toggle" className="font-semibold cursor-pointer">💫 Órbitas</label>
                <button
                  id="orbits-toggle"
                  role="switch"
                  aria-checked={options.showOrbits}
                  onClick={() => onChange({ showOrbits: !options.showOrbits })}
                  className={`${toggleBaseClass} ${options.showOrbits ? toggleActiveClass : toggleInactiveClass}`}
                >
                  <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${options.showOrbits ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LayerControls;