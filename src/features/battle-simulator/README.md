# Battle Simulation Engine

El motor es puro e independiente de React. `adapters/` traduce builds del producto al contrato de combate; `engine/` contiene estadísticas, tipos, daño y resolución temporal; `strategies/` encapsula decisiones sustituibles.

## Deterministic engine

El motor consume estadísticas competitivas y movimientos PvP locales versionados. La fórmula de daño vive exclusivamente en `engine/damage.ts`; las etapas de ataque y defensa se aplican como modificadores de esa entrada, sin mutar CP ni estadísticas base.

Solo se ejecutan efectos de movimientos con probabilidad 100%. Los efectos probabilísticos quedan registrados como evidencia no aplicada: el motor no usa RNG. Cada evento relevante incluye snapshots compactos para auditar HP, energía, escudos y etapas, y el resultado agrega daño rápido y cargado por combatiente.
