import type { PokemonBuild } from "@/features/team-builder";
import { getLeagueRules, resolveCompetitiveBuild } from "../index";

export function BuildCpSummary({ build }: { readonly build: PokemonBuild }) {
  const result = resolveCompetitiveBuild(build);
  const rules = getLeagueRules(build.league);
  const cp = result.ok ? result.build.stats.cp : result.error.cp;
  const valid = result.ok;
  return (
    <div
      className="border-border bg-accent/30 rounded-xl border p-3 text-sm"
      aria-live="polite"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-medium">CP {cp ?? "—"}</span>
        <span
          className={
            valid
              ? "text-green-700 dark:text-green-300"
              : "text-red-700 dark:text-red-300"
          }
        >
          {valid ? "Válido para la liga" : "Build inválido"}
        </span>
      </div>
      <p className="text-muted-foreground mt-1 text-xs">
        {rules.label} ·{" "}
        {rules.cpLimit === null
          ? "Sin límite de CP"
          : `Límite ${rules.cpLimit} CP`}
      </p>
      {!result.ok ? (
        <p className="mt-1 text-xs text-red-700 dark:text-red-300">
          {result.error.message}
        </p>
      ) : null}
    </div>
  );
}
