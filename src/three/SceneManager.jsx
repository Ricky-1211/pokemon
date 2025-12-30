import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * SceneManager - Manages global Three.js scene state
 * Handles lighting, environment, and scene-wide effects
 */
export const SceneManager = ({ children, environment = 'sunset', enableFog = true }) => {
  const { scene } = useThree()

  useEffect(() => {
    // Scene background
    scene.background = new THREE.Color(0x0a0a0a)

    // Add fog for depth
    if (enableFog) {
      scene.fog = new THREE.FogExp2(0x0a0a0a, 0.02)
    }

    return () => {
      scene.fog = null
    }
  }, [scene, enableFog])

  return <>{children}</>
}

export default SceneManager

