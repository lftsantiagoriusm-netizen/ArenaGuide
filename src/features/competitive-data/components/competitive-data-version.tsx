import { competitiveDataMetadata } from "../index";

export function CompetitiveDataVersion() {
  return (
    <div className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-4 text-sm text-amber-800 dark:text-amber-200">
      <strong>
        Datos competitivos {competitiveDataMetadata.datasetVersion}
      </strong>
      <p className="mt-1">
        Actualizado: {competitiveDataMetadata.updatedAt} · Fuente:{" "}
        {competitiveDataMetadata.sourceLabel}.
      </p>
      <p className="mt-1">
        Estado provisional: CP, multiplicadores y estadísticas están
        consolidados localmente; los parámetros de movimientos aún son fixtures
        normalizados.
      </p>
    </div>
  );
}
