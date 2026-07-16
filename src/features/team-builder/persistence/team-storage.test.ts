import assert from "node:assert/strict";
import { test } from "node:test";
import { createEmptyTeam } from "../domain/team-builder";
import { clearStoredTeam, loadTeam, saveTeam } from "./team-storage";

test("the storage adapter saves, loads and clears without domain coupling", () => {
  const values = new Map<string, string>();
  const storage = {
    getItem: (key: string): string | null => values.get(key) ?? null,
    setItem: (key: string, value: string): void => {
      values.set(key, value);
    },
    removeItem: (key: string): void => {
      values.delete(key);
    },
  };
  const team = createEmptyTeam();
  saveTeam(storage, team);
  assert.deepEqual(loadTeam(storage), team);
  clearStoredTeam(storage);
  assert.equal(loadTeam(storage), null);
});
