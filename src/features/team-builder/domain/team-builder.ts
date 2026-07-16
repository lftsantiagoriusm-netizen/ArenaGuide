import { getLegalMoves, getPokemonById } from "@/features/pokedex";
import type { League } from "@/features/pokedex";
import { resolveCompetitiveBuild } from "@/features/competitive-data";
import type {
  PokemonBuild,
  Team,
  TeamSlot,
  TeamSlotId,
  ValidationIssue,
} from "./types";

const DEFAULT_LEAGUE: League = "great";

export const createEmptyBuild = (
  league: League = DEFAULT_LEAGUE,
): PokemonBuild => ({
  pokemonId: "",
  formId: "",
  league,
  attackIv: 0,
  defenseIv: 0,
  staminaIv: 0,
  level: 1,
  fastMoveId: "",
  chargedMove1Id: "",
  chargedMove2Id: "",
});

const createSlot = (id: TeamSlotId): TeamSlot => ({
  id,
  build: createEmptyBuild(),
});

export const createEmptyTeam = (): Team => ({
  version: 1,
  slots: [createSlot(1), createSlot(2), createSlot(3)],
});

export const updateTeamBuild = (
  team: Team,
  slotId: TeamSlotId,
  build: PokemonBuild,
): Team => ({
  ...team,
  slots: team.slots.map((slot) =>
    slot.id === slotId ? { ...slot, build } : slot,
  ) as [TeamSlot, TeamSlot, TeamSlot],
});

const issue = (
  message: string,
  code: ValidationIssue["code"],
  field: ValidationIssue["field"],
): ValidationIssue => ({ message, code, field });
const isValidIv = (value: number): boolean =>
  Number.isInteger(value) && value >= 0 && value <= 15;
const isValidLevel = (value: number): boolean =>
  Number.isFinite(value) &&
  value >= 1 &&
  value <= 50 &&
  value * 2 === Math.round(value * 2);

export const validateBuild = (
  build: PokemonBuild,
): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  const pokemon = getPokemonById(build.pokemonId);

  if (!pokemon) {
    issues.push(issue("Selecciona un Pokémon.", "required", "pokemonId"));
    return issues;
  }

  if (!pokemon.forms.some(({ id }) => id === build.formId))
    issues.push(
      issue("Selecciona una forma válida.", "invalid-form", "formId"),
    );
  if (!isValidIv(build.attackIv))
    issues.push(
      issue(
        "El IV de ataque debe ser un entero entre 0 y 15.",
        "invalid-iv",
        "attackIv",
      ),
    );
  if (!isValidIv(build.defenseIv))
    issues.push(
      issue(
        "El IV de defensa debe ser un entero entre 0 y 15.",
        "invalid-iv",
        "defenseIv",
      ),
    );
  if (!isValidIv(build.staminaIv))
    issues.push(
      issue(
        "El IV de stamina debe ser un entero entre 0 y 15.",
        "invalid-iv",
        "staminaIv",
      ),
    );
  if (!isValidLevel(build.level))
    issues.push(
      issue(
        "El nivel debe estar entre 1 y 50, en incrementos de 0.5.",
        "invalid-level",
        "level",
      ),
    );
  if (!pokemon.eligibleLeagues.includes(build.league))
    issues.push(
      issue(
        "Este Pokémon no es elegible para la liga seleccionada.",
        "ineligible-league",
        "league",
      ),
    );

  const learnset = getLegalMoves(build.pokemonId);
  if (!learnset?.fastMoves.some(({ id }) => id === build.fastMoveId))
    issues.push(
      issue(
        "Selecciona un movimiento rápido legal.",
        "illegal-move",
        "fastMoveId",
      ),
    );
  if (!learnset?.chargedMoves.some(({ id }) => id === build.chargedMove1Id))
    issues.push(
      issue(
        "Selecciona el primer movimiento cargado legal.",
        "illegal-move",
        "chargedMove1Id",
      ),
    );
  if (!learnset?.chargedMoves.some(({ id }) => id === build.chargedMove2Id))
    issues.push(
      issue(
        "Selecciona el segundo movimiento cargado legal.",
        "illegal-move",
        "chargedMove2Id",
      ),
    );
  if (build.chargedMove1Id && build.chargedMove1Id === build.chargedMove2Id)
    issues.push(
      issue(
        "Los movimientos cargados deben ser distintos.",
        "duplicate-charged-move",
        "chargedMove2Id",
      ),
    );

  if (issues.length === 0) {
    const resolved = resolveCompetitiveBuild(build);
    if (!resolved.ok && resolved.error.code === "over-cp-limit")
      issues.push(
        issue(resolved.error.message, "cp-over-limit", resolved.error.field),
      );
    else if (!resolved.ok)
      issues.push(
        issue(resolved.error.message, "competitive-data", resolved.error.field),
      );
  }

  return issues;
};

export const detectDuplicates = (team: Team): readonly ValidationIssue[] => {
  const seen = new Map<string, TeamSlotId>();
  const issues: ValidationIssue[] = [];
  team.slots.forEach(({ id, build }) => {
    if (!build.pokemonId || !build.formId) return;
    const key = `${build.pokemonId}:${build.formId}`;
    if (seen.has(key))
      issues.push({
        code: "duplicate-pokemon",
        field: "pokemonId",
        message: "No puedes repetir el mismo Pokémon y forma.",
        slotId: id,
      });
    else seen.set(key, id);
  });
  return issues;
};

export const validateTeam = (team: Team): readonly ValidationIssue[] => {
  const buildIssues = team.slots.flatMap(({ id, build }) =>
    validateBuild(build).map((validationIssue) => ({
      ...validationIssue,
      slotId: id,
    })),
  );
  const incomplete = team.slots.some(({ build }) => !build.pokemonId);
  return [
    ...buildIssues,
    ...detectDuplicates(team),
    ...(incomplete
      ? [
          {
            code: "incomplete-team" as const,
            field: "team" as const,
            message: "Completa los tres espacios del equipo.",
          },
        ]
      : []),
  ];
};
