import { describe, it, expect } from 'vitest'
import { computeAlert, WIN_X, ENG_HOME } from './alerts'
import type { Metrics } from './types'

const baseMetrics = (): Metrics => ({
  ActiveConnectionsCurrentCount: 1,
  CurrCapacity: 6,
  NumAvailable: 5,
  WaitingForConnectionCurrentCount: 1,
  LeakedConnectionCount: 0,
  ActiveConnectionsHighCount: 1,
  QueueLength: 1,
  ExecuteThreadIdleCount: 10,
  HoggingThreadCount: 0,
  StuckThreadCount: 0,
  MessagesCurrentCount: 0,
  MessagesPendingCount: 0,
  MessagesReceivedCount: 0,
  ConsumersCurrentCount: 1,
  ErrorMessagesCurrentCount: 0
})

describe('computeAlert', () => {
  it('normal: ok', () => {
    const m = baseMetrics()
    const a = computeAlert(m, { leakedIndex: -1, mdbUp: true })
    expect(a.level).toBe('ok')
    expect(a.at).toEqual(ENG_HOME)
  })

  it('hora pico: warn cuando WaitingForConnectionCurrentCount > 4', () => {
    const m = baseMetrics()
    m.WaitingForConnectionCurrentCount = 5
    m.QueueLength = 5
    const a = computeAlert(m, { leakedIndex: -1, mdbUp: true })
    expect(a.level).toBe('warn')
    expect(a.at).toEqual({ x: -1.5, y: 0, z: 3.6 })
  })

  it('fuga de conexiones: crit y apunta a ventanilla con fugas', () => {
    const m = baseMetrics()
    m.LeakedConnectionCount = 2
    const a = computeAlert(m, { leakedIndex: 3, mdbUp: true })
    expect(a.level).toBe('crit')
    expect(a.at).toEqual({ x: WIN_X(3), y: 0, z: 0.2 })
    expect(a.at.x).toBe(-4.5 + 3 * 1.6)
  })

  it('consumidor JMS caído: crit cuando mdbUp false y MessagesCurrentCount > 4', () => {
    const m = baseMetrics()
    m.MessagesCurrentCount = 6
    m.ConsumersCurrentCount = 0
    const a = computeAlert(m, { leakedIndex: -1, mdbUp: false })
    expect(a.level).toBe('crit')
    expect(a.at).toEqual({ x: 4.5, y: 0, z: -2.4 })
  })
})
