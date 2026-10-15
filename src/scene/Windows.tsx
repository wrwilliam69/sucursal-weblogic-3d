import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import type { Group, Mesh, MeshStandardMaterial } from 'three'
import Chibi from './Chibi'
import { useStore } from '../store/useStore'
import { WINDOW_COUNT, WIN_X, COUNTER_Z } from '../data/layout'
import type { WindowState } from '../data/types'

const COLORS: Record<WindowState, string> = {
  idle: '#9aa8ba',
  busy: '#36b37e',
  leaked: '#e5484d'
}

const SHIRT = '#2f63d6'
const HAIRS = ['#2b1a12', '#6e3b1f', '#d9a441', '#1e1e28', '#a34a2a']

interface SolidProps {
  size: [number, number, number]
  position: [number, number, number]
  color: string
  radius?: number
}

function Solid({ size, position, color, radius = 0.05 }: SolidProps) {
  return (
    <RoundedBox
      args={size}
      radius={Math.min(radius, Math.min(size[0], size[1], size[2]) / 2 - 0.001)}
      smoothness={4}
      position={position}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial color={color} roughness={0.85} metalness={0} />
    </RoundedBox>
  )
}

export default function Windows() {
  const signRefs = useRef<(Mesh | null)[]>([])
  const folderRefs = useRef<(Mesh | null)[]>([])
  const cashierRefs = useRef<(Group | null)[]>([])

  const reduce = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  )

  useFrame(({ clock }) => {
    const { windows } = useStore.getState()
    const t = clock.getElapsedTime()
    for (let i = 0; i < WINDOW_COUNT; i++) {
      const state: WindowState = windows[i] ?? 'idle'

      const sign = signRefs.current[i]
      if (sign) (sign.material as MeshStandardMaterial).color.set(COLORS[state])

      const folder = folderRefs.current[i]
      if (folder) folder.visible = state === 'leaked'

      const cashier = cashierRefs.current[i]
      if (cashier) {
        const bob = !reduce && state === 'busy' ? Math.abs(Math.sin(t * 5 + i)) * 0.05 : 0
        cashier.position.y = bob
        cashier.rotation.z = !reduce && state === 'leaked' ? 0.18 : 0
      }
    }
  })

  const windows = Array.from({ length: WINDOW_COUNT }, (_, i) => i)

  return (
    <group>
      <Solid size={[10.2, 0.9, 0.7]} position={[-0.5, 0.45, COUNTER_Z]} color="#f4f6fa" />
      <Solid size={[10.2, 0.08, 0.8]} position={[-0.5, 0.94, COUNTER_Z]} color="#3f6fd6" radius={0.03} />

      {windows.map(i => {
        const x = WIN_X(i)
        return (
          <group key={i}>
            <Solid size={[0.08, 0.8, 0.5]} position={[x - 0.78, 1.38, COUNTER_Z]} color="#c4d1e4" radius={0.03} />

            <mesh position={[x, 1.35, COUNTER_Z + 0.15]}>
              <boxGeometry args={[1.4, 0.7, 0.04]} />
              <meshStandardMaterial color="#bfe0ff" transparent opacity={0.35} roughness={0.1} metalness={0} />
            </mesh>

            <RoundedBox
              ref={el => {
                signRefs.current[i] = el
              }}
              args={[0.9, 0.26, 0.08]}
              radius={0.03}
              smoothness={4}
              position={[x, 1.95, COUNTER_Z]}
              castShadow
            >
              <meshStandardMaterial color={COLORS.idle} roughness={0.5} metalness={0} />
            </RoundedBox>

            <Chibi
              ref={el => {
                cashierRefs.current[i] = el
              }}
              shirt={SHIRT}
              hair={HAIRS[i % HAIRS.length]}
              position={[x, 0, -2.3]}
            />

            <RoundedBox
              ref={el => {
                folderRefs.current[i] = el
              }}
              args={[0.3, 0.06, 0.22]}
              radius={0.02}
              smoothness={4}
              position={[x + 0.22, 0.98, COUNTER_Z - 0.35]}
              castShadow
              visible={false}
            >
              <meshStandardMaterial color="#d63a3f" roughness={0.7} metalness={0} />
            </RoundedBox>
          </group>
        )
      })}
    </group>
  )
}
