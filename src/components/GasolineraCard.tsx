import { Gasolinera, CombustibleKey, COMBUSTIBLES } from "../types";
import { Star, MapPin, Navigation, Award, Fuel } from "lucide-react";
import { motion } from "motion/react";

interface GasolineraCardProps {
  key?: number;
  gasolinera: Gasolinera;
  selectedCombustible: CombustibleKey;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  isCheapest: boolean;
}

export default function GasolineraCard({
  gasolinera,
  selectedCombustible,
  isFavorite,
  onToggleFavorite,
  isCheapest,
}: GasolineraCardProps) {
  // Get active combustible details
  const activeCombustible = COMBUSTIBLES.find((c) => c.key === selectedCombustible);
  const activePrice = gasolinera[selectedCombustible];
  const isAvailable = activePrice > 0;

  // Format brand name for generic styling or matching colors
  const getBrandLogo = (brand: string) => {
    const b = brand.toUpperCase();
    if (b.includes("REPSOL")) return { name: "Repsol", bg: "bg-orange-600 text-white" };
    if (b.includes("CEPSA")) return { name: "Cepsa", bg: "bg-red-600 text-white" };
    if (b.includes("SHELL")) return { name: "Shell", bg: "bg-yellow-500 text-slate-900" };
    if (b.includes("BP")) return { name: "BP", bg: "bg-green-600 text-white" };
    if (b.includes("GALP")) return { name: "Galp", bg: "bg-orange-500 text-white" };
    if (b.includes("CAMPSA")) return { name: "Campsa", bg: "bg-blue-600 text-white" };
    if (b.includes("PETRONOR")) return { name: "Petronor", bg: "bg-blue-800 text-white" };
    if (b.includes("AVIA")) return { name: "Avia", bg: "bg-red-50 text-white" };
    if (b.includes("PLENOIL")) return { name: "Plenoil", bg: "bg-yellow-400 text-slate-900" };
    if (b.includes("BALLENOIL")) return { name: "Ballenoil", bg: "bg-blue-500 text-white" };
    if (b.includes("LOW COST") || b.includes("EASY") || b.includes("PETROPRIX")) {
      return { name: brand, bg: "bg-purple-600 text-white" };
    }
    return { name: brand, bg: "bg-slate-600 text-white" };
  };

  const brandInfo = getBrandLogo(gasolinera.rotulo);

  // Maps URL
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${gasolinera.latitud},${gasolinera.longitud}`;

  return (
    <motion.div
      layout
      id={`station-card-${gasolinera.ideess}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.2 }}
      className={`relative flex flex-col md:flex-row md:items-center justify-between p-6 rounded-3xl border transition-all duration-300 ${
        isCheapest && isAvailable
          ? "bg-indigo-600 text-white border-transparent shadow-lg shadow-indigo-100/60 ring-1 ring-indigo-500/10"
          : "bg-white text-slate-800 border-slate-200 hover:border-indigo-200 shadow-sm hover:shadow-md"
      }`}
    >
      {/* Cheapest Badge */}
      {isCheapest && isAvailable && (
        <div id={`badge-cheapest-${gasolinera.ideess}`} className="absolute -top-3 left-4 flex items-center gap-1 bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black text-[10px] px-3 py-1 rounded-full shadow-md tracking-wider uppercase">
          <Award size={12} className="stroke-[2.5]" />
          La más barata
        </div>
      )}

      {/* Info & Details Section */}
      <div className="flex-1 min-w-0 pr-4">
        <div className="flex items-center gap-2 flex-wrap mb-2">
          {/* Brand Icon/Pill */}
          <span
            id={`brand-badge-${gasolinera.ideess}`}
            className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-sm truncate max-w-[150px] ${brandInfo.bg}`}
          >
            {brandInfo.name}
          </span>

          {/* Postal Code / Province Badge */}
          <span
            id={`cp-badge-${gasolinera.ideess}`}
            className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${
              isCheapest && isAvailable
                ? "bg-indigo-700/60 border-indigo-600 text-indigo-100"
                : "bg-slate-100 border-slate-200 text-slate-500"
            }`}
          >
            {gasolinera.cp} | {gasolinera.provincia}
          </span>
        </div>

        {/* Address */}
        <h3
          id={`address-title-${gasolinera.ideess}`}
          className={`text-base font-extrabold tracking-tight leading-snug transition-colors ${
            isCheapest && isAvailable ? "text-white" : "text-slate-800 hover:text-indigo-600"
          }`}
        >
          {gasolinera.direccion}
        </h3>
        <p
          id={`municipio-text-${gasolinera.ideess}`}
          className={`text-xs mt-1 flex items-center gap-1 ${
            isCheapest && isAvailable ? "text-indigo-100/90" : "text-slate-500"
          }`}
        >
          <MapPin size={12} className="shrink-0 opacity-80" />
          {gasolinera.municipio}
        </p>

        {/* Secondary Fuels Grid */}
        <div
          id={`secondary-fuels-${gasolinera.ideess}`}
          className={`flex flex-wrap gap-2 mt-4 pt-3 border-t ${
            isCheapest && isAvailable ? "border-white/10" : "border-slate-100"
          }`}
        >
          {COMBUSTIBLES.map((comb) => {
            if (comb.key === selectedCombustible) return null; // Skip active one since it's prominent
            const price = gasolinera[comb.key];
            if (price === 0) return null; // Skip if unavailable

            return (
              <div
                key={comb.key}
                id={`secondary-fuel-${comb.key}-${gasolinera.ideess}`}
                className={`flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-xl border ${
                  isCheapest && isAvailable
                    ? "bg-indigo-700/40 border-indigo-600/30 text-indigo-100"
                    : "bg-slate-50 border-slate-200/60 text-slate-600"
                }`}
              >
                <span className="opacity-85 font-semibold">{comb.label}:</span>
                <span className="font-mono font-bold">{price.toFixed(3)}€</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Prominent Price & Actions Section */}
      <div
        className={`mt-5 md:mt-0 flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 border-t md:border-t-0 pt-4 md:pt-0 shrink-0 ${
          isCheapest && isAvailable ? "border-white/10" : "border-slate-100"
        }`}
      >
        
        {/* Highlighted Fuel Price */}
        <div id={`highlighted-price-block-${gasolinera.ideess}`} className="text-left md:text-right flex items-center md:block gap-3">
          <div
            className={`text-[10px] font-bold tracking-wider uppercase md:mb-1 flex items-center gap-1 justify-end ${
              isCheapest && isAvailable ? "text-indigo-200" : "text-slate-400"
            }`}
          >
            <Fuel size={12} className={isCheapest && isAvailable ? "text-white" : activeCombustible?.textClass} />
            {activeCombustible?.label}
          </div>
          {isAvailable ? (
            <div className="flex items-baseline gap-1">
              <span
                id={`main-price-${gasolinera.ideess}`}
                className={`text-3.5xl font-black font-mono tracking-tight ${
                  isCheapest && isAvailable ? "text-white italic" : activeCombustible?.textClass
                }`}
              >
                {activePrice.toFixed(3)}
              </span>
              <span className={`text-xs font-bold ${isCheapest && isAvailable ? "text-indigo-200" : "text-slate-400"}`}>€/L</span>
            </div>
          ) : (
            <span
              id={`main-price-unavailable-${gasolinera.ideess}`}
              className={`text-xs font-bold italic px-2.5 py-1 rounded-lg border ${
                isCheapest && isAvailable
                  ? "bg-indigo-700/40 border-indigo-600/30 text-indigo-200"
                  : "bg-slate-50 border-slate-200 text-slate-400"
              }`}
            >
              No disponible
            </span>
          )}
        </div>

        {/* Buttons */}
        <div id={`actions-block-${gasolinera.ideess}`} className="flex items-center gap-2">
          {/* Maps Navigation */}
          <a
            id={`btn-nav-maps-${gasolinera.ideess}`}
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Cómo llegar (Google Maps)"
            className={`flex items-center gap-1.5 font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-sm ${
              isCheapest && isAvailable
                ? "bg-white hover:bg-indigo-50 text-indigo-700 hover:shadow-md"
                : "bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-indigo-100"
            }`}
          >
            <Navigation size={14} className={isCheapest && isAvailable ? "text-indigo-600" : "text-indigo-200"} />
            <span>Cómo llegar</span>
          </a>

          {/* Favorite Toggle */}
          <button
            id={`btn-fav-toggle-${gasolinera.ideess}`}
            onClick={onToggleFavorite}
            title={isFavorite ? "Quitar de favoritas" : "Marcar como favorita"}
            className={`p-2 rounded-xl border transition-all duration-200 cursor-pointer ${
              isCheapest && isAvailable
                ? isFavorite
                  ? "bg-amber-400 border-amber-400 text-slate-900"
                  : "bg-indigo-700/50 hover:bg-indigo-700 border-indigo-500/30 text-indigo-200 hover:text-white"
                : isFavorite
                  ? "bg-amber-50 border-amber-200 text-amber-600 shadow-sm"
                  : "bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Star size={15} fill={isFavorite ? "currentColor" : "none"} className={isFavorite ? "scale-110" : ""} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
