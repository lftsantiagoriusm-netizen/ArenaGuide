import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { CoverageRowCard } from "../components/coverage-row-card";
import { filterCoverageRows } from "../domain/coverage";
import {
  canExecuteTeamCoverage,
  configurationInvalidatesCoverage,
  shouldShowCoverageProgress,
  TEAM_COVERAGE_LIMITATION_NOTICE,
} from "../domain/presentation";
import { member, row } from "./fixtures";

describe("team coverage UI contracts", () => {
  test("invalid team disables execution", () =>
    assert.equal(canExecuteTeamCoverage(false, false), false));
  test("valid team enables execution", () =>
    assert.equal(canExecuteTeamCoverage(true, false), true));
  test("running execution exposes progress", () =>
    assert.equal(
      shouldShowCoverageProgress(true, {
        runId: 1,
        completed: 1,
        total: 3,
        percentage: 33,
      }),
      true,
    ));
  test("cancelled execution can run again", () =>
    assert.equal(canExecuteTeamCoverage(true, false), true));
  test("changing league invalidates results", () =>
    assert.equal(configurationInvalidatesCoverage("great:1", "ultra:1"), true));
  test("changing shields invalidates results", () =>
    assert.equal(configurationInvalidatesCoverage("great:1", "great:2"), true));
  test("critical threats are selectable", () => {
    const critical = row([
      member(1, "unfavorable", -20),
      member(2, "unfavorable", -30),
      member(3, "very-unfavorable", -70),
    ]);
    assert.deepEqual(filterCoverageRows([critical], "critical"), [critical]);
  });
  test("exposes the mandatory 1v1 limitation", () =>
    assert.match(
      TEAM_COVERAGE_LIMITATION_NOTICE,
      /No representa una simulación completa 3v3/,
    ));
  test("mobile card does not require a table", () => {
    const markup = renderToStaticMarkup(
      <CoverageRowCard
        row={row([
          member(1, "favorable", 30),
          member(2, "close", 5),
          member(3, "unfavorable", -30),
        ])}
      />,
    );
    assert.doesNotMatch(markup, /<table/);
    assert.match(markup, /slot1/);
  });
});
