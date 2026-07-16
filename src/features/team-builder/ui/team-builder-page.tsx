"use client";

import { RotateCcw } from "lucide-react";
import { Container } from "@/components/common/container";
import { PageHeader } from "@/components/common/page-header";
import { Section } from "@/components/common/section";
import { Button } from "@/components/ui/button";
import { useTeamBuilder } from "../hooks/use-team-builder";
import { TeamSlotEditor } from "./team-slot-editor";
import { TeamSummary } from "./team-summary";

export function TeamBuilderPage() {
  const { team, issues, isValid, isHydrated, updateBuild, clearTeam } =
    useTeamBuilder();
  if (!isHydrated)
    return (
      <Container>
        <Section>
          <p className="text-muted-foreground text-sm">
            Restaurando tu equipo…
          </p>
        </Section>
      </Container>
    );

  return (
    <Container>
      <Section className="space-y-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
          <PageHeader
            title="Team Builder"
            description="Configura tres Pokémon con IV, nivel y movimientos legales desde el catálogo de ArenaGuide."
          />
          <Button variant="secondary" onClick={clearTeam}>
            <RotateCcw className="size-4" />
            Limpiar equipo
          </Button>
        </div>
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="grid gap-5">
            {team.slots.map(({ id, build }) => (
              <TeamSlotEditor
                key={id}
                slotId={id}
                build={build}
                issues={issues.filter((issue) => issue.slotId === id)}
                onChange={(nextBuild) => updateBuild(id, nextBuild)}
              />
            ))}
          </div>
          <TeamSummary team={team} issues={issues} isValid={isValid} />
        </div>
        <p className="text-muted-foreground text-center text-xs">
          Tu equipo se guarda automáticamente en este dispositivo.
        </p>
      </Section>
    </Container>
  );
}
