export type PokemonType =
  | "bug"
  | "dark"
  | "dragon"
  | "electric"
  | "fairy"
  | "fighting"
  | "fire"
  | "flying"
  | "ghost"
  | "grass"
  | "ground"
  | "ice"
  | "normal"
  | "poison"
  | "psychic"
  | "rock"
  | "steel"
  | "water";

export type League = "great" | "ultra" | "master";

export interface BaseStats {
  readonly attack: number;
  readonly defense: number;
  readonly stamina: number;
}

export interface PokemonForm {
  readonly id: string;
  readonly name: string;
  readonly isDefault: boolean;
}

interface Move {
  readonly id: string;
  readonly name: string;
  readonly type: PokemonType;
}

export interface FastMove extends Move {
  readonly category: "fast";
}

export interface ChargedMove extends Move {
  readonly category: "charged";
}

export interface PokemonLearnset {
  readonly fastMoves: readonly FastMove[];
  readonly chargedMoves: readonly ChargedMove[];
}

export interface PokemonSpecies {
  readonly id: string;
  readonly name: string;
  readonly pokedexNumber: number;
  readonly types: readonly [PokemonType] | readonly [PokemonType, PokemonType];
  readonly baseStats: BaseStats;
  readonly forms: readonly PokemonForm[];
  readonly learnset: PokemonLearnset;
  readonly eligibleLeagues: readonly League[];
}
