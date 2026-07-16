"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BATTLE_ENGINE_VERSION } from "@/features/battle-simulator";
import { competitiveDataMetadata } from "@/features/competitive-data";
import { getMetaEntriesByLeague, metaDataset } from "@/features/meta-matchups";
import type { League } from "@/features/pokedex";
import { createEmptyTeam, loadTeam, type Team } from "@/features/team-builder";
import { runTeamCoverageMatrix } from "../application/run-team-coverage";
import { filterCoverageRows, sortCoverageRows } from "../domain/coverage";
import {
  createCoverageCompatibilityKey,
  createTeamFingerprint,
} from "../domain/fingerprint";
import type {
  TeamCoverageFilter,
  TeamCoverageMatrix,
  TeamCoverageProgress,
  TeamCoverageSort,
} from "../domain/types";
import { validateTeamCoverageInput } from "../domain/validation";
import {
  isStoredCoverageCompatible,
  loadStoredCoverage,
  saveStoredCoverage,
} from "../storage/team-coverage-storage";

export function useTeamMetaCoverage() {
  const [team, setTeam] = useState<Team>(createEmptyTeam);
  const [league, setLeague] = useState<League>("great");
  const [shields, setShields] = useState<0 | 1 | 2>(1);
  const [filter, setFilter] = useState<TeamCoverageFilter>("all");
  const [sort, setSort] = useState<TeamCoverageSort>("severity");
  const [matrix, setMatrix] = useState<TeamCoverageMatrix | null>(null);
  const [progress, setProgress] = useState<TeamCoverageProgress | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [status, setStatus] = useState<"idle" | "cancelled" | "error">("idle");
  const [computedAt, setComputedAt] = useState("");
  const runId = useRef(0);
  const cancelled = useRef(false);
  const fingerprint = useMemo(() => createTeamFingerprint(team), [team]);
  const compatibilityKey = useMemo(
    () =>
      createCoverageCompatibilityKey({
        teamFingerprint: fingerprint,
        league,
        shields,
        engineVersion: BATTLE_ENGINE_VERSION,
        metaVersion: metaDataset.version,
        competitiveDataVersion: competitiveDataMetadata.datasetVersion,
      }),
    [fingerprint, league, shields],
  );
  const validation = useMemo(
    () => validateTeamCoverageInput(team, league),
    [team, league],
  );

  useEffect(() => {
    const restoredTeam = loadTeam(window.localStorage) ?? createEmptyTeam();
    const stored = loadStoredCoverage(window.localStorage);
    const restoredLeague = stored?.league ?? restoredTeam.slots[0].build.league;
    const restoredShields = stored?.shields ?? 1;
    const key = createCoverageCompatibilityKey({
      teamFingerprint: createTeamFingerprint(restoredTeam),
      league: restoredLeague,
      shields: restoredShields,
      engineVersion: BATTLE_ENGINE_VERSION,
      metaVersion: metaDataset.version,
      competitiveDataVersion: competitiveDataMetadata.datasetVersion,
    });
    setTeam(restoredTeam);
    setLeague(restoredLeague);
    setShields(restoredShields);
    if (stored) {
      setFilter(stored.filter);
      setSort(stored.sort);
      setComputedAt(stored.computedAt);
      if (isStoredCoverageCompatible(stored, key)) setMatrix(stored.result);
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    saveStoredCoverage(window.localStorage, {
      schemaVersion: 1,
      engineVersion: BATTLE_ENGINE_VERSION,
      metaVersion: metaDataset.version,
      competitiveDataVersion: competitiveDataMetadata.datasetVersion,
      computedAt,
      teamFingerprint: fingerprint,
      compatibilityKey,
      league,
      shields,
      filter,
      sort,
      result:
        matrix?.teamFingerprint === fingerprint &&
        matrix.league === league &&
        matrix.shields === shields
          ? matrix
          : null,
    });
  }, [
    compatibilityKey,
    computedAt,
    filter,
    fingerprint,
    isHydrated,
    league,
    matrix,
    shields,
    sort,
  ]);

  const invalidate = (): void => {
    runId.current += 1;
    cancelled.current = true;
    setIsRunning(false);
    setMatrix(null);
    setProgress(null);
    setStatus("idle");
  };
  const changeLeague = (next: League): void => {
    setLeague(next);
    invalidate();
  };
  const changeShields = (next: 0 | 1 | 2): void => {
    setShields(next);
    invalidate();
  };
  const cancel = (): void => {
    cancelled.current = true;
    runId.current += 1;
    setIsRunning(false);
    setProgress(null);
    setStatus("cancelled");
  };
  const execute = async (): Promise<void> => {
    if (isRunning || !validation.valid) return;
    const currentRun = ++runId.current;
    cancelled.current = false;
    setIsRunning(true);
    setStatus("idle");
    setMatrix(null);
    const total = getMetaEntriesByLeague(league).length * 3;
    setProgress({ runId: currentRun, completed: 0, total, percentage: 0 });
    try {
      const result = await runTeamCoverageMatrix(
        {
          runId: currentRun,
          team,
          league,
          shields,
          opponents: getMetaEntriesByLeague(league),
        },
        {
          isCancelled: () => cancelled.current,
          isCurrent: (candidate) => candidate === runId.current,
          onProgress: (next) => {
            if (currentRun === runId.current) setProgress(next);
          },
        },
      );
      if (currentRun === runId.current && !result.cancelled && !result.stale) {
        setMatrix(result);
        setComputedAt(new Date().toISOString());
      }
    } catch {
      if (currentRun === runId.current) setStatus("error");
    } finally {
      if (currentRun === runId.current) setIsRunning(false);
    }
  };
  const visibleRows = useMemo(
    () =>
      matrix
        ? sortCoverageRows(filterCoverageRows(matrix.rows, filter), sort)
        : [],
    [filter, matrix, sort],
  );
  const criticalRows = useMemo(
    () =>
      matrix
        ? sortCoverageRows(
            filterCoverageRows(matrix.rows, "critical"),
            "severity",
          )
        : [],
    [matrix],
  );
  return {
    team,
    league,
    shields,
    filter,
    sort,
    matrix,
    progress,
    isRunning,
    isHydrated,
    status,
    validation,
    visibleRows,
    criticalRows,
    setFilter,
    setSort,
    changeLeague,
    changeShields,
    cancel,
    execute,
  };
}
