"use client";

import { useEffect, useMemo, useState } from "react";
import { createEmptyTeam, updateTeamBuild, validateTeam } from "../index";
import type { PokemonBuild, Team, TeamSlotId, ValidationIssue } from "../index";
import {
  clearStoredTeam,
  loadTeam,
  saveTeam,
} from "../persistence/team-storage";

interface TeamBuilderState {
  readonly team: Team;
  readonly issues: readonly ValidationIssue[];
  readonly isValid: boolean;
  readonly isHydrated: boolean;
  readonly updateBuild: (slotId: TeamSlotId, build: PokemonBuild) => void;
  readonly clearTeam: () => void;
}

export function useTeamBuilder(): TeamBuilderState {
  const [team, setTeam] = useState<Team>(createEmptyTeam);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const restored = loadTeam(window.localStorage);
    if (restored) setTeam(restored);
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) saveTeam(window.localStorage, team);
  }, [isHydrated, team]);

  const issues = useMemo(() => validateTeam(team), [team]);

  return {
    team,
    issues,
    isValid: issues.length === 0,
    isHydrated,
    updateBuild: (slotId, build) =>
      setTeam((current) => updateTeamBuild(current, slotId, build)),
    clearTeam: () => {
      clearStoredTeam(window.localStorage);
      setTeam(createEmptyTeam());
    },
  };
}
