import { useEffect, useRef, useState, useMemo, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { 
  PerspectiveCamera, 
  Environment,
  Text,
  Float,
  Sparkles,
  Stars,
  Billboard,
  Line
} from '@react-three/drei'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import * as THREE from 'three'
import SceneManager from '../../../three/SceneManager'
import CameraController from '../../../three/CameraController'
import useSound from '../../../hooks/useSound'

gsap.registerPlugin(ScrollTrigger)

// 🗺️ Region Data with Real Pokémon Distribution
const REGION_DATA = [
  {
    id: 1,
    name: 'KANTO',
    color: '#10b981',
    position: [0, 0, 0],
    pokemon: ['Bulbasaur', 'Charmander', 'Squirtle', 'Pikachu', 'Eevee'],
    description: 'The original 151 Pokémon',
    gyms: 8,
    legendary: ['Articuno', 'Zapdos', 'Moltres', 'Mewtwo', 'Mew'],
    terrain: 'forest'
  },
  {
    id: 2,
    name: 'JOHTO',
    color: '#3b82f6',
    position: [5, 1, 0],
    pokemon: ['Chikorita', 'Cyndaquil', 'Totodile', 'Ho-Oh', 'Lugia'],
    description: '100 new Pokémon discoveries',
    gyms: 8,
    legendary: ['Raikou', 'Entei', 'Suicune', 'Lugia', 'Ho-Oh'],
    terrain: 'mountain'
  },
  {
    id: 3,
    name: 'HOENN',
    color: '#ef4444',
    position: [-5, 2, 0],
    pokemon: ['Treecko', 'Torchic', 'Mudkip', 'Rayquaza', 'Groudon'],
    description: 'Diverse land and sea exploration',
    gyms: 8,
    legendary: ['Groudon', 'Kyogre', 'Rayquaza', 'Latias', 'Latios'],
    terrain: 'volcano'
  },
  {
    id: 4,
    name: 'SINNOH',
    color: '#8b5cf6',
    position: [0, 3, 0],
    pokemon: ['Turtwig', 'Chimchar', 'Piplup', 'Dialga', 'Palkia'],
    description: 'Mythical origins of Pokémon',
    gyms: 8,
    legendary: ['Dialga', 'Palkia', 'Giratina', 'Arceus'],
    terrain: 'snow'
  },
  {
    id: 5,
    name: 'UNOVA',
    color: '#f59e0b',
    position: [7, 4, 0],
    pokemon: ['Snivy', 'Tepig', 'Oshawott', 'Zekrom', 'Reshiram'],
    description: 'A whole new generation',
    gyms: 8,
    legendary: ['Zekrom', 'Reshiram', 'Kyurem'],
    terrain: 'city'
  },
  {
    id: 6,
    name: 'KALOS',
    color: '#ec4899',
    position: [-7, 5, 0],
    pokemon: ['Chespin', 'Fennekin', 'Froakie', 'Xerneas', 'Yveltal'],
    description: 'Beauty and battles',
    gyms: 8,
    legendary: ['Xerneas', 'Yveltal', 'Zygarde'],
    terrain: 'castle'
  }
]

// 🗺️ 3D Region Map Component
function RegionMap({ activeRegion, onRegionClick }) {
  const mapRef = useRef()
  const lineRef = useRef()
  const [hoveredRegion, setHoveredRegion] = useState(null)
  
  // Create path points for journey line
  const linePoints = useMemo(() => {
    const points = []
    REGION_DATA.forEach(region => {
      if (region?.position && Array.isArray(region.position) && region.position.length >= 3) {
        points.push(new THREE.Vector3(...region.position))
      }
    })
    return points
  }, [])
  
  useFrame((state) => {
    if (mapRef.current) {
      // Gentle rotation
      mapRef.current.rotation.y += 0.001
      
      // Pulsing effect for active region
      REGION_DATA.forEach((region, index) => {
        const regionMesh = mapRef.current.children[index]
        if (regionMesh && region.id === activeRegion?.id) {
          const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1
          regionMesh.scale.setScalar(scale)
        }
      })
    }
  })
  
  return (
    <group ref={mapRef}>
      {/* Journey path line */}
      {linePoints.length > 0 && (
        <Line
          ref={lineRef}
          points={linePoints}
          color="#10b981"
          lineWidth={3}
          transparent
          opacity={0.5}
        />
      )}
      
      {/* Region nodes */}
      {REGION_DATA.map((region) => {
        const isActive = activeRegion?.id === region.id
        const isHovered = hoveredRegion?.id === region.id
        
        return (
          <group key={region.id} position={region.position}>
            {/* Region sphere */}
            <mesh
              onPointerOver={() => setHoveredRegion(region)}
              onPointerOut={() => setHoveredRegion(null)}
              onClick={() => onRegionClick(region)}
            >
              <sphereGeometry args={[0.8, 32, 32]} />
              <meshPhysicalMaterial
                color={region.color || '#10b981'}
                emissive={region.color || '#10b981'}
                emissiveIntensity={Math.max(0, Math.min(1, isActive ? 0.8 : isHovered ? 0.5 : 0.2))}
                roughness={0.3}
                metalness={0.7}
                clearcoat={1}
                clearcoatRoughness={0.1}
              />
            </mesh>
            
            {/* Region name */}
            <Billboard position={[0, 1.5, 0]}>
              <Text
                fontSize={0.5}
                color="white"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.05}
                outlineColor="#000"
              >
                {region.name}
              </Text>
            </Billboard>
            
            {/* Connecting dots */}
            <mesh position={[0, -1, 0]}>
              <sphereGeometry args={[0.1, 16, 16]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            
            {/* Region-specific effects */}
            {isActive && (
              <Sparkles
                count={20}
                scale={[2, 2, 2]}
                size={0.2}
                color={region.color}
                speed={0.5}
              />
            )}
          </group>
        )
      })}
    </group>
  )
}

// 🌟 Star Constellation Effect
function Constellation({ regions }) {
  const groupRef = useRef()
  const linesRef = useRef([])
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.0005
    }
  })
  
  // Create constellation lines between regions
  const constellations = useMemo(() => {
    if (!regions || regions.length < 2) return []
    const lines = []
    for (let i = 0; i < regions.length - 1; i++) {
      if (regions[i]?.position && regions[i + 1]?.position) {
        lines.push({
          start: new THREE.Vector3(...regions[i].position),
          end: new THREE.Vector3(...regions[i + 1].position),
          color: regions[i].color || '#10b981'
        })
      }
    }
    return lines
  }, [regions])
  
  return (
    <group ref={groupRef}>
      {/* Background stars */}
      <Stars radius={50} depth={30} count={3000} factor={3} />
      
      {/* Constellation lines */}
      {constellations.length > 0 && constellations.map((line, index) => (
        <Line
          key={`constellation-${index}`}
          points={[line.start, line.end]}
          color={line.color}
          lineWidth={1}
          transparent
          opacity={0.3}
        />
      ))}
      
      {/* Floating particles */}
      {regions.map((region) => (
        <Sparkles
          key={`particles-${region.id}`}
          position={region.position}
          count={10}
          scale={[3, 3, 3]}
          size={0.1}
          color={region.color}
          speed={0.3}
        />
      ))}
    </group>
  )
}

// 🏆 Gym Badge Display
function GymBadgeDisplay({ region }) {
  const badgesRef = useRef([])
  
  useEffect(() => {
    if (badgesRef.current.length > 0) {
      badgesRef.current.forEach((badge, index) => {
        if (badge) {
          gsap.fromTo(badge,
            { scale: 0, rotation: Math.PI * 2 },
            {
              scale: 1,
              rotation: 0,
              duration: 0.8,
              delay: index * 0.1,
              ease: "back.out(1.7)"
            }
          )
        }
      })
    }
  }, [region])
  
  const regionColor = region?.color || '#10b981'
  
  return (
    <div className="flex flex-wrap justify-center gap-4 mt-6">
      {Array.from({ length: region?.gyms || 8 }).map((_, index) => (
        <div
          key={index}
          ref={el => badgesRef.current[index] = el}
          className="relative w-16 h-16 rounded-full flex items-center justify-center"
          style={{
            background: `radial-gradient(circle, ${regionColor}40, transparent)`,
            border: `2px solid ${regionColor}80`
          }}
        >
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: regionColor }}
          >
            {index + 1}
          </div>
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-full blur-md"
            style={{ backgroundColor: regionColor, opacity: 0.3 }}
          />
        </div>
      ))}
    </div>
  )
}

// 📊 Pokémon Distribution Chart
function PokemonDistribution({ region }) {
  const barsRef = useRef([])
  const [revealed, setRevealed] = useState(false)
  
  useEffect(() => {
    if (revealed && barsRef.current.length > 0) {
      barsRef.current.forEach((bar, index) => {
        if (bar) {
          gsap.to(bar, {
            width: `${Math.random() * 70 + 30}%`,
            duration: 1.5,
            delay: index * 0.2,
            ease: "power3.out"
          })
        }
      })
    }
  }, [revealed])
  
  const pokemonTypes = ['Grass', 'Fire', 'Water', 'Electric', 'Psychic', 'Dragon']
  
  return (
    <div className="mt-6">
      <button
        onClick={() => setRevealed(!revealed)}
        className="mb-4 px-4 py-2 rounded-lg text-sm font-bold"
        style={{ backgroundColor: region.color + '40', color: region.color }}
      >
        {revealed ? 'Hide Distribution' : 'Show Pokémon Distribution'}
      </button>
      
      {revealed && (
        <div className="space-y-3">
          {pokemonTypes.map((type, index) => (
            <div key={type} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">{type}</span>
                <span className="text-gray-400">{(Math.random() * 20 + 10).toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  ref={el => barsRef.current[index] = el}
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: '0%',
                    background: `linear-gradient(90deg, ${region.color}, ${region.color}cc)`
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const JourneyPage3 = ({ onBack, onRegionSelect }) => {
  const sectionRef = useRef(null)
  const containerRef = useRef(null)
  const titleRef = useRef(null)
  const regionsContainerRef = useRef(null)
  
  const { playClickSound, playWhooshSound, playDiscoverySound } = useSound()
  
  const [activeRegion, setActiveRegion] = useState(REGION_DATA[0])
  const [scrollProgress, setScrollProgress] = useState(0)
  const [discoveredRegions, setDiscoveredRegions] = useState([REGION_DATA[0]])
  const [showDiscovery, setShowDiscovery] = useState(false)
  
  // Calculate total stats
  const totalStats = useMemo(() => {
    return {
      regions: REGION_DATA.length,
      pokemon: REGION_DATA.reduce((sum, region) => sum + region.pokemon.length, 0),
      legendary: REGION_DATA.reduce((sum, region) => sum + region.legendary.length, 0),
      gyms: REGION_DATA.reduce((sum, region) => sum + region.gyms, 0)
    }
  }, [])
  
  useEffect(() => {
    if (!sectionRef.current || !titleRef.current || !containerRef.current) return

    const ctx = gsap.context(() => {
      // Hero title animation
      if (titleRef.current) {
        gsap.fromTo(titleRef.current,
          { opacity: 0, y: -100, rotationX: 45 },
          { 
            opacity: 1, 
            y: 0, 
            rotationX: 0,
            duration: 1.5, 
            ease: 'back.out(1.7)' 
          }
        )
      }
      
      // Scroll-triggered animations
      if (containerRef.current) {
        ScrollTrigger.create({
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1,
          onUpdate: (self) => {
            setScrollProgress(self.progress)
            
            // Region discovery based on scroll
            const discoveredCount = Math.floor(self.progress * REGION_DATA.length)
            const newDiscovered = REGION_DATA.slice(0, discoveredCount + 1)
            
            if (newDiscovered.length > discoveredRegions.length) {
              setDiscoveredRegions(newDiscovered)
              setActiveRegion(newDiscovered[newDiscovered.length - 1])
              if (playDiscoverySound) {
                playDiscoverySound()
              }
              setShowDiscovery(true)
              
              const discoveryEls = document.querySelectorAll('.discovery-highlight')
              if (discoveryEls.length > 0) {
                gsap.to(discoveryEls, {
                  scale: 1.3,
                  duration: 0.5,
                  yoyo: true,
                  repeat: 1,
                  ease: "power2.inOut"
                })
              }
              
              setTimeout(() => setShowDiscovery(false), 1000)
            }
            
            // Parallax effects
            if (titleRef.current) {
              gsap.to(titleRef.current, {
                y: -self.progress * 150,
                opacity: 1 - self.progress * 0.5,
                duration: 0.1
              })
            }
          }
        })
      }
      
      // Region cards animations
      if (regionsContainerRef.current) {
        const cards = regionsContainerRef.current.querySelectorAll('.region-card')
        cards.forEach((card, index) => {
          if (card) {
            ScrollTrigger.create({
              trigger: card,
              start: 'top 80%',
              end: 'top 20%',
              scrub: true,
              onEnter: () => {
                if (card) {
                  gsap.fromTo(card,
                    { opacity: 0, y: 50, scale: 0.8 },
                    { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'back.out(1.7)' }
                  )
                }
              }
            })
          }
        })
      }
    }, sectionRef)
    
    return () => ctx.revert()
  }, [discoveredRegions.length, playDiscoverySound])
  
  const handleRegionSelect = (region) => {
    if (playClickSound) {
      playClickSound()
    }
    setActiveRegion(region)
    
    // Fly to region animation
    const highlightEls = document.querySelectorAll('.region-highlight')
    if (highlightEls.length > 0) {
      gsap.to(highlightEls, {
        scale: 1.2,
        duration: 0.3,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut"
      })
    }
    
    if (onRegionSelect) {
      setTimeout(() => onRegionSelect(region), 500)
    }
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
  
  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen"
    >
      {/* 🌌 Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-b from-emerald-950 via-green-950 to-black">
        {/* Animated stars */}
        <div className="absolute inset-0">
          {[...Array(200)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full animate-pulse"
              style={{
                width: `${Math.random() * 3 + 1}px`,
                height: `${Math.random() * 3 + 1}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                background: `linear-gradient(45deg, #10b981, #22c55e)`,
                animation: `float ${3 + Math.random() * 4}s infinite ease-in-out`,
                animationDelay: `${Math.random() * 2}s`,
                opacity: 0.3 + Math.random() * 0.7,
              }}
            />
          ))}
        </div>
        
        {/* Constellation pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M 50,50 L 150,50 L 150,150 L 50,150 Z' fill='none' stroke='%2310b981' stroke-width='1'/%3E%3Ccircle cx='100' cy='100' r='40' fill='none' stroke='%2322c55e' stroke-width='1'/%3E%3C/svg%3E")`,
          backgroundSize: '200px',
        }} />
      </div>
      
      {/* 🎨 3D Scene */}
      <div className="fixed inset-0 z-0">
        <Canvas
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
            <PerspectiveCamera makeDefault position={[0, 5, 15]} fov={60} />
            <SceneManager enableFog={true}>
              <ambientLight intensity={0.4} />
              <directionalLight position={[10, 20, 10]} intensity={1.5} color="#10b981" />
              <pointLight position={[-10, 10, -10]} intensity={0.8} color="#22c55e" />
              <pointLight position={[10, 10, 10]} intensity={0.8} color="#3b82f6" />
              
              {/* Region Map */}
              {activeRegion && (
                <RegionMap 
                  activeRegion={activeRegion}
                  onRegionClick={handleRegionSelect}
                />
              )}
              
              {/* Constellation Effects */}
              {discoveredRegions && discoveredRegions.length > 0 && (
                <Constellation regions={discoveredRegions} />
              )}
              
              {/* Environment */}
              <Environment preset="night" />
            </SceneManager>
          </Suspense>
        </Canvas>
      </div>
      
      {/* 📜 Content Container */}
      <div ref={containerRef} className="relative z-10 min-h-[500vh] pt-32 pb-96">
        <div className="max-w-7xl mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-32">
            <h1
              ref={titleRef}
              className="text-8xl md:text-[10rem] lg:text-[12rem] font-black mb-4 text-transparent bg-clip-text"
              style={{
                background: 'linear-gradient(45deg, #10b981, #22c55e, #3b82f6, #8b5cf6)',
                textShadow: '0 0 80px rgba(16, 185, 129, 0.5)',
                letterSpacing: '-0.05em',
                fontFamily: "'Bebas Neue', sans-serif",
              }}
            >
              THE ADVENTURE
            </h1>
            
            <div className="space-y-6 max-w-3xl mx-auto">
              <p className="text-3xl md:text-4xl text-green-300 font-bold">
                Journey Across {totalStats.regions} Legendary Regions
              </p>
              <p className="text-xl text-gray-300">
                Discover {totalStats.pokemon}+ Pokémon species, conquer {totalStats.gyms} gyms, 
                and encounter {totalStats.legendary} legendary Pokémon
              </p>
            </div>
          </div>
          
          {/* Discovery Alert */}
          {showDiscovery && (
            <div className="fixed top-10 left-1/2 transform -translate-x-1/2 z-50 discovery-highlight">
              <div className="backdrop-blur-xl bg-green-500/20 rounded-2xl p-6 border-2 border-green-400 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="text-3xl">🎉</div>
                  <div>
                    <h3 className="text-xl font-bold text-green-300">New Region Discovered!</h3>
                    <p className="text-gray-300">{activeRegion.name}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Global Stats */}
          <div className="backdrop-blur-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-3xl p-8 md:p-12 border-2 border-green-400/30 mb-32">
            <h2 className="text-4xl font-bold text-green-300 mb-8 text-center">
              Pokémon World Atlas
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-5xl font-bold text-green-400 mb-2">{totalStats.regions}</div>
                <div className="text-gray-400">Regions</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-emerald-400 mb-2">{totalStats.pokemon}+</div>
                <div className="text-gray-400">Pokémon Species</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-teal-400 mb-2">{totalStats.gyms}</div>
                <div className="text-gray-400">Gym Challenges</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-cyan-400 mb-2">{totalStats.legendary}</div>
                <div className="text-gray-400">Legendary Pokémon</div>
              </div>
            </div>
          </div>
          
          {/* Active Region Spotlight */}
          <div className="region-highlight mb-32">
            <div className="backdrop-blur-xl bg-gradient-to-br from-white/5 to-white/10 rounded-3xl p-8 md:p-12 border-2 border-white/20">
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="lg:w-1/2">
                  <div className="flex items-center gap-4 mb-6">
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
                      style={{ backgroundColor: activeRegion.color + '40', color: activeRegion.color }}
                    >
                      {activeRegion.id}
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold text-white">{activeRegion.name}</h3>
                      <p className="text-gray-400">{activeRegion.description}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-bold text-green-300 mb-2">Notable Pokémon</h4>
                      <div className="flex flex-wrap gap-2">
                        {activeRegion.pokemon.map((pokemon, index) => (
                          <span 
                            key={index}
                            className="px-3 py-1 rounded-full text-sm"
                            style={{ backgroundColor: activeRegion.color + '20', color: activeRegion.color }}
                          >
                            {pokemon}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-bold text-green-300 mb-2">Legendary Encounters</h4>
                      <div className="flex flex-wrap gap-2">
                        {activeRegion.legendary.map((legend, index) => (
                          <span 
                            key={index}
                            className="px-3 py-1 rounded-full text-sm font-bold"
                            style={{ 
                              backgroundColor: activeRegion.color + '40', 
                              color: 'white',
                              textShadow: '0 0 10px currentColor'
                            }}
                          >
                            ⭐ {legend}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="lg:w-1/2">
                  {/* Gym Badges */}
                  <div className="mb-6">
                    <h4 className="text-lg font-bold text-green-300 mb-4">Gym Badges</h4>
                    <GymBadgeDisplay region={activeRegion} />
                  </div>
                  
                  {/* Pokémon Distribution */}
                  <PokemonDistribution region={activeRegion} />
                </div>
              </div>
            </div>
          </div>
          
          {/* All Regions Grid */}
          <div ref={regionsContainerRef}>
            <h2 className="text-4xl font-bold text-center mb-12">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400">
                Explore All Regions
              </span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {REGION_DATA.map((region) => {
                const isDiscovered = discoveredRegions.some(r => r.id === region.id)
                
                return (
                  <div
                    key={region.id}
                    className={`region-card backdrop-blur-xl rounded-2xl p-6 border-2 transition-all duration-500 cursor-pointer ${
                      isDiscovered 
                        ? 'border-green-400/30 hover:border-green-400 hover:scale-105' 
                        : 'border-gray-700/50 opacity-50'
                    }`}
                    onClick={() => isDiscovered && handleRegionSelect(region)}
                    style={{
                      background: `linear-gradient(135deg, ${region.color}10, transparent 50%)`,
                      boxShadow: isDiscovered ? `0 20px 40px ${region.color}20` : 'none'
                    }}
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold"
                        style={{ 
                          backgroundColor: region.color + '40', 
                          color: region.color 
                        }}
                      >
                        {region.id}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{region.name}</h3>
                        <p className="text-sm text-gray-400">{region.description}</p>
                      </div>
                    </div>
                    
                    {isDiscovered ? (
                      <>
                        <div className="mb-4">
                          <div className="flex justify-between text-sm text-gray-400 mb-2">
                            <span>Pokémon Discovered</span>
                            <span>{region.pokemon.length}</span>
                          </div>
                          <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all duration-1000"
                              style={{ 
                                width: `${(region.pokemon.length / 10) * 100}%`,
                                backgroundColor: region.color
                              }}
                            />
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <span className="px-2 py-1 rounded" style={{ backgroundColor: region.color + '20' }}>
                            {region.gyms} Gyms
                          </span>
                          <span className="px-2 py-1 rounded" style={{ backgroundColor: region.color + '20' }}>
                            {region.legendary.length} Legendary
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-3xl mb-2">🔒</div>
                        <p className="text-gray-500">Scroll to discover this region</p>
                      </div>
                    )}
                    
                    {/* Discovery status */}
                    <div className="mt-4 text-right">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        isDiscovered 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-gray-800 text-gray-500'
                      }`}>
                        {isDiscovered ? '✓ Discovered' : 'Locked'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          
          {/* Journey Timeline */}
          <div className="mt-32 backdrop-blur-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-3xl p-8 md:p-12 border-2 border-emerald-400/30">
            <h2 className="text-4xl font-bold text-center text-white mb-8">
              Your Journey Progress
            </h2>
            
            <div className="relative">
              {/* Progress line */}
              <div className="absolute left-0 top-8 bottom-8 w-1 bg-emerald-500/30 rounded-full" />
              
              <div className="space-y-12 ml-8">
                {REGION_DATA.map((region, index) => {
                  const isCompleted = index < discoveredRegions.length
                  const isCurrent = index === discoveredRegions.length - 1
                  
                  return (
                    <div key={region.id} className="relative">
                      {/* Timeline dot */}
                      <div 
                        className="absolute -left-12 top-2 w-8 h-8 rounded-full flex items-center justify-center"
                        style={{
                          backgroundColor: isCompleted ? region.color + '40' : '#374151',
                          border: `2px solid ${isCompleted ? region.color : '#4b5563'}`,
                          boxShadow: isCurrent ? `0 0 20px ${region.color}` : 'none'
                        }}
                      >
                        {isCompleted ? (
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: region.color }} />
                        ) : (
                          <span className="text-gray-500">{index + 1}</span>
                        )}
                      </div>
                      
                      <div 
                        className={`p-6 rounded-xl transition-all duration-500 ${
                          isCompleted 
                            ? 'bg-gradient-to-r from-white/5 to-white/10' 
                            : 'bg-gray-900/30'
                        }`}
                        style={{
                          borderLeft: `4px solid ${isCompleted ? region.color : 'transparent'}`
                        }}
                      >
                        <h3 className="text-2xl font-bold mb-2" style={{ 
                          color: isCompleted ? region.color : '#9ca3af' 
                        }}>
                          {region.name}
                        </h3>
                        <p className="text-gray-300 mb-4">{region.description}</p>
                        
                        {isCompleted && (
                          <div className="flex gap-2">
                            {region.pokemon.slice(0, 3).map((pokemon, idx) => (
                              <span 
                                key={idx}
                                className="px-3 py-1 text-sm rounded-full"
                                style={{ backgroundColor: region.color + '20', color: region.color }}
                              >
                                {pokemon}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
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
            className="group px-8 py-3 bg-gradient-to-r from-green-500/90 to-emerald-500/90 backdrop-blur-sm rounded-full text-white font-bold text-lg hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-green-500/50 border border-green-400/30"
          >
            <span className="flex items-center gap-2">
              ← Back
            </span>
          </button>
          
          {/* Progress Indicator */}
          <div className="flex flex-col items-center gap-2">
            <div className="text-sm text-green-300 font-mono">
              DISCOVERED: {discoveredRegions.length}/{REGION_DATA.length}
            </div>
            <div className="w-48 h-1 bg-green-500/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${(discoveredRegions.length / REGION_DATA.length) * 100}%` }}
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
        
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </section>
  )
}

export default JourneyPage3