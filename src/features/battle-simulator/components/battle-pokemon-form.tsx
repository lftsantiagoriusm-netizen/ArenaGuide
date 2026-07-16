import { getAllPokemon, getPokemonById } from "@/features/pokedex";
import { Select } from "@/components/ui/select";
import type { BattleBuild } from "../adapters/pokedex-adapter";
import { BuildCpSummary } from "@/features/competitive-data/components/build-cp-summary";
import { CompetitiveMoveSummary } from "@/features/competitive-data/components/competitive-move-summary";

const catalog = getAllPokemon();

interface Props {
  readonly label: string;
  readonly build: BattleBuild;
  readonly onChange: (build: BattleBuild) => void;
}

export function BattlePokemonForm({ label, build, onChange }: Props) {
  const species = getPokemonById(build.pokemonId);
  const update = <Key extends keyof BattleBuild>(
    field: Key,
    value: BattleBuild[Key],
  ): void => onChange({ ...build, [field]: value });
  const selectPokemon = (id: string): void => {
    const selected = getPokemonById(id);
    onChange({
      ...build,
      pokemonId: id,
      formId:
        selected?.forms.find(({ isDefault }) => isDefault)?.id ??
        selected?.forms.at(0)?.id ??
        "",
      fastMoveId: selected?.learnset.fastMoves.at(0)?.id ?? "",
      chargedMove1Id: selected?.learnset.chargedMoves.at(0)?.id ?? "",
      chargedMove2Id: selected?.learnset.chargedMoves.at(1)?.id ?? "",
    });
  };
  return (
    <fieldset className="border-border bg-card grid gap-4 rounded-2xl border p-5 shadow-sm">
      <legend className="px-2 text-lg font-semibold">{label}</legend>
      <Select
        label="Pokémon"
        value={build.pokemonId}
        onChange={(event) => selectPokemon(event.target.value)}
      >
        <option value="">Selecciona</option>
        {catalog.map((pokemon) => (
          <option key={pokemon.id} value={pokemon.id}>
            {pokemon.name}
          </option>
        ))}
      </Select>
      <Select
        label="Forma"
        value={build.formId ?? ""}
        disabled={!species}
        onChange={(event) => update("formId", event.target.value)}
      >
        <option value="">Selecciona</option>
        {species?.forms.map((form) => (
          <option key={form.id} value={form.id}>
            {form.name}
          </option>
        ))}
      </Select>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <BattleNumber
          label="IV Ataque"
          value={build.attackIv}
          max={15}
          onChange={(value) => update("attackIv", value)}
        />
        <BattleNumber
          label="IV Defensa"
          value={build.defenseIv}
          max={15}
          onChange={(value) => update("defenseIv", value)}
        />
        <BattleNumber
          label="IV Stamina"
          value={build.staminaIv}
          max={15}
          onChange={(value) => update("staminaIv", value)}
        />
        <BattleNumber
          label="Nivel"
          value={build.level}
          min={1}
          max={50}
          step={0.5}
          onChange={(value) => update("level", value)}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Select
          label="Rápido"
          value={build.fastMoveId}
          disabled={!species}
          onChange={(event) => update("fastMoveId", event.target.value)}
        >
          <option value="">Selecciona</option>
          {species?.learnset.fastMoves.map((move) => (
            <option key={move.id} value={move.id}>
              {move.name}
            </option>
          ))}
        </Select>
        <Select
          label="Cargado 1"
          value={build.chargedMove1Id}
          disabled={!species}
          onChange={(event) => update("chargedMove1Id", event.target.value)}
        >
          <option value="">Selecciona</option>
          {species?.learnset.chargedMoves.map((move) => (
            <option key={move.id} value={move.id}>
              {move.name}
            </option>
          ))}
        </Select>
        <Select
          label="Cargado 2"
          value={build.chargedMove2Id}
          disabled={!species}
          onChange={(event) => update("chargedMove2Id", event.target.value)}
        >
          <option value="">Selecciona</option>
          {species?.learnset.chargedMoves.map((move) => (
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
      <BuildCpSummary build={{ ...build, formId: build.formId ?? "" }} />
      <CompetitiveMoveSummary
        fastMoveId={build.fastMoveId}
        chargedMoveIds={[build.chargedMove1Id, build.chargedMove2Id]}
      />
    </fieldset>
  );
}

function BattleNumber({
  label,
  value,
  onChange,
  min = 0,
  max,
  step = 1,
}: {
  readonly label: string;
  readonly value: number;
  readonly onChange: (value: number) => void;
  readonly min?: number;
  readonly max: number;
  readonly step?: number;
}) {
  return (
    <label className="text-muted-foreground grid gap-2 text-xs font-medium">
      {label}
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => onChange(Number(event.target.value))}
        className="border-border bg-background text-foreground focus:ring-primary/20 h-11 rounded-xl border px-3 text-sm outline-none focus:ring-2"
      />
    </label>
  );
}
