import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  filterPokemon,
  getAllPokemon,
  getLegalMoves,
  getPokemonById,
  listPokemonByLeague,
  listPokemonByType,
  searchPokemonByName,
} from "./pokedex-engine";

describe("Pokédex Engine", () => {
  test("exposes the initial typed catalog", () => {
    const pokemon = getAllPokemon();
    assert.equal(pokemon.length, 10);
    assert.equal(new Set(pokemon.map(({ id }) => id)).size, 10);
  });

  describe("getPokemonById", () => {
    test("returns the matching species", () => {
      assert.equal(getPokemonById("azumarill")?.pokedexNumber, 184);
    });

    test("normalizes whitespace and casing", () => {
      assert.equal(getPokemonById("  REGISTEEL ")?.name, "Registeel");
    });

    test("returns undefined for an unknown id", () => {
      assert.equal(getPokemonById("missingno"), undefined);
    });
  });

  describe("searchPokemonByName", () => {
    test("matches partial names without case sensitivity", () => {
      assert.deepEqual(
        searchPokemonByName("GATR").map(({ id }) => id),
        ["feraligatr"],
      );
    });

    test("returns the full catalog for a blank query", () => {
      assert.equal(searchPokemonByName("   ").length, 10);
    });

    test("returns an empty list when there are no matches", () => {
      assert.deepEqual(searchPokemonByName("Pikachu"), []);
    });
  });

  test("lists species by either primary or secondary type", () => {
    assert.deepEqual(
      listPokemonByType("ground").map(({ id }) => id),
      ["clodsire", "gastrodon"],
    );
  });

  test("lists species eligible for a league", () => {
    assert.equal(listPokemonByLeague("great").length, 10);
    assert.ok(
      listPokemonByLeague("master").every(({ eligibleLeagues }) =>
        eligibleLeagues.includes("master"),
      ),
    );
  });

  test("combines filters without duplicating query logic", () => {
    assert.deepEqual(
      filterPokemon({ query: "s", type: "ground", league: "great" }).map(
        ({ id }) => id,
      ),
      ["clodsire", "gastrodon"],
    );
  });

  describe("getLegalMoves", () => {
    test("returns categorized legal moves", () => {
      const learnset = getLegalMoves("talonflame");
      assert.ok(learnset?.fastMoves.some(({ id }) => id === "incinerate"));
      assert.ok(learnset?.chargedMoves.some(({ id }) => id === "brave-bird"));
    });

    test("returns undefined for an unknown species", () => {
      assert.equal(getLegalMoves("missingno"), undefined);
    });
  });
});
