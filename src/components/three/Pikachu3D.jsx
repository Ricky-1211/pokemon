import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

/**
 * Pikachu3D - Pikachu with type transformations
 * Types: 'normal', 'electric', 'thunderbolt'
 */
const Pikachu3D = ({
  position = [0, 0, 0],
  scale = 1,
  type = 'normal', // 'normal', 'electric', 'thunderbolt'
  scrollProgress = 0,
  ...props
}) => {
  const groupRef = useRef()
  const bodyRef = useRef()
  const tailRef = useRef()
  const earLeftRef = useRef()
  const earRightRef = useRef()
  const cheekLeftRef = useRef()
  const cheekRightRef = useRef()
  const timeRef = useRef(0)

  // Type-based colors and effects
  const typeConfig = {
    normal: {
      bodyColor: '#FFD700',
      cheekColor: '#FF6B6B',
      emissive: '#000000',
      emissiveIntensity: 0,
      glow: false,
    },
    electric: {
      bodyColor: '#FFEB3B',
      cheekColor: '#FF6B6B',
      emissive: '#FFEB3B',
      emissiveIntensity: 0.3,
      glow: true,
    },
    thunderbolt: {
      bodyColor: '#FFFF00',
      cheekColor: '#FF1744',
      emissive: '#FFFF00',
      emissiveIntensity: 0.8,
      glow: true,
    },
  }

  const config = typeConfig[type] || typeConfig.normal

  useFrame((state, delta) => {
    if (!groupRef.current) return

    timeRef.current += delta

    // Base floating animation
    const floatY = Math.sin(timeRef.current * 1.2) * 0.15
    groupRef.current.position.y = position[1] + floatY

    // Tail wagging
    if (tailRef.current) {
      tailRef.current.rotation.z = Math.sin(timeRef.current * 2) * 0.3
    }

    // Ears twitching
    if (earLeftRef.current) {
      earLeftRef.current.rotation.z = Math.sin(timeRef.current * 1.5) * 0.1
    }
    if (earRightRef.current) {
      earRightRef.current.rotation.z = -Math.sin(timeRef.current * 1.5) * 0.1
    }

    // Cheek sparkles for electric types
    if (type !== 'normal' && cheekLeftRef.current && cheekRightRef.current) {
      const sparkle = Math.sin(timeRef.current * 5) * 0.5 + 0.5
      cheekLeftRef.current.scale.setScalar(1 + sparkle * 0.2)
      cheekRightRef.current.scale.setScalar(1 + sparkle * 0.2)
    }

    // Thunderbolt effect - pulsing glow
    if (type === 'thunderbolt') {
      const pulse = Math.sin(timeRef.current * 8) * 0.3 + 0.7
      if (bodyRef.current?.material) {
        bodyRef.current.material.emissiveIntensity = config.emissiveIntensity * pulse
      }
    }

    // Subtle rotation
    groupRef.current.rotation.y += delta * 0.2
  })

  return (
    <group ref={groupRef} position={position} scale={scale} {...props}>
      {/* Glow effect for electric types */}
      {config.glow && (
        <mesh>
          <sphereGeometry args={[1.8, 32, 32]} />
          <meshBasicMaterial
            color={config.bodyColor}
            transparent
            opacity={type === 'thunderbolt' ? 0.4 : 0.2}
            side={THREE.BackSide}
          />
        </mesh>
      )}

      {/* Thunderbolt icon for thunderbolt type */}
      {type === 'thunderbolt' && (
        <mesh position={[0, 2, 0]}>
          <boxGeometry args={[0.1, 0.6, 0.1]} />
          <meshBasicMaterial color="#FFFF00" emissive="#FFFF00" emissiveIntensity={1} />
        </mesh>
      )}

      {/* Body - Main sphere */}
      <mesh ref={bodyRef} position={[0, 0, 0]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color={config.bodyColor}
          metalness={0.2}
          roughness={0.6}
          emissive={config.emissive}
          emissiveIntensity={config.emissiveIntensity}
        />
      </mesh>

      {/* Head - Slightly larger sphere */}
      <mesh position={[0, 0.8, 0]}>
        <sphereGeometry args={[0.9, 32, 32]} />
        <meshStandardMaterial
          color={config.bodyColor}
          metalness={0.2}
          roughness={0.6}
          emissive={config.emissive}
          emissiveIntensity={config.emissiveIntensity}
        />
      </mesh>

      {/* Left Ear */}
      <group ref={earLeftRef} position={[-0.4, 1.2, 0]} rotation={[-0.3, -0.2, 0.3]}>
        <mesh>
          <coneGeometry args={[0.15, 0.6, 8]} />
          <meshStandardMaterial
            color={config.bodyColor}
            metalness={0.2}
            roughness={0.6}
            emissive={config.emissive}
            emissiveIntensity={config.emissiveIntensity * 0.5}
          />
        </mesh>
        <mesh position={[0, 0.3, 0]}>
          <coneGeometry args={[0.1, 0.3, 8]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
      </group>

      {/* Right Ear */}
      <group ref={earRightRef} position={[0.4, 1.2, 0]} rotation={[-0.3, 0.2, -0.3]}>
        <mesh>
          <coneGeometry args={[0.15, 0.6, 8]} />
          <meshStandardMaterial
            color={config.bodyColor}
            metalness={0.2}
            roughness={0.6}
            emissive={config.emissive}
            emissiveIntensity={config.emissiveIntensity * 0.5}
          />
        </mesh>
        <mesh position={[0, 0.3, 0]}>
          <coneGeometry args={[0.1, 0.3, 8]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
      </group>

      {/* Eyes */}
      <mesh position={[-0.3, 0.9, 0.7]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      <mesh position={[0.3, 0.9, 0.7]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* Nose */}
      <mesh position={[0, 0.7, 0.8]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* Mouth */}
      <mesh position={[0, 0.5, 0.75]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.1, 0.03, 8, 16, Math.PI]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* Left Cheek */}
      <mesh ref={cheekLeftRef} position={[-0.7, 0.6, 0.5]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial
          color={config.cheekColor}
          emissive={type !== 'normal' ? config.cheekColor : '#000000'}
          emissiveIntensity={type === 'thunderbolt' ? 0.8 : type === 'electric' ? 0.4 : 0}
        />
      </mesh>

      {/* Right Cheek */}
      <mesh ref={cheekRightRef} position={[0.7, 0.6, 0.5]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial
          color={config.cheekColor}
          emissive={type !== 'normal' ? config.cheekColor : '#000000'}
          emissiveIntensity={type === 'thunderbolt' ? 0.8 : type === 'electric' ? 0.4 : 0}
        />
      </mesh>

      {/* Tail */}
      <group ref={tailRef} position={[0, -0.5, -0.8]}>
        <mesh>
          <boxGeometry args={[0.3, 0.8, 0.3]} />
          <meshStandardMaterial
            color={config.bodyColor}
            metalness={0.2}
            roughness={0.6}
            emissive={config.emissive}
            emissiveIntensity={config.emissiveIntensity * 0.7}
          />
        </mesh>
        <mesh position={[0, -0.6, 0]}>
          <boxGeometry args={[0.2, 0.6, 0.2]} />
          <meshStandardMaterial
            color={config.bodyColor}
            metalness={0.2}
            roughness={0.6}
            emissive={config.emissive}
            emissiveIntensity={config.emissiveIntensity * 0.7}
          />
        </mesh>
        <mesh position={[0, -1.1, 0]} rotation={[0, 0, 0.5]}>
          <boxGeometry args={[0.15, 0.5, 0.15]} />
          <meshStandardMaterial
            color={config.bodyColor}
            metalness={0.2}
            roughness={0.6}
            emissive={config.emissive}
            emissiveIntensity={config.emissiveIntensity * 0.7}
          />
        </mesh>
      </group>

      {/* Arms */}
      <mesh position={[-0.6, 0.2, 0.5]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial
          color={config.bodyColor}
          metalness={0.2}
          roughness={0.6}
          emissive={config.emissive}
          emissiveIntensity={config.emissiveIntensity * 0.5}
        />
      </mesh>
      <mesh position={[0.6, 0.2, 0.5]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial
          color={config.bodyColor}
          metalness={0.2}
          roughness={0.6}
          emissive={config.emissive}
          emissiveIntensity={config.emissiveIntensity * 0.5}
        />
      </mesh>

      {/* Legs */}
      <mesh position={[-0.4, -0.8, 0.3]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial
          color={config.bodyColor}
          metalness={0.2}
          roughness={0.6}
          emissive={config.emissive}
          emissiveIntensity={config.emissiveIntensity * 0.5}
        />
      </mesh>
      <mesh position={[0.4, -0.8, 0.3]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial
          color={config.bodyColor}
          metalness={0.2}
          roughness={0.6}
          emissive={config.emissive}
          emissiveIntensity={config.emissiveIntensity * 0.5}
        />
      </mesh>

      {/* Drop shadow for electric types */}
      {type !== 'normal' && (
        <mesh position={[0, -1.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.5, 32]} />
          <meshBasicMaterial
            color={config.bodyColor}
            transparent
            opacity={0.3}
          />
        </mesh>
      )}
    </group>
  )
}

export default Pikachu3D

