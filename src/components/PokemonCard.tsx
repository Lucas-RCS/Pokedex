import { useState, useEffect } from "react";
import { Pokemon } from "../types";
import {
  pokemonApi,
  getOfficialArtworkUrl,
  extractIdFromUrl,
} from "../services/api";
import { TYPE_COLORS, TYPE_TRANSLATIONS } from "../constants";
import { SparkleIcon } from "@phosphor-icons/react";

interface PokemonCardProps {
  id: number;
  name: string;
  onViewDetails: (pokemon: Pokemon) => void;
  onToggleTeam?: (pokemonId: number) => void;
  isInTeam?: boolean;
  key?: any;
}

function getGenerationLabel(id: number): string {
  if (id <= 151) return "GEN 1";
  if (id <= 251) return "GEN 2";
  if (id <= 386) return "GEN 3";
  if (id <= 493) return "GEN 4";
  if (id <= 649) return "GEN 5";
  if (id <= 721) return "GEN 6";
  if (id <= 809) return "GEN 7";
  if (id <= 898) return "GEN 8";
  return "GEN 9";
}

function humanizePokemonName(value: string): string {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function PokemonCard({
  id,
  name,
  onViewDetails,
  onToggleTeam,
  isInTeam = false,
}: PokemonCardProps) {
  const [details, setDetails] = useState<Pokemon | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Load details in background lazily
  useEffect(() => {
    let active = true;
    pokemonApi
      .getPokemonDetails(name || id)
      .then((data) => {
        if (active) {
          setDetails(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error(`Failed to loadDetails for card: ${name}`, err);
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, name]);

  const primaryType = details?.types[0]?.type.name || "normal";
  const primaryColor = TYPE_COLORS[primaryType] || "#A8A77A";

  const displayDexId = details?.species?.url
    ? extractIdFromUrl(details.species.url)
    : (details?.id ?? id);
  const formattedId = `#${String(displayDexId).padStart(3, "0")}`;
  const capitalizedName = humanizePokemonName(name);
  const artworkUrl =
    details?.sprites.other?.["official-artwork"]?.front_default ||
    details?.sprites.front_default ||
    getOfficialArtworkUrl(details?.id ?? id);
  const genLabel = getGenerationLabel(displayDexId);

  return (
    <div
      onClick={() => details && onViewDetails(details)}
      className="group relative cursor-pointer overflow-hidden rounded-3xl bg-slate-900 border border-slate-800/80 transition-all duration-300 hover:-translate-y-2 hover:border-slate-700 shadow-lg flex flex-col justify-between"
      style={{
        boxShadow:
          "0 10px 30px -10px rgba(0, 0, 0, 0.4), 0 1px 3px 0 rgba(0, 0, 0, 0.2)",
      }}
    >
      {/* Background ambient circular overlay for type branding */}
      <div
        className="absolute -right-16 -top-16 h-36 w-36 rounded-full opacity-10 blur-2xl transition-all duration-500 group-hover:scale-125"
        style={{ backgroundColor: primaryColor }}
      />

      {/* Top Accent Strip of exact type color */}
      <div
        className="h-1.5 w-full transition-colors duration-500"
        style={{ backgroundColor: primaryColor }}
      />

      <div className="p-4 flex flex-col h-full justify-between">
        {/* Card Header ID & Gen Label */}
        <div className="flex items-center justify-between mb-2 pb-1.5">
          <span className="font-mono text-[10px] font-black text-slate-500 tracking-wider">
            {formattedId}
          </span>
          <span className="text-[9px] bg-slate-800 font-extrabold px-1.5 py-0.5 rounded text-slate-400 tracking-wide font-mono uppercase">
            {genLabel}
          </span>
        </div>

        {/* Thumbnail Stage */}
        <div className="relative flex items-center justify-center h-28 my-1 bg-slate-950/40 rounded-2xl border border-slate-800/40 group-hover:bg-slate-950/60 transition-colors duration-300">
          <div
            className="absolute h-20 w-20 rounded-full border border-dashed text-slate-700 opacity-30 animate-spin-slow group-hover:opacity-30"
            style={{ borderColor: `${primaryColor}` }}
          />

          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-700 border-t-indigo-500" />
            </div>
          )}

          <img
            src={artworkUrl}
            alt={capitalizedName}
            referrerPolicy="no-referrer"
            onLoad={() => setImageLoaded(true)}
            className={`h-24 w-24 object-contain transition-all duration-500 z-10 group-hover:scale-110 group-hover:-rotate-2 ${
              imageLoaded
                ? "scale-100 opacity-100 animate-fade-in"
                : "scale-75 opacity-0"
            }`}
          />

          {/* Quick Team Member Spotlight Badge */}
          {isInTeam && (
            <div
              className="absolute bottom-2 right-2 bg-indigo-600 text-white rounded-full p-1 shadow-sm border border-slate-950"
              title="Membro da Equipe Ativo"
            >
              <SparkleIcon
                weight="fill"
                className="h-2.5 w-2.5 animate-pulse"
              />
            </div>
          )}
        </div>

        {/* Brand Body info */}
        <div className="mt-3 space-y-1">
          <h3 className="font-display text-sm md:text-base font-extrabold text-slate-200 group-hover:text-white transition-colors duration-200 truncate capitalize leading-tight">
            {capitalizedName}
          </h3>

          {/* Type Badges bottom (No duplication) */}
          <div className="flex flex-wrap gap-1">
            {loading ? (
              <div className="h-4 w-12 bg-slate-800 animate-pulse rounded-lg" />
            ) : (
              details?.types.map((typeObj) => {
                const tName = typeObj.type.name;
                const tColor = TYPE_COLORS[tName] || "#A8A77A";
                return (
                  <span
                    key={tName}
                    className="px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider text-white"
                    style={{ backgroundColor: tColor }}
                  >
                    {TYPE_TRANSLATIONS[tName] || tName}
                  </span>
                );
              })
            )}
          </div>
        </div>

        {/* Added rich information section (Only stats & physical properties) */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
          {loading ? (
            <div className="w-full space-y-1">
              <div className="h-3 bg-slate-800 animate-pulse rounded w-full" />
            </div>
          ) : (
            <div className="flex items-center justify-between w-full font-mono text-[10px]">
              <div className="flex flex-col">
                <span className="text-[8px] text-slate-500 font-extrabold uppercase">
                  Altura
                </span>
                <span className="text-slate-300 font-bold">
                  {(details!.height / 10).toFixed(1)} m
                </span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-[8px] text-slate-500 font-extrabold uppercase">
                  Peso
                </span>
                <span className="text-slate-300 font-bold">
                  {(details!.weight / 10).toFixed(1)} kg
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
