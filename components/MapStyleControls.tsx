import React from 'react';

export type MapStyle = 'classic' | 'dark' | 'satellite';

interface MapStyleControlsProps {
  currentStyle: MapStyle;
  onStyleChange: (style: MapStyle) => void;
}

const styles: { id: MapStyle; name: string; emoji: string }[] = [
  { id: 'classic', name: 'Clásico', emoji: '🗺️' },
  { id: 'dark', name: 'Oscuro', emoji: '🌙' },
  { id: 'satellite', name: 'Satélite', emoji: '🛰️' },
];

const MapStyleControls: React.FC<MapStyleControlsProps> = ({ currentStyle, onStyleChange }) => {
  const baseClass = "px-4 py-2 rounded-full font-bold text-sm transition-all duration-300 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-400";
  const activeClass = "bg-sky-500 text-white shadow-lg scale-105";
  const inactiveClass = "bg-slate-700/80 text-white/80 hover:bg-slate-600/90";

  return (
    <div className="absolute bottom-4 left-4 z-10 bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded-full shadow-2xl flex space-x-2">
      {styles.map(({ id, name, emoji }) => (
        <button
          key={id}
          onClick={() => onStyleChange(id)}
          className={`${baseClass} ${currentStyle === id ? activeClass : inactiveClass}`}
          title={`Cambiar a vista ${name.toLowerCase()}`}
        >
          <span>{emoji}</span>
          <span className="hidden sm:inline">{name}</span>
        </button>
      ))}
    </div>
  );
};

export default MapStyleControls;
