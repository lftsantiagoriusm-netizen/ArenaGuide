import type { League } from "@/features/pokedex";
import type { Team } from "@/features/team-builder";
import type { BattleEngineVersion } from "./types";
import type { MetaDatasetVersion } from "@/features/meta-matchups";
import type { CompetitiveDatasetVersion } from "@/features/competitive-data";
import { competitiveDataMetadata } from "@/features/competitive-data";

export const createTeamFingerprint = (
  team: Team,
  competitiveDataVersion: CompetitiveDatasetVersion = competitiveDataMetadata.datasetVersion,
): string =>
  JSON.stringify([
    competitiveDataVersion,
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
}): string =>
  JSON.stringify([
    1,
    input.engineVersion,
    input.metaVersion,
    input.competitiveDataVersion,
    input.league,
    input.shields,
    input.teamFingerprint,
  ]);
