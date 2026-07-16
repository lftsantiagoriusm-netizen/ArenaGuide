import type {
  BattleDamageSummary,
  BattleEvent,
  BattleSnapshot,
  CombatantId,
  CombatantState,
} from "./types";

export const createBattleSnapshot = (
  a: CombatantState,
  b: CombatantState,
): BattleSnapshot => ({
  a: {
    hp: a.hp,
    energy: a.energy,
    shields: a.shields,
    statStages: { ...a.statStages },
  },
  b: {
    hp: b.hp,
    energy: b.energy,
    shields: b.shields,
    statStages: { ...b.statStages },
  },
});

export const summarizeBattleDamage = (
  timeline: readonly BattleEvent[],
  actor: CombatantId,
): BattleDamageSummary => {
  const summary = timeline.reduce(
    (accumulator, item) => {
      if (item.type === "damage_applied" && item.actor === actor)
        accumulator[item.damageCategory ?? "fast"] += item.amount ?? 0;
      return accumulator;
    },
    { fast: 0, charged: 0 },
  );
  return { ...summary, total: summary.fast + summary.charged };
};
