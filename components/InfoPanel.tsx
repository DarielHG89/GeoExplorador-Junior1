import React from 'react';
import { CountryData } from '../types';

interface InfoPanelProps {
  data: CountryData | null;
  isLoading: boolean;
  onClose: () => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ data, isLoading, onClose, isExpanded, onToggleExpand }) => {
  if (!data && !isLoading) return null;

  const isPlanet = data?.isPlanet;

  return (
    <div className={`absolute top-4 right-4 w-80 md:w-96 bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-2xl border-4 ${isPlanet ? 'border-indigo-400' : 'border-sky-300'} overflow-hidden transition-all duration-500 ease-in-out z-40 flex flex-col animate-in fade-in slide-in-from-right-10 ${isExpanded ? 'max-h-[85vh]' : 'max-h-[160px]'}`}>
      
      {/* Header with Flag */}
      <div className={`bg-gradient-to-r ${isPlanet ? 'from-indigo-600 to-purple-700' : 'from-sky-400 to-blue-500'} p-6 pb-10 relative`}>
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/20 rounded-full p-1 transition-colors z-10"
          aria-label="Cerrar panel"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col items-center justify-center text-center mt-2">
            {isLoading ? (
                <div className="text-6xl animate-pulse">🌍</div>
            ) : (
                <>
                    <div className="text-7xl mb-2 drop-shadow-md transform hover:scale-110 transition-transform cursor-default">
                        {data?.flag}
                    </div>
                    <h2 className="text-3xl font-extrabold text-white drop-shadow-md leading-tight">
                        {data?.name}
                    </h2>
                    {data?.continent && (
                        <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mt-2 backdrop-blur-sm">
                            {data.continent}
                        </span>
                    )}
                </>
            )}
        </div>
        
        {/* Expander/Collapser Handle */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-full flex justify-center">
            <button
              onClick={onToggleExpand}
              className={`w-16 h-8 bg-white/50 backdrop-blur-md rounded-b-2xl flex items-center justify-center ${isPlanet ? 'text-indigo-900' : 'text-sky-800'} hover:bg-white/80 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-300`}
              aria-label={isExpanded ? "Contraer panel" : "Expandir panel"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'rotate-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
        </div>
      </div>

      {/* Body */}
      <div className={`p-6 pt-10 overflow-y-auto -mt-6 bg-white rounded-t-[2rem] flex-1 transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center space-y-4 py-10">
            <div className={`animate-spin rounded-full h-12 w-12 border-b-4 ${isPlanet ? 'border-indigo-500' : 'border-sky-500'}`}></div>
            <p className={`${isPlanet ? 'text-indigo-600' : 'text-sky-600'} font-bold text-lg animate-pulse`}>Consultando satélite...</p>
          </div>
        ) : data ? (
          <div className="space-y-4">
            
            <div className={`${isPlanet ? 'bg-indigo-50 border-indigo-100' : 'bg-sky-50 border-sky-100'} p-4 rounded-2xl border shadow-sm`}>
              <p className="text-slate-700 italic text-lg leading-relaxed text-center">"{data.description}"</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <InfoItem 
                emoji="🏛️" 
                label={isPlanet ? "Tipo" : "Capital"}
                value={data.capital} 
                color="bg-orange-50 text-orange-800 border-orange-100" 
              />
              <InfoItem 
                emoji="🗣️" 
                label={isPlanet ? "Temperatura" : "Idioma"}
                value={data.language} 
                color="bg-purple-50 text-purple-800 border-purple-100" 
              />
              <InfoItem 
                emoji="💰" 
                label={isPlanet ? "Duración Día/Año" : "Moneda"}
                value={data.currency} 
                color="bg-emerald-50 text-emerald-800 border-emerald-100" 
              />
              <InfoItem 
                emoji="👥" 
                label={isPlanet ? "Diámetro" : "Gente"}
                value={data.population} 
                color="bg-pink-50 text-pink-800 border-pink-100" 
              />
              <InfoItem 
                emoji="📏" 
                label={isPlanet ? "Distancia al Sol" : "Tamaño"}
                value={data.area} 
                color="bg-blue-50 text-blue-800 border-blue-100" 
              />
            </div>

            <div className="bg-amber-50 p-5 rounded-2xl border-2 border-amber-300 relative mt-6 shadow-sm">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-amber-400 text-white px-4 py-1 rounded-full font-bold shadow-sm text-sm whitespace-nowrap">
                ✨ ¿Sabías qué? ✨
              </div>
              <p className="text-amber-900 font-medium mt-2 text-center text-lg leading-snug">
                {data.funFact}
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

const InfoItem: React.FC<{ emoji: string, label: string, value: string, color: string }> = ({ emoji, label, value, color }) => (
  <div className={`flex items-center p-3 rounded-xl border ${color} transition-transform hover:scale-[1.02]`}>
    <span className="text-3xl mr-4 filter drop-shadow-sm">{emoji}</span>
    <div>
      <p className="text-[10px] uppercase font-bold opacity-60 tracking-wider mb-0.5">{label}</p>
      <p className="text-base font-bold leading-tight">{value}</p>
    </div>
  </div>
);

export default InfoPanel;