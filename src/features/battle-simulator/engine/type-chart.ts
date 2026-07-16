import type { PokemonType } from "@/features/pokedex";

const strong: Partial<Record<PokemonType, readonly PokemonType[]>> = {
  water: ["fire", "ground", "rock"],
  fire: ["bug", "grass", "ice", "steel"],
  grass: ["ground", "rock", "water"],
  electric: ["flying", "water"],
  ground: ["electric", "fire", "poison", "rock", "steel"],
  fighting: ["dark", "ice", "normal", "rock", "steel"],
  flying: ["bug", "fighting", "grass"],
  poison: ["fairy", "grass"],
  steel: ["fairy", "ice", "rock"],
  ice: ["dragon", "flying", "grass", "ground"],
  fairy: ["dark", "dragon", "fighting"],
  dark: ["ghost", "psychic"],
  ghost: ["ghost", "psychic"],
  rock: ["bug", "fire", "flying", "ice"],
  psychic: ["fighting", "poison"],
  bug: ["dark", "grass", "psychic"],
  dragon: ["dragon"],
};

const resisted: Partial<Record<PokemonType, readonly PokemonType[]>> = {
  water: ["dragon", "grass", "water"],
  fire: ["dragon", "fire", "rock", "water"],
  grass: ["bug", "dragon", "fire", "flying", "grass", "poison", "steel"],
  electric: ["dragon", "electric", "grass", "ground"],
  ground: ["bug", "flying", "grass"],
  fighting: ["bug", "fairy", "flying", "ghost", "poison", "psychic"],
  flying: ["electric", "rock", "steel"],
  poison: ["ghost", "ground", "poison", "rock", "steel"],
  steel: ["electric", "fire", "steel", "water"],
  ice: ["fire", "ice", "steel", "water"],
  fairy: ["fire", "poison", "steel"],
  dark: ["dark", "fairy", "fighting"],
  ghost: ["dark", "normal"],
  rock: ["fighting", "ground", "steel"],
  psychic: ["dark", "psychic", "steel"],
  bug: ["fairy", "fighting", "fire", "flying", "ghost", "poison", "steel"],
  dragon: ["fairy", "steel"],
  normal: ["ghost"],
};

export const getTypeEffectiveness = (
  attackType: PokemonType,
  defenderTypes: readonly PokemonType[],
): number =>
  defenderTypes.reduce((modifier, defenderType) => {
    if (strong[attackType]?.includes(defenderType)) return modifier * 1.6;
    if (resisted[attackType]?.includes(defenderType)) return modifier * 0.625;
    return modifier;
  }, 1);
