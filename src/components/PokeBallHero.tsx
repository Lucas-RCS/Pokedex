import { useState, useEffect, useRef } from "react";
import {
  POKEBALLS_THEMED_CONFIGS,
  PokeballTheme,
  TYPE_COLORS,
} from "../constants";
import pokeBallRed from "../assets/imgs/img-pokeball-red.png";
import pokeBallGreat from "../assets/imgs/img-pokeball-great.png";
import pokeBallUltra from "../assets/imgs/img-pokeball-ultra.png";
import logo from "../assets/imgs/logo_black.png";

const POKEBALL_IMAGES: Record<string, string> = {
  red: pokeBallRed,
  blue: pokeBallGreat,
  yellow: pokeBallUltra,
};
import {
  MagnifyingGlassIcon,
  SparkleIcon,
  BookOpenIcon,
  UsersIcon,
  SlidersHorizontalIcon,
  TrashSimpleIcon,
} from "@phosphor-icons/react";
import { CustomSelect, SelectOption } from "../utils/CustomSelect";

interface PokeBallHeroProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedType: string;
  onTypeChange: (type: string) => void;
  selectedGeneration: string;
  onGenerationChange: (gen: string) => void;
  sortBy: string;
  onSortByChange: (
    sortBy: "id-asc" | "id-desc" | "name-asc" | "name-desc",
  ) => void;
  allTypes: string[];
  totalPokemonCount: number;
  activeTeamCount: number;
  activeTab: "catalog" | "team";
  onTabChange: (tab: "catalog" | "team") => void;
  onClearAllFilters: () => void;
}

export function PokeBallHero({
  searchQuery,
  onSearchChange,
  selectedType,
  onTypeChange,
  selectedGeneration,
  onGenerationChange,
  allTypes,
  activeTeamCount,
  activeTab,
  onTabChange,
  onClearAllFilters,
}: PokeBallHeroProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const autoPlayRef = useRef<boolean>(true);

  // Auto-play interval for the Pokéball carousel
  useEffect(() => {
    const timer = setInterval(() => {
      if (autoPlayRef.current) {
        setActiveIndex((prev) => (prev + 1) % POKEBALLS_THEMED_CONFIGS.length);
      }
    }, 6000);

    return () => clearInterval(timer);
  }, []);

  const activeTheme: PokeballTheme = POKEBALLS_THEMED_CONFIGS[activeIndex];

  const handleSelectBall = (index: number) => {
    setActiveIndex(index);
    autoPlayRef.current = false;
    setTimeout(() => {
      autoPlayRef.current = true;
    }, 10000);
  };

  // Get dynamic premium dark gradient for the seamless look
  const getThemeGradient = (colorName: string) => {
    switch (colorName) {
      case "red":
        return "from-[#020205] via-[#ef4444]/60 to-[#ef4444]/100";
      case "blue":
        return "from-[#020205] via-[#3b82f6]/60 to-[#3b82f6]/100";
      case "yellow":
        return "from-[#020205] via-[#eab308]/60 to-[#eab308]/100";
      default:
        return "from-[#020205] to-slate-900";
    }
  };

  const getThemeHighlightColor = (colorName: string) => {
    switch (colorName) {
      case "red":
        return "rgba(239, 68, 68, 0.4)";
      case "blue":
        return "rgba(59, 130, 246, 0.4)";
      case "yellow":
        return "rgba(234, 179, 8, 0.4)";
      default:
        return "rgba(148, 163, 184, 0.2)";
    }
  };

  const allTypesPTBR: Record<string, string> = {
    normal: "Normal",
    fire: "Fogo",
    water: "Água",
    electric: "Elétrico",
    grass: "Grama",
    ice: "Gelo",
    fighting: "Lutador",
    poison: "Veneno",
    ground: "Terra",
    flying: "Voador",
    psychic: "Psíquico",
    bug: "Inseto",
    rock: "Pedra",
    ghost: "Fantasma",
    dragon: "Dragão",
    dark: "Sombrio",
    steel: "Aço",
    fairy: "Fada",
  };

  const isAnyFilterActive =
    searchQuery !== "" || selectedType !== "" || selectedGeneration !== "all";

  const typeOptions: SelectOption[] = [
    { value: "", label: "Todos os Tipos" },
    ...allTypes.map((type) => ({
      value: type,
      label: allTypesPTBR[type] || type,
      color: TYPE_COLORS[type],
    })),
  ];

  const generationOptions: SelectOption[] = [
    { value: "all", label: "Todas as Gerações" },
    { value: "1", label: "Geração 1 (Kanto • #1-151)" },
    { value: "2", label: "Geração 2 (Johto • #152-251)" },
    { value: "3", label: "Geração 3 (Hoenn • #252-386)" },
    { value: "4", label: "Geração 4 (Sinnoh • #387-493)" },
    { value: "5", label: "Geração 5 (Unova • #494-649)" },
    { value: "6", label: "Geração 6 (Kalos • #650-721)" },
    { value: "7", label: "Geração 7 (Alola • #722-809)" },
    { value: "8", label: "Geração 8 (Galar • #810-898)" },
    { value: "9", label: "Geração 9 (Paldea • #899-1025)" },
  ];

  return (
    <header
      id="hero-header-stage"
      className={`relative w-full text-white overflow-hidden transition-all duration-1000 ease-in-out bg-gradient-to-b ${getThemeGradient(activeTheme.colorName)} pb-12 pt-6 shadow-md`}
    >
      {/* Dynamic Colored Radial Ambient Blur Overlay */}
      <div
        className="absolute bottom-0 right-1/4 h-[350px] w-[350px] rounded-full blur-[120px] pointer-events-none transition-all duration-1000"
        style={{
          backgroundColor: getThemeHighlightColor(activeTheme.colorName),
        }}
      />

      {/* Decorative cyber grid pattern overlays and light leaks */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:16px_16px] opacity-60 pointer-events-none" />

      {/* Main Container constrained */}
      <div className="relative max-w-7xl mx-auto z-10 px-4 md:px-8 space-y-8">
        {/* 1. Header Area with Logo Brand & Screen Selector */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-5 py-2 border-b border-white/5">
          {/* Logo Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="h-15 w-15 p-3 rounded-2xl bg-gradient-to-tr from-red-600 to-red-400 flex items-center justify-center text-white font-black shadow-lg shadow-red-500/25 transform hover:rotate-12 transition-transform duration-300">
              <img src={logo} alt="Pokedex Logo" />
            </div>
            <div>
              <h1 className="font-display font-black text-xl text-white tracking-tight flex items-center gap-2">
                Pokedex
              </h1>
            </div>
          </div>

          {/* Navigation Screen Tab Switcher */}
          <nav className="flex items-center bg-white/5 p-1 rounded-2xl border border-white/10 backdrop-blur-md">
            <button
              onClick={() => onTabChange("catalog")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold tracking-wide cursor-pointer transition-all duration-300 ${
                activeTab === "catalog"
                  ? "bg-white text-slate-900 shadow-lg"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <BookOpenIcon className="h-3.5 w-3.5" />
              Catálogo Pokédex
            </button>
            <button
              onClick={() => onTabChange("team")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold tracking-wide cursor-pointer transition-all duration-300 relative ${
                activeTab === "team"
                  ? "bg-white text-slate-900 shadow-lg"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <UsersIcon className="h-3.5 w-3.5" />
              Team Builder
              {activeTeamCount > 0 && (
                <span className="absolute -top-1.5 -right-1 flex h-5 min-w-5 px-1.5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white ring-2 ring-slate-950">
                  {activeTeamCount}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* 2. Full-Width Clean Segmented Carousel (No lateral arrows, no boundaries, phrase on left, Pokéball right) */}
        <div className="relative grid grid-cols-1 md:grid-cols-12 gap-8 items-center py-6 md:py-10">
          {/* Left Block Phrase and metadata info */}
          <div className="md:col-span-7 space-y-4 text-center md:text-left flex flex-col items-center md:items-start justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/10 rounded-full text-[10px] font-extrabold text-slate-300 uppercase tracking-widest backdrop-blur-sm">
              <SparkleIcon className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
              <span>Destaque de Exploração</span>
            </div>

            <h2 className="font-display text-3xl md:text-5xl font-black text-white tracking-tight leading-[1.1] transition-all duration-500">
              {activeTheme.name}
            </h2>

            <p className="font-display text-base md:text-lg font-bold text-slate-200 transition-all duration-500 max-w-xl">
              {activeTheme.subtitle}
            </p>

            <p className="text-xs md:text-sm text-slate-300 transition-all duration-500 max-w-lg leading-relaxed font-medium">
              {activeTheme.description}
            </p>
          </div>

          {/* Right Block Rotating Themed Pokeball Object */}
          <div className="md:col-span-5 flex flex-col items-center justify-center relative">
            {/* Ambient Base Ring Shadow */}
            <div className="relative h-48 md:h-60 w-full flex items-center justify-center">
              <div className="absolute bottom-0 h-4 w-40 bg-black/40 blur-md rounded-full shadow-inner" />

              <div className="filter animate-float">
                <img
                  src={POKEBALL_IMAGES[activeTheme.colorName]}
                  alt={activeTheme.name}
                  width={360}
                  height={360}
                  className="object-contain"
                  draggable={false}
                  onDragStart={(e) => e.preventDefault()}
                  onContextMenu={(e) => e.preventDefault()}
                  style={{
                    userSelect: "none",
                    WebkitUserSelect: "none",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Carousel Bottom Dot Navigation Buttons */}
          <div className="absolute bottom-[-10px] inset-x-0 flex justify-center gap-2">
            {POKEBALLS_THEMED_CONFIGS.map((_, i) => (
              <button
                key={i}
                onClick={() => handleSelectBall(i)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  i === activeIndex
                    ? "w-8"
                    : "w-2 bg-white/30 hover:bg-white/50"
                }`}
                style={{
                  backgroundColor:
                    i === activeIndex ? activeTheme.themeColor : undefined,
                }}
                title={_.name}
              />
            ))}
          </div>
        </div>

        {/* 3. Advanced Filtering Operations Ribbon (Visible only when Tab is Catalog) */}
        {activeTab === "catalog" && (
          <div className="pt-4">
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-3xl p-3 space-y-4 shadow-2xl">
              {/* Header inside the panel with descriptive title */}
              <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-white/5">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300 py-3 uppercase tracking-widest">
                  <SlidersHorizontalIcon className="h-4 w-4 text-slate-400" />
                  <span>Filtro</span>
                </div>
                {isAnyFilterActive && (
                  <button
                    onClick={onClearAllFilters}
                    className="text-[10px] bg-red-500/10 hover:bg-red-500/20 text-red-400 font-extrabold px-3 py-1.5 rounded-xl border border-red-500/20 uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <TrashSimpleIcon size={14} />
                    Limpar Filtros
                  </button>
                )}
              </div>

              {/* Grid of Search inputs and custom designed select components */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="space-y-1.5 col-span-2">
                  <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block font-mono pl-1">
                    Pesquisa por Nome / ID
                  </label>
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => onSearchChange(e.target.value)}
                      placeholder="Ex: Pikachu ou 025..."
                      className="w-full pl-10 pr-4 py-3 bg-white/5 hover:bg-white/10 focus:bg-white/10 rounded-2xl border border-white/10 focus:border-white/20 font-bold text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-white/20 text-xs transition-all tracking-wide shadow-inner"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block font-mono pl-1">
                    Filtrar por Tipo
                  </label>
                  <CustomSelect
                    value={selectedType}
                    onChange={onTypeChange}
                    options={typeOptions}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block font-mono pl-1">
                    Filtrar por Geração
                  </label>
                  <CustomSelect
                    value={selectedGeneration}
                    onChange={onGenerationChange}
                    options={generationOptions}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
