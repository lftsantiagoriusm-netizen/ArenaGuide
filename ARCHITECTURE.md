# Arquitectura de ArenaGuide

ArenaGuide adopta un monolito modular orientado a features. Next.js se ocupa del enrutamiento y la composición; la lógica de producto vive fuera de `app`.

## Límites

- `app`: rutas, metadata y layouts de Next.js.
- `features`: dominios verticales. Cada feature puede contener componentes, hooks, tipos, servicios y lógica propios.
- `components/ui`: primitivas visuales sin conocimiento de negocio.
- `components/common`: composición reutilizable independiente del dominio.
- `components/layout` y `components/navigation`: shell responsive de la aplicación.
- `providers`: integración de dependencias globales de React.
- `store`: estado global exclusivamente de interfaz. El estado remoto pertenece a TanStack Query.
- `services`: adaptadores compartidos hacia infraestructura externa.
- `lib`: configuración y utilidades base del framework.

## Reglas de dependencia

Las rutas pueden importar features y componentes compartidos. Las features pueden importar componentes compartidos, hooks, servicios, tipos y utilidades, pero no otras rutas. Los componentes compartidos no deben importar features.

La futura simulación será un módulo determinístico puro, separado de React y de cualquier capa explicativa. Esto permitirá probar el motor con entradas y salidas reproducibles.
