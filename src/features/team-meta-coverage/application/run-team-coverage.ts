import {
  runMatchupMatrix,
  type MatchupSimulationResult,
  type MetaEntry,
} from "@/features/meta-matchups";
import type { TeamSlotId } from "@/features/team-builder";
import { createTeamFingerprint } from "../domain/fingerprint";
import {
  classifyRivalCoverage,
  getCloseSlots,
  getCoveringSlots,
  selectBestTeamAnswer,
  summarizeTeamCoverage,
} from "../domain/coverage";
import type {
  MemberMatchup,
  TeamCoverageMatrix,
  TeamCoverageProgress,
  TeamCoverageRequest,
  TeamCoverageRow,
} from "../domain/types";
import { validateTeamCoverageInput } from "../domain/validation";

export interface TeamCoverageExecutionHooks {
  readonly onProgress?: (progress: TeamCoverageProgress) => void;
  readonly isCurrent?: (runId: number) => boolean;
  readonly isCancelled?: () => boolean;
}

const memberResult = (
  slotId: TeamSlotId,
  result: MatchupSimulationResult,
): MemberMatchup => {
  const simulation = result.simulation;
  const outcome =
    simulation?.winner === "a"
      ? "win"
      : simulation?.winner === "b"
        ? "loss"
        : simulation?.winner === "draw"
          ? "draw"
          : "invalid";
  return {
    slotId,
    classification: result.classification,
    score: result.score,
    outcome,
    remainingHp: simulation?.remainingHpPercent.a ?? null,
    remainingEnergy: simulation?.combatants.a.energy ?? null,
    remainingShields: simulation?.combatants.a.shields ?? null,
    turns: simulation?.turns ?? null,
    error: result.failure?.message ?? null,
  };
};

const createRow = (
  opponent: MetaEntry,
  members: readonly [MemberMatchup, MemberMatchup, MemberMatchup],
): TeamCoverageRow => {
  const best = selectBestTeamAnswer(members);
  return {
    opponent,
    members,
    classification: classifyRivalCoverage(members),
    bestSlotId: best?.slotId ?? null,
    coveringSlots: getCoveringSlots(members),
    closeSlots: getCloseSlots(members),
    incomplete: members.some(
      ({ classification }) => classification === "invalid",
    ),
  };
};

const emptyResult = (
  request: TeamCoverageRequest,
  cancelled: boolean,
  stale: boolean,
): TeamCoverageMatrix => ({
  runId: request.runId,
  league: request.league,
  shields: request.shields,
  teamFingerprint: createTeamFingerprint(request.team),
  rows: [],
  summary: summarizeTeamCoverage([]),
  cancelled,
  stale,
});

export const runTeamCoverageMatrix = async (
  request: TeamCoverageRequest,
  hooks: TeamCoverageExecutionHooks = {},
): Promise<TeamCoverageMatrix> => {
  if (!validateTeamCoverageInput(request.team, request.league).valid)
    return emptyResult(request, false, false);
  const total = request.team.slots.length * request.opponents.length;
  const bySlot: MatchupSimulationResult[][] = [];
  for (const [slotIndex, slot] of request.team.slots.entries()) {
    const slotId = slot.id;
    const matrix = await runMatchupMatrix(
      {
        runId: request.runId,
        analyzedBuild: { ...slot.build, shields: request.shields },
        league: request.league,
        shields: request.shields,
        opponents: request.opponents,
      },
      {
        isCurrent: (runId) =>
          !hooks.isCancelled?.() && (hooks.isCurrent?.(runId) ?? true),
        onProgress: ({ completed }) => {
          const aggregateCompleted =
            slotIndex * request.opponents.length + completed;
          hooks.onProgress?.({
            runId: request.runId,
            completed: aggregateCompleted,
            total,
            percentage: total
              ? Math.round((aggregateCompleted / total) * 100)
              : 100,
          });
        },
      },
    );
    if (matrix.stale) {
      const cancelled = hooks.isCancelled?.() ?? false;
      return emptyResult(request, cancelled, !cancelled);
    }
    bySlot[slotId - 1] = [...matrix.results];
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
  }
  const rows = request.opponents.map((opponent, index) =>
    createRow(opponent, [
      memberResult(1, bySlot[0]![index]!),
      memberResult(2, bySlot[1]![index]!),
      memberResult(3, bySlot[2]![index]!),
    ]),
  );
  return {
    runId: request.runId,
    league: request.league,
    shields: request.shields,
    teamFingerprint: createTeamFingerprint(request.team),
    rows,
    summary: summarizeTeamCoverage(rows),
    cancelled: false,
    stale: false,
  };
};
