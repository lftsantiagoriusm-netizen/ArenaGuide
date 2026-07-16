export { metaDataset, getMetaEntriesByLeague } from "./data/meta-dataset";
export {
  classifyMatchup,
  MATCHUP_THRESHOLDS,
  scoreMatchup,
} from "./domain/classification";
export {
  filterMatchups,
  sortMatchups,
  summarizeMatchups,
} from "./domain/matrix-operations";
export { validateMetaEntry } from "./domain/validation";
export { runMatchupMatrix } from "./services/run-matchup-matrix";
export type {
  MetaEntry,
  MetaDataset,
  MatchupMatrix,
  MatchupSimulationResult,
  MatchupClassification,
  MatchupFilter,
  MatchupSortOption,
  MatrixSettings,
} from "./domain/types";
