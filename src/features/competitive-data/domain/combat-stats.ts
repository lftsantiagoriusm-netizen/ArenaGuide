import type { BaseStats } from "@/features/pokedex";
import type { EffectiveCompetitiveStats } from "./types";

export interface CombatStatInput {
  readonly baseStats: BaseStats;
  readonly attackIv: number;
  readonly defenseIv: number;
  readonly staminaIv: number;
  readonly levelMultiplier: number;
}

export const calculateCombatPower = (input: CombatStatInput): number =>
  Math.max(
    10,
    Math.floor(
      ((input.baseStats.attack + input.attackIv) *
        Math.sqrt(input.baseStats.defense + input.defenseIv) *
        Math.sqrt(input.baseStats.stamina + input.staminaIv) *
        input.levelMultiplier ** 2) /
        10,
    ),
  );

export const calculateCompetitiveStats = (
  input: CombatStatInput,
): EffectiveCompetitiveStats => {
  const attack =
    (input.baseStats.attack + input.attackIv) * input.levelMultiplier;
  const defense =
    (input.baseStats.defense + input.defenseIv) * input.levelMultiplier;
  const stamina =
    (input.baseStats.stamina + input.staminaIv) * input.levelMultiplier;
  return {
    attack,
    defense,
    stamina,
    hp: Math.max(10, Math.floor(stamina)),
    cp: calculateCombatPower(input),
    levelMultiplier: input.levelMultiplier,
  };
};
