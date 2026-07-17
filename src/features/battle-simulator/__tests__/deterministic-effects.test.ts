import assert from "node:assert/strict";
import { describe, test } from "node:test";
import type {
  BattleMove,
  BattlePokemon,
  SimulationConfig,
} from "../domain/types";
import { calculateDamage } from "../engine/damage";
import { simulateBattle } from "../engine/simulator";
import { firstChargedShieldStrategy } from "../strategies/first-charged-shield";

const fast: BattleMove = {
  id: "counter",
  name: "Counter",
  type: "fighting",
  kind: "fast",
  power: 1,
  energyDelta: 50,
  turns: 1,
};
const charged = (id: string): BattleMove => ({
  id,
  name: id,
  type: "normal",
  kind: "charged",
  power: 10,
  energyDelta: -40,
  turns: 0,
});
const mon = (id: string, chargedId: string): BattlePokemon => ({
  id,
  name: id,
  types: ["normal"],
  stats: {
    attack: 100,
    defense: 100,
    stamina: 300,
    hp: 300,
    cp: 1500,
    levelMultiplier: 0.7,
  },
  fastMove: fast,
  chargedMoves: [charged(chargedId), charged(`${id}-other`)],
});
const config = (moveId: string, shields: 0 | 1 | 2 = 0): SimulationConfig => ({
  league: "great",
  pokemonA: mon("a", moveId),
  pokemonB: mon("b", "hydro-cannon"),
  shieldsA: shields,
  shieldsB: shields,
  maxTurns: 2,
  shieldStrategy: firstChargedShieldStrategy,
});

describe("deterministic move effects in battle", () => {
  test("applies a self attack buff after damage", () => {
    const result = simulateBattle(config("flame-charge"));
    assert.equal(result.combatants.a.statStages.attack, 1);
    const event = result.timeline.find(
      ({ type }) => type === "move_effect_applied",
    );
    assert.equal(event?.before?.a.statStages.attack, 0);
    assert.equal(event?.after?.a.statStages.attack, 1);
  });
  test("applies an opponent defense debuff", () => {
    assert.equal(
      simulateBattle(config("acid-spray")).combatants.b.statStages.defense,
      -2,
    );
  });
  test("applies deterministic effects even when charged damage is shielded", () => {
    const result = simulateBattle(config("flame-charge", 1));
    assert.ok(result.timeline.some(({ type }) => type === "shield_used"));
    assert.equal(result.combatants.a.statStages.attack, 1);
  });
  test("never applies probabilistic effects", () => {
    const result = simulateBattle(config("crunch"));
    assert.deepEqual(result.combatants.b.statStages, { attack: 0, defense: 0 });
    assert.equal(
      result.timeline.find(({ type }) => type === "move_effect_rejected")
        ?.effect?.reason,
      "probabilistic",
    );
  });
  test("keeps the same result for the same input", () => {
    assert.deepEqual(
      simulateBattle(config("rage-fist")),
      simulateBattle(config("rage-fist")),
    );
  });
  test("uses current stages in the single damage calculator", () => {
    const attacker = mon("a", "flame-charge");
    const defender = mon("b", "hydro-cannon");
    const move = charged("flame-charge");
    const neutral = calculateDamage(attacker, defender, move);
    const boosted = calculateDamage(attacker, defender, move, {
      attacker: { attack: 1, defense: 0 },
    });
    assert.ok(boosted.damage > neutral.damage);
    assert.equal(boosted.attack, 125);
  });
  test("records fast and charged damage separately with snapshots", () => {
    const result = simulateBattle(config("flame-charge"));
    assert.ok(result.damage.a.fast > 0);
    assert.ok(result.damage.a.charged > 0);
    assert.equal(
      result.damage.a.total,
      result.damage.a.fast + result.damage.a.charged,
    );
    assert.ok(
      result.timeline
        .filter(({ type }) => type === "damage_applied")
        .every(({ before, after, moveId }) => before && after && moveId),
    );
  });
  test("records charged energy consumption", () => {
    const spent = simulateBattle(config("flame-charge")).timeline.find(
      ({ type }) => type === "energy_spent",
    );
    assert.equal(spent?.amount, 40);
    assert.equal(
      (spent?.before?.a.energy ?? 0) - (spent?.after?.a.energy ?? 0),
      40,
    );
  });
  test("does not let a fainted CMP loser execute its effect", () => {
    const fragile = {
      ...mon("b", "flame-charge"),
      stats: { ...mon("b", "flame-charge").stats, hp: 1 },
    };
    const result = simulateBattle({
      ...config("flame-charge"),
      pokemonB: fragile,
      maxTurns: 4,
    });
    const appliedByB = result.timeline.some(
      (item) => item.actor === "b" && item.type === "move_effect_applied",
    );
    assert.equal(appliedByB, false);
  });
});
