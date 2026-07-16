import { getPokemonById, type League } from "@/features/pokedex";
import type { PokemonBuild } from "@/features/team-builder";
import {
  adaptCompetitiveChargedMoveToBattleMove,
  adaptCompetitiveFastMoveToBattleMove,
  resolveCompetitiveBuild,
  resolveCompetitiveChargedMove,
  resolveCompetitiveFastMove,
} from "@/features/competitive-data";
import type { BattlePokemon } from "../domain/types";

export interface BattleBuild extends Omit<PokemonBuild, "formId"> {
  readonly formId?: string;
  readonly shields: 0 | 1 | 2;
}
export interface AdaptedBattle {
  readonly pokemon: BattlePokemon | null;
  readonly error: string | null;
  readonly errorCode: "invalid-build" | "competitive-move-not-found" | null;
}

export const adaptBuildToBattlePokemon = (
  build: BattleBuild,
  league: League,
): AdaptedBattle => {
  const species = getPokemonById(build.pokemonId);
  if (!species)
    return {
      pokemon: null,
      error: "Selecciona un Pokémon válido.",
      errorCode: "invalid-build",
    };
  const resolved = resolveCompetitiveBuild({
    ...build,
    formId:
      build.formId ??
      species.forms.find(({ isDefault }) => isDefault)?.id ??
      species.forms[0]?.id ??
      "",
    league,
  });
  if (!resolved.ok)
    return {
      pokemon: null,
      error: resolved.error.message,
      errorCode: "invalid-build",
    };
  const fast = resolveCompetitiveFastMove(build.fastMoveId);
  const charged1 = resolveCompetitiveChargedMove(build.chargedMove1Id);
  const charged2 = resolveCompetitiveChargedMove(build.chargedMove2Id);
  const missingMove = [fast, charged1, charged2].find((move) => !move.ok);
  if (missingMove && !missingMove.ok)
    return {
      pokemon: null,
      error: missingMove.error.message,
      errorCode: "competitive-move-not-found",
    };
  if (!fast.ok || !charged1.ok || !charged2.ok)
    return {
      pokemon: null,
      error: "No fue posible resolver los movimientos competitivos.",
      errorCode: "competitive-move-not-found",
    };
  return {
    pokemon: {
      id: species.id,
      name: species.name,
      types: species.types,
      stats: resolved.build.stats,
      fastMove: adaptCompetitiveFastMoveToBattleMove(fast.move),
      chargedMoves: [
        adaptCompetitiveChargedMoveToBattleMove(charged1.move),
        adaptCompetitiveChargedMoveToBattleMove(charged2.move),
      ],
    },
    error: null,
    errorCode: null,
  };
};
