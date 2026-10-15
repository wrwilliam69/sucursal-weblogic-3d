import { RoundedBox, Text } from '@react-three/drei'

const PALETTE = {
  floor: '#fffaf2',
  grid: '#f0e9d6',
  wallBack: '#ffffff',
  wallSide: '#ffffff',
  trim: '#3f6fd6',
  sign: '#24407e',
  mat: '#9fb4d6',
  pot: '#b98a5a',
  foliage: '#3e9b68'
}

interface SolidProps {
  size: [number, number, number]
  position: [number, number, number]
  color: string
  radius?: number
  smoothness?: number
  cast?: boolean
}

function Solid({ size, position, color, radius = 0.06, smoothness = 4, cast = true }: SolidProps) {
  return (
    <RoundedBox
      args={size}
      radius={Math.min(radius, Math.min(size[0], size[1], size[2]) / 2 - 0.001)}
      smoothness={smoothness}
      position={position}
      castShadow={cast}
      receiveShadow
    >
      <meshStandardMaterial color={color} roughness={0.85} metalness={0} />
    </RoundedBox>
  )
}

function Room() {
  const gridLines = []
  for (let x = -7; x <= 7; x += 1) {
    gridLines.push(
      <Solid key={x} size={[0.04, 0.01, 10.4]} position={[x, 0.01, -0.25]} color={PALETTE.grid} radius={0.004} smoothness={2} cast={false} />
    )
  }

  return (
    <group>
      <Solid size={[15, 0.3, 10.5]} position={[0, -0.15, -0.25]} color={PALETTE.floor} radius={0.08} />
      {gridLines}
      <Solid size={[15, 2.6, 0.3]} position={[0, 1.3, -5.35]} color={PALETTE.wallBack} radius={0.1} />
      <Solid size={[0.3, 2.6, 10.5]} position={[-7.35, 1.3, -0.25]} color={PALETTE.wallSide} radius={0.1} />
      <Solid size={[15, 0.25, 0.32]} position={[0, 2.6, -5.35]} color={PALETTE.trim} radius={0.06} />
      <Solid size={[0.32, 0.25, 10.5]} position={[-7.35, 2.6, -0.25]} color={PALETTE.trim} radius={0.06} />
    </group>
  )
}

function Sign() {
  return (
    <group>
      <Solid size={[4.4, 0.7, 0.12]} position={[-2, 2.0, -5.15]} color={PALETTE.sign} radius={0.05} />
      <Text
        position={[-2, 2.0, -5.09]}
        fontSize={0.25}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        font="/fonts/kenpixel.ttf"
        letterSpacing={0.08}
      >
        SUCURSAL WEBLOGIC
      </Text>
    </group>
  )
}

function Entrance() {
  return (
    <group>
      <Solid size={[1.6, 0.04, 1.6]} position={[-6.4, 0.02, 4.1]} color={PALETTE.mat} radius={0.015} cast={false} />
      <Solid size={[0.2, 1.6, 0.2]} position={[-7.1, 0.8, 4.9]} color={PALETTE.trim} radius={0.06} />
      <Solid size={[0.2, 1.6, 0.2]} position={[-5.7, 0.8, 4.9]} color={PALETTE.trim} radius={0.06} />
      <Solid size={[1.6, 0.2, 0.2]} position={[-6.4, 1.7, 4.9]} color={PALETTE.trim} radius={0.06} />
    </group>
  )
}

function Plant({ position }: { position: [number, number] }) {
  const [x, z] = position
  return (
    <group>
      <Solid size={[0.5, 0.5, 0.5]} position={[x, 0.25, z]} color={PALETTE.pot} radius={0.12} />
      <Solid size={[0.6, 0.7, 0.6]} position={[x, 0.85, z]} color={PALETTE.foliage} radius={0.14} />
    </group>
  )
}

export default function Branch() {
  return (
    <group>
      <Room />
      <Sign />
      <Entrance />
      <Plant position={[-6.6, -4.6]} />
      <Plant position={[6.6, 4.4]} />
    </group>
  )
}
