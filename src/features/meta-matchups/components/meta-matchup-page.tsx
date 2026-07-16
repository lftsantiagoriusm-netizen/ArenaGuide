"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChartNoAxesColumnIncreasing } from "lucide-react";
import Link from "next/link";
import type { League } from "@/features/pokedex";
import type { BattleBuild } from "@/features/battle-simulator";
import { BattlePokemonForm } from "@/features/battle-simulator/components/battle-pokemon-form";
import { Container } from "@/components/common/container";
import { PageHeader } from "@/components/common/page-header";
import { Section } from "@/components/common/section";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { getMetaEntriesByLeague, metaDataset } from "../data/meta-dataset";
import { filterMatchups, sortMatchups } from "../domain/matrix-operations";
import type {
  BatchSimulationProgress,
  MatchupFilter,
  MatchupMatrix,
  MatchupSortOption,
} from "../domain/types";
import { runMatchupMatrix } from "../services/run-matchup-matrix";
import {
  loadMatrixSettings,
  saveMatrixSettings,
} from "../storage/meta-settings-storage";
import { MatchupCard } from "./matchup-card";
import { MetaSummary } from "./meta-summary";

const defaultBuild = (): BattleBuild => ({
  pokemonId: "",
  formId: "",
  league: "great",
  attackIv: 0,
  defenseIv: 15,
  staminaIv: 15,
  level: 20,
  fastMoveId: "",
  chargedMove1Id: "",
  chargedMove2Id: "",
  shields: 1,
});

export function MetaMatchupPage() {
  const [league, setLeague] = useState<League>("great");
  const [shields, setShields] = useState<0 | 1 | 2>(1);
  const [build, setBuild] = useState<BattleBuild>(defaultBuild);
  const [filter, setFilter] = useState<MatchupFilter>("all");
  const [sort, setSort] = useState<MatchupSortOption>("best");
  const [matrix, setMatrix] = useState<MatchupMatrix | null>(null);
  const [progress, setProgress] = useState<BatchSimulationProgress | null>(
    null,
  );
  const [hydrated, setHydrated] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const runId = useRef(0);

  const invalidateRun = (): void => {
    runId.current += 1;
    setIsRunning(false);
    setMatrix(null);
    setProgress(null);
  };

  useEffect(() => {
    const restored = loadMatrixSettings(window.localStorage);
    if (restored) {
      setLeague(restored.league);
      setShields(restored.shields);
      setBuild(restored.build);
      setFilter(restored.filter);
      setSort(restored.sort);
    }
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (hydrated)
      saveMatrixSettings(window.localStorage, {
        version: 1,
        build,
        league,
        shields,
        filter,
        sort,
      });
  }, [build, filter, hydrated, league, shields, sort]);

  const visible = useMemo(
    () =>
      matrix ? sortMatchups(filterMatchups(matrix.results, filter), sort) : [],
    [filter, matrix, sort],
  );
  const analyze = async (): Promise<void> => {
    if (isRunning) return;
    const currentRun = ++runId.current;
    setIsRunning(true);
    setMatrix(null);
    setProgress({
      runId: currentRun,
      completed: 0,
      total: getMetaEntriesByLeague(league).length,
      percentage: 0,
    });
    const next = await runMatchupMatrix(
      {
        runId: currentRun,
        analyzedBuild: { ...build, league, shields },
        league,
        shields,
        opponents: getMetaEntriesByLeague(league),
      },
      {
        isCurrent: (candidate) => candidate === runId.current,
        onProgress: setProgress,
      },
    );
    if (currentRun === runId.current) {
      if (!next.stale) setMatrix(next);
      setIsRunning(false);
    }
  };

  if (!hydrated)
    return (
      <Container>
        <Section>
          <p className="text-muted-foreground text-sm">
            Restaurando configuración…
          </p>
        </Section>
      </Container>
    );
  return (
    <Container>
      <Section className="space-y-8">
        <PageHeader
          title="Matriz contra el Meta"
          description="Compara un build contra un fixture local mediante el motor determinístico 1v1 de ArenaGuide."
        />
        <Button asChild variant="secondary" className="w-full sm:w-auto">
          <Link href="/meta/team">Analizar cobertura del equipo</Link>
        </Button>
        <div className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-4 text-sm text-amber-800 dark:text-amber-200">
          <strong>{metaDataset.label}:</strong> catálogo pequeño y provisional;
          no representa un ranking oficial actualizado.
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Liga"
            value={league}
            onChange={(event) => {
              setLeague(event.target.value as League);
              invalidateRun();
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
              setShields(Number(event.target.value) as 0 | 1 | 2);
              invalidateRun();
            }}
          >
            <option value={0}>0 vs 0</option>
            <option value={1}>1 vs 1</option>
            <option value={2}>2 vs 2</option>
          </Select>
        </div>
        <BattlePokemonForm
          label="Pokémon analizado"
          build={build}
          onChange={(next) => {
            setBuild(next);
            invalidateRun();
          }}
        />
        <Button
          size="lg"
          disabled={isRunning}
          onClick={() => void analyze()}
          className="w-full sm:w-auto"
        >
          <ChartNoAxesColumnIncreasing className="size-4" />
          {isRunning ? "Analizando…" : "Analizar contra el meta"}
        </Button>
        {progress && progress.percentage < 100 ? (
          <div>
            <div className="bg-accent h-2 overflow-hidden rounded-full">
              <div
                className="bg-primary h-full transition-all"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
            <p className="text-muted-foreground mt-2 text-xs">
              {progress.completed} de {progress.total} · {progress.percentage}%
            </p>
          </div>
        ) : null}
        {matrix ? (
          <>
            <MetaSummary summary={matrix.summary} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Filtro"
                value={filter}
                onChange={(event) =>
                  setFilter(event.target.value as MatchupFilter)
                }
              >
                <option value="all">Todos</option>
                <option value="wins">Victorias</option>
                <option value="losses">Derrotas</option>
                <option value="draws">Empates</option>
                <option value="favorable">Favorables</option>
                <option value="close">Cerrados</option>
                <option value="unfavorable">Desfavorables</option>
                <option value="invalid">Inválidos</option>
              </Select>
              <Select
                label="Orden"
                value={sort}
                onChange={(event) =>
                  setSort(event.target.value as MatchupSortOption)
                }
              >
                <option value="best">Mejor matchup</option>
                <option value="worst">Peor matchup</option>
                <option value="name">Nombre</option>
                <option value="remaining-hp">Vida restante</option>
                <option value="duration">Duración</option>
                <option value="weight">Peso del meta</option>
              </Select>
            </div>
            <div className="grid gap-4">
              {visible.map((item) => (
                <MatchupCard key={item.opponent.id} item={item} />
              ))}
              {visible.length === 0 ? (
                <p className="border-border text-muted-foreground rounded-xl border border-dashed p-6 text-center text-sm">
                  No hay resultados para este filtro.
                </p>
              ) : null}
            </div>
          </>
        ) : null}
      </Section>
    </Container>
  );
}
