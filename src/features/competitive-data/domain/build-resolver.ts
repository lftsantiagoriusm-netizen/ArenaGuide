import { getPokemonById } from "@/features/pokedex";
import type { PokemonBuild } from "@/features/team-builder";
import { competitiveDataMetadata } from "../data/competitive-dataset";
import { calculateCompetitiveStats } from "./combat-stats";
import { getLeagueRules, isCpEligibleForLeague } from "./league-rules";
import { getLevelMultiplier } from "./level-multipliers";
import type { CompetitiveBuildError, ResolveBuildResult } from "./types";

const failure = (error: CompetitiveBuildError): ResolveBuildResult => ({
  ok: false,
  error,
});
const validIv = (value: number): boolean =>
  Number.isInteger(value) && value >= 0 && value <= 15;

export const resolveCompetitiveBuild = (
  input: PokemonBuild,
): ResolveBuildResult => {
  const species = getPokemonById(input.pokemonId);
  if (!species)
    return failure({
      code: "species-not-found",
      field: "pokemonId",
      message: "Selecciona un Pokémon válido.",
    });
  if (!species.forms.some(({ id }) => id === input.formId))
    return failure({
      code: "form-not-found",
      field: "formId",
      message: "La forma seleccionada no existe.",
    });
  if (!species.eligibleLeagues.includes(input.league))
    return failure({
      code: "species-incompatible",
      field: "league",
      message: "La especie no es compatible con esta liga.",
    });
  if (![input.attackIv, input.defenseIv, input.staminaIv].every(validIv))
    return failure({
      code: "invalid-iv",
      field: "attackIv",
      message: "Los IV deben ser enteros entre 0 y 15.",
    });
  const level = getLevelMultiplier(input.level);
  if (!level.ok)
    return failure({
      code: "level-not-supported",
      field: "level",
      message: "El nivel no existe en el catálogo competitivo.",
    });
  const fast = species.learnset.fastMoves.some(
    ({ id }) => id === input.fastMoveId,
  );
  const charged1 = species.learnset.chargedMoves.some(
    ({ id }) => id === input.chargedMove1Id,
  );
  const charged2 = species.learnset.chargedMoves.some(
    ({ id }) => id === input.chargedMove2Id,
  );
  if (!fast || !charged1 || !charged2)
    return failure({
      code: "illegal-move",
      field: !fast
        ? "fastMoveId"
        : !charged1
          ? "chargedMove1Id"
          : "chargedMove2Id",
      message: "El build contiene un movimiento ilegal.",
    });
  if (input.chargedMove1Id === input.chargedMove2Id)
    return failure({
      code: "duplicate-charged-move",
      field: "chargedMove2Id",
      message: "Los movimientos cargados deben ser distintos.",
    });
  const stats = calculateCompetitiveStats({
    baseStats: species.baseStats,
    attackIv: input.attackIv,
    defenseIv: input.defenseIv,
    staminaIv: input.staminaIv,
    levelMultiplier: level.multiplier,
  });
  const leagueRules = getLeagueRules(input.league);
  if (!isCpEligibleForLeague(stats.cp, input.league))
    return failure({
      code: "over-cp-limit",
      field: "level",
      message: `El build tiene ${stats.cp} CP y supera el límite de ${leagueRules.cpLimit}.`,
      cp: stats.cp,
      ...(leagueRules.cpLimit === null ? {} : { cpLimit: leagueRules.cpLimit }),
    });
  return {
    ok: true,
    build: {
      speciesId: species.id,
      formId: input.formId,
      level: input.level,
      ivs: {
        attack: input.attackIv,
        defense: input.defenseIv,
        stamina: input.staminaIv,
      },
      baseStats: species.baseStats,
      stats,
      league: input.league,
      leagueRules,
      dataVersion: competitiveDataMetadata.datasetVersion,
      dataStatus: competitiveDataMetadata.status,
    },
  };
};

export const isBuildEligibleForLeague = (build: PokemonBuild): boolean =>
  resolveCompetitiveBuild(build).ok;
