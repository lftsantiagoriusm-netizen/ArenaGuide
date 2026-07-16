import type { League } from "@/features/pokedex";
import type { PokemonBuild, Team, TeamSlot, TeamSlotId } from "./types";

const leagues: readonly League[] = ["great", "ultra", "master"];
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;
const isNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const isBuild = (value: unknown): value is PokemonBuild =>
  isRecord(value) &&
  typeof value.pokemonId === "string" &&
  typeof value.formId === "string" &&
  typeof value.league === "string" &&
  leagues.includes(value.league as League) &&
  isNumber(value.attackIv) &&
  isNumber(value.defenseIv) &&
  isNumber(value.staminaIv) &&
  isNumber(value.level) &&
  typeof value.fastMoveId === "string" &&
  typeof value.chargedMove1Id === "string" &&
  typeof value.chargedMove2Id === "string";

const isSlot = (value: unknown, expectedId: TeamSlotId): value is TeamSlot =>
  isRecord(value) && value.id === expectedId && isBuild(value.build);

const isTeam = (value: unknown): value is Team =>
  isRecord(value) &&
  value.version === 1 &&
  Array.isArray(value.slots) &&
  value.slots.length === 3 &&
  isSlot(value.slots[0], 1) &&
  isSlot(value.slots[1], 2) &&
  isSlot(value.slots[2], 3);

export const serializeTeam = (team: Team): string => JSON.stringify(team);

export const deserializeTeam = (serialized: string): Team | null => {
  try {
    const parsed: unknown = JSON.parse(serialized);
    return isTeam(parsed) ? parsed : null;
  } catch {
    return null;
  }
};
