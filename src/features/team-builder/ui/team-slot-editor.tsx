import { getAllPokemon, getPokemonById, type League } from "@/features/pokedex";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import type {
  PokemonBuild,
  TeamSlotId,
  ValidationIssue,
} from "../domain/types";
import { NumberField } from "./number-field";

const pokemonCatalog = getAllPokemon();

interface TeamSlotEditorProps {
  readonly slotId: TeamSlotId;
  readonly build: PokemonBuild;
  readonly issues: readonly ValidationIssue[];
  readonly onChange: (build: PokemonBuild) => void;
}

export function TeamSlotEditor({
  slotId,
  build,
  issues,
  onChange,
}: TeamSlotEditorProps) {
  const pokemon = getPokemonById(build.pokemonId);
  const update = <Key extends keyof PokemonBuild>(
    field: Key,
    value: PokemonBuild[Key],
  ): void => onChange({ ...build, [field]: value });
  const selectPokemon = (pokemonId: string): void => {
    const selected = getPokemonById(pokemonId);
    if (!selected)
      return onChange({
        ...build,
        pokemonId: "",
        formId: "",
        fastMoveId: "",
        chargedMove1Id: "",
        chargedMove2Id: "",
      });
    onChange({
      ...build,
      pokemonId: selected.id,
      formId:
        selected.forms.find(({ isDefault }) => isDefault)?.id ??
        selected.forms.at(0)?.id ??
        "",
      fastMoveId: selected.learnset.fastMoves.at(0)?.id ?? "",
      chargedMove1Id: selected.learnset.chargedMoves.at(0)?.id ?? "",
      chargedMove2Id: selected.learnset.chargedMoves.at(1)?.id ?? "",
    });
  };

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between">
        <div>
          <p className="text-primary text-xs font-medium tracking-wide uppercase">
            Slot {slotId}
          </p>
          <h2 className="mt-1 text-lg font-semibold">
            {pokemon?.name ?? "Selecciona un Pokémon"}
          </h2>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${issues.length ? "bg-red-500/10 text-red-700 dark:text-red-300" : "bg-green-500/10 text-green-700 dark:text-green-300"}`}
        >
          {issues.length
            ? `${issues.length} ${issues.length === 1 ? "problema" : "problemas"}`
            : "Válido"}
        </span>
      </CardHeader>
      <CardContent className="grid gap-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Pokémon"
            value={build.pokemonId}
            onChange={(event) => selectPokemon(event.target.value)}
          >
            <option value="">Selecciona</option>
            {pokemonCatalog.map((species) => (
              <option key={species.id} value={species.id}>
                {species.name}
              </option>
            ))}
          </Select>
          <Select
            label="Forma"
            value={build.formId}
            disabled={!pokemon}
            onChange={(event) => update("formId", event.target.value)}
          >
            <option value="">Selecciona</option>
            {pokemon?.forms.map((form) => (
              <option key={form.id} value={form.id}>
                {form.name}
              </option>
            ))}
          </Select>
          <Select
            label="Liga"
            value={build.league}
            onChange={(event) => update("league", event.target.value as League)}
          >
            <option value="great">Great League</option>
            <option value="ultra">Ultra League</option>
            <option value="master">Master League</option>
          </Select>
          <NumberField
            label="Nivel"
            value={build.level}
            min={1}
            max={50}
            step={0.5}
            onChange={(value) => update("level", value)}
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <NumberField
            label="IV Ataque"
            value={build.attackIv}
            min={0}
            max={15}
            onChange={(value) => update("attackIv", value)}
          />
          <NumberField
            label="IV Defensa"
            value={build.defenseIv}
            min={0}
            max={15}
            onChange={(value) => update("defenseIv", value)}
          />
          <NumberField
            label="IV Stamina"
            value={build.staminaIv}
            min={0}
            max={15}
            onChange={(value) => update("staminaIv", value)}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Select
            label="Movimiento rápido"
            value={build.fastMoveId}
            disabled={!pokemon}
            onChange={(event) => update("fastMoveId", event.target.value)}
          >
            <option value="">Selecciona</option>
            {pokemon?.learnset.fastMoves.map((move) => (
              <option key={move.id} value={move.id}>
                {move.name}
              </option>
            ))}
          </Select>
          <Select
            label="Cargado 1"
            value={build.chargedMove1Id}
            disabled={!pokemon}
            onChange={(event) => update("chargedMove1Id", event.target.value)}
          >
            <option value="">Selecciona</option>
            {pokemon?.learnset.chargedMoves.map((move) => (
              <option key={move.id} value={move.id}>
                {move.name}
              </option>
            ))}
          </Select>
          <Select
            label="Cargado 2"
            value={build.chargedMove2Id}
            disabled={!pokemon}
            onChange={(event) => update("chargedMove2Id", event.target.value)}
          >
            <option value="">Selecciona</option>
            {pokemon?.learnset.chargedMoves.map((move) => (
              <option
                key={move.id}
                value={move.id}
                disabled={move.id === build.chargedMove1Id}
              >
                {move.name}
              </option>
            ))}
          </Select>
        </div>
        {issues.length ? (
          <ul className="grid gap-1.5 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-700 dark:text-red-300">
            {issues.map((validationIssue, index) => (
              <li
                key={`${validationIssue.code}-${validationIssue.field}-${index}`}
              >
                • {validationIssue.message}
              </li>
            ))}
          </ul>
        ) : null}
      </CardContent>
    </Card>
  );
}
