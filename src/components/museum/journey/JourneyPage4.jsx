import { useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerspectiveCamera, Environment, OrbitControls, Text, Float, Sparkles, Stars } from '@react-three/drei'
import { gsap } from 'gsap'
import SceneManager from '../../../three/SceneManager'
import CameraController from '../../../three/CameraController'
import Pikachu3D from '../../three/Pikachu3D'
import Pokemon3D from '../../three/Pokemon3D' // Assume you have this component
import useSound from '../../../hooks/useSound'

const JourneyPage4 = ({ onBack }) => {
  const sectionRef = useRef(null)
  const titleRef = useRef(null)
  const contentRef = useRef(null)
  const battleElementsRef = useRef([])
  const [battleActive, setBattleActive] = useState(false)
  const { playClickSound, playAttackSound, playLevelUpSound } = useSound()

  // Add more Pokémon for battle scene
  const pokemonList = [
    { name: "Pikachu", type: "electric", position: [-3, 0, 0], scale: 1.2 },
    { name: "Charizard", type: "fire", position: [3, 0, 0], scale: 1.5 },
    { name: "Blastoise", type: "water", position: [0, 0, 4], scale: 1.4 },
    { name: "Venusaur", type: "grass", position: [0, 0, -4], scale: 1.6 }
  ]

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Main entrance animation
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      
      tl.fromTo(
        sectionRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.8 }
      )
      .fromTo(
        titleRef.current,
        { opacity: 0, y: -80, scale: 0.8 },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1, 
          duration: 1.2,
          ease: 'back.out(1.7)'
        },
        '-=0.5'
      )
      .fromTo(
        contentRef.current,
        { opacity: 0, y: 60 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 1, 
          ease: 'power2.out' 
        },
        '-=0.7'
      )
      .call(() => {
        // Start battle animations after intro
        setTimeout(() => {
          setBattleActive(true)
          startBattleAnimations()
        }, 500)
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const startBattleAnimations = () => {
    if (!battleElementsRef.current.length) return

    // Battle sequence animation
    const battleTL = gsap.timeline({ repeat: -1, yoyo: true, repeatDelay: 1 })
    
    // Floating animation for battle cards
    battleElementsRef.current.forEach((element, index) => {
      if (element) {
        gsap.to(element, {
          y: `+=${20}`,
          duration: 2,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          delay: index * 0.2
        })
      }
    })

    // Pulsing glow effect
    battleTL
      .to('.battle-glow', {
        boxShadow: '0 0 40px rgba(239, 68, 68, 0.8)',
        duration: 0.8,
        ease: 'sine.inOut'
      })
      .to('.battle-glow', {
        boxShadow: '0 0 20px rgba(239, 68, 68, 0.4)',
        duration: 0.8,
        ease: 'sine.inOut'
      })

    // Type advantage animations
    const typeAdvantages = [
      { from: '#ef4444', to: '#22c55e' }, // Fire to Grass
      { from: '#3b82f6', to: '#ef4444' }, // Water to Fire
      { from: '#f59e0b', to: '#3b82f6' }  // Electric to Water
    ]

    typeAdvantages.forEach((colors, index) => {
      gsap.to(`.type-flow-${index}`, {
        background: `linear-gradient(90deg, ${colors.from}, ${colors.to})`,
        duration: 2,
        ease: 'none',
        repeat: -1,
        yoyo: true,
        delay: index * 0.5
      })
    })
  }

  const handleBattleClick = () => {
    playAttackSound()
    
    // Visual feedback for battle click
    gsap.to('.battle-btn', {
      scale: 0.9,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      ease: 'power2.inOut'
    })

    // Show battle effects
    gsap.to('.battle-effect', {
      opacity: 1,
      scale: 1.5,
      duration: 0.3,
      onComplete: () => {
        gsap.to('.battle-effect', {
          opacity: 0,
          scale: 1,
          duration: 0.5
        })
      }
    })

    // Level up animation
    setTimeout(() => {
      playLevelUpSound()
      gsap.fromTo('.level-up',
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.5,
          ease: 'back.out(1.7)',
          onComplete: () => {
            gsap.to('.level-up', {
              scale: 0,
              opacity: 0,
              duration: 0.3,
              delay: 1
            })
          }
        }
      )
    }, 300)
  }

  const handleBack = () => {
    playClickSound()
    
    // Exit animation
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

  // 3D Battle Arena Component
  const BattleArena = () => (
    <>
      {/* Ambient light for battle scene */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
      <pointLight position={[-5, 3, -5]} intensity={0.8} color="#ef4444" />
      <pointLight position={[5, 3, 5]} intensity={0.8} color="#3b82f6" />
      <pointLight position={[0, 5, 0]} intensity={0.5} color="#f59e0b" />

      {/* Battle platform */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow>
        <cylinderGeometry args={[6, 6, 0.2, 32]} />
        <meshStandardMaterial
          color="#1f2937"
          metalness={0.8}
          roughness={0.2}
          emissive="#111827"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Battle ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.4, 0]}>
        <ringGeometry args={[3, 6, 32]} />
        <meshStandardMaterial
          color="#ef4444"
          transparent
          opacity={0.3}
          emissive="#ef4444"
          emissiveIntensity={0.5}
          side={2}
        />
      </mesh>

      {/* Battle Pokémon */}
      <Float speed={2} rotationIntensity={1} floatIntensity={1}>
        <group position={[-3, 0, 0]}>
          <Pikachu3D position={[0, 0, 0]} scale={1.2} type="electric" animateIdle={true} />
          <Sparkles count={20} scale={[2, 2, 2]} size={0.1} color="#fbbf24" speed={0.3} />
        </group>
      </Float>

      <Float speed={1.5} rotationIntensity={0.8} floatIntensity={0.8}>
        <group position={[3, 0, 0]}>
          {/* You can add Charizard or other Pokémon here */}
          <mesh castShadow>
            <sphereGeometry args={[0.8, 16, 16]} />
            <meshStandardMaterial
              color="#ef4444"
              emissive="#ef4444"
              emissiveIntensity={0.3}
              roughness={0.4}
            />
            {/* Charizard-like features */}
            <mesh position={[0, 0.8, 0.5]}>
              <coneGeometry args={[0.2, 0.5, 8]} />
              <meshStandardMaterial color="#dc2626" />
            </mesh>
            <mesh position={[-0.3, 0.5, 0.8]}>
              <sphereGeometry args={[0.15, 8, 8]} />
              <meshStandardMaterial color="white" />
            </mesh>
            <mesh position={[0.3, 0.5, 0.8]}>
              <sphereGeometry args={[0.15, 8, 8]} />
              <meshStandardMaterial color="white" />
            </mesh>
          </mesh>
          <Sparkles count={15} scale={[1.5, 1.5, 1.5]} size={0.08} color="#f97316" speed={0.2} />
        </group>
      </Float>

      {/* Battle effects */}
      {battleActive && (
        <>
          {/* Electric attack */}
          <mesh position={[-1.5, 1, 0]}>
            <sphereGeometry args={[0.3, 8, 8]} />
            <meshStandardMaterial
              color="#fbbf24"
              transparent
              opacity={0.7}
              emissive="#fbbf24"
              emissiveIntensity={0.8}
            />
          </mesh>
          
          {/* Fire attack */}
          <mesh position={[1.5, 1, 0]}>
            <sphereGeometry args={[0.4, 8, 8]} />
            <meshStandardMaterial
              color="#ef4444"
              transparent
              opacity={0.7}
              emissive="#ef4444"
              emissiveIntensity={0.8}
            />
          </mesh>
        </>
      )}

      {/* Type advantage indicators */}
      <Text
        position={[-3, 2, 0]}
        fontSize={0.5}
        color="#f59e0b"
        anchorX="center"
        anchorY="middle"
      >
        ELECTRIC
      </Text>
      <Text
        position={[3, 2, 0]}
        fontSize={0.5}
        color="#ef4444"
        anchorX="center"
        anchorY="middle"
      >
        FIRE
      </Text>

      {/* XP particles */}
      <Sparkles
        count={50}
        scale={[10, 5, 10]}
        size={0.1}
        color="#ffffff"
        speed={0.5}
        opacity={0.6}
      />
    </>
  )

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen w-full overflow-hidden py-20 px-4"
    >
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-red-950/80 to-black">
        {/* Battle arena pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(239,68,68,0.15),transparent_40%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(59,130,246,0.15),transparent_40%)]" />
        
        {/* Moving grid pattern */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `linear-gradient(rgba(239, 68, 68, 0.3) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(239, 68, 68, 0.3) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />
        
        {/* Animated battle effects */}
        <div className="absolute inset-0 overflow-hidden">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="absolute battle-effect opacity-0"
              style={{
                width: '100px',
                height: '100px',
                background: 'radial-gradient(circle, rgba(239,68,68,0.6) 0%, transparent 70%)',
                left: `${30 + i * 20}%`,
                top: `${20 + i * 15}%`,
                borderRadius: '50%',
                filter: 'blur(10px)'
              }}
            />
          ))}
        </div>
      </div>

      {/* 3D Scene */}
      <div className="absolute inset-0 z-0">
        <Canvas shadows camera={{ position: [0, 5, 12], fov: 50 }}>
          <PerspectiveCamera makeDefault position={[0, 5, 12]} />
          <SceneManager enableFog={true} fogColor="#0f172a" fogNear={1} fogFar={30}>
            <BattleArena />
            <CameraController
              targetPosition={[0, 5, 12]}
              targetLookAt={[0, 0, 0]}
              enableMouseParallax={true}
              parallaxStrength={0.5}
            />
            <OrbitControls 
              enableZoom={true}
              enablePan={false}
              minDistance={5}
              maxDistance={20}
              autoRotate={false}
              autoRotateSpeed={0.3}
            />
            <Environment preset="studio" />
          </SceneManager>
        </Canvas>
      </div>

      {/* Level Up Animation */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40">
        <div className="level-up opacity-0">
          <div className="text-6xl font-bold text-yellow-300 animate-pulse">
            LEVEL UP! 🎉
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
            background: 'linear-gradient(90deg, #ef4444, #f59e0b, #ec4899)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundSize: '200% auto',
            animation: 'gradientShift 3s ease-in-out infinite',
            textShadow: '0 0 60px rgba(239, 68, 68, 0.5)',
            fontFamily: "'Bebas Neue', sans-serif",
            letterSpacing: '0.05em'
          }}
        >
          BATTLES & GROWTH
        </h1>

        <p className="text-2xl md:text-3xl text-center text-red-300 mb-12 font-semibold tracking-wide">
          Forge Your Legacy Through Battle
        </p>

        <div ref={contentRef} className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Left Column - Battle Mechanics */}
          <div className="space-y-6">
            <div 
              ref={el => battleElementsRef.current[0] = el}
              className="battle-glow bg-gradient-to-br from-red-500/10 to-red-900/10 backdrop-blur-xl rounded-2xl p-8 border-2 border-red-500/30 shadow-xl"
            >
              <h2 className="text-3xl font-bold text-red-300 mb-4 flex items-center gap-3">
                <span className="text-4xl">⚔️</span>
                Master the Battle System
              </h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Engage in strategic Pokémon battles where type advantages, move sets, and timing 
                determine victory. Each battle teaches your Pokémon new techniques and builds experience.
              </p>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-red-500/20 rounded-xl p-4">
                  <h4 className="font-bold text-red-200 mb-2">Type Matchups</h4>
                  <p className="text-sm text-gray-300">Learn elemental strengths & weaknesses</p>
                </div>
                <div className="bg-yellow-500/20 rounded-xl p-4">
                  <h4 className="font-bold text-yellow-200 mb-2">Move Strategies</h4>
                  <p className="text-sm text-gray-300">Master attack combinations</p>
                </div>
              </div>
            </div>

            {/* Type Advantages */}
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-950/80 backdrop-blur-xl rounded-2xl p-8 border-2 border-gray-700/30">
              <h3 className="text-2xl font-bold text-gray-300 mb-4">Type Advantages</h3>
              <div className="space-y-4">
                {[
                  { types: ['Fire', 'Grass'], colors: ['#ef4444', '#22c55e'] },
                  { types: ['Water', 'Fire'], colors: ['#3b82f6', '#ef4444'] },
                  { types: ['Electric', 'Water'], colors: ['#f59e0b', '#3b82f6'] },
                  { types: ['Grass', 'Water'], colors: ['#22c55e', '#3b82f6'] }
                ].map((advantage, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className={`type-flow-${index} h-2 rounded-full transition-all duration-500`} />
                    </div>
                    <div className="text-sm font-semibold text-gray-300">
                      <span style={{ color: advantage.colors[0] }}>{advantage.types[0]}</span>
                      <span className="mx-2">→</span>
                      <span style={{ color: advantage.colors[1] }}>{advantage.types[1]}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Growth & Progression */}
          <div className="space-y-6">
            <div 
              ref={el => battleElementsRef.current[1] = el}
              className="battle-glow bg-gradient-to-br from-yellow-500/10 to-yellow-900/10 backdrop-blur-xl rounded-2xl p-8 border-2 border-yellow-500/30 shadow-xl"
            >
              <h2 className="text-3xl font-bold text-yellow-300 mb-4 flex items-center gap-3">
                <span className="text-4xl">📈</span>
                Growth & Evolution
              </h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Watch your Pokémon evolve as they gain experience. Each level brings new abilities, 
                increased stats, and sometimes even evolutionary transformations.
              </p>
              
              {/* XP Progress Bar */}
              <div className="mt-6">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Experience Points</span>
                  <span>75% to Next Level</span>
                </div>
                <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full transition-all duration-1000"
                    style={{ width: '75%' }}
                  />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-yellow-500/20 rounded-xl p-4">
                  <h4 className="font-bold text-yellow-200 mb-2">Attack +5</h4>
                  <p className="text-sm text-gray-300">Increased power</p>
                </div>
                <div className="bg-green-500/20 rounded-xl p-4">
                  <h4 className="font-bold text-green-200 mb-2">HP +10</h4>
                  <p className="text-sm text-gray-300">Better endurance</p>
                </div>
              </div>
            </div>

            {/* Battle Practice Button */}
            <div className="text-center">
              <button
                onClick={handleBattleClick}
                className="battle-btn px-10 py-4 bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 rounded-full text-white font-bold text-xl hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-red-500/50 w-full"
              >
                <span className="flex items-center justify-center gap-3">
                  <span className="text-2xl">⚡</span>
                  Practice Battle Attack
                  <span className="text-2xl">🔥</span>
                </span>
                <div className="text-sm font-normal mt-2 opacity-80">
                  Click to simulate battle experience!
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Battle Tips */}
        <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 backdrop-blur-xl rounded-2xl p-8 border-2 border-purple-500/30 mb-12">
          <h3 className="text-2xl font-bold text-purple-300 mb-6 text-center">Battle Strategies</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Elemental Mastery",
                desc: "Understand type matchups to deal 2x damage",
                icon: "🔥",
                color: "red"
              },
              {
                title: "Move Synergy",
                desc: "Combine moves for powerful combos",
                icon: "⚡",
                color: "yellow"
              },
              {
                title: "Timing & Strategy",
                desc: "Choose the right moment to attack or defend",
                icon: "🛡️",
                color: "blue"
              }
            ].map((tip, index) => (
              <div 
                key={index}
                className={`bg-gradient-to-br from-${tip.color}-500/10 to-${tip.color}-900/10 rounded-xl p-6 border border-${tip.color}-500/30 text-center`}
              >
                <div className="text-4xl mb-3">{tip.icon}</div>
                <h4 className="font-bold text-white mb-2">{tip.title}</h4>
                <p className="text-sm text-gray-300">{tip.desc}</p>
              </div>
            ))}
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

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .battle-glow {
          transition: box-shadow 0.5s ease;
        }
        
        .type-flow-0, .type-flow-1, .type-flow-2 {
          background-size: 200% 100%;
          background-position: 100% 0;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .level-up {
          animation: float 2s ease-in-out infinite;
        }
      `}</style>
    </section>
  )
}

export default JourneyPage4