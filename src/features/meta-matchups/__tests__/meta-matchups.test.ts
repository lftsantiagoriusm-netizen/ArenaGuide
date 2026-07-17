import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  adaptBuildToBattlePokemon,
  firstChargedShieldStrategy,
  simulateBattle,
  type BattleBuild,
  type SimulationResult,
} from "@/features/battle-simulator";
import { getMetaEntriesByLeague, metaDataset } from "../data/meta-dataset";
import { classifyMatchup } from "../domain/classification";
import {
  filterMatchups,
  sortMatchups,
  summarizeMatchups,
} from "../domain/matrix-operations";
import { validateMetaEntry } from "../domain/validation";
import { runMatchupMatrix } from "../services/run-matchup-matrix";
import {
  deserializeMatrixSettings,
  serializeMatrixSettings,
} from "../storage/meta-settings-storage";
import type { MatchupSimulationResult, MatrixSettings } from "../domain/types";
import {
  competitiveDataMetadata,
  competitiveMoveDatasetMetadata,
  competitiveMoveEffectDatasetMetadata,
} from "@/features/competitive-data";

const analyzedBuild: BattleBuild = {
  pokemonId: "azumarill",
  league: "great",
  attackIv: 0,
  defenseIv: 15,
  staminaIv: 15,
  level: 20,
  fastMoveId: "bubble",
  chargedMove1Id: "ice-beam",
  chargedMove2Id: "play-rough",
  shields: 1,
};
const fakeSimulation = (
  winner: SimulationResult["winner"],
  hpA: number,
  hpB: number,
  energyA = 0,
  energyB = 0,
): SimulationResult => {
  const adapted = adaptBuildToBattlePokemon(analyzedBuild, "great").pokemon;
  if (!adapted) throw new Error("fixture");
  const state = (id: "a" | "b", hp: number, energy: number) => ({
    id,
    pokemon: adapted,
    hp,
    energy,
    shields: 0,
    cooldown: 0,
    totalDamage: 0,
    fastMovesUsed: 1,
    chargedMovesUsed: 1,
    shieldsUsed: 0,
    statStages: { attack: 0 as const, defense: 0 as const },
  });
  return {
    winner,
    loser: winner === "a" ? "b" : winner === "b" ? "a" : null,
    turns: 20,
    timeline: [],
    combatants: { a: state("a", hpA, energyA), b: state("b", hpB, energyB) },
    remainingHpPercent: { a: hpA, b: hpB },
    certainty: "deterministic",
    explanation: [],
    damage: {
      a: { fast: 0, charged: 0, total: 0 },
      b: { fast: 0, charged: 0, total: 0 },
    },
  };
};
const result = (
  name: string,
  simulation: SimulationResult | null,
  score: number,
  classification: MatchupSimulationResult["classification"],
): MatchupSimulationResult => ({
  opponent: { ...metaDataset.entries[0]!, id: name, name },
  simulation,
  score,
  classification,
  failure: simulation ? null : { code: "invalid-opponent", message: "invalid" },
});

describe("meta dataset", () => {
  test("validates a complete entry", () =>
    assert.deepEqual(validateMetaEntry(metaDataset.entries[0]!), []));
  test("rejects an incomplete entry", () =>
    assert.ok(
      validateMetaEntry({ ...metaDataset.entries[0]!, speciesId: "" }).length >
        0,
    ));
  test("adapts a meta entry to BattlePokemon", () =>
    assert.equal(
      adaptBuildToBattlePokemon(metaDataset.entries[0]!.build, "great").pokemon
        ?.id,
      "azumarill",
    ));
});

describe("batch execution", () => {
  test("executes several battles", async () =>
    assert.equal(
      (
        await runMatchupMatrix({
          runId: 1,
          analyzedBuild,
          league: "great",
          shields: 1,
          opponents: getMetaEntriesByLeague("great"),
        })
      ).results.length,
      4,
    ));
  test("isolates an invalid opponent", async () => {
    const invalid = {
      ...metaDataset.entries[0]!,
      speciesId: "missing",
      build: { ...metaDataset.entries[0]!.build, pokemonId: "missing" },
    };
    const matrix = await runMatchupMatrix({
      runId: 1,
      analyzedBuild,
      league: "great",
      shields: 1,
      opponents: [metaDataset.entries[0]!, invalid],
    });
    assert.equal(matrix.results.length, 2);
    assert.equal(matrix.results[1]?.classification, "invalid");
  });
  test("is deterministic", async () => {
    const request = {
      runId: 1,
      analyzedBuild,
      league: "great" as const,
      shields: 1 as const,
      opponents: getMetaEntriesByLeague("great"),
    };
    assert.deepEqual(
      await runMatchupMatrix(request),
      await runMatchupMatrix(request),
    );
  });
  test("reports controlled progress", async () => {
    const progress: number[] = [];
    await runMatchupMatrix(
      {
        runId: 3,
        analyzedBuild,
        league: "great",
        shields: 1,
        opponents: getMetaEntriesByLeague("great"),
      },
      { onProgress: ({ completed }) => progress.push(completed) },
    );
    assert.deepEqual(progress, [1, 2, 3, 4]);
  });
  test("prevents stale results", async () => {
    const matrix = await runMatchupMatrix(
      {
        runId: 4,
        analyzedBuild,
        league: "great",
        shields: 1,
        opponents: getMetaEntriesByLeague("great"),
      },
      { isCurrent: () => false },
    );
    assert.equal(matrix.stale, true);
    assert.equal(matrix.results.length, 0);
  });
  test("reuses the existing simulator", async () => {
    const opponent = metaDataset.entries[0]!;
    const matrix = await runMatchupMatrix({
      runId: 1,
      analyzedBuild,
      league: "great",
      shields: 1,
      opponents: [opponent],
    });
    const a = adaptBuildToBattlePokemon(analyzedBuild, "great").pokemon!;
    const b = adaptBuildToBattlePokemon(opponent.build, "great").pokemon!;
    assert.deepEqual(
      matrix.results[0]?.simulation,
      simulateBattle({
        league: "great",
        pokemonA: a,
        pokemonB: b,
        shieldsA: 1,
        shieldsB: 1,
        shieldStrategy: firstChargedShieldStrategy,
      }),
    );
  });
});

describe("classification", () => {
  test("classifies Dominant", () =>
    assert.equal(
      classifyMatchup(fakeSimulation("a", 90, 0)).classification,
      "dominant",
    ));
  test("classifies Favorable", () =>
    assert.equal(
      classifyMatchup(fakeSimulation("a", 40, 0)).classification,
      "favorable",
    ));
  test("classifies Close", () =>
    assert.equal(
      classifyMatchup(fakeSimulation("a", 10, 0)).classification,
      "close",
    ));
  test("classifies Unfavorable", () =>
    assert.equal(
      classifyMatchup(fakeSimulation("b", 0, 40)).classification,
      "unfavorable",
    ));
  test("classifies Very unfavorable", () =>
    assert.equal(
      classifyMatchup(fakeSimulation("b", 0, 90)).classification,
      "very-unfavorable",
    ));
  test("classifies Draw", () =>
    assert.equal(
      classifyMatchup(fakeSimulation("draw", 0, 0)).classification,
      "draw",
    ));
  test("classifies Invalid", () =>
    assert.equal(classifyMatchup(null).classification, "invalid"));
});

describe("summary and presentation operations", () => {
  const items = [
    result("Zulu", fakeSimulation("a", 50, 0), 50, "favorable"),
    result("Alpha", fakeSimulation("b", 0, 40), -40, "unfavorable"),
    result("Draw", fakeSimulation("draw", 0, 0), 0, "draw"),
    result("Invalid", null, -999, "invalid"),
  ];
  test("calculates win rate from valid decisions", () =>
    assert.equal(summarizeMatchups(items).winRate, 33.3));
  test("excludes invalid results from the denominator", () =>
    assert.equal(summarizeMatchups(items).invalid, 1));
  test("filters wins", () =>
    assert.deepEqual(
      filterMatchups(items, "wins").map(({ opponent }) => opponent.name),
      ["Zulu"],
    ));
  test("filters losses", () =>
    assert.deepEqual(
      filterMatchups(items, "losses").map(({ opponent }) => opponent.name),
      ["Alpha"],
    ));
  test("sorts best to worst", () =>
    assert.equal(sortMatchups(items, "best")[0]?.opponent.name, "Zulu"));
  test("sorts alphabetically", () =>
    assert.deepEqual(
      sortMatchups(items, "name").map(({ opponent }) => opponent.name),
      ["Alpha", "Draw", "Invalid", "Zulu"],
    ));
});

describe("settings persistence", () => {
  const settings: MatrixSettings = {
    version: 1,
    competitiveDataVersion: competitiveDataMetadata.datasetVersion,
    competitiveMoveDataVersion: competitiveMoveDatasetMetadata.datasetVersion,
    competitiveMoveEffectDataVersion:
      competitiveMoveEffectDatasetMetadata.datasetVersion,
    build: analyzedBuild,
    league: "great",
    shields: 1,
    filter: "all",
    sort: "best",
  };
  test("round-trips valid settings", () =>
    assert.deepEqual(
      deserializeMatrixSettings(serializeMatrixSettings(settings)),
      settings,
    ));
  test("recovers from corrupt settings", () => {
    assert.equal(deserializeMatrixSettings("bad"), null);
    assert.equal(deserializeMatrixSettings('{"version":2}'), null);
  });
  test("discards settings from another competitive dataset", () => {
    const parsed = JSON.parse(serializeMatrixSettings(settings)) as Record<
      string,
      unknown
    >;
    parsed.competitiveDataVersion = "arena-competitive-data-v999";
    assert.equal(deserializeMatrixSettings(JSON.stringify(parsed)), null);
  });
  test("discards settings from another competitive move dataset", () => {
    const parsed = JSON.parse(serializeMatrixSettings(settings)) as Record<
      string,
      unknown
    >;
    parsed.competitiveMoveDataVersion = "arena-competitive-moves-v999";
    assert.equal(deserializeMatrixSettings(JSON.stringify(parsed)), null);
  });
  test("discards settings from another competitive move effect dataset", () => {
    const parsed = JSON.parse(serializeMatrixSettings(settings)) as Record<
      string,
      unknown
    >;
    parsed.competitiveMoveEffectDataVersion =
      "arena-competitive-move-effects-v999";
    assert.equal(deserializeMatrixSettings(JSON.stringify(parsed)), null);
  });
});
