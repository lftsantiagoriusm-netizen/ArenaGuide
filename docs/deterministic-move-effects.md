# Deterministic move effects

Sprint 8 incorpora cambios de etapas de ataque y defensa sin introducir azar. El rango permitido es `-4..+4`. El multiplicador sigue la regla de Pokémon GO PvP usada por la revisión local de PvPoke:

- etapa positiva: `(4 + stage) / 4`
- etapa negativa: `4 / (4 - stage)`

La referencia verificada es PvPoke commit `10fd1a6e43260e59b625d1cf96bbea496672880d`, con `buffDivisor: 4` y `maxBuffStages: 4`. La aplicación no consulta esa fuente durante la ejecución; los datos se mantienen locales y versionados.

## Política determinística

Los efectos con probabilidad `1` se aplican después del daño cargado, incluso si el rival usa escudo. Los efectos con probabilidad inferior a `1` se identifican como `probabilistic`, generan evidencia de rechazo y no alteran el estado. No existe RNG ni selección favorable/desfavorable implícita.

El dataset inicial aplica Acid Spray, Brave Bird, Close Combat, Flame Charge, Rage Fist y Wrap. Crunch, Earth Power, Leaf Tornado, Night Slash y Zap Cannon se documentan, pero no se ejecutan por ser probabilísticos en la revisión fuente.

## Evidencia y compatibilidad

Los eventos relevantes registran snapshots compactos antes y después con HP, energía, escudos y etapas. El resultado separa daño rápido, cargado y total. La versión del motor y la versión del dataset de efectos forman parte de las claves de compatibilidad; resultados persistidos de versiones anteriores se descartan de manera segura.
