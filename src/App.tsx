import { useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { ContactShadows, Environment, Lightformer, OrbitControls, OrthographicCamera } from '@react-three/drei'
import Branch from './scene/Branch'
import Windows from './scene/Windows'
import Vault from './scene/Vault'
import { useStore } from './store/useStore'

const ISO_POLAR = Math.atan(Math.SQRT2)
const CAM_RADIUS = 26
const CAM_AZIMUTH = Math.PI / 4
const AZIMUTH_LIMIT = 1.1
const TARGET: [number, number, number] = [0, 0.6, -0.25]

const camX = TARGET[0] + CAM_RADIUS * Math.sin(ISO_POLAR) * Math.sin(CAM_AZIMUTH)
const camY = TARGET[1] + CAM_RADIUS * Math.cos(ISO_POLAR)
const camZ = TARGET[2] + CAM_RADIUS * Math.sin(ISO_POLAR) * Math.cos(CAM_AZIMUTH)

function Scene() {
  return (
    <>
      <ambientLight intensity={0.35} />
      <hemisphereLight args={['#ffffff', '#8d9ab0', 0.45]} />
      <directionalLight
        castShadow
        position={[8, 16, 10]}
        intensity={1}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
        shadow-camera-near={1}
        shadow-camera-far={50}
      />

      <group position={[0, 0, 0]} scale={0.8}>
        <Branch />
        <Windows />
        <Vault />
      </group>

      <ContactShadows position={[0, 0.02, -0.25]} opacity={0.32} scale={34} blur={2.4} far={5} resolution={512} color="#5a6b82" />

      <Environment resolution={256} frames={1}>
        <Lightformer intensity={0.35} position={[0, 6, -9]} scale={[12, 12, 1]} />
        <Lightformer intensity={0.2} position={[-8, 4, -1]} rotation-y={Math.PI / 2} scale={[10, 4, 1]} />
        <Lightformer intensity={0.2} position={[8, 4, -1]} rotation-y={-Math.PI / 2} scale={[10, 4, 1]} />
        <Lightformer intensity={0.15} position={[0, 9, 0]} rotation-x={-Math.PI / 2} scale={[12, 12, 1]} />
      </Environment>
    </>
  )
}

export default function App() {
  useEffect(() => {
    useStore.getState().start()
    if (import.meta.env.DEV) {
      ;(window as Window & { sucursal?: typeof useStore }).sucursal = useStore
    }
    return () => useStore.getState().stop()
  }, [])

  return (
    <Canvas shadows orthographic>
      <OrthographicCamera makeDefault position={[camX, camY, camZ]} zoom={70} near={0.1} far={200} />
      <OrbitControls
        makeDefault
        target={TARGET}
        enablePan={false}
        enableZoom
        minZoom={32}
        maxZoom={90}
        minPolarAngle={ISO_POLAR}
        maxPolarAngle={ISO_POLAR}
        minAzimuthAngle={CAM_AZIMUTH - AZIMUTH_LIMIT}
        maxAzimuthAngle={CAM_AZIMUTH + AZIMUTH_LIMIT}
        enableDamping
        dampingFactor={0.12}
        rotateSpeed={0.6}
      />
      <color attach="background" args={['#eef3f9']} />
      <Scene />
    </Canvas>
  )
}
