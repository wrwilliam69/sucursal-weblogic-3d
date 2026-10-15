import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import type { Group, Mesh } from 'three'
import { useStore } from '../store/useStore'
import { WINDOW_COUNT, WIN_X, VAULT_POS, COUNTER_Z } from '../data/layout'

const DOOR_Z = VAULT_POS.z + 0.65
const WHEEL_Z = VAULT_POS.z + 0.75
const PACKET_START_Z = COUNTER_Z - 1.4

export default function Vault() {
  const wheelRef = useRef<Group>(null)
  const packetRefs = useRef<(Mesh | null)[]>([])
  const trailRefs = useRef<(Mesh | null)[]>([])

  const reduce = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  )

  useFrame(({ clock }) => {
    const { windows } = useStore.getState()
    const t = clock.getElapsedTime()

    if (wheelRef.current && !reduce) wheelRef.current.rotation.z = t * 0.5

    for (let i = 0; i < WINDOW_COUNT; i++) {
      const packet = packetRefs.current[i]
      const trail = trailRefs.current[i]
      const busy = windows[i] === 'busy'

      if (packet) {
        packet.visible = busy
        if (busy) {
          const x = WIN_X(i)
          if (reduce) {
            packet.position.set(x, 0.5, PACKET_START_Z)
          } else {
            const k = (Math.sin(t * 3 + i) + 1) / 2
            packet.position.set(
              x + (VAULT_POS.x - x) * k * 0.9,
              0.5 + Math.sin(k * Math.PI) * 0.6,
              PACKET_START_Z - k * 1.0
            )
          }
        }
      }

      if (trail) {
        trail.visible = busy
        if (busy) {
          const x = WIN_X(i)
          if (reduce) {
            trail.position.set(x, 0.5, PACKET_START_Z)
          } else {
            const k = Math.max(0, (Math.sin(t * 3 + i) + 1) / 2 - 0.08)
            trail.position.set(
              x + (VAULT_POS.x - x) * k * 0.9,
              0.5 + Math.sin(k * Math.PI) * 0.6,
              PACKET_START_Z - k * 1.0
            )
          }
        }
      }
    }
  })

  return (
    <group>
      <RoundedBox
        args={[3.2, 2.0, 1.2]}
        radius={0.12}
        smoothness={4}
        position={[VAULT_POS.x, 1.0, VAULT_POS.z]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color="#c9d6e6" roughness={0.25} metalness={0.25} />
      </RoundedBox>

      <mesh position={[VAULT_POS.x, 1.05, DOOR_Z]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.62, 0.62, 0.14, 24]} />
        <meshStandardMaterial color="#e6ecf5" roughness={0.3} metalness={0.35} />
      </mesh>

      <group ref={wheelRef} position={[VAULT_POS.x, 1.05, WHEEL_Z]}>
        <mesh castShadow>
          <boxGeometry args={[0.7, 0.08, 0.08]} />
          <meshStandardMaterial color="#dbe3ef" roughness={0.4} metalness={0.35} />
        </mesh>
        <mesh castShadow>
          <boxGeometry args={[0.08, 0.7, 0.08]} />
          <meshStandardMaterial color="#dbe3ef" roughness={0.4} metalness={0.35} />
        </mesh>
      </group>

      {Array.from({ length: WINDOW_COUNT }, (_, i) => (
        <group key={i}>
          <RoundedBox
            ref={el => {
              trailRefs.current[i] = el
            }}
            args={[0.32, 0.32, 0.32]}
            radius={0.05}
            smoothness={4}
            position={[WIN_X(i), 0.5, PACKET_START_Z]}
            castShadow={false}
            visible={false}
          >
            <meshStandardMaterial color="#36b37e" roughness={0.5} metalness={0} emissive="#36b37e" emissiveIntensity={0.08} transparent opacity={0.18} />
          </RoundedBox>
          <RoundedBox
            ref={el => {
              packetRefs.current[i] = el
            }}
            args={[0.32, 0.32, 0.32]}
            radius={0.05}
            smoothness={4}
            position={[WIN_X(i), 0.5, PACKET_START_Z]}
            castShadow
            visible={false}
          >
            <meshStandardMaterial color="#36b37e" roughness={0.5} metalness={0} emissive="#36b37e" emissiveIntensity={0.18} />
          </RoundedBox>
        </group>
      ))}
    </group>
  )
}
