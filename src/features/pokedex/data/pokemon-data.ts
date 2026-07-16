import { chargedMoves as c, fastMoves as f } from "./move-catalog";
import type { League, PokemonForm, PokemonSpecies } from "../domain/types";

const allLeagues = [
  "great",
  "ultra",
  "master",
] as const satisfies readonly League[];
const standardForm = (id: string): readonly PokemonForm[] => [
  { id, name: "Standard", isDefault: true },
];

export const pokemonData = [
  {
    id: "azumarill",
    name: "Azumarill",
    pokedexNumber: 184,
    types: ["water", "fairy"],
    baseStats: { attack: 112, defense: 152, stamina: 225 },
    forms: standardForm("azumarill-standard"),
    learnset: {
      fastMoves: [f.bubble, f.rockSmash],
      chargedMoves: [c.hydroPump, c.iceBeam, c.playRough],
    },
    eligibleLeagues: allLeagues,
  },
  {
    id: "registeel",
    name: "Registeel",
    pokedexNumber: 379,
    types: ["steel"],
    baseStats: { attack: 143, defense: 285, stamina: 190 },
    forms: standardForm("registeel-standard"),
    learnset: {
      fastMoves: [f.lockOn, f.metalClaw, f.rockSmash],
      chargedMoves: [c.flashCannon, c.focusBlast, c.zapCannon],
    },
    eligibleLeagues: allLeagues,
  },
  {
    id: "clodsire",
    name: "Clodsire",
    pokedexNumber: 980,
    types: ["poison", "ground"],
    baseStats: { attack: 127, defense: 151, stamina: 277 },
    forms: standardForm("clodsire-standard"),
    learnset: {
      fastMoves: [f.mudShot, f.poisonSting],
      chargedMoves: [
        c.acidSpray,
        c.earthquake,
        c.sludgeBomb,
        c.stoneEdge,
        c.waterPulse,
      ],
    },
    eligibleLeagues: allLeagues,
  },
  {
    id: "talonflame",
    name: "Talonflame",
    pokedexNumber: 663,
    types: ["fire", "flying"],
    baseStats: { attack: 176, defense: 155, stamina: 186 },
    forms: standardForm("talonflame-standard"),
    learnset: {
      fastMoves: [f.fireSpin, f.incinerate, f.peck, f.steelWing],
      chargedMoves: [c.braveBird, c.fireBlast, c.flameCharge, c.fly],
    },
    eligibleLeagues: allLeagues,
  },
  {
    id: "feraligatr",
    name: "Feraligatr",
    pokedexNumber: 160,
    types: ["water"],
    baseStats: { attack: 205, defense: 188, stamina: 198 },
    forms: standardForm("feraligatr-standard"),
    learnset: {
      fastMoves: [f.bite, f.iceFang, f.shadowClaw, f.waterGun],
      chargedMoves: [c.crunch, c.hydroCannon, c.hydroPump, c.iceBeam],
    },
    eligibleLeagues: allLeagues,
  },
  {
    id: "gastrodon",
    name: "Gastrodon",
    pokedexNumber: 423,
    types: ["water", "ground"],
    baseStats: { attack: 169, defense: 143, stamina: 244 },
    forms: [
      { id: "gastrodon-west-sea", name: "West Sea", isDefault: true },
      { id: "gastrodon-east-sea", name: "East Sea", isDefault: false },
    ],
    learnset: {
      fastMoves: [f.hiddenPower, f.mudSlap, f.waterGun],
      chargedMoves: [c.bodySlam, c.earthPower, c.waterPulse],
    },
    eligibleLeagues: allLeagues,
  },
  {
    id: "mandibuzz",
    name: "Mandibuzz",
    pokedexNumber: 630,
    types: ["dark", "flying"],
    baseStats: { attack: 129, defense: 205, stamina: 242 },
    forms: standardForm("mandibuzz-standard"),
    learnset: {
      fastMoves: [f.airSlash, f.snarl],
      chargedMoves: [c.aerialAce, c.darkPulse, c.foulPlay, c.shadowBall],
    },
    eligibleLeagues: allLeagues,
  },
  {
    id: "primeape",
    name: "Primeape",
    pokedexNumber: 57,
    types: ["fighting"],
    baseStats: { attack: 207, defense: 138, stamina: 163 },
    forms: standardForm("primeape-standard"),
    learnset: {
      fastMoves: [f.counter, f.karateChop, f.lowKick],
      chargedMoves: [
        c.closeCombat,
        c.crossChop,
        c.icePunch,
        c.lowSweep,
        c.nightSlash,
        c.rageFist,
      ],
    },
    eligibleLeagues: allLeagues,
  },
  {
    id: "dunsparce",
    name: "Dunsparce",
    pokedexNumber: 206,
    types: ["normal"],
    baseStats: { attack: 131, defense: 128, stamina: 225 },
    forms: standardForm("dunsparce-standard"),
    learnset: {
      fastMoves: [f.astonish, f.bite, f.rollout],
      chargedMoves: [c.dig, c.drillRun, c.rockSlide],
    },
    eligibleLeagues: allLeagues,
  },
  {
    id: "serperior",
    name: "Serperior",
    pokedexNumber: 497,
    types: ["grass"],
    baseStats: { attack: 161, defense: 204, stamina: 181 },
    forms: standardForm("serperior-standard"),
    learnset: {
      fastMoves: [f.ironTail, f.vineWhip],
      chargedMoves: [
        c.aerialAce,
        c.frenzyPlant,
        c.grassKnot,
        c.leafTornado,
        c.wrap,
      ],
    },
    eligibleLeagues: allLeagues,
  },
] as const satisfies readonly PokemonSpecies[];
