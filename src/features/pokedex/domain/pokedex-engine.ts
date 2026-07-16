import { pokemonData } from "../data/pokemon-data";
import type {
  League,
  PokemonLearnset,
  PokemonSpecies,
  PokemonType,
} from "./types";

const catalog: readonly PokemonSpecies[] = pokemonData;

export interface PokemonFilters {
  readonly query?: string;
  readonly type?: PokemonType;
  readonly league?: League;
}

const normalize = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLocaleLowerCase("en-US");

export const getAllPokemon = (): readonly PokemonSpecies[] => catalog;

export const getPokemonById = (id: string): PokemonSpecies | undefined => {
  const normalizedId = normalize(id);
  return catalog.find((pokemon) => pokemon.id === normalizedId);
};

export const searchPokemonByName = (
  query: string,
): readonly PokemonSpecies[] => {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return catalog;
  return catalog.filter((pokemon) =>
    normalize(pokemon.name).includes(normalizedQuery),
  );
};

export const listPokemonByType = (
  type: PokemonType,
): readonly PokemonSpecies[] =>
  catalog.filter((pokemon) => pokemon.types.includes(type));

export const listPokemonByLeague = (
  league: League,
): readonly PokemonSpecies[] =>
  catalog.filter((pokemon) => pokemon.eligibleLeagues.includes(league));

export const getLegalMoves = (pokemonId: string): PokemonLearnset | undefined =>
  getPokemonById(pokemonId)?.learnset;

export const filterPokemon = ({
  query = "",
  type,
  league,
}: PokemonFilters): readonly PokemonSpecies[] =>
  searchPokemonByName(query).filter(
    (pokemon) =>
      (!type || pokemon.types.includes(type)) &&
      (!league || pokemon.eligibleLeagues.includes(league)),
  );
