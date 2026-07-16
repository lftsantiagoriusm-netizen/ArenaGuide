"use client";

import { useState } from "react";
import { Swords } from "lucide-react";
import type { League } from "@/features/pokedex";
import { Container } from "@/components/common/container";
import { PageHeader } from "@/components/common/page-header";
import { Section } from "@/components/common/section";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import {
  adaptBuildToBattlePokemon,
  firstChargedShieldStrategy,
  simulateBattle,
  type BattleBuild,
  type SimulationResult,
} from "../index";
import { BattlePokemonForm } from "./battle-pokemon-form";
import { BattleResultCard } from "./battle-result-card";
import { CompetitiveDataVersion } from "@/features/competitive-data/components/competitive-data-version";

const emptyBuild = (): BattleBuild => ({
  pokemonId: "",
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

export function BattleSimulatorPage() {
  const [league, setLeague] = useState<League>("great");
  const [buildA, setBuildA] = useState<BattleBuild>(emptyBuild);
  const [buildB, setBuildB] = useState<BattleBuild>(emptyBuild);
  const [shields, setShields] = useState<0 | 1 | 2>(1);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const resolvedA = adaptBuildToBattlePokemon(
    { ...buildA, league, shields },
    league,
  );
  const resolvedB = adaptBuildToBattlePokemon(
    { ...buildB, league, shields },
    league,
  );
  const run = (): void => {
    const a = adaptBuildToBattlePokemon({ ...buildA, league, shields }, league);
    const b = adaptBuildToBattlePokemon({ ...buildB, league, shields }, league);
    if (!a.pokemon || !b.pokemon) {
      setError(a.error ?? b.error ?? "Configuración inválida.");
      setResult(null);
      return;
    }
    setError(null);
    setResult(
      simulateBattle({
        league,
        pokemonA: a.pokemon,
        pokemonB: b.pokemon,
        shieldsA: shields,
        shieldsB: shields,
        shieldStrategy: firstChargedShieldStrategy,
      }),
    );
  };
  return (
    <Container>
      <Section className="space-y-8">
        <PageHeader
          title="Battle Lab"
          description="Simula un combate individual determinístico sobre una línea temporal discreta."
        />
        <CompetitiveDataVersion />
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Liga"
            value={league}
            onChange={(event) => setLeague(event.target.value as League)}
          >
            <option value="great">Great League</option>
            <option value="ultra">Ultra League</option>
            <option value="master">Master League</option>
          </Select>
          <Select
            label="Escudos"
            value={shields}
            onChange={(event) =>
              setShields(Number(event.target.value) as 0 | 1 | 2)
            }
          >
            <option value={0}>0 vs 0</option>
            <option value={1}>1 vs 1</option>
            <option value={2}>2 vs 2</option>
          </Select>
        </div>
        <div className="grid gap-5 xl:grid-cols-2">
          <BattlePokemonForm
            label="Pokémon A"
            build={buildA}
            onChange={(build) => {
              setBuildA(build);
              setResult(null);
            }}
          />
          <BattlePokemonForm
            label="Pokémon B"
            build={buildB}
            onChange={(build) => {
              setBuildB(build);
              setResult(null);
            }}
          />
        </div>
        <Button
          size="lg"
          className="w-full sm:w-auto"
          onClick={run}
          disabled={!resolvedA.pokemon || !resolvedB.pokemon}
        >
          <Swords className="size-4" />
          Simular combate
        </Button>
        {error ? (
          <p
            role="alert"
            className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-700 dark:text-red-300"
          >
            {error}
          </p>
        ) : null}
        {result ? <BattleResultCard result={result} /> : null}
      </Section>
    </Container>
  );
}
