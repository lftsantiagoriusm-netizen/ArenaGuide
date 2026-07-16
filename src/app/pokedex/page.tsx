import type { Metadata } from "next";
import { PokedexPage } from "@/features/pokedex/ui/pokedex-page";

export const metadata: Metadata = { title: "Pokédex" };
export default function Page() {
  return <PokedexPage />;
}
