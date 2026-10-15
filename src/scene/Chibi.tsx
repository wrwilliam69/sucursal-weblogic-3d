import { forwardRef } from 'react'
import { RoundedBox } from '@react-three/drei'
import type { GroupProps } from '@react-three/fiber'
import type { Group } from 'three'

export interface ChibiProps extends GroupProps {
  shirt: string
  hair: string
  skin?: string
  helmet?: string
}

const PANTS = '#3b3f55'
const EYE = '#1e1628'
const DEFAULT_SKIN = '#f0c39c'

interface PartProps {
  size: [number, number, number]
  position: [number, number, number]
  color: string
  radius?: number
  rotation?: [number, number, number]
}

function Part({ size, position, color, radius = 0.04, rotation = [0, 0, 0] }: PartProps) {
  return (
    <RoundedBox
      args={size}
      radius={Math.min(radius, Math.min(size[0], size[1], size[2]) / 2 - 0.001)}
      smoothness={4}
      position={position}
      rotation={rotation}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial color={color} roughness={0.85} metalness={0} />
    </RoundedBox>
  )
}

const Chibi = forwardRef<Group, ChibiProps>(function Chibi(
  { shirt, hair, skin = DEFAULT_SKIN, helmet, ...props },
  ref
) {
  return (
    <group ref={ref} {...props} scale={1.6}>
      <Part size={[0.13, 0.2, 0.17]} position={[-0.09, 0.1, 0]} color={PANTS} />
      <Part size={[0.13, 0.2, 0.17]} position={[0.09, 0.1, 0]} color={PANTS} />

      <Part size={[0.36, 0.36, 0.28]} position={[0, 0.4, 0]} color={shirt} radius={0.07} />
      <Part size={[0.12, 0.2, 0.14]} position={[-0.27, 0.4, 0]} color={shirt} />
      <Part size={[0.12, 0.2, 0.14]} position={[0.27, 0.4, 0]} color={shirt} />
      <Part size={[0.2, 0.2, 0.2]} position={[-0.28, 0.23, 0.02]} color={skin} radius={0.07} />
      <Part size={[0.2, 0.2, 0.2]} position={[0.28, 0.23, 0.02]} color={skin} radius={0.07} />

      <Part size={[0.52, 0.46, 0.48]} position={[0, 0.79, 0]} color={skin} radius={0.09} />
      <Part size={[0.54, 0.18, 0.5]} position={[0, 1.03, -0.01]} color={hair} radius={0.06} />

      <Part size={[0.065, 0.08, 0.03]} position={[-0.11, 0.79, 0.245]} color={EYE} radius={0.01} />
      <Part size={[0.065, 0.08, 0.03]} position={[0.11, 0.79, 0.245]} color={EYE} radius={0.01} />
      <Part size={[0.13, 0.035, 0.03]} position={[-0.11, 0.85, 0.245]} color={EYE} radius={0.008} rotation={[0, 0, 0.3]} />
      <Part size={[0.13, 0.035, 0.03]} position={[0.11, 0.85, 0.245]} color={EYE} radius={0.008} rotation={[0, 0, -0.3]} />

      {helmet && (
        <>
          <Part size={[0.58, 0.2, 0.56]} position={[0, 1.06, -0.01]} color={helmet} radius={0.08} />
          <Part size={[0.62, 0.06, 0.24]} position={[0, 0.96, 0.2]} color={helmet} radius={0.03} />
        </>
      )}
    </group>
  )
})

export default Chibi
