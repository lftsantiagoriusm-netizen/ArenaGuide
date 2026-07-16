import type { MetaEntry } from "@/features/meta-matchups";
import { metaDataset } from "@/features/meta-matchups";
import type { PokemonBuild, Team } from "@/features/team-builder";
import type { MemberMatchup, TeamCoverageRow } from "../domain/types";
import {
  classifyRivalCoverage,
  getCloseSlots,
  getCoveringSlots,
  selectBestTeamAnswer,
} from "../domain/coverage";

const build = (
  pokemonId: string,
  formId: string,
  fastMoveId: string,
  chargedMove1Id: string,
  chargedMove2Id: string,
): PokemonBuild => ({
  pokemonId,
  formId,
  league: "great",
  attackIv: 0,
  defenseIv: 15,
  staminaIv: 15,
  level: 20.5,
  fastMoveId,
  chargedMove1Id,
  chargedMove2Id,
});

export const validTeam = (): Team => ({
  version: 1,
  slots: [
    {
      id: 1,
      build: build(
        "azumarill",
        "azumarill-standard",
        "bubble",
        "ice-beam",
        "play-rough",
      ),
    },
    {
      id: 2,
      build: build(
        "registeel",
        "registeel-standard",
        "lock-on",
        "focus-blast",
        "zap-cannon",
      ),
    },
    {
      id: 3,
      build: build(
        "clodsire",
        "clodsire-standard",
        "poison-sting",
        "earthquake",
        "stone-edge",
      ),
    },
  ],
});

export const member = (
  slotId: 1 | 2 | 3,
  classification: MemberMatchup["classification"],
  score: number,
  overrides: Partial<MemberMatchup> = {},
): MemberMatchup => ({
  slotId,
  classification,
  score,
  outcome:
    classification === "draw"
      ? "draw"
      : classification === "invalid"
        ? "invalid"
        : score >= 0
          ? "win"
          : "loss",
  remainingHp: score >= 0 ? Math.max(0, score) : 0,
  remainingEnergy: 0,
  remainingShields: 0,
  turns: 20,
  error: classification === "invalid" ? "invalid" : null,
  ...overrides,
});

export const row = (
  members: readonly [MemberMatchup, MemberMatchup, MemberMatchup],
  opponent: MetaEntry = metaDataset.entries[0]!,
): TeamCoverageRow => ({
  opponent,
  members,
  classification: classifyRivalCoverage(members),
  bestSlotId: selectBestTeamAnswer(members)?.slotId ?? null,
  coveringSlots: getCoveringSlots(members),
  closeSlots: getCloseSlots(members),
  incomplete: members.some(
    ({ classification }) => classification === "invalid",
  ),
});
