import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { createEmptyTeam } from "@/features/team-builder";
import { getMetaEntriesByLeague, metaDataset } from "@/features/meta-matchups";
import { runTeamCoverageMatrix } from "../application/run-team-coverage";
import { validTeam } from "./fixtures";

const request = () => ({
  runId: 1,
  team: validTeam(),
  league: "great" as const,
  shields: 1 as const,
  opponents: getMetaEntriesByLeague("great"),
});

describe("team coverage runner", () => {
  test("executes exactly 3 x N simulations", async () => {
    const progress: number[] = [];
    const result = await runTeamCoverageMatrix(request(), {
      onProgress: ({ completed }) => progress.push(completed),
    });
    assert.equal(result.rows.length, request().opponents.length);
    assert.equal(progress.length, request().opponents.length * 3);
  });
  test("preserves meta order", async () => {
    const input = request();
    const result = await runTeamCoverageMatrix(input);
    assert.deepEqual(
      result.rows.map(({ opponent }) => opponent.id),
      input.opponents.map(({ id }) => id),
    );
  });
  test("reports real aggregate progress", async () => {
    const progress: number[] = [];
    await runTeamCoverageMatrix(request(), {
      onProgress: ({ completed }) => progress.push(completed),
    });
    assert.deepEqual(
      progress,
      Array.from({ length: 12 }, (_, index) => index + 1),
    );
  });
  test("isolates invalid opponents", async () => {
    const invalid = {
      ...metaDataset.entries[0]!,
      id: "invalid",
      speciesId: "missing",
      build: { ...metaDataset.entries[0]!.build, pokemonId: "missing" },
    };
    const result = await runTeamCoverageMatrix({
      ...request(),
      opponents: [metaDataset.entries[0]!, invalid],
    });
    assert.equal(result.rows.length, 2);
    assert.equal(result.rows[1]?.classification, "invalid");
  });
  test("continues after an isolated error", async () => {
    const invalid = {
      ...metaDataset.entries[0]!,
      id: "invalid",
      speciesId: "missing",
      build: { ...metaDataset.entries[0]!.build, pokemonId: "missing" },
    };
    const result = await runTeamCoverageMatrix({
      ...request(),
      opponents: [invalid, metaDataset.entries[0]!],
    });
    assert.notEqual(result.rows[1]?.classification, "invalid");
  });
  test("respects cancellation", async () => {
    let cancelled = false;
    const result = await runTeamCoverageMatrix(request(), {
      isCancelled: () => cancelled,
      onProgress: ({ completed }) => {
        if (completed === 2) cancelled = true;
      },
    });
    assert.equal(result.cancelled, true);
    assert.deepEqual(result.rows, []);
  });
  test("does not publish cancelled partial rows", async () => {
    const result = await runTeamCoverageMatrix(request(), {
      isCancelled: () => true,
    });
    assert.equal(result.rows.length, 0);
  });
  test("discards stale executions", async () => {
    const result = await runTeamCoverageMatrix(request(), {
      isCurrent: () => false,
    });
    assert.equal(result.stale, true);
    assert.equal(result.rows.length, 0);
  });
  test("is deterministic", async () => {
    assert.deepEqual(
      await runTeamCoverageMatrix(request()),
      await runTeamCoverageMatrix(request()),
    );
  });
  test("blocks an incomplete team", async () => {
    const result = await runTeamCoverageMatrix({
      ...request(),
      team: createEmptyTeam(),
    });
    assert.equal(result.rows.length, 0);
  });
  test("blocks an incompatible league", async () => {
    const result = await runTeamCoverageMatrix({
      ...request(),
      league: "ultra",
      opponents: getMetaEntriesByLeague("ultra"),
    });
    assert.equal(result.rows.length, 0);
  });
});
