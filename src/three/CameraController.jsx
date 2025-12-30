import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { gsap } from 'gsap'
import * as THREE from 'three'

/**
 * CameraController - Cinematic camera system with parallax and smooth transitions
 * Supports mouse parallax, scroll-based paths, and dramatic zooms
 */
export const CameraController = ({
  targetPosition = [0, 0, 5],
  targetLookAt = [0, 0, 0],
  enableMouseParallax = true,
  parallaxStrength = 0.5,
  smoothness = 0.1,
}) => {
  const { camera } = useThree()
  const targetPosRef = useRef(new THREE.Vector3(...targetPosition))
  const targetLookAtRef = useRef(new THREE.Vector3(...targetLookAt))
  const mouseRef = useRef({ x: 0, y: 0 })
  const isAnimatingRef = useRef(false)

  // Update target position from props
  useEffect(() => {
    targetPosRef.current.set(...targetPosition)
    targetLookAtRef.current.set(...targetLookAt)
  }, [targetPosition, targetLookAt])

  // Mouse parallax effect
  useEffect(() => {
    if (!enableMouseParallax) return

    const handleMouseMove = (e) => {
      const { innerWidth, innerHeight } = window
      mouseRef.current.x = (e.clientX / innerWidth - 0.5) * 2
      mouseRef.current.y = (e.clientY / innerHeight - 0.5) * -2
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [enableMouseParallax])

  // Smooth camera movement
  useFrame(() => {
    if (isAnimatingRef.current) return

    // Lerp camera position
    camera.position.lerp(targetPosRef.current, smoothness)

    // Apply mouse parallax offset
    if (enableMouseParallax) {
      const parallaxOffset = new THREE.Vector3(
        mouseRef.current.x * parallaxStrength,
        mouseRef.current.y * parallaxStrength,
        0
      )
      camera.position.add(parallaxOffset)
    }

    // Smooth look-at using lookAt method with lerped target
    const lookAtTarget = targetLookAtRef.current.clone()
    if (enableMouseParallax) {
      lookAtTarget.add(
        new THREE.Vector3(
          mouseRef.current.x * parallaxStrength * 0.5,
          mouseRef.current.y * parallaxStrength * 0.5,
          0
        )
      )
    }

    // Use Three.js lookAt for smooth rotation
    camera.lookAt(lookAtTarget)
  })

  // Public methods for dramatic camera movements
  const animateTo = (position, lookAt, duration = 2, ease = 'power2.inOut') => {
    isAnimatingRef.current = true

    gsap.to(targetPosRef.current, {
      x: position[0],
      y: position[1],
      z: position[2],
      duration,
      ease,
      onComplete: () => {
        isAnimatingRef.current = false
      },
    })

    if (lookAt) {
      gsap.to(targetLookAtRef.current, {
        x: lookAt[0],
        y: lookAt[1],
        z: lookAt[2],
        duration,
        ease,
      })
    }
  }

  const zoomTo = (target, duration = 1.5, zoomLevel = 2) => {
    isAnimatingRef.current = true
    const originalDistance = camera.position.distanceTo(targetPosRef.current)
    const zoomPosition = new THREE.Vector3(...target)
      .sub(new THREE.Vector3(...target).normalize().multiplyScalar(zoomLevel))

    gsap.to(targetPosRef.current, {
      x: zoomPosition.x,
      y: zoomPosition.y,
      z: zoomPosition.z,
      duration,
      ease: 'power2.out',
      onComplete: () => {
        // Zoom back out after a moment
        gsap.delayedCall(2, () => {
          gsap.to(targetPosRef.current, {
            x: targetPosition[0],
            y: targetPosition[1],
            z: targetPosition[2],
            duration: duration * 0.8,
            ease: 'power2.in',
            onComplete: () => {
              isAnimatingRef.current = false
            },
          })
        })
      },
    })

    if (target) {
      gsap.to(targetLookAtRef.current, {
        x: target[0],
        y: target[1],
        z: target[2],
        duration,
        ease: 'power2.out',
      })
    }
  }

  // Expose methods via ref (optional, for external control)
  useEffect(() => {
    camera.userData.animateTo = animateTo
    camera.userData.zoomTo = zoomTo
    return () => {
      delete camera.userData.animateTo
      delete camera.userData.zoomTo
    }
  }, [camera])

  return null
}

export default CameraController

