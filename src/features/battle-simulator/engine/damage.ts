import type {
  BattleMove,
  BattlePokemon,
  DamageCalculation,
} from "../domain/types";
import { getTypeEffectiveness } from "./type-chart";

export const calculateDamage = (
  attacker: BattlePokemon,
  defender: BattlePokemon,
  move: BattleMove,
): DamageCalculation => {
  const stab = attacker.types.includes(move.type) ? 1.2 : 1;
  const effectiveness = getTypeEffectiveness(move.type, defender.types);
  const damage = Math.max(
    1,
    Math.floor(
      0.5 *
        move.power *
        (attacker.stats.attack / defender.stats.defense) *
        stab *
        effectiveness,
    ) + 1,
  );
  return { damage, stab, effectiveness };
};
