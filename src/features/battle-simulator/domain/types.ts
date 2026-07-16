import type { League, PokemonType } from "@/features/pokedex";
import type {
  BattleStat,
  MoveEffectSupport,
  StatStages,
} from "@/features/competitive-data";

export type CombatantId = "a" | "b";
export type BattleMoveKind = "fast" | "charged";

export interface BattleMove {
  readonly id: string;
  readonly name: string;
  readonly type: PokemonType;
  readonly kind: BattleMoveKind;
  readonly power: number;
  readonly energyDelta: number;
  readonly turns: number;
}

export interface EffectiveStats {
  readonly attack: number;
  readonly defense: number;
  readonly stamina: number;
  readonly hp: number;
  readonly cp: number;
  readonly levelMultiplier: number;
}

export interface BattlePokemon {
  readonly id: string;
  readonly name: string;
  readonly types: readonly PokemonType[];
  readonly stats: EffectiveStats;
  readonly fastMove: BattleMove;
  readonly chargedMoves: readonly [BattleMove, BattleMove];
}

export interface CombatantState {
  readonly id: CombatantId;
  readonly pokemon: BattlePokemon;
  hp: number;
  energy: number;
  shields: number;
  cooldown: number;
  totalDamage: number;
  fastMovesUsed: number;
  chargedMovesUsed: number;
  shieldsUsed: number;
  statStages: StatStages;
}

export interface CombatantSnapshot {
  readonly hp: number;
  readonly energy: number;
  readonly shields: number;
  readonly statStages: StatStages;
}
export type BattleSnapshot = Readonly<Record<CombatantId, CombatantSnapshot>>;
export type DamageCategory = "fast" | "charged";
export interface BattleEventEffect {
  readonly moveId: string;
  readonly target: CombatantId;
  readonly stat: BattleStat;
  readonly requestedStages: number;
  readonly appliedStages: number;
  readonly support: MoveEffectSupport;
  readonly reason?: "probabilistic" | "unsupported" | "stage-limit";
}

export interface BattleState {
  readonly turn: number;
  readonly combatants: Readonly<Record<CombatantId, CombatantState>>;
  readonly finished: boolean;
}

export type BattleEventType =
  | "fast_move_started"
  | "fast_move_resolved"
  | "energy_gained"
  | "charged_move_ready"
  | "charged_move_used"
  | "energy_spent"
  | "shield_used"
  | "damage_applied"
  | "move_effect_applied"
  | "move_effect_rejected"
  | "pokemon_fainted"
  | "battle_finished";

export interface BattleEvent {
  readonly turn: number;
  readonly type: BattleEventType;
  readonly actor: CombatantId;
  readonly target?: CombatantId;
  readonly moveId?: string;
  readonly amount?: number;
  readonly damageCategory?: DamageCategory;
  readonly before?: BattleSnapshot;
  readonly after?: BattleSnapshot;
  readonly effect?: BattleEventEffect;
  readonly message: string;
}

export type BattleTimeline = readonly BattleEvent[];
export type SimulationWinner = CombatantId | "draw" | "invalid" | "turn-limit";
export type SimulationError = "invalid-config" | "illegal-move" | "turn-limit";

export interface ShieldStrategy {
  readonly id: string;
  readonly name: string;
  readonly shouldShield: (
    state: Readonly<CombatantState>,
    move: BattleMove,
  ) => boolean;
}

export interface SimulationConfig {
  readonly league: League;
  readonly pokemonA: BattlePokemon;
  readonly pokemonB: BattlePokemon;
  readonly shieldsA: 0 | 1 | 2;
  readonly shieldsB: 0 | 1 | 2;
  readonly maxTurns?: number;
  readonly shieldStrategy: ShieldStrategy;
}

export interface SimulationResult {
  readonly winner: SimulationWinner;
  readonly loser: CombatantId | null;
  readonly turns: number;
  readonly timeline: BattleTimeline;
  readonly combatants: Readonly<Record<CombatantId, CombatantState>>;
  readonly remainingHpPercent: Readonly<Record<CombatantId, number>>;
  readonly certainty: "deterministic";
  readonly explanation: readonly string[];
  readonly error?: SimulationError;
  readonly damage: Readonly<Record<CombatantId, BattleDamageSummary>>;
}

export interface BattleDamageSummary {
  readonly fast: number;
  readonly charged: number;
  readonly total: number;
}

export interface DamageCalculation {
  readonly damage: number;
  readonly stab: number;
  readonly effectiveness: number;
  readonly attack: number;
  readonly defense: number;
  readonly rawDamage: number;
}
