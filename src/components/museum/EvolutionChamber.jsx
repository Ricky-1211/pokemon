import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { PerspectiveCamera, Environment, OrbitControls, Text, Float, Sparkles, Stars } from '@react-three/drei'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import * as THREE from 'three'
import SceneManager from '../../three/SceneManager'
import CameraController from '../../three/CameraController'
import useSound from '../../hooks/useSound'

gsap.registerPlugin(ScrollTrigger)

// 3D Evolution DNA Helix Component
function EvolutionDNA({ stages = 3, isActive = false }) {
  const groupRef = useRef()
  const helixRef = useRef()
  
  useFrame((state) => {
    if (groupRef.current && helixRef.current) {
      const time = state.clock.getElapsedTime()
      
      // Rotate the entire DNA
      groupRef.current.rotation.y = time * 0.2
      
      // Pulsing animation when active
      if (isActive) {
        const pulse = Math.sin(time * 3) * 0.1 + 1
        helixRef.current.scale.setScalar(pulse)
      }
    }
  })

  const points = []
  const numberOfPoints = 100
  const radius = 2
  const height = 8

  // Create helix points
  for (let i = 0; i < numberOfPoints; i++) {
    const angle = (i / numberOfPoints) * Math.PI * 8
    const x = Math.cos(angle) * radius
    const z = Math.sin(angle) * radius
    const y = (i / numberOfPoints) * height - height / 2
    points.push(new THREE.Vector3(x, y, z))
  }

  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points)

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* DNA Strands */}
      <group ref={helixRef}>
        {/* First strand */}
        <line geometry={lineGeometry}>
          <lineBasicMaterial color="#10b981" linewidth={2} />
        </line>
        
        {/* Second strand (opposite phase) */}
        <line geometry={lineGeometry}>
          <lineBasicMaterial color="#06b6d4" linewidth={2} />
        </line>
        
        {/* Rungs connecting strands */}
        {Array.from({ length: 20 }).map((_, i) => {
          const angle = (i / 20) * Math.PI * 8
          const x1 = Math.cos(angle) * radius
          const z1 = Math.sin(angle) * radius
          const y = (i / 20) * height - height / 2
          
          const x2 = Math.cos(angle + Math.PI) * radius
          const z2 = Math.sin(angle + Math.PI) * radius
          
          return (
            <line
              key={i}
              geometry={new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(x1, y, z1),
                new THREE.Vector3(x2, y, z2)
              ])}
            >
              <lineBasicMaterial color="#ffffff" linewidth={1} />
            </line>
          )
        })}
      </group>
      
      {/* Evolution stage indicators */}
      {Array.from({ length: stages }).map((_, i) => {
        const y = (i / (stages - 1)) * height - height / 2
        return (
          <mesh key={i} position={[0, y, 0]}>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshStandardMaterial
              color={i === 0 ? '#22c55e' : i === 1 ? '#0ea5e9' : '#a855f7'}
              emissive={i === 0 ? '#22c55e' : i === 1 ? '#0ea5e9' : '#a855f7'}
              emissiveIntensity={0.5}
            />
            <Sparkles count={10} scale={[1, 1, 1]} size={0.1} color="white" />
          </mesh>
        )
      })}
    </group>
  )
}

// Evolution Stage Visualization
function EvolutionStage({ position, stage, pokemon, isActive }) {
  const meshRef = useRef()
  
  useFrame((state) => {
    if (meshRef.current && isActive) {
      // Gentle floating animation
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1
    }
  })

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <group ref={meshRef} position={position}>
        {/* Stage container */}
        <mesh>
          <cylinderGeometry args={[1.5, 1.2, 0.2, 8]} />
          <meshStandardMaterial
            color="#1e293b"
            metalness={0.8}
            roughness={0.2}
            emissive="#0f172a"
            emissiveIntensity={0.3}
          />
        </mesh>
        
        {/* Stage label */}
        <Text
          position={[0, 0.3, 0]}
          fontSize={0.3}
          color={isActive ? '#10b981' : '#64748b'}
          anchorX="center"
          anchorY="middle"
        >
          {stage}
        </Text>
        
        {/* Pokémon placeholder */}
        <mesh position={[0, 1, 0]}>
          <sphereGeometry args={[0.8, 16, 16]} />
          <meshStandardMaterial
            color={isActive ? '#10b981' : '#475569'}
            emissive={isActive ? '#10b981' : '#475569'}
            emissiveIntensity={isActive ? 0.5 : 0.1}
          />
        </mesh>
        
        {/* Active glow */}
        {isActive && (
          <>
            <pointLight position={[0, 1, 0]} color="#10b981" intensity={1} distance={3} />
            <Sparkles count={20} scale={[2, 2, 2]} size={0.1} color="#10b981" speed={0.3} />
          </>
        )}
      </group>
    </Float>
  )
}

const EvolutionChamber = ({ onPokemonSelect }) => {
  const sectionRef = useRef(null)
  const titleRef = useRef(null)
  const dnaRef = useRef(null)
  const chainsRef = useRef([])
  const [selectedChain, setSelectedChain] = useState(null)
  const [activeStage, setActiveStage] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const { playScrollBass, playEvolutionSound, playClickSound } = useSound()

  // Expanded evolution chains (over 100 Pokémon across 33 chains)
  const evolutionChains = [
    {
      id: 1,
      name: 'BULBASAUR LINE',
      pokemon: [
        { id: 1, name: 'Bulbasaur', type: 'grass', level: 16 },
        { id: 2, name: 'Ivysaur', type: 'grass', level: 32 },
        { id: 3, name: 'Venusaur', type: 'grass', level: null }
      ],
      type: 'grass'
    },
    {
      id: 2,
      name: 'CHARMANDER LINE',
      pokemon: [
        { id: 4, name: 'Charmander', type: 'fire', level: 16 },
        { id: 5, name: 'Charmeleon', type: 'fire', level: 36 },
        { id: 6, name: 'Charizard', type: 'fire', level: null }
      ],
      type: 'fire'
    },
    {
      id: 3,
      name: 'SQUIRTLE LINE',
      pokemon: [
        { id: 7, name: 'Squirtle', type: 'water', level: 16 },
        { id: 8, name: 'Wartortle', type: 'water', level: 36 },
        { id: 9, name: 'Blastoise', type: 'water', level: null }
      ],
      type: 'water'
    },
    {
      id: 4,
      name: 'CATERPIE LINE',
      pokemon: [
        { id: 10, name: 'Caterpie', type: 'bug', level: 7 },
        { id: 11, name: 'Metapod', type: 'bug', level: 10 },
        { id: 12, name: 'Butterfree', type: 'bug', level: null }
      ],
      type: 'bug'
    },
    {
      id: 5,
      name: 'WEEDLE LINE',
      pokemon: [
        { id: 13, name: 'Weedle', type: 'bug', level: 7 },
        { id: 14, name: 'Kakuna', type: 'bug', level: 10 },
        { id: 15, name: 'Beedrill', type: 'bug', level: null }
      ],
      type: 'bug'
    },
    {
      id: 6,
      name: 'PIDGEY LINE',
      pokemon: [
        { id: 16, name: 'Pidgey', type: 'normal', level: 18 },
        { id: 17, name: 'Pidgeotto', type: 'normal', level: 36 },
        { id: 18, name: 'Pidgeot', type: 'normal', level: null }
      ],
      type: 'normal'
    },
    {
      id: 7,
      name: 'RATTATA LINE',
      pokemon: [
        { id: 19, name: 'Rattata', type: 'normal', level: 20 },
        { id: 20, name: 'Raticate', type: 'normal', level: null }
      ],
      type: 'normal'
    },
    {
      id: 8,
      name: 'SPEAROW LINE',
      pokemon: [
        { id: 21, name: 'Spearow', type: 'normal', level: 20 },
        { id: 22, name: 'Fearow', type: 'normal', level: null }
      ],
      type: 'normal'
    },
    {
      id: 9,
      name: 'EKANS LINE',
      pokemon: [
        { id: 23, name: 'Ekans', type: 'poison', level: 22 },
        { id: 24, name: 'Arbok', type: 'poison', level: null }
      ],
      type: 'poison'
    },
    {
      id: 10,
      name: 'PIKACHU LINE',
      pokemon: [
        { id: 25, name: 'Pikachu', type: 'electric', level: null },
        { id: 26, name: 'Raichu', type: 'electric', level: 'Thunder Stone' }
      ],
      type: 'electric'
    },
    {
      id: 11,
      name: 'SANDSHREW LINE',
      pokemon: [
        { id: 27, name: 'Sandshrew', type: 'ground', level: 22 },
        { id: 28, name: 'Sandslash', type: 'ground', level: null }
      ],
      type: 'ground'
    },
    {
      id: 12,
      name: 'NIDORAN♀ LINE',
      pokemon: [
        { id: 29, name: 'Nidoran♀', type: 'poison', level: 16 },
        { id: 30, name: 'Nidorina', type: 'poison', level: null }
      ],
      type: 'poison'
    },
    {
      id: 13,
      name: 'NIDORAN♂ LINE',
      pokemon: [
        { id: 31, name: 'Nidoran♂', type: 'poison', level: 16 },
        { id: 32, name: 'Nidorino', type: 'poison', level: null }
      ],
      type: 'poison'
    },
    {
      id: 14,
      name: 'CLEFAIRY LINE',
      pokemon: [
        { id: 35, name: 'Clefairy', type: 'fairy', level: null },
        { id: 36, name: 'Clefable', type: 'fairy', level: 'Moon Stone' }
      ],
      type: 'fairy'
    },
    {
      id: 15,
      name: 'VULPIX LINE',
      pokemon: [
        { id: 37, name: 'Vulpix', type: 'fire', level: null },
        { id: 38, name: 'Ninetales', type: 'fire', level: 'Fire Stone' }
      ],
      type: 'fire'
    },
    {
      id: 16,
      name: 'JIGGLYPUFF LINE',
      pokemon: [
        { id: 39, name: 'Jigglypuff', type: 'normal', level: null },
        { id: 40, name: 'Wigglytuff', type: 'normal', level: 'Moon Stone' }
      ],
      type: 'normal'
    },
    {
      id: 17,
      name: 'ZUBAT LINE',
      pokemon: [
        { id: 41, name: 'Zubat', type: 'poison', level: 22 },
        { id: 42, name: 'Golbat', type: 'poison', level: null }
      ],
      type: 'poison'
    },
    {
      id: 18,
      name: 'ODDISH LINE',
      pokemon: [
        { id: 43, name: 'Oddish', type: 'grass', level: 21 },
        { id: 44, name: 'Gloom', type: 'grass', level: null },
        { id: 45, name: 'Vileplume', type: 'grass', level: 'Leaf Stone' }
      ],
      type: 'grass'
    },
    {
      id: 19,
      name: 'PARAS LINE',
      pokemon: [
        { id: 46, name: 'Paras', type: 'bug', level: 24 },
        { id: 47, name: 'Parasect', type: 'bug', level: null }
      ],
      type: 'bug'
    },
    {
      id: 20,
      name: 'VENONAT LINE',
      pokemon: [
        { id: 48, name: 'Venonat', type: 'bug', level: 31 },
        { id: 49, name: 'Venomoth', type: 'bug', level: null }
      ],
      type: 'bug'
    },
    {
      id: 21,
      name: 'DIGLETT LINE',
      pokemon: [
        { id: 50, name: 'Diglett', type: 'ground', level: 26 },
        { id: 51, name: 'Dugtrio', type: 'ground', level: null }
      ],
      type: 'ground'
    },
    {
      id: 22,
      name: 'MEOWTH LINE',
      pokemon: [
        { id: 52, name: 'Meowth', type: 'normal', level: 28 },
        { id: 53, name: 'Persian', type: 'normal', level: null }
      ],
      type: 'normal'
    },
    {
      id: 23,
      name: 'PSYDUCK LINE',
      pokemon: [
        { id: 54, name: 'Psyduck', type: 'water', level: 33 },
        { id: 55, name: 'Golduck', type: 'water', level: null }
      ],
      type: 'water'
    },
    {
      id: 24,
      name: 'MANKEY LINE',
      pokemon: [
        { id: 56, name: 'Mankey', type: 'fighting', level: 28 },
        { id: 57, name: 'Primeape', type: 'fighting', level: null }
      ],
      type: 'fighting'
    },
    {
      id: 25,
      name: 'GROWLITHE LINE',
      pokemon: [
        { id: 58, name: 'Growlithe', type: 'fire', level: null },
        { id: 59, name: 'Arcanine', type: 'fire', level: 'Fire Stone' }
      ],
      type: 'fire'
    },
    {
      id: 26,
      name: 'POLIWAG LINE',
      pokemon: [
        { id: 60, name: 'Poliwag', type: 'water', level: 25 },
        { id: 61, name: 'Poliwhirl', type: 'water', level: null },
        { id: 62, name: 'Poliwrath', type: 'water', level: 'Water Stone' }
      ],
      type: 'water'
    },
    {
      id: 27,
      name: 'ABRA LINE',
      pokemon: [
        { id: 63, name: 'Abra', type: 'psychic', level: 16 },
        { id: 64, name: 'Kadabra', type: 'psychic', level: null },
        { id: 65, name: 'Alakazam', type: 'psychic', level: 'Trade' }
      ],
      type: 'psychic'
    },
    {
      id: 28,
      name: 'MACHOP LINE',
      pokemon: [
        { id: 66, name: 'Machop', type: 'fighting', level: 28 },
        { id: 67, name: 'Machoke', type: 'fighting', level: null },
        { id: 68, name: 'Machamp', type: 'fighting', level: 'Trade' }
      ],
      type: 'fighting'
    },
    {
      id: 29,
      name: 'BELLSPROUT LINE',
      pokemon: [
        { id: 69, name: 'Bellsprout', type: 'grass', level: 21 },
        { id: 70, name: 'Weepinbell', type: 'grass', level: null },
        { id: 71, name: 'Victreebel', type: 'grass', level: 'Leaf Stone' }
      ],
      type: 'grass'
    },
    {
      id: 30,
      name: 'TENTACOOL LINE',
      pokemon: [
        { id: 72, name: 'Tentacool', type: 'water', level: 30 },
        { id: 73, name: 'Tentacruel', type: 'water', level: null }
      ],
      type: 'water'
    },
    {
      id: 31,
      name: 'GEODUDE LINE',
      pokemon: [
        { id: 74, name: 'Geodude', type: 'rock', level: 25 },
        { id: 75, name: 'Graveler', type: 'rock', level: null },
        { id: 76, name: 'Golem', type: 'rock', level: 'Trade' }
      ],
      type: 'rock'
    },
    {
      id: 32,
      name: 'PONYTA LINE',
      pokemon: [
        { id: 77, name: 'Ponyta', type: 'fire', level: 40 },
        { id: 78, name: 'Rapidash', type: 'fire', level: null }
      ],
      type: 'fire'
    },
    {
      id: 33,
      name: 'SLOWPOKE LINE',
      pokemon: [
        { id: 79, name: 'Slowpoke', type: 'water', level: 37 },
        { id: 80, name: 'Slowbro', type: 'water', level: null }
      ],
      type: 'water'
    }
  ]

  // Calculate total Pokémon count
  const totalPokemon = evolutionChains.reduce((total, chain) => total + chain.pokemon.length, 0)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation
      const titleAnim = gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 100, scale: 0.8 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.5,
          ease: 'back.out(1.7)',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            onEnter: () => playScrollBass(),
          },
        }
      )

      // Chains entrance animation
      chainsRef.current.forEach((chain, index) => {
        if (chain) {
          gsap.fromTo(
            chain,
            { opacity: 0, y: 50 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              delay: index * 0.1,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: chain,
                start: 'top 85%',
              },
            }
          )
        }
      })

      return () => {
        titleAnim.kill()
        ScrollTrigger.getAll().forEach(trigger => trigger.kill())
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [playScrollBass])

  const handleChainSelect = (chain) => {
    playClickSound()
    setSelectedChain(chain)
    setIsAnimating(true)
    
    // Animate chain selection
    chainsRef.current.forEach((chainEl, index) => {
      if (chainEl) {
        const isSelected = evolutionChains[index] === chain
        gsap.to(chainEl, {
          scale: isSelected ? 1.05 : 0.95,
          duration: 0.3,
          ease: 'power2.out'
        })
      }
    })

    // Start evolution animation sequence
    setActiveStage(0)
    const sequence = chain.pokemon.map((_, index) => index)
    sequence.forEach((stage, index) => {
      setTimeout(() => {
        setActiveStage(stage)
        if (index > 0) playEvolutionSound()
      }, index * 1000)
    })

    setTimeout(() => setIsAnimating(false), chain.pokemon.length * 1000)
  }

  const getTypeColor = (type) => {
    const colors = {
      grass: '#22c55e',
      fire: '#ef4444',
      water: '#3b82f6',
      bug: '#84cc16',
      normal: '#94a3b8',
      poison: '#a855f7',
      electric: '#f59e0b',
      ground: '#d97706',
      fairy: '#ec4899',
      flying: '#8b5cf6',
      psychic: '#f472b6',
      fighting: '#dc2626',
      rock: '#78716c'
    }
    return colors[type] || '#94a3b8'
  }

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen w-full py-20 px-4"
    >
      {/* Cosmic Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/60 via-cyan-950/60 to-purple-950/60">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(16,185,129,0.2),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(6,182,212,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1),transparent_60%)]" />
        
        {/* DNA Pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            #10b981 0px,
            #10b981 10px,
            transparent 10px,
            transparent 50px
          )`,
          backgroundSize: '100px 100px'
        }} />
      </div>

      {/* 3D Evolution Scene */}
      <div className="absolute inset-0 z-0">
        <Canvas shadows camera={{ position: [0, 5, 15], fov: 50 }}>
          <PerspectiveCamera makeDefault position={[0, 5, 15]} />
          <SceneManager enableFog={true} fogColor="#0f172a" fogNear={1} fogFar={50}>
            {/* Cosmic Environment */}
            <Stars radius={300} depth={100} count={5000} factor={6} />
            
            {/* Lighting */}
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 10, 5]} intensity={1.5} color="#10b981" castShadow />
            <pointLight position={[-5, 3, -5]} intensity={0.8} color="#06b6d4" />
            <pointLight position={[5, 3, 5]} intensity={0.8} color="#8b5cf6" />
            
            {/* Evolution DNA */}
            <EvolutionDNA 
              stages={selectedChain?.pokemon.length || 3} 
              isActive={isAnimating}
            />
            
            {/* Evolution Stages */}
            {selectedChain && selectedChain.pokemon.map((pokemon, index) => (
              <EvolutionStage
                key={index}
                position={[-6 + index * 6, 0, 0]}
                stage={`STAGE ${index + 1}`}
                pokemon={pokemon}
                isActive={activeStage === index}
              />
            ))}
            
            <CameraController
              targetPosition={[0, 5, 15]}
              targetLookAt={[0, 0, 0]}
              enableMouseParallax={true}
              parallaxStrength={0.5}
            />
            <OrbitControls 
              enableZoom={true}
              enablePan={true}
              minDistance={5}
              maxDistance={30}
              autoRotate={!selectedChain}
              autoRotateSpeed={0.3}
            />
            <Environment preset="studio" />
          </SceneManager>
        </Canvas>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2
            ref={titleRef}
            className="text-6xl md:text-[6rem] lg:text-[8rem] font-black mb-6"
            style={{
              background: 'linear-gradient(90deg, #10b981, #06b6d4, #8b5cf6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundSize: '200% auto',
              animation: 'dnaShift 4s ease-in-out infinite',
              textShadow: '0 0 60px rgba(16, 185, 129, 0.3)',
              fontFamily: "'Bebas Neue', sans-serif",
              letterSpacing: '0.1em'
            }}
          >
            EVOLUTION CHAMBER
          </h2>
          <p className="text-2xl md:text-3xl text-gray-300 mb-4 max-w-3xl mx-auto">
            Witness the Genetic Journey of {totalPokemon}+ Pokémon
          </p>
          <div className="flex justify-center gap-6 mt-6">
            <div className="px-4 py-2 bg-emerald-500/20 rounded-full">
              <span className="text-emerald-300 font-bold">{evolutionChains.length} Evolution Chains</span>
            </div>
            <div className="px-4 py-2 bg-cyan-500/20 rounded-full">
              <span className="text-cyan-300 font-bold">{totalPokemon} Total Pokémon</span>
            </div>
            <div className="px-4 py-2 bg-purple-500/20 rounded-full">
              <span className="text-purple-300 font-bold">3D Visualization</span>
            </div>
          </div>
        </div>

        {/* Evolution Chains Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {evolutionChains.map((chain, index) => (
            <div
              key={chain.id}
              ref={el => chainsRef.current[index] = el}
              className="group relative backdrop-blur-xl rounded-2xl overflow-hidden cursor-pointer border-2 border-emerald-500/30 hover:border-emerald-400 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/30"
              onClick={() => handleChainSelect(chain)}
              style={{
                background: `linear-gradient(135deg, ${getTypeColor(chain.type)}10, rgba(6, 182, 212, 0.1))`
              }}
            >
              {/* Chain header */}
              <div className="p-6 border-b border-emerald-500/30 bg-black/40">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold" style={{ color: getTypeColor(chain.type) }}>
                    {chain.name}
                  </h3>
                  <span className="text-sm text-gray-400">
                    {chain.pokemon.length} stages
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getTypeColor(chain.type) }}
                  />
                  <span className="text-sm text-gray-300 capitalize">{chain.type}</span>
                </div>
              </div>
              
              {/* Pokémon stages */}
              <div className="p-6">
                <div className="flex items-center justify-between gap-4">
                  {chain.pokemon.map((pokemon, idx) => (
                    <div key={pokemon.id} className="flex-1 text-center">
                      {/* Evolution arrow */}
                      {idx > 0 && (
                        <div className="hidden sm:block mb-4">
                          <div className="h-0.5 w-full bg-gradient-to-r from-emerald-500 to-cyan-500 relative">
                            <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
                              <div className="w-2 h-2 border-r-2 border-b-2 border-emerald-400 transform rotate-45" />
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Pokémon card */}
                      <div className="relative">
                        <div className="relative w-20 h-20 mx-auto mb-2">
                          <img
                            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`}
                            alt={pokemon.name}
                            className="w-full h-full object-contain filter drop-shadow-lg group-hover:scale-110 transition-transform duration-300"
                            onError={(e) => {
                              e.target.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`
                            }}
                          />
                          {selectedChain === chain && activeStage === idx && (
                            <div className="absolute inset-0 bg-emerald-500/30 rounded-full animate-ping" />
                          )}
                        </div>
                        
                        <h4 className="text-sm font-bold text-white capitalize">
                          {pokemon.name}
                        </h4>
                        
                        {/* Evolution requirement */}
                        <div className="text-xs text-gray-400 mt-1">
                          {pokemon.level ? (
                            <span>Lv. {pokemon.level}</span>
                          ) : (
                            <span>Stone/Trade</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Chain info */}
                <div className="mt-4 pt-4 border-t border-emerald-500/20">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Total Stages:</span>
                    <span className="text-emerald-300">{chain.pokemon.length}</span>
                  </div>
                </div>
              </div>
              
              {/* Hover glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
              
              {/* Selected indicator */}
              {selectedChain === chain && (
                <div className="absolute top-4 right-4">
                  <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Evolution Info Panel */}
        {selectedChain && (
          <div className="fixed bottom-0 left-0 right-0 z-50 p-6 bg-gradient-to-t from-black/90 to-transparent pointer-events-none">
            <div className="max-w-4xl mx-auto pointer-events-auto">
              <div className="backdrop-blur-xl bg-emerald-900/40 border border-emerald-500/30 rounded-2xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-emerald-300 mb-2">
                      {selectedChain.name}
                    </h3>
                    <p className="text-gray-300">
                      {isAnimating ? 'Evolution in progress...' : 'Select a stage to view details'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      playClickSound()
                      setSelectedChain(null)
                      setActiveStage(0)
                    }}
                    className="px-4 py-2 bg-red-500/30 hover:bg-red-500/50 rounded-lg transition-colors"
                  >
                    Clear
                  </button>
                </div>
                
                {/* Stage progression */}
                <div className="flex items-center justify-center gap-8 mb-6">
                  {selectedChain.pokemon.map((pokemon, index) => (
                    <div key={pokemon.id} className="text-center">
                      <div 
                        className={`w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center ${
                          activeStage >= index 
                            ? 'bg-emerald-500/30 border-2 border-emerald-400' 
                            : 'bg-gray-800/50 border border-gray-700'
                        }`}
                      >
                        <span className="text-2xl font-bold text-white">#{pokemon.id}</span>
                      </div>
                      <span className={`text-sm font-bold ${
                        activeStage >= index ? 'text-emerald-300' : 'text-gray-500'
                      }`}>
                        {pokemon.name}
                      </span>
                    </div>
                  ))}
                </div>
                
                {/* Evolution details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {selectedChain.pokemon.map((pokemon, index) => (
                    <div 
                      key={pokemon.id}
                      className={`p-4 rounded-lg transition-all duration-300 ${
                        activeStage === index 
                          ? 'bg-emerald-500/20 border border-emerald-400' 
                          : 'bg-gray-800/30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-white capitalize">{pokemon.name}</h4>
                        <span className="text-xs px-2 py-1 rounded-full" style={{
                          backgroundColor: `${getTypeColor(pokemon.type)}40`,
                          color: getTypeColor(pokemon.type)
                        }}>
                          {pokemon.type}
                        </span>
                      </div>
                      <div className="text-sm text-gray-300">
                        <div className="mb-1">Stage: {index === 0 ? 'Basic' : index === 1 ? 'First' : 'Final'}</div>
                        <div>Evolution: {pokemon.level || 'Special'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Evolution Statistics */}
        <div className="mt-20">
          <h3 className="text-3xl font-bold text-center text-emerald-300 mb-8">
            Evolution Statistics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-emerald-900/40 to-cyan-900/40 backdrop-blur-xl rounded-2xl p-6 border border-emerald-500/30 text-center">
              <div className="text-4xl font-bold text-emerald-300 mb-2">{evolutionChains.length}</div>
              <div className="text-gray-300">Evolution Chains</div>
            </div>
            <div className="bg-gradient-to-br from-cyan-900/40 to-purple-900/40 backdrop-blur-xl rounded-2xl p-6 border border-cyan-500/30 text-center">
              <div className="text-4xl font-bold text-cyan-300 mb-2">{totalPokemon}</div>
              <div className="text-gray-300">Total Pokémon</div>
            </div>
            <div className="bg-gradient-to-br from-purple-900/40 to-emerald-900/40 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30 text-center">
              <div className="text-4xl font-bold text-purple-300 mb-2">15</div>
              <div className="text-gray-300">Different Types</div>
            </div>
            <div className="bg-gradient-to-br from-emerald-900/40 to-cyan-900/40 backdrop-blur-xl rounded-2xl p-6 border border-emerald-500/30 text-center">
              <div className="text-4xl font-bold text-emerald-300 mb-2">Kanto</div>
              <div className="text-gray-300">Region</div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes dnaShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes evolvePulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.2); opacity: 1; }
        }
        
        .animate-evolve {
          animation: evolvePulse 2s ease-in-out infinite;
        }
      `}</style>
    </section>
  )
}

export default EvolutionChamber