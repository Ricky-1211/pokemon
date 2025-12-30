import { useEffect, useRef, useState, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { PerspectiveCamera, Environment, Text, Float, Stars, Sparkles, Html } from '@react-three/drei'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import * as THREE from 'three'
import SceneManager from '../../../three/SceneManager'
import CameraController from '../../../three/CameraController'
import Pokeball3D from '../../three/Pokeball3D'
import useSound from '../../../hooks/useSound'
import { useIsMobile } from '../../../hooks/use-mobail'

gsap.registerPlugin(ScrollTrigger)

// 3D Starter Pokémon Models
function StarterPokemon({ type = 'grass', position = [0, 0, 0], isSelected = false }) {
  const meshRef = useRef()
  const colorMap = {
    grass: '#22c55e',
    fire: '#ef4444',
    water: '#3b82f6'
  }
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01
      if (isSelected) {
        meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.2
      }
    }
  })

  return (
    <group ref={meshRef} position={position}>
      <mesh>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial 
          color={colorMap[type]}
          emissive={colorMap[type]}
          emissiveIntensity={isSelected ? 0.5 : 0.2}
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>
      {isSelected && <Sparkles count={20} scale={[2, 2, 2]} size={0.2} color={colorMap[type]} />}
    </group>
  )
}

// 3D Path Visualization
function JourneyPath() {
  const curveRef = useRef()
  
  const curve = useMemo(() => {
    const points = []
    for (let i = 0; i <= 10; i++) {
      points.push(new THREE.Vector3(
        (i - 5) * 0.5,
        Math.sin(i * 0.5) * 0.3,
        0
      ))
    }
    return new THREE.CatmullRomCurve3(points)
  }, [])

  return (
    <mesh>
      <tubeGeometry args={[curve, 64, 0.05, 8, false]} />
      <meshStandardMaterial 
        color="#3b82f6"
        emissive="#3b82f6"
        emissiveIntensity={0.3}
        transparent
        opacity={0.6}
      />
    </mesh>
  )
}

// Floating Text Particles
function TextParticles() {
  const particles = useRef([])
  
  useFrame((state) => {
    particles.current.forEach((particle, i) => {
      particle.position.y += Math.sin(state.clock.elapsedTime + i) * 0.01
      particle.rotation.y += 0.01
    })
  })

  const texts = ['START', 'ADVENTURE', 'JOURNEY', 'DREAM', 'LEGEND', 'POKÉMON']

  return (
    <group>
      {texts.map((text, i) => (
        <Float key={i} speed={2} rotationIntensity={1} floatIntensity={1}>
          <Text
            ref={el => particles.current[i] = el}
            position={[
              (Math.random() - 0.5) * 10,
              (Math.random() - 0.5) * 6,
              (Math.random() - 0.5) * 10
            ]}
            fontSize={0.3}
            color="#3b82f6"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="#000"
          >
            {text}
          </Text>
        </Float>
      ))}
    </group>
  )
}

const JourneyPage1 = ({ onBack, onSelectStarter }) => {
  const sectionRef = useRef(null)
  const containerRef = useRef(null)
  const titleRef = useRef(null)
  const contentRef = useRef(null)
  const starterCardsRef = useRef([])
  const timelineRef = useRef(null)
  
  const { playClickSound, playSelectSound, playWhooshSound } = useSound()
  const isMobile = useIsMobile()
  
  const [selectedStarter, setSelectedStarter] = useState(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [cameraPosition, setCameraPosition] = useState([0, 0, 6])

  const starterPokemon = [
    { id: 1, name: 'Bulbasaur', type: 'grass', description: 'The Seed Pokémon', color: '#22c55e' },
    { id: 4, name: 'Charmander', type: 'fire', description: 'The Lizard Pokémon', color: '#ef4444' },
    { id: 7, name: 'Squirtle', type: 'water', description: 'The Tiny Turtle Pokémon', color: '#3b82f6' }
  ]

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Initial animations
      timelineRef.current = gsap.timeline()
      
      timelineRef.current
        .fromTo(titleRef.current,
          { opacity: 0, y: -100, scale: 0.8 },
          { opacity: 1, y: 0, scale: 1, duration: 1.5, ease: 'back.out(1.7)' }
        )
        .fromTo('.intro-text',
          { opacity: 0, y: 50 },
          { opacity: 1, y: 0, duration: 1, stagger: 0.2, ease: 'power3.out' },
          '-=0.5'
        )
        .fromTo(starterCardsRef.current,
          { opacity: 0, scale: 0.5, y: 100 },
          { opacity: 1, scale: 1, y: 0, duration: 1, stagger: 0.3, ease: 'back.out(1.7)' },
          '-=0.3'
        )

      // Scroll-triggered animations
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
        onUpdate: (self) => {
          setScrollProgress(self.progress)
          
          // Parallax effects
          gsap.set(titleRef.current, {
            y: self.progress * -100,
            opacity: 1 - self.progress * 0.3,
          })
          
          // Camera movement
          const newPos = [
            0,
            Math.sin(self.progress * Math.PI) * 2,
            6 + self.progress * 2
          ]
          setCameraPosition(newPos)
          
          // Color shift based on scroll
          const hue = 200 + self.progress * 60
          document.documentElement.style.setProperty('--scroll-hue', `${hue}deg`)
        }
      })

      // Card hover animations
      starterCardsRef.current.forEach((card, index) => {
        card.addEventListener('mouseenter', () => {
          gsap.to(card, {
            scale: 1.05,
            y: -10,
            duration: 0.3,
            ease: 'power2.out'
          })
        })
        
        card.addEventListener('mouseleave', () => {
          gsap.to(card, {
            scale: 1,
            y: 0,
            duration: 0.3,
            ease: 'power2.out'
          })
        })
      })

    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const handleStarterSelect = (starter) => {
    playSelectSound()
    setSelectedStarter(starter)
    
    // Animate selection
    starterCardsRef.current.forEach((card, index) => {
      if (starterPokemon[index].id === starter.id) {
        gsap.to(card, {
          scale: 1.2,
          y: -20,
          duration: 0.5,
          ease: 'elastic.out(1, 0.5)'
        })
      } else {
        gsap.to(card, {
          scale: 0.8,
          opacity: 0.5,
          duration: 0.3
        })
      }
    })
    
    // Trigger whoosh sound and selection callback
    setTimeout(() => {
      playWhooshSound()
      if (onSelectStarter) {
        setTimeout(() => onSelectStarter(starter), 500)
      }
    }, 500)
  }

  const handleBack = () => {
    playClickSound()
    
    // Exit animation
    gsap.to(sectionRef.current, {
      opacity: 0,
      scale: 0.95,
      duration: 0.5,
      ease: 'power2.in',
      onComplete: () => {
        if (onBack) onBack()
      }
    })
  }

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen"
    >
      {/* Animated Gradient Background */}
      <div className="fixed inset-0" style={{
        background: 'linear-gradient(var(--scroll-hue, 200deg) in oklch, color-mix(in oklch, #0c4a6e, transparent 30%) 0%, color-mix(in oklch, #164e63, transparent 50%) 50%, color-mix(in oklch, #1e3a8a, transparent 70%) 100%)'
      }}>
        {/* Animated particles (reduced on mobile) */}
        <div className="absolute inset-0">
          {[...Array(isMobile ? 50 : 200)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${Math.random() * 4 + 1}px`,
                height: `${Math.random() * 4 + 1}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                background: `hsl(calc(var(--scroll-hue, 200deg) + ${Math.random() * 60 - 30}), 100%, 70%)`,
                animation: `float ${3 + Math.random() * 4}s infinite ease-in-out`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `linear-gradient(to right, #3b82f6 1px, transparent 1px),
                           linear-gradient(to bottom, #3b82f6 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }} />
      </div>

      {/* 3D Scene */}
      <div className="fixed inset-0 z-0">
        <Canvas>
          <PerspectiveCamera makeDefault position={cameraPosition} fov={60} />
          <SceneManager enableFog={true} fogColor="#0f172a" fogNear={1} fogFar={30}>
            <ambientLight intensity={0.4} />
            <directionalLight position={[5, 10, 5]} intensity={1.2} color="#3b82f6" />
            <pointLight position={[-5, 3, -5]} intensity={0.8} color="#06b6d4" />
            <pointLight position={[5, 3, 5]} intensity={0.8} color="#8b5cf6" />
            
            {/* Starter Pokémon in 3D */}
            <group>
              <StarterPokemon type="grass" position={[-3, 0, 0]} isSelected={selectedStarter?.type === 'grass'} />
              <StarterPokemon type="fire" position={[0, 0, 0]} isSelected={selectedStarter?.type === 'fire'} />
              <StarterPokemon type="water" position={[3, 0, 0]} isSelected={selectedStarter?.type === 'water'} />
            </group>
            
            {/* Journey Path */}
            <JourneyPath />
            
            {/* Floating Text */}
            <TextParticles />
            
            {/* Stars (reduced on mobile) */}
            <Stars radius={100} depth={50} count={isMobile ? 1000 : 5000} factor={4} />
            
            <Environment preset="night" />
          </SceneManager>
        </Canvas>
      </div>

      {/* Content Container */}
      <div ref={containerRef} className={`relative z-10 ${isMobile ? 'min-h-[200vh] pt-20 pb-32' : 'min-h-[300vh] pt-32 pb-96'}`}>
        <div className="max-w-7xl mx-auto px-4">
          {/* Hero Section */}
          <div className={`text-center ${isMobile ? 'mb-16' : 'mb-32'}`}>
            <h1
              ref={titleRef}
              className={`${isMobile ? 'text-4xl' : 'text-8xl md:text-[10rem] lg:text-[12rem]'} font-black ${isMobile ? 'mb-2' : 'mb-4'} text-transparent bg-clip-text`}
              style={{
                background: 'linear-gradient(var(--scroll-hue, 200deg) in oklch, #60a5fa, #22d3ee, #818cf8)',
                textShadow: isMobile ? '0 0 40px rgba(59, 130, 246, 0.5)' : '0 0 80px rgba(59, 130, 246, 0.5)',
                letterSpacing: '-0.05em',
                fontFamily: "'Bebas Neue', sans-serif",
              }}
            >
              THE BEGINNING
            </h1>
            
            <div className={`${isMobile ? 'space-y-4' : 'space-y-6'} max-w-3xl mx-auto`}>
              <p className={`intro-text ${isMobile ? 'text-xl' : 'text-3xl md:text-4xl'} text-blue-300 font-bold`}>
                Your epic journey starts here, in the world of Pokémon
              </p>
              <p className={`intro-text ${isMobile ? 'text-base' : 'text-xl'} text-gray-300`}>
                Every legend has a beginning. Every champion starts as a novice. 
                This is where your story unfolds.
              </p>
            </div>
          </div>

          {/* Story Section */}
          <div className={`backdrop-blur-xl bg-white/5 rounded-3xl ${isMobile ? 'p-4' : 'p-8 md:p-12'} border-2 border-blue-400/30 ${isMobile ? 'mb-16' : 'mb-32'}`}>
            <h2 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-bold text-blue-300 ${isMobile ? 'mb-4' : 'mb-6'} text-center`}>
              Welcome to the Pokémon World
            </h2>
            
            <div className={`grid grid-cols-1 ${isMobile ? 'gap-4' : 'lg:grid-cols-2 gap-8'}`}>
              <div className={isMobile ? 'space-y-4' : 'space-y-6'}>
                <p className={`${isMobile ? 'text-base' : 'text-lg'} text-gray-300 leading-relaxed`}>
                  In 1996, the world was introduced to 151 incredible creatures. Today, that number has grown to over 
                  <span className="text-blue-400 font-bold"> 1,000 unique species</span>, each with their own stories, 
                  abilities, and evolutionary paths.
                </p>
                
                <div className={`bg-blue-500/10 rounded-xl ${isMobile ? 'p-4' : 'p-6'}`}>
                  <h3 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-blue-300 ${isMobile ? 'mb-2' : 'mb-3'}`}>The First Step</h3>
                  <p className={`${isMobile ? 'text-sm' : ''} text-gray-300`}>
                    As a new Pokémon Trainer, you'll begin in Pallet Town under the guidance of Professor Oak. 
                    Your first and most important decision awaits: choosing your starter Pokémon.
                  </p>
                </div>
              </div>
              
              <div className={isMobile ? 'space-y-4' : 'space-y-6'}>
                <div className={`grid grid-cols-3 ${isMobile ? 'gap-2' : 'gap-4'}`}>
                  <div className="text-center">
                    <div className={`${isMobile ? 'text-3xl' : 'text-5xl'} mb-2`}>🎮</div>
                    <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-400`}>25+ Years</div>
                  </div>
                  <div className="text-center">
                    <div className={`${isMobile ? 'text-3xl' : 'text-5xl'} mb-2`}>🌎</div>
                    <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-400`}>9 Regions</div>
                  </div>
                  <div className="text-center">
                    <div className={`${isMobile ? 'text-3xl' : 'text-5xl'} mb-2`}>⚡</div>
                    <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-400`}>18 Types</div>
                  </div>
                </div>
                
                <p className={`${isMobile ? 'text-base' : 'text-lg'} text-gray-300`}>
                  This journey isn't just about collecting Pokémon. It's about friendship, discovery, 
                  and becoming the very best like no one ever was.
                </p>
              </div>
            </div>
          </div>

          {/* Choose Your Starter Section */}
          <div className={isMobile ? 'mb-16' : 'mb-32'}>
            <h2 className={`${isMobile ? 'text-3xl' : 'text-5xl'} font-bold text-center ${isMobile ? 'mb-6' : 'mb-12'}`}>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400">
                Choose Your Partner
              </span>
            </h2>
            
            <p className={`${isMobile ? 'text-base' : 'text-xl'} text-center text-gray-300 ${isMobile ? 'mb-6' : 'mb-12'} max-w-3xl mx-auto px-4`}>
              Your starter Pokémon will be your lifelong companion. Choose wisely, trainer.
            </p>
            
            {/* Starter Cards */}
            <div className={`grid grid-cols-1 ${isMobile ? 'gap-4' : 'md:grid-cols-3 gap-8'}`}>
              {starterPokemon.map((starter, index) => (
                <div
                  key={starter.id}
                  ref={el => starterCardsRef.current[index] = el}
                  onClick={() => handleStarterSelect(starter)}
                  className={`relative group cursor-pointer transition-all duration-500 ${
                    selectedStarter?.id === starter.id ? 'z-10' : ''
                  }`}
                >
                  {/* Card Glow */}
                  <div 
                    className="absolute -inset-4 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ backgroundColor: starter.color + '40' }}
                  />
                  
                  {/* Card Content */}
                  <div className={`relative backdrop-blur-xl bg-white/10 rounded-2xl ${isMobile ? 'p-4' : 'p-8'} border-2 border-white/20 group-hover:border-white/40 transition-all duration-300 h-full`}>
                    {/* Type Badge */}
                    <div 
                      className={`absolute ${isMobile ? 'top-2 right-2 px-2 py-1 text-xs' : 'top-4 right-4 px-4 py-2 text-xs'} rounded-full font-bold uppercase tracking-wider`}
                      style={{ backgroundColor: starter.color + '40', color: starter.color }}
                    >
                      {starter.type}
                    </div>
                    
                    {/* Pokémon Image */}
                    <div className={`${isMobile ? 'w-32 h-32 mb-4' : 'w-48 h-48 mb-6'} mx-auto relative`}>
                      <img
                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${starter.id}.png`}
                        alt={starter.name}
                        className="w-full h-full object-contain drop-shadow-2xl"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent rounded-full" />
                    </div>
                    
                    {/* Pokémon Info */}
                    <div className="text-center">
                      <h3 className={`${isMobile ? 'text-xl' : 'text-3xl'} font-bold text-white ${isMobile ? 'mb-1' : 'mb-2'} capitalize`}>
                        {starter.name}
                      </h3>
                      <p className={`${isMobile ? 'text-sm' : ''} text-gray-300 ${isMobile ? 'mb-2' : 'mb-4'}`}>{starter.description}</p>
                      
                      <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-400 ${isMobile ? 'mb-4' : 'mb-6'}`}>
                        #00{starter.id} • First appeared in 1996
                      </div>
                      
                      {/* Stats */}
                      <div className={`grid grid-cols-3 ${isMobile ? 'gap-1 mb-4' : 'gap-2 mb-6'}`}>
                        <div className="text-center">
                          <div className={`${isMobile ? 'text-sm' : ''} text-blue-300 font-bold`}>65</div>
                          <div className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-gray-400`}>HP</div>
                        </div>
                        <div className="text-center">
                          <div className={`${isMobile ? 'text-sm' : ''} text-red-300 font-bold`}>49</div>
                          <div className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-gray-400`}>ATK</div>
                        </div>
                        <div className="text-center">
                          <div className={`${isMobile ? 'text-sm' : ''} text-green-300 font-bold`}>49</div>
                          <div className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-gray-400`}>DEF</div>
                        </div>
                      </div>
                      
                      {/* Select Button */}
                      <button
                        className={`w-full ${isMobile ? 'py-2 text-sm' : 'py-3'} rounded-lg font-bold transition-all ${
                          selectedStarter?.id === starter.id
                            ? 'scale-110 shadow-2xl'
                            : 'opacity-80 hover:opacity-100'
                        }`}
                        style={{
                          backgroundColor: starter.color,
                          color: 'white'
                        }}
                      >
                        {selectedStarter?.id === starter.id ? '✓ SELECTED' : 'CHOOSE ME'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Selection Guide */}
            {selectedStarter && (
              <div className="mt-12 backdrop-blur-xl bg-white/10 rounded-2xl p-8 border-2 border-emerald-500/30">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="text-6xl">🎉</div>
                  <div>
                    <h3 className="text-2xl font-bold text-emerald-300 mb-2">
                      Excellent Choice, Trainer!
                    </h3>
                    <p className="text-gray-300">
                      You've chosen <span className="font-bold text-white">{selectedStarter.name}</span> as your starter Pokémon. 
                      This marks the beginning of your legendary journey. Are you ready to begin?
                    </p>
                  </div>
                  <button
                    onClick={() => onSelectStarter && onSelectStarter(selectedStarter)}
                    className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full text-white font-bold text-lg hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-emerald-500/50"
                  >
                    BEGIN JOURNEY →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Next Steps */}
          <div className="backdrop-blur-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl p-8 md:p-12 border-2 border-white/30">
            <h2 className="text-4xl font-bold text-center text-white mb-8">
              What Awaits You
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/10 rounded-xl p-6">
                <div className="text-4xl mb-4">🏆</div>
                <h3 className="text-xl font-bold text-blue-300 mb-3">8 Gym Badges</h3>
                <p className="text-gray-300">Challenge gym leaders across the region</p>
              </div>
              
              <div className="bg-white/10 rounded-xl p-6">
                <div className="text-4xl mb-4">👥</div>
                <h3 className="text-xl font-bold text-purple-300 mb-3">Make Friends</h3>
                <p className="text-gray-300">Meet rival trainers and build your team</p>
              </div>
              
              <div className="bg-white/10 rounded-xl p-6">
                <div className="text-4xl mb-4">🌌</div>
                <h3 className="text-xl font-bold text-cyan-300 mb-3">Legendary Encounters</h3>
                <p className="text-gray-300">Discover mythical Pokémon and their secrets</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className={`fixed ${isMobile ? 'bottom-4' : 'bottom-8'} left-1/2 transform -translate-x-1/2 z-50 w-full max-w-xs px-4`}>
        <div className={`flex ${isMobile ? 'flex-col gap-2' : 'gap-4'} items-center`}>
          <button
            onClick={handleBack}
            className={`group ${isMobile ? 'px-6 py-2 text-base w-full' : 'px-8 py-3 text-lg'} bg-gradient-to-r from-blue-500/90 to-cyan-500/90 backdrop-blur-sm rounded-full text-white font-bold hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-blue-500/50 border border-blue-400/30`}
          >
            <span className="flex items-center justify-center gap-2">
              ← Back
            </span>
          </button>
          
          {/* Scroll Indicator */}
          {!isMobile && (
            <div className="flex items-center gap-2 text-blue-300">
              <div className="w-32 h-1 bg-blue-500/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full transition-all duration-300"
                  style={{ width: `${scrollProgress * 100}%` }}
                />
              </div>
              <span className="text-sm font-mono">
                {Math.round(scrollProgress * 100)}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Custom Styles */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        :root {
          --scroll-hue: 200deg;
        }
      `}</style>
    </section>
  )
}

export default JourneyPage1