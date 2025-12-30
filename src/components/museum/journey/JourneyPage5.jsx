import { useEffect, useRef, useState, useMemo, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { 
  PerspectiveCamera, 
  Environment,
  Text,
  Float,
  Sparkles,
  Stars,
  Billboard
} from '@react-three/drei'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import * as THREE from 'three'
import SceneManager from '../../../three/SceneManager'
import CameraController from '../../../three/CameraController'
import useSound from '../../../hooks/useSound'

gsap.registerPlugin(ScrollTrigger)

// 🔥 Evolution Paths Data
const EVOLUTION_CHAINS = [
  {
    id: 1,
    chain: [
      { id: 172, name: 'PICHU', type: 'electric', color: '#fbbf24', evolvesAt: 'Friendship' },
      { id: 25, name: 'PIKACHU', type: 'electric', color: '#f59e0b', evolvesAt: 'Thunder Stone' },
      { id: 26, name: 'RAICHU', type: 'electric', color: '#d97706', evolvesAt: 'Final' }
    ],
    totalPokemon: 3,
    specialCondition: 'Friendship + Thunder Stone'
  },
  {
    id: 2,
    chain: [
      { id: 4, name: 'CHARMANDER', type: 'fire', color: '#ef4444', evolvesAt: 'Level 16' },
      { id: 5, name: 'CHARMELEON', type: 'fire', color: '#dc2626', evolvesAt: 'Level 36' },
      { id: 6, name: 'CHARIZARD', type: 'fire/dragon', color: '#b91c1c', evolvesAt: 'Final' }
    ],
    totalPokemon: 3,
    specialCondition: 'Level Up'
  },
  {
    id: 3,
    chain: [
      { id: 133, name: 'EEVEE', type: 'normal', color: '#a78bfa', evolvesAt: 'Various Stones' },
      { id: 134, name: 'VAPOREON', type: 'water', color: '#3b82f6', evolvesAt: 'Water Stone' },
      { id: 135, name: 'JOLTEON', type: 'electric', color: '#fbbf24', evolvesAt: 'Thunder Stone' },
      { id: 136, name: 'FLAREON', type: 'fire', color: '#ef4444', evolvesAt: 'Fire Stone' }
    ],
    totalPokemon: 4,
    specialCondition: 'Elemental Stones'
  },
  {
    id: 4,
    chain: [
      { id: 147, name: 'DRATINI', type: 'dragon', color: '#8b5cf6', evolvesAt: 'Level 30' },
      { id: 148, name: 'DRAGONAIR', type: 'dragon', color: '#7c3aed', evolvesAt: 'Level 55' },
      { id: 149, name: 'DRAGONITE', type: 'dragon/flying', color: '#6d28d9', evolvesAt: 'Final' }
    ],
    totalPokemon: 3,
    specialCondition: 'Level Up'
  }
]

// 🌀 3D Evolution Ring
function EvolutionRing({ active = false, evolutionChain, stage = 0 }) {
  const ringRef = useRef()
  const particlesRef = useRef()
  
  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.y += 0.005
      
      if (active) {
        const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.1
        ringRef.current.scale.setScalar(1 + pulse)
      }
    }
    
    if (particlesRef.current) {
      particlesRef.current.rotation.y += 0.01
    }
  })
  
  return (
    <group>
      {/* Main ring */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[3, 0.1, 32, 100]} />
        <meshStandardMaterial 
          color="#a855f7"
          emissive="#a855f7"
          emissiveIntensity={Math.max(0, Math.min(1, active ? 0.8 : 0.3))}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
      
      {/* Evolution nodes */}
      {evolutionChain.chain.map((pokemon, index) => {
        const angle = (index / evolutionChain.chain.length) * Math.PI * 2
        const radius = 3
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius
        const isActive = index <= stage
        const isCurrent = index === stage
        const pokemonColor = pokemon.color || '#a855f7'
        
        return (
          <group key={pokemon.id} position={[x, 0, z]}>
            <Float speed={2} rotationIntensity={1} floatIntensity={isActive ? 1 : 0.3}>
              <mesh>
                <sphereGeometry args={[0.4, 32, 32]} />
                <meshStandardMaterial 
                  color={pokemonColor}
                  emissive={pokemonColor}
                  emissiveIntensity={Math.max(0, Math.min(1, isActive ? 0.6 : 0.2))}
                  roughness={0.3}
                  metalness={0.7}
                />
              </mesh>
              
              {/* Evolution stage indicator */}
              <Text
                position={[0, 0.8, 0]}
                fontSize={0.3}
                color="white"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.02}
                outlineColor="#000"
              >
                {pokemon.evolvesAt || 'Evolve'}
              </Text>
            </Float>
            
            {/* Connection line to next stage */}
            {index < evolutionChain.chain.length - 1 && (
              <mesh position={[x/2, 0, z/2]}>
                <cylinderGeometry args={[0.05, 0.05, radius/2]} />
                <meshStandardMaterial 
                  color={pokemonColor}
                  emissive={pokemonColor}
                  emissiveIntensity={Math.max(0, Math.min(1, isActive ? 0.4 : 0.1))}
                  roughness={0.3}
                  metalness={0.7}
                />
              </mesh>
            )}
            
            {/* Active stage highlight */}
            {isCurrent && active && (
              <Sparkles
                count={10}
                scale={[1, 1, 1]}
                size={0.2}
                color={pokemonColor}
                speed={0.5}
              />
            )}
          </group>
        )
      })}
      
      {/* Inner particles */}
      {active && (
        <group ref={particlesRef}>
          {Array.from({ length: 20 }).map((_, i) => (
            <mesh key={i} position={[
              Math.sin(i * 0.5) * 1.5,
              Math.cos(i * 0.7) * 0.5,
              Math.cos(i * 0.3) * 1.5
            ]}>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshBasicMaterial 
                color="#a855f7"
                transparent
                opacity={0.6}
              />
            </mesh>
          ))}
        </group>
      )}
    </group>
  )
}

// ⚡ Evolution Energy Burst
function EvolutionBurst({ isEvolving = false, color = '#a855f7' }) {
  const burstRef = useRef()
  const [scale, setScale] = useState(1)
  
  useFrame((state) => {
    if (burstRef.current && isEvolving) {
      burstRef.current.rotation.y += 0.02
      burstRef.current.rotation.x += 0.01
      
      // Pulsing scale
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.2 + 1
      setScale(pulse)
      burstRef.current.scale.setScalar(scale)
    }
  })
  
  if (!isEvolving) return null
  
  const safeColor = color || '#a855f7'
  
  return (
    <group ref={burstRef}>
      {/* Energy spheres */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2
        const radius = 2
        const x = Math.cos(angle) * radius
        const y = Math.sin(angle) * radius
        
        return (
          <mesh key={i} position={[x, y, 0]}>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshStandardMaterial 
              color={safeColor}
              emissive={safeColor}
              emissiveIntensity={Math.max(0, Math.min(1, 1))}
              transparent
              opacity={0.7}
              roughness={0.3}
              metalness={0.7}
            />
          </mesh>
        )
      })}
      
      {/* Energy beams */}
      {Array.from({ length: 4 }).map((_, i) => (
        <mesh key={`beam-${i}`} rotation={[0, 0, i * Math.PI / 2]}>
          <cylinderGeometry args={[0.1, 0.3, 4]} />
          <meshStandardMaterial 
            color={safeColor}
            emissive={safeColor}
            emissiveIntensity={Math.max(0, Math.min(1, 0.8))}
            transparent
            opacity={0.5}
            roughness={0.3}
            metalness={0.7}
          />
        </mesh>
      ))}
      
      {/* Central energy core */}
      <mesh>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial 
          color={safeColor}
          emissive={safeColor}
          emissiveIntensity={Math.max(0, Math.min(1, 1))}
          transparent
          opacity={0.9}
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>
    </group>
  )
}

// 🎬 Evolution Timeline
function EvolutionTimeline({ chains, activeChain, activeStage }) {
  const timelineRef = useRef()
  const [activePoints, setActivePoints] = useState([])
  
  useEffect(() => {
    if (timelineRef.current) {
      const points = timelineRef.current.querySelectorAll('.timeline-point')
      setActivePoints(Array.from(points))
    }
  }, [])
  
  useEffect(() => {
    if (activePoints.length > 0) {
      activePoints.forEach((point, index) => {
        const chain = chains[index]
        const isActive = chain.id === activeChain?.id
        
        gsap.to(point, {
          scale: isActive ? 1.3 : 1,
          duration: 0.5,
          ease: "power2.out",
          backgroundColor: isActive ? chain.chain[0].color + '40' : '#374151'
        })
      })
    }
  }, [activeChain, activePoints, chains])
  
  return (
    <div ref={timelineRef} className="relative py-8">
      {/* Timeline line */}
      <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gradient-to-r from-purple-500/30 to-indigo-500/30" />
      
      <div className="relative flex justify-between">
        {chains.map((chain, index) => {
          const isActive = chain.id === activeChain?.id
          
          return (
            <div key={chain.id} className="flex flex-col items-center">
              <div 
                className={`timeline-point w-8 h-8 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${
                  isActive ? 'ring-4 ring-opacity-50' : ''
                }`}
                style={{ 
                  backgroundColor: isActive ? chain.chain[0].color + '40' : '#374151',
                  ringColor: isActive ? chain.chain[0].color : 'transparent'
                }}
              >
                <span className="text-sm font-bold" style={{ color: isActive ? chain.chain[0].color : '#9ca3af' }}>
                  {index + 1}
                </span>
              </div>
              
              <div className="text-center">
                <div className="text-sm font-bold mb-1" style={{ color: chain.chain[0].color }}>
                  {chain.chain[0].name}
                </div>
                <div className="text-xs text-gray-400">
                  {chain.totalPokemon} stages
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const JourneyPage5 = ({ onBack }) => {
  const sectionRef = useRef(null)
  const containerRef = useRef(null)
  const titleRef = useRef(null)
  const evolutionCardsRef = useRef([])
  
  const { playClickSound, playEvolutionSound, playWhooshSound } = useSound()
  
  const [activeChain, setActiveChain] = useState(EVOLUTION_CHAINS[0])
  const [evolutionStage, setEvolutionStage] = useState(0)
  const [isEvolving, setIsEvolving] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [showEvolution, setShowEvolution] = useState(false)
  
  // Evolution types statistics
  const evolutionTypes = useMemo(() => {
    const types = {
      'Level Up': 0,
      'Stone': 0,
      'Trade': 0,
      'Friendship': 0,
      'Other': 0
    }
    
    EVOLUTION_CHAINS.forEach(chain => {
      const method = chain.specialCondition.toLowerCase()
      if (method.includes('level')) types['Level Up']++
      else if (method.includes('stone')) types['Stone']++
      else if (method.includes('friend')) types['Friendship']++
      else types['Other']++
    })
    
    return types
  }, [])
  
  useEffect(() => {
    if (!sectionRef.current || !titleRef.current || !containerRef.current) return

    const ctx = gsap.context(() => {
      // Title animation with evolution theme
      if (titleRef.current) {
        gsap.fromTo(titleRef.current,
          { opacity: 0, y: -100, scale: 0.5 },
          { 
            opacity: 1, 
            y: 0, 
            scale: 1,
            duration: 2, 
            ease: 'elastic.out(1, 0.5)',
            onComplete: () => {
              // Subtle glow animation
              if (titleRef.current) {
                gsap.to(titleRef.current, {
                  textShadow: '0 0 30px rgba(168, 85, 247, 0.8)',
                  duration: 1,
                  yoyo: true,
                  repeat: -1,
                  ease: "sine.inOut"
                })
              }
            }
          }
        )
      }
      
      // Scroll-triggered evolution progress
      if (containerRef.current) {
        ScrollTrigger.create({
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1,
          onUpdate: (self) => {
            setScrollProgress(self.progress)
            
            // Auto-progress evolution stages based on scroll
            const stages = Math.floor(self.progress * (activeChain.chain.length))
            if (stages > evolutionStage) {
              setEvolutionStage(stages)
              setIsEvolving(true)
              if (playEvolutionSound) {
                playEvolutionSound()
              }
              
              setTimeout(() => {
                setIsEvolving(false)
                setShowEvolution(true)
                
                // Celebration animation
                const celebrationEls = document.querySelectorAll('.evolution-celebration')
                if (celebrationEls.length > 0) {
                  gsap.to(celebrationEls, {
                    scale: 1.2,
                    duration: 0.3,
                    yoyo: true,
                    repeat: 2,
                    ease: "power2.inOut"
                  })
                }
              }, 500)
            }
            
            // Discover evolution chains as you scroll
            const chainIndex = Math.floor(self.progress * EVOLUTION_CHAINS.length)
            if (chainIndex < EVOLUTION_CHAINS.length) {
              setActiveChain(EVOLUTION_CHAINS[chainIndex])
            }
          }
        })
      }
      
      // Evolution cards animations
      if (evolutionCardsRef.current.length > 0) {
        evolutionCardsRef.current.forEach((card, index) => {
          if (card) {
            ScrollTrigger.create({
              trigger: card,
              start: 'top 85%',
              end: 'top 40%',
              scrub: true,
              onEnter: () => {
                if (card) {
                  gsap.fromTo(card,
                    { opacity: 0, y: 50, rotationY: 90 },
                    { 
                      opacity: 1, 
                      y: 0, 
                      rotationY: 0, 
                      duration: 1, 
                      ease: 'back.out(1.7)' 
                    }
                  )
                }
              }
            })
          }
        })
      }
    }, sectionRef)
    
    return () => ctx.revert()
  }, [activeChain.chain.length, evolutionStage, playEvolutionSound])
  
  const triggerEvolution = () => {
    if (evolutionStage < activeChain.chain.length - 1) {
      setIsEvolving(true)
      if (playEvolutionSound) {
        playEvolutionSound()
      }
      
      const triggerEls = document.querySelectorAll('.evolution-trigger')
      if (triggerEls.length > 0) {
        gsap.to(triggerEls, {
          scale: 1.3,
          duration: 0.2,
          yoyo: true,
          repeat: 1,
          ease: "power2.inOut"
        })
      }
      
      setTimeout(() => {
        setEvolutionStage(prev => prev + 1)
        setIsEvolving(false)
        setShowEvolution(true)
        if (playWhooshSound) {
          playWhooshSound()
        }
        
        // Celebration animation
        const successEls = document.querySelectorAll('.evolution-success')
        if (successEls.length > 0) {
          gsap.fromTo(successEls,
            { scale: 0, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.7)" }
          )
        }
      }, 1000)
    }
  }
  
  const resetEvolution = () => {
    setEvolutionStage(0)
    setIsEvolving(false)
    setShowEvolution(false)
  }
  
  const handleBack = () => {
    if (playClickSound) {
      playClickSound()
    }
    
    if (sectionRef.current) {
      gsap.to(sectionRef.current, {
        opacity: 0,
        scale: 0.95,
        duration: 0.5,
        ease: 'power2.in',
        onComplete: () => {
          if (onBack) onBack()
        }
      })
    } else {
      if (onBack) onBack()
    }
  }
  
  const currentPokemon = activeChain?.chain?.[evolutionStage] || activeChain?.chain?.[0] || null
  const nextPokemon = activeChain?.chain?.[evolutionStage + 1] || null
  
  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen"
    >
      {/* 🌌 Animated Evolution Background */}
      <div className="fixed inset-0 bg-gradient-to-b from-purple-950 via-indigo-950 to-black">
        {/* Animated energy particles */}
        <div className="absolute inset-0">
          {[...Array(150)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${Math.random() * 4 + 1}px`,
                height: `${Math.random() * 4 + 1}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                background: `radial-gradient(circle, ${currentPokemon?.color || '#a855f7'}, transparent)`,
                animation: `float ${2 + Math.random() * 3}s infinite ease-in-out`,
                animationDelay: `${Math.random() * 2}s`,
                opacity: 0.3 + Math.random() * 0.7,
              }}
            />
          ))}
        </div>
        
        {/* DNA helix pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50,10 C70,10 85,30 85,50 C85,70 70,90 50,90 C30,90 15,70 15,50 C15,30 30,10 50,10 Z' fill='none' stroke='%23a855f7' stroke-width='1'/%3E%3Cpath d='M30,20 L70,80 M70,20 L30,80' stroke='%238b5cf6' stroke-width='1' stroke-dasharray='5,5'/%3E%3C/svg%3E")`,
          backgroundSize: '200px',
        }} />
      </div>
      
      {/* 🎨 3D Evolution Scene */}
      <div className="fixed inset-0 z-0">
        <Canvas 
          shadows
          onCreated={({ gl }) => {
            // Handle WebGL context loss
            try {
              gl.domElement.addEventListener('webglcontextlost', (event) => {
                event.preventDefault()
                console.warn('WebGL context lost')
              })
              gl.domElement.addEventListener('webglcontextrestored', () => {
                console.log('WebGL context restored')
              })
            } catch (error) {
              console.warn('Error setting up WebGL context listeners:', error)
            }
          }}
          gl={{ 
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance',
            failIfMajorPerformanceCaveat: false
          }}
          onError={(error) => {
            console.error('Canvas error:', error)
          }}
        >
          <Suspense fallback={null}>
            <PerspectiveCamera makeDefault position={[0, 2, 8]} fov={55} />
            <SceneManager enableFog={true}>
              <ambientLight intensity={0.4} />
              <directionalLight position={[5, 10, 5]} intensity={1.2} color="#a855f7" />
              <pointLight position={[-3, 3, 3]} intensity={0.8} color="#8b5cf6" />
              <pointLight position={[3, 3, -3]} intensity={0.8} color="#6366f1" />
              
              {/* Evolution Ring */}
              {activeChain && activeChain.chain && activeChain.chain.length > 0 && (
                <EvolutionRing 
                  active={true}
                  evolutionChain={activeChain}
                  stage={Math.max(0, Math.min(evolutionStage, activeChain.chain.length - 1))}
                />
              )}
              
              {/* Evolution Burst Effect */}
              {currentPokemon && (
                <EvolutionBurst 
                  isEvolving={isEvolving}
                  color={currentPokemon.color || '#a855f7'}
                />
              )}
              
              {/* Stars background */}
              <Stars radius={100} depth={50} count={4000} factor={4} />
              
              <Environment preset="night" />
            </SceneManager>
          </Suspense>
        </Canvas>
      </div>
      
      {/* 📜 Content Container */}
      <div ref={containerRef} className="relative z-10 min-h-[400vh] pt-32 pb-96">
        <div className="max-w-7xl mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-32">
            <h1
              ref={titleRef}
              className="text-8xl md:text-[10rem] lg:text-[12rem] font-black mb-4 text-transparent bg-clip-text"
              style={{
                background: 'linear-gradient(45deg, #a855f7, #8b5cf6, #6366f1, #4f46e5)',
                textShadow: '0 0 80px rgba(168, 85, 247, 0.5)',
                letterSpacing: '-0.05em',
                fontFamily: "'Bebas Neue', sans-serif",
              }}
            >
              EVOLUTION
            </h1>
            
            <div className="space-y-6 max-w-3xl mx-auto">
              <p className="text-3xl md:text-4xl text-purple-300 font-bold">
                Witness the transformation of Pokémon
              </p>
              <p className="text-xl text-gray-300">
                From humble beginnings to legendary forms - experience the power of evolution
              </p>
            </div>
          </div>
          
          {/* Evolution Success Alert */}
          {showEvolution && nextPokemon && currentPokemon && (
            <div className="fixed top-10 left-1/2 transform -translate-x-1/2 z-50 evolution-success">
              <div className="backdrop-blur-xl bg-purple-500/20 rounded-2xl p-6 border-2 border-purple-400">
                <div className="flex items-center gap-4">
                  <div className="text-3xl">✨</div>
                  <div>
                    <h3 className="text-xl font-bold text-purple-300">Evolution Successful!</h3>
                    <p className="text-gray-300">
                      {currentPokemon.name} evolved into {nextPokemon.name}!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Active Evolution Showcase */}
          {currentPokemon && activeChain && activeChain.chain && (
            <div className="backdrop-blur-xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-3xl p-8 md:p-12 border-2 border-purple-400/30 mb-32">
              <h2 className="text-4xl font-bold text-purple-300 mb-8 text-center">
                Active Evolution Chain
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Current Pokémon */}
                <div className="text-center">
                  <div className="relative inline-block mb-6">
                    <div className="w-48 h-48 rounded-full mx-auto overflow-hidden border-4 border-purple-400/50">
                      <img
                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${currentPokemon.id}.png`}
                        alt={currentPokemon.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div 
                      className="absolute inset-0 rounded-full blur-2xl"
                      style={{ backgroundColor: currentPokemon.color || '#a855f7', opacity: 0.3 }}
                    />
                  </div>
                  
                  <h3 className="text-3xl font-bold mb-2" style={{ color: currentPokemon.color || '#a855f7' }}>
                    {currentPokemon.name}
                  </h3>
                  <p className="text-gray-400 mb-2">#{currentPokemon.id}</p>
                  <p className="text-lg text-gray-300">Stage {evolutionStage + 1} of {activeChain.chain.length}</p>
                  
                  <div className="mt-4">
                    <span className="px-4 py-2 rounded-full text-sm font-bold"
                      style={{ backgroundColor: (currentPokemon.color || '#a855f7') + '20', color: currentPokemon.color || '#a855f7' }}
                    >
                      {currentPokemon.type?.toUpperCase() || 'NORMAL'}
                    </span>
                  </div>
                </div>
              
              {/* Evolution Controls */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-2xl font-bold text-indigo-300 mb-4">Evolution Progress</h4>
                  <div className="space-y-4">
                    {activeChain.chain.map((stage, index) => (
                      <div key={stage.id} className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${
                          index <= evolutionStage 
                            ? 'bg-gradient-to-r from-purple-500 to-indigo-500' 
                            : 'bg-gray-700'
                        }`}>
                          {index < evolutionStage ? (
                            <span className="text-white">✓</span>
                          ) : (
                            <span className={index <= evolutionStage ? 'text-white' : 'text-gray-400'}>
                              {index + 1}
                            </span>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className={index <= evolutionStage ? 'text-white' : 'text-gray-500'}>
                              {stage.name}
                            </span>
                            <span className="text-sm text-gray-400">{stage.evolvesAt}</span>
                          </div>
                          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all duration-500"
                              style={{ 
                                width: index <= evolutionStage ? '100%' : '0%',
                                background: `linear-gradient(90deg, ${stage.color}, ${stage.color}cc)`
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Evolution Controls */}
                <div className="space-y-4">
                  <button
                    onClick={triggerEvolution}
                    disabled={isEvolving || evolutionStage >= activeChain.chain.length - 1}
                    className="evolution-trigger w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl text-white font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-all"
                  >
                    {isEvolving ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Evolving...
                      </span>
                    ) : evolutionStage >= activeChain.chain.length - 1 ? (
                      '✓ Evolution Complete'
                    ) : (
                      `Evolve to ${nextPokemon?.name || 'Next Stage'}`
                    )}
                  </button>
                  
                  <button
                    onClick={resetEvolution}
                    className="w-full py-3 bg-gray-800/50 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                  >
                    Reset Evolution
                  </button>
                </div>
              </div>
            </div>
          </div>
          )}
          
          {/* Evolution Timeline */}
          <div className="mb-32">
            <h2 className="text-4xl font-bold text-center mb-12">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-400 to-violet-400">
                Evolution Journey
              </span>
            </h2>
            
            <EvolutionTimeline 
              chains={EVOLUTION_CHAINS}
              activeChain={activeChain}
              activeStage={evolutionStage}
            />
          </div>
          
          {/* All Evolution Chains */}
          <div>
            <h2 className="text-4xl font-bold text-center mb-12">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-400 to-violet-400">
                Evolution Chains
              </span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {EVOLUTION_CHAINS.map((chain, index) => {
                const isActive = chain.id === activeChain.id
                
                return (
                  <div
                    key={chain.id}
                    ref={el => evolutionCardsRef.current[index] = el}
                    className={`evolution-card backdrop-blur-xl rounded-2xl p-6 border-2 transition-all duration-500 cursor-pointer ${
                      isActive 
                        ? 'border-purple-400 scale-105' 
                        : 'border-white/10 hover:border-purple-400/50 hover:scale-102'
                    }`}
                    onClick={() => {
                      setActiveChain(chain)
                      setEvolutionStage(0)
                      setIsEvolving(false)
                      playClickSound()
                    }}
                    style={{
                      background: `linear-gradient(135deg, ${chain.chain[0].color}10, transparent 60%)`,
                      boxShadow: isActive ? `0 20px 40px ${chain.chain[0].color}30` : 'none'
                    }}
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <div 
                        className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold"
                        style={{ 
                          backgroundColor: chain.chain[0].color + '40', 
                          color: chain.chain[0].color 
                        }}
                      >
                        {chain.id}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">{chain.chain[0].name} Line</h3>
                        <p className="text-gray-400">{chain.totalPokemon} evolutionary stages</p>
                      </div>
                    </div>
                    
                    {/* Evolution path visualization */}
                    <div className="flex items-center justify-between mb-6">
                      {chain.chain.map((stage, idx) => (
                        <div key={stage.id} className="text-center">
                          <div className="w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center"
                            style={{ 
                              backgroundColor: stage.color + '20',
                              border: `2px solid ${stage.color}`
                            }}
                          >
                            <span className="text-sm font-bold" style={{ color: stage.color }}>
                              {idx + 1}
                            </span>
                          </div>
                          <div className="text-xs text-gray-400">{stage.name}</div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="text-sm text-gray-300">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 rounded" style={{ backgroundColor: chain.chain[0].color + '20' }}>
                          {chain.specialCondition}
                        </span>
                      </div>
                      <p>Evolves through: {chain.specialCondition}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          
          {/* Evolution Statistics */}
          <div className="mt-32 backdrop-blur-xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-3xl p-8 md:p-12 border-2 border-purple-400/30">
            <h2 className="text-4xl font-bold text-center text-white mb-8">
              Evolution Statistics
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-400 mb-2">{EVOLUTION_CHAINS.length}</div>
                <div className="text-gray-400">Evolution Chains</div>
              </div>
              
              <div className="text-center">
                <div className="text-4xl font-bold text-indigo-400 mb-2">
                  {EVOLUTION_CHAINS.reduce((sum, chain) => sum + chain.totalPokemon, 0)}
                </div>
                <div className="text-gray-400">Total Stages</div>
              </div>
              
              <div className="text-center">
                <div className="text-4xl font-bold text-violet-400 mb-2">{evolutionTypes['Level Up']}</div>
                <div className="text-gray-400">Level Evolution</div>
              </div>
              
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-400 mb-2">{evolutionTypes['Stone']}</div>
                <div className="text-gray-400">Stone Evolution</div>
              </div>
              
              <div className="text-center">
                <div className="text-4xl font-bold text-indigo-400 mb-2">{evolutionTypes['Friendship']}</div>
                <div className="text-gray-400">Friendship</div>
              </div>
            </div>
            
            {/* Evolution Type Chart */}
            <div className="mt-8">
              <h3 className="text-2xl font-bold text-purple-300 mb-4">Evolution Methods Distribution</h3>
              <div className="space-y-3">
                {Object.entries(evolutionTypes).map(([method, count]) => (
                  <div key={method}>
                    <div className="flex justify-between text-sm text-gray-300 mb-1">
                      <span>{method}</span>
                      <span>{count} chains</span>
                    </div>
                    <div className="h-3 bg-gray-800/50 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-1000"
                        style={{ 
                          width: `${(count / EVOLUTION_CHAINS.length) * 100}%`,
                          background: `linear-gradient(90deg, #a855f7, #8b5cf6)`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <button
            onClick={handleBack}
            className="group px-8 py-3 bg-gradient-to-r from-purple-500/90 to-indigo-500/90 backdrop-blur-sm rounded-full text-white font-bold text-lg hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-purple-500/50 border border-purple-400/30"
          >
            <span className="flex items-center gap-2">
              ← Back
            </span>
          </button>
          
          {/* Evolution Progress */}
          <div className="flex flex-col items-center gap-2">
            <div className="text-sm text-purple-300 font-mono">
              STAGE: {evolutionStage + 1}/{activeChain.chain.length}
            </div>
            <div className="w-48 h-1 bg-purple-500/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full transition-all duration-300"
                style={{ width: `${((evolutionStage + 1) / activeChain.chain.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Custom Styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        .evolution-celebration {
          animation: pulse 0.5s ease-in-out infinite;
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        
        .evolution-card {
          transform-style: preserve-3d;
          perspective: 1000px;
        }
      `}</style>
    </section>
  )
}

export default JourneyPage5