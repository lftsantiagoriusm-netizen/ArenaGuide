import {
  BookOpen,
  ChartNoAxesColumnIncreasing,
  FlaskConical,
  Home,
  Settings,
  Users,
} from "lucide-react";
import type { NavigationItem } from "@/types/navigation";

export const primaryNavigation: readonly NavigationItem[] = [
  { label: "Inicio", href: "/", icon: Home },
  { label: "Battle Lab", href: "/battle-lab", icon: FlaskConical },
  { label: "Team Builder", href: "/team-builder", icon: Users },
  { label: "Meta", href: "/meta", icon: ChartNoAxesColumnIncreasing },
  { label: "Pokédex", href: "/pokedex", icon: BookOpen },
];

export const secondaryNavigation: readonly NavigationItem[] = [
  { label: "Ajustes", href: "/settings", icon: Settings },
];
