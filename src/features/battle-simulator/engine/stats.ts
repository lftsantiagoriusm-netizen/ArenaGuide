import type { BaseStats } from "@/features/pokedex";
import {
  calculateCompetitiveStats,
  getLevelMultiplier,
} from "@/features/competitive-data";
import type { EffectiveStats } from "../domain/types";

export interface StatInputs {
  readonly baseStats: BaseStats;
  readonly attackIv: number;
  readonly defenseIv: number;
  readonly staminaIv: number;
  readonly level: number;
}

export const calculateEffectiveStats = (
  input: StatInputs,
): EffectiveStats | null => {
  const level = getLevelMultiplier(input.level);
  if (!level.ok) return null;
  return calculateCompetitiveStats({
    baseStats: input.baseStats,
    attackIv: input.attackIv,
    defenseIv: input.defenseIv,
    staminaIv: input.staminaIv,
    levelMultiplier: level.multiplier,
  });
};
