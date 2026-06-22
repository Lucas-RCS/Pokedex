export interface PokemonType {
  slot: number;
  type: {
    name: string;
    url: string;
  };
}

export interface PokemonAbility {
  ability: {
    name: string;
    url: string;
  };
  is_hidden: boolean;
}

export interface PokemonStat {
  base_stat: number;
  effort: number;
  stat: {
    name: string;
    url: string;
  };
}

export interface PokemonSprite {
  front_default: string | null;
  back_default: string | null;
  front_shiny: string | null;
  back_shiny: string | null;
  front_female?: string | null;
  back_female?: string | null;
  front_shiny_female?: string | null;
  back_shiny_female?: string | null;
  other?: {
    "official-artwork"?: {
      front_default: string | null;
    };
    dream_world?: {
      front_default: string | null;
    };
  };
}

export interface Pokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: PokemonType[];
  abilities: PokemonAbility[];
  stats: PokemonStat[];
  sprites: PokemonSprite;
}

export interface PokemonSpecies {
  id: number;
  name: string;
  gender_rate?: number;
  has_gender_differences?: boolean;
  flavor_text_entries: Array<{
    flavor_text: string;
    language: {
      name: string;
    };
  }>;
  evolution_chain: {
    url: string;
  };
}

export interface EvolutionChainNode {
  speciesName: string;
  id: number;
  imageUrl: string;
  types: string[];
}

export interface Team {
  id: string;
  name: string;
  pokemonIds: number[]; // up to 6
  icon: string; // emoji or lucide key
  color: string; // hex or tailwind class name
  createdAt: number;
}

export interface FilterState {
  search: string;
  type: string;
  sortBy: "number-asc" | "number-desc" | "name-asc" | "name-desc";
}
