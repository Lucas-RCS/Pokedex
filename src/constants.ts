export const TYPE_COLORS: Record<string, string> = {
  normal: "#A8A77A",
  fire: "#EE8130",
  water: "#6390F0",
  electric: "#F7D02C",
  grass: "#7AC74C",
  ice: "#96D9D6",
  fighting: "#C22E28",
  poison: "#A33EA1",
  ground: "#E2BF65",
  flying: "#A98FF3",
  psychic: "#F95587",
  bug: "#A6B91A",
  rock: "#B6A136",
  ghost: "#735797",
  dragon: "#6F35FC",
  dark: "#705746",
  steel: "#B7B7CE",
  fairy: "#D685AD",
};

export const TYPE_TRANSLATIONS: Record<string, string> = {
  normal: "Normal",
  fire: "Fogo",
  water: "Água",
  electric: "Elétrico",
  grass: "Planta",
  ice: "Gelo",
  fighting: "Lutador",
  poison: "Veneno",
  ground: "Terrestre",
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

export const TYPE_ABBREVIATIONS: Record<string, string> = {
  normal: "NR",
  fire: "FG",
  water: "AG",
  electric: "EL",
  grass: "PL",
  ice: "GL",
  fighting: "LT",
  poison: "VN",
  ground: "TR",
  flying: "VD",
  psychic: "PS",
  bug: "IS",
  rock: "PD",
  ghost: "FT",
  dragon: "DG",
  dark: "SB",
  steel: "AC",
  fairy: "FD",
};

export const STAT_TRANSLATIONS: Record<string, string> = {
  hp: "HP",
  attack: "Ataque",
  defense: "Defesa",
  "special-attack": "Atq. Especial",
  "special-defense": "Def. Especial",
  speed: "Velocidade",
};

export const STAT_COLORS: Record<string, string> = {
  hp: "bg-rose-500",
  attack: "bg-orange-500",
  defense: "bg-blue-500",
  "special-attack": "bg-yellow-500",
  "special-defense": "bg-purple-500",
  speed: "bg-emerald-500",
};

export interface PokeballTheme {
  name: string;
  subtitle: string;
  colorName: string;
  themeColor: string;
  themeBg: string;
  themeBorder: string;
  textColor: string;
  textMuted: string;
  badgeBg: string;
  gradientText: string;
  description: string;
}

export const POKEBALLS_THEMED_CONFIGS: PokeballTheme[] = [
  {
    name: "Pokébola Clássica",
    subtitle: "A consagrada esfera vermelha e branca para todos os treinadores",
    colorName: "red",
    themeColor: "#EF4444",
    themeBg: "from-red-600/20 via-slate-950/20 to-transparent",
    themeBorder: "border-red-500/30",
    textColor: "text-red-400",
    textMuted: "text-red-200/60",
    badgeBg: "bg-red-500/10 text-red-400 border border-red-500/20",
    gradientText: "from-red-400 to-rose-300",
    description:
      "Ideal para iniciar sua jornada e capturar criaturas em canaviais e subúrbios.",
  },
  {
    name: "Great Ball",
    subtitle:
      "A esfera azul equipada com estabilizadores de captura para o profissional",
    colorName: "blue",
    themeColor: "#3B82F6",
    themeBg: "from-blue-600/20 via-slate-950/20 to-transparent",
    themeBorder: "border-blue-500/30",
    textColor: "text-blue-400",
    textMuted: "text-blue-200/60",
    badgeBg: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    gradientText: "from-blue-400 to-indigo-300",
    description:
      "Excelente desempenho para capturas de complexidade moderada e Pokémon de nível médio.",
  },
  {
    name: "Ultra Ball",
    subtitle:
      "A excelência em tecnologia de contenção com acabamento em ouro preto",
    colorName: "yellow",
    themeColor: "#EAB308",
    themeBg: "from-yellow-600/20 via-slate-950/20 to-transparent",
    themeBorder: "border-yellow-500/30",
    textColor: "text-yellow-400",
    textMuted: "text-yellow-200/60",
    badgeBg: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
    gradientText: "from-yellow-400 to-amber-300",
    description:
      "Desenhada para capturar os espécimes mais raros e lendários das profundezas do mundo.",
  },
];
