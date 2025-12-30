import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { PerspectiveCamera, Environment, OrbitControls, Text, Float, Sparkles, Stars, Billboard, Cloud, Trail } from '@react-three/drei'
import { gsap } from 'gsap'
import * as THREE from 'three'
import SceneManager from '../../../three/SceneManager'
import CameraController from '../../../three/CameraController'
import Pikachu3D from '../../three/Pikachu3D'
import useSound from '../../../hooks/useSound'

// Legendary Pokémon Data
const LEGENDARY_POKEMON = [
  { 
    name: "MEWTWO", 
    type: "psychic", 
    color: "#8b5cf6", 
    aura: "#c4b5fd",
    description: "The Genetic Pokémon created by science",
    position: [-3, 2, 0],
    scale: 1.2,
    catchRate: 0.01
  },
  { 
    name: "RAYQUAZA", 
    type: "dragon", 
    color: "#10b981", 
    aura: "#5eead4",
    description: "Sky High Pokémon that lives in the ozone layer",
    position: [3, 1, 0],
    scale: 1.5,
    catchRate: 0.02
  },
  { 
    name: "LUGIA", 
    type: "psychic", 
    color: "#3b82f6", 
    aura: "#93c5fd",
    description: "Diving Pokémon, guardian of the sea",
    position: [0, 1.5, -3],
    scale: 1.3,
    catchRate: 0.015
  },
  { 
    name: "HO-OH", 
    type: "fire", 
    color: "#ef4444", 
    aura: "#fca5a5",
    description: "Rainbow Pokémon that brings happiness",
    position: [0, 2, 3],
    scale: 1.4,
    catchRate: 0.015
  }
]

// Legendary Orb Component
function LegendaryOrb({ position, color, aura, isActive, onClick }) {
  const meshRef = useRef()
  const [hovered, setHovered] = useState(false)
  
  useFrame((state) => {
    if (meshRef.current) {
      // Rotate and pulse animation
      meshRef.current.rotation.y += 0.01
      meshRef.current.rotation.x += 0.005
      
      // Pulsing scale
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.1 + 1
      meshRef.current.scale.setScalar(pulse)
      
      // Hover effect
      if (hovered) {
        meshRef.current.scale.multiplyScalar(1.2)
      }
    }
  })

  return (
    <group position={position}>
      {/* Main orb */}
      <mesh 
        ref={meshRef} 
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <icosahedronGeometry args={[0.8, 2]} />
        <meshStandardMaterial
          color={color}
          emissive={aura}
          emissiveIntensity={isActive ? 1 : 0.3}
          roughness={0.2}
          metalness={0.8}
          transparent
          opacity={0.9}
        />
        <Sparkles 
          count={20} 
          scale={[1.5, 1.5, 1.5]} 
          size={0.1} 
          color={aura} 
          speed={0.5}
        />
      </mesh>
      
      {/* Glowing aura */}
      {isActive && (
        <mesh>
          <sphereGeometry args={[1.5, 16, 16]} />
          <meshStandardMaterial
            color={aura}
            transparent
            opacity={0.2}
            side={THREE.BackSide}
          />
        </mesh>
      )}
      
      {/* Energy trails */}
      <Trail
        width={0.2}
        length={3}
        color={new THREE.Color(aura)}
        attenuation={(t) => t * t}
      >
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.1]} />
          <meshBasicMaterial color={aura} />
        </mesh>
      </Trail>
    </group>
  )
}

// Legendary Temple Environment
function LegendaryTemple() {
  const templeRef = useRef()
  
  useFrame((state) => {
    if (templeRef.current) {
      // Gentle floating animation
      templeRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
  })

  return (
    <group ref={templeRef}>
      {/* Temple platform */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <circleGeometry args={[10, 32]} />
        <meshStandardMaterial
          color="#1e293b"
          metalness={0.9}
          roughness={0.1}
          emissive="#0f172a"
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* Temple pillars */}
      {[
        [-6, 0, -6],
        [6, 0, -6],
        [-6, 0, 6],
        [6, 0, 6]
      ].map((position, i) => (
        <mesh key={i} position={position} castShadow>
          <cylinderGeometry args={[0.5, 0.8, 8, 8]} />
          <meshStandardMaterial
            color="#475569"
            metalness={0.8}
            roughness={0.2}
            emissive="#334155"
            emissiveIntensity={0.2}
          />
        </mesh>
      ))}
      
      {/* Ancient symbols */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.9, 0]}>
        <ringGeometry args={[4, 6, 32]} />
        <meshStandardMaterial
          color="#f59e0b"
          transparent
          opacity={0.3}
          emissive="#f59e0b"
          emissiveIntensity={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

const JourneyPage6 = ({ onBack }) => {
  const sectionRef = useRef(null)
  const titleRef = useRef(null)
  const contentRef = useRef(null)
  const legendaryCardsRef = useRef([])
  const [activeLegendary, setActiveLegendary] = useState(null)
  const [huntProgress, setHuntProgress] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [caughtLegendaries, setCaughtLegendaries] = useState([])
  const { playClickSound, playLegendarySound, playCatchSound } = useSound()

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      
      tl.fromTo(
        sectionRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.8 }
      )
      .fromTo(
        titleRef.current,
        { opacity: 0, y: -100, scale: 0.5 },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1, 
          duration: 1.5,
          ease: 'elastic.out(1, 0.5)'
        },
        '-=0.3'
      )
      .fromTo(
        '.legendary-card',
        { opacity: 0, y: 50, scale: 0.8 },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1, 
          duration: 0.8,
          stagger: 0.2,
          ease: 'back.out(1.7)' 
        },
        '-=0.5'
      )
      .fromTo(
        '.hunt-btn',
        { opacity: 0, scale: 0 },
        { 
          opacity: 1, 
          scale: 1, 
          duration: 0.8,
          ease: 'back.out(1.7)' 
        },
        '-=0.3'
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const handleLegendaryClick = (legendary) => {
    playLegendarySound()
    setActiveLegendary(legendary)
    
    // Animate card selection
    legendaryCardsRef.current.forEach((card, index) => {
      if (card) {
        gsap.to(card, {
          scale: legendary === LEGENDARY_POKEMON[index] ? 1.1 : 0.9,
          duration: 0.3,
          ease: 'power2.out'
        })
      }
    })
    
    // Update hunt progress
    if (!activeLegendary) {
      setHuntProgress(prev => Math.min(prev + 25, 100))
    }
  }

  const attemptCatch = () => {
    if (!activeLegendary) return
    
    playCatchSound()
    setAttempts(prev => prev + 1)
    
    const success = Math.random() < activeLegendary.catchRate
    
    // Visual feedback
    if (success) {
      // Success animation
      gsap.to('.catch-effect', {
        scale: 3,
        opacity: 1,
        duration: 0.5,
        ease: 'power2.out',
        onComplete: () => {
          gsap.to('.catch-effect', {
            scale: 1,
            opacity: 0,
            duration: 0.3
          })
        }
      })
      
      // Add to caught list
      setCaughtLegendaries(prev => [...prev, activeLegendary.name])
      
      // Celebration
      gsap.to(titleRef.current, {
        scale: 1.3,
        duration: 0.3,
        yoyo: true,
        repeat: 2,
        ease: 'power2.out'
      })
      
      // Reset active legendary
      setTimeout(() => setActiveLegendary(null), 2000)
    } else {
      // Failure animation
      gsap.to('.catch-btn', {
        x: (Math.random() - 0.5) * 50,
        y: (Math.random() - 0.5) * 50,
        duration: 0.1,
        yoyo: true,
        repeat: 5,
        ease: 'power2.inOut'
      })
    }
  }

  const handleBack = () => {
    playClickSound()
    
    const tl = gsap.timeline({
      onComplete: () => {
        if (onBack) onBack()
      }
    })

    tl.to(sectionRef.current, {
      opacity: 0,
      scale: 0.95,
      duration: 0.5,
      ease: 'power2.in'
    })
  }

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen w-full overflow-hidden py-20 px-4"
    >
      {/* Cosmic Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-950/80 via-indigo-950/80 to-black">
        {/* Starfield */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(2px 2px at 20px 30px, #eee, transparent), radial-gradient(2px 2px at 40px 70px, #fff, transparent), radial-gradient(2px 2px at 50px 160px, #ddd, transparent), radial-gradient(2px 2px at 90px 40px, #fff, transparent), radial-gradient(2px 2px at 130px 80px, #fff, transparent), radial-gradient(2px 2px at 160px 120px, #ddd, transparent)',
          backgroundSize: '300px 300px'
        }} />
        
        {/* Nebula effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(139,92,246,0.15),transparent_40%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(245,158,11,0.15),transparent_40%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]" />
        
        {/* Animated aurora */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-r from-transparent via-purple-500/20 to-transparent animate-aurora" />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent animate-aurora-delayed" />
        </div>
      </div>

      {/* 3D Scene */}
      <div className="absolute inset-0 z-0">
        <Canvas shadows camera={{ position: [0, 8, 12], fov: 50 }}>
          <PerspectiveCamera makeDefault position={[0, 8, 12]} />
          <SceneManager enableFog={true} fogColor="#1e1b4b" fogNear={5} fogFar={50}>
            {/* Cosmic Environment */}
            <Stars radius={500} depth={100} count={10000} factor={8} />
            <Cloud position={[-15, 20, -15]} speed={0.2} opacity={0.8} />
            <Cloud position={[20, 15, 10]} speed={0.3} opacity={0.6} />
            
            {/* Lighting */}
            <ambientLight intensity={0.4} />
            <directionalLight 
              position={[10, 20, 10]} 
              intensity={1.5} 
              color="#c4b5fd"
              castShadow
            />
            <pointLight position={[0, 5, 0]} intensity={2} color="#f59e0b" distance={20} />
            <pointLight position={[5, 3, 5]} intensity={1} color="#3b82f6" distance={15} />
            <pointLight position={[-5, 3, -5]} intensity={1} color="#ef4444" distance={15} />
            
            {/* Legendary Temple */}
            <LegendaryTemple />
            
            {/* Legendary Pokémon Orbs */}
            {LEGENDARY_POKEMON.map((legendary, index) => (
              <LegendaryOrb
                key={legendary.name}
                position={legendary.position}
                color={legendary.color}
                aura={legendary.aura}
                isActive={activeLegendary === legendary}
                onClick={() => handleLegendaryClick(legendary)}
              />
            ))}
            
            {/* Legendary Names */}
            {LEGENDARY_POKEMON.map((legendary) => (
              <Billboard key={`text-${legendary.name}`}>
                <Text
                  position={[legendary.position[0], legendary.position[1] + 2, legendary.position[2]]}
                  fontSize={0.5}
                  color={legendary.aura}
                  outlineWidth={0.02}
                  outlineColor="#000000"
                >
                  {legendary.name}
                </Text>
              </Billboard>
            ))}
            
            {/* Your Pokémon (Pikachu) */}
            <Float speed={2} rotationIntensity={1} floatIntensity={1}>
              <group position={[-5, 0, -5]}>
                <Pikachu3D position={[0, 0, 0]} scale={1.2} type="thunderbolt" animateIdle={true} />
                <Sparkles count={30} scale={[2, 2, 2]} size={0.15} color="#fbbf24" speed={0.5} />
              </group>
            </Float>
            
            <CameraController
              targetPosition={[0, 8, 12]}
              targetLookAt={[0, 0, 0]}
              enableMouseParallax={true}
              parallaxStrength={0.5}
            />
            <OrbitControls 
              enableZoom={true}
              enablePan={true}
              minDistance={5}
              maxDistance={30}
              autoRotate={!activeLegendary}
              autoRotateSpeed={0.5}
            />
            <Environment preset="night" />
          </SceneManager>
        </Canvas>
      </div>

      {/* Catch Effect Overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40">
        <div className="catch-effect opacity-0">
          <div className="text-8xl font-bold text-yellow-300 animate-pulse">
            CAUGHT! ✨
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Main Title */}
        <h1
          ref={titleRef}
          className="text-5xl md:text-[5rem] lg:text-[7rem] font-black mb-8 text-center"
          style={{
            background: 'linear-gradient(90deg, #f59e0b, #8b5cf6, #3b82f6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundSize: '200% auto',
            animation: 'cosmicShift 4s ease-in-out infinite',
            textShadow: '0 0 80px rgba(139, 92, 246, 0.5)',
            fontFamily: "'Bebas Neue', sans-serif",
            letterSpacing: '0.1em'
          }}
        >
          LEGENDARY QUEST
        </h1>

        <p className="text-2xl md:text-3xl text-center text-amber-300 mb-12 font-semibold tracking-wide">
          Seek the Most Powerful Pokémon in Existence
        </p>

        {/* Legendary Progress */}
        <div className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 backdrop-blur-xl rounded-2xl p-8 border-2 border-purple-500/30 mb-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-purple-300 mb-4">Legendary Hunt Progress</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-purple-300 mb-2">
                    <span>Hunt Progress</span>
                    <span>{huntProgress}%</span>
                  </div>
                  <div className="h-3 bg-purple-900/50 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-1000"
                      style={{ width: `${huntProgress}%` }}
                    />
                  </div>
                </div>
                
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                    <span className="text-amber-300">Attempts: {attempts}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-green-300">Caught: {caughtLegendaries.length}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Catch Button */}
            <div className="text-center">
              <button
                onClick={attemptCatch}
                disabled={!activeLegendary}
                className="catch-btn px-10 py-5 bg-gradient-to-r from-amber-600 via-yellow-500 to-orange-500 rounded-full text-white font-bold text-xl hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-amber-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="flex items-center justify-center gap-3">
                  <span className="text-2xl">🎯</span>
                  ATTEMPT CATCH
                  <span className="text-2xl">✨</span>
                </span>
                <div className="text-sm font-normal mt-2 opacity-80">
                  {activeLegendary ? `${(activeLegendary.catchRate * 100).toFixed(1)}% success chance` : 'Select a Legendary'}
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Legendary Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {LEGENDARY_POKEMON.map((legendary, index) => (
            <div
              key={legendary.name}
              ref={el => legendaryCardsRef.current[index] = el}
              className={`legendary-card cursor-pointer transition-all duration-300 ${
                activeLegendary === legendary 
                  ? 'scale-105 border-2 border-amber-400/50' 
                  : 'border border-purple-500/30'
              } ${caughtLegendaries.includes(legendary.name) ? 'opacity-100' : 'opacity-100'}`}
              onClick={() => handleLegendaryClick(legendary)}
              style={{
                background: `linear-gradient(135deg, ${legendary.color}20, ${legendary.aura}10)`,
                backdropFilter: 'blur(10px)'
              }}
            >
              <div className="p-6 rounded-2xl">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold" style={{ color: legendary.color }}>
                      {legendary.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: legendary.color }}
                      />
                      <span className="text-sm text-gray-300 capitalize">{legendary.type}</span>
                    </div>
                  </div>
                  {caughtLegendaries.includes(legendary.name) && (
                    <div className="text-2xl text-green-400">✓</div>
                  )}
                </div>
                
                <p className="text-sm text-gray-300 mb-4">{legendary.description}</p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Catch Rate</span>
                    <span className="text-amber-300 font-bold">
                      {(legendary.catchRate * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Difficulty</span>
                    <span className="text-red-300 font-bold">
                      {legendary.catchRate < 0.02 ? 'EXTREME' : 'VERY HARD'}
                    </span>
                  </div>
                </div>
                
                {activeLegendary === legendary && (
                  <div className="mt-4 p-3 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded-lg">
                    <p className="text-sm text-amber-300 text-center">SELECTED</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Caught Legendaries Display */}
        {caughtLegendaries.length > 0 && (
          <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 backdrop-blur-xl rounded-2xl p-8 border-2 border-green-500/30 mb-12">
            <h3 className="text-2xl font-bold text-green-300 mb-6 text-center">
              🏆 Your Legendary Collection 🏆
            </h3>
            <div className="flex flex-wrap gap-4 justify-center">
              {caughtLegendaries.map((name, index) => {
                const legendary = LEGENDARY_POKEMON.find(l => l.name === name)
                return (
                  <div
                    key={index}
                    className="px-6 py-3 bg-gradient-to-r from-green-500/30 to-emerald-500/30 rounded-full flex items-center gap-3"
                  >
                    <div 
                      className="w-4 h-4 rounded-full animate-pulse"
                      style={{ backgroundColor: legendary?.color }}
                    />
                    <span className="font-bold text-green-200">{name}</span>
                    <span className="text-2xl text-yellow-300">✨</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Legendary Lore */}
        <div className="bg-gradient-to-br from-gray-900/80 to-gray-950/80 backdrop-blur-xl rounded-2xl p-8 border-2 border-gray-700/30 mb-12">
          <h3 className="text-2xl font-bold text-gray-300 mb-6 text-center">The Path of Legends</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-xl font-bold text-amber-300">Ancient Prophecy</h4>
              <p className="text-gray-300">
                Legendary Pokémon are said to have shaped the Pokémon world. Each possesses 
                unimaginable power and is tied to fundamental forces of nature.
              </p>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  Only appear under special conditions
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Possess abilities beyond normal Pokémon
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Often guardians of entire regions
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-xl font-bold text-purple-300">Hunting Strategy</h4>
              <p className="text-gray-300">
                Catching legendaries requires preparation. Stock up on Ultra Balls, 
                have strong Pokémon, and be ready for the battle of a lifetime.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-amber-500/10 rounded-lg p-3">
                  <div className="text-lg font-bold text-amber-300 text-center">ULTRA BALLS</div>
                </div>
                <div className="bg-purple-500/10 rounded-lg p-3">
                  <div className="text-lg font-bold text-purple-300 text-center">MAX POTIONS</div>
                </div>
                <div className="bg-red-500/10 rounded-lg p-3">
                  <div className="text-lg font-bold text-red-300 text-center">STATUS HEALERS</div>
                </div>
                <div className="bg-blue-500/10 rounded-lg p-3">
                  <div className="text-lg font-bold text-blue-300 text-center">REVIVES</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center">
          <button
            onClick={handleBack}
            className="group relative px-12 py-5 bg-gradient-to-r from-gray-800 to-gray-900 rounded-full text-white font-bold text-xl hover:scale-110 transition-all duration-300 shadow-2xl hover:shadow-gray-500/30 border border-gray-700"
          >
            <span className="relative z-10 flex items-center justify-center gap-3">
              <svg className="w-6 h-6 group-hover:-translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Continue Journey
              <svg className="w-6 h-6 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-gray-700 to-gray-800 opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
          </button>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes cosmicShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes aurora {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .animate-aurora {
          animation: aurora 20s linear infinite;
        }
        
        .animate-aurora-delayed {
          animation: aurora 20s linear infinite 10s;
        }
        
        .legendary-card {
          transition: all 0.3s ease;
          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        }
        
        .legendary-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 30px 60px rgba(0,0,0,0.4);
        }
        
        .catch-btn {
          transition: all 0.3s ease;
        }
        
        .catch-btn:not(:disabled):hover {
          animation: pulse 0.5s ease-in-out infinite;
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </section>
  )
}

export default JourneyPage6