import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const Pokeball3D = () => {
  const groupRef = useRef()

  useFrame((state) => {
    if (groupRef.current) {
      // Subtle floating animation
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.2
      // Rotation
      groupRef.current.rotation.y += 0.005
    }
  })

  return (
    <group ref={groupRef}>
      {/* Top half (red) */}
      <mesh position={[0, 0.5, 0]}>
        <sphereGeometry args={[1, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#FF0000" metalness={0.3} roughness={0.2} />
      </mesh>

      {/* Bottom half (white) */}
      <mesh position={[0, -0.5, 0]} rotation={[Math.PI, 0, 0]}>
        <sphereGeometry args={[1, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#FFFFFF" metalness={0.3} roughness={0.2} />
      </mesh>

      {/* Center band (black) */}
      <mesh position={[0, 0, 0]}>
        <torusGeometry args={[1, 0.1, 16, 32, Math.PI]} />
        <meshStandardMaterial color="#000000" metalness={0.5} roughness={0.1} />
      </mesh>

      {/* Center button */}
      <mesh position={[0, 0, 1.05]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#FFFFFF" metalness={0.8} roughness={0.1} />
      </mesh>

      {/* Inner button ring */}
      <mesh position={[0, 0, 1.05]}>
        <ringGeometry args={[0.15, 0.2, 32]} />
        <meshStandardMaterial color="#000000" side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

export default Pokeball3D

