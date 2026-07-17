import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  changeStatStage,
  competitiveMoveEffects,
  getCompetitiveMoveEffect,
  getStatStageMultiplier,
} from "../index";

describe("Pokémon GO PvP stat stages", () => {
  test("uses the verified divisor-four multipliers", () => {
    assert.equal(getStatStageMultiplier(0), 1);
    assert.equal(getStatStageMultiplier(1), 1.25);
    assert.equal(getStatStageMultiplier(4), 2);
    assert.equal(getStatStageMultiplier(-1), 0.8);
    assert.equal(getStatStageMultiplier(-4), 0.5);
  });
  test("clamps positive and negative changes", () => {
    assert.deepEqual(changeStatStage({ attack: 4, defense: -4 }, "attack", 2), {
      stages: { attack: 4, defense: -4 },
      appliedDelta: 0,
    });
    assert.deepEqual(
      changeStatStage({ attack: 0, defense: -3 }, "defense", -2),
      {
        stages: { attack: 0, defense: -4 },
        appliedDelta: -1,
      },
    );
  });
});

describe("competitive move effect dataset", () => {
  test("contains the six supported deterministic effects", () => {
    assert.equal(
      competitiveMoveEffects.filter(
        ({ support }) => support === "deterministic",
      ).length,
      6,
    );
  });
  test("keeps probabilistic effects explicit and unsupported by execution", () => {
    const crunch = getCompetitiveMoveEffect("crunch");
    assert.equal(crunch?.support, "probabilistic");
    assert.equal(crunch?.probability, 0.2);
  });
  test("resolves known effects and leaves ordinary moves unchanged", () => {
    assert.equal(getCompetitiveMoveEffect("flame-charge")?.stages, 1);
    assert.equal(getCompetitiveMoveEffect("hydro-cannon"), undefined);
  });
});
