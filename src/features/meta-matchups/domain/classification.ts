import type { MatchupClassification } from "./types";
import type { SimulationResult } from "@/features/battle-simulator";

export const MATCHUP_THRESHOLDS = {
  dominant: 60,
  favorable: 20,
  close: -20,
  unfavorable: -60,
} as const;

export const scoreMatchup = (simulation: SimulationResult): number => {
  const hpMargin =
    simulation.remainingHpPercent.a - simulation.remainingHpPercent.b;
  const energyMargin =
    simulation.combatants.a.energy - simulation.combatants.b.energy;
  const shieldMargin =
    simulation.combatants.a.shields - simulation.combatants.b.shields;
  return hpMargin + energyMargin * 0.25 + shieldMargin * 15;
};

export const classifyMatchup = (
  simulation: SimulationResult | null,
): { classification: MatchupClassification; score: number } => {
  if (
    !simulation ||
    simulation.winner === "invalid" ||
    simulation.winner === "turn-limit"
  )
    return { classification: "invalid", score: -999 };
  if (simulation.winner === "draw") return { classification: "draw", score: 0 };
  const score = scoreMatchup(simulation);
  if (score >= MATCHUP_THRESHOLDS.dominant)
    return { classification: "dominant", score };
  if (score >= MATCHUP_THRESHOLDS.favorable)
    return { classification: "favorable", score };
  if (score > MATCHUP_THRESHOLDS.close)
    return { classification: "close", score };
  if (score > MATCHUP_THRESHOLDS.unfavorable)
    return { classification: "unfavorable", score };
  return { classification: "very-unfavorable", score };
};
