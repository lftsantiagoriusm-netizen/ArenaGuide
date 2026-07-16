# Sprint 6 — Competitive Data Foundation

## Objetivo

Consolidar una fuente local, tipada y versionada para los datos competitivos que determinan el CP y las estadísticas efectivas de un build. Team Builder, Battle Lab, Meta Matchups y Team Meta Coverage consumen ahora el mismo contrato y dejan de depender de aproximaciones aisladas.

## Arquitectura

El módulo `src/features/competitive-data` separa cinco responsabilidades:

- `data`: metadatos del dataset y tabla explícita de CPM.
- `domain`: fórmula de CP, estadísticas efectivas, reglas de liga y resolución de builds.
- `components`: presentación reutilizable del CP y versión del dataset.
- `__tests__`: referencias numéricas, límites, errores y determinismo.
- `index.ts`: API pública del módulo.

El flujo de datos es unidireccional:

```text
Pokédex tipada
  -> Competitive Data resolver
  -> build resuelto (CP + estadísticas efectivas + versión)
  -> Team Builder / Battle Engine / Meta / Team Coverage
```

React no participa en los cálculos. El dominio se implementa mediante funciones puras y resultados discriminados.

## Fuente de datos y versiones

La primera versión usa un dataset local declarado como `arena-competitive-data-v1`. Sus metadatos incluyen versión de esquema, versión de referencia, fecha de actualización, etiqueta de fuente y estado de confianza.

El estado inicial es `provisional`: los multiplicadores de nivel y la fórmula de estadísticas están consolidados, pero los parámetros competitivos de movimientos todavía pertenecen al modelo provisional existente. La interfaz comunica esta limitación explícitamente.

La tabla de CPM contiene valores explícitos desde nivel 1 hasta nivel 50, en incrementos de 0.5. No se interpolan niveles ausentes. Un nivel no soportado produce un error controlado.

## Fórmulas y redondeo

Para estadísticas base `A`, `D`, `S`; IV y multiplicador de nivel `CPM`:

```text
attack  = (A + attackIV) × CPM
defense = (D + defenseIV) × CPM
hp      = floor((S + staminaIV) × CPM)

CP = max(
  10,
  floor(
    (A + attackIV)
    × sqrt(D + defenseIV)
    × sqrt(S + staminaIV)
    × CPM²
    ÷ 10
  )
)
```

El piso se aplica una sola vez al resultado del CP y al HP efectivo. Ataque y defensa conservan precisión decimal para que el motor pueda resolver daño y CMP de forma determinística.

## Reglas de liga

- Great League: CP máximo 1500.
- Ultra League: CP máximo 2500.
- Master League: sin límite de CP.

La elegibilidad se evalúa sobre el build completo —especie, forma, nivel e IV— y no únicamente sobre la especie. Un build que excede el límite no se adapta al Battle Engine.

## Resolución de builds

`resolveCompetitiveBuild` centraliza:

1. existencia de especie y forma;
2. compatibilidad declarada con la liga;
3. rango entero de IV (0–15);
4. nivel presente en la tabla de CPM;
5. pertenencia de movimientos al learnset;
6. ataques cargados distintos;
7. cálculo de estadísticas y CP;
8. validación del límite de liga.

Los errores esperados se expresan mediante una unión discriminada con código, mensaje y campo relacionado. No se usan excepciones para validaciones normales.

## Integraciones

### Team Builder

Muestra CP calculado, límite de liga y versión del dataset. La validación existente se conserva y delega en el resolver competitivo cuando las reglas estructurales ya son válidas. Una configuración inválida permanece editable y no se elimina al restaurar almacenamiento local.

### Battle Engine y Battle Lab

La adaptación desde Pokédex obtiene estadísticas efectivas del resolver central. Se eliminó la interpolación provisional de CPM y se corrigió el uso duplicado del multiplicador. Builds ilegales o por encima del límite no pueden simularse.

La versión del motor cambia a `battle-engine-competitive-data-v1`, invalidando resultados derivados con la implementación anterior.

### Meta Matchups

Las preferencias guardan `competitiveDataVersion`. Datos persistidos con otra versión se descartan de forma segura. La pantalla muestra el origen y estado del dataset utilizado.

### Team Meta Coverage

La versión competitiva participa tanto en la huella canónica del equipo como en la clave de compatibilidad. Cambios de versión, orden de slots, especie, forma, IV, nivel o movimientos invalidan resultados derivados sin modificar la configuración editable del Team Builder.

## Casos verificados

- niveles enteros y medios;
- rechazo de niveles fuera del catálogo o no discretos;
- referencia de CP conocida y CP mínimo 10;
- variación de CP por IV y nivel;
- límites exactos y excedidos de Great y Ultra League;
- Master League sin límite;
- especie, forma, nivel, IV y movimientos inválidos;
- build por encima del límite;
- determinismo y ausencia de mutación;
- rechazo del build en Team Builder y en el adaptador del Battle Engine;
- invalidación de Meta y Team Coverage por versión competitiva;
- cambio de huella al cambiar la versión del dataset.

## Decisiones técnicas

- Mantener el Pokédex como fuente de especie, forma, estadísticas base y learnset evita duplicación.
- Usar una tabla local explícita hace que el comportamiento sea auditable y reproducible sin APIs externas.
- Versionar los datos por separado del esquema, motor y meta permite invalidar solo resultados derivados incompatibles.
- Un resolver único reduce divergencias entre formularios, validación y simulación.
- No se añadieron dependencias ni servicios externos.

## Limitaciones reales

- El dataset sigue marcado como provisional hasta documentar y auditar formalmente su procedencia completa.
- Los atributos competitivos de movimientos del Battle Engine continúan normalizados y provisionales; no forman parte de la consolidación de este Sprint.
- El catálogo inicial del Pokédex sigue siendo pequeño y no representa todas las especies, formas ni movimientos del juego.
- No se implementaron optimización automática de IV, niveles recomendados, ranking por stat product ni importación de Game Master.

## Recomendación para Sprint 7

Crear un pipeline local y auditable de actualización de datos competitivos: catálogo completo de movimientos PvP, estadísticas verificadas, trazabilidad de fuente, validación de integridad y generación determinística del dataset versionado. La actualización debe producir un diff revisable y no depender de APIs durante la ejecución de la aplicación.
