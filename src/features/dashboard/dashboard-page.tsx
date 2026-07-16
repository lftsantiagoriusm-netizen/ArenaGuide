import { Container } from "@/components/common/container";
import { Reveal } from "@/components/common/reveal";
import { Section } from "@/components/common/section";
import { Hero } from "./components/hero";
import { QuickAccess } from "./components/quick-access";

export function DashboardPage() {
  return (
    <Container>
      <Section className="space-y-10">
        <Reveal>
          <Hero />
        </Reveal>
        <Reveal delay={0.1}>
          <QuickAccess />
        </Reveal>
      </Section>
    </Container>
  );
}
