import type { League } from "@/features/pokedex";
import type { LeagueRules } from "./types";

const rules: Readonly<Record<League, LeagueRules>> = {
  great: { league: "great", cpLimit: 1500, label: "Great League" },
  ultra: { league: "ultra", cpLimit: 2500, label: "Ultra League" },
  master: { league: "master", cpLimit: null, label: "Master League" },
};

export const getLeagueRules = (league: League): LeagueRules => rules[league];
export const isCpEligibleForLeague = (cp: number, league: League): boolean => {
  const limit = getLeagueRules(league).cpLimit;
  return limit === null || cp <= limit;
};
