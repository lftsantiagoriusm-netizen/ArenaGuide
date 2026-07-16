import type { LucideIcon } from "lucide-react";
import { Container } from "@/components/common/container";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { Section } from "@/components/common/section";

interface ComingSoonPageProps {
  readonly title: string;
  readonly description: string;
  readonly emptyTitle: string;
  readonly emptyDescription: string;
  readonly icon: LucideIcon;
}

export function ComingSoonPage(props: ComingSoonPageProps) {
  return (
    <Container>
      <Section className="space-y-8">
        <PageHeader title={props.title} description={props.description} />
        <EmptyState
          icon={props.icon}
          title={props.emptyTitle}
          description={props.emptyDescription}
        />
      </Section>
    </Container>
  );
}
