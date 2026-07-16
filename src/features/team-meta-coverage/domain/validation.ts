import { getPokemonById, type League } from "@/features/pokedex";
import {
  validateTeam,
  type Team,
  type ValidationIssue,
} from "@/features/team-builder";
import type { TeamCoverageValidation } from "./types";

export const validateLeagueCompatibility = (
  team: Team,
  league: League,
): readonly ValidationIssue[] =>
  team.slots.flatMap(({ id, build }) => {
    const species = getPokemonById(build.pokemonId);
    if (build.league === league && species?.eligibleLeagues.includes(league))
      return [];
    return [
      {
        code: "ineligible-league" as const,
        field: "league" as const,
        slotId: id,
        message: `El slot ${id} no es compatible con la liga seleccionada.`,
      },
    ];
  });

export const validateCompleteTeam = (team: Team): readonly ValidationIssue[] =>
  validateTeam(team);

export const validateTeamCoverageInput = (
  team: Team,
  league: League,
): TeamCoverageValidation => {
  const issues = [
    ...validateCompleteTeam(team),
    ...validateLeagueCompatibility(team, league),
  ];
  return { valid: issues.length === 0, issues };
};
