# Tareas — Sucursal WebLogic 3D

Pásale a OpenCode **una tarea a la vez**, en este orden. Empieza siempre con:
"Lee AGENTS.md y haz la tarea N de TAREAS.md. Primero muéstrame el plan."

Al terminar cada una, revisa el criterio de "Listo cuando", haz commit y trae el resultado (captura, diff o error) a Claude para revisión.

---

## Tarea 1 — Montar el proyecto
- Crear el proyecto con Vite + React + TypeScript en la raíz del repo.
- Instalar `three`, `@react-three/fiber`, `@react-three/drei`, `zustand`.
- Configurar ESLint y `vite.config.ts` con `base: '/sucursal-weblogic-3d/'`.
- Crear la estructura de carpetas de AGENTS.md con archivos vacíos o mínimos.
- Un canvas que muestre un piso y un cubo, con cámara ortográfica isométrica.

**Listo cuando:** `npm run dev` muestra el cubo en el piso y `npm run build` pasa.

## Tarea 2 — Modelo de datos y simulador
- `src/data/types.ts` con todas las métricas de la tabla de AGENTS.md.
- `src/data/simulator.ts`: ventanillas, fila, cola JMS, MDB y cola de error, con los 5 escenarios (tomar la lógica de `simStep` del prototipo de referencia).
- `computeAlert(metrics)`: devuelve nivel (ok/warn/crit), mensaje de Mandy, paso del runbook, mensaje del ingeniero y punto de la escena donde está el problema.
- Store de zustand que corre el simulador a intervalos fijos.
- Pruebas unitarias simples de `computeAlert` (Vitest).

**Listo cuando:** las pruebas pasan y en consola se ven las métricas cambiar.

## Tarea 3 — La sala
- `Branch.tsx`: piso, muros en corte tipo maqueta, letrero, entrada, plantas.
- Luces y sombras suaves; giro limitado arrastrando.

**Listo cuando:** se ve la sucursal vacía, bonita y girable.

## Tarea 4 — Ventanillas y bóveda
- `Windows.tsx`: mostrador, 6 ventanillas, cajeros chibi, letrero de color por estado (verde/gris/rojo), carpeta roja en conexiones fugadas.
- `Vault.tsx`: bóveda con puerta redonda; cubos verdes viajando de cada ventanilla activa a la bóveda.

**Listo cuando:** al cambiar al escenario `leak` se ven cajeros en rojo.

## Tarea 5 — Clientes y fila
- `Lobby.tsx` y `Customers.tsx`: los clientes entran, hacen fila, pasan a la ventanilla que se libera y salen; algunos pasan antes por el buzón.

**Listo cuando:** en `peak` la fila crece y en `normal` se vacía.

## Tarea 6 — JMS
- `JmsMailbox.tsx`: buzón, banda con sobres según `MessagesCurrentCount`, File Store, mesa del MDB con lámpara de estado y cola de error con sobres.

**Listo cuando:** en `mdb` los sobres se acumulan y aparecen en la cola de error.

## Tarea 7 — Mandy y el ingeniero
- `Mandy.tsx`: siamesa en el escritorio, con globo de alerta.
- `Engineer.tsx`: camina hasta el punto del problema, anillo pulsante en el piso y globo con el paso del runbook; vuelve a su sitio cuando todo está normal.

**Listo cuando:** en cada escenario el ingeniero va al lugar correcto.

## Tarea 8 — Interfaz
- KPIs arriba, etiquetas numeradas sobre cada zona, panel lateral al hacer clic en un objeto (estado, métricas con nombres de MBeans, paso del runbook), botones de escenario y leyenda de la analogía.
- Tema claro/oscuro y versión de celular.

**Listo cuando:** se puede hacer clic en cada objeto y ver su panel.

## Tarea 9 — Publicar
- GitHub Action para desplegar en GitHub Pages.
- README con captura, la tabla de la analogía y cómo correrlo.

**Listo cuando:** el sitio abre desde GitHub Pages.

---

## Después (no empezar todavía)
- Vista "La central": balanceador, dos nodos en clúster, caída de un nodo y failover.
- Conexión real al lab WebLogic en EC2 (REST o Prometheus) reemplazando el simulador en `source.ts`.
- Publicación para LinkedIn (sin nada confidencial).
