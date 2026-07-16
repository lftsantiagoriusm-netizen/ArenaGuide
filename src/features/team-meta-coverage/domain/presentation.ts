import type { TeamCoverageProgress } from "./types";

export const TEAM_COVERAGE_LIMITATION_NOTICE =
  "Esta matriz compara enfrentamientos individuales 1v1. No representa una simulación completa 3v3 con cambios, energía persistente, escudos compartidos o reloj de cambio.";

export const canExecuteTeamCoverage = (
  isValid: boolean,
  isRunning: boolean,
): boolean => isValid && !isRunning;

export const shouldShowCoverageProgress = (
  isRunning: boolean,
  progress: TeamCoverageProgress | null,
): boolean => isRunning && progress !== null;

export const configurationInvalidatesCoverage = (
  previousCompatibilityKey: string,
  nextCompatibilityKey: string,
): boolean => previousCompatibilityKey !== nextCompatibilityKey;
