import { getPokemonById } from "@/features/pokedex";
import { adaptBuildToBattlePokemon } from "@/features/battle-simulator";
import type { MetaEntry } from "./types";

export const validateMetaEntry = (entry: MetaEntry): readonly string[] => {
  const issues: string[] = [];
  const species = getPokemonById(entry.speciesId);
  if (!entry.id || !entry.name) issues.push("La entrada requiere id y nombre.");
  if (!species) issues.push("La especie no existe en el Pokédex.");
  if (species && !species.forms.some(({ id }) => id === entry.formId))
    issues.push("La forma no pertenece a la especie.");
  if (entry.build.pokemonId !== entry.speciesId)
    issues.push("El build no corresponde a la especie declarada.");
  if (entry.build.league !== entry.league)
    issues.push("El build no corresponde a la liga declarada.");
  if (entry.weight < 0) issues.push("El peso no puede ser negativo.");
  const adapted = adaptBuildToBattlePokemon(entry.build, entry.league);
  if (!adapted.pokemon)
    issues.push(adapted.error ?? "El build rival es inválido.");
  return issues;
};
