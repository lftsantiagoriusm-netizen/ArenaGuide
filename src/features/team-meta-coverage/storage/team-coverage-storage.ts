import { BATTLE_ENGINE_VERSION } from "@/features/battle-simulator";
import { metaDataset } from "@/features/meta-matchups";
import type { League } from "@/features/pokedex";
import {
  competitiveDataMetadata,
  competitiveMoveDatasetMetadata,
  competitiveMoveEffectDatasetMetadata,
} from "@/features/competitive-data";
import type {
  StoredTeamCoverage,
  TeamCoverageFilter,
  TeamCoverageSort,
} from "../domain/types";

const STORAGE_KEY = "arena-guide:team-meta-coverage:v1";
const leagues: readonly League[] = ["great", "ultra", "master"];
const filters: readonly TeamCoverageFilter[] = [
  "all",
  "covered",
  "uncertain",
  "critical",
  "invalid",
  "incomplete",
];
const sorts: readonly TeamCoverageSort[] = [
  "severity",
  "name",
  "best-score",
  "redundancy",
];
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isStoredResult = (value: unknown): boolean => {
  if (value === null) return true;
  return (
    isRecord(value) &&
    typeof value.runId === "number" &&
    typeof value.league === "string" &&
    [0, 1, 2].includes(Number(value.shields)) &&
    typeof value.teamFingerprint === "string" &&
    Array.isArray(value.rows) &&
    isRecord(value.summary) &&
    typeof value.cancelled === "boolean" &&
    typeof value.stale === "boolean"
  );
};

export const serializeStoredCoverage = (value: StoredTeamCoverage): string =>
  JSON.stringify(value);

export const parseStoredCoverageResult = (
  serialized: string,
): StoredTeamCoverage | null => {
  try {
    const value: unknown = JSON.parse(serialized);
    if (
      !isRecord(value) ||
      value.schemaVersion !== 1 ||
      value.engineVersion !== BATTLE_ENGINE_VERSION ||
      value.competitiveDataVersion !== competitiveDataMetadata.datasetVersion ||
      value.competitiveMoveDataVersion !==
        competitiveMoveDatasetMetadata.datasetVersion ||
      value.competitiveMoveEffectDataVersion !==
        competitiveMoveEffectDatasetMetadata.datasetVersion ||
      value.metaVersion !== metaDataset.version ||
      typeof value.computedAt !== "string" ||
      typeof value.teamFingerprint !== "string" ||
      typeof value.compatibilityKey !== "string" ||
      typeof value.league !== "string" ||
      !leagues.includes(value.league as League) ||
      ![0, 1, 2].includes(Number(value.shields)) ||
      typeof value.filter !== "string" ||
      !filters.includes(value.filter as TeamCoverageFilter) ||
      typeof value.sort !== "string" ||
      !sorts.includes(value.sort as TeamCoverageSort) ||
      !isStoredResult(value.result)
    )
      return null;
    return value as unknown as StoredTeamCoverage;
  } catch {
    return null;
  }
};

export const isStoredCoverageCompatible = (
  stored: StoredTeamCoverage,
  compatibilityKey: string,
): boolean =>
  stored.schemaVersion === 1 &&
  stored.engineVersion === BATTLE_ENGINE_VERSION &&
  stored.competitiveDataVersion === competitiveDataMetadata.datasetVersion &&
  stored.competitiveMoveDataVersion ===
    competitiveMoveDatasetMetadata.datasetVersion &&
  stored.competitiveMoveEffectDataVersion ===
    competitiveMoveEffectDatasetMetadata.datasetVersion &&
  stored.metaVersion === metaDataset.version &&
  stored.compatibilityKey === compatibilityKey &&
  stored.result !== null &&
  !stored.result.cancelled &&
  !stored.result.stale;

export const loadStoredCoverage = (
  storage: Pick<Storage, "getItem">,
): StoredTeamCoverage | null => {
  try {
    const serialized = storage.getItem(STORAGE_KEY);
    return serialized ? parseStoredCoverageResult(serialized) : null;
  } catch {
    return null;
  }
};

export const saveStoredCoverage = (
  storage: Pick<Storage, "setItem">,
  value: StoredTeamCoverage,
): boolean => {
  try {
    storage.setItem(STORAGE_KEY, serializeStoredCoverage(value));
    return true;
  } catch {
    return false;
  }
};
