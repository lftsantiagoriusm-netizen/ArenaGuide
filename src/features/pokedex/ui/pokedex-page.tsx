"use client";

import { useMemo, useState } from "react";
import { SearchX } from "lucide-react";
import { Container } from "@/components/common/container";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { Section } from "@/components/common/section";
import { filterPokemon, getAllPokemon, type PokemonType } from "../index";
import {
  PokedexFilters,
  type LeagueFilter,
  type TypeFilter,
} from "./pokedex-filters";
import { PokemonCard } from "./pokemon-card";

const pokemon = getAllPokemon();
const availableTypes = [
  ...new Set(pokemon.flatMap(({ types }) => types)),
].sort() as PokemonType[];

export function PokedexPage() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<TypeFilter>("all");
  const [league, setLeague] = useState<LeagueFilter>("all");
  const filteredPokemon = useMemo(() => {
    return filterPokemon({
      query,
      ...(type === "all" ? {} : { type }),
      ...(league === "all" ? {} : { league }),
    });
  }, [league, query, type]);

  return (
    <Container>
      <Section className="space-y-8">
        <PageHeader
          title="Pokédex PvP"
          description="Consulta especies, estadísticas base y movimientos legales desde el catálogo local de ArenaGuide."
        />
        <PokedexFilters
          query={query}
          type={type}
          league={league}
          availableTypes={availableTypes}
          onQueryChange={setQuery}
          onTypeChange={setType}
          onLeagueChange={setLeague}
        />
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm">
            <span className="text-foreground font-semibold">
              {filteredPokemon.length}
            </span>{" "}
            {filteredPokemon.length === 1 ? "Pokémon" : "Pokémon"}
          </p>
        </div>
        {filteredPokemon.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredPokemon.map((species) => (
              <PokemonCard key={species.id} pokemon={species} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={SearchX}
            title="No encontramos coincidencias"
            description="Prueba con otro nombre, tipo o liga para consultar el catálogo."
          />
        )}
      </Section>
    </Container>
  );
}
