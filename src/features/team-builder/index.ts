export {
  createEmptyBuild,
  createEmptyTeam,
  detectDuplicates,
  updateTeamBuild,
  validateBuild,
  validateTeam,
} from "./domain/team-builder";
export { deserializeTeam, serializeTeam } from "./domain/team-serialization";
export type {
  PokemonBuild,
  Team,
  TeamSlot,
  TeamSlotId,
  ValidationIssue,
} from "./domain/types";
