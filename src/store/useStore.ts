import { create } from 'zustand'
import type { MetricsSource } from '../data/source'
import { SimulatorSource } from '../data/source'
import type { Metrics, Alert, ScenarioName, WindowState } from '../data/types'

const EMPTY_METRICS: Metrics = {
  ActiveConnectionsCurrentCount: 0,
  CurrCapacity: 0,
  NumAvailable: 0,
  WaitingForConnectionCurrentCount: 0,
  LeakedConnectionCount: 0,
  ActiveConnectionsHighCount: 0,
  QueueLength: 0,
  ExecuteThreadIdleCount: 0,
  HoggingThreadCount: 0,
  StuckThreadCount: 0,
  MessagesCurrentCount: 0,
  MessagesPendingCount: 0,
  MessagesReceivedCount: 0,
  ConsumersCurrentCount: 0,
  ErrorMessagesCurrentCount: 0
}

const OK_ALERT: Alert = {
  level: 'ok',
  who: 'Mandy · gerente',
  message: 'Todo en orden en la sucursal.',
  runbook: '',
  engineer: '',
  at: { x: 0, y: 0, z: 0 }
}

interface StoreState {
  metrics: Metrics
  alert: Alert
  scenario: ScenarioName
  windows: WindowState[]
  running: boolean
  source: MetricsSource
  setScenario: (sc: ScenarioName) => void
  reset: () => void
  start: () => void
  stop: () => void
  setSource: (src: MetricsSource) => void
}

const defaultSource = new SimulatorSource()

export const useStore = create<StoreState>((set, get) => ({
  metrics: EMPTY_METRICS,
  alert: OK_ALERT,
  scenario: 'normal',
  windows: [],
  running: false,
  source: defaultSource,
  setScenario: (sc: ScenarioName) => {
    get().source.setScenario(sc)
  },
  reset: () => {
    get().source.reset()
  },
  start: () => {
    if (get().running) return
    set({ running: true })
    get().source.start()
  },
  stop: () => {
    set({ running: false })
    get().source.stop()
  },
  setSource: (src: MetricsSource) => {
    activeUnsub?.()
    set({ source: src, running: false })
    activeUnsub = src.subscribe(({ metrics, alert, scenario, windows }) => {
      useStore.setState({ metrics, alert, scenario, windows })
    })
  }
}))

let activeUnsub: (() => void) | null = defaultSource.subscribe(({ metrics, alert, scenario, windows }) => {
  useStore.setState({ metrics, alert, scenario, windows })
})
