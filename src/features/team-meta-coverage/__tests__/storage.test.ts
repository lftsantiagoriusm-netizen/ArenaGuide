import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { BATTLE_ENGINE_VERSION } from "@/features/battle-simulator";
import { metaDataset } from "@/features/meta-matchups";
import {
  competitiveDataMetadata,
  competitiveMoveDatasetMetadata,
  competitiveMoveEffectDatasetMetadata,
} from "@/features/competitive-data";
import { summarizeTeamCoverage } from "../domain/coverage";
import {
  createCoverageCompatibilityKey,
  createTeamFingerprint,
} from "../domain/fingerprint";
import type { StoredTeamCoverage } from "../domain/types";
import {
  isStoredCoverageCompatible,
  loadStoredCoverage,
  parseStoredCoverageResult,
  saveStoredCoverage,
  serializeStoredCoverage,
} from "../storage/team-coverage-storage";
import { validTeam } from "./fixtures";

const storedFixture = (): StoredTeamCoverage => {
  const teamFingerprint = createTeamFingerprint(validTeam());
  const compatibilityKey = createCoverageCompatibilityKey({
    teamFingerprint,
    league: "great",
    shields: 1,
    engineVersion: BATTLE_ENGINE_VERSION,
    metaVersion: metaDataset.version,
    competitiveDataVersion: competitiveDataMetadata.datasetVersion,
    competitiveMoveDataVersion: competitiveMoveDatasetMetadata.datasetVersion,
    competitiveMoveEffectDataVersion:
      competitiveMoveEffectDatasetMetadata.datasetVersion,
  });
  return {
    schemaVersion: 1,
    engineVersion: BATTLE_ENGINE_VERSION,
    metaVersion: metaDataset.version,
    competitiveDataVersion: competitiveDataMetadata.datasetVersion,
    competitiveMoveDataVersion: competitiveMoveDatasetMetadata.datasetVersion,
    competitiveMoveEffectDataVersion:
      competitiveMoveEffectDatasetMetadata.datasetVersion,
    computedAt: "2026-07-16T00:00:00.000Z",
    teamFingerprint,
    compatibilityKey,
    league: "great",
    shields: 1,
    filter: "critical",
    sort: "severity",
    result: {
      runId: 1,
      league: "great",
      shields: 1,
      teamFingerprint,
      rows: [],
      summary: summarizeTeamCoverage([]),
      cancelled: false,
      stale: false,
    },
  };
};

describe("team coverage persistence", () => {
  test("saves preferences", () => {
    let value = "";
    assert.equal(
      saveStoredCoverage(
        {
          setItem: (_key, next) => {
            value = next;
          },
        },
        storedFixture(),
      ),
      true,
    );
    assert.equal(parseStoredCoverageResult(value)?.filter, "critical");
  });
  test("restores preferences", () => {
    const fixture = storedFixture();
    assert.deepEqual(
      loadStoredCoverage({ getItem: () => serializeStoredCoverage(fixture) }),
      fixture,
    );
  });
  test("discards corrupt JSON", () =>
    assert.equal(parseStoredCoverageResult("bad"), null));
  test("discards incompatible schemaVersion", () => {
    const parsed = JSON.parse(
      serializeStoredCoverage(storedFixture()),
    ) as Record<string, unknown>;
    parsed.schemaVersion = 2;
    assert.equal(parseStoredCoverageResult(JSON.stringify(parsed)), null);
  });
  test("discards incompatible engineVersion", () => {
    const parsed = JSON.parse(
      serializeStoredCoverage(storedFixture()),
    ) as Record<string, unknown>;
    parsed.engineVersion = "other";
    assert.equal(parseStoredCoverageResult(JSON.stringify(parsed)), null);
  });
  test("discards incompatible metaVersion", () => {
    const parsed = JSON.parse(
      serializeStoredCoverage(storedFixture()),
    ) as Record<string, unknown>;
    parsed.metaVersion = "other";
    assert.equal(parseStoredCoverageResult(JSON.stringify(parsed)), null);
  });
  test("discards incompatible competitiveDataVersion", () => {
    const parsed = JSON.parse(
      serializeStoredCoverage(storedFixture()),
    ) as Record<string, unknown>;
    parsed.competitiveDataVersion = "arena-competitive-data-v999";
    assert.equal(parseStoredCoverageResult(JSON.stringify(parsed)), null);
  });
  test("discards incompatible competitiveMoveDataVersion", () => {
    const parsed = JSON.parse(
      serializeStoredCoverage(storedFixture()),
    ) as Record<string, unknown>;
    parsed.competitiveMoveDataVersion = "arena-competitive-moves-v999";
    assert.equal(parseStoredCoverageResult(JSON.stringify(parsed)), null);
  });
  test("discards incompatible competitiveMoveEffectDataVersion", () => {
    const parsed = JSON.parse(
      serializeStoredCoverage(storedFixture()),
    ) as Record<string, unknown>;
    parsed.competitiveMoveEffectDataVersion =
      "arena-competitive-move-effects-v999";
    assert.equal(parseStoredCoverageResult(JSON.stringify(parsed)), null);
  });
  test("rejects another team fingerprint", () =>
    assert.equal(isStoredCoverageCompatible(storedFixture(), "other"), false));
  test("rejects another league", () => {
    const fixture = storedFixture();
    const key = createCoverageCompatibilityKey({
      teamFingerprint: fixture.teamFingerprint,
      league: "ultra",
      shields: 1,
      engineVersion: BATTLE_ENGINE_VERSION,
      metaVersion: metaDataset.version,
      competitiveDataVersion: competitiveDataMetadata.datasetVersion,
      competitiveMoveDataVersion: competitiveMoveDatasetMetadata.datasetVersion,
      competitiveMoveEffectDataVersion:
        competitiveMoveEffectDatasetMetadata.datasetVersion,
    });
    assert.equal(isStoredCoverageCompatible(fixture, key), false);
  });
  test("rejects other shields", () => {
    const fixture = storedFixture();
    const key = createCoverageCompatibilityKey({
      teamFingerprint: fixture.teamFingerprint,
      league: "great",
      shields: 2,
      engineVersion: BATTLE_ENGINE_VERSION,
      metaVersion: metaDataset.version,
      competitiveDataVersion: competitiveDataMetadata.datasetVersion,
      competitiveMoveDataVersion: competitiveMoveDatasetMetadata.datasetVersion,
      competitiveMoveEffectDataVersion:
        competitiveMoveEffectDatasetMetadata.datasetVersion,
    });
    assert.equal(isStoredCoverageCompatible(fixture, key), false);
  });
  test("accepts an exact compatibility key", () => {
    const fixture = storedFixture();
    assert.equal(
      isStoredCoverageCompatible(fixture, fixture.compatibilityKey),
      true,
    );
  });
  test("does not fail when getItem is unavailable", () => {
    assert.equal(
      loadStoredCoverage({
        getItem: () => {
          throw new Error("blocked");
        },
      }),
      null,
    );
  });
  test("does not fail when setItem is unavailable", () => {
    assert.equal(
      saveStoredCoverage(
        {
          setItem: () => {
            throw new Error("blocked");
          },
        },
        storedFixture(),
      ),
      false,
    );
  });
});
