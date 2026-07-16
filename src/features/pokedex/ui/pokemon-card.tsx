import type { PokemonSpecies, PokemonType } from "../domain/types";
import { getTypeLabel } from "./pokedex-filters";

const typeStyles: Record<PokemonType, string> = {
  bug: "bg-lime-500/12 text-lime-700 dark:text-lime-300",
  dark: "bg-slate-500/12 text-slate-700 dark:text-slate-300",
  dragon: "bg-indigo-500/12 text-indigo-700 dark:text-indigo-300",
  electric: "bg-yellow-500/12 text-yellow-700 dark:text-yellow-300",
  fairy: "bg-pink-500/12 text-pink-700 dark:text-pink-300",
  fighting: "bg-red-500/12 text-red-700 dark:text-red-300",
  fire: "bg-orange-500/12 text-orange-700 dark:text-orange-300",
  flying: "bg-sky-500/12 text-sky-700 dark:text-sky-300",
  ghost: "bg-violet-500/12 text-violet-700 dark:text-violet-300",
  grass: "bg-green-500/12 text-green-700 dark:text-green-300",
  ground: "bg-amber-500/12 text-amber-700 dark:text-amber-300",
  ice: "bg-cyan-500/12 text-cyan-700 dark:text-cyan-300",
  normal: "bg-neutral-500/12 text-neutral-700 dark:text-neutral-300",
  poison: "bg-purple-500/12 text-purple-700 dark:text-purple-300",
  psychic: "bg-fuchsia-500/12 text-fuchsia-700 dark:text-fuchsia-300",
  rock: "bg-stone-500/12 text-stone-700 dark:text-stone-300",
  steel: "bg-zinc-500/12 text-zinc-700 dark:text-zinc-300",
  water: "bg-blue-500/12 text-blue-700 dark:text-blue-300",
};

export function PokemonCard({ pokemon }: { readonly pokemon: PokemonSpecies }) {
  const { baseStats, learnset } = pokemon;
  return (
    <article className="border-border bg-card hover:border-primary/20 rounded-2xl border p-5 shadow-sm transition hover:shadow-md">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-muted-foreground text-xs font-medium">
            #{pokemon.pokedexNumber.toString().padStart(4, "0")}
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">
            {pokemon.name}
          </h2>
        </div>
        <div className="flex flex-wrap justify-end gap-1.5">
          {pokemon.types.map((type) => (
            <span
              key={type}
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${typeStyles[type]}`}
            >
              {getTypeLabel(type)}
            </span>
          ))}
        </div>
      </header>
      <dl className="divide-border bg-accent/60 mt-5 grid grid-cols-3 divide-x rounded-xl py-3 text-center">
        <div>
          <dt className="text-muted-foreground text-[11px] tracking-wide uppercase">
            Attack
          </dt>
          <dd className="mt-1 text-sm font-semibold tabular-nums">
            {baseStats.attack}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-[11px] tracking-wide uppercase">
            Defense
          </dt>
          <dd className="mt-1 text-sm font-semibold tabular-nums">
            {baseStats.defense}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-[11px] tracking-wide uppercase">
            Stamina
          </dt>
          <dd className="mt-1 text-sm font-semibold tabular-nums">
            {baseStats.stamina}
          </dd>
        </div>
      </dl>
      <div className="mt-5 grid gap-4 text-sm">
        <MoveList
          label="Movimientos rápidos"
          moves={learnset.fastMoves.map(({ name }) => name)}
        />
        <MoveList
          label="Movimientos cargados"
          moves={learnset.chargedMoves.map(({ name }) => name)}
        />
      </div>
    </article>
  );
}

function MoveList({
  label,
  moves,
}: {
  readonly label: string;
  readonly moves: readonly string[];
}) {
  return (
    <div>
      <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
        {label}
      </h3>
      <p className="text-foreground/85 mt-1.5 leading-6">{moves.join(" · ")}</p>
    </div>
  );
}
