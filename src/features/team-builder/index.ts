export {
  createEmptyBuild,
  createEmptyTeam,
  detectDuplicates,
  updateTeamBuild,
  validateBuild,
  validateTeam,
} from "./domain/team-builder";
export { deserializeTeam, serializeTeam } from "./domain/team-serialization";
export { loadTeam } from "./persistence/team-storage";
export type {
  PokemonBuild,
  Team,
  TeamSlot,
  TeamSlotId,
  ValidationIssue,
} from "./domain/types";
