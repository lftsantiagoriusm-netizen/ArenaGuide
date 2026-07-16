import assert from "node:assert/strict";
import { describe, test } from "node:test";
import type {
  BattleMove,
  BattlePokemon,
  SimulationConfig,
} from "../domain/types";
import { calculateDamage } from "../engine/damage";
import { compareChargedPriority, simulateBattle } from "../engine/simulator";
import { getTypeEffectiveness } from "../engine/type-chart";
import { firstChargedShieldStrategy } from "../strategies/first-charged-shield";
import { adaptBuildToBattlePokemon } from "../adapters/pokedex-adapter";

const move = (
  kind: "fast" | "charged",
  type: BattleMove["type"] = "normal",
  overrides: Partial<BattleMove> = {},
): BattleMove => ({
  id: `${kind}-${type}`,
  name: `${kind} ${type}`,
  type,
  kind,
  power: kind === "fast" ? 5 : 70,
  energyDelta: kind === "fast" ? 10 : -40,
  turns: kind === "fast" ? 1 : 0,
  ...overrides,
});
const pokemon = (
  id: string,
  overrides: Partial<BattlePokemon> = {},
): BattlePokemon => ({
  id,
  name: id.toUpperCase(),
  types: ["normal"],
  stats: {
    attack: 100,
    defense: 100,
    stamina: 100,
    hp: 40,
    cp: 1000,
    levelMultiplier: 0.5,
  },
  fastMove: move("fast"),
  chargedMoves: [
    move("charged", "normal", { id: "charged-1" }),
    move("charged", "normal", { id: "charged-2", energyDelta: -60 }),
  ],
  ...overrides,
});
const config = (
  shields: 0 | 1 | 2 = 0,
  overrides: Partial<SimulationConfig> = {},
): SimulationConfig => ({
  league: "great",
  pokemonA: pokemon("a", {
    stats: {
      attack: 110,
      defense: 100,
      stamina: 100,
      hp: 40,
      cp: 1000,
      levelMultiplier: 0.5,
    },
  }),
  pokemonB: pokemon("b"),
  shieldsA: shields,
  shieldsB: shields,
  maxTurns: 200,
  shieldStrategy: firstChargedShieldStrategy,
  ...overrides,
});

describe("battle mechanics", () => {
  test("applies STAB", () => {
    assert.equal(
      calculateDamage(
        pokemon("a", { types: ["water"] }),
        pokemon("b"),
        move("fast", "water"),
      ).stab,
      1.2,
    );
  });
  test("applies super effective damage", () => {
    assert.equal(getTypeEffectiveness("water", ["fire"]), 1.6);
  });
  test("applies resisted damage", () => {
    assert.equal(getTypeEffectiveness("water", ["grass"]), 0.625);
  });
  test("stacks double resistance", () => {
    assert.equal(getTypeEffectiveness("grass", ["fire", "flying"]), 0.390625);
  });
  test("stacks double weakness", () => {
    assert.equal(
      getTypeEffectiveness("rock", ["fire", "flying"]),
      2.5600000000000005,
    );
  });
  test("damage always has a minimum of one", () => {
    assert.equal(
      calculateDamage(
        pokemon("a", {
          stats: {
            attack: 1,
            defense: 1,
            stamina: 1,
            hp: 1,
            cp: 10,
            levelMultiplier: 0.1,
          },
        }),
        pokemon("b", {
          stats: {
            attack: 100,
            defense: 9999,
            stamina: 100,
            hp: 100,
            cp: 1000,
            levelMultiplier: 0.5,
          },
        }),
        move("fast", "normal", { power: 1 }),
      ).damage,
      1,
    );
  });
});

describe("battle resolution", () => {
  test("gains energy from fast moves", () => {
    assert.ok(
      simulateBattle(config()).timeline.some(
        ({ type }) => type === "energy_gained",
      ),
    );
  });
  test("consumes energy on charged moves", () => {
    const result = simulateBattle(config());
    assert.ok(result.combatants.a.chargedMovesUsed > 0);
    assert.ok(result.combatants.a.energy < 100);
  });
  test("does not fire a charged move without enough energy", () => {
    const result = simulateBattle(config(0, { maxTurns: 1 }));
    assert.equal(
      result.timeline.some(({ type }) => type === "charged_move_used"),
      false,
    );
  });
  test("uses a shield against the first charged move", () => {
    assert.ok(
      simulateBattle(config(1)).timeline.some(
        ({ type }) => type === "shield_used",
      ),
    );
  });
  test("does not use more shields than available", () => {
    const result = simulateBattle(config(1));
    assert.ok(
      result.combatants.a.shieldsUsed <= 1 &&
        result.combatants.b.shieldsUsed <= 1,
    );
  });
  test("records a fainted Pokémon", () => {
    assert.ok(
      simulateBattle(config()).timeline.some(
        ({ type }) => type === "pokemon_fainted",
      ),
    );
  });
  test("resolves CMP by effective attack", () => {
    const result = simulateBattle(config(0, { maxTurns: 1 }));
    assert.equal(
      compareChargedPriority(result.combatants.a, result.combatants.b),
      "a",
    );
  });
  test("resolves 0 vs 0", () => {
    assert.ok(["a", "b", "draw"].includes(simulateBattle(config(0)).winner));
  });
  test("resolves 1 vs 1", () => {
    assert.ok(["a", "b", "draw"].includes(simulateBattle(config(1)).winner));
  });
  test("resolves 2 vs 2", () => {
    assert.ok(["a", "b", "draw"].includes(simulateBattle(config(2)).winner));
  });
  test("is reproducible", () => {
    assert.deepEqual(simulateBattle(config(1)), simulateBattle(config(1)));
  });
  test("stops at the configured turn limit", () => {
    const result = simulateBattle(config(0, { maxTurns: 1 }));
    assert.equal(result.winner, "turn-limit");
  });
  test("returns an explicit invalid result", () => {
    const invalid = pokemon("bad", { fastMove: move("charged") });
    const result = simulateBattle(config(0, { pokemonA: invalid }));
    assert.equal(result.winner, "invalid");
  });
  test("can resolve a controlled simultaneous draw", () => {
    const glass = pokemon("same", {
      stats: {
        attack: 100,
        defense: 100,
        stamina: 10,
        hp: 1,
        cp: 100,
        levelMultiplier: 0.5,
      },
      fastMove: move("fast", "normal", { power: 10 }),
    });
    assert.equal(
      simulateBattle(config(0, { pokemonA: glass, pokemonB: glass })).winner,
      "draw",
    );
  });
});

test("rejects an illegal move through the Pokédex adapter", () => {
  const adapted = adaptBuildToBattlePokemon(
    {
      pokemonId: "azumarill",
      league: "great",
      attackIv: 0,
      defenseIv: 15,
      staminaIv: 15,
      level: 20,
      fastMoveId: "lock-on",
      chargedMove1Id: "ice-beam",
      chargedMove2Id: "play-rough",
      shields: 1,
    },
    "great",
  );
  assert.equal(adapted.pokemon, null);
});

test("rejects an over-cap build through the Pokédex adapter", () => {
  const adapted = adaptBuildToBattlePokemon(
    {
      pokemonId: "feraligatr",
      formId: "feraligatr-standard",
      league: "great",
      attackIv: 15,
      defenseIv: 15,
      staminaIv: 15,
      level: 50,
      fastMoveId: "shadow-claw",
      chargedMove1Id: "hydro-cannon",
      chargedMove2Id: "ice-beam",
      shields: 1,
    },
    "great",
  );
  assert.equal(adapted.pokemon, null);
  assert.match(adapted.error ?? "", /CP/i);
});
