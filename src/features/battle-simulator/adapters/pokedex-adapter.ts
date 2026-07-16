import {
  getPokemonById,
  type ChargedMove,
  type FastMove,
  type League,
} from "@/features/pokedex";
import type { PokemonBuild } from "@/features/team-builder";
import { resolveCompetitiveBuild } from "@/features/competitive-data";
import type { BattleMove, BattlePokemon } from "../domain/types";

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
  readonly formId?: string;
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
  const resolved = resolveCompetitiveBuild({
    ...build,
    formId:
      build.formId ??
      species.forms.find(({ isDefault }) => isDefault)?.id ??
      species.forms[0]?.id ??
      "",
    league,
  });
  if (!resolved.ok) return { pokemon: null, error: resolved.error.message };
  const fast = species.learnset.fastMoves.find(
    ({ id }) => id === build.fastMoveId,
  );
  const charged1 = species.learnset.chargedMoves.find(
    ({ id }) => id === build.chargedMove1Id,
  );
  const charged2 = species.learnset.chargedMoves.find(
    ({ id }) => id === build.chargedMove2Id,
  );
  if (!fast || !charged1 || !charged2)
    return {
      pokemon: null,
      error: `La configuración de movimientos de ${species.name} no es legal.`,
    };
  return {
    pokemon: {
      id: species.id,
      name: species.name,
      types: species.types,
      stats: resolved.build.stats,
      fastMove: adaptFast(fast),
      chargedMoves: [adaptCharged(charged1), adaptCharged(charged2)],
    },
    error: null,
  };
};
