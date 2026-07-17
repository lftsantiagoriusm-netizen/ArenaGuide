import type { League } from "@/features/pokedex";
import type { Team } from "@/features/team-builder";
import type { BattleEngineVersion } from "./types";
import type { MetaDatasetVersion } from "@/features/meta-matchups";
import type {
  CompetitiveDatasetVersion,
  CompetitiveMoveDataVersion,
  CompetitiveMoveEffectDataVersion,
} from "@/features/competitive-data";
import {
  competitiveDataMetadata,
  competitiveMoveDatasetMetadata,
  competitiveMoveEffectDatasetMetadata,
} from "@/features/competitive-data";

export const createTeamFingerprint = (
  team: Team,
  competitiveDataVersion: CompetitiveDatasetVersion = competitiveDataMetadata.datasetVersion,
  competitiveMoveDataVersion: CompetitiveMoveDataVersion = competitiveMoveDatasetMetadata.datasetVersion,
  competitiveMoveEffectDataVersion: CompetitiveMoveEffectDataVersion = competitiveMoveEffectDatasetMetadata.datasetVersion,
): string =>
  JSON.stringify([
    competitiveDataVersion,
    competitiveMoveDataVersion,
    competitiveMoveEffectDataVersion,
    team.slots.map(({ id, build }) => [
      id,
      build.pokemonId,
      build.formId,
      build.league,
      build.level,
      build.attackIv,
      build.defenseIv,
      build.staminaIv,
      build.fastMoveId,
      build.chargedMove1Id,
      build.chargedMove2Id,
    ]),
  ]);

export const createCoverageCompatibilityKey = (input: {
  readonly teamFingerprint: string;
  readonly league: League;
  readonly shields: 0 | 1 | 2;
  readonly engineVersion: BattleEngineVersion;
  readonly metaVersion: MetaDatasetVersion;
  readonly competitiveDataVersion: CompetitiveDatasetVersion;
  readonly competitiveMoveDataVersion: CompetitiveMoveDataVersion;
  readonly competitiveMoveEffectDataVersion: CompetitiveMoveEffectDataVersion;
}): string =>
  JSON.stringify([
    1,
    input.engineVersion,
    input.metaVersion,
    input.competitiveDataVersion,
    input.competitiveMoveDataVersion,
    input.competitiveMoveEffectDataVersion,
    input.league,
    input.shields,
    input.teamFingerprint,
  ]);
