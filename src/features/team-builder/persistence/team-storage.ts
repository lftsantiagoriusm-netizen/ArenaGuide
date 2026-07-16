import { deserializeTeam, serializeTeam } from "../domain/team-serialization";
import type { Team } from "../domain/types";

const STORAGE_KEY = "arena-guide:team-builder:v1";

export const loadTeam = (storage: Pick<Storage, "getItem">): Team | null => {
  try {
    const serialized = storage.getItem(STORAGE_KEY);
    return serialized ? deserializeTeam(serialized) : null;
  } catch {
    return null;
  }
};

export const saveTeam = (
  storage: Pick<Storage, "setItem">,
  team: Team,
): void => {
  storage.setItem(STORAGE_KEY, serializeTeam(team));
};

export const clearStoredTeam = (storage: Pick<Storage, "removeItem">): void => {
  storage.removeItem(STORAGE_KEY);
};
