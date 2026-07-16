import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  createEmptyTeam,
  detectDuplicates,
  validateBuild,
  validateTeam,
} from "./team-builder";
import { deserializeTeam, serializeTeam } from "./team-serialization";
import type { PokemonBuild, Team } from "./types";

const validBuild = (
  pokemonId = "azumarill",
  formId = "azumarill-standard",
): PokemonBuild => ({
  pokemonId,
  formId,
  league: "great",
  attackIv: 0,
  defenseIv: 15,
  staminaIv: 15,
  level: 20.5,
  fastMoveId: "bubble",
  chargedMove1Id: "ice-beam",
  chargedMove2Id: "play-rough",
});

const validTeam = (): Team => ({
  version: 1,
  slots: [
    { id: 1, build: validBuild() },
    {
      id: 2,
      build: {
        ...validBuild("registeel", "registeel-standard"),
        fastMoveId: "lock-on",
        chargedMove1Id: "focus-blast",
        chargedMove2Id: "zap-cannon",
      },
    },
    {
      id: 3,
      build: {
        ...validBuild("clodsire", "clodsire-standard"),
        fastMoveId: "poison-sting",
        chargedMove1Id: "earthquake",
        chargedMove2Id: "stone-edge",
      },
    },
  ],
});

describe("Team Builder domain", () => {
  test("accepts a valid build", () => {
    assert.deepEqual(validateBuild(validBuild()), []);
  });

  test("rejects IVs outside the 0-15 range", () => {
    const issues = validateBuild({ ...validBuild(), attackIv: 16 });
    assert.ok(
      issues.some(
        ({ code, field }) => code === "invalid-iv" && field === "attackIv",
      ),
    );
  });

  test("rejects a move outside the species learnset", () => {
    const issues = validateBuild({ ...validBuild(), fastMoveId: "lock-on" });
    assert.ok(
      issues.some(
        ({ code, field }) => code === "illegal-move" && field === "fastMoveId",
      ),
    );
  });

  test("rejects duplicate charged moves", () => {
    const issues = validateBuild({
      ...validBuild(),
      chargedMove2Id: "ice-beam",
    });
    assert.ok(issues.some(({ code }) => code === "duplicate-charged-move"));
  });

  test("detects duplicate species and form", () => {
    const team = validTeam();
    const duplicateTeam: Team = {
      ...team,
      slots: [team.slots[0], { id: 2, build: validBuild() }, team.slots[2]],
    };
    assert.equal(detectDuplicates(duplicateTeam).length, 1);
  });

  test("rejects an incomplete team", () => {
    const issues = validateTeam(createEmptyTeam());
    assert.ok(issues.some(({ code }) => code === "incomplete-team"));
  });

  test("serializes and deserializes a team without losing data", () => {
    const team = validTeam();
    assert.deepEqual(deserializeTeam(serializeTeam(team)), team);
  });

  test("restores safely from corrupt or incompatible data", () => {
    assert.equal(deserializeTeam("not-json"), null);
    assert.equal(deserializeTeam('{"version":99,"slots":[]}'), null);
  });
});
