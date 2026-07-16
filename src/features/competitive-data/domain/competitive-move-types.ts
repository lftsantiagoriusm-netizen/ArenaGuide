import type { PokemonType } from "@/features/pokedex";

export type CompetitiveMoveDataVersion = `arena-competitive-moves-v${number}`;
export type CompetitiveMoveCategory = "fast" | "charged";
export type CompetitiveMoveVerificationStatus = "verified" | "source-conflict";
export type CompetitiveMoveSourceId = "pvpoke";

interface CompetitiveMoveBase {
  readonly id: string;
  readonly name: string;
  readonly type: PokemonType;
  readonly power: number;
  readonly verificationStatus: CompetitiveMoveVerificationStatus;
  readonly source: CompetitiveMoveSourceId;
  readonly sourceCheckedAt: string;
}

export interface CompetitiveFastMove extends CompetitiveMoveBase {
  readonly category: "fast";
  readonly energyGain: number;
  readonly turns: number;
}

export interface CompetitiveChargedMove extends CompetitiveMoveBase {
  readonly category: "charged";
  readonly energyCost: number;
}

export type CompetitiveMove = CompetitiveFastMove | CompetitiveChargedMove;

export interface CompetitiveMoveSourceReference {
  readonly id: CompetitiveMoveSourceId;
  readonly name: string;
  readonly reference: string;
  readonly revision: string;
  readonly checkedAt: string;
}

export interface CompetitiveMoveDatasetMetadata {
  readonly schemaVersion: 1;
  readonly datasetVersion: CompetitiveMoveDataVersion;
  readonly status: "verified-with-documented-conflicts";
  readonly sourceName: string;
  readonly sourceReference: string;
  readonly sourceRevision: string;
  readonly checkedAt: string;
  readonly notes: string;
  readonly sources: readonly CompetitiveMoveSourceReference[];
}

export type CompetitiveMoveValidationCode =
  | "invalid-metadata"
  | "duplicate-id"
  | "empty-id"
  | "invalid-name"
  | "invalid-type"
  | "invalid-category"
  | "invalid-power"
  | "invalid-energy-gain"
  | "invalid-energy-cost"
  | "invalid-turns"
  | "incompatible-field"
  | "invalid-verification"
  | "invalid-source"
  | "invalid-source-date"
  | "missing-catalog-move"
  | "orphan-competitive-move";

export interface CompetitiveMoveValidationIssue {
  readonly code: CompetitiveMoveValidationCode;
  readonly message: string;
  readonly moveId?: string;
}

export type ResolveCompetitiveMoveErrorCode =
  "move-not-found" | "category-mismatch";

export interface ResolveCompetitiveMoveError {
  readonly code: ResolveCompetitiveMoveErrorCode;
  readonly moveId: string;
  readonly message: string;
}

export type ResolveCompetitiveMoveResult<TMove extends CompetitiveMove> =
  | { readonly ok: true; readonly move: TMove }
  | { readonly ok: false; readonly error: ResolveCompetitiveMoveError };
