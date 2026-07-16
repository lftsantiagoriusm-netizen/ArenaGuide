import type { BaseStats } from "@/features/pokedex";
import type { EffectiveStats } from "../domain/types";

export interface StatInputs {
  readonly baseStats: BaseStats;
  readonly attackIv: number;
  readonly defenseIv: number;
  readonly staminaIv: number;
  readonly level: number;
}

const anchors = [
  { level: 1, value: 0.094 },
  { level: 10, value: 0.4225 },
  { level: 20, value: 0.5974 },
  { level: 30, value: 0.7317 },
  { level: 40, value: 0.7903 },
  { level: 50, value: 0.8403 },
] as const;

export const getProvisionalLevelMultiplier = (level: number): number => {
  const upperIndex = anchors.findIndex((anchor) => anchor.level >= level);
  if (upperIndex <= 0) return anchors[0].value;
  const upper = anchors[upperIndex];
  const lower = anchors[upperIndex - 1];
  if (!upper || !lower) return anchors.at(-1)?.value ?? 0.8403;
  return (
    lower.value +
    ((level - lower.level) / (upper.level - lower.level)) *
      (upper.value - lower.value)
  );
};

export const calculateEffectiveStats = (input: StatInputs): EffectiveStats => {
  const levelMultiplier = getProvisionalLevelMultiplier(input.level);
  const attack = (input.baseStats.attack + input.attackIv) * levelMultiplier;
  const defense = (input.baseStats.defense + input.defenseIv) * levelMultiplier;
  const stamina = (input.baseStats.stamina + input.staminaIv) * levelMultiplier;
  return {
    attack,
    defense,
    stamina,
    hp: Math.max(10, Math.floor(stamina)),
    cp: Math.max(
      10,
      Math.floor(
        (attack *
          Math.sqrt(defense) *
          Math.sqrt(stamina) *
          levelMultiplier *
          levelMultiplier) /
          10,
      ),
    ),
    levelMultiplier,
  };
};
