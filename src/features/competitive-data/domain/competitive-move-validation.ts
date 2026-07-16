import type { ChargedMove, FastMove, PokemonType } from "@/features/pokedex";
import { competitiveMoveDatasetMetadata } from "../data/competitive-move-metadata";
import type {
  CompetitiveMove,
  CompetitiveMoveDatasetMetadata,
  CompetitiveMoveValidationIssue,
} from "./competitive-move-types";

const pokemonTypes: readonly PokemonType[] = [
  "bug",
  "dark",
  "dragon",
  "electric",
  "fairy",
  "fighting",
  "fire",
  "flying",
  "ghost",
  "grass",
  "ground",
  "ice",
  "normal",
  "poison",
  "psychic",
  "rock",
  "steel",
  "water",
];
const categories = ["fast", "charged"] as const;
const verificationStatuses = ["verified", "source-conflict"] as const;
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;
const finiteNonNegative = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value >= 0;
const issue = (
  code: CompetitiveMoveValidationIssue["code"],
  message: string,
  moveId?: string,
): CompetitiveMoveValidationIssue => ({
  code,
  message,
  ...(moveId === undefined ? {} : { moveId }),
});

export const validateCompetitiveMove = (
  value: unknown,
): readonly CompetitiveMoveValidationIssue[] => {
  if (!isRecord(value))
    return [issue("invalid-category", "El movimiento debe ser un objeto.")];
  const id = typeof value.id === "string" ? value.id : "";
  const issues: CompetitiveMoveValidationIssue[] = [];
  if (id.trim().length === 0)
    issues.push(issue("empty-id", "El ID no puede estar vacío.", id));
  if (typeof value.name !== "string" || value.name.trim().length === 0)
    issues.push(issue("invalid-name", "El nombre no es válido.", id));
  if (
    typeof value.type !== "string" ||
    !pokemonTypes.includes(value.type as PokemonType)
  )
    issues.push(issue("invalid-type", "El tipo no es válido.", id));
  if (!finiteNonNegative(value.power))
    issues.push(issue("invalid-power", "El poder no es válido.", id));
  if (
    typeof value.category !== "string" ||
    !categories.includes(value.category as (typeof categories)[number])
  ) {
    issues.push(issue("invalid-category", "La categoría no es válida.", id));
    return issues;
  }
  if (
    typeof value.verificationStatus !== "string" ||
    !verificationStatuses.includes(
      value.verificationStatus as (typeof verificationStatuses)[number],
    )
  )
    issues.push(
      issue(
        "invalid-verification",
        "El estado de verificación no es válido.",
        id,
      ),
    );
  if (value.source !== "pvpoke")
    issues.push(issue("invalid-source", "La fuente no es válida.", id));
  if (
    typeof value.sourceCheckedAt !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value.sourceCheckedAt)
  )
    issues.push(
      issue("invalid-source-date", "La fecha de consulta no es válida.", id),
    );
  if (value.category === "fast") {
    if (!finiteNonNegative(value.energyGain))
      issues.push(
        issue("invalid-energy-gain", "La energía rápida no es válida.", id),
      );
    if (
      typeof value.turns !== "number" ||
      !Number.isInteger(value.turns) ||
      value.turns < 1
    )
      issues.push(issue("invalid-turns", "Los turnos no son válidos.", id));
    if ("energyCost" in value)
      issues.push(
        issue(
          "incompatible-field",
          "Un movimiento rápido no puede declarar energyCost.",
          id,
        ),
      );
  }
  if (value.category === "charged") {
    if (
      typeof value.energyCost !== "number" ||
      !Number.isFinite(value.energyCost) ||
      value.energyCost <= 0
    )
      issues.push(
        issue("invalid-energy-cost", "El coste cargado no es válido.", id),
      );
    if ("energyGain" in value || "turns" in value)
      issues.push(
        issue(
          "incompatible-field",
          "Un movimiento cargado no puede declarar energía o turnos rápidos.",
          id,
        ),
      );
  }
  return issues;
};

export const validateCompetitiveMoveMetadata = (
  value: unknown,
): readonly CompetitiveMoveValidationIssue[] => {
  if (!isRecord(value))
    return [issue("invalid-metadata", "Los metadatos no son válidos.")];
  const valid =
    value.schemaVersion === 1 &&
    typeof value.datasetVersion === "string" &&
    /^arena-competitive-moves-v\d+$/.test(value.datasetVersion) &&
    value.status === "verified-with-documented-conflicts" &&
    typeof value.sourceName === "string" &&
    value.sourceName.length > 0 &&
    typeof value.sourceReference === "string" &&
    value.sourceReference.startsWith("https://") &&
    typeof value.sourceRevision === "string" &&
    value.sourceRevision.length > 0 &&
    typeof value.checkedAt === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value.checkedAt) &&
    typeof value.notes === "string" &&
    Array.isArray(value.sources) &&
    value.sources.length > 0;
  return valid
    ? []
    : [issue("invalid-metadata", "Los metadatos están incompletos.")];
};

export const validateCompetitiveMoveDataset = (
  moves: readonly unknown[],
  metadata: unknown,
): readonly CompetitiveMoveValidationIssue[] => {
  const issues = [...validateCompetitiveMoveMetadata(metadata)];
  const seen = new Set<string>();
  moves.forEach((move) => {
    issues.push(...validateCompetitiveMove(move));
    if (!isRecord(move) || typeof move.id !== "string") return;
    if (seen.has(move.id))
      issues.push(
        issue("duplicate-id", `El ID ${move.id} está duplicado.`, move.id),
      );
    seen.add(move.id);
  });
  return issues;
};

export const validateCompetitiveMoveCoverage = (
  moves: readonly CompetitiveMove[],
  catalogMoves: readonly (FastMove | ChargedMove)[],
): readonly CompetitiveMoveValidationIssue[] => {
  const issues: CompetitiveMoveValidationIssue[] = [];
  const competitiveIds = new Set(moves.map(({ id }) => id));
  const catalogIds = new Set(catalogMoves.map(({ id }) => id));
  catalogMoves.forEach(({ id }) => {
    if (!competitiveIds.has(id))
      issues.push(
        issue(
          "missing-catalog-move",
          `Faltan datos competitivos para ${id}.`,
          id,
        ),
      );
  });
  moves.forEach(({ id }) => {
    if (!catalogIds.has(id))
      issues.push(
        issue("orphan-competitive-move", `${id} no existe en el catálogo.`, id),
      );
  });
  return issues;
};

export const isCompetitiveMoveDatasetCompatible = (version: unknown): boolean =>
  version === competitiveMoveDatasetMetadata.datasetVersion;

export const getCompetitiveMoveDatasetMetadata =
  (): CompetitiveMoveDatasetMetadata => competitiveMoveDatasetMetadata;
