"use client";

import { Ban, Play, ShieldAlert } from "lucide-react";
import type { League } from "@/features/pokedex";
import { Container } from "@/components/common/container";
import { PageHeader } from "@/components/common/page-header";
import { Section } from "@/components/common/section";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import {
  canExecuteTeamCoverage,
  shouldShowCoverageProgress,
  TEAM_COVERAGE_LIMITATION_NOTICE,
} from "../domain/presentation";
import type { TeamCoverageFilter, TeamCoverageSort } from "../domain/types";
import { useTeamMetaCoverage } from "../hooks/use-team-meta-coverage";
import { CoverageRowCard } from "./coverage-row-card";
import { CoverageSummary } from "./coverage-summary";
import { TeamPreview } from "./team-preview";

export function TeamMetaCoveragePage() {
  const {
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
  } = useTeamMetaCoverage();

  if (!isHydrated)
    return (
      <Container>
        <Section>
          <p className="text-muted-foreground text-sm">
            Restaurando equipo y configuración…
          </p>
        </Section>
      </Container>
    );
  return (
    <Container>
      <Section className="space-y-8">
        <PageHeader
          title="Cobertura colectiva del equipo"
          description="Evalúa cada integrante por separado contra el fixture local del meta y agrega su cobertura."
        />
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-900 dark:text-amber-100">
          {TEAM_COVERAGE_LIMITATION_NOTICE}
        </div>
        <TeamPreview team={team} issues={validation.issues} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Liga"
            value={league}
            onChange={(event) => {
              changeLeague(event.target.value as League);
            }}
          >
            <option value="great">Great League</option>
            <option value="ultra">Ultra League</option>
            <option value="master">Master League</option>
          </Select>
          <Select
            label="Escudos"
            value={shields}
            onChange={(event) => {
              changeShields(Number(event.target.value) as 0 | 1 | 2);
            }}
          >
            <option value={0}>0 vs 0</option>
            <option value={1}>1 vs 1</option>
            <option value={2}>2 vs 2</option>
          </Select>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            size="lg"
            disabled={!canExecuteTeamCoverage(validation.valid, isRunning)}
            onClick={() => void execute()}
            className="w-full sm:w-auto"
          >
            <Play className="size-4" />
            {isRunning ? "Analizando…" : "Analizar cobertura"}
          </Button>
          <Button
            size="lg"
            variant="secondary"
            disabled={!isRunning}
            onClick={cancel}
            className="w-full sm:w-auto"
          >
            <Ban className="size-4" />
            Cancelar
          </Button>
        </div>
        {shouldShowCoverageProgress(isRunning, progress) && progress ? (
          <div>
            <div className="bg-accent h-2 overflow-hidden rounded-full">
              <div
                className="bg-primary h-full transition-all"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
            <p className="text-muted-foreground mt-2 text-xs">
              {progress.completed} de {progress.total} simulaciones ·{" "}
              {progress.percentage}%
            </p>
          </div>
        ) : null}
        {status === "cancelled" ? (
          <p className="rounded-xl border border-amber-500/30 p-4 text-sm">
            Ejecución cancelada. Puedes cambiar la configuración o intentarlo
            nuevamente.
          </p>
        ) : null}
        {status === "error" ? (
          <p className="border-destructive/30 text-destructive rounded-xl border p-4 text-sm">
            No fue posible completar el análisis. El equipo permanece disponible
            para reintentar.
          </p>
        ) : null}
        {matrix ? (
          <>
            <CoverageSummary summary={matrix.summary} />
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="text-destructive size-5" />
                <h2 className="text-lg font-semibold">Amenazas críticas</h2>
              </div>
              {criticalRows.length ? (
                criticalRows.map((row) => (
                  <CoverageRowCard
                    key={`critical-${row.opponent.id}`}
                    row={row}
                  />
                ))
              ) : (
                <p className="text-muted-foreground rounded-xl border border-dashed p-5 text-sm">
                  No se detectaron amenazas críticas en este fixture.
                </p>
              )}
            </section>
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Filtro"
                value={filter}
                onChange={(event) =>
                  setFilter(event.target.value as TeamCoverageFilter)
                }
              >
                <option value="all">Todos</option>
                <option value="covered">Cubiertos</option>
                <option value="uncertain">Inciertos</option>
                <option value="critical">Críticos</option>
                <option value="invalid">Inválidos</option>
                <option value="incomplete">Incompletos</option>
              </Select>
              <Select
                label="Orden"
                value={sort}
                onChange={(event) =>
                  setSort(event.target.value as TeamCoverageSort)
                }
              >
                <option value="severity">Gravedad</option>
                <option value="name">Nombre</option>
                <option value="best-score">Mejor score</option>
                <option value="redundancy">Redundancia</option>
              </Select>
            </div>
            <div className="border-border text-muted-foreground hidden grid-cols-[1.3fr_repeat(3,1fr)_0.8fr_0.8fr] gap-3 border-b px-4 pb-2 text-xs md:grid">
              <span>Rival</span>
              <span>slot1</span>
              <span>slot2</span>
              <span>slot3</span>
              <span>Mejor</span>
              <span>Estado</span>
            </div>
            <div className="space-y-3">
              {visibleRows.map((row) => (
                <CoverageRowCard key={row.opponent.id} row={row} />
              ))}
              {visibleRows.length === 0 ? (
                <p className="text-muted-foreground rounded-xl border border-dashed p-5 text-center text-sm">
                  No hay filas para este filtro.
                </p>
              ) : null}
            </div>
          </>
        ) : !validation.valid ? (
          <p className="text-muted-foreground rounded-xl border border-dashed p-6 text-center text-sm">
            Completa y guarda un equipo válido de tres integrantes en Team
            Builder para comenzar.
          </p>
        ) : null}
      </Section>
    </Container>
  );
}
