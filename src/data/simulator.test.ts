import { describe, it, expect } from 'vitest'
import { createSimState, setScenario, resetAll, simStep, metrics, POOL_MAX } from './simulator'

describe('simulator', () => {
  it('reset libera conexiones fugadas y vacía cola de error', () => {
    const s = createSimState()
    // forzar estado: marcar ventana como leaked
    s.windows[2].state = 'leaked'
    s.errorQ = 3
    s.mdbUp = false
    resetAll(s)
    expect(s.windows[2].state).toBe('idle')
    expect(s.errorQ).toBe(0)
    expect(s.mdbUp).toBe(true)
  })

  it('con leakNext, algunas ventanas pasan a leaked', () => {
    const s = createSimState()
    setScenario(s, 'leak')
    const hooks = {
      canServe: () => true
    }
    s.spawnT = -1
    simStep(s, 0.01, hooks, () => 0)
    // Con la lógica del prototipo, el spawn + asignación ocurren en el mismo paso
    expect(s.windows[0].state).toBe('busy')
    simStep(s, 10, hooks, () => 0)
    expect(s.windows[0].state).toBe('leaked')
  })

  it('metrics calcula correctamente', () => {
    const s = createSimState()
    s.windows[0].state = 'busy'
    s.windows[1].state = 'leaked'
    s.waiting = [1, 2, 3]
    const m = metrics(s)
    expect(m.ActiveConnectionsCurrentCount).toBe(2)
    expect(m.LeakedConnectionCount).toBe(1)
    expect(m.NumAvailable).toBe(POOL_MAX - 2)
    expect(m.QueueLength).toBe(3)
  })
})
