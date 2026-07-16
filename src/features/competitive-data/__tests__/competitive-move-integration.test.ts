import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  adaptBuildToBattlePokemon,
  calculateDamage,
  firstChargedShieldStrategy,
  simulateBattle,
  type BattleBuild,
} from "@/features/battle-simulator";

const azumarill = (
  fastMoveId = "bubble",
  chargedMove1Id: "ice-beam" | "hydro-pump" = "ice-beam",
): BattleBuild => ({
  pokemonId: "azumarill",
  formId: "azumarill-standard",
  league: "great",
  attackIv: 0,
  defenseIv: 15,
  staminaIv: 15,
  level: 20,
  fastMoveId,
  chargedMove1Id,
  chargedMove2Id: "play-rough",
  shields: 0,
});
const registeel = (
  chargedMove1Id: "focus-blast" | "zap-cannon" = "focus-blast",
): BattleBuild => ({
  pokemonId: "registeel",
  formId: "registeel-standard",
  league: "great",
  attackIv: 0,
  defenseIv: 15,
  staminaIv: 15,
  level: 20,
  fastMoveId: "lock-on",
  chargedMove1Id,
  chargedMove2Id:
    chargedMove1Id === "focus-blast" ? "zap-cannon" : "focus-blast",
  shields: 0,
});
const adapt = (build: BattleBuild) => {
  const result = adaptBuildToBattlePokemon(build, "great");
  assert.ok(result.pokemon, result.error ?? "invalid fixture");
  return result.pokemon!;
};

describe("competitive move Battle Engine integration", () => {
  test("calculates documented integer damage", () => {
    const attacker = adapt(azumarill());
    const defender = adapt(registeel());
    const calculation = calculateDamage(attacker, defender, attacker.fastMove);
    assert.equal(Number.isInteger(calculation.damage), true);
    assert.equal(calculation.damage, 2);
  });
  test("gains the configured move energy", () => {
    const result = simulateBattle({
      league: "great",
      pokemonA: adapt(azumarill()),
      pokemonB: adapt(registeel()),
      shieldsA: 0,
      shieldsB: 0,
      maxTurns: 1,
      shieldStrategy: firstChargedShieldStrategy,
    });
    assert.ok(
      result.timeline.some(
        ({ actor, type, amount }) =>
          actor === "a" && type === "energy_gained" && amount === 11,
      ),
    );
  });
  test("preserves fast move duration", () =>
    assert.equal(adapt(azumarill()).fastMove.turns, 3));
  test("preserves charged move access cost", () =>
    assert.deepEqual(
      adapt(registeel()).chargedMoves.map(({ energyDelta }) => energyDelta),
      [-75, -80],
    ));
  test("reaches a lower-cost charged move sooner", () => {
    const opponent = adapt(azumarill());
    const run = (build: BattleBuild) =>
      simulateBattle({
        league: "great",
        pokemonA: adapt(build),
        pokemonB: opponent,
        shieldsA: 2,
        shieldsB: 2,
        maxTurns: 40,
        shieldStrategy: firstChargedShieldStrategy,
      }).timeline.find(
        ({ actor, type }) => actor === "a" && type === "charged_move_used",
      )?.turn;
    assert.equal(run(azumarill("bubble", "ice-beam")), 14);
    assert.equal(run(azumarill("bubble", "hydro-pump")), 18);
  });
  test("remains deterministic", () => {
    const config = {
      league: "great" as const,
      pokemonA: adapt(azumarill()),
      pokemonB: adapt(registeel()),
      shieldsA: 1 as const,
      shieldsB: 1 as const,
      shieldStrategy: firstChargedShieldStrategy,
    };
    assert.deepEqual(simulateBattle(config), simulateBattle(config));
  });
  test("changes the simulation when a legal move changes", () => {
    const opponent = adapt(registeel());
    const base = {
      league: "great" as const,
      pokemonB: opponent,
      shieldsA: 0 as const,
      shieldsB: 0 as const,
      shieldStrategy: firstChargedShieldStrategy,
    };
    const bubbleResult = simulateBattle({
      ...base,
      pokemonA: adapt(azumarill("bubble")),
    });
    const rockSmashResult = simulateBattle({
      ...base,
      pokemonA: adapt(azumarill("rock-smash")),
    });
    assert.notDeepEqual(bubbleResult, rockSmashResult);
  });
});
