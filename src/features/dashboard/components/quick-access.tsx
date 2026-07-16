import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  ChartNoAxesColumnIncreasing,
  FlaskConical,
  Users,
} from "lucide-react";
import { PageTitle } from "@/components/common/page-title";
import { Card } from "@/components/ui/card";

const actions = [
  {
    title: "Battle Lab",
    description: "Prepara tu alineación para cada liga.",
    href: "/battle-lab",
    icon: FlaskConical,
  },
  {
    title: "Team Builder",
    description: "Crea equipos sólidos y complementarios.",
    href: "/team-builder",
    icon: Users,
  },
  {
    title: "Meta",
    description: "Explora el entorno competitivo actual.",
    href: "/meta",
    icon: ChartNoAxesColumnIncreasing,
  },
  {
    title: "Pokédex",
    description: "Consulta datos relevantes para PvP.",
    href: "/pokedex",
    icon: BookOpen,
  },
] as const;

export function QuickAccess() {
  return (
    <div>
      <PageTitle>Explora ArenaGuide</PageTitle>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {actions.map(({ title, description, href, icon: Icon }) => (
          <Link href={href} key={href} className="group">
            <Card className="hover:border-primary/25 h-full p-5 transition duration-200 hover:-translate-y-1 hover:shadow-lg">
              <div className="flex items-start justify-between">
                <span className="bg-accent text-primary grid size-11 place-items-center rounded-xl">
                  <Icon className="size-5" />
                </span>
                <ArrowUpRight className="text-muted-foreground group-hover:text-foreground size-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
              <h3 className="mt-6 font-semibold">{title}</h3>
              <p className="text-muted-foreground mt-1.5 text-sm leading-6">
                {description}
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
