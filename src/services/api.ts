import { Pokemon, PokemonSpecies, EvolutionChainNode } from "../types";

// Memory cache to store fetched results and eliminate duplicate requests
const cache: {
  pokemonDetails: Record<string | number, Pokemon>;
  pokemonSpecies: Record<string | number, PokemonSpecies>;
  evolutionChains: Record<string, EvolutionChainNode[]>;
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

/**
 * Helper to extract ID from PokeAPI URL (e.g. "https://pokeapi.co/api/v2/pokemon/1/")
 */
export function extractIdFromUrl(url: string): number {
  const parts = url.replace(/\/$/, "").split("/");
  return parseInt(parts[parts.length - 1], 10);
}

export const pokemonApi = {
  /**
   * Fetches the initial list of Pokémon with basic name/id information for lazy loading.
   */
  async getPokemonList(limit: number = 20, offset: number = 0): Promise<{ name: string; id: number; url: string }[]> {
    const response = await fetch(`${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`);
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
    const normalizedKey = typeof idOrName === "string" ? idOrName.toLowerCase().trim() : idOrName;
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
  async getPokemonDetailsBatch(idsOrNames: (string | number)[]): Promise<Pokemon[]> {
    const promises = idsOrNames.map((id) =>
      this.getPokemonDetails(id).catch((err) => {
        console.error(`Error loading pokemon details batch for ${id}`, err);
        return null;
      })
    );
    const results = await Promise.all(promises);
    return results.filter((p): p is Pokemon => p !== null);
  },

  /**
   * Fetches species details (flavor text, evolution chain link)
   */
  async getPokemonSpecies(idOrName: string | number): Promise<PokemonSpecies> {
    const normalizedKey = typeof idOrName === "string" ? idOrName.toLowerCase().trim() : idOrName;
    if (cache.pokemonSpecies[normalizedKey]) {
      return cache.pokemonSpecies[normalizedKey];
    }

    const response = await fetch(`${BASE_URL}/pokemon-species/${normalizedKey}`);
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
  async getEvolutionChain(chainUrl: string): Promise<EvolutionChainNode[]> {
    if (cache.evolutionChains[chainUrl]) {
      return cache.evolutionChains[chainUrl];
    }

    const response = await fetch(chainUrl);
    if (!response.ok) {
      throw new Error("Failed to fetch evolution chain details");
    }

    const data = await response.json();
    const chainNodes: { speciesName: string; id: number }[] = [];

    // Traverse the recursive chain tree
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const traverse = (node: any) => {
      if (!node) return;
      const speciesName = node.species.name;
      const id = extractIdFromUrl(node.species.url);
      chainNodes.push({ speciesName, id });

      if (node.evolves_to && node.evolves_to.length > 0) {
        node.evolves_to.forEach((nextNode: unknown) => traverse(nextNode));
      }
    };

    traverse(data.chain);

    // Resolve images and types for each node in the evolution chain
    const resolvedNodes: EvolutionChainNode[] = await Promise.all(
      chainNodes.map(async (node) => {
        try {
          const detail = await this.getPokemonDetails(node.id);
          return {
            speciesName: node.speciesName,
            id: node.id,
            imageUrl: getOfficialArtworkUrl(node.id),
            types: detail.types.map((t) => t.type.name),
          };
        } catch {
          // Fallback if detail fetch fails
          return {
            speciesName: node.speciesName,
            id: node.id,
            imageUrl: getOfficialArtworkUrl(node.id),
            types: [],
          };
        }
      })
    );

    cache.evolutionChains[chainUrl] = resolvedNodes;
    return resolvedNodes;
  },
};
