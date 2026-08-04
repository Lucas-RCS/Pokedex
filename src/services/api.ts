import {
  Pokemon,
  PokemonSpecies,
  EvolutionChainNode,
  EvolutionRequirement,
} from "../types";

// Memory cache to store fetched results and eliminate duplicate requests
const cache: {
  pokemonDetails: Record<string | number, Pokemon>;
  pokemonSpecies: Record<string | number, PokemonSpecies>;
  evolutionChains: Record<string, EvolutionChainNode>;
} = {
  pokemonDetails: {},
  pokemonSpecies: {},
  evolutionChains: {},
};

const BASE_URL = "https://pokeapi.co/api/v2";

/**
 * Returns the official artwork URL directly from the Pokémon ID.
 * This helper allows ultra-fast rendering before requiring full detail network fetches!
 */
export function getOfficialArtworkUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

export function getItemSpriteUrl(itemName: string): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${itemName}.png`;
}

/**
 * Helper to extract ID from PokeAPI URL (e.g. "https://pokeapi.co/api/v2/pokemon/1/")
 */
export function extractIdFromUrl(url: string): number {
  const parts = url.replace(/\/$/, "").split("/");
  return parseInt(parts[parts.length - 1], 10);
}

interface NamedApiResource {
  name: string;
  url: string;
}

interface EvolutionDetailApi {
  trigger: NamedApiResource;
  min_level: number | null;
  item: NamedApiResource | null;
  held_item: NamedApiResource | null;
  min_happiness: number | null;
  min_beauty: number | null;
  min_affection: number | null;
  known_move: NamedApiResource | null;
  known_move_type: NamedApiResource | null;
  location: NamedApiResource | null;
  time_of_day: string;
  trade_species: NamedApiResource | null;
  party_species: NamedApiResource | null;
  party_type: NamedApiResource | null;
  relative_physical_stats: number | null;
  needs_overworld_rain: boolean;
  turn_upside_down: boolean;
  gender: number | null;
}

interface EvolutionChainApiNode {
  species: NamedApiResource;
  evolution_details: EvolutionDetailApi[];
  evolves_to: EvolutionChainApiNode[];
}

interface EvolutionChainApiResponse {
  chain: EvolutionChainApiNode;
}

function mapEvolutionRequirement(
  detail: EvolutionDetailApi,
): EvolutionRequirement {
  return {
    trigger: detail.trigger.name,
    minLevel: detail.min_level,
    item: detail.item
      ? {
          name: detail.item.name,
          spriteUrl: getItemSpriteUrl(detail.item.name),
        }
      : null,
    heldItem: detail.held_item
      ? {
          name: detail.held_item.name,
          spriteUrl: getItemSpriteUrl(detail.held_item.name),
        }
      : null,
    minHappiness: detail.min_happiness,
    minBeauty: detail.min_beauty,
    minAffection: detail.min_affection,
    knownMoveName: detail.known_move?.name ?? null,
    knownMoveTypeName: detail.known_move_type?.name ?? null,
    locationName: detail.location?.name ?? null,
    timeOfDay: detail.time_of_day || null,
    tradeSpeciesName: detail.trade_species?.name ?? null,
    partySpeciesName: detail.party_species?.name ?? null,
    partyTypeName: detail.party_type?.name ?? null,
    relativePhysicalStats: detail.relative_physical_stats,
    needsOverworldRain: detail.needs_overworld_rain,
    turnUpsideDown: detail.turn_upside_down,
    genderId: detail.gender,
  };
}

export const pokemonApi = {
  /**
   * Fetches the initial list of Pokémon with basic name/id information for lazy loading.
   */
  async getPokemonList(
    limit: number = 20,
    offset: number = 0,
  ): Promise<{ name: string; id: number; url: string }[]> {
    const response = await fetch(
      `${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`,
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch Pokédex list at offset ${offset}`);
    }
    const data = await response.json();
    return data.results.map((item: { name: string; url: string }) => {
      const id = extractIdFromUrl(item.url);
      return {
        name: item.name,
        id,
        url: item.url,
      };
    });
  },

  /**
   * Fetches the full detailed data of a single Pokémon. Uses caching.
   */
  async getPokemonDetails(idOrName: string | number): Promise<Pokemon> {
    const normalizedKey =
      typeof idOrName === "string" ? idOrName.toLowerCase().trim() : idOrName;
    if (cache.pokemonDetails[normalizedKey]) {
      return cache.pokemonDetails[normalizedKey];
    }

    const response = await fetch(`${BASE_URL}/pokemon/${normalizedKey}`);
    if (!response.ok) {
      throw new Error(`Pokémon "${idOrName}" not found or API error`);
    }

    const data: Pokemon = await response.json();

    // Cache by both ID and Name to cover both lookup channels
    cache.pokemonDetails[data.id] = data;
    cache.pokemonDetails[data.name] = data;

    return data;
  },

  /**
   * Fetches several Pokémon in parallel with a concurrency limits.
   * Leverages caching to return instantly if pre-fetched.
   */
  async getPokemonDetailsBatch(
    idsOrNames: (string | number)[],
  ): Promise<Pokemon[]> {
    const promises = idsOrNames.map((id) =>
      this.getPokemonDetails(id).catch((err) => {
        console.error(`Error loading pokemon details batch for ${id}`, err);
        return null;
      }),
    );
    const results = await Promise.all(promises);
    return results.filter((p): p is Pokemon => p !== null);
  },

  /**
   * Fetches species details (flavor text, evolution chain link)
   */
  async getPokemonSpecies(idOrName: string | number): Promise<PokemonSpecies> {
    const normalizedKey =
      typeof idOrName === "string" ? idOrName.toLowerCase().trim() : idOrName;
    if (cache.pokemonSpecies[normalizedKey]) {
      return cache.pokemonSpecies[normalizedKey];
    }

    const response = await fetch(
      `${BASE_URL}/pokemon-species/${normalizedKey}`,
    );
    if (!response.ok) {
      throw new Error(`Species details for ${idOrName} not found`);
    }

    const data: PokemonSpecies = await response.json();
    cache.pokemonSpecies[data.id] = data;
    cache.pokemonSpecies[data.name] = data;
    return data;
  },

  /**
   * Fetches full evolution chain and resolves all nodes into details (name, id, image, types)
   */
  async getEvolutionChain(chainUrl: string): Promise<EvolutionChainNode> {
    if (cache.evolutionChains[chainUrl]) {
      return cache.evolutionChains[chainUrl];
    }

    const response = await fetch(chainUrl);
    if (!response.ok) {
      throw new Error("Failed to fetch evolution chain details");
    }

    const data: EvolutionChainApiResponse = await response.json();

    const buildTree = async (
      node: EvolutionChainApiNode,
      requirements: EvolutionRequirement[] = [],
      pathKey: string = "root",
    ): Promise<EvolutionChainNode> => {
      const displayId = extractIdFromUrl(node.species.url);
      const lookupName = node.species.name;

      let resolvedId = displayId;
      let resolvedSpeciesName = node.species.name;
      let resolvedLookupName = lookupName;
      let types: string[] = [];
      let imageUrl = getOfficialArtworkUrl(displayId);

      try {
        const detail = await this.getPokemonDetails(lookupName);
        resolvedId = detail.id;
        resolvedSpeciesName = detail.name;
        resolvedLookupName = detail.name;
        types = detail.types.map((typeObj) => typeObj.type.name);

        imageUrl =
          detail.sprites.other?.["official-artwork"]?.front_default ||
          detail.sprites.front_default ||
          getOfficialArtworkUrl(detail.id);
      } catch {
        try {
          const detail = await this.getPokemonDetails(displayId);
          resolvedId = detail.id;
          resolvedSpeciesName = detail.name;
          resolvedLookupName = detail.name;
          types = detail.types.map((typeObj) => typeObj.type.name);
          imageUrl =
            detail.sprites.other?.["official-artwork"]?.front_default ||
            detail.sprites.front_default ||
            getOfficialArtworkUrl(detail.id);
        } catch {
          types = [];
          imageUrl = getOfficialArtworkUrl(displayId);
        }
      }

      const evolvesTo = await Promise.all(
        node.evolves_to.map((childNode, childIndex) => {
          const requirements = childNode.evolution_details.map(
            mapEvolutionRequirement,
          );

          return buildTree(childNode, requirements, `${pathKey}-${childIndex}`);
        }),
      );

      return {
        nodeKey: `${resolvedSpeciesName}-${resolvedId}-${lookupName}-${pathKey}`,
        speciesName: resolvedSpeciesName,
        id: resolvedId,
        displayId,
        lookupName: resolvedLookupName,
        imageUrl,
        types,
        requirements,
        evolvesTo,
      };
    };

    const resolvedTree = await buildTree(data.chain, []);

    cache.evolutionChains[chainUrl] = resolvedTree;
    return resolvedTree;
  },
};
