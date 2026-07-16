import assert from "node:assert/strict";
import { describe, test } from "node:test";
import type { PokemonBuild } from "@/features/team-builder";
import {
  calculateCombatPower,
  calculateCompetitiveStats,
  competitiveDataMetadata,
  getLeagueRules,
  getLevelMultiplier,
  isCpEligibleForLeague,
  levelMultipliers,
  resolveCompetitiveBuild,
} from "../index";

const build = (overrides: Partial<PokemonBuild> = {}): PokemonBuild => ({
  pokemonId: "azumarill",
  formId: "azumarill-standard",
  league: "great",
  attackIv: 0,
  defenseIv: 15,
  staminaIv: 15,
  level: 20.5,
  fastMoveId: "bubble",
  chargedMove1Id: "ice-beam",
  chargedMove2Id: "play-rough",
  ...overrides,
});

describe("level multipliers", () => {
  test("resolves an integer level", () => {
    const result = getLevelMultiplier(20);
    assert.equal(result.ok && result.multiplier, 0.5974);
  });
  test("resolves a half level", () => {
    const result = getLevelMultiplier(20.5);
    assert.equal(result.ok && result.multiplier, 0.604823665);
  });
  test("rejects a level outside the catalog", () =>
    assert.equal(getLevelMultiplier(50.5).ok, false));
  test("does not interpolate missing levels", () =>
    assert.equal(getLevelMultiplier(20.25).ok, false));
  test("keeps the frozen dataset immutable", () =>
    assert.equal(Object.isFrozen(levelMultipliers), true));
});

describe("combat power and effective stats", () => {
  const reference = {
    baseStats: { attack: 300, defense: 182, stamina: 214 },
    attackIv: 15,
    defenseIv: 15,
    staminaIv: 15,
    levelMultiplier: 0.7903,
  };
  test("calculates a verified Mewtwo level 40 reference", () =>
    assert.equal(calculateCombatPower(reference), 4178));
  test("applies floor rounding", () =>
    assert.equal(Number.isInteger(calculateCombatPower(reference)), true));
  test("respects minimum CP", () =>
    assert.equal(
      calculateCombatPower({
        baseStats: { attack: 1, defense: 1, stamina: 1 },
        attackIv: 0,
        defenseIv: 0,
        staminaIv: 0,
        levelMultiplier: 0.094,
      }),
      10,
    ));
  test("different IV can change CP", () =>
    assert.notEqual(
      calculateCombatPower(reference),
      calculateCombatPower({ ...reference, attackIv: 0 }),
    ));
  test("different levels change CP", () =>
    assert.notEqual(
      calculateCombatPower(reference),
      calculateCombatPower({ ...reference, levelMultiplier: 0.84029999 }),
    ));
  test("calculates effective attack", () =>
    assert.equal(calculateCompetitiveStats(reference).attack, 315 * 0.7903));
  test("calculates effective defense", () =>
    assert.equal(calculateCompetitiveStats(reference).defense, 197 * 0.7903));
  test("calculates effective HP", () =>
    assert.equal(
      calculateCompetitiveStats(reference).hp,
      Math.floor(229 * 0.7903),
    ));
  test("does not mutate input", () => {
    const snapshot = structuredClone(reference);
    calculateCompetitiveStats(reference);
    assert.deepEqual(reference, snapshot);
  });
});

describe("league rules", () => {
  test("accepts 1500 in Great League", () =>
    assert.equal(isCpEligibleForLeague(1500, "great"), true));
  test("rejects 1501 in Great League", () =>
    assert.equal(isCpEligibleForLeague(1501, "great"), false));
  test("accepts 2500 in Ultra League", () =>
    assert.equal(isCpEligibleForLeague(2500, "ultra"), true));
  test("rejects 2501 in Ultra League", () =>
    assert.equal(isCpEligibleForLeague(2501, "ultra"), false));
  test("Master League has no CP limit", () =>
    assert.equal(getLeagueRules("master").cpLimit, null));
});

describe("competitive build resolver", () => {
  test("resolves a valid build", () =>
    assert.equal(resolveCompetitiveBuild(build()).ok, true));
  test("detects a missing species", () =>
    assert.equal(
      resolveCompetitiveBuild(build({ pokemonId: "missing" })).ok,
      false,
    ));
  test("detects a missing form", () =>
    assert.equal(
      resolveCompetitiveBuild(build({ formId: "missing" })).ok,
      false,
    ));
  test("rejects an unsupported level", () =>
    assert.equal(resolveCompetitiveBuild(build({ level: 20.25 })).ok, false));
  test("rejects invalid IV", () =>
    assert.equal(resolveCompetitiveBuild(build({ attackIv: 16 })).ok, false));
  test("rejects an illegal move", () =>
    assert.equal(
      resolveCompetitiveBuild(build({ fastMoveId: "lock-on" })).ok,
      false,
    ));
  test("rejects a build above its league limit", () => {
    const result = resolveCompetitiveBuild(
      build({
        pokemonId: "feraligatr",
        formId: "feraligatr-standard",
        level: 50,
        fastMoveId: "shadow-claw",
        chargedMove1Id: "hydro-cannon",
        chargedMove2Id: "ice-beam",
      }),
    );
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.error.code, "over-cp-limit");
  });
  test("includes dataset version", () => {
    const result = resolveCompetitiveBuild(build());
    assert.equal(
      result.ok && result.build.dataVersion,
      competitiveDataMetadata.datasetVersion,
    );
  });
  test("is deterministic", () =>
    assert.deepEqual(
      resolveCompetitiveBuild(build()),
      resolveCompetitiveBuild(build()),
    ));
});
