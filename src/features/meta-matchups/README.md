# Meta Matchups

`arena-meta-fixture-v1` es un catálogo local pequeño para validar la matriz. No representa un ranking oficial ni actualizado. Incluye cuatro rivales de Great League, tres de Ultra League y tres fixtures de Master League, todos derivados del Pokédex local.

La ejecución es secuencial y controlada: cada rival produce un resultado independiente, se reporta progreso por lote y un `runId` impide publicar resultados obsoletos. Todos los combates llaman al `simulateBattle` existente.

## Clasificación

El score combina margen de HP, 25% del margen de energía y 15 puntos por escudo restante. Umbrales: dominante ≥ 60, favorable ≥ 20, cerrado > -20, desfavorable > -60 y muy desfavorable ≤ -60.
