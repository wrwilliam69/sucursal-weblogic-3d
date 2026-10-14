# AGENTS.md — Sucursal WebLogic 3D

Reglas para cualquier agente de código (OpenCode u otro) que trabaje en este repo. Léelas antes de cada tarea.

## Qué es

Un monitor visual de un servidor Oracle WebLogic contado como una **sucursal bancaria en 3D isométrico**. Cada pieza de la sucursal representa un componente real de WebLogic y se anima según sus métricas. Es una pieza de portafolio pública.

Referencia visual y de comportamiento: `reference/prototipo-3d.html` (Three.js puro, un solo archivo). **Es solo referencia**: no se copia tal cual, se reconstruye por componentes con el stack de abajo.

## Stack

- Vite + React 18 + TypeScript
- `three`, `@react-three/fiber`, `@react-three/drei`
- Estado: `zustand`
- Sin Unity, sin motor de juegos, sin backend por ahora
- Despliegue: GitHub Pages (build estático, `base` configurado en `vite.config.ts`)

## Regla de oro: datos separados de la vista

```
src/
  data/        modelo de datos y fuentes (simulador hoy, lab real mañana)
    types.ts       tipos de métricas con nombres reales de MBeans
    simulator.ts   simulador con escenarios
    source.ts      interfaz MetricsSource (simulador | REST | Prometheus)
  store/       store de zustand: el único lugar que guarda estado
  scene/       componentes 3D (solo leen del store)
    Branch.tsx      sala, muros, piso
    Lobby.tsx       entrada y fila (Work Manager)
    Windows.tsx     ventanillas y cajeros (pool JDBC)
    Vault.tsx       bóveda (base de datos)
    JmsMailbox.tsx  buzón, banda, File Store, MDB, cola de error
    Customers.tsx   clientes (peticiones) y su recorrido
    Mandy.tsx       gerente (gata siamesa)
    Engineer.tsx    ingeniero con casco
  ui/          HTML encima del canvas: KPIs, panel de detalle, escenarios, leyenda, etiquetas
```

- La escena **nunca** calcula métricas ni decide alertas: lee del store.
- Las alertas se calculan en una función pura `computeAlert(metrics)` en `src/data/`.
- Cambiar el simulador por el lab real debe tocar solo `src/data/source.ts`.

## Analogía (no cambiarla sin preguntar)

| Sucursal | WebLogic | Métricas (MBeans) |
|---|---|---|
| Cliente | Petición entrante | — |
| Fila | Work Manager / execute queue | `QueueLength`, `ExecuteThreadIdleCount`, `HoggingThreadCount`, `StuckThreadCount` |
| Cajero en ventanilla | Conexión del pool JDBC | `ActiveConnectionsCurrentCount`, `CurrCapacity`, `NumAvailable`, `WaitingForConnectionCurrentCount`, `LeakedConnectionCount`, `ActiveConnectionsHighCount` |
| Bóveda | Base de datos | — |
| Sobre en el buzón | Mensaje en cola JMS persistente | `MessagesCurrentCount`, `MessagesPendingCount`, `MessagesReceivedCount`, `ConsumersCurrentCount` |
| Archivador | File Store | — |
| Empleado de la mesa | MDB (consumidor) | `ConsumersCurrentCount` |
| Caja roja | Cola de error | `ErrorMessagesCurrentCount` |
| Mandy (gerente) | Quien da la alerta | — |
| Ingeniero con casco | Quien propone el paso del runbook | — |

Estados del cajero: verde = atendiendo, gris = libre, rojo = conexión fugada (no volvió al pool).

## Escenarios del simulador

- `normal`: llegada tranquila, todo en verde.
- `peak` (hora pico): llegan muchas peticiones, se llena la fila → alerta "necesitamos más cajeros".
- `leak` (fuga de conexiones): 3 cajeros quedan en rojo, sube `StuckThreadCount` → alerta crítica.
- `mdb` (consumidor JMS caído): `ConsumersCurrentCount = 0`, se acumulan sobres, algunos pasan a la cola de error.
- `reset`: vuelve a normal y libera fugas.

## Estilo visual

- Isométrico con cámara ortográfica, sombras suaves, look de maqueta limpia (referencia: demos tipo WareTrack).
- Personajes chibi hechos de cajas (cabeza grande). Mandy es siamesa: cuerpo crema, orejas, cara, patas y cola café oscuro, ojos azules.
- Etiquetas legibles sobre cada zona, numeradas en el orden del recorrido.
- Tema claro y oscuro. Accesible: botones reales, foco visible, respeta `prefers-reduced-motion`.

## Sensación de vida (objetivo visual principal)

La escena debe sentirse viva, como el demo WareTrack. Eso sale de muchos detalles pequeños, no de uno grande:

- **Algo siempre se mueve**: varias cosas a la vez y a distinto ritmo (clientes caminando, cajeros que se balancean, sobres en la banda, cola de Mandy, ingeniero). Nunca un cuadro quieto.
- **Movimiento suave**: nada salta de un estado a otro; todo se interpola (springs o lerp), con aceleración y frenado al caminar y un pequeño rebote al llegar.
- **Mundo alrededor**: la sucursal no flota en el vacío. Calle, andén, árboles, faroles, una reja y algún carro pasando de vez en cuando, en tonos suaves.
- **Formas redondeadas**: `RoundedBox` de drei en muebles, edificio y personajes; nada de cubos de bordes duros.
- **Luz y sombra de maqueta**: paleta clara (blancos, azules suaves, un acento azul fuerte), `ContactShadows` bajo cada objeto, oclusión ambiental suave y un `Environment` tenue. Sin colores saturados salvo estados (verde, ámbar, rojo).
- **Marcadores flotantes**: pines y etiquetas que suben y bajan despacio (`Float` de drei) sobre lo importante; el objeto seleccionado se resalta con un contorno y su tarjeta.
- **Cámara viva**: entrada con un acercamiento suave al cargar, zoom con rueda y botones, y al hacer clic en un objeto la cámara se desliza hacia él.
- **Interfaz tipo vidrio**: tarjetas blancas semitransparentes con desenfoque de fondo, esquinas redondeadas, números grandes y una flecha de tendencia (`+3`, `+0.4%`).
- **Detalles reales del sujeto**: barras de progreso en cada ventanilla (tiempo de atención), contador de sobres, lámpara del MDB, reloj "Live" en la barra superior.
- Respetar `prefers-reduced-motion`: con esa preferencia, quitar el balanceo y los movimientos decorativos, dejar solo los que informan estado.

## Reglas de contenido (portafolio público)

- **Nada confidencial**: sin IPs, puertos, hostnames reales, nombres de clientes, bancos ni configuración real.
- Nombres de ejemplo: servidor `ms1`, data source `ds-sucursal`.
- Textos de la interfaz en español.

## Forma de trabajo

- Una tarea por sesión, en el orden de `TAREAS.md`. No adelantar tareas.
- Primero planear (modo plan), mostrar el plan, luego construir.
- Commits pequeños con mensaje en español: `feat: ...`, `fix: ...`, `docs: ...`.
- Antes de terminar una tarea: `npm run build` sin errores y `npm run lint` limpio.
- Si algo de este archivo choca con la tarea, parar y preguntar.
