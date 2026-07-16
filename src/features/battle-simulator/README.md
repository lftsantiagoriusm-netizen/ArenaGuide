# Battle Simulation Engine

El motor es puro e independiente de React. `adapters/` traduce builds del producto al contrato de combate; `engine/` contiene estadísticas, tipos, daño y resolución temporal; `strategies/` encapsula decisiones sustituibles.

## Mechanics Fixture v1

El Pokédex todavía no incluye poder, energía o duración de movimientos, ni una tabla completa de multiplicadores por nivel. Esta versión usa valores normalizados temporales: movimientos rápidos con 5 de poder, 8 de energía y 2 turnos; cargados con 70 de poder y coste 50. Los multiplicadores de nivel se interpolan entre anclas documentadas en `stats.ts`.

Los resultados son reproducibles y determinísticos respecto a este fixture, pero no deben presentarse como simulaciones oficiales hasta sustituirlo por un dataset PvP versionado y validado.
