import type { CompetitiveMoveDatasetMetadata } from "../domain/competitive-move-types";

export const competitiveMoveDatasetMetadata: CompetitiveMoveDatasetMetadata = {
  schemaVersion: 1,
  datasetVersion: "arena-competitive-moves-v1",
  status: "verified-with-documented-conflicts",
  sourceName: "PvPoke Game Master",
  sourceReference:
    "https://github.com/pvpoke/pvpoke/blob/10fd1a6e43260e59b625d1cf96bbea496672880d/src/data/gamemaster.json",
  sourceRevision: "10fd1a6e43260e59b625d1cf96bbea496672880d",
  checkedAt: "2026-07-16",
  notes:
    "Snapshot local verificado contra PvPoke. Diez discrepancias con PoGoAPI se documentan en el informe del Sprint; no se promediaron valores.",
  sources: [
    {
      id: "pvpoke",
      name: "PvPoke Game Master",
      reference:
        "https://github.com/pvpoke/pvpoke/blob/10fd1a6e43260e59b625d1cf96bbea496672880d/src/data/gamemaster.json",
      revision: "10fd1a6e43260e59b625d1cf96bbea496672880d",
      checkedAt: "2026-07-16",
    },
  ],
} as const;
