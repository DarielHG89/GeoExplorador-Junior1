import React, { useState, useCallback, useEffect, useRef } from 'react';
import GlobeView from './components/GlobeView';
import FlatMapView from './components/FlatMapView';
import InfoPanel from './components/InfoPanel';
import SearchBar from './components/SearchBar';
import LoadingIndicator from './components/LoadingIndicator';
import AudioControls from './components/AudioControls';
import QuizView from './components/QuizView';
import { fetchCountryInfo } from './services/geminiService';
import { CountryData, ViewMode, GeoJsonFeature, QuizQuestion, ExplorationMode } from './types';
import { OFFLINE_DB } from './src/data';
import { playCountryClickSound, playPanelOpenSound, playPanelCloseSound } from './services/soundService';

const STORAGE_KEY_GEOJSON = 'geoexplorador_geojson_data_v1';
const PRESENTATION_DELAY = 12000; // 12 seconds per country
const QUIZ_QUESTION_COUNT = 5;

const shuffleArray = (array: any[]) => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('3d');
  const [explorationMode, setExplorationMode] = useState<ExplorationMode>('geographic');
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [countryData, setCountryData] = useState<CountryData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isPanelExpanded, setIsPanelExpanded] = useState(true);
  const [geoFeatures, setGeoFeatures] = useState<GeoJsonFeature[]>([]);
  const [isGeoDataLoading, setIsGeoDataLoading] = useState(true);
  const [isPresenting, setIsPresenting] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.3); // Start with a lower, ambient volume
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);

  const presentationTimerRef = useRef<number | null>(null);
  const shuffledCountriesRef = useRef<GeoJsonFeature[]>([]);
  const presentationIndexRef = useRef<number>(0);
  const isFirstRenderRef = useRef(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const loadGeoData = async () => {
       // 1. Try to load from LocalStorage (Offline support)
      const cachedData = localStorage.getItem(STORAGE_KEY_GEOJSON);
      if (cachedData) {
        try {
          const parsed = JSON.parse(cachedData);
          setGeoFeatures(parsed);
          setIsGeoDataLoading(false); // If cache exists, we can show map immediately
        } catch (e) {
          console.error("Cache corrupted, reloading");
        }
      }

      // 2. Fetch from network to get latest data
      try {
        const res = await fetch('https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson');
        const data = await res.json();
        const filteredFeatures = data.features.filter((f: any) => f.properties.ISO_A2 !== 'AQ');
        try {
            localStorage.setItem(STORAGE_KEY_GEOJSON, JSON.stringify(filteredFeatures));
        } catch (e) {
            console.warn("Could not cache map data (quota exceeded?)");
        }
        setGeoFeatures(filteredFeatures);
      } catch (err) {
          console.error("Failed to load map data, using cache if available.", err);
      } finally {
        // Always ensure the loader is off after attempting to fetch
        setIsGeoDataLoading(false);
      }
    };
    
    loadGeoData();
  }, []);
  
  // Effect to handle panel open/close sounds
  useEffect(() => {
    // Skip playing sound on the initial render
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }

    if (isPanelOpen) {
      playPanelOpenSound();
    } else {
      playPanelCloseSound();
    }
  }, [isPanelOpen]);

  // Effect to sync audio element with component state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    // Don't adjust volume if quiz is active, it has its own logic
    if (!isQuizActive) {
      audio.volume = musicVolume;
    }

    const handlePlay = () => setIsMusicPlaying(true);
    const handlePause = () => setIsMusicPlaying(false);

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    
    if (!audio.paused && !isMusicPlaying) {
        setIsMusicPlaying(true);
    }
    if (audio.paused && isMusicPlaying) {
        setIsMusicPlaying(false);
    }

    return () => {
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('pause', handlePause);
    };
}, [musicVolume, isMusicPlaying, isQuizActive]);


  const handleClosePanel = () => {
    setIsPanelOpen(false);
    setSelectedCountry(null);
  };
  
  const stopPresentation = useCallback(() => {
    setIsPresenting(false);
    if (presentationTimerRef.current) {
      clearTimeout(presentationTimerRef.current);
      presentationTimerRef.current = null;
    }
    handleClosePanel();
  }, []);

  const handleCountryClick = useCallback(async (name: string, props: any = {}) => {
    if (isPresenting) {
      stopPresentation();
    }

    if (selectedCountry === name && isPanelOpen && !isPresenting) return;
    
    playCountryClickSound();

    setSelectedCountry(name);
    setIsPanelOpen(true);
    setIsPanelExpanded(true); // Reset to expanded state
    setIsLoading(true);
    setCountryData(null);

    // If it's a planet or celestial body, we look it up directly in OFFLINE_DB
    // OFFLINE_DB has keys like 'Mars', 'Sun', etc.
    const offlineMatch = OFFLINE_DB[name];
    if (offlineMatch && offlineMatch.isPlanet) {
        setCountryData(offlineMatch);
        setIsLoading(false);
        return;
    }

    // Otherwise, fetch country info (Gemini or Offline DB fallback for countries)
    const data = await fetchCountryInfo(name);
    setCountryData(data);
    setIsLoading(false);
  }, [selectedCountry, isPanelOpen, isPresenting, stopPresentation]);

  const handleSearch = useCallback((query: string) => {
    if (isPresenting) stopPresentation();
    if (!query) return;

    const lowerCaseQuery = query.toLowerCase().trim();

    let foundName: string | null = null;

    // 1. Search in GeoJSON (English names) for countries
    const foundFeature = geoFeatures.find(feature => {
      const name = feature.properties.ADMIN || feature.properties.NAME;
      const nameLong = feature.properties.NAME_LONG;
      return (name && name.toLowerCase().includes(lowerCaseQuery)) ||
             (nameLong && nameLong.toLowerCase().includes(lowerCaseQuery));
    });

    if (foundFeature) {
      foundName = foundFeature.properties.ADMIN || foundFeature.properties.NAME;
    } else {
      // 2. Search by Spanish name in our offline DB (Countries + Planets)
      const offlineMatchKey = Object.keys(OFFLINE_DB).find(key => 
          OFFLINE_DB[key].name.toLowerCase().includes(lowerCaseQuery)
      );
      if (offlineMatchKey) {
          // We found a Spanish name, so we use its corresponding English key
          foundName = offlineMatchKey;
      }
    }

    if (foundName) {
      handleCountryClick(foundName, { isFromSearch: true });
    } else {
      console.warn(`Country/Planet not found: "${query}"`);
    }
  }, [geoFeatures, handleCountryClick, isPresenting, stopPresentation]);

  const startPresentation = () => {
    if (geoFeatures.length === 0) return;
    shuffledCountriesRef.current = shuffleArray(geoFeatures);
    presentationIndexRef.current = 0;
    setIsPresenting(true);
  };
  
  const togglePresentationMode = () => {
    if (isPresenting) {
      stopPresentation();
    } else {
      if (isQuizActive) return; // Prevent starting while quiz is active
      startPresentation();
    }
  };

  const handleTogglePanelExpand = () => {
    setIsPanelExpanded(prev => !prev);
  };
  
  const handleToggleMusicPlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
        audio.play().catch(e => console.error("Audio play failed:", e));
    } else {
        audio.pause();
    }
  };
    
  const handleMusicVolumeChange = (newVolume: number) => {
      setMusicVolume(newVolume);
  };

  const generateQuestions = (count: number): QuizQuestion[] => {
    // Filter out planets from quiz for now, only countries
    const countryKeys = shuffleArray(Object.keys(OFFLINE_DB).filter(key => !OFFLINE_DB[key].isPlanet));
    const questions: QuizQuestion[] = [];
  
    for (let i = 0; i < Math.min(count, countryKeys.length); i++) {
      const correctKey = countryKeys[i];
      const correctCountryData = OFFLINE_DB[correctKey];
      
      const otherKeys = countryKeys.filter(k => k !== correctKey);
      const wrongKey1 = otherKeys.splice(Math.floor(Math.random() * otherKeys.length), 1)[0];
      const wrongKey2 = otherKeys.splice(Math.floor(Math.random() * otherKeys.length), 1)[0];
  
      const options = shuffleArray([
        OFFLINE_DB[correctKey].name, // Spanish name for display
        OFFLINE_DB[wrongKey1].name,
        OFFLINE_DB[wrongKey2].name
      ]);
  
      questions.push({
        flag: correctCountryData.flag,
        options: options,
        correctAnswer: correctCountryData.name, // Spanish name
        geoJsonName: correctKey // English name for highlighting
      });
    }
    return questions;
  };

  const startQuiz = () => {
    if (isPresenting) stopPresentation();
    if (isPanelOpen) handleClosePanel();

    const audio = audioRef.current;
    if (audio && !audio.paused) {
      audio.volume = musicVolume * 0.3; // Lower volume for quiz
    }

    const questions = generateQuestions(QUIZ_QUESTION_COUNT);
    setQuizQuestions(questions);
    setIsQuizActive(true);
    setSelectedCountry(null);
  };

  const handleQuizEnd = () => {
    setIsQuizActive(false);
    setQuizQuestions([]);
    setSelectedCountry(null);

    const audio = audioRef.current;
    if (audio) {
      audio.volume = musicVolume; // Restore volume
    }
  };

  useEffect(() => {
    if (!isPresenting || shuffledCountriesRef.current.length === 0) {
      return;
    }

    const presentNextCountry = () => {
      const countries = shuffledCountriesRef.current;
      const currentIndex = presentationIndexRef.current;
      
      const countryFeature = countries[currentIndex];
      const countryName = countryFeature.properties.ADMIN || countryFeature.properties.NAME;
      
      if (countryName) {
        handleCountryClick(countryName);
      }

      presentationIndexRef.current = (currentIndex + 1) % countries.length;
      presentationTimerRef.current = window.setTimeout(presentNextCountry, PRESENTATION_DELAY);
    };

    presentNextCountry(); // Start the cycle

    return () => { // Cleanup
      if (presentationTimerRef.current) {
        clearTimeout(presentationTimerRef.current);
      }
    };
  }, [isPresenting, handleCountryClick]);

  const isInteractionDisabled = isPresenting || isQuizActive;

  return (
    <div className="relative w-full h-screen bg-slate-900 overflow-hidden">
      <audio 
        ref={audioRef} 
        src="https://cdn.pixabay.com/audio/2022/11/17/audio_87424b65c3.mp3" 
        loop 
        preload="auto"
      />
      
      {isGeoDataLoading && <LoadingIndicator />}
      
      {/* Main Visualization Area */}
      <div className={`absolute inset-0 transition-opacity duration-500 ${isGeoDataLoading ? 'opacity-0' : 'opacity-100'}`}>
        {viewMode === '3d' ? (
          <GlobeView 
            countries={geoFeatures}
            onCountryClick={(name, props) => handleCountryClick(name, props)} 
            selectedCountryName={selectedCountry}
            isInteractionDisabled={isInteractionDisabled}
            explorationMode={explorationMode}
            onModeChange={setExplorationMode}
          />
        ) : (
          <FlatMapView 
            onCountryClick={(name, props) => handleCountryClick(name, props)}
            selectedCountryName={selectedCountry}
            isInteractionDisabled={isInteractionDisabled}
          />
        )}
      </div>

      <header className="absolute top-4 left-4 right-4 z-30 flex justify-between items-start pointer-events-none">
          {/* Header / Logo */}
          <div className="pointer-events-auto">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] tracking-wide" 
                style={{ WebkitTextStroke: "2px #0ea5e9" }}>
              GeoExplorador
            </h1>
            <div className="flex flex-col items-start gap-1">
                <p className="text-sky-200 text-lg font-bold ml-1 drop-shadow-md bg-black/30 inline-block px-2 rounded">
                ¡Explora el mundo!
                </p>
                
                {/* Mode Indicator */}
                {viewMode === '3d' && (
                    <div className={`ml-1 px-3 py-1 rounded-full text-sm font-bold border backdrop-blur-md transition-colors duration-500 ${
                        explorationMode === 'geographic' 
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300' 
                        : 'bg-indigo-500/20 border-indigo-400 text-indigo-300'
                    }`}>
                        {explorationMode === 'geographic' ? '📍 Modo Geográfico' : '🚀 Modo Sistema Solar'}
                    </div>
                )}
            </div>
          </div>
          <div className="pointer-events-auto">
            <SearchBar onSearch={handleSearch} disabled={isInteractionDisabled} />
          </div>
      </header>
      
      {/* Side Info Panel */}
      {isPanelOpen && (
        <InfoPanel 
          data={countryData} 
          isLoading={isLoading} 
          onClose={handleClosePanel}
          isExpanded={isPanelExpanded}
          onToggleExpand={handleTogglePanelExpand}
        />
      )}

      {isQuizActive && quizQuestions.length > 0 && (
        <QuizView
          questions={quizQuestions}
          onQuizEnd={handleQuizEnd}
          onHighlightCountry={setSelectedCountry}
        />
      )}

      <AudioControls 
        isPlaying={isMusicPlaying}
        onTogglePlay={handleToggleMusicPlay}
        volume={musicVolume}
        onVolumeChange={handleMusicVolumeChange}
      />

      {/* Bottom Control Bar */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded-full shadow-2xl flex space-x-2">
        <button
          onClick={() => setViewMode('3d')}
          className={`px-6 py-3 rounded-full font-bold text-lg transition-all duration-300 flex items-center gap-2 ${
            viewMode === '3d' 
              ? 'bg-sky-500 text-white shadow-lg scale-105 ring-2 ring-sky-300' 
              : 'bg-transparent text-white/80 hover:bg-white/20'
          }`}
          disabled={isQuizActive}
        >
          <span>🌍</span>
          <span className="hidden sm:inline">Globo 3D</span>
        </button>

        <button
          onClick={startQuiz}
          className={`px-6 py-3 rounded-full font-bold text-lg transition-all duration-300 flex items-center gap-2 bg-amber-500 text-white/90 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed`}
          title="Iniciar Quiz"
          disabled={isQuizActive}
        >
          <span>🧠</span>
          <span className="hidden sm:inline">Quiz</span>
        </button>

        <button
          onClick={togglePresentationMode}
          className={`px-6 py-3 rounded-full font-bold text-lg transition-all duration-300 flex items-center gap-2 ${
            isPresenting
              ? 'bg-red-500 text-white shadow-lg scale-105 ring-2 ring-red-300'
              : 'bg-purple-500 text-white/90 hover:bg-purple-600'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          title={isPresenting ? "Detener Presentación" : "Iniciar Presentación"}
          disabled={isQuizActive}
        >
          {isPresenting ? (
            <>
              <span>⏹️</span>
              <span className="hidden sm:inline">Detener</span>
            </>
          ) : (
            <>
              <span>▶️</span>
              <span className="hidden sm:inline">Presentar</span>
            </>
          )}
        </button>
        
        <button
          onClick={() => setViewMode('2d')}
          className={`px-6 py-3 rounded-full font-bold text-lg transition-all duration-300 flex items-center gap-2 ${
            viewMode === '2d' 
              ? 'bg-emerald-500 text-white shadow-lg scale-105 ring-2 ring-emerald-300' 
              : 'bg-transparent text-white/80 hover:bg-white/20'
          }`}
          disabled={isQuizActive}
        >
          <span>🗺️</span>
          <span className="hidden sm:inline">Mapa Plano</span>
        </button>
      </div>

      {/* Instructions Hint */}
      {!selectedCountry && !isPresenting && !isQuizActive && (
        <div className="absolute bottom-28 w-full text-center z-0 pointer-events-none animate-bounce">
          <span className="bg-black/50 text-white px-4 py-2 rounded-full text-lg">
            {explorationMode === 'geographic' && viewMode === '3d' 
                ? '👆 ¡Toca un país! (Aleja la vista para ver el Sistema Solar 🌌)' 
                : explorationMode === 'solar_system' && viewMode === '3d'
                ? '🪐 ¡Explora los planetas! (Acércate a la Tierra para ver países 🌍)'
                : '👆 ¡Toca un país para descubrir sus secretos!'
            }
          </span>
        </div>
      )}
    </div>
  );
};

export default App;