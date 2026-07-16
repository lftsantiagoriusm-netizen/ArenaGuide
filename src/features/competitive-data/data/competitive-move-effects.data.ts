import type { CompetitiveMoveEffect } from "../domain/competitive-move-effect-types";

export const competitiveMoveEffects = [
  {
    moveId: "acid-spray",
    target: "opponent",
    stat: "defense",
    stages: -2,
    probability: 1,
    support: "deterministic",
  },
  {
    moveId: "brave-bird",
    target: "self",
    stat: "defense",
    stages: -3,
    probability: 1,
    support: "deterministic",
  },
  {
    moveId: "close-combat",
    target: "self",
    stat: "defense",
    stages: -2,
    probability: 1,
    support: "deterministic",
  },
  {
    moveId: "flame-charge",
    target: "self",
    stat: "attack",
    stages: 1,
    probability: 1,
    support: "deterministic",
  },
  {
    moveId: "rage-fist",
    target: "self",
    stat: "attack",
    stages: 1,
    probability: 1,
    support: "deterministic",
  },
  {
    moveId: "wrap",
    target: "opponent",
    stat: "defense",
    stages: -1,
    probability: 1,
    support: "deterministic",
  },
  {
    moveId: "crunch",
    target: "opponent",
    stat: "defense",
    stages: -1,
    probability: 0.2,
    support: "probabilistic",
  },
  {
    moveId: "earth-power",
    target: "opponent",
    stat: "defense",
    stages: -1,
    probability: 0.1,
    support: "probabilistic",
  },
  {
    moveId: "leaf-tornado",
    target: "opponent",
    stat: "attack",
    stages: -2,
    probability: 0.5,
    support: "probabilistic",
  },
  {
    moveId: "night-slash",
    target: "self",
    stat: "attack",
    stages: 1,
    probability: 0.125,
    support: "probabilistic",
  },
  {
    moveId: "zap-cannon",
    target: "opponent",
    stat: "attack",
    stages: -1,
    probability: 0.33,
    support: "probabilistic",
  },
] as const satisfies readonly CompetitiveMoveEffect[];

export const getCompetitiveMoveEffect = (
  moveId: string,
): CompetitiveMoveEffect | undefined =>
  competitiveMoveEffects.find((effect) => effect.moveId === moveId);
