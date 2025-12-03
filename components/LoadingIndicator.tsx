import React from 'react';

const LoadingIndicator: React.FC = () => {
  return (
    <div 
      className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-sm transition-opacity duration-300"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="relative">
        <div className="absolute -inset-2 border-4 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-6xl">🌍</div>
      </div>
      <h2 className="mt-6 text-3xl font-bold text-white drop-shadow-lg animate-pulse">
        Cargando el mundo...
      </h2>
      <p className="mt-2 text-sky-200 text-lg">
        ¡Un momento, por favor!
      </p>
    </div>
  );
};

export default LoadingIndicator;
