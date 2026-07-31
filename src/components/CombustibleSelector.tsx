import { CombustibleKey, COMBUSTIBLES } from "../types";
import { Fuel } from "lucide-react";

interface CombustibleSelectorProps {
  selectedCombustible: CombustibleKey;
  onChange: (key: CombustibleKey) => void;
}

export default function CombustibleSelector({ selectedCombustible, onChange }: CombustibleSelectorProps) {
  return (
    <div id="combustible-selector-container" className="flex flex-col gap-2.5">
      <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-500 tracking-wider">
        <Fuel size={14} className="text-indigo-600" />
        <span>Tipo de Combustible</span>
      </div>
      <div id="fuel-tabs-list" className="grid grid-cols-2 md:grid-cols-5 gap-2 bg-slate-100/85 p-1.5 rounded-2xl border border-slate-200">
        {COMBUSTIBLES.map((comb) => {
          const isActive = selectedCombustible === comb.key;

          return (
            <button
              key={comb.key}
              id={`fuel-tab-btn-${comb.key}`}
              onClick={() => onChange(comb.key)}
              className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-white border border-slate-200 text-indigo-600 font-bold shadow-sm scale-[1.02]"
                  : "bg-transparent border border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              {/* Colored Dot Indicator */}
              <div className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${comb.colorClass}`} />
                <span className={`text-xs tracking-tight font-bold ${isActive ? "text-indigo-900" : "text-slate-700"}`}>{comb.label}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium mt-0.5 max-w-full truncate">
                {comb.fullName.split(" (")[1]?.replace(")", "") || comb.fullName}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
