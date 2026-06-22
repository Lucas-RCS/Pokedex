import { useState, useEffect } from "react";
import { decodeTeam } from "../utils/sharing";
import { Pokemon } from "../types";
import { pokemonApi, getOfficialArtworkUrl } from "../services/api";
import { TYPE_COLORS, TYPE_TRANSLATIONS } from "../constants";
import { XIcon, SparkleIcon, CircleNotchIcon } from "@phosphor-icons/react";
import { PokemonModal } from "./PokemonModal";

interface TeamImporterProps {
  token: string;
  onClose: () => void;
  onImportTeam?: (
    pokemonIds: number[],
    name: string,
    icon: string,
    color: string,
  ) => void;
}

export function TeamImporter({
  token,
  onClose,
  onImportTeam,
}: TeamImporterProps) {
  const [decodedData, setDecodedData] = useState<{
    name: string;
    icon: string;
    color: string;
    pokemonIds: number[];
  } | null>(null);

  const [resolvedPokemon, setResolvedPokemon] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState("");
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);

  // Decode and load team on mount
  useEffect(() => {
    try {
      setLoading(true);
      setErrorText("");
      const decoded = decodeTeam(token);

      if (!decoded || decoded.pokemonIds.length === 0) {
        throw new Error("O link de equipe está inválido ou corrompido.");
      }

      setDecodedData(decoded);

      // Resolve images/types for all members
      pokemonApi
        .getPokemonDetailsBatch(decoded.pokemonIds)
        .then((data) => {
          // Keep identical ordering
          const ordered = decoded.pokemonIds
            .map((id) => data.find((p) => p.id === id))
            .filter((p): p is Pokemon => p !== undefined);

          setResolvedPokemon(ordered);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to load details for shared team pokemon:", err);
          setErrorText("Erro ao carregar dados dos Pokémon da equipe.");
          setLoading(false);
        });
    } catch (err) {
      setErrorText("Link de equipe inválido, quebrado ou no formato errado.");
      setLoading(false);
    }
  }, [token]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020205]/80 backdrop-blur-md">
        <div className="bg-slate-900 px-8 py-10 rounded-2xl border border-slate-850 flex flex-col items-center justify-center text-center gap-4 shadow-2xl">
          <div className="relative flex items-center justify-center">
            <CircleNotchIcon className="h-10 w-10 animate-spin text-indigo-500" />
          </div>
          <p className="text-sm font-bold tracking-wide text-white font-mono">
            Carregando equipe compartilhada...
          </p>
          <p className="text-xs text-slate-500 font-mono">
            Sincronizando coordenadas com a Pokédex
          </p>
        </div>
      </div>
    );
  }

  if (errorText || !decodedData) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020205]/80 backdrop-blur-md">
        <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center shadow-2xl text-white">
          <div className="p-3 bg-red-950/45 text-red-400 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 border border-red-900/40">
            <XIcon className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">
            Importação Falhou
          </h3>
          <p className="text-xs text-slate-450 mb-6 font-mono">
            {errorText || "Dados inválidos."}
          </p>
          <button
            onClick={onClose}
            className="w-full py-2 bg-slate-800 hover:bg-slate-750 text-slate-350 font-bold rounded-xl text-xs transition cursor-pointer font-mono"
          >
            Fechar
          </button>
        </div>
      </div>
    );
  }

  const handleImport = () => {
    if (onImportTeam) {
      onImportTeam(
        decodedData.pokemonIds,
        decodedData.name,
        decodedData.icon,
        decodedData.color,
      );
    }
    onClose();
  };

  const borderThemes: Record<string, string> = {
    red: "border-red-500/80 shadow-red-500/10",
    blue: "border-blue-500/80 shadow-blue-500/10",
    yellow: "border-yellow-500/80 shadow-yellow-500/10",
    purple: "border-purple-500/80 shadow-purple-500/10",
    green: "border-emerald-500/80 shadow-emerald-500/10",
  };

  const selectedBorder = borderThemes[decodedData.color] || borderThemes.red;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Soft overlay veil */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-[#020205]/80 backdrop-blur-md"
      />

      {/* Import card showcase dashboard */}
      <div
        className={`relative w-full max-w-4xl max-h-[90vh] overflow-y-auto no-scrollbar rounded-3xl bg-slate-900 border-2 ${selectedBorder} p-6 md:p-8 text-slate-100 shadow-2xl transition-all`}
      >
        {/* Glow spotlight ring */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-44 w-96 bg-indigo-955/20 blur-[60px] rounded-full pointer-events-none" />

        {/* Floating sparkles header */}
        <div className="absolute top-4 left-4 flex items-center gap-1.5 text-[10px] text-yellow-500 font-extrabold tracking-widest uppercase font-mono">
          <SparkleIcon
            weight="fill"
            className="h-4 w-4 text-yellow-500 animate-pulse"
          />
          <span>Equipe Encontrada</span>
        </div>

        {/* Modal close icon */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
        >
          <XIcon className="h-5 w-5" />
        </button>

        {/* Core Showcase Frame */}
        <div className="text-center mt-6 mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="text-4xl">{decodedData.icon}</span>
            <h2 className="font-display text-2xl md:text-3.5xl font-extrabold tracking-tight text-white uppercase leading-tight">
              {decodedData.name}
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-black max-w-xl mx-auto font-mono leading-relaxed">
            Esta formação é uma equipe compartilhada. Sinta-se livre para
            analisar e inspecionar cada criatura clicando sobre elas para ver
            seus dados completos!
          </p>
        </div>

        {/* Roster Layout Showcase */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {resolvedPokemon.map((pokemon) => {
            const types = pokemon.types;
            const primType = types[0]?.type.name || "normal";
            const typeColor = TYPE_COLORS[primType] || "#A8A77A";

            return (
              <div
                key={pokemon.id}
                onClick={() => setSelectedPokemon(pokemon)}
                className="relative cursor-pointer  border border-slate-800 rounded-2xl p-4 flex flex-col justify-between items-center text-center h-48 hover:-translate-y-1 hover:border-slate-700 hover:bg-slate-950/60 transition-all duration-300 group"
              >
                <span className="font-mono text-[9px] text-slate-500 font-bold self-start leading-none mb-1">
                  #{String(pokemon.id).padStart(3, "0")}
                </span>

                <div className="h-20 w-20 flex items-center justify-center my-1 relative">
                  <img
                    src={getOfficialArtworkUrl(pokemon.id)}
                    alt={pokemon.name}
                    referrerPolicy="no-referrer"
                    className="h-16 w-16 object-contain z-10 filter drop-shadow-md group-hover:scale-110 transition-transform duration-300"
                  />
                  <div
                    className="absolute h-10 w-10 rounded-full blur-xl opacity-15"
                    style={{ backgroundColor: typeColor }}
                  />
                </div>

                <div className="w-full">
                  <span className="font-display font-bold text-[13px] text-white capitalize block leading-tight truncate">
                    {pokemon.name}
                  </span>
                  <div className="flex gap-1 justify-center mt-1.5">
                    {types.slice(0, 1).map((typeObj) => {
                      const name = typeObj.type.name;
                      const cName = TYPE_COLORS[name] || "#A8A77A";
                      return (
                        <span
                          key={name}
                          className="text-[8px] font-bold uppercase tracking-wider text-white px-1.5 py-0.5 rounded"
                          style={{ backgroundColor: cName }}
                        >
                          {TYPE_TRANSLATIONS[name] || name}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sticky action tray lower shelf */}
        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400 font-bold text-center sm:text-left font-mono">
            <span>Visualização de </span>
            <span className="text-indigo-400 font-mono">
              {resolvedPokemon.length} Pokémon ativos
            </span>
            <span>. Clique em qualquer card para ver o pokemon.</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto font-mono">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
            >
              Fechar Visualização
            </button>
          </div>
        </div>

        {/* Details focus modal for individual selection */}
        {selectedPokemon && (
          <PokemonModal
            pokemon={selectedPokemon}
            onClose={() => setSelectedPokemon(null)}
          />
        )}
      </div>
    </div>
  );
}
