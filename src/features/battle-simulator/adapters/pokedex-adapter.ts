import {
  getPokemonById,
  type ChargedMove,
  type FastMove,
  type League,
} from "@/features/pokedex";
import type { PokemonBuild } from "@/features/team-builder";
import type { BattleMove, BattlePokemon } from "../domain/types";
import { calculateEffectiveStats } from "../engine/stats";

// Mechanics Fixture v1: normalized temporary values, not official Pokémon GO move data.
const adaptFast = (move: FastMove): BattleMove => ({
  id: move.id,
  name: move.name,
  type: move.type,
  kind: "fast",
  power: 5,
  energyDelta: 8,
  turns: 2,
});
const adaptCharged = (move: ChargedMove): BattleMove => ({
  id: move.id,
  name: move.name,
  type: move.type,
  kind: "charged",
  power: 70,
  energyDelta: -50,
  turns: 0,
});

export interface BattleBuild extends Omit<PokemonBuild, "formId"> {
  readonly shields: 0 | 1 | 2;
}
export interface AdaptedBattle {
  readonly pokemon: BattlePokemon | null;
  readonly error: string | null;
}

export const adaptBuildToBattlePokemon = (
  build: BattleBuild,
  league: League,
): AdaptedBattle => {
  const species = getPokemonById(build.pokemonId);
  if (!species)
    return { pokemon: null, error: "Selecciona un Pokémon válido." };
  if (!species.eligibleLeagues.includes(league))
    return {
      pokemon: null,
      error: `${species.name} no es elegible para esta liga.`,
    };
  const fast = species.learnset.fastMoves.find(
    ({ id }) => id === build.fastMoveId,
  );
  const charged1 = species.learnset.chargedMoves.find(
    ({ id }) => id === build.chargedMove1Id,
  );
  const charged2 = species.learnset.chargedMoves.find(
    ({ id }) => id === build.chargedMove2Id,
  );
  if (!fast || !charged1 || !charged2 || charged1.id === charged2.id)
    return {
      pokemon: null,
      error: `La configuración de movimientos de ${species.name} no es legal.`,
    };
  if (
    [build.attackIv, build.defenseIv, build.staminaIv].some(
      (iv) => !Number.isInteger(iv) || iv < 0 || iv > 15,
    ) ||
    build.level < 1 ||
    build.level > 50 ||
    build.level * 2 !== Math.round(build.level * 2)
  )
    return {
      pokemon: null,
      error: `Los IV o el nivel de ${species.name} no son válidos.`,
    };
  return {
    pokemon: {
      id: species.id,
      name: species.name,
      types: species.types,
      stats: calculateEffectiveStats({
        baseStats: species.baseStats,
        attackIv: build.attackIv,
        defenseIv: build.defenseIv,
        staminaIv: build.staminaIv,
        level: build.level,
      }),
      fastMove: adaptFast(fast),
      chargedMoves: [adaptCharged(charged1), adaptCharged(charged2)],
    },
    error: null,
  };
};
