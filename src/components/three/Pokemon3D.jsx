import { useRef, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, useGLTF } from '@react-three/drei'
import * as THREE from 'three'

/**
 * Pokemon3D - Enhanced 3D Pokémon with personality animations
 * Supports idle, hover, click, and scroll-reactive animations
 */
const Pokemon3D = ({
  name,
  position = [0, 0, 0],
  scale = 1,
  variant = 'normal', // 'normal' or 'shiny'
  onHover,
  onClick,
  scrollSpeed = 0,
  ...props
}) => {
  const groupRef = useRef()
  const meshRef = useRef()
  const [isHovered, setIsHovered] = useState(false)
  const [animationState, setAnimationState] = useState('idle') // idle, hover, click
  const timeRef = useRef(0)

  // Animation state management
  useEffect(() => {
    if (isHovered && animationState !== 'click') {
      setAnimationState('hover')
    } else if (!isHovered && animationState !== 'click') {
      setAnimationState('idle')
    }
  }, [isHovered, animationState])

  useFrame((state, delta) => {
    if (!groupRef.current) return

    timeRef.current += delta

    // Base idle animation - breathing effect
    if (animationState === 'idle') {
      const breath = Math.sin(timeRef.current * 1.5) * 0.05
      groupRef.current.scale.setScalar(scale + breath)
      
      // Subtle floating
      groupRef.current.position.y = position[1] + Math.sin(timeRef.current * 0.8) * 0.1
      
      // Slow rotation
      groupRef.current.rotation.y += delta * 0.1
    }

    // Hover animation - slight grow and glow
    if (animationState === 'hover') {
      const hoverScale = scale * 1.1
      groupRef.current.scale.lerp(new THREE.Vector3(hoverScale, hoverScale, hoverScale), 0.1)
      groupRef.current.position.y = position[1] + 0.2
      
      // More active rotation
      groupRef.current.rotation.y += delta * 0.3
    }

    // Click animation - dramatic pose (signature move)
    if (animationState === 'click') {
      groupRef.current.rotation.y += delta * 2
      const clickScale = scale * 1.3
      groupRef.current.scale.lerp(new THREE.Vector3(clickScale, clickScale, clickScale), 0.15)
      
      // Reset after animation
      if (timeRef.current > 1) {
        setAnimationState('idle')
        timeRef.current = 0
      }
    }

    // Scroll-reactive movement
    if (scrollSpeed > 0) {
      groupRef.current.position.x += Math.sin(timeRef.current * scrollSpeed) * 0.02
      groupRef.current.rotation.z = Math.sin(timeRef.current * scrollSpeed * 2) * 0.1
    }
  })

  const handlePointerOver = (e) => {
    e.stopPropagation()
    setIsHovered(true)
    if (onHover) onHover(name)
  }

  const handlePointerOut = () => {
    setIsHovered(false)
  }

  const handleClick = (e) => {
    e.stopPropagation()
    setAnimationState('click')
    timeRef.current = 0
    if (onClick) onClick(name)
  }

  // Placeholder geometry (replace with actual GLTF model when available)
  return (
    <group
      ref={groupRef}
      position={position}
      scale={scale}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
      {...props}
    >
      {/* Glow effect when hovered */}
      {isHovered && (
        <mesh>
          <sphereGeometry args={[1.5, 32, 32]} />
          <meshBasicMaterial
            color={variant === 'shiny' ? '#FFD700' : '#8b5cf6'}
            transparent
            opacity={0.2}
            side={THREE.BackSide}
          />
        </mesh>
      )}

      {/* Main Pokémon geometry - placeholder sphere with texture suggestion */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color={variant === 'shiny' ? '#FFD700' : '#ff6b6b'}
          metalness={0.3}
          roughness={0.4}
          emissive={isHovered ? (variant === 'shiny' ? '#FFD700' : '#8b5cf6') : '#000000'}
          emissiveIntensity={isHovered ? 0.3 : 0}
        />
      </mesh>

      {/* Eye blink animation */}
      {animationState === 'hover' && (
        <mesh position={[0.3, 0.3, 0.9]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshBasicMaterial color="#000" />
        </mesh>
      )}

      {/* Name label */}
      {isHovered && (
        <Text
          position={[0, -1.5, 0]}
          fontSize={0.3}
          color={variant === 'shiny' ? '#FFD700' : '#fff'}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000"
        >
          {name}
        </Text>
      )}
    </group>
  )
}

export default Pokemon3D

