import { useState, useEffect } from "react";
import { Pokemon, EvolutionChainNode } from "../types";
import { pokemonApi, getOfficialArtworkUrl } from "../services/api";
import {
  TYPE_COLORS,
  TYPE_TRANSLATIONS,
  STAT_TRANSLATIONS,
  STAT_COLORS,
} from "../constants";
import {
  XIcon,
  PlusIcon,
  CheckFatIcon,
  ScalesIcon,
  RulerIcon,
  CaretDoubleRightIcon,
  SparkleIcon,
  CircleNotchIcon,
} from "@phosphor-icons/react";
import { calculateTypeRelations } from "../utils/typeRelations";

interface PokemonModalProps {
  pokemon: Pokemon;
  onClose: () => void;
  onToggleTeam?: (pokemonId: number) => void;
  teamPokemonIds?: number[];
}

export function PokemonModal({
  pokemon: initialPokemon,
  onClose,
  onToggleTeam,
  teamPokemonIds = [],
}: PokemonModalProps) {
  const [activePokemon, setActivePokemon] = useState<Pokemon>(initialPokemon);
  const [flavorText, setFlavorText] = useState<string>("");
  const [evolutionChain, setEvolutionChain] = useState<EvolutionChainNode[]>(
    [],
  );
  const [loadingExtra, setLoadingExtra] = useState(false);
  const [activeSpriteTab, setActiveSpriteTab] = useState<
    "official" | "default" | "shiny"
  >("official");

  const currentlyInTeam = teamPokemonIds.includes(activePokemon.id);

  // Keep tracks of active pokemon and load details on focus changes
  useEffect(() => {
    let active = true;
    setLoadingExtra(true);
    setFlavorText("");
    setEvolutionChain([]);

    setActivePokemon(initialPokemon);

    // Fetch Species + Evolution Chain
    pokemonApi
      .getPokemonSpecies(initialPokemon.id)
      .then(async (species) => {
        if (!active) return;

        const englishEntry = species.flavor_text_entries.find(
          (entry) =>
            entry.language.name === "pt" || entry.language.name === "en",
        );
        if (englishEntry) {
          setFlavorText(englishEntry.flavor_text.replace(/[\f\n\r]/g, " "));
        }

        if (species.evolution_chain?.url) {
          const chain = await pokemonApi.getEvolutionChain(
            species.evolution_chain.url,
          );
          if (active) {
            setEvolutionChain(chain);
          }
        }
        setLoadingExtra(false);
      })
      .catch((err) => {
        console.error("Failed to load species/evolution data:", err);
        if (active) setLoadingExtra(false);
      });

    return () => {
      active = false;
    };
  }, [initialPokemon]);

  // Load details on recursive navigation click
  const handleSelectPokemon = async (id: number) => {
    try {
      setLoadingExtra(true);
      const detail = await pokemonApi.getPokemonDetails(id);
      setActivePokemon(detail);

      const species = await pokemonApi.getPokemonSpecies(id);
      const englishEntry = species.flavor_text_entries.find(
        (entry) => entry.language.name === "pt" || entry.language.name === "en",
      );
      if (englishEntry) {
        setFlavorText(englishEntry.flavor_text.replace(/[\f\n\r]/g, " "));
      } else {
        setFlavorText("");
      }

      if (species.evolution_chain?.url) {
        const chain = await pokemonApi.getEvolutionChain(
          species.evolution_chain.url,
        );
        setEvolutionChain(chain);
      }
      setLoadingExtra(false);
    } catch (err) {
      console.error("Failed to navigation inside modal:", err);
      setLoadingExtra(false);
    }
  };

  // Listen for ESC key pressed to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const pName = activePokemon.name;
  const capitalizedName = pName.charAt(0).toUpperCase() + pName.slice(1);
  const formattedId = `#${String(activePokemon.id).padStart(3, "0")}`;

  const primaryType = activePokemon.types[0]?.type.name || "normal";
  const primaryColor = TYPE_COLORS[primaryType] || "#A8A77A";

  const heightInMeters = activePokemon.height / 10;
  const weightInKg = activePokemon.weight / 10;

  const stats = activePokemon.stats;
  const maxStatVal = Math.max(...stats.map((s) => s.base_stat), 160);

  const sprites = activePokemon.sprites;

  const getFrontSprite = () => {
    if (activeSpriteTab === "shiny") {
      return sprites.front_shiny || "";
    }
    return sprites.front_default || "";
  };

  const getBackSprite = () => {
    if (activeSpriteTab === "shiny") {
      return sprites.back_shiny || null;
    }
    return sprites.back_default || null;
  };

  const typeNames = activePokemon.types.map((t) => t.type.name);
  const relations = calculateTypeRelations(typeNames);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Soft light-shadow backdrop overlay */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-[#020205]/80 backdrop-blur-md transition-opacity duration-300"
      />

      {/* Main Modal Container with white card design */}
      <div
        className="relative w-full max-w-4xl h-[85vh] md:h-[90vh] flex flex-col rounded-3xl bg-slate-900 border border-slate-800 text-slate-100 shadow-2xl transition-all duration-300 transform scale-100 overflow-hidden"
        style={{
          boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 32px 0px ${primaryColor}30`,
        }}
        id="pokemon-details-modal"
      >
        {/* Decorative Top Type-colored Accent Line */}
        <div
          className="h-2 w-full sticky top-0 z-30 shrink-0 rounded-t-3xl"
          style={{ backgroundColor: primaryColor }}
        />

        {/* Modal Close Button */}
        <button
          onClick={onClose}
          id="close-modal-button"
          className="absolute right-3 top-4 p-2 rounded-full bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white transition-all duration-200 z-50  cursor-pointer"
        >
          <XIcon weight="bold" />
        </button>

        {/* Scrollable interior */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-6 md:p-8 pt-12">
          {/* Side by Side Layout Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* LEFT SIDE: Visual Stage and Artworks (45% width) */}
            <div className="md:col-span-5 flex flex-col gap-5">
              {/* Massive Official Illustration Stage */}
              <div className="relative flex items-center justify-center p-6 bg-slate-950/40 rounded-2xl border border-slate-800 overflow-hidden min-h-[280px]">
                {/* Dynamic backlighting spot of same color */}
                <div
                  className="absolute h-40 w-45 rounded-full blur-3xl opacity-15 pointer-events-none"
                  style={{ backgroundColor: primaryColor }}
                />

                <div className="absolute h-32 w-32 rounded-full border border-dashed border-slate-800/60 animate-spin-slow pointer-events-none" />

                {activeSpriteTab === "official" && (
                  <img
                    src={getOfficialArtworkUrl(activePokemon.id)}
                    alt={capitalizedName}
                    referrerPolicy="no-referrer"
                    className="h-52 w-52 object-contain z-10 filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.4)] animate-float"
                  />
                )}

                {activeSpriteTab === "default" && (
                  <div className="flex gap-4 items-center justify-center z-10">
                    <img
                      src={getFrontSprite() || ""}
                      alt="front"
                      referrerPolicy="no-referrer"
                      className="h-28 w-28 object-contain bg-slate-950/80 rounded-lg p-1 border border-slate-800"
                    />
                    {getBackSprite() && (
                      <img
                        src={getBackSprite() || ""}
                        alt="back"
                        referrerPolicy="no-referrer"
                        className="h-28 w-28 object-contain bg-slate-950/80 rounded-lg p-1 border border-slate-800"
                      />
                    )}
                  </div>
                )}

                {activeSpriteTab === "shiny" && (
                  <div className="flex gap-4 items-center justify-center z-10">
                    <img
                      src={getFrontSprite() || ""}
                      alt="shiny front"
                      referrerPolicy="no-referrer"
                      className="h-28 w-28 object-contain bg-slate-950/80 rounded-lg p-1 border border-slate-800"
                    />
                    {getBackSprite() && (
                      <img
                        src={getBackSprite() || ""}
                        alt="shiny back"
                        referrerPolicy="no-referrer"
                        className="h-28 w-28 object-contain bg-slate-950/80 rounded-lg p-1 border border-slate-800"
                      />
                    )}
                  </div>
                )}
              </div>

              {/* View/Sprite Select Toolbars */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 font-mono">
                  Visualizações Disponíveis
                </span>
                <div className="grid grid-cols-3 gap-1 p-1 bg-slate-950/40 border border-slate-800 rounded-xl text-xs">
                  <button
                    onClick={() => setActiveSpriteTab("official")}
                    className={`py-1.5 px-1 rounded-lg font-bold transition-all cursor-pointer ${
                      activeSpriteTab === "official"
                        ? "bg-slate-800 text-white shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Arte Oficial
                  </button>
                  <button
                    onClick={() => setActiveSpriteTab("default")}
                    disabled={!sprites.front_default}
                    className={`py-1.5 px-1 rounded-lg font-bold transition-all cursor-pointer ${
                      activeSpriteTab === "default"
                        ? "bg-slate-800 text-white shadow-sm"
                        : "text-slate-400 hover:text-white disabled:opacity-40"
                    }`}
                  >
                    Sprites Retro
                  </button>
                  <button
                    onClick={() => setActiveSpriteTab("shiny")}
                    disabled={!sprites.front_shiny}
                    className={`py-1.5 px-1 rounded-lg font-bold transition-all cursor-pointer ${
                      activeSpriteTab === "shiny"
                        ? "bg-slate-800 text-white shadow-sm"
                        : "text-slate-400 hover:text-white disabled:opacity-40"
                    }`}
                  >
                    Shiny
                  </button>
                </div>
              </div>

              {/* Dimensions Section (Weight & Height) */}
              <div className="grid grid-cols-2 gap-3 bg-slate-950/30 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-slate-900 text-indigo-400 border border-slate-800 shadow-sm">
                    <RulerIcon weight="fill" className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-450 uppercase font-extrabold block font-mono">
                      ALTURA
                    </span>
                    <span className="font-mono text-sm font-bold text-white">
                      {heightInMeters} m
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-slate-900 text-emerald-400 border border-slate-800 shadow-sm">
                    <ScalesIcon weight="fill" className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-450 uppercase font-extrabold block font-mono">
                      PESO
                    </span>
                    <span className="font-mono text-sm font-bold text-white">
                      {weightInKg} kg
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE: Statistics, Bio, Chain, and Team Controls */}
            <div className="md:col-span-7 flex flex-col gap-6">
              {/* Heading name & Type Badges */}
              <div>
                <div className="flex items-baseline justify-between flex-wrap gap-2 mb-2">
                  <h2 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
                    {capitalizedName}
                    <span className="font-mono text-base text-slate-500 font-bold">
                      {formattedId}
                    </span>
                  </h2>

                  {onToggleTeam && (
                    <button
                      onClick={() => onToggleTeam(activePokemon.id)}
                      id="modal-team-toggle-button"
                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ${
                        currentlyInTeam
                          ? "bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700"
                          : "bg-indigo-600 hover:bg-indigo-500 text-white hover:-translate-y-0.5 active:translate-y-0"
                      }`}
                    >
                      {currentlyInTeam ? (
                        <>
                          <CheckFatIcon
                            weight="fill"
                            className="h-3.5 w-3.5 text-indigo-400"
                          />
                          Membro da Equipe
                        </>
                      ) : (
                        <>
                          <PlusIcon className="h-3.5 w-3.5" />
                          Adicionar à Equipe
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Localized Type Badges */}
                <div className="flex flex-wrap gap-1.5">
                  {activePokemon.types.map((typeObj) => {
                    const tName = typeObj.type.name;
                    const color = TYPE_COLORS[tName] || "#777";
                    return (
                      <span
                        key={tName}
                        className="px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white shadow-sm"
                        style={{ backgroundColor: color }}
                      >
                        {TYPE_TRANSLATIONS[tName] || tName}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Flavor Text (Bio Description) */}
              <div className="relative">
                {loadingExtra ? (
                  <div className="space-y-1.5 py-2">
                    <div className="h-3 bg-slate-800 animate-pulse rounded w-full" />
                    <div className="h-3 bg-slate-800 animate-pulse rounded w-11/12" />
                  </div>
                ) : flavorText ? (
                  <p className="text-slate-300 text-xs md:text-sm leading-relaxed italic bg-slate-950/40 p-4 rounded-xl border border-slate-800">
                    "{flavorText}"
                  </p>
                ) : (
                  <p className="text-slate-550 text-xs italic">
                    Dados de biologia para este espécime são arquivados ou
                    indisponíveis no momento.
                  </p>
                )}
              </div>

              {/* Type Defenses & Weaknesses (Tabela de Afinidades/Fraquezas) */}
              <div>
                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-3">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: primaryColor }}
                  />
                  Fraquezas e Afinidades de Combate
                </h4>

                <div className="bg-slate-950/30 p-4 rounded-xl border border-slate-800 space-y-3.5">
                  {/* Weaknesses Section */}
                  <div className="space-y-2">
                    <span className="text-[9px] text-red-400 font-extrabold uppercase tracking-widest font-mono block">
                      Fraquezas
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {[...relations.weak4x, ...relations.weak2x].map(
                        (type) => (
                          <span
                            key={type}
                            className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase text-white tracking-wider shadow-sm transition-all duration-200"
                            style={{
                              backgroundColor: TYPE_COLORS[type] || "#777",
                            }}
                          >
                            {TYPE_TRANSLATIONS[type] || type}
                          </span>
                        ),
                      )}
                      {relations.weak4x.length === 0 &&
                        relations.weak2x.length === 0 && (
                          <span className="text-[10px] font-bold text-slate-400 italic">
                            Nenhuma fraqueza elemental. Defesa excelente!
                          </span>
                        )}
                    </div>
                  </div>

                  {/* Resistances & Immunities Section */}
                  <div className="space-y-2 border-t border-slate-900 pt-3">
                    <span className="text-[9px] text-indigo-400 font-extrabold uppercase tracking-widest font-mono block">
                      Resistências e Imunidades
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        ...relations.immune,
                        ...relations.resistQuarter,
                        ...relations.resistHalf,
                      ].map((type) => (
                        <span
                          key={type}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase text-white tracking-wider shadow-sm transition-all duration-200"
                          style={{
                            backgroundColor: TYPE_COLORS[type] || "#777",
                          }}
                        >
                          {TYPE_TRANSLATIONS[type] || type}
                        </span>
                      ))}
                      {relations.immune.length === 0 &&
                        relations.resistQuarter.length === 0 &&
                        relations.resistHalf.length === 0 && (
                          <span className="text-[10px] font-bold text-slate-400 italic">
                            Neutro contra todas as demais forças elementais.
                          </span>
                        )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Combat Stats Section */}
              <div>
                <h4 className="text-xs font-extrabold text-slate-455 uppercase tracking-widest flex items-center gap-2 mb-3">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: primaryColor }}
                  />
                  Atributos de Combate (Base Stats)
                </h4>
                <div className="space-y-2 bg-slate-950/30 p-4 rounded-xl border border-slate-800">
                  {stats.map((statObj) => {
                    const sName = statObj.stat.name;
                    const value = statObj.base_stat;
                    const label = STAT_TRANSLATIONS[sName] || sName;
                    const colorClass = STAT_COLORS[sName] || "bg-indigo-500";
                    const pct = Math.min((value / maxStatVal) * 100, 100);

                    return (
                      <div
                        key={sName}
                        className="grid grid-cols-12 gap-4 items-center text-xs py-1"
                      >
                        {/* Stat Name Label */}
                        <span className="col-span-3 font-semibold text-slate-400 capitalize truncate">
                          {label}
                        </span>

                        {/* Number Value */}
                        <span className="col-span-1 font-mono text-slate-300 font-black text-right">
                          {value}
                        </span>

                        {/* Visual Progress Bar */}
                        <div className="col-span-8 h-3 bg-slate-950/80 rounded-full overflow-hidden flex ml-1 border border-slate-800">
                          <div
                            className={`h-full ${colorClass} rounded-full transition-all duration-1000 ease-out`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Special Abilities Belt */}
              <div>
                <h4 className="text-xs font-extrabold text-slate-455 uppercase tracking-widest flex items-center gap-2 mb-3">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: primaryColor }}
                  />
                  Habilidades Especiais
                </h4>
                <div className="flex flex-wrap gap-2">
                  {activePokemon.abilities.map((abilityObj) => {
                    const abName = abilityObj.ability.name;
                    const titleName = abName.replace(/-/g, " ");
                    const isHidden = abilityObj.is_hidden;

                    return (
                      <span
                        key={abName}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize flex items-center gap-1.5 border ${
                          isHidden
                            ? "bg-indigo-950/40 border-indigo-900/65 text-indigo-300"
                            : "bg-slate-950 border border-slate-800 text-slate-300"
                        }`}
                      >
                        {isHidden && (
                          <SparkleIcon
                            weight="fill"
                            className="h-3 w-3 text-indigo-400 animate-pulse"
                          />
                        )}
                        {titleName}
                        {isHidden && (
                          <span className="text-[8px] font-extrabold text-white px-1 rounded select-none bg-indigo-600">
                            OCULTA
                          </span>
                        )}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* LOWER SECTION: Evolutionary Chain Stage */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
              <span className="h-1.5 w-1.5 rounded bg-indigo-500" />
              Linha de Evolução da Espécie
            </h4>

            {loadingExtra && evolutionChain.length === 0 ? (
              <div className="flex items-center justify-center gap-3 py-8 bg-slate-950/20 p-4 rounded-2xl border border-slate-800">
                <CircleNotchIcon className="h-5 w-5 animate-spin text-slate-500" />
                <span className="text-xs text-slate-400 font-bold font-mono">
                  Mapeando genoma evolutivo...
                </span>
              </div>
            ) : evolutionChain.length > 0 ? (
              <div className="bg-slate-950/35 border border-slate-800 rounded-2xl p-6 shadow-inner">
                <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4">
                  {evolutionChain.map((node, index) => {
                    const isActive = node.id === activePokemon.id;
                    const primaryNodeGenType = node.types[0] || "normal";
                    const accentColor =
                      TYPE_COLORS[primaryNodeGenType] || "#777";

                    return (
                      <div
                        key={node.id}
                        className="flex flex-col md:flex-row items-center w-full md:w-auto"
                      >
                        {/* Step Connector Arrow (points down on mobile, right on desktop) */}
                        {index > 0 && (
                          <div className="flex flex-col items-center justify-center mx-4 my-3 md:my-0 shrink-0">
                            <div className="h-8 w-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-indigo-400 shadow-md">
                              <CaretDoubleRightIcon className="h-4.5 w-4.5 md:rotate-0 rotate-90 transition-transform duration-300" />
                            </div>
                            <span className="text-[8px] font-mono font-black text-slate-500 tracking-wider mt-1 uppercase">
                              EVOLUÇÃO
                            </span>
                          </div>
                        )}

                        {/* Card Node */}
                        <div
                          onClick={() => handleSelectPokemon(node.id)}
                          className={`w-full md:w-auto min-w-[150px] cursor-pointer p-4 rounded-2xl border flex flex-row md:flex-col items-center gap-4 md:gap-3 transition-all duration-300 ${
                            isActive
                              ? "bg-slate-850 border-indigo-500/80 scale-102 md:scale-105 shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                              : "bg-slate-900 border-slate-800 hover:border-slate-650 hover:scale-[1.03]"
                          }`}
                          style={
                            isActive
                              ? {
                                  borderColor: accentColor,
                                  boxShadow: `0 0 20px ${accentColor}18`,
                                }
                              : {}
                          }
                        >
                          {/* Sprite frame */}
                          <div className="relative h-16 w-16 bg-slate-950 rounded-2xl border border-slate-800/60 overflow-hidden shrink-0 flex items-center justify-center shadow-inner group">
                            {/* Accent dynamic backlighting inside chain sprite */}
                            <div
                              className="absolute h-10 w-10 rounded-full blur-xl opacity-35"
                              style={{ backgroundColor: accentColor }}
                            />
                            <img
                              src={node.imageUrl}
                              alt={node.speciesName}
                              referrerPolicy="no-referrer"
                              className="h-13 w-13 object-contain z-10 filter drop-shadow-md transition-transform duration-300 group-hover:scale-110"
                            />
                          </div>

                          {/* Details */}
                          <div className="flex-1 md:flex-initial text-left md:text-center min-w-0">
                            <span className="text-[10px] font-mono text-slate-500 font-bold block leading-none mb-0.5">
                              #{String(node.id).padStart(3, "0")}
                            </span>
                            <span className="text-sm font-black text-white capitalize block truncate">
                              {node.speciesName}
                            </span>

                            {/* Types Row */}
                            <div className="flex justify-start md:justify-center gap-1 mt-1.5">
                              {node.types.map((type) => (
                                <span
                                  key={type}
                                  className="text-[8px] font-bold uppercase tracking-wider text-white px-2 py-0.5 rounded shadow-sm"
                                  style={{
                                    backgroundColor:
                                      TYPE_COLORS[type] || "#777",
                                  }}
                                >
                                  {TYPE_TRANSLATIONS[type] || type}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Active stage badge on mobile and desktop */}
                          {isActive && (
                            <div className="ml-auto md:ml-0 px-2 py-0.5 rounded bg-indigo-500/15 border border-indigo-500/30 text-[8px] font-extrabold text-indigo-300 uppercase tracking-widest font-mono">
                              Estágio Atual
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-slate-550 text-xs italic py-2">
                Esta espécie não possui registros adicionais de herança
                evolutiva.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
