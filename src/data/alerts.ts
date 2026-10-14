import type { Alert, Metrics, ScenePoint } from './types'

import { WIN_X, ENG_HOME } from './layout'
export { WIN_X, ENG_HOME } from './layout'

export interface AlertCtx {
  leakedIndex: number
  mdbUp: boolean
}

export const computeAlert = (metrics: Metrics, ctx: AlertCtx): Alert => {
  if (metrics.LeakedConnectionCount > 0) {
    const leakedIdx = ctx.leakedIndex >= 0 ? ctx.leakedIndex : 0
    const at: ScenePoint = { x: WIN_X(leakedIdx), y: 0, z: 0.2 }
    return {
      level: 'crit',
      who: 'Mandy · gerente',
      message: `Hay ${metrics.LeakedConnectionCount} cajero${metrics.LeakedConnectionCount > 1 ? 's' : ''} que no suelta${metrics.LeakedConnectionCount > 1 ? 'n' : ''} la conexión.`,
      runbook: 'Revisa LeakedConnectionCount, activa Inactive Connection Timeout en el Data Source y busca el código que no cierra la conexión.',
      engineer: `Voy a la ventanilla ${leakedIdx + 1}: esa conexión no volvió al pool. Activo Inactive Connection Timeout.`,
      at
    }
  }
  if (!ctx.mdbUp && metrics.MessagesCurrentCount > 4) {
    const at: ScenePoint = { x: 4.5, y: 0, z: -2.4 }
    return {
      level: 'crit',
      who: 'Mandy · gerente',
      message: `La correspondencia se acumula: ${metrics.MessagesCurrentCount} mensajes sin procesar.`,
      runbook: 'ConsumersCurrentCount está en 0. Verifica que el MDB esté desplegado y activo, y revisa la cola de error.',
      engineer: 'Reviso el MDB: ConsumersCurrentCount en 0. Hay que reactivar el consumidor.',
      at
    }
  }
  if (metrics.WaitingForConnectionCurrentCount > 4) {
    const at: ScenePoint = { x: -1.5, y: 0, z: 3.6 }
    return {
      level: 'warn',
      who: 'Mandy · gerente',
      message: `¡Necesitamos más cajeros! ${metrics.WaitingForConnectionCurrentCount} clientes esperan conexión.`,
      runbook: 'Revisa WaitingForConnectionCurrentCount contra MaxCapacity; sube la capacidad del pool o revisa consultas lentas en la base de datos.',
      engineer: 'Reviso la fila: el pool está lleno. Propongo subir MaxCapacity.',
      at
    }
  }
  return {
    level: 'ok',
    who: 'Mandy · gerente',
    message: 'Todo en orden en la sucursal.',
    runbook: '',
    engineer: '',
    at: { ...ENG_HOME }
  }
}
