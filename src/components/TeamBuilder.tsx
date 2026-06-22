import { useState, useEffect } from "react";
import { Pokemon } from "../types";
import { pokemonApi, getOfficialArtworkUrl } from "../services/api";
import { TYPE_COLORS, TYPE_TRANSLATIONS } from "../constants";
import { encodeTeam } from "../utils/sharing";
import {
  TrashSimpleIcon,
  ShareNetworkIcon,
  CheckIcon,
  TrophyIcon,
  UsersIcon,
  EyeIcon,
} from "@phosphor-icons/react";

interface TeamBuilderProps {
  teamPokemonIds: number[];
  onRemovePokemon: (id: number) => void;
  onViewDetails: (pokemon: Pokemon) => void;
  onBackToCatalog?: () => void;
}

const EMOJI_OPTIONS = ["🎒", "🔥", "💧", "⚡️", "🔋", "🏆", "🌟", "⚔️", "👑"];
const THEME_COLORS = [
  {
    name: "Vermelho Pokémon",
    value: "red",
    hex: "#EF4444",
    border: "border-red-500",
    shadow: "shadow-red-500/20",
    glow: "from-red-500/10 to-transparent",
    hoverText: "hover:text-red-400",
  },
  {
    name: "Azul Great",
    value: "blue",
    hex: "#3B82F6",
    border: "border-blue-500",
    shadow: "shadow-blue-500/20",
    glow: "from-blue-500/10 to-transparent",
    hoverText: "hover:text-blue-400",
  },
  {
    name: "Dourado Ultra",
    value: "yellow",
    hex: "#EAB308",
    border: "border-yellow-500",
    shadow: "shadow-yellow-500/20",
    glow: "from-yellow-500/10 to-transparent",
    hoverText: "hover:text-yellow-400",
  },
  {
    name: "Roxo Psíquico",
    value: "purple",
    hex: "#dc55f7",
    border: "border-purple-500",
    shadow: "shadow-purple-500/20",
    glow: "from-purple-500/10 to-transparent",
    hoverText: "hover:text-purple-400",
  },
  {
    name: "Verde Planta",
    value: "green",
    hex: "#19a36a",
    border: "border-emerald-500",
    shadow: "shadow-emerald-500/20",
    glow: "from-emerald-500/10 to-transparent",
    hoverText: "hover:text-emerald-400",
  },
  {
    name: "Laranja Fogo",
    value: "orange",
    hex: "#f97316",
    border: "border-orange-500",
    shadow: "shadow-orange-500/20",
    glow: "from-orange-500/10 to-transparent",
    hoverText: "hover:text-orange-400",
  },
];

export function TeamBuilder({
  teamPokemonIds,
  onRemovePokemon,
  onViewDetails,
  onBackToCatalog,
}: TeamBuilderProps) {
  const [teamName, setTeamName] = useState(() => {
    return localStorage.getItem("pokedex_team_name") || "Minha Equipe Pokémon";
  });
  const [teamIcon, setTeamIcon] = useState(() => {
    return localStorage.getItem("pokedex_team_icon") || "🎒";
  });
  const [teamColor, setTeamColor] = useState(() => {
    return localStorage.getItem("pokedex_team_color") || "red";
  });

  const [resolvedPokemon, setResolvedPokemon] = useState<Pokemon[]>([]);
  const [copied, setCopied] = useState(false);

  // Hydrate full Pokemon details for the team members
  useEffect(() => {
    if (teamPokemonIds.length === 0) {
      setResolvedPokemon([]);
      return;
    }

    pokemonApi
      .getPokemonDetailsBatch(teamPokemonIds)
      .then((data) => {
        const ordered = teamPokemonIds
          .map((id) => data.find((p) => p.id === id))
          .filter((p): p is Pokemon => p !== undefined);
        setResolvedPokemon(ordered);
      })
      .catch((err) => {
        console.error("Failed to load batch team pokemon properties:", err);
      });
  }, [teamPokemonIds]);

  // Sync state metadata properties to localStorage
  useEffect(() => {
    localStorage.setItem("pokedex_team_name", teamName);
  }, [teamName]);

  useEffect(() => {
    localStorage.setItem("pokedex_team_icon", teamIcon);
  }, [teamIcon]);

  useEffect(() => {
    localStorage.setItem("pokedex_team_color", teamColor);
  }, [teamColor]);

  // Remove a Pokémon from the team list
  const handleRemove = (id: number) => {
    onRemovePokemon(id);
  };

  // Generate Compressed URL & Copy to Clipboard
  const handleShareTeam = () => {
    if (teamPokemonIds.length === 0) return;

    const base64Data = encodeTeam({
      name: teamName,
      icon: teamIcon,
      color: teamColor,
      pokemonIds: teamPokemonIds,
    });

    const shareUrl = `${window.location.origin}${window.location.pathname}?data=${encodeURIComponent(base64Data)}`;
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      })
      .catch((err) => {
        console.error("Clipboard copy failed:", err);
      });
  };

  const selectedTheme =
    THEME_COLORS.find((t) => t.value === teamColor) || THEME_COLORS[0];

  // Advanced analysis: dominant type
  const typeCounts: Record<string, number> = {};
  resolvedPokemon.forEach((p) => {
    p.types.forEach((t) => {
      typeCounts[t.type.name] = (typeCounts[t.type.name] || 0) + 1;
    });
  });

  let dominantType = "Nenhum";
  let maxCount = 0;
  Object.entries(typeCounts).forEach(([type, count]) => {
    if (count > maxCount) {
      maxCount = count;
      dominantType = type;
    }
  });

  // Average stats calculation
  const totalStatsSum = resolvedPokemon.reduce((acc, p) => {
    const pSum = p.stats.reduce((sAcc, s) => sAcc + s.base_stat, 0);
    return acc + pSum;
  }, 0);
  const avgStatScore =
    resolvedPokemon.length > 0
      ? Math.round(totalStatsSum / resolvedPokemon.length)
      : 0;

  return (
    <section
      id="team-builder-section"
      className={`w-full rounded-3xl bg-slate-900/90 border border-slate-800 p-6 md:p-8 overflow-hidden relative shadow-2xl transition-all duration-300 ${selectedTheme.shadow}`}
    >
      {/* Background glow overlay */}
      <div
        className="absolute -right-24 -top-24 h-64 w-64 rounded-full blur-[90px] opacity-15 transition-colors duration-500 pointer-events-none"
        style={{ backgroundColor: selectedTheme.hex }}
      />

      <div
        className="absolute -left-24 -bottom-24 h-64 w-64 rounded-full blur-[90px] opacity-10 transition-colors duration-500 pointer-events-none"
        style={{ backgroundColor: selectedTheme.hex }}
      />

      {/* Decorative vertical stripe */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1.5 transition-colors duration-500"
        style={{ backgroundColor: selectedTheme.hex }}
      />

      {/* Workspace Branding Section & Customization Row */}
      <div className="pb-6 border-b border-slate-800/80 mb-6 pl-2 space-y-5">
        {/* Header indicator */}
        <div className="space-y-1">
          <span className="text-[10px] text-indigo-400 font-extrabold tracking-widest uppercase font-mono flex items-center gap-1.5">
            <UsersIcon className="h-4 w-4" /> Painel de Customização de Equipe
          </span>
          <p className="text-[11px] text-slate-400 leading-tight">
            Escolha o nome, o ícone representativo e a cor do tema da sua
            equipe.
          </p>
        </div>

        {/* Organized Controls Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* 1. Team Name Input card (Col span 5) */}
          <div className="col-span-12 xl:col-span-5 space-y-2">
            <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest font-mono">
              Identidade da Equipe
            </span>
            <div className="flex items-center gap-1 bg-slate-950/40 border border-slate-800 p-2 rounded-2xl transition-all duration-300 hover:border-slate-700/80 shadow-inner">
              <span
                role="img"
                aria-label="team icon"
                className="text-1xl p-1 select-none shadow-sm shrink-0"
              >
                {teamIcon}
              </span>
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value.slice(0, 32))}
                  placeholder="Nome da Equipe..."
                  className="bg-transparent text-lg md:text-sm font-display font-black text-white focus:bg-slate-900/40 p-2 rounded-lg border border-dashed border-transparent hover:border-slate-800 focus:border-indigo-500/50 focus:outline-none transition-all w-full leading-none truncate"
                  title="Clique para editar o nome da equipe"
                />
              </div>
            </div>
          </div>

          {/* 2. Emojis Selector Grid (Col span 4) */}
          <div className="col-span-12 md:col-span-7 xl:col-span-4 space-y-2">
            <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest font-mono">
              Ícone Decorativo
            </span>
            <div className="flex flex-wrap gap-1.5 bg-slate-950/40 p-2.5 rounded-2xl border border-slate-800">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setTeamIcon(emoji)}
                  className={`h-8 w-8 flex items-center justify-center rounded-lg transition-all text-sm hover:scale-115 active:scale-95 cursor-pointer ${
                    teamIcon === emoji
                      ? "bg-indigo-600 shadow-lg text-white font-extrabold scale-105"
                      : "opacity-45 hover:opacity-100 text-slate-300 bg-slate-900 border border-slate-800/40"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Theme Color Selector (Col span 3) */}
          <div className="col-span-12 md:col-span-5 xl:col-span-3 space-y-2">
            <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest font-mono select-none">
              Paleta do Banner
            </span>
            <div className="flex gap-2 bg-slate-950/40 p-3 rounded-2xl border border-slate-800 theme-selector-group flex-wrap sm:flex-nowrap md:flex-wrap lg:flex-nowrap xl:flex-wrap">
              {THEME_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setTeamColor(color.value)}
                  title={color.name}
                  className="h-7 w-7 rounded-full relative flex items-center justify-center border border-slate-800 cursor-pointer shadow-md transform hover:scale-115 active:scale-95 transition-all duration-200"
                  style={{ backgroundColor: color.hex }}
                >
                  {teamColor === color.value && (
                    <div className="h-2 w-2 rounded-full bg-white shadow animate-pulse" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Team Insights Panel (Type analysis / stats summary but removed help box card) */}
      {resolvedPokemon.length > 0 && (
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3 pl-2">
          {/* Total stats rating card */}
          <div className="bg-slate-950/30 border border-slate-800/80 rounded-xl p-3 flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-indigo-950/60 border border-indigo-900/65 flex items-center justify-center text-indigo-400">
              <TrophyIcon className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[9px] text-slate-400 font-extrabold uppercase font-mono block">
                Média de Atributos
              </span>
              <span className="text-sm font-black text-white">
                {avgStatScore} PTS
              </span>
            </div>
          </div>

          {/* Dominant Type rating card */}
          <div className="bg-slate-950/30 border border-slate-800/80 rounded-xl p-3 flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-pink-950/60 border border-pink-900/65 flex items-center justify-center text-pink-400 font-mono text-xs font-bold leading-none">
              Ω
            </div>
            <div>
              <span className="text-[9px] text-slate-400 font-extrabold uppercase font-mono block">
                Tipo Predominante
              </span>
              <span className="text-sm font-black text-white capitalize">
                {TYPE_TRANSLATIONS[dominantType] || dominantType}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Slots grid representation: Always 6 interactive slots */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 py-2 pl-2">
        {Array.from({ length: 6 }).map((_, index) => {
          const pokemon = resolvedPokemon[index];
          const isEmpty = !pokemon;

          if (isEmpty) {
            return (
              <div
                key={`empty-slot-${index}`}
                onClick={onBackToCatalog}
                className="group border border-dashed border-slate-700/80 rounded-2xl flex flex-col items-center justify-center p-5 h-48 bg-slate-950/20 hover:bg-slate-950/40 hover:border-indigo-500/80 transition-all duration-300 cursor-pointer"
              >
                <div className="h-10 w-10 rounded-full border border-dashed border-slate-700 flex items-center justify-center text-slate-400 mb-2 group-hover:border-indigo-500 group-hover:text-indigo-400 transition-all duration-300">
                  <span className="text-lg font-light">+</span>
                </div>
                <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase block font-mono">
                  Slot #{index + 1} Vazio
                </span>
                <span className="text-[9px] text-slate-300 font-bold text-center mt-1 scale-95 opacity-80 group-hover:opacity-100 transition-opacity">
                  Vincular no catálogo
                </span>
              </div>
            );
          }

          const primaryTypeName = pokemon.types[0]?.type.name || "normal";
          const pColor = TYPE_COLORS[primaryTypeName] || "#A8A77A";

          return (
            <div
              key={pokemon.id}
              onClick={() => onViewDetails(pokemon)}
              className="relative rounded-2xl bg-slate-955/40 border border-slate-800 p-4 h-48 flex flex-col justify-between items-center text-center transition-all duration-305 cursor-pointer hover:scale-[1.03] group hover:border-slate-700 hover:bg-slate-955/80 overflow-hidden"
              style={{
                boxShadow: `inset 0 -3px 0 0 ${pColor}50`,
              }}
              title="Clique para ver detalhes do Pokémon"
            >
              {/* Top Slot Header: ID & Delete */}
              <div className="w-full flex items-center justify-between text-slate-300 relative z-10">
                <span className="font-mono text-[9px] font-bold text-slate-400 tracking-wider">
                  #{String(pokemon.id).padStart(3, "0")}
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(pokemon.id);
                  }}
                  title="Remover combatente"
                  className="p-1 rounded-md text-slate-400 hover:bg-red-955 hover:text-red-400 transition-all cursor-pointer"
                >
                  <TrashSimpleIcon className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Artwork Figure */}
              <div className="relative h-20 w-20 flex items-center justify-center my-0.5">
                <div
                  className="absolute inset-0 rounded-full blur-xl opacity-15 scale-90"
                  style={{ backgroundColor: pColor }}
                />

                <div className="absolute inset-0 hidden group-hover:flex items-center justify-center bg-slate-950/80 rounded-full z-20 transition-all shadow-md duration-300 border border-slate-800 scale-95">
                  <EyeIcon className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
                </div>

                <img
                  src={getOfficialArtworkUrl(pokemon.id)}
                  alt={pokemon.name}
                  referrerPolicy="no-referrer"
                  className="h-16 w-16 object-contain z-10 transition-transform duration-300 group-hover:scale-110"
                />
              </div>

              {/* Pokemon Title Name string */}
              <div className="text-center w-full mt-1">
                <span className="font-display font-black text-white capitalize text-sm block leading-tight truncate">
                  {pokemon.name}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  {TYPE_TRANSLATIONS[primaryTypeName] || primaryTypeName}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Share Action bar & links */}
      <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col md:flex-row md:items-center md:justify-between gap-4 pl-2">
        <div className="flex items-center gap-2 text-xs text-slate-300 font-bold font-mono">
          <span className="text-indigo-400 font-extrabold bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800/80">
            {teamPokemonIds.length} / 6 POSIÇÕES
          </span>
          <span>ocupadas na formação ativa.</span>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto font-mono">
          {copied && (
            <span className="text-xs text-indigo-300 font-bold px-3 py-1 bg-indigo-950/40 rounded-lg border border-indigo-900/60 flex items-center gap-1.5">
              <CheckIcon className="h-3.5 w-3.5" /> Link copiado!
            </span>
          )}

          <button
            onClick={handleShareTeam}
            disabled={teamPokemonIds.length === 0}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all shadow-md cursor-pointer hover:-translate-y-0.5 active:translate-y-0 ${
              teamPokemonIds.length > 0
                ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/10"
                : "bg-slate-800/50 text-slate-450 border border-slate-800 cursor-not-allowed opacity-50"
            }`}
          >
            <ShareNetworkIcon className="h-4 w-4" />
            Copiar Link da Equipe
          </button>
        </div>
      </div>
    </section>
  );
}
