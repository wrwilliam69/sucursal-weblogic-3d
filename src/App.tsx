import { Canvas } from '@react-three/fiber'
import { OrthographicCamera } from '@react-three/drei'

function Scene() {
  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[8, 12, 6]} intensity={1.1} castShadow />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#dfe8f3" />
      </mesh>
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>
    </>
  )
}

export default function App() {
  return (
    <Canvas shadows orthographic>
      <OrthographicCamera
        makeDefault
        position={[12, 12, 12]}
        zoom={80}
        near={0.1}
        far={1000}
        onUpdate={(camera) => camera.lookAt(0, 0, 0)}
      />
      <color attach="background" args={['#eef3f9']} />
      <Scene />
    </Canvas>
  )
}
