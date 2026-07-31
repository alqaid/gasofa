// @ts-nocheck
import { Gasolinera, CombustibleKey, COMBUSTIBLES } from "../types";
import { Star, MapPin, Trash2, ArrowUpRight, Flame } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface FavoritesPanelProps {
  favoriteMunicipios: string[];
  favoriteStations: Gasolinera[];
  onSelectMunicipio: (name: string) => void;
  onRemoveMunicipio: (name: string) => void;
  onRemoveStation: (ideess: number) => void;
  selectedCombustible: CombustibleKey;
}

export default function FavoritesPanel({
  favoriteMunicipios,
  favoriteStations,
  onSelectMunicipio,
  onRemoveMunicipio,
  onRemoveStation,
  selectedCombustible,
}: FavoritesPanelProps) {
  const activeComb = COMBUSTIBLES.find((c) => c.key === selectedCombustible);

  return (
    <div id="favorites-panel-container" className="flex flex-col gap-6">
      
      {/* Favorite Municipalities Section */}
      <div id="fav-municipalities-section" className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm">
        <h2 className="text-sm font-black uppercase tracking-wider mb-4 flex items-center gap-2 text-slate-800">
          <span className="w-1.5 h-4 bg-indigo-600 rounded-full shrink-0"></span>
          <span>Municipios Guardados</span>
        </h2>

        {favoriteMunicipios.length === 0 ? (
          <div className="text-center py-6 px-4 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
            <p className="text-xs text-slate-500 font-bold">No tienes municipios guardados.</p>
            <p className="text-[10px] text-slate-400 mt-1">Busca un municipio y márcalo con la estrella para guardarlo.</p>
          </div>
        ) : (
          <div id="fav-municipalities-chips" className="flex flex-col gap-2">
            <AnimatePresence>
              {favoriteMunicipios.map((mun) => (
                <motion.div
                  key={mun}
                  id={`fav-municipio-chip-${mun}`}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center justify-between p-3 rounded-2xl bg-indigo-50/60 hover:bg-indigo-50 border border-indigo-100/60 hover:border-indigo-100 transition-all duration-150 group"
                >
                  <button
                    id={`fav-mun-select-btn-${mun}`}
                    onClick={() => onSelectMunicipio(mun)}
                    className="text-xs font-bold text-indigo-900 hover:text-indigo-950 transition-colors cursor-pointer text-left flex items-center gap-2 truncate flex-1"
                  >
                    <MapPin size={13} className="text-indigo-500 shrink-0" />
                    <span className="truncate">{mun}</span>
                    <ArrowUpRight size={13} className="text-indigo-400 group-hover:text-indigo-600 transition-colors shrink-0" />
                  </button>
                  <button
                    id={`fav-mun-remove-btn-${mun}`}
                    onClick={() => onRemoveMunicipio(mun)}
                    title="Eliminar de favoritos"
                    className="p-1 rounded-lg hover:bg-red-100/80 text-slate-400 hover:text-red-600 transition-colors cursor-pointer ml-1"
                  >
                    <Trash2 size={13} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Favorite Stations Section */}
      <div id="fav-stations-section" className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm">
        <h2 className="text-sm font-black uppercase tracking-wider mb-4 flex items-center gap-2 text-slate-800">
          <span className="w-1.5 h-4 bg-indigo-600 rounded-full shrink-0"></span>
          <span>Mis Estaciones</span>
        </h2>

        {favoriteStations.length === 0 ? (
          <div className="text-center py-8 px-4 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
            <p className="text-xs text-slate-500 font-bold">No tienes estaciones guardadas.</p>
            <p className="text-[10px] text-slate-400 mt-1">Pulsa en la estrella de una estación en los resultados de búsqueda para fijarla aquí.</p>
          </div>
        ) : (
          <div id="fav-stations-list" className="flex flex-col gap-3">
            <AnimatePresence>
              {favoriteStations.map((station) => {
                const price = station[selectedCombustible];
                const isAvailable = price > 0;

                return (
                  <motion.div
                    key={station.ideess}
                    id={`fav-station-item-${station.ideess}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col gap-2 p-3.5 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-2xl transition-all group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap mb-1">
                          <span className="text-[9px] font-black uppercase bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                            {station.rotulo.split(" ")[0]}
                          </span>
                          <span className="text-[9px] text-slate-400 font-medium truncate max-w-[100px]">
                            {station.municipio}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                          {station.direccion}
                        </h4>
                      </div>
                      <button
                        id={`fav-station-remove-${station.ideess}`}
                        onClick={() => onRemoveStation(station.ideess)}
                        title="Quitar de favoritos"
                        className="p-1 rounded-lg hover:bg-red-100/80 text-slate-400 hover:text-red-500 transition-colors shrink-0 cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-1 pt-2 border-t border-slate-200/60">
                      {/* Price under active fuel */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-400 font-semibold">{activeComb?.label}:</span>
                        {isAvailable ? (
                          <span className={`text-xs font-black font-mono ${activeComb?.textClass}`}>
                            {price.toFixed(3)} €/L
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">No disponible</span>
                        )}
                      </div>

                      {/* Search parent municipality button */}
                      <button
                        id={`fav-station-search-parent-${station.ideess}`}
                        onClick={() => onSelectMunicipio(station.municipio)}
                        className="flex items-center gap-0.5 text-[10px] text-indigo-600 hover:text-indigo-700 font-bold cursor-pointer"
                      >
                        <span>Ver localidad</span>
                        <ArrowUpRight size={10} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

    </div>
  );
}
