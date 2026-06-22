import { Team } from "../types";

/**
 * Encodes a team object into a compact, base64 URL-safe string.
 * Format: name|icon|color|id1,id2,id3,id4,id5,id6
 */
export function encodeTeam(team: { name: string; icon: string; color: string; pokemonIds: number[] }): string {
  const normalizedName = team.name.replace(/\|/g, "-"); // prevent pipe collision
  const joinedIds = team.pokemonIds.join(",");
  const rawString = `${normalizedName}|${team.icon}|${team.color}|${joinedIds}`;
  
  // UTF-8 safe base64 encoding
  return btoa(encodeURIComponent(rawString).replace(/%([0-9A-F]{2})/g, (_, p1) => {
    return String.fromCharCode(parseInt(p1, 16));
  }));
}

/**
 * Decodes a base64 string back into a team configuration.
 * Returns null if the format is corrupted or invalid.
 */
export function decodeTeam(encoded: string): { name: string; icon: string; color: string; pokemonIds: number[] } | null {
  try {
    // UTF-8 safe base64 decoding
    const decodedRaw = decodeURIComponent(
      atob(encoded.replace(/ /g, "+"))
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    const parts = decodedRaw.split("|");
    if (parts.length < 4) return null;

    const [name, icon, color, idsString] = parts;
    const pokemonIds = idsString
      ? idsString
          .split(",")
          .map((id) => parseInt(id, 10))
          .filter((id) => !isNaN(id))
      : [];

    return {
      name,
      icon,
      color,
      pokemonIds: pokemonIds.slice(0, 6), // ensure clamp of max 6
    };
  } catch (err) {
    console.error("Failed to decode team parameter:", err);
    return null;
  }
}
