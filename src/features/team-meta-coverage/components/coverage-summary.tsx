import type { TeamCoverageSummary } from "../domain/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const Metric = ({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string | number;
}) => (
  <div>
    <p className="text-muted-foreground text-xs">{label}</p>
    <p className="mt-1 text-xl font-semibold">{value}</p>
  </div>
);

export function CoverageSummary({
  summary,
}: {
  readonly summary: TeamCoverageSummary;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Card>
          <CardContent className="pt-5">
            <Metric
              label="Cobertura segura"
              value={`${summary.safeCoverageRate}%`}
            />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <Metric label="Cubiertos" value={summary.covered} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <Metric label="Inciertos" value={summary.uncertain} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <Metric label="Críticos" value={summary.critical} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <Metric label="Redundantes" value={summary.redundantCoverage} />
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <h2 className="font-semibold">Resumen por integrante</h2>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          {summary.members.map((member) => (
            <div
              key={member.slotId}
              className="border-border rounded-xl border p-4 text-sm"
            >
              <p className="font-medium">slot{member.slotId}</p>
              <div className="text-muted-foreground mt-2 grid grid-cols-2 gap-2 text-xs">
                <span>Evaluados: {member.evaluated}</span>
                <span>
                  V/E/D: {member.wins}/{member.draws}/{member.losses}
                </span>
                <span>Cubre: {member.covered}</span>
                <span>Mejor: {member.bestAnswerCount}</span>
                <span>Cobertura: {member.coverageRate}%</span>
                <span>Dependencia: {member.dependencyRate}%</span>
                <span>Inválidos: {member.invalid}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
