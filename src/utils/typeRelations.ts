export interface TypeRelations {
  weak4x: string[];
  weak2x: string[];
  neutral: string[];
  resistHalf: string[];
  resistQuarter: string[];
  immune: string[];
}

interface DefensiveProfile {
  weak: string[];
  resist: string[];
  immune: string[];
}

const DEFENSIVE_CHART: Record<string, DefensiveProfile> = {
  normal: {
    weak: ["fighting"],
    resist: [],
    immune: ["ghost"],
  },
  fire: {
    weak: ["water", "ground", "rock"],
    resist: ["fire", "grass", "ice", "bug", "steel", "fairy"],
    immune: [],
  },
  water: {
    weak: ["grass", "electric"],
    resist: ["fire", "water", "ice", "steel"],
    immune: [],
  },
  electric: {
    weak: ["ground"],
    resist: ["electric", "flying", "steel"],
    immune: [],
  },
  grass: {
    weak: ["fire", "ice", "poison", "flying", "bug"],
    resist: ["water", "electric", "grass", "ground"],
    immune: [],
  },
  ice: {
    weak: ["fire", "fighting", "rock", "steel"],
    resist: ["ice"],
    immune: [],
  },
  fighting: {
    weak: ["flying", "psychic", "fairy"],
    resist: ["bug", "rock", "dark"],
    immune: [],
  },
  poison: {
    weak: ["ground", "psychic"],
    resist: ["grass", "fighting", "poison", "bug", "fairy"],
    immune: [],
  },
  ground: {
    weak: ["water", "grass", "ice"],
    resist: ["poison", "rock"],
    immune: ["electric"],
  },
  flying: {
    weak: ["electric", "ice", "rock"],
    resist: ["grass", "fighting", "bug"],
    immune: ["ground"],
  },
  psychic: {
    weak: ["bug", "ghost", "dark"],
    resist: ["fighting", "psychic"],
    immune: [],
  },
  bug: {
    weak: ["fire", "flying", "rock"],
    resist: ["grass", "fighting", "ground"],
    immune: [],
  },
  rock: {
    weak: ["water", "grass", "fighting", "ground", "steel"],
    resist: ["normal", "fire", "poison", "flying"],
    immune: [],
  },
  ghost: {
    weak: ["ghost", "dark"],
    resist: ["poison", "bug"],
    immune: ["normal", "fighting"],
  },
  dragon: {
    weak: ["ice", "dragon", "fairy"],
    resist: ["fire", "water", "electric", "grass"],
    immune: [],
  },
  dark: {
    weak: ["fighting", "bug", "fairy"],
    resist: ["ghost", "dark"],
    immune: ["psychic"],
  },
  steel: {
    weak: ["fire", "fighting", "ground"],
    resist: ["normal", "grass", "ice", "flying", "psychic", "bug", "rock", "dragon", "steel", "fairy"],
    immune: ["poison"],
  },
  fairy: {
    weak: ["poison", "steel"],
    resist: ["fighting", "bug", "dark"],
    immune: ["dragon"],
  },
};

const ALL_TYPES = [
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

export function calculateTypeRelations(types: string[]): TypeRelations {
  const result: TypeRelations = {
    weak4x: [],
    weak2x: [],
    neutral: [],
    resistHalf: [],
    resistQuarter: [],
    immune: [],
  };

  if (!types || types.length === 0) {
    return result;
  }

  for (const offensiveType of ALL_TYPES) {
    let multiplier = 1.0;

    for (const defType of types) {
      const lowerDefType = defType.toLowerCase();
      const profile = DEFENSIVE_CHART[lowerDefType];
      if (!profile) continue;

      if (profile.weak.includes(offensiveType)) {
        multiplier *= 2.0;
      } else if (profile.resist.includes(offensiveType)) {
        multiplier *= 0.5;
      } else if (profile.immune.includes(offensiveType)) {
        multiplier *= 0.0;
      }
    }

    if (multiplier === 4.0) {
      result.weak4x.push(offensiveType);
    } else if (multiplier === 2.0) {
      result.weak2x.push(offensiveType);
    } else if (multiplier === 1.0) {
      result.neutral.push(offensiveType);
    } else if (multiplier === 0.5) {
      result.resistHalf.push(offensiveType);
    } else if (multiplier === 0.25) {
      result.resistQuarter.push(offensiveType);
    } else if (multiplier === 0.0) {
      result.immune.push(offensiveType);
    }
  }

  return result;
}
