import type { League } from "@/features/pokedex";
import type {
  MetaDatasetVersion,
  MetaEntry,
  MatchupClassification,
} from "@/features/meta-matchups";
import type {
  Team,
  TeamSlotId,
  ValidationIssue,
} from "@/features/team-builder";
import type { BATTLE_ENGINE_VERSION } from "@/features/battle-simulator";
import type { CompetitiveDatasetVersion } from "@/features/competitive-data";

export type TeamCoverageClassification =
  "covered" | "uncertain" | "critical" | "invalid";
export type TeamSlotKey = "slot1" | "slot2" | "slot3";
export type TeamCoverageFilter =
  "all" | TeamCoverageClassification | "incomplete";
export type TeamCoverageSort =
  "severity" | "name" | "best-score" | "redundancy";
export type BattleEngineVersion = typeof BATTLE_ENGINE_VERSION;

export interface MemberMatchup {
  readonly slotId: TeamSlotId;
  readonly classification: MatchupClassification;
  readonly score: number;
  readonly outcome: "win" | "loss" | "draw" | "invalid";
  readonly remainingHp: number | null;
  readonly remainingEnergy: number | null;
  readonly remainingShields: number | null;
  readonly turns: number | null;
  readonly error: string | null;
}

export interface TeamCoverageRow {
  readonly opponent: MetaEntry;
  readonly members: readonly [MemberMatchup, MemberMatchup, MemberMatchup];
  readonly classification: TeamCoverageClassification;
  readonly bestSlotId: TeamSlotId | null;
  readonly coveringSlots: readonly TeamSlotId[];
  readonly closeSlots: readonly TeamSlotId[];
  readonly incomplete: boolean;
}

export interface MemberCoverageSummary {
  readonly slotId: TeamSlotId;
  readonly evaluated: number;
  readonly wins: number;
  readonly draws: number;
  readonly losses: number;
  readonly invalid: number;
  readonly covered: number;
  readonly bestAnswerCount: number;
  readonly coverageRate: number;
  readonly dependencyRate: number;
}

export interface TeamCoverageSummary {
  readonly total: number;
  readonly covered: number;
  readonly uncertain: number;
  readonly critical: number;
  readonly invalid: number;
  readonly safeCoverageRate: number;
  readonly uncertaintyRate: number;
  readonly criticalRate: number;
  readonly redundantCoverage: number;
  readonly mostUsedBestAnswer: TeamSlotId | null;
  readonly mostReliedUponMember: TeamSlotId | null;
  readonly members: readonly [
    MemberCoverageSummary,
    MemberCoverageSummary,
    MemberCoverageSummary,
  ];
}

export interface TeamCoverageMatrix {
  readonly runId: number;
  readonly league: League;
  readonly shields: 0 | 1 | 2;
  readonly teamFingerprint: string;
  readonly rows: readonly TeamCoverageRow[];
  readonly summary: TeamCoverageSummary;
  readonly cancelled: boolean;
  readonly stale: boolean;
}

export interface TeamCoverageRequest {
  readonly runId: number;
  readonly team: Team;
  readonly league: League;
  readonly shields: 0 | 1 | 2;
  readonly opponents: readonly MetaEntry[];
}

export interface TeamCoverageProgress {
  readonly runId: number;
  readonly completed: number;
  readonly total: number;
  readonly percentage: number;
}

export interface TeamCoverageValidation {
  readonly valid: boolean;
  readonly issues: readonly ValidationIssue[];
}

export interface StoredTeamCoverage {
  readonly schemaVersion: 1;
  readonly engineVersion: BattleEngineVersion;
  readonly competitiveDataVersion: CompetitiveDatasetVersion;
  readonly metaVersion: MetaDatasetVersion;
  readonly computedAt: string;
  readonly teamFingerprint: string;
  readonly compatibilityKey: string;
  readonly league: League;
  readonly shields: 0 | 1 | 2;
  readonly filter: TeamCoverageFilter;
  readonly sort: TeamCoverageSort;
  readonly result: TeamCoverageMatrix | null;
}
