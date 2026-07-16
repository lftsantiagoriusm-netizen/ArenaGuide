import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { metaDataset } from "@/features/meta-matchups";
import {
  competitiveDataMetadata,
  competitiveMoveDatasetMetadata,
} from "@/features/competitive-data";
import {
  calculateCoverageRate,
  calculateRedundantCoverage,
  classifyRivalCoverage,
  compareMemberMatchups,
  filterCoverageRows,
  findMostReliedUponMember,
  getCloseSlots,
  getCoveringSlots,
  selectBestTeamAnswer,
  sortCoverageRows,
  summarizeMemberCoverage,
  summarizeTeamCoverage,
} from "../domain/coverage";
import {
  createCoverageCompatibilityKey,
  createTeamFingerprint,
} from "../domain/fingerprint";
import { validateTeamCoverageInput } from "../domain/validation";
import { member, row, validTeam } from "./fixtures";

const positive = () => member(1, "favorable", 35);
const negative = (slotId: 1 | 2 | 3) => member(slotId, "unfavorable", -35);

describe("collective classification", () => {
  test("a favorable result produces covered", () =>
    assert.equal(
      classifyRivalCoverage([positive(), negative(2), negative(3)]),
      "covered",
    ));
  test("a dominant result produces covered", () =>
    assert.equal(
      classifyRivalCoverage([
        member(1, "dominant", 80),
        negative(2),
        negative(3),
      ]),
      "covered",
    ));
  test("only close produces uncertain", () =>
    assert.equal(
      classifyRivalCoverage([member(1, "close", 5), negative(2), negative(3)]),
      "uncertain",
    ));
  test("only draw produces uncertain", () =>
    assert.equal(
      classifyRivalCoverage([member(1, "draw", 0), negative(2), negative(3)]),
      "uncertain",
    ));
  test("three negative results produce critical", () =>
    assert.equal(
      classifyRivalCoverage([negative(1), negative(2), negative(3)]),
      "critical",
    ));
  test("no valid results produce invalid", () =>
    assert.equal(
      classifyRivalCoverage([
        member(1, "invalid", -999),
        member(2, "invalid", -999),
        member(3, "invalid", -999),
      ]),
      "invalid",
    ));
  test("a partial error keeps valid classification", () =>
    assert.equal(
      classifyRivalCoverage([
        positive(),
        member(2, "invalid", -999),
        negative(3),
      ]),
      "covered",
    ));
  test("close does not count as safe coverage", () =>
    assert.deepEqual(getCoveringSlots([member(1, "close", 10)]), []));
  test("reports close and draw slots", () =>
    assert.deepEqual(
      getCloseSlots([member(1, "close", 1), member(2, "draw", 0)]),
      [1, 2],
    ));
});

describe("best team answer", () => {
  test("selects the superior category", () =>
    assert.equal(
      selectBestTeamAnswer([member(1, "close", 15), member(2, "favorable", 20)])
        ?.slotId,
      2,
    ));
  test("breaks a category tie by score", () =>
    assert.equal(
      selectBestTeamAnswer([
        member(1, "favorable", 25),
        member(2, "favorable", 50),
      ])?.slotId,
      2,
    ));
  test("breaks a score tie by remaining HP", () =>
    assert.equal(
      selectBestTeamAnswer([
        member(1, "favorable", 30, { remainingHp: 40 }),
        member(2, "favorable", 30, { remainingHp: 60 }),
      ])?.slotId,
      2,
    ));
  test("uses stable slot order as final tie break", () =>
    assert.equal(
      selectBestTeamAnswer([
        member(2, "favorable", 30),
        member(1, "favorable", 30),
      ])?.slotId,
      1,
    ));
  test("does not mutate inputs", () => {
    const items = [
      member(2, "favorable", 20),
      member(1, "favorable", 30),
    ] as const;
    const snapshot = structuredClone(items);
    selectBestTeamAnswer(items);
    assert.deepEqual(items, snapshot);
  });
  test("is deterministic", () => {
    const items = [
      member(1, "close", 10),
      member(2, "favorable", 25),
      member(3, "favorable", 25),
    ];
    assert.deepEqual(selectBestTeamAnswer(items), selectBestTeamAnswer(items));
  });
  test("places invalid last", () =>
    assert.ok(
      compareMemberMatchups(
        member(1, "favorable", 1),
        member(2, "invalid", -999),
      ) < 0,
    ));
});

describe("aggregation", () => {
  const covered = row([positive(), negative(2), negative(3)]);
  const uncertain = row([member(1, "close", 5), negative(2), negative(3)], {
    ...metaDataset.entries[1]!,
    name: "Bravo",
  });
  const critical = row([negative(1), negative(2), negative(3)], {
    ...metaDataset.entries[2]!,
    name: "Alpha",
  });
  const invalid = row(
    [
      member(1, "invalid", -999),
      member(2, "invalid", -999),
      member(3, "invalid", -999),
    ],
    metaDataset.entries[3]!,
  );
  test("handles an empty summary", () =>
    assert.deepEqual(summarizeTeamCoverage([]).total, 0));
  test("calculates 100 percent coverage", () =>
    assert.equal(summarizeTeamCoverage([covered]).safeCoverageRate, 100));
  test("calculates zero coverage", () =>
    assert.equal(summarizeTeamCoverage([critical]).safeCoverageRate, 0));
  test("controls division by zero", () =>
    assert.equal(calculateCoverageRate(1, 0), 0));
  test("counts uncertain, critical and invalid", () => {
    const summary = summarizeTeamCoverage([
      covered,
      uncertain,
      critical,
      invalid,
    ]);
    assert.deepEqual(
      [summary.uncertain, summary.critical, summary.invalid],
      [1, 1, 1],
    );
  });
  test("summarizes a member", () =>
    assert.deepEqual(
      summarizeMemberCoverage([covered, critical], 1).evaluated,
      2,
    ));
  test("counts redundant coverage", () => {
    const redundant = row([positive(), member(2, "dominant", 70), negative(3)]);
    assert.equal(calculateRedundantCoverage([redundant]), 1);
  });
  test("finds the most relied upon member", () =>
    assert.equal(findMostReliedUponMember([covered, covered]), 1));
  test("filters critical rows", () =>
    assert.deepEqual(filterCoverageRows([covered, critical], "critical"), [
      critical,
    ]));
  test("sorts severe threats first", () =>
    assert.equal(
      sortCoverageRows([covered, critical, uncertain], "severity")[0]
        ?.classification,
      "critical",
    ));
});

describe("input compatibility", () => {
  test("accepts a valid complete team", () =>
    assert.equal(validateTeamCoverageInput(validTeam(), "great").valid, true));
  test("blocks an incompatible league", () =>
    assert.equal(validateTeamCoverageInput(validTeam(), "ultra").valid, false));
  test("creates a stable team fingerprint", () =>
    assert.equal(
      createTeamFingerprint(validTeam()),
      createTeamFingerprint(validTeam()),
    ));
  test("fingerprint changes with slot order or build", () => {
    const team = validTeam();
    const changed = {
      ...team,
      slots: [team.slots[1], team.slots[0], team.slots[2]] as typeof team.slots,
    };
    assert.notEqual(
      createTeamFingerprint(team),
      createTeamFingerprint(changed),
    );
  });
  test("fingerprint changes with the competitive dataset version", () => {
    const team = validTeam();
    assert.notEqual(
      createTeamFingerprint(team, "arena-competitive-data-v1"),
      createTeamFingerprint(team, "arena-competitive-data-v2"),
    );
  });
  test("fingerprint changes with the competitive move dataset version", () => {
    const team = validTeam();
    assert.notEqual(
      createTeamFingerprint(
        team,
        competitiveDataMetadata.datasetVersion,
        "arena-competitive-moves-v1",
      ),
      createTeamFingerprint(
        team,
        competitiveDataMetadata.datasetVersion,
        "arena-competitive-moves-v2",
      ),
    );
  });
  test("compatibility key includes shields", () => {
    const base = {
      teamFingerprint: "team",
      league: "great" as const,
      engineVersion: "battle-engine-competitive-moves-v1" as const,
      metaVersion: "arena-meta-fixture-v1" as const,
      competitiveDataVersion: competitiveDataMetadata.datasetVersion,
      competitiveMoveDataVersion: competitiveMoveDatasetMetadata.datasetVersion,
    };
    assert.notEqual(
      createCoverageCompatibilityKey({ ...base, shields: 0 }),
      createCoverageCompatibilityKey({ ...base, shields: 1 }),
    );
  });
});
