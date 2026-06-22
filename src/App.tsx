import { useState, useEffect, useRef, useMemo } from "react";
import { Pokemon } from "./types";
import { pokemonApi } from "./services/api";
import { PokeBallHero } from "./components/PokeBallHero";
import { PokemonCard } from "./components/PokemonCard";
import { PokemonModal } from "./components/PokemonModal";
import { TeamBuilder } from "./components/TeamBuilder";
import { TeamImporter } from "./components/TeamImporter";
import {
  QuestionIcon,
  GithubLogoIcon,
  CircleNotchIcon,
  ArrowUpIcon,
  UserIcon,
} from "@phosphor-icons/react";
import { CustomSelect, SelectOption } from "./utils/CustomSelect";

interface BasePokemonItem {
  id: number;
  name: string;
  url: string;
}

const ALL_TYPES_LIST = [
  "normal",
  "fire",
  "water",
  "electric",
  "grass",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
];

export default function App() {
  // Master Lists and Loadings
  const [masterList, setMasterList] = useState<BasePokemonItem[]>([]);
  const [filteredMasterList, setFilteredMasterList] = useState<
    BasePokemonItem[]
  >([]);
  const [loadingList, setLoadingList] = useState(true);

  // Screen/View Selection Tab: "catalog" (default main screen) or "team" (builder screen)
  const [activeTab, setActiveTab] = useState<"catalog" | "team">("catalog");

  // States for unified filters and queries
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [sortBy, setSortBy] = useState<
    "id-asc" | "id-desc" | "name-asc" | "name-desc"
  >("id-asc");
  const [selectedGeneration, setSelectedGeneration] = useState("all");

  // Infinite Scroll Slice indexes
  const [visibleCount, setVisibleCount] = useState(24);
  const [loadingMore, setLoadingMore] = useState(false);

  // Modals focus targets
  const [activeModalPokemon, setActiveModalPokemon] = useState<Pokemon | null>(
    null,
  );
  const [activeImportToken, setActiveImportToken] = useState<string | null>(
    null,
  );

  // Active Team composition (List of up to 6 Pokemon ID numbers)
  const [teamPokemonIds, setTeamPokemonIds] = useState<number[]>(() => {
    try {
      const stored = localStorage.getItem("pokedex_team_ids");
      return stored ? JSON.parse(stored).slice(0, 6) : [];
    } catch {
      return [];
    }
  });

  // Toast notifications feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Show-to-top floating scroll wheel trigger
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Refs for infinite scroll observer
  const observerTargetRef = useRef<HTMLDivElement | null>(null);

  // 1. Fetch initial index list of Pokémon on mount
  useEffect(() => {
    let active = true;
    setLoadingList(true);

    // Fetch 1025 pokemon once in background
    pokemonApi
      .getPokemonList(1025, 0)
      .then((data) => {
        if (active) {
          setMasterList(data);
          setLoadingList(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load standard Pokedex indices:", err);
        if (active) setLoadingList(false);
      });

    // Detect URL parameter for group share imports: ?data=xxxxx or /team?data=xxxxx
    const params = new URLSearchParams(window.location.search);
    const sharedData = params.get("data");
    if (sharedData) {
      setActiveImportToken(sharedData);
    }

    return () => {
      active = false;
    };
  }, []);

  // 2. Fetch specific list of matching Pokémon from Type endpoint if type is active
  const [typeFilteredCache, setTypeFilteredCache] = useState<
    Record<string, BasePokemonItem[]>
  >({});
  const [loadingTypeFilter, setLoadingTypeFilter] = useState(false);

  useEffect(() => {
    if (!selectedType) {
      setLoadingTypeFilter(false);
      return;
    }

    if (typeFilteredCache[selectedType]) {
      // Return cached results
      return;
    }

    setLoadingTypeFilter(true);
    fetch(`https://pokeapi.co/api/v2/type/${selectedType}`)
      .then((res) => {
        if (!res.ok) throw new Error("Type lookup error");
        return res.json();
      })
      .then((data) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const items: BasePokemonItem[] = data.pokemon.map((entry: any) => {
          const id = parseInt(
            entry.pokemon.url.split("/").slice(-2, -1)[0],
            10,
          );
          return {
            name: entry.pokemon.name,
            id,
            url: entry.pokemon.url,
          };
        });

        setTypeFilteredCache((prev) => ({
          ...prev,
          [selectedType]: items,
        }));
        setLoadingTypeFilter(false);
      })
      .catch((err) => {
        console.error(
          `Failed to resolve type lookup for ${selectedType}:`,
          err,
        );
        setLoadingTypeFilter(false);
      });
  }, [selectedType, typeFilteredCache]);

  // 3. Compute client-side filter results based on search queries, selected types and generations
  useEffect(() => {
    let currentList = selectedType
      ? typeFilteredCache[selectedType] || []
      : masterList;

    // Apply selected generation filters deterministically
    if (selectedGeneration !== "all") {
      const gen = selectedGeneration;
      currentList = currentList.filter((p) => {
        if (gen === "1") return p.id >= 1 && p.id <= 151;
        if (gen === "2") return p.id >= 152 && p.id <= 251;
        if (gen === "3") return p.id >= 252 && p.id <= 386;
        if (gen === "4") return p.id >= 387 && p.id <= 493;
        if (gen === "5") return p.id >= 494 && p.id <= 649;
        if (gen === "6") return p.id >= 650 && p.id <= 721;
        if (gen === "7") return p.id >= 722 && p.id <= 809;
        if (gen === "8") return p.id >= 810 && p.id <= 898;
        if (gen === "9") return p.id >= 899 && p.id <= 1025;
        return true;
      });
    }

    // Apply text search keyword matches (name or precise numerical ID mapping)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      currentList = currentList.filter(
        (p) =>
          p.name.includes(q) ||
          String(p.id) === q ||
          String(p.id).padStart(3, "0") === q,
      );
    }

    // Apply selected sorting criteria
    const listCopy = [...currentList];
    if (sortBy === "id-asc") {
      listCopy.sort((a, b) => a.id - b.id);
    } else if (sortBy === "id-desc") {
      listCopy.sort((a, b) => b.id - a.id);
    } else if (sortBy === "name-asc") {
      listCopy.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "name-desc") {
      listCopy.sort((a, b) => b.name.localeCompare(a.name));
    }

    setFilteredMasterList(listCopy);
    setVisibleCount(24); // Reset infinite slicing index whenever filtering parameters alter
  }, [
    masterList,
    searchQuery,
    selectedType,
    typeFilteredCache,
    sortBy,
    selectedGeneration,
  ]);

  // 4. Implement dynamic Infinite Scroll with IntersectionObserver
  useEffect(() => {
    if (loadingList || loadingTypeFilter) return;

    const target = observerTargetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && visibleCount < filteredMasterList.length) {
          setLoadingMore(true);
          // Simulate a sub-100ms smooth visual debounce then load next block
          setTimeout(() => {
            setVisibleCount((prev) =>
              Math.min(prev + 24, filteredMasterList.length),
            );
            setLoadingMore(false);
          }, 300);
        }
      },
      { threshold: 0.1, rootMargin: "150px" },
    );

    observer.observe(target);
    return () => {
      observer.unobserve(target);
    };
  }, [loadingList, loadingTypeFilter, visibleCount, filteredMasterList.length]);

  // 5. Scroll to top floating button visibility
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Toast feedback helper
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  // Sync team adjustments back to state and localStorage
  const handleUpdateTeamIds = (newIds: number[]) => {
    setTeamPokemonIds(newIds);
    localStorage.setItem("pokedex_team_ids", JSON.stringify(newIds));
  };

  // Toggle custom Pokémon join/quit active team
  const handleToggleTeam = (id: number) => {
    const exists = teamPokemonIds.includes(id);

    if (exists) {
      const filtered = teamPokemonIds.filter((item) => item !== id);
      handleUpdateTeamIds(filtered);
      triggerToast("Pokémon removido da equipe com sucesso!");
    } else {
      if (teamPokemonIds.length >= 6) {
        triggerToast("Aviso: Sua equipe já está completa com 6 Pokémon!");
        return;
      }
      const updated = [...teamPokemonIds, id];
      handleUpdateTeamIds(updated);
      triggerToast("Pokémon recrutado para a equipe com sucesso!");
    }
  };

  // Handle team import confirmations from URL parameters link
  const handleImportSharedTeam = (
    ids: number[],
    name: string,
    icon: string,
    color: string,
  ) => {
    handleUpdateTeamIds(ids.slice(0, 6));
    localStorage.setItem("pokedex_team_name", name);
    localStorage.setItem("pokedex_team_icon", icon);
    localStorage.setItem("pokedex_team_color", color);
    triggerToast(`Equipe "${name}" importada e ativada como principal!`);

    // Clear URL query parameters to avoid re-triggering modal on reload
    window.history.replaceState({}, document.title, window.location.pathname);
    setActiveImportToken(null);
  };

  const handleClearUrlShare = () => {
    window.history.replaceState({}, document.title, window.location.pathname);
    setActiveImportToken(null);
  };

  const handleClearAllFilters = () => {
    setSearchQuery("");
    setSelectedType("");
    setSelectedGeneration("all");
    setSortBy("id-asc");
  };

  // Slice list of matching items for rendering
  const paginatedPokemon = useMemo(() => {
    return filteredMasterList.slice(0, visibleCount);
  }, [filteredMasterList, visibleCount]);

  const sortByOptions: SelectOption[] = [
    { value: "id-asc", label: "Número (Crescente)" },
    { value: "id-desc", label: "Número (Decrescente)" },
    { value: "name-asc", label: "Nome (A - Z)" },
    { value: "name-desc", label: "Nome (Z - A)" },
  ];

  return (
    <div className="min-h-screen bg-[#05050a] font-sans text-slate-150 flex flex-col antialiased">
      {/* 1. Header Hero Area with standard split carousel and search filters */}
      <PokeBallHero
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        selectedGeneration={selectedGeneration}
        onGenerationChange={setSelectedGeneration}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        allTypes={ALL_TYPES_LIST}
        totalPokemonCount={masterList.length}
        activeTeamCount={teamPokemonIds.length}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onClearAllFilters={handleClearAllFilters}
      />

      {/* Main Central Stage Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-10">
        {activeTab === "team" ? (
          /* 2. TAB SCREEN: Team Builder Interface Workspace Panel */
          <div className="space-y-6 animate-fade-in">
            <div className="pb-4 border-b border-slate-800">
              <h2 className="font-display text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-3">
                <span className="flex h-2.5 w-2.5 rounded-full bg-indigo-500" />
                Team Builder Esquadrão
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Personalize seu time lendário de até 6 criaturas, defina nomes
                de esquadrão, ícones, e compartilhe sua formação
                instantaneamente com companheiros nas redes sociais.
              </p>
            </div>

            <TeamBuilder
              teamPokemonIds={teamPokemonIds}
              onRemovePokemon={(id) => handleToggleTeam(id)}
              onViewDetails={(details) => setActiveModalPokemon(details)}
              onBackToCatalog={() => setActiveTab("catalog")}
            />
          </div>
        ) : (
          /* 3. TAB SCREEN: Pokedex Grid Catalog Section */
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h2 className="font-display text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-3">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
                  Catálogo Geral Pokédex
                </h2>
                <p className="text-xs text-slate-400 font-medium font-bold">
                  Selecione os cards abaixo para visualizar dados gerais de
                  combate, atributos de ataque e cadeias evolutivas completas.
                </p>
              </div>

              {/* Quick Sort Order Tools */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400 font-extrabold whitespace-nowrap">
                  ORDENAÇÃO:
                </span>

                <div className="w-56">
                  <CustomSelect
                    value={sortBy}
                    onChange={(value) =>
                      setSortBy(
                        value as
                          | "id-asc"
                          | "id-desc"
                          | "name-asc"
                          | "name-desc",
                      )
                    }
                    options={sortByOptions}
                  />
                </div>
              </div>
            </div>

            {/* Skeletons Loader State or Empty Alert Stage */}
            {loadingList || (selectedType && loadingTypeFilter) ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, idx) => (
                  <div
                    key={`skeleton-card-${idx}`}
                    className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 h-64 flex flex-col justify-between animate-pulse shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="h-3 w-10 bg-slate-850 rounded" />
                      <div className="h-4 w-4 bg-slate-850 rounded-full" />
                    </div>
                    <div className="h-28 bg-slate-950/40 rounded-xl my-3 flex items-center justify-center">
                      <div className="h-14 w-14 bg-slate-850 rounded-full" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-slate-850 rounded w-2/3" />
                      <div className="h-3 bg-slate-850 rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : paginatedPokemon.length === 0 ? (
              <div className="text-center py-20 bg-slate-900/40 rounded-3xl border border-dashed border-slate-800 p-8">
                <div className="p-3.5 bg-slate-900 text-slate-400 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4 border border-slate-800">
                  <QuestionIcon className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-bold text-slate-200">
                  Nenhum Pokémon Encontrado
                </h3>
                <p className="text-sm text-slate-400 max-w-sm mx-auto mt-2.5 leading-relaxed">
                  Verifique seus filtros de busca, tipo ou geração. Tente limpar
                  os filtros para explorar toda a Pokédex!
                </p>
                <button
                  onClick={handleClearAllFilters}
                  className="mt-5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Limpar Todos os Filtros
                </button>
              </div>
            ) : (
              <>
                {/* Dynamic Paginated Grid Cards */}
                <div
                  id="pokemon-grid"
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                  {paginatedPokemon.map((p) => (
                    <PokemonCard
                      key={p.id}
                      id={p.id}
                      name={p.name}
                      onViewDetails={(details) =>
                        setActiveModalPokemon(details)
                      }
                      onToggleTeam={(pId) => handleToggleTeam(pId)}
                      isInTeam={teamPokemonIds.includes(p.id)}
                    />
                  ))}
                </div>

                {/* Incremental observer triggering row bottom */}
                <div
                  ref={observerTargetRef}
                  id="infinite-scroll-trigger"
                  className="w-full flex justify-center py-10"
                >
                  {visibleCount < filteredMasterList.length && (
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-bold animate-pulse">
                      <CircleNotchIcon className="h-4 w-4 animate-spin text-slate-500" />
                      Sintonizando coordenadas e carregando outros espécimes...
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {/* 4. Footer credits panel */}
      <footer className="w-full bg-[#020205] border-t border-slate-900/50 py-10   px-6 text-slate-500 text-xs text-center">
        <div className="max-w-7xl mx-auto space-y-4">
          <p className="max-w-md mx-auto leading-relaxed text-[11px] text-slate-500 font-medium">
            Todas as imagens originais de criaturas, nomes e estatísticas
            associadas são marcas registradas da Nintendo, Game Freak e The
            Pokémon Company.
          </p>

          <div className="pt-2 border-t border-slate-900/30 flex items-center justify-center gap-4">
            <a
              href="https://github.com/Lucas-RCS/Pokedex"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-white transition duration-200 bg-slate-900 hover:bg-slate-850 p-2 px-4 rounded-xl border border-slate-800 text-slate-350 font-bold"
            >
              <GithubLogoIcon className="h-4 w-4" />
              GitHub
            </a>
            <a
              href="https://lucasribeiro.dev.br/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-[#222] hover:text-[#222] neon-glow-btn transition duration-200 bg-[#a98aff] hover:bg-white p-2 px-4 rounded-xl border border-slate-800 text-slate-350 font-bold"
            >
              <UserIcon weight="bold" className="h-4 w-4" />
              Portifólio
            </a>
          </div>
        </div>
      </footer>

      {/* 5. Modals Overlay: Details focus panel */}
      {activeModalPokemon && (
        <PokemonModal
          pokemon={activeModalPokemon}
          onClose={() => setActiveModalPokemon(null)}
          onToggleTeam={(id) => handleToggleTeam(id)}
          teamPokemonIds={teamPokemonIds}
        />
      )}

      {/* 6. Modals Overlay: Link shared import panel */}
      {activeImportToken && (
        <TeamImporter
          token={activeImportToken}
          onClose={handleClearUrlShare}
          onImportTeam={handleImportSharedTeam}
        />
      )}

      {/* 7. Floating Toast Alerts system notifications */}
      {toastMessage && (
        <div
          id="toast-notification"
          className="fixed top-6 right-6 z-55 bg-slate-900 text-white rounded-2xl p-4 shadow-xl flex items-center gap-3.5 border border-slate-800"
        >
          <div className="h-2 w-2 rounded-full bg-indigo-400 animate-ping" />
          <span className="text-xs font-bold tracking-wide leading-none">
            {toastMessage}
          </span>
        </div>
      )}

      {/* 8. Floating Scroll to top trigger */}
      {showScrollTop && (
        <button
          onClick={handleScrollTop}
          title="Regressar ao topo"
          className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-slate-900 border border-slate-800 hover:bg-slate-805 text-slate-400 hover:text-white shadow-lg transition duration-200 cursor-pointer"
        >
          <ArrowUpIcon className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
