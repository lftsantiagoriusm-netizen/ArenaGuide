export { adaptBuildToBattlePokemon } from "./adapters/pokedex-adapter";
export type { BattleBuild } from "./adapters/pokedex-adapter";
export { calculateDamage } from "./engine/damage";
export { simulateBattle, compareChargedPriority } from "./engine/simulator";
export { calculateEffectiveStats } from "./engine/stats";
export { getTypeEffectiveness } from "./engine/type-chart";
export { firstChargedShieldStrategy } from "./strategies/first-charged-shield";
export { BATTLE_ENGINE_VERSION } from "./domain/version";
export { createBattleSnapshot, summarizeBattleDamage } from "./domain/evidence";
export type {
  BattleMove,
  BattlePokemon,
  SimulationConfig,
  SimulationResult,
} from "./domain/types";
