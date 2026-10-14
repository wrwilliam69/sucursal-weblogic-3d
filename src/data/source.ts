import type { Metrics, Alert, ScenarioName } from './types'
import { createSimState, simStep, setScenario, resetAll, metrics as simMetrics } from './simulator'
import { computeAlert } from './alerts'

export type MetricsSubscriber = (data: { metrics: Metrics; alert: Alert; scenario: ScenarioName }) => void

export interface MetricsSource {
  start(): void
  stop(): void
  setScenario(sc: ScenarioName): void
  reset(): void
  subscribe(sub: MetricsSubscriber): () => void
}

interface SimulatorSourceOptions {
  intervalMs?: number
  dt?: number
}

export class SimulatorSource implements MetricsSource {
  private simState = createSimState()
  private subs = new Set<MetricsSubscriber>()
  private interval: number | null = null
  private intervalMs: number
  private dt: number
  private started = false

  constructor(opts: SimulatorSourceOptions = {}) {
    this.intervalMs = opts.intervalMs ?? 50
    this.dt = opts.dt ?? 0.05
  }

  private emit() {
    const m = simMetrics(this.simState)
    const leakedIdx = this.simState.windows.findIndex(w => w.state === 'leaked')
    const alert = computeAlert(m, { leakedIndex: leakedIdx, mdbUp: this.simState.mdbUp })
    const payload = { metrics: m, alert, scenario: this.simState.scenario as ScenarioName }
    for (const sub of this.subs) {
      sub(payload)
    }
  }

  start(): void {
    if (this.started) return
    this.started = true
    if (this.interval !== null) {
      window.clearInterval(this.interval)
      this.interval = null
    }
    this.interval = window.setInterval(() => {
      simStep(this.simState, this.dt)
      this.emit()
    }, this.intervalMs)
  }

  stop(): void {
    this.started = false
    if (this.interval !== null) {
      window.clearInterval(this.interval)
      this.interval = null
    }
  }

  setScenario(sc: ScenarioName): void {
    setScenario(this.simState, sc)
    this.emit()
  }

  reset(): void {
    resetAll(this.simState)
    this.emit()
  }

  subscribe(sub: MetricsSubscriber): () => void {
    this.subs.add(sub)
    this.emit()
    return () => {
      this.subs.delete(sub)
    }
  }
}
