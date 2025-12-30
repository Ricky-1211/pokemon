// pages/PokemonComparison.jsx
import { useEffect, useRef, useState, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { 
  PerspectiveCamera, 
  Text,
  Float,
  Billboard,
  Sparkles
} from '@react-three/drei'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import * as THREE from 'three'
import Pokemon3D from '../three/Pokemon3D'

gsap.registerPlugin(ScrollTrigger)

// 🎥 Enhanced Cinematic Camera Positions
export const cameraPositions = {
  hero: { 
    position: [0, 2, 8], 
    lookAt: [0, 1, 0],
    fov: 45
  },
  pikachu: { 
    position: [-3, 1.5, 5], 
    lookAt: [-2, 0.8, 0],
    fov: 50
  },
  charizard: { 
    position: [3, 2.5, 6], 
    lookAt: [2, 1.2, 0],
    fov: 48
  },
  mewtwo: { 
    position: [0, 3, 10], 
    lookAt: [0, 2, 0],
    fov: 40
  },
  compare: { 
    position: [0, 2, 12], 
    lookAt: [0, 1.5, 0],
    fov: 55
  }
}

// 🎬 Enhanced Camera Controller
function CameraController({ activeScene, mouseParallax = { x: 0, y: 0 } }) {
  const { camera } = useThree()
  const lookAtTarget = useRef(new THREE.Vector3())
  const basePosition = useRef(new THREE.Vector3())
  
  useEffect(() => {
    const target = cameraPositions[activeScene]
    if (!target) return
    
    // Store base position for parallax offset
    basePosition.current.set(...target.position)
    lookAtTarget.current.set(...target.lookAt)
    
    // Cinematic camera animation with bounce effect
    gsap.to(camera.position, {
      x: target.position[0] + mouseParallax.x,
      y: target.position[1] + mouseParallax.y,
      z: target.position[2],
      duration: 2.2,
      ease: "power3.inOut",
      onStart: () => {
        // Add slight bounce effect
        gsap.to(camera.position, {
          y: target.position[1] + 0.5,
          duration: 0.5,
          yoyo: true,
          repeat: 1,
          ease: "power2.inOut"
        })
      }
    })
    
    // Animate FOV for depth effect
    if (camera instanceof THREE.PerspectiveCamera) {
      gsap.to(camera, {
        fov: target.fov || 45,
        duration: 2.2,
        ease: "power3.inOut",
        onUpdate: () => camera.updateProjectionMatrix()
      })
    }
    
    // Smooth lookAt animation
    gsap.to(lookAtTarget.current, {
      x: target.lookAt[0],
      y: target.lookAt[1],
      z: target.lookAt[2],
      duration: 2.2,
      ease: "power3.inOut",
      onUpdate: () => {
        camera.lookAt(lookAtTarget.current)
      }
    })
  }, [activeScene, camera, mouseParallax.x, mouseParallax.y])
  
  useFrame(() => {
    camera.lookAt(lookAtTarget.current)
  })
  
  return null
}

// 🌀 Particle System for Visual Effects
function ParticleSystem({ count = 100, color = "#ffffff", size = 0.1, speed = 1 }) {
  const particlesRef = useRef()
  
  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.children.forEach((particle, i) => {
        particle.position.y += Math.sin(state.clock.elapsedTime * speed + i) * 0.01
        particle.rotation.y += 0.01
        particle.rotation.x += 0.005
      })
    }
  })
  
  return (
    <group ref={particlesRef}>
      {Array.from({ length: count }).map((_, i) => (
        <mesh
          key={i}
          position={[
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 20
          ]}
        >
          <sphereGeometry args={[size * (0.5 + Math.random() * 0.5), 8, 8]} />
          <meshBasicMaterial 
            color={color}
            transparent
            opacity={0.3 + Math.random() * 0.4}
          />
        </mesh>
      ))}
    </group>
  )
}

// 🐉 Enhanced Pokémon Models with Real Images
function PikachuModel({ active = false, compareMode = false }) {
  const groupRef = useRef()
  const [hovered, setHovered] = useState(false)
  const initialScale = useRef(2)
  
  // Enhanced scale-based activation
  useEffect(() => {
    if (!groupRef.current) return
    
    const targetScale = active ? initialScale.current : 0
    
    gsap.to(groupRef.current.scale, {
      x: targetScale,
      y: targetScale,
      z: targetScale,
      duration: 1.5,
      ease: "elastic.out(1, 0.5)",
      onComplete: () => {
        if (active && compareMode) {
          // Add entrance animation for compare mode
          gsap.fromTo(groupRef.current.position,
            { y: -3 },
            { y: 0, duration: 1, ease: "bounce.out" }
          )
        }
      }
    })
    
    // Position for compare mode (side-by-side)
    if (compareMode && active) {
      gsap.to(groupRef.current.position, {
        x: -3.5,
        duration: 1.5,
        ease: "power3.inOut"
      })
    } else if (!compareMode) {
      // Reset to individual scene position
      gsap.to(groupRef.current.position, {
        x: -2,
        duration: 1.5,
        ease: "power3.inOut"
      })
    }
  }, [active, compareMode])
  
  useFrame((state) => {
    if (!groupRef.current || !active) return
    
    const rotationSpeed = active ? 0.008 : 0.002
    const floatHeight = active ? Math.sin(state.clock.elapsedTime * 2.5) * 0.3 : 0
    const bobSpeed = compareMode ? 0.3 : 0.8
    
    groupRef.current.rotation.y += rotationSpeed
    
    if (!compareMode) {
      groupRef.current.position.y = floatHeight
    } else {
      // Gentle bobbing in compare mode
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * bobSpeed) * 0.2
    }
  })
  
  return (
    <group 
      ref={groupRef} 
      position={[-2, 0, 0]}
      scale={0}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onPointerDown={() => {
        // Click feedback
        gsap.to(groupRef.current.scale, {
          x: initialScale.current * 1.2,
          y: initialScale.current * 1.2,
          z: initialScale.current * 1.2,
          duration: 0.2,
          yoyo: true,
          repeat: 1,
          ease: "power2.inOut"
        })
      }}
    >
      <Float speed={2} rotationIntensity={1} floatIntensity={1}>
        <Pokemon3D
          name="pikachu"
          position={[0, 0, 0]}
          scale={0.6}
          variant="normal"
        />
      </Float>
      
      {/* Electric aura */}
      {active && (
        <mesh>
          <sphereGeometry args={[0.8, 32, 32]} />
          <meshStandardMaterial 
            color="#fbbf24"
            transparent
            opacity={0.2}
            wireframe
          />
        </mesh>
      )}
      
      {/* Particle effects */}
      {active && (
        <Sparkles 
          count={30} 
          scale={[2, 2, 2]} 
          size={0.2} 
          color="#fbbf24"
          speed={0.5}
        />
      )}
    </group>
  )
}

function CharizardModel({ active = false, compareMode = false }) {
  const groupRef = useRef()
  const [hovered, setHovered] = useState(false)
  const initialScale = useRef(2)
  const fireIntensity = useRef(1)
  
  useEffect(() => {
    if (!groupRef.current) return
    
    const targetScale = active ? initialScale.current : 0
    
    gsap.to(groupRef.current.scale, {
      x: targetScale,
      y: targetScale,
      z: targetScale,
      duration: 1.5,
      ease: "elastic.out(1, 0.5)",
      onComplete: () => {
        if (active && compareMode) {
          gsap.fromTo(groupRef.current.position,
            { y: -3 },
            { y: 0, duration: 1, ease: "bounce.out" }
          )
        }
      }
    })
    
    if (compareMode && active) {
      gsap.to(groupRef.current.position, {
        x: 0,
        duration: 1.5,
        ease: "power3.inOut"
      })
    } else if (!compareMode) {
      gsap.to(groupRef.current.position, {
        x: 2,
        duration: 1.5,
        ease: "power3.inOut"
      })
    }
  }, [active, compareMode])
  
  useFrame((state) => {
    if (!groupRef.current || !active) return
    
    const rotationSpeed = active ? 0.006 : 0.001
    const floatHeight = active ? Math.sin(state.clock.elapsedTime * 2) * 0.4 : 0
    const bobSpeed = compareMode ? 0.25 : 0.6
    
    groupRef.current.rotation.y += rotationSpeed
    
    if (!compareMode) {
      groupRef.current.position.y = floatHeight
    } else {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * bobSpeed) * 0.25
    }
    
    // Fire intensity animation
    fireIntensity.current = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.5
  })
  
  return (
    <group 
      ref={groupRef} 
      position={[2, 0, 0]}
      scale={0}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
        <Pokemon3D
          name="charizard"
          position={[0, 0, 0]}
          scale={0.8}
          variant="normal"
        />
      </Float>
      
      {/* Animated fire effects */}
      {active && (
        <group>
          <mesh position={[0, 0, 1]}>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshBasicMaterial 
              color="#fbbf24"
              transparent
              opacity={0.7 + Math.sin(Date.now() * 0.01) * 0.3}
            />
          </mesh>
          
          {/* Fire particles */}
          <Sparkles 
            count={40} 
            scale={[3, 2, 3]} 
            size={0.3} 
            color="#f59e0b"
            speed={1}
          />
        </group>
      )}
      
      {/* Heat distortion effect */}
      {active && (
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[1.2, 16, 16]} />
          <meshBasicMaterial 
            color="#f97316"
            transparent
            opacity={0.1}
            wireframe
          />
        </mesh>
      )}
    </group>
  )
}

function MewtwoModel({ active = false, compareMode = false }) {
  const groupRef = useRef()
  const [hovered, setHovered] = useState(false)
  const initialScale = useRef(2.5)
  
  useEffect(() => {
    if (!groupRef.current) return
    
    const targetScale = active ? initialScale.current : 0
    
    gsap.to(groupRef.current.scale, {
      x: targetScale,
      y: targetScale,
      z: targetScale,
      duration: 1.8,
      ease: "elastic.out(1, 0.3)",
      onComplete: () => {
        if (active && compareMode) {
          gsap.fromTo(groupRef.current.position,
            { y: -3 },
            { y: 0, duration: 1.2, ease: "bounce.out" }
          )
        }
      }
    })
    
    if (compareMode && active) {
      gsap.to(groupRef.current.position, {
        x: 3.5,
        duration: 1.8,
        ease: "power3.inOut"
      })
    } else if (!compareMode) {
      gsap.to(groupRef.current.position, {
        x: 0,
        duration: 1.8,
        ease: "power3.inOut"
      })
    }
  }, [active, compareMode])
  
  useFrame((state) => {
    if (!groupRef.current || !active) return
    
    const rotationSpeed = active ? 0.004 : 0.001
    const floatHeight = active ? Math.sin(state.clock.elapsedTime * 1.8) * 0.5 : 0
    const bobSpeed = compareMode ? 0.2 : 0.5
    
    groupRef.current.rotation.y += rotationSpeed
    
    if (!compareMode) {
      groupRef.current.position.y = floatHeight
    } else {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * bobSpeed) * 0.3
    }
    
    // Psychic energy effect - handled by Pokemon3D component
  })
  
  return (
    <group 
      ref={groupRef} 
      position={[0, 0, 0]}
      scale={0}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <Float speed={1} rotationIntensity={0.3} floatIntensity={2}>
        <Pokemon3D
          name="mewtwo"
          position={[0, 0, 0]}
          scale={0.7}
          variant="normal"
        />
      </Float>
      
      {/* Psychic energy orb */}
      <mesh position={[0, 1, 0]}>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshBasicMaterial 
          color="#c4b5fd"
          transparent
          opacity={0.8 + Math.sin(Date.now() * 0.005) * 0.2}
        />
      </mesh>
      
      {/* Psychic aura */}
      {active && (
        <group>
          <mesh>
            <sphereGeometry args={[1.5, 32, 32]} />
            <meshBasicMaterial 
              color="#8b5cf6"
              transparent
              opacity={0.1}
              wireframe
            />
          </mesh>
          
          <Sparkles 
            count={50} 
            scale={[4, 4, 4]} 
            size={0.15} 
            color="#c4b5fd"
            speed={0.3}
          />
        </group>
      )}
    </group>
  )
}

// 🏆 Enhanced Stats Display with Real Pokémon Data
function PokemonStats({ pokemon, index, isVisible }) {
  const barRefs = useRef([])
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  
  useEffect(() => {
    if (isVisible && barRefs.current.length > 0) {
      barRefs.current.forEach((bar, i) => {
        if (bar) {
          gsap.fromTo(bar,
            { width: '0%' },
            { 
              width: `${pokemon.stats[i].value}%`, 
              duration: 1.5, 
              delay: 0.5 + i * 0.15,
              ease: "power3.out" 
            }
          )
        }
      })
    }
  }, [isVisible, pokemon.stats])
  
  const handleImageError = (e) => {
    // Fallback chain: custom image -> official artwork -> regular sprite -> dream world
    if (e.target.src.includes('gamerantimages.com') || e.target.src.includes('wordpress')) {
      // Try official artwork as fallback
      e.target.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`
      setImageError(false)
    } else if (e.target.src.includes('official-artwork')) {
      e.target.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`
      setImageError(false)
    } else if (e.target.src.includes('sprites/pokemon/') && !e.target.src.includes('dream-world')) {
      e.target.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/${pokemon.id}.svg`
      setImageError(false)
    } else {
      setImageError(true)
    }
  }
  
  return (
    <div className="relative group">
      {/* Pokémon Image Card */}
      <div className="relative mb-6">
        <div className="absolute -inset-4 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
        
        <div className="relative bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-6 border border-white/20 backdrop-blur-xl">
          {/* Pokémon Image */}
          <div className="relative w-48 h-48 mx-auto mb-4 flex items-center justify-center">
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              </div>
            )}
            <img
              src={pokemon.image || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`}
              alt={pokemon.name}
              className={`w-full h-full object-contain drop-shadow-2xl transition-all duration-500 group-hover:scale-110 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
              onError={handleImageError}
              style={{ display: imageError ? 'none' : 'block' }}
            />
            {imageError && (
              <div className="text-center text-gray-400 text-sm">
                Image unavailable
              </div>
            )}
            
            {/* Image glow effect */}
            <div 
              className="absolute inset-0 rounded-full blur-2xl opacity-50 transition-opacity duration-500 group-hover:opacity-70"
              style={{ backgroundColor: pokemon.color }}
            />
          </div>
          
          {/* Pokémon Info */}
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-2" style={{ color: pokemon.color }}>
              {pokemon.name}
            </h3>
            <p className="text-sm text-gray-400 mb-1">#{pokemon.id}</p>
            <p className="text-gray-300 text-sm">{pokemon.type}</p>
          </div>
        </div>
      </div>
      
      {/* Stats */}
      <div className="space-y-3">
        {pokemon.stats.map((stat, idx) => (
          <div key={idx} className="relative">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs uppercase tracking-wider text-gray-400">
                {stat.name}
              </span>
              <span 
                className="text-sm font-bold"
                style={{ color: pokemon.color }}
              >
                {stat.value}
              </span>
            </div>
            <div className="h-2 bg-gray-800/50 rounded-full overflow-hidden">
              <div 
                ref={el => barRefs.current[idx] = el}
                className="stat-bar h-full rounded-full transition-all duration-500"
                style={{ 
                  width: '0%',
                  background: `linear-gradient(90deg, ${pokemon.color}, ${pokemon.color}cc)`,
                  boxShadow: `0 0 15px ${pokemon.color}40`
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// 💎 Enhanced Luxury UI
function LuxuryUI({ activeScene, stats }) {
  const titleRef = useRef()
  const subtitleRef = useRef()
  const sceneRef = useRef(activeScene)
  
  useEffect(() => {
    if (sceneRef.current !== activeScene) {
      // Exit animation
      gsap.to(titleRef.current, {
        opacity: 0,
        y: -30,
        duration: 0.5,
        ease: "power2.in",
        onComplete: () => {
          // Enter animation
          gsap.fromTo(titleRef.current,
            { opacity: 0, y: 50, scale: 0.9 },
            { 
              opacity: 1, 
              y: 0, 
              scale: 1, 
              duration: 1.2, 
              ease: "back.out(1.7)" 
            }
          )
        }
      })
      
      gsap.to(subtitleRef.current, {
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
          gsap.fromTo(subtitleRef.current,
            { opacity: 0, y: 30 },
            { 
              opacity: 1, 
              y: 0, 
              duration: 1, 
              ease: "power3.out", 
              delay: 0.3 
            }
          )
        }
      })
      
      sceneRef.current = activeScene
    }
  }, [activeScene])
  
  const getSceneContent = () => {
    switch(activeScene) {
      case 'hero':
        return {
          title: 'POKÉMON LEGENDS',
          subtitle: 'Experience legendary Pokémon in cinematic 3D',
          color: '#ffffff',
          bgColor: 'rgba(0,0,0,0.3)'
        }
      case 'pikachu':
        return {
          title: 'PIKACHU',
          subtitle: 'The Electric Mouse Pokémon • Icon of the franchise',
          color: '#fbbf24',
          bgColor: 'rgba(251, 191, 36, 0.1)'
        }
      case 'charizard':
        return {
          title: 'CHARIZARD',
          subtitle: 'The Flame Pokémon • Final evolution of Charmander',
          color: '#f97316',
          bgColor: 'rgba(249, 115, 22, 0.1)'
        }
      case 'mewtwo':
        return {
          title: 'MEWTWO',
          subtitle: 'The Genetic Pokémon • Legendary Psychic-type',
          color: '#8b5cf6',
          bgColor: 'rgba(139, 92, 246, 0.1)'
        }
      case 'compare':
        return {
          title: 'COMPARISON',
          subtitle: 'Compare stats and abilities side by side',
          color: '#60a5fa',
          bgColor: 'rgba(96, 165, 250, 0.1)'
        }
      default:
        return {
          title: 'POKÉMON',
          subtitle: 'Cinematic 3D Experience',
          color: '#ffffff',
          bgColor: 'rgba(0,0,0,0.3)'
        }
    }
  }
  
  const content = getSceneContent()
  
  return (
    <div className="fixed inset-0 pointer-events-none z-10">
      {/* Animated background overlay */}
      <div 
        className="absolute inset-0 transition-all duration-1000"
        style={{ 
          background: `radial-gradient(circle at 50% 50%, ${content.bgColor}, transparent 70%)`,
          opacity: activeScene === 'hero' ? 0.3 : 0.5
        }}
      />
      
      <div className="absolute top-0 left-0 w-full pt-12 md:pt-20 px-4 md:px-8">
        <h1 
          ref={titleRef}
          className="lux-title text-6xl md:text-8xl lg:text-[10rem] font-black text-center tracking-tighter"
          style={{
            fontFamily: "'Playfair Display', serif",
            color: content.color,
            textShadow: `0 0 50px ${content.color}40, 0 0 100px ${content.color}20`,
            letterSpacing: '-0.02em',
            background: `linear-gradient(45deg, ${content.color}, ${content.color}cc)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {content.title}
        </h1>
        
        <p 
          ref={subtitleRef}
          className="text-xl md:text-2xl text-center text-gray-300 mt-4 font-light tracking-wider max-w-3xl mx-auto"
          style={{
            fontFamily: "'Inter', sans-serif",
            letterSpacing: '0.1em',
          }}
        >
          {content.subtitle}
        </p>
      </div>
      
      {/* Stats overlay for compare scene */}
      {activeScene === 'compare' && (
        <div className="absolute bottom-32 left-0 right-0">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {stats.map((pokemon, index) => (
                <PokemonStats 
                  key={pokemon.id}
                  pokemon={pokemon}
                  index={index}
                  isVisible={activeScene === 'compare'}
                />
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2">
        <div className="text-xs text-gray-400 uppercase tracking-widest animate-pulse">
          Scroll to explore
        </div>
        <div className="w-6 h-10 border-2 border-gray-500/50 rounded-full flex justify-center items-center backdrop-blur-sm">
          <div className="w-1.5 h-4 bg-gradient-to-b from-white to-transparent rounded-full animate-bounce" />
        </div>
      </div>
    </div>
  )
}

// 🎬 Main Component
const PokemonComparison = ({ onBack }) => {
  const [activeScene, setActiveScene] = useState('hero')
  const [activePokemon, setActivePokemon] = useState('all')
  const [mouseParallax, setMouseParallax] = useState({ x: 0, y: 0 })
  const [isLoaded, setIsLoaded] = useState(false)
  
  // Real Pokémon data with actual images - using high-quality sources where available
  const pokemonData = [
    {
      id: 25,
      name: 'PIKACHU',
      type: 'Electric',
      color: '#fbbf24',
      image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
      stats: [
        { name: 'HP', value: 35 },
        { name: 'Attack', value: 55 },
        { name: 'Defense', value: 40 },
        { name: 'Speed', value: 90 },
        { name: 'Special', value: 50 }
      ]
    },
    {
      id: 6,
      name: 'CHARIZARD',
      type: 'Fire/Flying',
      color: '#f97316',
      image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png',
      stats: [
        { name: 'HP', value: 78 },
        { name: 'Attack', value: 84 },
        { name: 'Defense', value: 78 },
        { name: 'Speed', value: 100 },
        { name: 'Special', value: 109 }
      ]
    },
    {
      id: 150,
      name: 'MEWTWO',
      type: 'Psychic',
      color: '#8b5cf6',
      image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png',
      stats: [
        { name: 'HP', value: 106 },
        { name: 'Attack', value: 110 },
        { name: 'Defense', value: 90 },
        { name: 'Speed', value: 130 },
        { name: 'Special', value: 154 }
      ]
    }
  ]
  
  // Scene change handler
  useEffect(() => {
    // Update active Pokémon based on scene
    switch(activeScene) {
      case 'pikachu':
        setActivePokemon('pikachu')
        break
      case 'charizard':
        setActivePokemon('charizard')
        break
      case 'mewtwo':
        setActivePokemon('mewtwo')
        break
      case 'compare':
        setActivePokemon('all')
        break
      default:
        setActivePokemon('all')
    }
    
    // Play transition sound
    if (isLoaded) {
      // Add your sound effect here
    }
  }, [activeScene, isLoaded])
  
  // Mouse parallax effect
  useEffect(() => {
    let rafId = null
    let targetX = 0
    let targetY = 0
    
    const handleMouseMove = (e) => {
      const normalizedX = (e.clientX / window.innerWidth - 0.5)
      const normalizedY = (e.clientY / window.innerHeight - 0.5)
      
      targetX = normalizedX * 0.2
      targetY = -normalizedY * 0.15
    }
    
    const updateParallax = () => {
      setMouseParallax(prev => ({
        x: prev.x + (targetX - prev.x) * 0.08,
        y: prev.y + (targetY - prev.y) * 0.08
      }))
      rafId = requestAnimationFrame(updateParallax)
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    rafId = requestAnimationFrame(updateParallax)
    setIsLoaded(true)
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])
  
  // Scroll trigger setup
  useEffect(() => {
    const scenes = ['hero', 'pikachu', 'charizard', 'mewtwo', 'compare']
    
    scenes.forEach((scene) => {
      ScrollTrigger.create({
        trigger: `#section-${scene}`,
        start: 'top center',
        end: 'bottom center',
        onEnter: () => setActiveScene(scene),
        onEnterBack: () => setActiveScene(scene)
      })
    })
    
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [])
  
  return (
    <div className="relative w-full min-h-screen bg-black overflow-hidden">
      {/* 🌟 Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-black to-purple-950" />
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          backgroundSize: '100px',
        }} />
      </div>
      
      {/* 🎨 Three.js Canvas */}
      <div className="fixed inset-0 z-0">
        <Canvas shadows>
          <Suspense fallback={null}>
            <PerspectiveCamera makeDefault position={[0, 2, 8]} fov={45} />
            
            <CameraController activeScene={activeScene} mouseParallax={mouseParallax} />
            
            {/* Lighting */}
            <ambientLight intensity={0.5} color="#ffffff" />
            <directionalLight 
              position={[10, 20, 10]} 
              intensity={1.5} 
              color="#ffffff"
              castShadow
            />
            <pointLight position={[-5, 5, 5]} intensity={0.8} color="#fbbf24" />
            <pointLight position={[5, 5, -5]} intensity={0.8} color="#8b5cf6" />
            
            {/* Global particle system */}
            <ParticleSystem count={200} color="#ffffff" size={0.05} speed={0.5} />
            
            {/* Pokémon Models */}
            <PikachuModel 
              active={activePokemon === 'pikachu' || activePokemon === 'all'} 
              compareMode={activeScene === 'compare'}
            />
            <CharizardModel 
              active={activePokemon === 'charizard' || activePokemon === 'all'} 
              compareMode={activeScene === 'compare'}
            />
            <MewtwoModel 
              active={activePokemon === 'mewtwo' || activePokemon === 'all'} 
              compareMode={activeScene === 'compare'}
            />
            
            {/* Enhanced Floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
              <planeGeometry args={[30, 30]} />
              <meshStandardMaterial 
                color="#0f172a"
                roughness={0.8}
                metalness={0.2}
              />
            </mesh>
            
            {/* Environment removed - using preset causes HDR loading errors */}
          </Suspense>
        </Canvas>
      </div>
      
      {/* 📜 Scroll Sections */}
      <div className="relative z-0">
        {['hero', 'pikachu', 'charizard', 'mewtwo', 'compare'].map((scene) => (
          <div 
            key={scene}
            id={`section-${scene}`}
            className="h-screen"
          />
        ))}
      </div>
      
      {/* 💎 Luxury UI */}
      <LuxuryUI activeScene={activeScene} stats={pokemonData} />
      
      {/* 🎯 Navigation Dots */}
      <div className="fixed right-8 top-1/2 transform -translate-y-1/2 z-20 hidden lg:block">
        <div className="flex flex-col items-center gap-4">
          {['hero', 'pikachu', 'charizard', 'mewtwo', 'compare'].map((scene) => (
            <div key={scene} className="relative group">
              <div 
                className={`w-3 h-3 rounded-full transition-all duration-500 cursor-pointer ${
                  activeScene === scene 
                    ? 'scale-125' 
                    : 'scale-100 opacity-50 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: activeScene === scene ? '#ffffff' : '#6b7280',
                  boxShadow: activeScene === scene ? '0 0 20px rgba(255,255,255,0.5)' : 'none'
                }}
                onClick={() => {
                  document.getElementById(`section-${scene}`)?.scrollIntoView({ 
                    behavior: 'smooth' 
                  })
                }}
              />
              <span className="absolute right-8 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                {scene.charAt(0).toUpperCase() + scene.slice(1)}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      {/* 🔙 Back Button */}
      {onBack && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
          <button
            onClick={onBack}
            className="group relative px-10 py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full text-white font-bold text-lg hover:scale-105 active:scale-95 transition-all duration-300 shadow-2xl hover:shadow-purple-500/50 border border-purple-400/30 backdrop-blur-md"
          >
            <span className="flex items-center justify-center gap-3">
              <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Lobby
            </span>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
          </button>
        </div>
      )}
      
      {/* Custom Styles */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        .lux-title {
          font-weight: 900;
          line-height: 0.85;
          text-transform: uppercase;
          background: linear-gradient(45deg, #fbbf24, #f97316, #8b5cf6, #60a5fa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: 0 0 50px rgba(255,255,255,0.3);
        }
        
        body {
          overflow: auto;
          overflow-x: hidden;
          background: #000;
          scroll-behavior: smooth;
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.05);
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(45deg, #fbbf24, #8b5cf6);
          border-radius: 4px;
        }
        
        /* Smooth transitions */
        * {
          transition: background-color 0.3s ease;
        }
      `}</style>
    </div>
  )
}

export default PokemonComparison