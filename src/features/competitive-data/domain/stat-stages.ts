export type BattleStat = "attack" | "defense";
export type StatStage = -4 | -3 | -2 | -1 | 0 | 1 | 2 | 3 | 4;

export interface StatStages {
  readonly attack: StatStage;
  readonly defense: StatStage;
}

export const MIN_STAT_STAGE = -4;
export const MAX_STAT_STAGE = 4;
export const INITIAL_STAT_STAGES: StatStages = { attack: 0, defense: 0 };

export const clampStatStage = (stage: number): StatStage =>
  Math.max(MIN_STAT_STAGE, Math.min(MAX_STAT_STAGE, stage)) as StatStage;

export const getStatStageMultiplier = (stage: StatStage): number =>
  stage >= 0 ? (4 + stage) / 4 : 4 / (4 - stage);

export const changeStatStage = (
  stages: StatStages,
  stat: BattleStat,
  delta: number,
): { readonly stages: StatStages; readonly appliedDelta: number } => {
  const next = clampStatStage(stages[stat] + delta);
  return {
    stages: { ...stages, [stat]: next },
    appliedDelta: next - stages[stat],
  };
};
