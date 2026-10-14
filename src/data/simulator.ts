import type { Metrics, ScenarioName, WindowState } from './types'

export const POOL_MAX = 6
export const THREADS = 12
export const WIN_X = (i: number) => -4.5 + i * 1.6

export interface Window {
  state: WindowState
  reqId: number | null
  t: number
  busySince: number
}

export interface SimHooks {
  onArrive?: (id: number) => void
  onStartService?: (id: number, i: number) => void
  onEndService?: (id: number, i: number, msg: boolean) => void
  canServe?: (id: number) => boolean
}

export interface SimState {
  scenario: ScenarioName
  arrivalEvery: number
  serviceMin: number
  serviceMax: number
  mdbUp: boolean
  leakNext: number
  windows: Window[]
  waiting: number[]
  jms: number
  jmsReceived: number
  errorQ: number
  inFlight: number
  activeHigh: number
  nextId: number
  spawnT: number
  mdbT: number
  redeliverT: number
  served: number
}

export const createSimState = (): SimState => ({
  scenario: 'normal',
  arrivalEvery: 1.6,
  serviceMin: 3,
  serviceMax: 5,
  mdbUp: true,
  leakNext: 0,
  windows: Array.from({ length: POOL_MAX }, () => ({ state: 'idle' as WindowState, reqId: null, t: 0, busySince: 0 })),
  waiting: [],
  jms: 0,
  jmsReceived: 0,
  errorQ: 0,
  inFlight: 0,
  activeHigh: 0,
  nextId: 1,
  spawnT: 0,
  mdbT: 0,
  redeliverT: 0,
  served: 0
})

export const setScenario = (state: SimState, sc: ScenarioName) => {
  state.scenario = sc
  if (sc === 'peak') {
    state.arrivalEvery = 0.45
  } else {
    state.arrivalEvery = 1.6
  }
  if (sc === 'mdb') {
    state.mdbUp = false
  } else {
    state.mdbUp = true
  }
  if (sc === 'leak') {
    state.leakNext = 3
  } else {
    state.leakNext = 0
  }
  if (sc === 'reset') {
    state.windows.forEach(w => {
      if (w.state === 'leaked') {
        w.state = 'idle'
        w.reqId = null
        w.t = 0
        w.busySince = 0
      }
    })
    state.errorQ = 0
    state.leakNext = 0
    state.mdbUp = true
    state.scenario = 'normal'
    state.arrivalEvery = 1.6
    state.spawnT = 0
    state.mdbT = 0
    state.redeliverT = 0
  }
}

export const resetAll = (state: SimState, rand: () => number = Math.random) => {
  setScenario(state, 'reset', rand)
}

export const metrics = (state: SimState): Metrics => {
  const active = state.windows.filter(w => w.state === 'busy').length
  const leaked = state.windows.filter(w => w.state === 'leaked').length
  const waiting = state.waiting.length
  const idleExec = THREADS - active - leaked - Math.min(waiting, THREADS)
  return {
    ActiveConnectionsCurrentCount: active + leaked,
    CurrCapacity: POOL_MAX,
    WaitingForConnectionCurrentCount: waiting,
    LeakedConnectionCount: leaked,
    ActiveConnectionsHighCount: state.activeHigh,
    NumAvailable: POOL_MAX - active - leaked,
    StuckThreadCount: leaked,
    HoggingThreadCount: Math.max(0, waiting - 3),
    ExecuteThreadIdleCount: Math.max(0, idleExec),
    QueueLength: waiting,
    MessagesCurrentCount: state.jms,
    MessagesPendingCount: state.inFlight,
    MessagesReceivedCount: state.jmsReceived,
    ConsumersCurrentCount: state.mdbUp ? 1 : 0,
    ErrorMessagesCurrentCount: state.errorQ
  }
}

export const simStep = (state: SimState, dt: number, hooks: SimHooks = {}, rand: () => number = Math.random) => {
  state.spawnT -= dt
  if (state.spawnT <= 0) {
    state.spawnT = state.arrivalEvery * (0.6 + rand() * 0.8) // rand(0.6, 1.4)
    if (state.waiting.length < 14) {
      const id = state.nextId++
      state.waiting.push(id)
      hooks.onArrive?.(id)
    }
  }

  state.windows.forEach(w => {
    if (w.state === 'busy') {
      w.t -= dt
      if (w.t <= 0) {
        const leak = state.leakNext > 0
        if (leak) {
          state.leakNext--
          w.state = 'leaked'
          w.reqId = null
          w.t = 0
          w.busySince = 0
        } else {
          w.state = 'idle'
          w.reqId = null
          w.t = 0
          w.busySince = 0
        }
        state.served++
        const msg = rand() < 0.45
        if (msg) {
          state.jms++
        }
        const wIdx = state.windows.indexOf(w)
        const reqId = w.reqId
        hooks.onEndService?.(reqId ?? 0, wIdx, msg)
      }
    }
  })

  state.windows.forEach((w, i) => {
    if (w.state === 'idle' && state.waiting.length) {
      const can = hooks.canServe?.(state.waiting[0])
      if (can === undefined || can === true) {
        const id = state.waiting.shift()
        w.state = 'busy'
        w.reqId = id ?? null
        w.t = state.serviceMin + rand() * (state.serviceMax - state.serviceMin)
        w.busySince = 0
        if (id !== undefined) {
          hooks.onStartService?.(id, i)
        }
      }
    }
  })

  const m = metrics(state)
  if (m.ActiveConnectionsCurrentCount > state.activeHigh) {
    state.activeHigh = m.ActiveConnectionsCurrentCount
  }

  if (state.mdbUp) {
    state.inFlight = state.jms > 0 ? 1 : 0
    if (state.mdbT <= 0 && state.jms > 0) {
      state.mdbT = 0.9
      state.jms--
      state.jmsReceived++
      if (state.mdbT > 0) state.mdbT -= dt // keep approximate; but per step
    }
    state.mdbT -= dt
  } else {
    state.inFlight = 0
    state.redeliverT -= dt
    if (state.redeliverT <= 0 && state.jms > 6) {
      state.redeliverT = 5
      state.jms--
      state.errorQ++
    }
  }
}
