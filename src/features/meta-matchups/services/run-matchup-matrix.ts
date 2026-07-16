import {
  adaptBuildToBattlePokemon,
  firstChargedShieldStrategy,
  simulateBattle,
} from "@/features/battle-simulator";
import { classifyMatchup } from "../domain/classification";
import { summarizeMatchups } from "../domain/matrix-operations";
import { validateMetaEntry } from "../domain/validation";
import type {
  BatchSimulationProgress,
  MatchupMatrix,
  MatchupSimulationRequest,
  MatchupSimulationResult,
} from "../domain/types";

export interface BatchExecutionHooks {
  readonly onProgress?: (progress: BatchSimulationProgress) => void;
  readonly isCurrent?: (runId: number) => boolean;
}

export const runMatchupMatrix = async (
  request: MatchupSimulationRequest,
  hooks: BatchExecutionHooks = {},
): Promise<MatchupMatrix> => {
  const results: MatchupSimulationResult[] = [];
  const analyzed = adaptBuildToBattlePokemon(
    {
      ...request.analyzedBuild,
      league: request.league,
      shields: request.shields,
    },
    request.league,
  );
  for (const [index, opponent] of request.opponents.entries()) {
    if (hooks.isCurrent && !hooks.isCurrent(request.runId))
      return {
        runId: request.runId,
        league: request.league,
        shields: request.shields,
        results,
        summary: summarizeMatchups(results),
        stale: true,
      };
    let item: MatchupSimulationResult;
    const opponentIssues = validateMetaEntry(opponent);
    const adaptedOpponent = adaptBuildToBattlePokemon(
      { ...opponent.build, shields: request.shields },
      request.league,
    );
    if (!analyzed.pokemon)
      item = {
        opponent,
        simulation: null,
        classification: "invalid",
        score: -999,
        failure: {
          code: "invalid-analyzed-build",
          message: analyzed.error ?? "Build analizado inválido.",
        },
      };
    else if (opponentIssues.length || !adaptedOpponent.pokemon)
      item = {
        opponent,
        simulation: null,
        classification: "invalid",
        score: -999,
        failure: {
          code: "invalid-opponent",
          message:
            opponentIssues.join(" ") ||
            adaptedOpponent.error ||
            "Rival inválido.",
        },
      };
    else {
      const simulation = simulateBattle({
        league: request.league,
        pokemonA: analyzed.pokemon,
        pokemonB: adaptedOpponent.pokemon,
        shieldsA: request.shields,
        shieldsB: request.shields,
        shieldStrategy: firstChargedShieldStrategy,
        ...(request.maxTurns ? { maxTurns: request.maxTurns } : {}),
      });
      const classified = classifyMatchup(simulation);
      item = { opponent, simulation, ...classified, failure: null };
    }
    results.push(item);
    hooks.onProgress?.({
      runId: request.runId,
      completed: index + 1,
      total: request.opponents.length,
      percentage: Math.round(((index + 1) / request.opponents.length) * 100),
    });
    await Promise.resolve();
  }
  return {
    runId: request.runId,
    league: request.league,
    shields: request.shields,
    results,
    summary: summarizeMatchups(results),
    stale: false,
  };
};
