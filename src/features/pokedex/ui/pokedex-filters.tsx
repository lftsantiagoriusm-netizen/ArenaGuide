import type { ChangeEvent } from "react";
import { Search } from "lucide-react";
import { Select } from "@/components/ui/select";
import type { League, PokemonType } from "../domain/types";

export type TypeFilter = PokemonType | "all";
export type LeagueFilter = League | "all";

interface PokedexFiltersProps {
  readonly query: string;
  readonly type: TypeFilter;
  readonly league: LeagueFilter;
  readonly availableTypes: readonly PokemonType[];
  readonly onQueryChange: (value: string) => void;
  readonly onTypeChange: (value: TypeFilter) => void;
  readonly onLeagueChange: (value: LeagueFilter) => void;
}

const typeLabels: Record<PokemonType, string> = {
  bug: "Bug",
  dark: "Dark",
  dragon: "Dragon",
  electric: "Electric",
  fairy: "Fairy",
  fighting: "Fighting",
  fire: "Fire",
  flying: "Flying",
  ghost: "Ghost",
  grass: "Grass",
  ground: "Ground",
  ice: "Ice",
  normal: "Normal",
  poison: "Poison",
  psychic: "Psychic",
  rock: "Rock",
  steel: "Steel",
  water: "Water",
};

export const getTypeLabel = (type: PokemonType): string => typeLabels[type];

export function PokedexFilters({
  query,
  type,
  league,
  availableTypes,
  onQueryChange,
  onTypeChange,
  onLeagueChange,
}: PokedexFiltersProps) {
  return (
    <div className="border-border bg-card grid gap-4 rounded-2xl border p-4 shadow-sm sm:grid-cols-[minmax(220px,1fr)_180px_180px] sm:p-5">
      <label className="grid gap-2 text-sm font-medium">
        Buscar Pokémon
        <span className="relative">
          <Search
            aria-hidden="true"
            className="text-muted-foreground absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
          />
          <input
            type="search"
            value={query}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              onQueryChange(event.target.value)
            }
            placeholder="Ej. Azumarill"
            className="border-border bg-background placeholder:text-muted-foreground focus:border-primary/50 focus:ring-primary/15 h-12 w-full rounded-xl border pr-4 pl-10 text-sm transition outline-none focus:ring-2"
          />
        </span>
      </label>
      <Select
        label="Tipo"
        value={type}
        onChange={(event) => onTypeChange(event.target.value as TypeFilter)}
      >
        <option value="all">Todos</option>
        {availableTypes.map((pokemonType) => (
          <option key={pokemonType} value={pokemonType}>
            {getTypeLabel(pokemonType)}
          </option>
        ))}
      </Select>
      <Select
        label="Liga"
        value={league}
        onChange={(event) => onLeagueChange(event.target.value as LeagueFilter)}
      >
        <option value="all">Todas</option>
        <option value="great">Great League</option>
        <option value="ultra">Ultra League</option>
        <option value="master">Master League</option>
      </Select>
    </div>
  );
}
