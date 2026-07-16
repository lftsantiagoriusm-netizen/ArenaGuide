import { levelMultipliers } from "../data/level-multipliers.data";

export type LevelMultiplierResult =
  | { readonly ok: true; readonly level: number; readonly multiplier: number }
  | {
      readonly ok: false;
      readonly level: number;
      readonly error: "level-not-supported";
    };

export const getLevelMultiplier = (level: number): LevelMultiplierResult => {
  const entry = levelMultipliers.find((item) => item.level === level);
  return entry
    ? { ok: true, level: entry.level, multiplier: entry.multiplier }
    : { ok: false, level, error: "level-not-supported" };
};

export const isSupportedLevel = (level: number): boolean =>
  getLevelMultiplier(level).ok;
