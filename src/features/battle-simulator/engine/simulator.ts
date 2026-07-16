import type {
  BattleEvent,
  BattleMove,
  CombatantId,
  CombatantState,
  SimulationConfig,
  SimulationResult,
} from "../domain/types";
import { calculateDamage } from "./damage";

const MAX_ENERGY = 100;
const DEFAULT_MAX_TURNS = 500;
const opponentOf = (id: CombatantId): CombatantId => (id === "a" ? "b" : "a");

const createState = (
  id: CombatantId,
  pokemon: SimulationConfig["pokemonA"],
  shields: number,
): CombatantState => ({
  id,
  pokemon,
  hp: pokemon.stats.hp,
  energy: 0,
  shields,
  cooldown: 0,
  totalDamage: 0,
  fastMovesUsed: 0,
  chargedMovesUsed: 0,
  shieldsUsed: 0,
});

const event = (
  turn: number,
  type: BattleEvent["type"],
  actor: CombatantId,
  message: string,
  details: Pick<BattleEvent, "target" | "moveId" | "amount"> = {},
): BattleEvent => ({ turn, type, actor, message, ...details });

const affordableCharged = (state: CombatantState): BattleMove | undefined =>
  state.pokemon.chargedMoves.find(
    (move) => state.energy >= Math.abs(move.energyDelta),
  );

export const compareChargedPriority = (
  a: CombatantState,
  b: CombatantState,
): CombatantId => {
  if (a.pokemon.stats.attack === b.pokemon.stats.attack)
    return a.pokemon.id.localeCompare(b.pokemon.id) <= 0 ? "a" : "b";
  return a.pokemon.stats.attack > b.pokemon.stats.attack ? "a" : "b";
};

const resolveCharged = (
  turn: number,
  attacker: CombatantState,
  defender: CombatantState,
  move: BattleMove,
  config: SimulationConfig,
  timeline: BattleEvent[],
): void => {
  const cost = Math.abs(move.energyDelta);
  if (attacker.energy < cost || attacker.hp <= 0 || defender.hp <= 0) return;
  attacker.energy -= cost;
  attacker.chargedMovesUsed += 1;
  timeline.push(
    event(
      turn,
      "charged_move_used",
      attacker.id,
      `${attacker.pokemon.name} usó ${move.name}.`,
      { target: defender.id, moveId: move.id },
    ),
  );
  if (config.shieldStrategy.shouldShield(defender, move)) {
    defender.shields -= 1;
    defender.shieldsUsed += 1;
    timeline.push(
      event(
        turn,
        "shield_used",
        defender.id,
        `${defender.pokemon.name} utilizó un escudo.`,
        { target: attacker.id, moveId: move.id },
      ),
    );
    return;
  }
  const { damage } = calculateDamage(attacker.pokemon, defender.pokemon, move);
  defender.hp = Math.max(0, defender.hp - damage);
  attacker.totalDamage += damage;
  timeline.push(
    event(
      turn,
      "damage_applied",
      attacker.id,
      `${move.name} causó ${damage} de daño.`,
      { target: defender.id, moveId: move.id, amount: damage },
    ),
  );
};

const resolveFast = (
  turn: number,
  attacker: CombatantState,
  defender: CombatantState,
  timeline: BattleEvent[],
): number => {
  const move = attacker.pokemon.fastMove;
  timeline.push(
    event(
      turn,
      "fast_move_started",
      attacker.id,
      `${attacker.pokemon.name} inició ${move.name}.`,
      { target: defender.id, moveId: move.id },
    ),
  );
  const damage = calculateDamage(
    attacker.pokemon,
    defender.pokemon,
    move,
  ).damage;
  attacker.energy = Math.min(MAX_ENERGY, attacker.energy + move.energyDelta);
  attacker.fastMovesUsed += 1;
  attacker.cooldown = Math.max(1, move.turns);
  timeline.push(
    event(
      turn,
      "fast_move_resolved",
      attacker.id,
      `${move.name} se resolvió.`,
      { target: defender.id, moveId: move.id, amount: damage },
    ),
    event(
      turn,
      "energy_gained",
      attacker.id,
      `${attacker.pokemon.name} ganó ${move.energyDelta} de energía.`,
      { moveId: move.id, amount: move.energyDelta },
    ),
  );
  if (affordableCharged(attacker))
    timeline.push(
      event(
        turn,
        "charged_move_ready",
        attacker.id,
        `${attacker.pokemon.name} tiene un cargado disponible.`,
      ),
    );
  return damage;
};

const finish = (
  winner: SimulationResult["winner"],
  turns: number,
  a: CombatantState,
  b: CombatantState,
  timeline: BattleEvent[],
  error?: SimulationResult["error"],
): SimulationResult => {
  const loser = winner === "a" ? "b" : winner === "b" ? "a" : null;
  const bulkA = a.pokemon.stats.defense * a.pokemon.stats.hp;
  const bulkB = b.pokemon.stats.defense * b.pokemon.stats.hp;
  const explanation = [
    `${a.pokemon.name}: ${a.fastMovesUsed} rápidos y ${a.chargedMovesUsed} cargados.`,
    `${b.pokemon.name}: ${b.fastMovesUsed} rápidos y ${b.chargedMovesUsed} cargados.`,
    `${bulkA >= bulkB ? a.pokemon.name : b.pokemon.name} inició con mayor bulk efectivo.`,
    winner === "draw"
      ? "Ambos Pokémon se debilitaron en el mismo turno."
      : winner === "a" || winner === "b"
        ? `${winner === "a" ? a.pokemon.name : b.pokemon.name} terminó con vida restante.`
        : "La simulación no produjo un ganador dentro de las guardas configuradas.",
  ];
  timeline.push(
    event(
      turns,
      "battle_finished",
      winner === "b" ? "b" : "a",
      "El combate terminó.",
    ),
  );
  return {
    winner,
    loser,
    turns,
    timeline,
    combatants: { a, b },
    remainingHpPercent: {
      a: Math.round((a.hp / a.pokemon.stats.hp) * 100),
      b: Math.round((b.hp / b.pokemon.stats.hp) * 100),
    },
    certainty: "deterministic",
    explanation,
    ...(error ? { error } : {}),
  };
};

export const simulateBattle = (config: SimulationConfig): SimulationResult => {
  const timeline: BattleEvent[] = [];
  const a = createState("a", config.pokemonA, config.shieldsA);
  const b = createState("b", config.pokemonB, config.shieldsB);
  const maxTurns = config.maxTurns ?? DEFAULT_MAX_TURNS;
  const validPokemon = (pokemon: SimulationConfig["pokemonA"]): boolean =>
    pokemon.stats.hp > 0 &&
    pokemon.stats.attack > 0 &&
    pokemon.stats.defense > 0 &&
    pokemon.fastMove.kind === "fast" &&
    pokemon.fastMove.energyDelta > 0 &&
    pokemon.fastMove.turns > 0 &&
    pokemon.chargedMoves.every(
      (move) =>
        move.kind === "charged" && move.energyDelta < 0 && move.power > 0,
    );
  if (
    !validPokemon(config.pokemonA) ||
    !validPokemon(config.pokemonB) ||
    maxTurns < 1
  )
    return finish("invalid", 0, a, b, timeline, "invalid-config");

  for (let turn = 1; turn <= maxTurns; turn += 1) {
    const chargedA = affordableCharged(a);
    const chargedB = affordableCharged(b);
    if (chargedA || chargedB) {
      const order: readonly CombatantId[] =
        chargedA && chargedB
          ? [
              compareChargedPriority(a, b),
              opponentOf(compareChargedPriority(a, b)),
            ]
          : chargedA
            ? ["a"]
            : ["b"];
      order.forEach((id) => {
        const attacker = id === "a" ? a : b;
        const defender = id === "a" ? b : a;
        const move = affordableCharged(attacker);
        if (move)
          resolveCharged(turn, attacker, defender, move, config, timeline);
      });
    } else {
      const damageA = a.cooldown <= 0 ? resolveFast(turn, a, b, timeline) : 0;
      const damageB = b.cooldown <= 0 ? resolveFast(turn, b, a, timeline) : 0;
      a.cooldown = Math.max(0, a.cooldown - 1);
      b.cooldown = Math.max(0, b.cooldown - 1);
      a.hp = Math.max(0, a.hp - damageB);
      b.hp = Math.max(0, b.hp - damageA);
      a.totalDamage += damageA;
      b.totalDamage += damageB;
      if (damageA)
        timeline.push(
          event(
            turn,
            "damage_applied",
            "a",
            `${a.pokemon.fastMove.name} causó ${damageA} de daño.`,
            { target: "b", amount: damageA },
          ),
        );
      if (damageB)
        timeline.push(
          event(
            turn,
            "damage_applied",
            "b",
            `${b.pokemon.fastMove.name} causó ${damageB} de daño.`,
            { target: "a", amount: damageB },
          ),
        );
    }
    if (a.hp <= 0)
      timeline.push(
        event(turn, "pokemon_fainted", "a", `${a.pokemon.name} se debilitó.`),
      );
    if (b.hp <= 0)
      timeline.push(
        event(turn, "pokemon_fainted", "b", `${b.pokemon.name} se debilitó.`),
      );
    if (a.hp <= 0 || b.hp <= 0)
      return finish(
        a.hp <= 0 && b.hp <= 0 ? "draw" : a.hp > 0 ? "a" : "b",
        turn,
        a,
        b,
        timeline,
      );
  }
  return finish("turn-limit", maxTurns, a, b, timeline, "turn-limit");
};
