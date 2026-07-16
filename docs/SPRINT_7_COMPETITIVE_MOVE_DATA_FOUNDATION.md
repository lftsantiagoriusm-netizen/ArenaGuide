# Sprint 7 — Competitive Move Data Foundation

## Objetivo

Reemplazar los valores uniformes provisionales del adaptador de combate por una fuente local, tipada, auditable y versionada de estadísticas PvP para todos los movimientos presentes en el catálogo inicial de ArenaGuide.

## Contexto

Hasta Sprint 6, el motor asignaba `5` de poder, `8` de energía y `2` turnos a todos los movimientos rápidos, y `70` de poder con `50` de coste a todos los cargados. La simulación era determinística, pero no distinguía las propiedades competitivas de cada movimiento.

Sprint 7 elimina esas constantes. El Battle Engine conserva su única fórmula de daño y consume movimientos adaptados desde `competitive-data`.

## Alcance

- 25 movimientos rápidos y 36 cargados, para un total de 61.
- Poder PvP individual.
- Energía generada por movimientos rápidos.
- Coste positivo de movimientos cargados.
- Duración entera en turnos para movimientos rápidos.
- Categoría, tipo, estado de verificación, fuente y fecha de consulta.
- Validación estructural, IDs únicos, cobertura y datos huérfanos.
- Resolución por ID y adaptación al contrato `BattleMove`.
- Versionado e invalidación de Meta Matchups y Team Meta Coverage.
- Presentación discreta de parámetros y procedencia en las pantallas existentes.

## Alcance excluido

No se implementaron efectos secundarios, buffs, debuffs, baiting, selección estratégica de cargados, breakpoints, bulkpoints, comparación de builds, simulación 3v3, backend, APIs de producción ni actualización automática.

## Arquitectura

```text
src/features/competitive-data/
├── data/
│   ├── competitive-move-metadata.ts
│   └── competitive-moves.data.ts
├── domain/
│   ├── competitive-move-types.ts
│   ├── competitive-move-resolver.ts
│   └── competitive-move-validation.ts
├── components/
│   ├── competitive-data-version.tsx
│   └── competitive-move-summary.tsx
└── __tests__/
    ├── competitive-moves.test.ts
    └── competitive-move-integration.test.ts
```

La API pública se expone mediante `src/features/competitive-data/index.ts`. El dominio no depende de React, DOM ni almacenamiento.

## Modelo y tipos

`CompetitiveMove` es una unión discriminada:

- `CompetitiveFastMove`: `power`, `energyGain` y `turns`.
- `CompetitiveChargedMove`: `power` y `energyCost`.

El coste cargado se almacena como número positivo. La adaptación al contrato histórico del motor realiza explícitamente la conversión a `energyDelta` negativo. De esta forma, generación y coste no comparten un campo ambiguo en el dataset.

Otros contratos agregados:

- `CompetitiveMoveDataVersion`
- `CompetitiveMoveCategory`
- `CompetitiveMoveVerificationStatus`
- `CompetitiveMoveDatasetMetadata`
- `CompetitiveMoveValidationIssue`
- `ResolveCompetitiveMoveResult`

## Funciones puras

- `getCompetitiveMoveById`
- `resolveCompetitiveMove`
- `resolveCompetitiveFastMove`
- `resolveCompetitiveChargedMove`
- `validateCompetitiveMove`
- `validateCompetitiveMoveMetadata`
- `validateCompetitiveMoveDataset`
- `validateCompetitiveMoveCoverage`
- `adaptCompetitiveFastMoveToBattleMove`
- `adaptCompetitiveChargedMoveToBattleMove`
- `isCompetitiveMoveDatasetCompatible`
- `getCompetitiveMoveDatasetMetadata`

## Fuentes consultadas

### Fuente seleccionada

PvPoke Game Master, revisión Git `10fd1a6e43260e59b625d1cf96bbea496672880d`, consultada el 16 de julio de 2026:

<https://github.com/pvpoke/pvpoke/blob/10fd1a6e43260e59b625d1cf96bbea496672880d/src/data/gamemaster.json>

Se seleccionó porque ofrece un snapshot técnico versionado, reproducible y directamente auditable. No se presenta como publicación oficial de Niantic.

### Fuente de contraste

PoGoAPI, endpoints de movimientos PvP rápidos y cargados, consultados el 16 de julio de 2026:

- <https://pogoapi.net/api/v1/pvp_fast_moves.json>
- <https://pogoapi.net/api/v1/pvp_charged_moves.json>

PoGoAPI se utilizó únicamente durante la investigación. ArenaGuide no lo consume en ejecución.

## Discrepancias documentadas

Se encontraron diez diferencias. Se conservaron sin promediar los valores de la revisión seleccionada de PvPoke y cada entrada se marcó `source-conflict`.

| Movimiento   | PvPoke seleccionado  | PoGoAPI observado    |
| ------------ | -------------------- | -------------------- |
| Low Kick     | 5 poder, 8 energía   | 4 poder, 5 energía   |
| Mud Shot     | 3 poder, 9 energía   | 4 poder, 8 energía   |
| Mud-Slap     | 11 poder, 10 energía | 12 poder, 10 energía |
| Drill Run    | 70 poder, 40 coste   | 80 poder, 45 coste   |
| Earthquake   | 120 poder, 65 coste  | 110 poder, 65 coste  |
| Earth Power  | 90 poder, 50 coste   | 90 poder, 55 coste   |
| Flash Cannon | 110 poder, 65 coste  | 110 poder, 70 coste  |
| Foul Play    | 65 poder, 40 coste   | 60 poder, 40 coste   |
| Shadow Ball  | 100 poder, 50 coste  | 100 poder, 55 coste  |
| Wrap         | 70 poder, 45 coste   | 60 poder, 45 coste   |

`Hidden Power` se vinculó explícitamente a la entrada `HIDDEN_POWER_NORMAL`. Sus variantes elementales quedan fuera del modelo actual porque el Pokédex inicial representa únicamente la variante normal.

## Movimientos cubiertos

La validación cruza el dataset contra todas las entradas de `move-catalog.ts`. La cobertura es completa: 25 rápidos y 36 cargados. No quedaron movimientos sin datos ni datos competitivos huérfanos.

## Integración con Battle Engine

El adaptador ahora:

1. valida el build con `resolveCompetitiveBuild`;
2. resuelve cada movimiento por ID y categoría;
3. devuelve un error tipado si faltan datos;
4. adapta poder, energía y turnos individuales;
5. entrega el mismo contrato `BattlePokemon` al simulador existente.

No existe fallback. `calculateDamage` y `simulateBattle` no fueron duplicados ni reemplazados.

## Versionado

- Dataset de CP y estadísticas: `arena-competitive-data-v1`.
- Dataset de movimientos: `arena-competitive-moves-v1`.
- Battle Engine: `battle-engine-competitive-moves-v1`.

## Persistencia e invalidación

Meta Matchups y Team Meta Coverage guardan `competitiveMoveDataVersion`. Los parsers rechazan resultados derivados de otra versión. La clave de compatibilidad colectiva incluye también la versión de movimientos.

La persistencia del Team Builder no cambió. Los equipos editables continúan restaurándose y solo los resultados derivados incompatibles se descartan.

## Cambios esperados en resultados

Los resultados de combate pueden cambiar de manera importante respecto a Sprint 6 porque ahora cada movimiento conserva su poder, energía y duración. Este cambio es intencional y provoca el incremento de versión del motor.

## Efectos todavía no modelados

Algunos movimientos cubiertos declaran efectos de ataque o defensa en la fuente, por ejemplo Acid Spray, Brave Bird, Close Combat, Crunch, Earth Power, Flame Charge, Leaf Tornado, Night Slash, Rage Fist, Wrap y Zap Cannon. Sprint 7 conserva únicamente poder, energía y turnos; el motor no aplica estos efectos ni los presenta como simulados.

## Tests

Se cubren resolución, categorías, valores inválidos, metadatos, duplicados, cobertura, huérfanos, inmutabilidad, compatibilidad, adaptación, daño entero, energía, turnos, acceso a cargado según coste, determinismo, cambio real de simulación e invalidación de almacenamiento.

## Validaciones ejecutadas

Validación final del 16 de julio de 2026:

- `bun install`: 361 instalaciones comprobadas, sin cambios.
- `bunx tsc --noEmit --incremental false`: aprobado.
- `bun test`: 196 aprobados, 0 fallidos.
- `bun run lint`: aprobado sin advertencias.
- `bun run format:check`: todos los archivos cumplen Prettier.
- `bun run build`: build de producción y 10 páginas estáticas aprobados.
- `git diff --check`: aprobado.

## Riesgos y limitaciones

- Las fuentes son datasets técnicos comunitarios, no una especificación oficial publicada por Niantic.
- Los valores pueden cambiar con balances posteriores.
- Las diez discrepancias necesitan una auditoría futura ante una fuente Game Master adicional.
- Los efectos secundarios todavía no se modelan y pueden modificar resultados reales.
- El simulador continúa seleccionando el primer cargado accesible y no modela decisiones humanas.

## Preparación para Sprint 8

El siguiente incremento recomendado es modelar efectos determinísticos de movimientos con probabilidad 100% y enriquecer el timeline con evidencia tipada. Después de esa base, ArenaGuide podrá construir `matchup-breakdown`, breakpoints, bulkpoints y flips sin interpretar datos uniformes ni omitir cambios de estadísticas decisivos.
