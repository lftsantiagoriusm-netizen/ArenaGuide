import type { League } from "@/features/pokedex";
import type { BattleBuild } from "@/features/battle-simulator";
import type {
  MatchupFilter,
  MatchupSortOption,
  MatrixSettings,
} from "../domain/types";

const KEY = "arena-guide:meta-matchups:v1";
const leagues: readonly League[] = ["great", "ultra", "master"];
const filters: readonly MatchupFilter[] = [
  "all",
  "wins",
  "losses",
  "draws",
  "favorable",
  "close",
  "unfavorable",
  "invalid",
];
const sorts: readonly MatchupSortOption[] = [
  "best",
  "worst",
  "name",
  "remaining-hp",
  "duration",
  "weight",
];
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;
const isIntegerIv = (value: unknown): value is number =>
  typeof value === "number" &&
  Number.isInteger(value) &&
  value >= 0 &&
  value <= 15;
const isBattleBuild = (value: unknown): value is BattleBuild => {
  if (!isRecord(value)) return false;
  return (
    typeof value.pokemonId === "string" &&
    (value.formId === undefined || typeof value.formId === "string") &&
    typeof value.league === "string" &&
    leagues.includes(value.league as League) &&
    isIntegerIv(value.attackIv) &&
    isIntegerIv(value.defenseIv) &&
    isIntegerIv(value.staminaIv) &&
    typeof value.level === "number" &&
    Number.isFinite(value.level) &&
    value.level >= 1 &&
    value.level <= 51 &&
    typeof value.fastMoveId === "string" &&
    typeof value.chargedMove1Id === "string" &&
    typeof value.chargedMove2Id === "string" &&
    [0, 1, 2].includes(Number(value.shields))
  );
};

export const serializeMatrixSettings = (settings: MatrixSettings): string =>
  JSON.stringify(settings);
export const deserializeMatrixSettings = (
  value: string,
): MatrixSettings | null => {
  try {
    const parsed: unknown = JSON.parse(value);
    if (
      !isRecord(parsed) ||
      parsed.version !== 1 ||
      typeof parsed.league !== "string" ||
      !leagues.includes(parsed.league as League) ||
      ![0, 1, 2].includes(Number(parsed.shields)) ||
      typeof parsed.filter !== "string" ||
      !filters.includes(parsed.filter as MatchupFilter) ||
      typeof parsed.sort !== "string" ||
      !sorts.includes(parsed.sort as MatchupSortOption) ||
      !isBattleBuild(parsed.build)
    )
      return null;
    return parsed as unknown as MatrixSettings;
  } catch {
    return null;
  }
};
export const loadMatrixSettings = (
  storage: Pick<Storage, "getItem">,
): MatrixSettings | null => {
  const value = storage.getItem(KEY);
  return value ? deserializeMatrixSettings(value) : null;
};
export const saveMatrixSettings = (
  storage: Pick<Storage, "setItem">,
  settings: MatrixSettings,
): void => storage.setItem(KEY, serializeMatrixSettings(settings));
