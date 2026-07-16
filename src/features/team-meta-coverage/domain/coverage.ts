import type { MatchupClassification } from "@/features/meta-matchups";
import type { TeamSlotId } from "@/features/team-builder";
import type {
  MemberCoverageSummary,
  MemberMatchup,
  TeamCoverageClassification,
  TeamCoverageFilter,
  TeamCoverageRow,
  TeamCoverageSort,
  TeamCoverageSummary,
} from "./types";

const safe = (classification: MatchupClassification): boolean =>
  classification === "dominant" || classification === "favorable";
const close = (classification: MatchupClassification): boolean =>
  classification === "close" || classification === "draw";
const rank: Readonly<Record<MatchupClassification, number>> = {
  dominant: 6,
  favorable: 5,
  close: 4,
  draw: 3,
  unfavorable: 2,
  "very-unfavorable": 1,
  invalid: 0,
};
const outcomeRank: Readonly<Record<MemberMatchup["outcome"], number>> = {
  win: 3,
  draw: 2,
  loss: 1,
  invalid: 0,
};

export const getCoveringSlots = (
  members: readonly MemberMatchup[],
): readonly TeamSlotId[] =>
  members
    .filter((item) => safe(item.classification))
    .map(({ slotId }) => slotId);

export const getCloseSlots = (
  members: readonly MemberMatchup[],
): readonly TeamSlotId[] =>
  members
    .filter((item) => close(item.classification))
    .map(({ slotId }) => slotId);

export const classifyRivalCoverage = (
  members: readonly MemberMatchup[],
): TeamCoverageClassification => {
  const valid = members.filter(
    ({ classification }) => classification !== "invalid",
  );
  if (valid.length === 0) return "invalid";
  if (valid.some(({ classification }) => safe(classification)))
    return "covered";
  if (valid.some(({ classification }) => close(classification)))
    return "uncertain";
  return "critical";
};

export const compareMemberMatchups = (
  left: MemberMatchup,
  right: MemberMatchup,
): number => {
  const category = rank[right.classification] - rank[left.classification];
  if (category) return category;
  if (left.score !== right.score) return right.score - left.score;
  const outcome = outcomeRank[right.outcome] - outcomeRank[left.outcome];
  if (outcome) return outcome;
  if (left.remainingHp !== right.remainingHp)
    return (right.remainingHp ?? -1) - (left.remainingHp ?? -1);
  if (left.remainingEnergy !== right.remainingEnergy)
    return (right.remainingEnergy ?? -1) - (left.remainingEnergy ?? -1);
  if (left.remainingShields !== right.remainingShields)
    return (right.remainingShields ?? -1) - (left.remainingShields ?? -1);
  if (left.turns !== right.turns) {
    const leftTurns = left.turns ?? Number.MAX_SAFE_INTEGER;
    const rightTurns = right.turns ?? Number.MAX_SAFE_INTEGER;
    return left.outcome === "loss"
      ? rightTurns - leftTurns
      : leftTurns - rightTurns;
  }
  return left.slotId - right.slotId;
};

export const selectBestTeamAnswer = (
  members: readonly MemberMatchup[],
): MemberMatchup | null => {
  const valid = members.filter(
    ({ classification }) => classification !== "invalid",
  );
  return valid.length
    ? ([...valid].sort(compareMemberMatchups)[0] ?? null)
    : null;
};

export const calculateCoverageRate = (
  covered: number,
  total: number,
): number => (total ? Math.round((covered / total) * 1000) / 10 : 0);

export const calculateRedundantCoverage = (
  rows: readonly TeamCoverageRow[],
): number =>
  rows.filter(({ coveringSlots }) => coveringSlots.length >= 2).length;

const stableMaxSlot = (
  values: Readonly<Record<TeamSlotId, number>>,
): TeamSlotId | null => {
  const entries = ([1, 2, 3] as const).map(
    (slotId) => [slotId, values[slotId]] as const,
  );
  const maximum = Math.max(...entries.map(([, value]) => value));
  return maximum > 0
    ? (entries.find(([, value]) => value === maximum)?.[0] ?? null)
    : null;
};

export const summarizeMemberCoverage = (
  rows: readonly TeamCoverageRow[],
  slotId: TeamSlotId,
): MemberCoverageSummary => {
  const items = rows.map(({ members }) => members[slotId - 1]);
  const valid = items.filter(
    (item): item is MemberMatchup =>
      item !== undefined && item.classification !== "invalid",
  );
  const covered = valid.filter(({ classification }) =>
    safe(classification),
  ).length;
  const bestAnswerCount = rows.filter(
    ({ bestSlotId }) => bestSlotId === slotId,
  ).length;
  const dependencyCount = rows.filter(
    ({ coveringSlots }) =>
      coveringSlots.length === 1 && coveringSlots[0] === slotId,
  ).length;
  const safelyCoveredRows = rows.filter(
    ({ classification }) => classification === "covered",
  ).length;
  return {
    slotId,
    evaluated: valid.length,
    wins: valid.filter(({ outcome }) => outcome === "win").length,
    draws: valid.filter(({ outcome }) => outcome === "draw").length,
    losses: valid.filter(({ outcome }) => outcome === "loss").length,
    invalid: items.length - valid.length,
    covered,
    bestAnswerCount,
    coverageRate: calculateCoverageRate(covered, rows.length),
    dependencyRate: calculateCoverageRate(dependencyCount, safelyCoveredRows),
  };
};

export const findMostReliedUponMember = (
  rows: readonly TeamCoverageRow[],
): TeamSlotId | null => {
  const counts: Record<TeamSlotId, number> = { 1: 0, 2: 0, 3: 0 };
  rows.forEach(({ coveringSlots }) => {
    if (coveringSlots.length === 1) counts[coveringSlots[0]!] += 1;
  });
  return stableMaxSlot(counts);
};

export const summarizeTeamCoverage = (
  rows: readonly TeamCoverageRow[],
): TeamCoverageSummary => {
  const count = (classification: TeamCoverageClassification) =>
    rows.filter((row) => row.classification === classification).length;
  const covered = count("covered");
  const uncertain = count("uncertain");
  const critical = count("critical");
  const invalid = count("invalid");
  const bestCounts: Record<TeamSlotId, number> = { 1: 0, 2: 0, 3: 0 };
  rows.forEach(({ bestSlotId }) => {
    if (bestSlotId) bestCounts[bestSlotId] += 1;
  });
  return {
    total: rows.length,
    covered,
    uncertain,
    critical,
    invalid,
    safeCoverageRate: calculateCoverageRate(covered, rows.length),
    uncertaintyRate: calculateCoverageRate(uncertain, rows.length),
    criticalRate: calculateCoverageRate(critical, rows.length),
    redundantCoverage: calculateRedundantCoverage(rows),
    mostUsedBestAnswer: stableMaxSlot(bestCounts),
    mostReliedUponMember: findMostReliedUponMember(rows),
    members: [1, 2, 3].map((slotId) =>
      summarizeMemberCoverage(rows, slotId as TeamSlotId),
    ) as [MemberCoverageSummary, MemberCoverageSummary, MemberCoverageSummary],
  };
};

export const filterCoverageRows = (
  rows: readonly TeamCoverageRow[],
  filter: TeamCoverageFilter,
): readonly TeamCoverageRow[] =>
  filter === "all"
    ? rows
    : rows.filter((row) =>
        filter === "incomplete"
          ? row.incomplete
          : row.classification === filter,
      );

const severity: Readonly<Record<TeamCoverageClassification, number>> = {
  critical: 0,
  uncertain: 1,
  invalid: 2,
  covered: 3,
};
export const sortCoverageRows = (
  rows: readonly TeamCoverageRow[],
  sort: TeamCoverageSort,
): readonly TeamCoverageRow[] =>
  [...rows].sort((left, right) => {
    if (sort === "name")
      return left.opponent.name.localeCompare(right.opponent.name);
    if (sort === "best-score") {
      const leftBest = selectBestTeamAnswer(left.members)?.score ?? -999;
      const rightBest = selectBestTeamAnswer(right.members)?.score ?? -999;
      return (
        rightBest - leftBest ||
        left.opponent.name.localeCompare(right.opponent.name)
      );
    }
    if (sort === "redundancy")
      return (
        right.coveringSlots.length - left.coveringSlots.length ||
        left.opponent.name.localeCompare(right.opponent.name)
      );
    return (
      severity[left.classification] - severity[right.classification] ||
      (selectBestTeamAnswer(left.members)?.score ?? -999) -
        (selectBestTeamAnswer(right.members)?.score ?? -999) ||
      left.opponent.name.localeCompare(right.opponent.name)
    );
  });
