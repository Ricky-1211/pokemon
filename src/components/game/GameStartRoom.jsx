import { useEffect, useRef, useState, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Environment, PerspectiveCamera, Text, Sky, Cloud, Stars, Sparkles, Trail, Billboard, useTexture, Float } from '@react-three/drei'
import { gsap } from 'gsap'
import * as THREE from 'three'
import { Physics, useBox, useSphere, usePlane, useCylinder } from '@react-three/cannon'
import SceneManager from '../../three/SceneManager'
import CameraController from '../../three/CameraController'
import useSound from '../../hooks/useSound'

// Enhanced Pokémon data with behaviors and models
const POKEMON_DATA = {
  "Bulbasaur": { 
    type: "grass", 
    scale: 0.5, 
    speed: 0.5, 
    catchRate: 0.6, 
    behavior: "calm", 
    animations: ["idle", "walk", "sleep"],
    color: "#22c55e"
  },
  "Charmander": { 
    type: "fire", 
    scale: 0.5, 
    speed: 0.7, 
    catchRate: 0.5, 
    behavior: "active", 
    animations: ["idle", "walk", "attack"],
    color: "#ef4444"
  },
  "Squirtle": { 
    type: "water", 
    scale: 0.4, 
    speed: 0.4, 
    catchRate: 0.7, 
    behavior: "playful", 
    animations: ["idle", "walk", "swim"],
    color: "#3b82f6"
  },
  "Pikachu": { 
    type: "electric", 
    scale: 0.4, 
    speed: 0.8, 
    catchRate: 0.4, 
    behavior: "energetic", 
    animations: ["idle", "run", "jump"],
    color: "#f59e0b"
  },
  "Pidgey": { 
    type: "flying", 
    scale: 0.3, 
    speed: 1.0, 
    catchRate: 0.8, 
    behavior: "timid", 
    animations: ["idle", "fly", "perch"],
    color: "#8b5cf6"
  },
  "Geodude": { 
    type: "rock", 
    scale: 0.4, 
    speed: 0.3, 
    catchRate: 0.7, 
    behavior: "still", 
    animations: ["idle", "roll", "sleep"],
    color: "#78716c"
  },
  "Caterpie": { 
    type: "bug", 
    scale: 0.3, 
    speed: 0.4, 
    catchRate: 0.8, 
    behavior: "slow", 
    animations: ["idle", "crawl", "eat"],
    color: "#84cc16"
  },
  "Onix": { 
    type: "rock", 
    scale: 0.8, 
    speed: 0.2, 
    catchRate: 0.5, 
    behavior: "slow", 
    animations: ["idle", "dig", "sleep"],
    color: "#57534e"
  },
  "Zubat": { 
    type: "flying", 
    scale: 0.3, 
    speed: 1.2, 
    catchRate: 0.7, 
    behavior: "fast", 
    animations: ["idle", "fly", "hover"],
    color: "#7c3aed"
  },
  "Magikarp": { 
    type: "water", 
    scale: 0.3, 
    speed: 0.2, 
    catchRate: 0.9, 
    behavior: "dumb", 
    animations: ["idle", "flop", "splash"],
    color: "#0ea5e9"
  }
}

// Enhanced region data with more detailed terrain
const REGION_DATA = {
  name: "KANTO WILDERNESS",
  cities: [
    {
      id: 1,
      name: "GRASSLAND",
      position: [0, 0.2, 0],
      pokemon: ["Bulbasaur", "Pidgey", "Caterpie"],
      color: "#22c55e",
      description: "Lush open fields with tall grass",
      terrain: "grass",
      pokemonCount: 8,
      foliage: true,
      trees: 5
    },
    {
      id: 2,
      name: "MYSTIC FOREST",
      position: [-8, 0.5, -4],
      pokemon: ["Pidgey", "Caterpie", "Zubat"],
      color: "#16a34a",
      description: "Dense mystical forest with glowing mushrooms",
      terrain: "forest",
      pokemonCount: 10,
      foliage: true,
      trees: 12
    },
    {
      id: 3,
      name: "ROCKY PEAKS",
      position: [7, 2.5, -3],
      pokemon: ["Geodude", "Onix"],
      color: "#57534e",
      description: "Towering rocky mountains and caves",
      terrain: "mountain",
      pokemonCount: 6,
      foliage: false,
      trees: 2
    },
    {
      id: 4,
      name: "CRYSTAL LAKE",
      position: [2, -0.8, 6],
      pokemon: ["Squirtle", "Magikarp"],
      color: "#0ea5e9",
      description: "Crystal clear lake with underwater caves",
      terrain: "water",
      pokemonCount: 5,
      foliage: true,
      trees: 3
    },
    {
      id: 5,
      name: "VOLCANIC AREA",
      position: [-5, 1.5, 8],
      pokemon: ["Charmander"],
      color: "#dc2626",
      description: "Active volcanic area with hot springs",
      terrain: "volcano",
      pokemonCount: 4,
      foliage: false,
      trees: 0
    },
    {
      id: 6,
      name: "THUNDER PLAINS",
      position: [10, 0.3, 1],
      pokemon: ["Pikachu"],
      color: "#f59e0b",
      description: "Stormy plains with frequent lightning",
      terrain: "electric",
      pokemonCount: 3,
      foliage: false,
      trees: 1
    }
  ],
  terrainFeatures: [
    { type: "mountain", position: [5, 0, -1], scale: [4, 3, 4] },
    { type: "mountain", position: [8, 0, 2], scale: [3, 2, 3] },
    { type: "mountain", position: [10, 0, -3], scale: [5, 4, 5] },
    { type: "forest", position: [-6, 0, -3], scale: [8, 2, 8] },
    { type: "lake", position: [0, -0.5, 5], scale: [4, 0.1, 4] },
    { type: "hill", position: [-3, 0, 4], scale: [3, 1.5, 3] },
    { type: "volcano", position: [-5, 0, 8], scale: [3, 2, 3] },
    { type: "river", position: [2, -0.3, -2], scale: [10, 0.1, 2] }
  ]
}

// Tree component for forest areas
function Tree({ position, type = "oak" }) {
  const treeRef = useRef()
  const height = 3 + Math.random() * 2
  
  useFrame((state) => {
    if (treeRef.current) {
      // Gentle swaying in wind
      treeRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * 0.05
    }
  })

  const getTreeColor = () => {
    const colors = {
      oak: { trunk: "#8b4513", leaves: "#22c55e" },
      pine: { trunk: "#654321", leaves: "#166534" },
      palm: { trunk: "#a0522d", leaves: "#16a34a" }
    }
    return colors[type] || colors.oak
  }

  const colors = getTreeColor()

  return (
    <group position={position} ref={treeRef}>
      {/* Tree trunk */}
      <mesh castShadow position={[0, height/2, 0]}>
        <cylinderGeometry args={[0.2, 0.3, height, 8]} />
        <meshStandardMaterial color={colors.trunk} roughness={0.9} />
      </mesh>
      
      {/* Tree leaves/crown */}
      <mesh position={[0, height + 0.5, 0]} castShadow>
        <sphereGeometry args={[1.2, 8, 6]} />
        <meshStandardMaterial color={colors.leaves} roughness={0.8} />
      </mesh>
      <mesh position={[0, height + 1.2, 0]} castShadow>
        <sphereGeometry args={[0.8, 8, 6]} />
        <meshStandardMaterial color={colors.leaves} roughness={0.8} />
      </mesh>
    </group>
  )
}

// Flower component for grass areas
function Flower({ position }) {
  const flowerRef = useRef()
  const colors = ['#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899']
  const color = colors[Math.floor(Math.random() * colors.length)]
  const height = 0.3 + Math.random() * 0.2

  useFrame((state) => {
    if (flowerRef.current) {
      // Gentle sway
      flowerRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.1
    }
  })

  return (
    <group position={position} ref={flowerRef}>
      <mesh position={[0, height/2, 0]}>
        <cylinderGeometry args={[0.03, 0.03, height, 6]} />
        <meshStandardMaterial color="#22c55e" />
      </mesh>
      <mesh position={[0, height + 0.1, 0]}>
        <sphereGeometry args={[0.15, 8, 6]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
      </mesh>
    </group>
  )
}

// Enhanced Pokémon Component with Behaviors
function Pokemon({ name, position, onCaught, behavior = "wander" }) {
  const [ref, api] = useSphere(() => ({
    mass: 0.5,
    position,
    args: [0.3],
    material: { restitution: 0.3, friction: 0.5 }
  }))
  
  const [state, setState] = useState("idle")
  const [target, setTarget] = useState([0, 0, 0])
  const [isSleeping, setIsSleeping] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [scale, setScale] = useState(1)
  const [rotationY, setRotationY] = useState(0)
  
  const pokemonData = POKEMON_DATA[name] || { 
    type: "normal", 
    scale: 0.4, 
    speed: 0.5, 
    catchRate: 0.6, 
    behavior: "wander",
    color: "#94a3b8"
  }

  useFrame((state, delta) => {
    if (!ref.current) return

    const time = state.clock.getElapsedTime()
    const speed = pokemonData.speed * 0.5

    // Behavior-based animations
    switch(behavior) {
      case "sleep":
        if (!isSleeping) {
          setIsSleeping(true)
          setState("sleep")
          gsap.to(ref.current.position, {
            y: position[1] + 0.1,
            duration: 0.5,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut"
          })
        }
        break

      case "play":
        if (!isPlaying) {
          setIsPlaying(true)
          setState("play")
          // Jumping animation
          gsap.to(ref.current.position, {
            y: position[1] + 0.3,
            duration: 0.7,
            yoyo: true,
            repeat: -1,
            ease: "power2.out"
          })
          // Spinning animation
          gsap.to(ref.current.rotation, {
            y: Math.PI * 2,
            duration: 2,
            repeat: -1,
            ease: "none"
          })
        }
        break

      case "wander":
        // Random wandering with target changes
        if (time % 5 < delta) {
          const newTarget = [
            position[0] + (Math.random() - 0.5) * 10,
            position[1],
            position[2] + (Math.random() - 0.5) * 10
          ]
          setTarget(newTarget)
          setState("walk")
        }

        // Move towards target
        const direction = new THREE.Vector3(
          target[0] - ref.current.position.x,
          target[1] - ref.current.position.y,
          target[2] - ref.current.position.z
        ).normalize()

        if (direction.length() > 0.5) {
          ref.current.position.x += direction.x * speed * delta
          ref.current.position.z += direction.z * speed * delta
          
          // Rotate to face direction
          setRotationY(Math.atan2(direction.x, direction.z))
          ref.current.rotation.y = rotationY
        }

        // Idle animation when close to target
        if (direction.length() < 2) {
          setState("idle")
          // Gentle bounce
          ref.current.position.y = position[1] + Math.sin(time * 3) * 0.05
        }
        break

      case "hide":
        // Hide and peek behavior
        if (Math.sin(time * 0.5) > 0.7) {
          setScale(1)
          setState("idle")
        } else {
          setScale(0.3)
          setState("hide")
        }
        break
    }

    // Apply scale for hide behavior
    ref.current.scale.setScalar(scale)
  })

  const handleCatchAttempt = () => {
    // Visual feedback when pokeball is near
    gsap.to(ref.current.scale, {
      x: 1.2,
      y: 1.2,
      z: 1.2,
      duration: 0.1,
      yoyo: true,
      repeat: 2,
      ease: "power2.out"
    })
  }

  const handleCatch = () => {
    const success = Math.random() < pokemonData.catchRate
    
    if (success) {
      // Capture animation
      gsap.to(ref.current.scale, {
        x: 0.1,
        y: 0.1,
        z: 0.1,
        duration: 0.5,
        ease: "back.in(2)",
        onComplete: () => {
          onCaught(name)
        }
      })
      return true
    } else {
      // Escape animation
      gsap.to(ref.current.position, {
        y: position[1] + 2,
        duration: 0.3,
        ease: "power2.out",
        yoyo: true,
        repeat: 1
      })
      return false
    }
  }

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <group ref={ref} rotation={[0, rotationY, 0]}>
        {/* Pokémon body */}
        <mesh castShadow>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshStandardMaterial
            color={pokemonData.color}
            emissive={pokemonData.color}
            emissiveIntensity={0.3}
            roughness={0.4}
            metalness={0.2}
          />
        </mesh>
        
        {/* Eyes - show different states */}
        <mesh position={[0.15, 0.1, 0.3]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial 
            color={isSleeping ? "#64748b" : "white"} 
            emissive={isSleeping ? "#64748b" : "white"}
            emissiveIntensity={0.2}
          />
        </mesh>
        <mesh position={[-0.15, 0.1, 0.3]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial 
            color={isSleeping ? "#64748b" : "white"} 
            emissive={isSleeping ? "#64748b" : "white"}
            emissiveIntensity={0.2}
          />
        </mesh>
        
        {/* Type-specific effects */}
        {pokemonData.type === "fire" && (
          <>
            <Sparkles count={20} scale={[0.6, 0.6, 0.6]} size={0.1} color="#f97316" speed={0.3} />
            <pointLight position={[0, 0.5, 0]} color="#f97316" intensity={0.5} distance={2} />
          </>
        )}
        
        {pokemonData.type === "electric" && (
          <>
            <Sparkles count={10} scale={[0.4, 0.4, 0.4]} size={0.08} color="#fbbf24" speed={0.5} />
            <Trail
              width={0.1}
              length={3}
              color={new THREE.Color('#fbbf24')}
              attenuation={(t) => t * t}
            >
              <mesh position={[0, 0.3, 0]}>
                <sphereGeometry args={[0.05]} />
                <meshBasicMaterial color="#fbbf24" />
              </mesh>
            </Trail>
          </>
        )}
        
        {pokemonData.type === "water" && (
          <mesh position={[0, -0.2, 0]}>
            <sphereGeometry args={[0.5, 8, 8, 0, Math.PI]} />
            <meshStandardMaterial 
              color="#0ea5e9"
              transparent
              opacity={0.3}
              roughness={0.1}
              metalness={0.9}
            />
          </mesh>
        )}
        
        {/* Status indicator */}
        <Billboard>
          <Text
            position={[0, 1.2, 0]}
            fontSize={0.3}
            color="white"
            outlineWidth={0.02}
            outlineColor="#000000"
          >
            {name}
          </Text>
        </Billboard>
      </group>
    </Float>
  )
}

// Enhanced Pokéball Component with Physics
function Pokeball({ position, velocity, onCatch, catchingPokemon, pokemonPosition }) {
  const [ref, api] = useSphere(() => ({
    mass: 0.5,
    position,
    velocity,
    args: [0.2],
    material: { restitution: 0.7, friction: 0.3 }
  }))
  
  const [isOpen, setIsOpen] = useState(false)
  const [isCaught, setIsCaught] = useState(false)
  const [isFlying, setIsFlying] = useState(true)
  
  useFrame((state) => {
    if (!ref.current) return
    
    // Add spinning animation while flying
    if (isFlying && !isCaught) {
      ref.current.rotation.x += 0.2
      ref.current.rotation.y += 0.2
    }
    
    // Check if close to pokemon for catch attempt
    if (pokemonPosition && isFlying) {
      const distance = ref.current.position.distanceTo(
        new THREE.Vector3(...pokemonPosition)
      )
      
      if (distance < 2) {
        setIsFlying(false)
        api.velocity.set(0, 0, 0)
        api.angularVelocity.set(0, 0, 0)
        
        if (catchingPokemon) {
          setTimeout(() => {
            setIsOpen(true)
            
            // Shake animation
            gsap.to(ref.current.position, {
              x: "+=0.1",
              duration: 0.1,
              yoyo: true,
              repeat: 5,
              ease: "power2.inOut",
              onComplete: () => {
                const success = Math.random() > 0.4 // 60% catch rate
                
                if (success) {
                  setIsCaught(true)
                  // Success effects
                  gsap.to(ref.current.scale, {
                    x: 1.5,
                    y: 1.5,
                    z: 1.5,
                    duration: 0.5,
                    ease: "elastic.out(1, 0.5)"
                  })
                  
                  // Emit particles on success
                  setTimeout(() => {
                    onCatch(true)
                  }, 1000)
                } else {
                  setIsOpen(false)
                  // Escape animation
                  api.velocity.set(
                    (Math.random() - 0.5) * 5,
                    3,
                    (Math.random() - 0.5) * 5
                  )
                  setIsFlying(true)
                  onCatch(false)
                }
              }
            })
          }, 500)
        }
      }
    }
  })

  return (
    <mesh ref={ref} castShadow>
      <sphereGeometry args={[0.2, 32, 32]} />
      <meshStandardMaterial
        color={isCaught ? "#22c55e" : "#ef4444"}
        metalness={0.8}
        roughness={0.2}
        emissive={isCaught ? "#22c55e" : "#ef4444"}
        emissiveIntensity={0.5}
      />
      
      {/* Center line */}
      <mesh position={[0, 0, 0.21]}>
        <ringGeometry args={[0.1, 0.2, 32]} />
        <meshStandardMaterial color="black" metalness={0.9} side={THREE.DoubleSide} />
      </mesh>
      
      {/* Center button */}
      <mesh position={[0, 0, 0.22]}>
        <circleGeometry args={[0.06, 16]} />
        <meshStandardMaterial color="white" metalness={1} roughness={0.1} />
      </mesh>
      
      {/* Open animation */}
      {isOpen && (
        <>
          <mesh position={[0, 0.25, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <sphereGeometry args={[0.25, 32, 16, 0, Math.PI]} />
            <meshStandardMaterial
              color="white"
              metalness={0.8}
              roughness={0.2}
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* Light beam when opening */}
          <pointLight position={[0, 0.5, 0]} color="#ffffff" intensity={2} distance={3} />
        </>
      )}
      
      {/* Trail effect */}
      <Trail
        width={0.1}
        length={5}
        color={new THREE.Color('#ef4444')}
        attenuation={(t) => t * t}
      >
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.05]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
      </Trail>
    </mesh>
  )
}

// Enhanced Terrain with details
function RealisticTerrain() {
  const terrainRef = useRef()
  
  // Generate trees and flowers
  const trees = useMemo(() => {
    const trees = []
    for (let i = 0; i < 50; i++) {
      trees.push({
        position: [
          (Math.random() - 0.5) * 40,
          0,
          (Math.random() - 0.5) * 40
        ],
        type: ["oak", "pine", "palm"][Math.floor(Math.random() * 3)]
      })
    }
    return trees
  }, [])

  const flowers = useMemo(() => {
    const flowers = []
    for (let i = 0; i < 100; i++) {
      flowers.push({
        position: [
          (Math.random() - 0.5) * 40,
          0.1,
          (Math.random() - 0.5) * 40
        ]
      })
    }
    return flowers
  }, [])

  return (
    <>
      {/* Main ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[100, 100, 100, 100]} />
        <meshStandardMaterial 
          color="#1e3a2a"
          roughness={0.8}
          metalness={0.1}
          side={THREE.DoubleSide}
        />
        
        {/* Grass pattern */}
        <meshStandardMaterial 
          color="#22c55e"
          roughness={0.9}
          metalness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Water */}
      <mesh 
        position={[0, -0.3, 5]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[15, 32]} />
        <meshStandardMaterial 
          color="#0ea5e9"
          transparent
          opacity={0.6}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>

      {/* Mountains */}
      {REGION_DATA.terrainFeatures.map((feature, index) => {
        if (feature.type === "mountain") {
          return (
            <mesh key={`mountain-${index}`} position={feature.position} castShadow>
              <coneGeometry args={[feature.scale[0], feature.scale[1], 16]} />
              <meshStandardMaterial 
                color="#64748b"
                roughness={0.9}
                metalness={0.1}
              />
            </mesh>
          )
        }
        
        if (feature.type === "volcano") {
          return (
            <group key={`volcano-${index}`} position={feature.position}>
              <mesh castShadow>
                <coneGeometry args={[feature.scale[0], feature.scale[1], 16]} />
                <meshStandardMaterial 
                  color="#451a03"
                  roughness={0.8}
                  metalness={0.2}
                />
              </mesh>
              {/* Lava */}
              <mesh position={[0, 1, 0]}>
                <sphereGeometry args={[0.5, 16, 16]} />
                <meshStandardMaterial 
                  color="#dc2626"
                  emissive="#dc2626"
                  emissiveIntensity={0.8}
                />
              </mesh>
            </group>
          )
        }
        
        return null
      })}
      
      {/* Trees */}
      {trees.map((tree, i) => (
        <Tree key={`tree-${i}`} position={tree.position} type={tree.type} />
      ))}
      
      {/* Flowers */}
      {flowers.map((flower, i) => (
        <Flower key={`flower-${i}`} position={flower.position} />
      ))}
    </>
  )
}

// Pokémon Generator Component
function PokemonGenerator({ city, onPokemonCaught }) {
  const [pokemonList, setPokemonList] = useState([])
  
  useEffect(() => {
    if (!city) return
    
    // Generate random Pokémon for this city
    const generatePokemon = () => {
      const pokemons = []
      const behaviors = ["wander", "sleep", "play", "hide"]
      
      for (let i = 0; i < city.pokemonCount; i++) {
        const pokemonName = city.pokemon[Math.floor(Math.random() * city.pokemon.length)]
        const behavior = behaviors[Math.floor(Math.random() * behaviors.length)]
        const position = [
          city.position[0] + (Math.random() - 0.5) * 15,
          0.5,
          city.position[2] + (Math.random() - 0.5) * 15
        ]
        
        pokemons.push({
          id: `${city.id}-${i}`,
          name: pokemonName,
          position,
          behavior
        })
      }
      
      setPokemonList(pokemons)
    }
    
    generatePokemon()
    
    // Respawn Pokémon periodically
    const interval = setInterval(() => {
      if (pokemonList.length < city.pokemonCount) {
        generatePokemon()
      }
    }, 10000)
    
    return () => clearInterval(interval)
  }, [city])

  return (
    <>
      {pokemonList.map(pokemon => (
        <Pokemon
          key={pokemon.id}
          name={pokemon.name}
          position={pokemon.position}
          behavior={pokemon.behavior}
          onCaught={onPokemonCaught}
        />
      ))}
    </>
  )
}

const GameStartRoom = ({ onBackToLobby }) => {
  const sectionRef = useRef(null)
  const titleRef = useRef(null)
  const contentRef = useRef(null)
  const { playClickSound, playHoverSound, playAttackSound, playVictorySound } = useSound()
  
  // Game state
  const [hoveredCity, setHoveredCity] = useState(null)
  const [selectedCity, setSelectedCity] = useState(null)
  const [cameraPosition, setCameraPosition] = useState([0, 15, 20])
  const [scrollProgress, setScrollProgress] = useState(0)
  const [pokeballs, setPokeballs] = useState([])
  const [caughtPokemon, setCaughtPokemon] = useState([])
  const [pokeballCount, setPokeballCount] = useState(20)
  const [score, setScore] = useState(0)
  const [isThrowing, setIsThrowing] = useState(false)
  const [currentTarget, setCurrentTarget] = useState(null)

  // Camera path for scrolling
  const cameraPath = useRef([
    [0, 30, 40],
    [0, 20, 30],
    [0, 10, 20],
    [0, 5, 15],
    [0, 3, 10]
  ])

  // Handle scroll for camera movement
  useEffect(() => {
    const handleScroll = (e) => {
      const scrollY = window.scrollY
      const windowHeight = window.innerHeight
      const scrollableHeight = document.documentElement.scrollHeight - windowHeight
      const progress = Math.min(Math.max(scrollY / scrollableHeight, 0), 1)
      
      setScrollProgress(progress)
      
      const pathIndex = progress * (cameraPath.current.length - 1)
      const index = Math.floor(pathIndex)
      const fraction = pathIndex - index
      
      if (index < cameraPath.current.length - 1) {
        const start = cameraPath.current[index]
        const end = cameraPath.current[index + 1]
        const newPos = start.map((coord, i) => 
          coord + (end[i] - coord) * fraction
        )
        setCameraPosition(newPos)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Initial animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      tl.fromTo(
        sectionRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.5 }
      )
      .fromTo(
        titleRef.current,
        { opacity: 0, y: 100, scale: 0.5 },
        { opacity: 1, y: 0, scale: 1, duration: 1.5, ease: "elastic.out(1, 0.5)" },
        '-=0.3'
      )
      .fromTo(
        '.city-card',
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: 'back.out(1.7)',
        },
        '-=0.5'
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  // Handle throwing Pokéball
  const handleThrowPokeball = () => {
    if (pokeballCount <= 0 || isThrowing) return
    
    playAttackSound()
    setIsThrowing(true)
    
    // Reduce Pokéball count
    setPokeballCount(prev => prev - 1)
    
    // Determine throw direction (towards center of view or random)
    const throwVector = [
      (Math.random() - 0.5) * 8,
      8 + Math.random() * 3,
      (Math.random() - 0.5) * 8
    ]
    
    const newPokeball = {
      id: Date.now(),
      position: [0, 1, 0], // Throw from near camera
      velocity: throwVector,
      target: currentTarget
    }
    
    setPokeballs(prev => [...prev, newPokeball])
    
    // Reset throwing state
    setTimeout(() => setIsThrowing(false), 1000)
  }

  // Handle Pokémon catch
  const handlePokemonCatch = (pokemonName) => {
    playVictorySound()
    setCaughtPokemon(prev => [...prev, pokemonName])
    setScore(prev => prev + 100)
    
    // Celebration animation
    gsap.to(titleRef.current, {
      scale: 1.3,
      duration: 0.2,
      yoyo: true,
      repeat: 2,
      ease: "power2.out"
    })
    
    // Add Pokéball for successful catch
    setPokeballCount(prev => prev + 2)
  }

  // Handle Pokéball catch result
  const handlePokeballResult = (pokeballId, success) => {
    if (success) {
      playVictorySound()
    }
    
    // Remove pokeball after result
    setTimeout(() => {
      setPokeballs(prev => prev.filter(p => p.id !== pokeballId))
    }, 2000)
  }

  // Select city to visit
  const handleCitySelect = (city) => {
    setSelectedCity(city)
    playClickSound()
    
    // Fly camera to city
    gsap.to(cameraPosition, {
      x: city.position[0],
      y: city.position[1] + 8,
      z: city.position[2] + 12,
      duration: 2,
      ease: "power3.inOut",
      onUpdate: () => {
        setCameraPosition([cameraPosition[0], cameraPosition[1], cameraPosition[2]])
      }
    })
  }

  // Return to overview
  const handleBackToOverview = () => {
    setSelectedCity(null)
    setCameraPosition([0, 15, 20])
  }

  const handleBack = () => {
    playClickSound()
    const tl = gsap.timeline({
      onComplete: () => {
        if (onBackToLobby) onBackToLobby()
      },
    })

    tl.to(sectionRef.current, {
      opacity: 0,
      scale: 0.95,
      duration: 0.4,
      ease: 'power2.in',
    })
  }

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[300vh] w-full overflow-hidden"
    >
      {/* Animated gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-emerald-950/40 via-green-950/40 to-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.15),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(34,197,94,0.1),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(101, 163, 13, 0.1),transparent_60%)]" />
        {/* Animated particles */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_var(--mouse-x)_var(--mouse-y),rgba(34,197,94,0.1),transparent_20%)]" />
      </div>

      {/* 3D Scene */}
      <div className="fixed inset-0 z-0">
        <Canvas shadows camera={{ position: cameraPosition, fov: 60 }}>
          <Physics gravity={[0, -9.8, 0]}>
            <SceneManager enableFog={true} fogColor="#0f172a" fogNear={5} fogFar={50}>
              {/* Lighting */}
              <ambientLight intensity={0.6} />
              <directionalLight 
                position={[20, 30, 20]} 
                intensity={1.5} 
                castShadow
                shadow-mapSize={[4096, 4096]}
                shadow-camera-left={-20}
                shadow-camera-right={20}
                shadow-camera-top={20}
                shadow-camera-bottom={-20}
              />
              <hemisphereLight args={["#22c55e", "#1e40af", 0.4]} />
              
              {/* Sky and Atmosphere */}
              <Sky distance={1000000} sunPosition={[100, 20, 100]} inclination={0.6} azimuth={0.25} />
              <Stars radius={300} depth={100} count={10000} factor={6} />
              <Cloud position={[-15, 25, -15]} speed={0.3} opacity={0.9} segments={20} />
              <Cloud position={[20, 20, 10]} speed={0.2} opacity={0.7} />
              
              {/* Terrain */}
              <RealisticTerrain />
              
              {/* City markers */}
              {REGION_DATA.cities.map((city) => (
                <group key={city.id} position={city.position}>
                  {/* City beacon */}
                  <mesh 
                    onClick={() => handleCitySelect(city)}
                    onPointerOver={() => setHoveredCity(city)}
                    onPointerOut={() => setHoveredCity(null)}
                  >
                    <cylinderGeometry args={[0.3, 0.5, 2, 8]} />
                    <meshStandardMaterial 
                      color={city.color}
                      emissive={city.color}
                      emissiveIntensity={0.5}
                      roughness={0.3}
                      metalness={0.7}
                    />
                  </mesh>
                  
                  {/* Light beam */}
                  <mesh position={[0, 3, 0]}>
                    <cylinderGeometry args={[0.1, 0.3, 5, 8]} />
                    <meshStandardMaterial 
                      color={city.color}
                      transparent
                      opacity={0.3}
                      emissive={city.color}
                      emissiveIntensity={0.2}
                    />
                  </mesh>
                </group>
              ))}
              
              {/* Pokémon in selected city */}
              {selectedCity && (
                <PokemonGenerator 
                  city={selectedCity}
                  onPokemonCaught={handlePokemonCatch}
                />
              )}
              
              {/* Pokéballs */}
              {pokeballs.map((pokeball) => (
                <Pokeball
                  key={pokeball.id}
                  position={pokeball.position}
                  velocity={pokeball.velocity}
                  catchingPokemon={true}
                  pokemonPosition={pokeball.target}
                  onCatch={(success) => handlePokeballResult(pokeball.id, success)}
                />
              ))}
              
              {/* Camera Controls */}
              <OrbitControls 
                enableZoom={true}
                enablePan={true}
                minDistance={5}
                maxDistance={100}
                maxPolarAngle={Math.PI / 1.5}
                autoRotate={!selectedCity}
                autoRotateSpeed={0.5}
              />
              
              <Environment preset="forest" />
            </SceneManager>
          </Physics>
        </Canvas>
      </div>

      {/* UI Overlay */}
      <div className="fixed inset-0 z-50 pointer-events-none">
        {/* Top Stats Bar */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
          <div className="backdrop-blur-xl bg-emerald-900/50 p-4 rounded-2xl border border-emerald-500/30 pointer-events-auto">
            <div className="flex items-center gap-6">
              <div>
                <h3 className="text-sm text-emerald-300">SCORE</h3>
                <p className="text-2xl font-bold text-white">{score}</p>
              </div>
              <div>
                <h3 className="text-sm text-emerald-300">POKÉBALLS</h3>
                <p className="text-2xl font-bold text-white">{pokeballCount}</p>
              </div>
              <div>
                <h3 className="text-sm text-emerald-300">CAUGHT</h3>
                <p className="text-2xl font-bold text-white">{caughtPokemon.length}</p>
              </div>
            </div>
          </div>
          
          {/* Throw Button */}
          <button
            onClick={handleThrowPokeball}
            disabled={pokeballCount <= 0 || isThrowing}
            className="relative px-8 py-4 bg-gradient-to-r from-red-500 via-red-600 to-red-700 rounded-full text-white font-bold text-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed pointer-events-auto shadow-2xl shadow-red-500/30"
          >
            {isThrowing ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Throwing...
              </span>
            ) : (
              `THROW POKÉBALL (${pokeballCount} left)`
            )}
          </button>
        </div>

        {/* City Info */}
        {selectedCity && (
          <div className="absolute top-24 left-1/2 transform -translate-x-1/2 backdrop-blur-xl bg-emerald-900/60 p-6 rounded-2xl border border-emerald-500/30 pointer-events-auto max-w-md">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-emerald-300">{selectedCity.name}</h2>
                <p className="text-emerald-200">{selectedCity.description}</p>
              </div>
              <button
                onClick={handleBackToOverview}
                className="px-4 py-2 bg-red-500/30 hover:bg-red-500/50 rounded-lg transition-colors"
              >
                ← Back
              </button>
            </div>
            <p className="text-emerald-100 mb-2">Available Pokémon:</p>
            <div className="flex flex-wrap gap-2">
              {selectedCity.pokemon.map(pokemon => (
                <span 
                  key={pokemon}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    caughtPokemon.includes(pokemon) 
                      ? 'bg-emerald-500/50 text-emerald-100' 
                      : 'bg-emerald-800/50 text-emerald-300'
                  }`}
                >
                  {pokemon} {caughtPokemon.includes(pokemon) && '✓'}
                </span>
              ))}
            </div>
            <p className="text-sm text-emerald-300 mt-3">
              Throw Pokéballs at Pokémon to catch them! Aim carefully!
            </p>
          </div>
        )}

        {/* Caught Pokémon Display */}
        <div className="absolute bottom-4 left-4 backdrop-blur-xl bg-emerald-900/50 p-4 rounded-2xl border border-emerald-500/30 pointer-events-auto max-w-sm">
          <h3 className="text-lg font-bold text-emerald-300 mb-3">Your Pokémon</h3>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            {caughtPokemon.length > 0 ? (
              caughtPokemon.map((pokemon, index) => (
                <div 
                  key={index} 
                  className="px-3 py-2 bg-emerald-700/50 rounded-lg flex items-center gap-2"
                >
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: POKEMON_DATA[pokemon]?.color || '#94a3b8' }}
                  ></div>
                  <span className="text-emerald-100">{pokemon}</span>
                </div>
              ))
            ) : (
              <p className="text-emerald-300/70">No Pokémon caught yet!</p>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="absolute bottom-4 right-4 backdrop-blur-xl bg-emerald-900/50 p-4 rounded-2xl border border-emerald-500/30 pointer-events-auto max-w-xs">
          <h3 className="text-lg font-bold text-emerald-300 mb-2">How to Play</h3>
          <ul className="space-y-2 text-sm text-emerald-200">
            <li className="flex items-start gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full mt-1"></div>
              <span><strong>Scroll:</strong> Zoom in/out</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full mt-1"></div>
              <span><strong>Click cities:</strong> Visit different areas</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full mt-1"></div>
              <span><strong>Throw button:</strong> Catch Pokémon</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full mt-1"></div>
              <span><strong>Drag:</strong> Rotate camera view</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="fixed top-1/2 right-8 transform -translate-y-1/2 z-40 hidden md:block">
        <div className="flex flex-col items-center">
          <div className="text-emerald-300 text-sm font-bold mb-2 rotate-90">SCROLL TO EXPLORE</div>
          <div className="h-40 w-1 bg-emerald-500/30 rounded-full overflow-hidden">
            <div 
              className="w-full bg-gradient-to-t from-emerald-400 to-green-400 transition-all duration-300"
              style={{ height: `${scrollProgress * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="relative z-10 min-h-screen pt-64 pb-96">
        <div ref={contentRef} className="text-center px-4 max-w-6xl mx-auto">
          <h1
            ref={titleRef}
            className="text-5xl md:text-[8rem] font-black mb-6 bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-[shimmer_3s_ease-in-out_infinite]"
            style={{
              textShadow: '0 0 100px rgba(16, 185, 129, 0.5)',
              letterSpacing: '-0.05em',
            }}
          >
            POKÉMON HUNT
          </h1>

          <p className="text-2xl md:text-3xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            <span className="text-emerald-400 font-bold">Explore the Kanto wilderness</span> 
            <br />
            Catch Pokémon in their natural habitats. Each area has different Pokémon with unique behaviors!
          </p>

          {/* Cities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24 max-w-5xl mx-auto">
            {REGION_DATA.cities.map(city => (
              <div 
                key={city.id}
                className="city-card backdrop-blur-lg bg-gradient-to-br from-emerald-900/30 to-green-900/30 border border-emerald-500/30 rounded-2xl p-6 hover:scale-105 hover:border-emerald-400/50 transition-all duration-300 cursor-pointer"
                onClick={() => handleCitySelect(city)}
                onMouseEnter={() => playHoverSound()}
              >
                <div className="text-left">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold text-emerald-300">{city.name}</h3>
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: city.color }}
                    ></div>
                  </div>
                  <p className="text-emerald-200 mb-4">{city.description}</p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      <span className="text-emerald-300">{city.pokemonCount} Pokémon available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-emerald-300">Terrain: {city.terrain}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {city.pokemon.slice(0, 3).map(pokemon => (
                      <span 
                        key={pokemon}
                        className="px-3 py-1 bg-emerald-700/50 rounded-full text-sm text-emerald-200"
                      >
                        {pokemon}
                      </span>
                    ))}
                    {city.pokemon.length > 3 && (
                      <span className="px-3 py-1 bg-emerald-800/50 rounded-full text-sm text-emerald-300">
                        +{city.pokemon.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Back Button */}
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
            <button
              onClick={handleBack}
              className="group relative px-10 py-4 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 rounded-full text-white font-bold text-lg hover:scale-110 transition-all duration-300 shadow-2xl hover:shadow-emerald-500/50 pointer-events-auto"
            >
              <span className="relative z-10 flex items-center gap-3">
                Back to Lobby
                <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-teal-500 via-green-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default GameStartRoom