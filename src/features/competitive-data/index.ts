export { competitiveDataMetadata } from "./data/competitive-dataset";
export { levelMultipliers } from "./data/level-multipliers.data";
export {
  resolveCompetitiveBuild,
  isBuildEligibleForLeague,
} from "./domain/build-resolver";
export {
  calculateCombatPower,
  calculateCompetitiveStats,
} from "./domain/combat-stats";
export { getLeagueRules, isCpEligibleForLeague } from "./domain/league-rules";
export {
  getLevelMultiplier,
  isSupportedLevel,
} from "./domain/level-multipliers";
export type {
  CompetitiveBuildError,
  CompetitiveBuildErrorCode,
  CompetitiveDataMetadata,
  CompetitiveDatasetVersion,
  EffectiveCompetitiveStats,
  LeagueRules,
  ResolvedCompetitiveBuild,
  ResolveBuildResult,
} from "./domain/types";
