import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { chargedMoves, fastMoves } from "@/features/pokedex/data/move-catalog";
import {
  adaptCompetitiveChargedMoveToBattleMove,
  adaptCompetitiveFastMoveToBattleMove,
  competitiveMoveDatasetMetadata,
  competitiveMoves,
  getCompetitiveMoveById,
  isCompetitiveMoveDatasetCompatible,
  resolveCompetitiveChargedMove,
  resolveCompetitiveFastMove,
  resolveCompetitiveMove,
  validateCompetitiveMove,
  validateCompetitiveMoveCoverage,
  validateCompetitiveMoveDataset,
  validateCompetitiveMoveMetadata,
} from "../index";

const bubble = () => resolveCompetitiveFastMove("bubble");
const iceBeam = () => resolveCompetitiveChargedMove("ice-beam");
const codes = (value: unknown) =>
  validateCompetitiveMove(value).map(({ code }) => code);

describe("competitive move resolution", () => {
  test("resolves a known fast move", () => {
    const result = bubble();
    assert.equal(result.ok && result.move.energyGain, 11);
    assert.equal(result.ok && result.move.turns, 3);
  });
  test("resolves a known charged move", () => {
    const result = iceBeam();
    assert.equal(result.ok && result.move.power, 90);
    assert.equal(result.ok && result.move.energyCost, 55);
  });
  test("rejects an unknown move", () =>
    assert.equal(resolveCompetitiveMove("missing").ok, false));
  test("rejects a category mismatch", () =>
    assert.equal(resolveCompetitiveFastMove("ice-beam").ok, false));
  test("normalizes lookup casing and whitespace", () =>
    assert.equal(getCompetitiveMoveById(" BUBBLE ")?.id, "bubble"));
});

describe("competitive move validation", () => {
  const validFast = {
    id: "test-fast",
    name: "Test Fast",
    type: "water",
    category: "fast",
    power: 4,
    energyGain: 5,
    turns: 2,
    verificationStatus: "verified",
    source: "pvpoke",
    sourceCheckedAt: "2026-07-16",
  } as const;
  const validCharged = {
    id: "test-charged",
    name: "Test Charged",
    type: "water",
    category: "charged",
    power: 50,
    energyCost: 35,
    verificationStatus: "verified",
    source: "pvpoke",
    sourceCheckedAt: "2026-07-16",
  } as const;

  test("detects duplicate IDs", () =>
    assert.ok(
      validateCompetitiveMoveDataset(
        [validFast, validFast],
        competitiveMoveDatasetMetadata,
      ).some(({ code }) => code === "duplicate-id"),
    ));
  test("detects an empty ID", () =>
    assert.ok(codes({ ...validFast, id: "" }).includes("empty-id")));
  test("detects invalid power", () =>
    assert.ok(codes({ ...validFast, power: -1 }).includes("invalid-power")));
  test("detects invalid type and category", () => {
    assert.ok(
      codes({ ...validFast, type: "unknown" }).includes("invalid-type"),
    );
    assert.ok(
      codes({ ...validFast, category: "unknown" }).includes("invalid-category"),
    );
  });
  test("detects invalid fast energy", () =>
    assert.ok(
      codes({ ...validFast, energyGain: -1 }).includes("invalid-energy-gain"),
    ));
  test("detects invalid charged cost", () =>
    assert.ok(
      codes({ ...validCharged, energyCost: 0 }).includes("invalid-energy-cost"),
    ));
  test("detects invalid fast turns", () =>
    assert.ok(codes({ ...validFast, turns: 0 }).includes("invalid-turns")));
  test("detects a field from another category", () =>
    assert.ok(
      codes({ ...validFast, energyCost: 35 }).includes("incompatible-field"),
    ));
  test("validates complete metadata", () =>
    assert.deepEqual(
      validateCompetitiveMoveMetadata(competitiveMoveDatasetMetadata),
      [],
    ));
  test("rejects incomplete metadata", () =>
    assert.ok(
      validateCompetitiveMoveMetadata({ schemaVersion: 1 }).some(
        ({ code }) => code === "invalid-metadata",
      ),
    ));
  test("validates the complete catalog coverage", () => {
    const catalog = [
      ...Object.values(fastMoves),
      ...Object.values(chargedMoves),
    ];
    assert.deepEqual(
      validateCompetitiveMoveCoverage(competitiveMoves, catalog),
      [],
    );
  });
  test("detects missing and orphan moves", () => {
    const issues = validateCompetitiveMoveCoverage(
      [competitiveMoves[0]!, { ...competitiveMoves[1]!, id: "orphan" }],
      [fastMoves.airSlash, fastMoves.bubble],
    );
    assert.ok(issues.some(({ code }) => code === "missing-catalog-move"));
    assert.ok(issues.some(({ code }) => code === "orphan-competitive-move"));
  });
  test("validates the complete dataset", () =>
    assert.deepEqual(
      validateCompetitiveMoveDataset(
        competitiveMoves,
        competitiveMoveDatasetMetadata,
      ),
      [],
    ));
  test("does not mutate the frozen dataset", () => {
    const snapshot = structuredClone(competitiveMoves);
    validateCompetitiveMoveDataset(
      competitiveMoves,
      competitiveMoveDatasetMetadata,
    );
    assert.deepEqual(competitiveMoves, snapshot);
    assert.equal(Object.isFrozen(competitiveMoves), true);
  });
  test("checks dataset version compatibility", () => {
    assert.equal(
      isCompetitiveMoveDatasetCompatible("arena-competitive-moves-v1"),
      true,
    );
    assert.equal(
      isCompetitiveMoveDatasetCompatible("arena-competitive-moves-v2"),
      false,
    );
  });
});

describe("BattleMove adaptation", () => {
  test("adapts a fast move without ambiguous energy", () => {
    const result = bubble();
    assert.ok(result.ok);
    if (!result.ok) return;
    assert.deepEqual(adaptCompetitiveFastMoveToBattleMove(result.move), {
      id: "bubble",
      name: "Bubble",
      type: "water",
      kind: "fast",
      power: 8,
      energyDelta: 11,
      turns: 3,
    });
  });
  test("adapts a positive charged cost to engine consumption", () => {
    const result = iceBeam();
    assert.ok(result.ok);
    if (!result.ok) return;
    assert.deepEqual(adaptCompetitiveChargedMoveToBattleMove(result.move), {
      id: "ice-beam",
      name: "Ice Beam",
      type: "ice",
      kind: "charged",
      power: 90,
      energyDelta: -55,
      turns: 0,
    });
  });
  test("preserves distinct fast move values", () => {
    const first = resolveCompetitiveFastMove("bubble");
    const second = resolveCompetitiveFastMove("lock-on");
    assert.ok(first.ok && second.ok);
    if (!first.ok || !second.ok) return;
    assert.notDeepEqual(
      adaptCompetitiveFastMoveToBattleMove(first.move),
      adaptCompetitiveFastMoveToBattleMove(second.move),
    );
  });
  test("preserves distinct charged power and cost", () => {
    const first = resolveCompetitiveChargedMove("ice-beam");
    const second = resolveCompetitiveChargedMove("hydro-pump");
    assert.ok(first.ok && second.ok);
    if (!first.ok || !second.ok) return;
    assert.notDeepEqual(
      adaptCompetitiveChargedMoveToBattleMove(first.move),
      adaptCompetitiveChargedMoveToBattleMove(second.move),
    );
  });
});
