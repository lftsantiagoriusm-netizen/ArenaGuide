import type {
  MatchupClassification,
  MatchupFilter,
  MatchupMatrixSummary,
  MatchupSimulationResult,
  MatchupSortOption,
} from "./types";

const classifications: readonly MatchupClassification[] = [
  "dominant",
  "favorable",
  "close",
  "unfavorable",
  "very-unfavorable",
  "draw",
  "invalid",
];

export const summarizeMatchups = (
  results: readonly MatchupSimulationResult[],
): MatchupMatrixSummary => {
  const wins = results.filter(
    ({ simulation }) => simulation?.winner === "a",
  ).length;
  const losses = results.filter(
    ({ simulation }) => simulation?.winner === "b",
  ).length;
  const draws = results.filter(
    ({ simulation }) => simulation?.winner === "draw",
  ).length;
  const invalid = results.filter(
    ({ classification }) => classification === "invalid",
  ).length;
  const validDecisions = wins + losses + draws;
  return {
    total: results.length,
    wins,
    losses,
    draws,
    invalid,
    winRate: validDecisions
      ? Math.round((wins / validDecisions) * 1000) / 10
      : 0,
    classifications: Object.fromEntries(
      classifications.map((classification) => [
        classification,
        results.filter((result) => result.classification === classification)
          .length,
      ]),
    ) as Record<MatchupClassification, number>,
  };
};

export const filterMatchups = (
  results: readonly MatchupSimulationResult[],
  filter: MatchupFilter,
): readonly MatchupSimulationResult[] =>
  results.filter((result) => {
    if (filter === "all") return true;
    if (filter === "wins") return result.simulation?.winner === "a";
    if (filter === "losses") return result.simulation?.winner === "b";
    if (filter === "draws") return result.classification === "draw";
    if (filter === "favorable")
      return (
        result.classification === "dominant" ||
        result.classification === "favorable"
      );
    if (filter === "unfavorable")
      return (
        result.classification === "unfavorable" ||
        result.classification === "very-unfavorable"
      );
    return result.classification === filter;
  });

export const sortMatchups = (
  results: readonly MatchupSimulationResult[],
  sort: MatchupSortOption,
): readonly MatchupSimulationResult[] =>
  [...results].sort((left, right) => {
    if (sort === "name")
      return left.opponent.name.localeCompare(right.opponent.name);
    if (sort === "worst") return left.score - right.score;
    if (sort === "remaining-hp")
      return (
        (right.simulation?.remainingHpPercent.a ?? -1) -
        (left.simulation?.remainingHpPercent.a ?? -1)
      );
    if (sort === "duration")
      return (
        (left.simulation?.turns ?? Number.MAX_SAFE_INTEGER) -
        (right.simulation?.turns ?? Number.MAX_SAFE_INTEGER)
      );
    if (sort === "weight") return right.opponent.weight - left.opponent.weight;
    return right.score - left.score;
  });
