export type WindowState = 'idle' | 'busy' | 'leaked'

export type ScenarioName = 'normal' | 'peak' | 'leak' | 'mdb' | 'reset'

export type AlertLevel = 'ok' | 'warn' | 'crit'

export interface JdbcMetrics {
  ActiveConnectionsCurrentCount: number
  CurrCapacity: number
  NumAvailable: number
  WaitingForConnectionCurrentCount: number
  LeakedConnectionCount: number
  ActiveConnectionsHighCount: number
}

export interface WorkManagerMetrics {
  QueueLength: number
  ExecuteThreadIdleCount: number
  HoggingThreadCount: number
  StuckThreadCount: number
}

export interface JmsMetrics {
  MessagesCurrentCount: number
  MessagesPendingCount: number
  MessagesReceivedCount: number
  ConsumersCurrentCount: number
  ErrorMessagesCurrentCount: number
}

export type Metrics = JdbcMetrics & WorkManagerMetrics & JmsMetrics

export interface ScenePoint {
  x: number
  y: number
  z: number
}

export interface Alert {
  level: AlertLevel
  who: string
  message: string
  runbook: string
  engineer: string
  at: ScenePoint
}
