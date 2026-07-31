// @ts-nocheck
import React, { useState, useEffect, useMemo, useTransition,useRef } from "react";
import { Gasolinera, CombustibleKey, ApiResponse, COMBUSTIBLES } from "./types";
import GasolineraCard from "./components/GasolineraCard";
import CombustibleSelector from "./components/CombustibleSelector";
import FavoritesPanel from "./components/FavoritesPanel";
import {
  Search,
  Star,
  MapPin,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Coins,
  Fuel,
  Info,
  Sparkles,
  AlertCircle,
  Trash2,
  Eye,
  EyeOff
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const POPULAR_MUNICIPIOS = [
  "Albacete"
];


export default function App() {
  // --- globales
  const Gversion = "v2.3";

  // --- States ---
  const [searchQuery, setSearchQuery] = useState("");
  const [currentMunicipio, setCurrentMunicipio] = useState("Albacete");
  const [gasolineras, setGasolineras] = useState<Gasolinera[]>([]);
  const [fechaActualizacion, setFechaActualizacion] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  let esPrimeraVez  =true;
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // mis opciones....
  const [CambiarMasOpciones, setCambiarMasOpciones] = useState<string>('Ocultar Opciones');
  const [ojoMostrarMas, setojoMostrarMas] = useState(false);

  // Selected fuel type (remembered in localStorage)
  const [selectedCombustible, setSelectedCombustible] = useState<CombustibleKey>(() => {
    const saved = localStorage.getItem("gasofa_pref_combustible");
    return (saved as CombustibleKey) || "gasolina95";
  });

  // Favorite municipalities
  const [favoriteMunicipios, setFavoriteMunicipios] = useState<string[]>(() => {
    const saved = localStorage.getItem("gasofa_fav_municipios");
    return saved ? JSON.parse(saved) : [];
  });

  // Favorite stations
  const [favoriteStations, setFavoriteStations] = useState<Gasolinera[]>(() => {
    const saved = localStorage.getItem("gasofa_fav_estaciones");
    return saved ? JSON.parse(saved) : [];
  });


  // --- Sync Favorites & Preference to localStorage ---  con una variable --USEEFFECT se ejecta al cambiar la variable
  useEffect(() => {
    localStorage.setItem("gasofa_fav_municipios", JSON.stringify(favoriteMunicipios));
  }, [favoriteMunicipios]);

  useEffect(() => {
    localStorage.setItem("gasofa_fav_estaciones", JSON.stringify(favoriteStations));
    console.log("Cambio en estaciones favoritas");
  }, [favoriteStations]);

  useEffect(() => {
    localStorage.setItem("gasofa_pref_combustible", selectedCombustible);
  }, [selectedCombustible]);

  // --- Fetch Gas Stations ---
  const fetchGasolineras = async (query: string, isStationId: boolean = false) => {
    // funcion de búsqueda en el servicio web

    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const paramName = isStationId ? "ideess" : "municipio";
      const response = await fetch(`https://www.alcaide.info/gasofa/servicio.php?${paramName}=${encodeURIComponent(query.trim())}`);
      
      if (!response.ok) {
        throw new Error("No se pudo obtener respuesta del servidor de datos.");
      }

      const data: ApiResponse = await response.json();

      if (data.datos && Array.isArray(data.datos)) {
        startTransition(() => {
          setGasolineras(data.datos);
          setFechaActualizacion(data.fecha || new Date().toLocaleString());
          if (!isStationId) {
            // Update the current municipality label based on the first returned element
            if (data.datos.length > 0) {
              setCurrentMunicipio(data.datos[0].municipio);
            } else {
              setCurrentMunicipio(query);
            }
          } else {
            setCurrentMunicipio(data.datos[0]?.municipio || `Estación #${query}`);
          }
        });
      } else {
        throw new Error("Formato de respuesta incorrecto del servidor.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Ocurrió un error al cargar las estaciones.");
    } finally {
      setIsLoading(false);
    }
  };

// --- metadata
  
/*
  useEffect(() => {
     / Leemos el archivo cargado en la carpeta public/
    fetch('/metadata.json')
      .then((response) => response.json())
      .then((data) => {
        setMetadata(data);
      })
      .catch((error) => {
        console.error('Error cargando los metadatos:', error);
      });
  }, []);
*/


  // Initial load  -- se ejecta solo al principio
  useEffect(() => {
    // If the user has saved municipalities, load the first one. Otherwise, load San Sebastián.
    const initialQuery = favoriteMunicipios.length > 0 ? favoriteMunicipios[0] : "Albacete";
    setSearchQuery(initialQuery);
    fetchGasolineras(initialQuery);

    // actualizar los favoritos
   func_ActualizarFavoritos();
  }, []);


     /* */
     const func_ActualizarFavoritos = async () => {
      // Leemos directamente del localStorage para tener los datos más recientes de partida
      const datosRaw = localStorage.getItem("gasofa_fav_estaciones");
      if (!datosRaw) return;
    
      try {
        const estacionesGuardadas: Gasolinera[] = JSON.parse(datosRaw);
        if (!Array.isArray(estacionesGuardadas) || estacionesGuardadas.length === 0) return;
    
        // Lanzamos todas las peticiones a la API en paralelo
        const estacionesActualizadas = await Promise.all(
          estacionesGuardadas.map(async (estacion) => {
            try {
              const response = await fetch(
                `https://www.alcaide.info/gasofa/servicio.php?ideess=${estacion.ideess}`
              );
              if (!response.ok) return estacion;
    
              const data: ApiResponse = await response.json();
              // Si el PHP devuelve un array de estaciones en "datos" tomamos el primero, 
              // de lo contrario usamos el objeto directamente
              const nuevosDatos = Array.isArray(data.datos) ? data.datos[0] : data;
    
              if (!nuevosDatos) return estacion;
    
              // Retornamos la estación fusionada con los precios actualizados
              return {
                ...estacion,
                gasoleoA: nuevosDatos.gasoleoA ?? estacion.gasoleoA,
                gasoleoB: nuevosDatos.gasoleoB ?? estacion.gasoleoB,
                gasoleoP: nuevosDatos.gasoleoP ?? estacion.gasoleoP,
                gasolina95: nuevosDatos.gasolina95 ?? estacion.gasolina95,
                gasolina98: nuevosDatos.gasolina98 ?? estacion.gasolina98,
                glp: nuevosDatos.glp ?? estacion.glp,
              };
            } catch (err) {
              console.error(`Error actualizando estación ${estacion.ideess}:`, err);
              return estacion; // Si falla una petición, mantenemos los datos que teníamos
            }
          })
        );
    
        // Actualizamos el estado de React (esto refresca la interfaz)
        setFavoriteStations(estacionesActualizadas);
    
        // Guardamos la lista completa y actualizada en el localStorage
        localStorage.setItem("gasofa_fav_estaciones", JSON.stringify(estacionesActualizadas));
        console.log("Estaciones favoritas actualizadas correctamente con datos frescos.");
      } catch (error) {
        console.error("Error al actualizar favoritos:", error);
      }
    };

   /**/

  // --- Handlers ---
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const isStationId = /^\d+$/.test(searchQuery.trim());
    fetchGasolineras(searchQuery, isStationId);
  };

  const handleSelectMunicipio = (name: string) => {
    setSearchQuery(name);
    fetchGasolineras(name);
  };

  const handleToggleMunicipioFavorite = () => {
    if (!currentMunicipio) return;
    
    // Check if the current municipality is already in favorites
    const isFav = favoriteMunicipios.some(m => m.toLowerCase() === currentMunicipio.toLowerCase());

    if (isFav) {
      setFavoriteMunicipios(prev => prev.filter(m => m.toLowerCase() !== currentMunicipio.toLowerCase()));
    } else {
      // Add ensuring no duplicates
      setFavoriteMunicipios(prev => [...prev, currentMunicipio]);
    }
  };

  const handleToggleStationFavorite = (station: Gasolinera) => {
    // si está  en la lista la quita sino la añade.
    const isFav = favoriteStations.some((s) => s.ideess === station.ideess);

    if (isFav) {
      setFavoriteStations((prev) => prev.filter((s) => s.ideess !== station.ideess));
    } else {
      setFavoriteStations((prev) => [...prev, station]);
    }
  };

  const handleRemoveFavoriteMunicipio = (name: string) => {
    // Elimina un Municipio de la Memoria
    setFavoriteMunicipios((prev) => prev.filter((m) => m.toLowerCase() !== name.toLowerCase()));
  };

  const handleRemoveFavoriteStation = (ideess: number) => {
    setFavoriteStations((prev) => prev.filter((s) => s.ideess !== ideess));
  };

  const handleRemoveAllFavorites = () => {
    // vacio la cache
    localStorage.removeItem('gasofa_fav_estaciones');
    localStorage.removeItem('gasofa_fav_municipios');
    window.location.reload();
  };

  {/**  oculto dos paneles panel */}
  const handleMostrarMas= () => {
    const elemento = document.getElementById('popular-suggestions');
    const elemento2 = document.getElementById('fav-stations-by-mun-section');
    if (elemento) {
      if (elemento.style.display === 'none') {
        elemento.style.display = 'block';
        elemento2.style.display = 'block';
        setCambiarMasOpciones('Ocultar Opciones');
        setojoMostrarMas(false);
      } else {
        elemento.style.display = 'none';
        elemento2.style.display = 'none';
        setCambiarMasOpciones('Mostrar más Opciones');
        setojoMostrarMas(true);
      }
    }
  };

  // --- Derived Calculations & Sorting ---
  const { sortedStations, minPrice, maxPrice, avgPrice, totalStations, activeCheapestId } = useMemo(() => {
    // Filter out stations that don't belong to the search (just in case)
    let processed = [...gasolineras];

    // Identify stations with valid price for active fuel
    const stationsWithPrices = processed.filter(s => s[selectedCombustible] > 0);
    const prices = stationsWithPrices.map(s => s[selectedCombustible]);

    const total = processed.length;

    // Calculate statistics
    const min = prices.length > 0 ? Math.min(...prices) : 0;
    const max = prices.length > 0 ? Math.max(...prices) : 0;
    const avg = prices.length > 0 ? prices.reduce((sum, val) => sum + val, 0) / prices.length : 0;

    // Sort: Cheapest to most expensive, but place 0 (unavailable) at the bottom
    const sorted = processed.sort((a, b) => {
      const priceA = a[selectedCombustible];
      const priceB = b[selectedCombustible];

      if (priceA === 0 && priceB > 0) return 1;
      if (priceB === 0 && priceA > 0) return -1;
      if (priceA === 0 && priceB === 0) return 0;
      return priceA - priceB;
    });

    // Find the ID of the cheapest station that is actually available
    const cheapestStation = sorted.find((s) => s[selectedCombustible] > 0);
    const cheapestId = cheapestStation ? cheapestStation.ideess : null;

    return {
      sortedStations: sorted,
      minPrice: min,
      maxPrice: max,
      avgPrice: avg,
      totalStations: total,
      activeCheapestId: cheapestId,
    };
  }, [gasolineras, selectedCombustible]);

  const isCurrentMunicipioFavorite = useMemo(() => {
    return favoriteMunicipios.some(m => m.toLowerCase() === currentMunicipio.toLowerCase());
  }, [favoriteMunicipios, currentMunicipio]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-indigo-500/10 selection:text-indigo-900 font-sans">
      
      {/* HEADER */}
      <header id="main-header" className="sticky top-0 z-40 backdrop-blur-md bg-white/80 border-b border-slate-200/80 px-4 md:px-8 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="relative p-2.5 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl shadow-lg shadow-indigo-100 flex items-center justify-center shrink-0">
              <Fuel size={24} className="text-white stroke-[2.5]" />
              <div className="absolute -top-1.5 -right-1.5 bg-indigo-950 px-1 py-0.5 rounded text-[8px] font-black tracking-widest text-indigo-300 uppercase">
                ES
              </div>
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-1.5">
                GasofaBarata
                <span className="text-indigo-600 font-bold text-xs bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full font-sans tracking-wide">
                  En tiempo real
                </span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">Encuentra el combustible más barato en tu municipio</p>
            </div>
          </div>

          {/* Quick Stats or Updates */}
          <div className="flex items-center gap-4 text-xs">
            {fechaActualizacion && (
              <div id="update-badge" className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 px-3.5 py-2 rounded-2xl text-slate-500 font-mono font-bold shadow-sm">
                <RefreshCw size={12} className={`text-indigo-600 ${isLoading ? "animate-spin" : ""}`} />
                <span>Act: {fechaActualizacion}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* DASHBOARD GRID */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT / MAIN COLUMN (2/3) - Search, Selector, and Station List */}
        <div id="main-content-column" className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Search Box Card */}
          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col gap-5">
            
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="municipio-search-input"
                  type="text"
                  placeholder="Introduce municipio (ej: Donostia) o ID de estación..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 rounded-2xl text-slate-800 placeholder-slate-400 text-sm font-medium focus:outline-none transition-all shadow-inner"
                />
              </div>
              <button
                id="search-submit-btn"
                type="submit"
                disabled={isLoading}
                className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-sm px-6 py-3.5 rounded-2xl transition-all shadow-sm shadow-indigo-100 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed shrink-0"
              >
                {isLoading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Buscando...</span>
                  </>
                ) : (
                  <>
                    <Search size={16} className="stroke-[2.5]" />
                    <span>Buscar Estaciones</span>
                  </>
                )}
              </button>
            </form>
{/*    --------  --------     añado pestaña para ocultar.  --------    */}
<button onClick={handleMostrarMas} class="flex items-center gap-2 font-medium text-gray-700 hover:text-indigo-600 transition-colors">
  <span>{CambiarMasOpciones}</span>
  {ojoMostrarMas ? (
    <EyeOff className="w-5 h-5 text-indigo-600" strokeWidth={2} />
    ) : (    
    <Eye className="w-5 h-5 text-indigo-600" strokeWidth={2} />
  )}
</button>

{/*    --------  --------    ----------------------------- --------    */}

            {/* Popular & Favorite Suggestions */}
            <div id="popular-suggestions" className="flex flex-col gap-3 pt-1">
              <div className="flex flex-wrap items-center gap-2 text-xs">

 
                <span className="text-indigo-600 font-extrabold tracking-wide uppercase text-[10px] flex items-center gap-1">
                  <Star size={12} className={favoriteMunicipios.length > 0 ? "text-amber-500 fill-amber-400" : "text-indigo-500"} />
                  {favoriteMunicipios.length > 0 ? "Mis Municipios Favoritos:" : "Localidades Populares:"}
                </span>
                {(favoriteMunicipios.length > 0 ? favoriteMunicipios : POPULAR_MUNICIPIOS).map((mun) => {
                  const isFav = favoriteMunicipios.includes(mun);
                  return (
                    <button
                      key={mun}
                      id={`suggestion-btn-${mun}`}
                      onClick={() => handleSelectMunicipio(mun)}
                      type="button"
                      className={`text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 border ${
                        isFav
                          ? "bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-900 shadow-sm"
                          : "text-slate-600 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 border-slate-200 hover:border-indigo-100"
                      }`}
                    >
                      {isFav && <Star size={11} className="text-amber-500 fill-amber-400" />}
                      <span>{mun}</span>
                    </button>
                  );
                })}
              </div>

              {favoriteMunicipios.length === 0 && (
                <p className="text-[10px] text-slate-400 font-medium italic">
                  * Truco: Pulsa la estrella en el título de los resultados de búsqueda para guardar tu municipio aquí.
                </p>
              )}
            </div>

            {/* Estaciones guardadas por localidad favorita */}
            {favoriteMunicipios.length > 0 && favoriteStations.length > 0 && (
              <div id="fav-stations-by-mun-section" className="border-t border-slate-100 pt-4 mt-1 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-3 bg-indigo-600 rounded-full shrink-0"></span>
                  <span className="text-slate-800 font-black tracking-wide uppercase text-[10px]">
                    Estaciones en mis municipios favoritos:
                  </span>
                </div>
                
                <div className="flex flex-col gap-3">
                  {favoriteMunicipios.map((mun) => {
                    // Find favorite stations belonging to this municipality
                    const stationsInMun = favoriteStations.filter(
                      (s) => s.municipio.toLowerCase() === mun.toLowerCase()
                    );
                    if (stationsInMun.length === 0) return null;

                    return (
                      <div
                        key={mun}
                        id={`fav-mun-group-${mun}`}
                        className="bg-slate-50/50 hover:bg-slate-50/80 rounded-2xl p-4 border border-slate-200/60 transition-all flex flex-col gap-2.5"
                      >
                        <div className="flex items-center gap-2">
                          <MapPin size={13} className="text-indigo-600" />
                          <span className="text-xs font-black text-indigo-950 uppercase tracking-tight">{mun}</span>
                          <span className="text-[10px] text-slate-400 font-bold bg-white px-1.5 py-0.5 rounded-full border border-slate-200/50">
                            {stationsInMun.length} {stationsInMun.length === 1 ? "estación" : "estaciones"}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {stationsInMun.map((station) => {
                            const activeComb = COMBUSTIBLES.find((c) => c.key === selectedCombustible);
                            const price = station[selectedCombustible];
                            const isAvailable = price > 0;
                            
                            // Format brand info helper
                            const getShortBrand = (brand: string) => {
                              const b = brand.toUpperCase();
                              if (b.includes("REPSOL")) return { name: "Repsol", bg: "bg-orange-600 text-white" };
                              if (b.includes("CEPSA")) return { name: "Cepsa", bg: "bg-red-600 text-white" };
                              if (b.includes("SHELL")) return { name: "Shell", bg: "bg-yellow-500 text-slate-900" };
                              if (b.includes("BP")) return { name: "BP", bg: "bg-green-600 text-white" };
                              if (b.includes("GALP")) return { name: "Galp", bg: "bg-orange-500 text-white" };
                              if (b.includes("PLENOIL")) return { name: "Plenoil", bg: "bg-yellow-400 text-slate-900" };
                              if (b.includes("BALLENOIL")) return { name: "Ballenoil", bg: "bg-blue-500 text-white" };
                              return { name: brand.split(" ")[0] || "Estación", bg: "bg-slate-200 text-slate-700" };
                            };
                            const brandMeta = getShortBrand(station.rotulo);
                            const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${station.latitud},${station.longitud}`;

                            return (
                              <div
                                key={station.ideess}
                                id={`fav-mun-station-${station.ideess}`}
                                className="bg-white p-3 rounded-xl border border-slate-200/80 hover:border-indigo-100 flex items-center justify-between gap-3 shadow-sm hover:shadow-md transition-all duration-200"
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 max-w-[80px] truncate ${brandMeta.bg}`}>
                                      {brandMeta.name}
                                    </span>
                                    <span className="text-[11px] font-bold text-slate-700 truncate block">
                                      {station.direccion}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className="text-[9px] text-slate-400 font-bold">{activeComb?.label}:</span>
                                    {isAvailable ? (
                                      <span className="text-xs font-extrabold font-mono text-indigo-600">
                                        {price.toFixed(3)} €/L
                                      </span>
                                    ) : (
                                      <span className="text-[10px] text-slate-400 italic">No disponible</span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <a
                                    href={mapsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="Ver en Google Maps"
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-colors cursor-pointer"
                                  >
                                    <MapPin size={13} />
                                  </a>
                                  <button
                                    onClick={() => handleRemoveFavoriteStation(station.ideess)}
                                    title="Quitar de favoritos"
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
                 {/* boton borrar cache */}
                      <span>Borrar Favoritos
                      <button
                                    onClick={() => handleRemoveAllFavorites()}
                                    title="Borar todos los favoritos"
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="w-4 h-4 text-indigo-600"   />
                                  </button></span>
                 {/*  ----------------  */}
              </div>              
            )}
          </div>

          {/* Combustible Selector Wrapper */}
          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
            <CombustibleSelector
              selectedCombustible={selectedCombustible}
              onChange={setSelectedCombustible}
            />
          </div>

          {/* STATS OVERVIEW CARDS */}
          {sortedStations.length > 0 && !isLoading && (
            <div id="stats-grid" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Cheapest Stat Card */}
              <div id="stat-card-min" className="bg-emerald-50/60 border border-emerald-100 p-5 rounded-3xl flex items-center gap-4 relative overflow-hidden group shadow-sm shadow-emerald-50/20">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
                <div className="p-3 bg-white rounded-2xl text-emerald-600 border border-emerald-100 shrink-0 shadow-sm shadow-emerald-100/50">
                  <TrendingDown size={20} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">Precio Mínimo</p>
                  <p className="text-2xl font-black font-mono text-emerald-700 mt-0.5">
                    {minPrice > 0 ? `${minPrice.toFixed(3)} €` : "—"}
                  </p>
                </div>
              </div>

              {/* Average Stat Card */}
              <div id="stat-card-avg" className="bg-slate-50/60 border border-slate-200 p-5 rounded-3xl flex items-center gap-4 relative overflow-hidden group shadow-sm">
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
                <div className="p-3 bg-white rounded-2xl text-slate-600 border border-slate-200 shrink-0 shadow-sm">
                  <Coins size={20} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">Precio Medio</p>
                  <p className="text-2xl font-black font-mono text-slate-800 mt-0.5">
                    {avgPrice > 0 ? `${avgPrice.toFixed(3)} €` : "—"}
                  </p>
                </div>
              </div>

              {/* Highest Stat Card */}
              <div id="stat-card-max" className="bg-red-50/60 border border-red-100 p-5 rounded-3xl flex items-center gap-4 relative overflow-hidden group shadow-sm shadow-red-50/20">
                <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
                <div className="p-3 bg-white rounded-2xl text-red-600 border border-red-100 shrink-0 shadow-sm shadow-red-100/50">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">Precio Máximo</p>
                  <p className="text-2xl font-black font-mono text-red-700 mt-0.5">
                    {maxPrice > 0 ? `${maxPrice.toFixed(3)} €` : "—"}
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* MAIN RESULTS CONTAINER */}
          <div className="flex flex-col gap-4">
            
            {/* Results Title bar */}
            <div className="flex items-center justify-between flex-wrap gap-3 px-1">
              <div className="flex items-center gap-2">
                <MapPin size={18} className="text-indigo-600" />
                <h2 id="results-municipio-title" className="text-lg font-black text-slate-800 tracking-tight">
                  {currentMunicipio}
                  <span className="text-xs text-slate-400 font-semibold font-sans ml-2.5">
                    ({totalStations} estaciones)
                  </span>
                </h2>
              </div>

              {/* Favorite Municipio Toggle Button */}
              {currentMunicipio && totalStations > 0 && (
                <button
                  id="btn-fav-municipio-toggle"
                  onClick={handleToggleMunicipioFavorite}
                  className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                    isCurrentMunicipioFavorite
                      ? "bg-amber-50 border border-amber-200 text-amber-600"
                      : "bg-white border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Star size={14} fill={isCurrentMunicipioFavorite ? "currentColor" : "none"} />
                  <span>
                    {isCurrentMunicipioFavorite ? "Municipio Guardado" : "Guardar Municipio"}
                  </span>
                </button>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div id="error-message-box" className="p-5 bg-red-50 border border-red-100 rounded-3xl flex items-start gap-3 text-red-600">
                <AlertCircle size={20} className="shrink-0 mt-0.5 text-red-600" />
                <div>
                  <h4 className="text-sm font-black">Error al buscar estaciones</h4>
                  <p className="text-xs mt-1 text-red-500 font-medium leading-relaxed">{error}</p>
                  <button
                    onClick={() => fetchGasolineras(currentMunicipio)}
                    className="mt-3 text-xs font-bold text-red-700 bg-red-100 hover:bg-red-200 px-3.5 py-1.5 rounded-xl border border-red-200 transition-all cursor-pointer"
                  >
                    Reintentar
                  </button>
                </div>
              </div>
            )}

            {/* Loading Skeleton */}
            {isLoading ? (
              <div id="loading-skeletons" className="flex flex-col gap-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="bg-white border border-slate-100 p-6 rounded-3xl animate-pulse flex flex-col md:flex-row justify-between gap-5 shadow-sm">
                    <div className="flex-1 space-y-3">
                      <div className="h-4 bg-slate-100 rounded w-1/4"></div>
                      <div className="h-6 bg-slate-100 rounded w-3/4"></div>
                      <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                    </div>
                    <div className="h-12 bg-slate-100 rounded w-28 shrink-0"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div id="gas-stations-list" className="flex flex-col gap-3">
                <AnimatePresence mode="popLayout">
                  {sortedStations.map((station) => {
                    const isFav = favoriteStations.some((s) => s.ideess === station.ideess);

                    return (
                      <GasolineraCard
                        key={station.ideess}
                        gasolinera={station}
                        selectedCombustible={selectedCombustible}
                        isFavorite={isFav}
                        onToggleFavorite={() => handleToggleStationFavorite(station)}
                        isCheapest={station.ideess === activeCheapestId}
                      />
                    );
                  })}
                </AnimatePresence>

                {/* Empty State */}
                {sortedStations.length === 0 && !error && (
                  <div id="empty-state" className="text-center py-12 px-6 border border-slate-200 bg-white rounded-3xl shadow-sm">
                    <Info size={32} className="text-slate-400 mx-auto mb-3" />
                    <h3 className="text-sm font-bold text-slate-700">No se encontraron estaciones</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
                      Prueba a buscar otro municipio de España como "Madrid", "Barcelona" o "Donostia-San Sebastián".
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN (1/3) - Favorites Sidebar */}
        <div id="favorites-column" className="flex flex-col gap-6">
          <div className="sticky top-24">
            <FavoritesPanel
              favoriteMunicipios={favoriteMunicipios}
              favoriteStations={favoriteStations}
              onSelectMunicipio={handleSelectMunicipio}
              onRemoveMunicipio={handleRemoveFavoriteMunicipio}
              onRemoveStation={handleRemoveFavoriteStation}
              selectedCombustible={selectedCombustible}
            />
          </div>
        </div>

      </main>

      {/* FOOTER */}
      <footer id="main-footer" className="bg-slate-50 border-t border-slate-200 py-8 px-4 md:px-8 mt-12 text-center text-xs text-slate-400 font-medium">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 GasofaBarata ({Gversion}) Datos en tiempo real proporcionados de forma gratuita y pública.</p>
          <div className="flex items-center gap-1.5 text-indigo-600/80">
            <Sparkles size={14} />
            <span>Ahorro inteligente y sostenible en cada viaje</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
