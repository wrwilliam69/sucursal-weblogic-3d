import { create } from 'zustand'
import { createSimState, metrics as simMetrics, simStep, setScenario, resetAll } from '../data/simulator'
import { computeAlert } from '../data/alerts'
import type { Metrics, Alert, ScenarioName } from '../data/types'

interface SimInternal {
  simState: ReturnType<typeof createSimState>
}

interface StoreState {
  metrics: Metrics
  alert: Alert
  scenario: ScenarioName
  running: boolean
  setScenario: (sc: ScenarioName) => void
  reset: () => void
  start: () => void
  stop: () => void
  tick: (dt: number) => void
}

let interval: number | null = null

export const useStore = create<StoreState>((set, get) => {
  const internal: SimInternal = {
    simState: createSimState()
  }

  const compute = () => {
    const m = simMetrics(internal.simState)
    const leakedIdx = internal.simState.windows.findIndex(w => w.state === 'leaked')
    const alert = computeAlert(m, { leakedIndex: leakedIdx, mdbUp: internal.simState.mdbUp })
    return { m, alert, scenario: internal.simState.scenario }
  }

  const initial = compute()

  return {
    metrics: initial.m,
    alert: initial.alert,
    scenario: initial.scenario,
    running: false,
    setScenario: (sc: ScenarioName) => {
      setScenario(internal.simState, sc)
      const next = compute()
      set(next)
    },
    reset: () => {
      resetAll(internal.simState)
      const next = compute()
      set(next)
    },
    tick: (dt: number) => {
      simStep(internal.simState, dt)
      const next = compute()
      set(next)
    },
    start: () => {
      if (get().running) return
      set({ running: true })
      if (interval !== null) {
        window.clearInterval(interval)
        interval = null
      }
      interval = window.setInterval(() => {
        get().tick(0.05)
      }, 50)
    },
    stop: () => {
      set({ running: false })
      if (interval !== null) {
        window.clearInterval(interval)
        interval = null
      }
    }
  }
})
