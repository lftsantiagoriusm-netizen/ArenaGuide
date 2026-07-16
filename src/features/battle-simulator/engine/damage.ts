import type {
  BattleMove,
  BattlePokemon,
  DamageCalculation,
} from "../domain/types";
import { getTypeEffectiveness } from "./type-chart";
import {
  getStatStageMultiplier,
  type StatStages,
} from "@/features/competitive-data";

const zeroStages: StatStages = { attack: 0, defense: 0 };

export const calculateDamage = (
  attacker: BattlePokemon,
  defender: BattlePokemon,
  move: BattleMove,
  stages: {
    readonly attacker?: StatStages;
    readonly defender?: StatStages;
  } = {},
): DamageCalculation => {
  const stab = attacker.types.includes(move.type) ? 1.2 : 1;
  const effectiveness = getTypeEffectiveness(move.type, defender.types);
  const attack =
    attacker.stats.attack *
    getStatStageMultiplier((stages.attacker ?? zeroStages).attack);
  const defense =
    defender.stats.defense *
    getStatStageMultiplier((stages.defender ?? zeroStages).defense);
  const rawDamage =
    0.5 * move.power * (attack / defense) * stab * effectiveness;
  const damage = Math.max(1, Math.floor(rawDamage) + 1);
  return { damage, stab, effectiveness, attack, defense, rawDamage };
};
