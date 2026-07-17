import { Database, ShieldCheck } from "lucide-react";
import {
  competitiveDataMetadata,
  competitiveMoveDatasetMetadata,
  competitiveMoveEffectDatasetMetadata,
} from "../index";

export function CompetitiveDataVersion() {
  return (
    <div
      className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-4 text-sm text-amber-900 dark:text-amber-100"
      role="status"
    >
      <div className="flex items-start gap-3">
        <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <div className="space-y-1">
          <p className="font-medium">
            Datos competitivos locales y versionados
          </p>
          <p className="text-xs leading-5 opacity-85">
            CP {competitiveDataMetadata.datasetVersion} · movimientos PvP{" "}
            {competitiveMoveDatasetMetadata.datasetVersion} · efectos
            determinísticos{" "}
            {competitiveMoveEffectDatasetMetadata.datasetVersion}. Los efectos
            con probabilidad inferior al 100% se identifican, pero no se
            simulan.
          </p>
          <p className="flex items-center gap-1.5 text-xs opacity-75">
            <Database className="size-3" aria-hidden="true" />
            Fuente: {competitiveMoveDatasetMetadata.sourceName} · revisión{" "}
            {competitiveMoveDatasetMetadata.sourceRevision.slice(0, 7)}
          </p>
        </div>
      </div>
    </div>
  );
}
