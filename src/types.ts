export interface Gasolinera {
  ideess: number;
  idCCAA: string;
  idMunicipio: number;
  idProvincia: string;
  rotulo: string;
  direccion: string;
  municipio: string;
  cp: string;
  provincia: string;
  latitud: number;
  longitud: number;
  gasoleoA: number;
  gasoleoB: number;
  gasoleoP: number;
  gasolina95: number;
  glp: number;
}

export interface ApiResponse {
  fecha: string;
  datos: Gasolinera[];
}

export type CombustibleKey = "gasolina95" | "gasoleoA" | "gasoleoB" | "gasoleoP" | "glp";

export interface CombustibleMetadata {
  key: CombustibleKey;
  label: string;
  fullName: string;
  colorClass: string; // Tailwind color class for badges/highlighting
  borderClass: string;
  bgClass: string;
  textClass: string;
}

export const COMBUSTIBLES: CombustibleMetadata[] = [
  {
    key: "gasolina95",
    label: "Gasolina 95",
    fullName: "Gasolina 95 E5",
    colorClass: "bg-emerald-600",
    borderClass: "border-emerald-200",
    bgClass: "bg-emerald-50",
    textClass: "text-emerald-700",
  },
  {
    key: "gasoleoA",
    label: "Gasóleo A",
    fullName: "Gasóleo A (Diésel)",
    colorClass: "bg-amber-600",
    borderClass: "border-amber-200",
    bgClass: "bg-amber-50",
    textClass: "text-amber-800",
  },
  {
    key: "gasoleoP",
    label: "Diésel Premium",
    fullName: "Gasóleo Premium / Nuevo Diésel",
    colorClass: "bg-yellow-600",
    borderClass: "border-yellow-200",
    bgClass: "bg-yellow-50",
    textClass: "text-yellow-800",
  },
  {
    key: "gasoleoB",
    label: "Gasóleo B",
    fullName: "Gasóleo B (Agrícola)",
    colorClass: "bg-red-600",
    borderClass: "border-red-200",
    bgClass: "bg-red-50",
    textClass: "text-red-700",
  },
  {
    key: "glp",
    label: "GLP",
    fullName: "Gases Licuados del Petróleo",
    colorClass: "bg-indigo-600",
    borderClass: "border-indigo-200",
    bgClass: "bg-indigo-50",
    textClass: "text-indigo-700",
  },
];
