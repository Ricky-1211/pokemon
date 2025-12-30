import { useEffect, useRef, useState, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { PerspectiveCamera, Environment, Text, Float, Sparkles, Billboard, Stars } from '@react-three/drei'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import * as THREE from 'three'
import SceneManager from '../../../three/SceneManager'
import CameraController from '../../../three/CameraController'
import Pikachu3D from '../../three/Pikachu3D'
import useSound from '../../../hooks/useSound'
import { useIsMobile } from '../../../hooks/use-mobail'

gsap.registerPlugin(ScrollTrigger)

// 3D Thunderbolt Effect
function ThunderboltEffect({ position = [0, 0, 0], intensity = 1 }) {
  const boltRef = useRef()
  const [opacity, setOpacity] = useState(0)
  
  useFrame((state) => {
    if (boltRef.current) {
      boltRef.current.rotation.y += 0.02
      boltRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 2) * 0.1
      
      // Pulsing opacity
      setOpacity(0.5 + Math.sin(state.clock.elapsedTime * 3) * 0.3)
    }
  })

  return (
    <group ref={boltRef} position={position}>
      {/* Main lightning bolt */}
      <mesh>
        <coneGeometry args={[0.1, 2, 4]} />
        <meshStandardMaterial 
          color="#fbbf24"
          emissive="#fbbf24"
          emissiveIntensity={intensity}
          transparent
          opacity={opacity}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>
      
      {/* Lightning branches */}
      {[...Array(4)].map((_, i) => (
        <mesh key={i} position={[Math.sin(i) * 0.3, i * 0.5, Math.cos(i) * 0.3]}>
          <coneGeometry args={[0.05, 1, 3]} />
          <meshStandardMaterial 
            color="#f59e0b"
            emissive="#f59e0b"
            emissiveIntensity={intensity * 0.8}
            transparent
            opacity={opacity * 0.7}
          />
        </mesh>
      ))}
      
      {/* Sparks */}
      <Sparkles count={20} scale={[2, 3, 2]} size={0.1} color="#fbbf24" />
    </group>
  )
}

// 3D Friendship Meter
function FriendshipMeter({ friendship = 0 }) {
  const groupRef = useRef()
  const filledHeight = useMemo(() => friendship / 100, [friendship])
  
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.005
    }
  })

  return (
    <group ref={groupRef}>
      {/* Outer ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2, 0.1, 16, 100]} />
        <meshStandardMaterial 
          color="#f59e0b"
          emissive="#f59e0b"
          emissiveIntensity={0.3}
          roughness={0.5}
        />
      </mesh>
      
      {/* Friendship bar */}
      <mesh position={[0, -0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 3, 16]} />
        <meshStandardMaterial 
          color="#f59e0b"
          emissive="#f59e0b"
          emissiveIntensity={0.5}
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>
      
      {/* Filled portion */}
      <mesh position={[0, -0.5 + (filledHeight * 1.5), 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.28, 0.28, filledHeight * 3, 16]} />
        <meshStandardMaterial 
          color="#fbbf24"
          emissive="#fbbf24"
          emissiveIntensity={1}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
      
      {/* Heart particles */}
      {friendship > 0 && (
        <Sparkles 
          count={Math.floor(friendship / 10)} 
          scale={[3, 3, 3]} 
          size={0.1} 
          color="#ef4444" 
          speed={0.5}
        />
      )}
    </group>
  )
}

// 3D Battle Arena
function BattleArena({ isBattling = false }) {
  const arenaRef = useRef()
  
  useFrame((state) => {
    if (arenaRef.current && isBattling) {
      arenaRef.current.rotation.y += 0.01
      
      // Pulsing effect during battle
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.1
      arenaRef.current.scale.setScalar(1 + pulse)
    }
  })

  return (
    <group ref={arenaRef}>
      {/* Arena floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <circleGeometry args={[5, 32]} />
        <meshStandardMaterial 
          color="#1e293b"
          emissive="#f59e0b"
          emissiveIntensity={isBattling ? 0.2 : 0.05}
          roughness={0.8}
        />
      </mesh>
      
      {/* Arena border */}
      <mesh rotation={[0, 0, 0]}>
        <torusGeometry args={[4.5, 0.1, 16, 100]} />
        <meshStandardMaterial 
          color="#f59e0b"
          emissive="#f59e0b"
          emissiveIntensity={isBattling ? 0.8 : 0.3}
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>
      
      {/* Battle effects */}
      {isBattling && (
        <>
          <Sparkles count={50} scale={[10, 2, 10]} size={0.2} color="#fbbf24" speed={2} />
          <group position={[2, 0, 0]}>
            <ThunderboltEffect intensity={2} />
          </group>
          <group position={[-2, 0, 0]}>
            <ThunderboltEffect intensity={1.5} />
          </group>
        </>
      )}
    </group>
  )
}

const JourneyPage2 = ({ onBack, onContinue }) => {
  const sectionRef = useRef(null)
  const containerRef = useRef(null)
  const titleRef = useRef(null)
  const pikachuGroupRef = useRef(null)
  const friendshipSectionRef = useRef(null)
  const battleSectionRef = useRef(null)
  
  const { playClickSound, playThunderSound, playFriendshipSound, playBattleSound } = useSound()
  const isMobile = useIsMobile()
  
  const [friendship, setFriendship] = useState(0)
  const [isBattling, setIsBattling] = useState(false)
  const [pikachuType, setPikachuType] = useState('normal')
  const [scrollProgress, setScrollProgress] = useState(0)
  const [showThunderbolt, setShowThunderbolt] = useState(false)
  const [pikachuScale, setPikachuScale] = useState(0.5)
  const [pikachuRotation, setPikachuRotation] = useState(Math.PI * 2)

  const friendshipPhases = [
    { level: 0, label: 'New Friends', color: '#9ca3af' },
    { level: 25, label: 'Good Friends', color: '#60a5fa' },
    { level: 50, label: 'Close Friends', color: '#8b5cf6' },
    { level: 75, label: 'Best Friends', color: '#ec4899' },
    { level: 100, label: 'Soulmates', color: '#fbbf24' }
  ]

  const currentFriendshipPhase = useMemo(() => {
    return friendshipPhases.reduce((current, phase) => 
      friendship >= phase.level ? phase : current
    , friendshipPhases[0])
  }, [friendship])

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: -100, rotationX: 45 },
        { 
          opacity: 1, 
          y: 0, 
          rotationX: 0,
          duration: 1.5, 
          ease: 'back.out(1.7)',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
          },
        }
      )

      // Pikachu entrance animation - animate state values instead of Three.js object directly
      gsap.to({ value: 0.5 }, {
        value: 1,
        duration: 2,
        ease: 'elastic.out(1, 0.5)',
        onUpdate: function() {
          setPikachuScale(this.targets()[0].value)
        }
      })
      
      gsap.to({ value: Math.PI * 2 }, {
        value: 0,
        duration: 2,
        ease: 'elastic.out(1, 0.5)',
        onUpdate: function() {
          setPikachuRotation(this.targets()[0].value)
        }
      })

      // Scroll-triggered animations
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
        onUpdate: (self) => {
          setScrollProgress(self.progress)
          
          // Friendship progression based on scroll
          const newFriendship = Math.min(Math.floor(self.progress * 120), 100)
          if (newFriendship > friendship) {
            setFriendship(newFriendship)
            if (newFriendship > 0 && newFriendship % 25 === 0) {
              playFriendshipSound()
            }
          }
          
          // Pikachu type changes based on scroll
          if (self.progress > 0.3 && self.progress < 0.6) {
            setPikachuType('electric')
          } else if (self.progress > 0.6) {
            setPikachuType('thunderbolt')
            if (!showThunderbolt) {
              setShowThunderbolt(true)
              playThunderSound()
            }
          } else {
            setPikachuType('normal')
          }
          
          // Battle mode at 80% scroll
          if (self.progress > 0.8 && !isBattling) {
            setIsBattling(true)
            playBattleSound()
          } else if (self.progress <= 0.8 && isBattling) {
            setIsBattling(false)
          }
          
          // Camera movement
          const x = Math.sin(self.progress * Math.PI) * 3
          const y = 2 + Math.sin(self.progress * Math.PI * 2) * 1
          const z = 5 + self.progress * 2
          
          // Update camera position in CSS custom property for 3D scene
          document.documentElement.style.setProperty('--camera-x', `${x}`)
          document.documentElement.style.setProperty('--camera-y', `${y}`)
          document.documentElement.style.setProperty('--camera-z', `${z}`)
        }
      })

      // Section entrance animations
      if (friendshipSectionRef.current) {
        gsap.fromTo(friendshipSectionRef.current,
          { opacity: 0, y: 100 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: friendshipSectionRef.current,
              start: 'top 80%',
            },
          }
        )
      }

      if (battleSectionRef.current) {
        gsap.fromTo(battleSectionRef.current,
          { opacity: 0, scale: 0.8 },
          {
            opacity: 1,
            scale: 1,
            duration: 1,
            ease: 'back.out(1.7)',
            scrollTrigger: {
              trigger: battleSectionRef.current,
              start: 'top 80%',
            },
          }
        )
      }

    }, sectionRef)

    return () => ctx.revert()
  }, [playThunderSound, playFriendshipSound, playBattleSound, isBattling, friendship, showThunderbolt, isMobile])

  const handleIncreaseFriendship = (e) => {
    e?.preventDefault()
    e?.stopPropagation()
    if (friendship < 100) {
      const newFriendship = Math.min(friendship + 25, 100)
      setFriendship(newFriendship)
      playFriendshipSound()
      
      // Celebration animation
      const celebration = document.querySelector('.friendship-celebration')
      if (celebration) {
        gsap.to(celebration, {
          scale: 1.2,
          duration: 0.3,
          yoyo: true,
          repeat: 1,
        })
      }
    }
  }

  const handleBack = (e) => {
    e?.preventDefault()
    e?.stopPropagation()
    playClickSound()
    
    // Exit animation
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

  const handleContinue = (e) => {
    e?.preventDefault()
    e?.stopPropagation()
    playClickSound()
    
    // Victory animation
    const continueBtn = document.querySelector('.continue-button')
    if (continueBtn) {
      gsap.to(continueBtn, {
        scale: 1.2,
        duration: 0.3,
        yoyo: true,
        repeat: 1,
        onComplete: () => {
          if (onContinue) onContinue()
        }
      })
    } else {
      if (onContinue) onContinue()
    }
  }

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen"
    >
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-b from-yellow-950/80 via-orange-950/60 to-amber-950/40">
        {/* Animated particles (reduced on mobile) */}
        <div className="absolute inset-0">
          {[...Array(isMobile ? 50 : 150)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full animate-pulse"
              style={{
                width: `${Math.random() * 4 + 1}px`,
                height: `${Math.random() * 4 + 1}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                background: `linear-gradient(45deg, #fbbf24, #f59e0b)`,
                animation: `float ${2 + Math.random() * 3}s infinite ease-in-out`,
                animationDelay: `${Math.random() * 2}s`,
                opacity: 0.5 + Math.random() * 0.5,
              }}
            />
          ))}
        </div>
        
        {/* Lightning pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M 50,10 L 70,80 L 30,80 L 50,150 L 150,50 L 110,50 L 130,10 Z' fill='%23fbbf24'/%3E%3C/svg%3E")`,
          backgroundSize: '100px',
        }} />
      </div>

      {/* 3D Scene */}
      <div className="fixed inset-0 z-0">
        <Canvas>
          <PerspectiveCamera makeDefault position={[0, 2, 6]} fov={60} />
          <SceneManager enableFog={true} fogColor="#451a03" fogNear={1} fogFar={30}>
            <ambientLight intensity={0.4} />
            <directionalLight position={[5, 10, 5]} intensity={1.2} color="#f59e0b" />
            <pointLight position={[-3, 3, -3]} intensity={0.8} color="#fbbf24" />
            <pointLight position={[3, 3, 3]} intensity={0.8} color="#f97316" />
            
            {/* Battle Arena */}
            <BattleArena isBattling={isBattling} />
            
            {/* Pikachu */}
            <group 
              ref={pikachuGroupRef} 
              position={[0, 0, 0]}
              scale={[pikachuScale * (isMobile ? 0.8 : 1.2), pikachuScale * (isMobile ? 0.8 : 1.2), pikachuScale * (isMobile ? 0.8 : 1.2)]}
              rotation={[0, pikachuRotation, 0]}
            >
              <Pikachu3D 
                position={[0, 0, 0]} 
                scale={1} 
                type={pikachuType}
                scrollProgress={scrollProgress}
              />
            </group>
            
            {/* Friendship Meter */}
            {friendship > 0 && (
              <group position={[-4, 0, 0]}>
                <FriendshipMeter friendship={friendship} />
              </group>
            )}
            
            {/* Thunderbolt Effect */}
            {showThunderbolt && (
              <group position={[0, 3, 0]}>
                <ThunderboltEffect intensity={pikachuType === 'thunderbolt' ? 2 : 1} />
              </group>
            )}
            
            {/* Stars (reduced on mobile) */}
            <Stars radius={100} depth={50} count={isMobile ? 1000 : 3000} factor={4} />
            
            <Environment preset="night" />
          </SceneManager>
        </Canvas>
      </div>

      {/* Content Container */}
      <div ref={containerRef} className="relative z-10 min-h-[400vh] pt-32 pb-96">
        <div className="max-w-7xl mx-auto px-4">
          {/* Hero Section */}
          <div className={`text-center ${isMobile ? 'mb-16' : 'mb-32'}`}>
            <h1
              ref={titleRef}
              className={`${isMobile ? 'text-4xl' : 'text-8xl md:text-[10rem] lg:text-[12rem]'} font-black ${isMobile ? 'mb-2' : 'mb-4'} text-transparent bg-clip-text`}
              style={{
                background: 'linear-gradient(45deg, #fbbf24, #f59e0b, #d97706)',
                textShadow: isMobile ? '0 0 40px rgba(251, 191, 36, 0.5)' : '0 0 80px rgba(251, 191, 36, 0.5)',
                letterSpacing: '-0.05em',
                fontFamily: "'Bebas Neue', sans-serif",
              }}
            >
              FIRST ENCOUNTER
            </h1>
            
            <p className={`${isMobile ? 'text-xl' : 'text-3xl md:text-4xl'} text-yellow-300 ${isMobile ? 'mb-4' : 'mb-6'}`}>
              The spark that started it all
            </p>
            
            <p className={`${isMobile ? 'text-base' : 'text-xl'} text-gray-300 max-w-3xl mx-auto px-4`}>
              Every legendary partnership begins with a single moment. 
              This is where your bond with Pikachu was forged.
            </p>
          </div>

          {/* Friendship Section */}
          <div ref={friendshipSectionRef} className={isMobile ? 'mb-16' : 'mb-32'}>
            <div className={`backdrop-blur-xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-3xl ${isMobile ? 'p-4' : 'p-8 md:p-12'} border-2 border-yellow-400/30`}>
              <h2 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-bold text-yellow-300 ${isMobile ? 'mb-4' : 'mb-6'} text-center`}>
                Building Friendship
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-2xl font-bold text-yellow-300 mb-4">The Bond Grows</h3>
                  <p className="text-gray-300 leading-relaxed mb-6">
                    In Pokémon, friendship isn't just a number—it's the foundation of every great partnership. 
                    As you travel together, battle together, and share experiences, your bond deepens.
                  </p>
                  
                  <div className="bg-yellow-500/10 rounded-xl p-6 mb-6">
                    <h4 className="text-xl font-bold text-yellow-300 mb-3">Current Friendship: {friendship}/100</h4>
                    <div className="w-full h-4 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-500"
                        style={{ width: `${friendship}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-sm text-gray-400 mt-2">
                      <span>Strangers</span>
                      <span>Soulmates</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleIncreaseFriendship}
                    disabled={friendship >= 100}
                    type="button"
                    className={`${isMobile ? 'px-5 py-2.5 text-sm' : 'px-6 py-3'} bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-all w-full ${isMobile ? 'max-w-[280px]' : ''}`}
                  >
                    {friendship >= 100 ? '✓ MAX FRIENDSHIP' : 'Strengthen Bond'}
                  </button>
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold text-yellow-300 mb-4">Friendship Milestones</h3>
                  <div className="space-y-4">
                    {friendshipPhases.map((phase, index) => (
                      <div
                        key={phase.level}
                        className={`flex items-center p-4 rounded-xl transition-all duration-300 ${
                          friendship >= phase.level
                            ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-l-4'
                            : 'bg-gray-900/30'
                        }`}
                        style={{
                          borderLeftColor: friendship >= phase.level ? phase.color : 'transparent',
                        }}
                      >
                        <div className="w-10 h-10 rounded-full flex items-center justify-center mr-4"
                          style={{
                            backgroundColor: friendship >= phase.level ? phase.color + '40' : '#374151',
                            color: friendship >= phase.level ? phase.color : '#9ca3af',
                          }}
                        >
                          {friendship >= phase.level ? '✓' : index + 1}
                        </div>
                        <div>
                          <div className="font-bold text-white">{phase.label}</div>
                          <div className="text-sm text-gray-400">{phase.level}+ friendship</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pikachu Evolution Section */}
          <div className={isMobile ? 'mb-16' : 'mb-32'}>
            <h2 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-bold text-center ${isMobile ? 'mb-6' : 'mb-12'}`}>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-amber-400">
                Pikachu's Journey
              </span>
            </h2>
            
            <div className={`grid grid-cols-1 ${isMobile ? 'gap-4' : 'md:grid-cols-3 gap-8'}`}>
              <div className={`backdrop-blur-xl bg-white/5 rounded-2xl ${isMobile ? 'p-4' : 'p-8'} border-2 border-yellow-400/30 text-center`}>
                <div className={`${isMobile ? 'text-4xl mb-2' : 'text-5xl mb-4'}`}>⚡</div>
                <h3 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-yellow-300 ${isMobile ? 'mb-2' : 'mb-3'}`}>Thunderbolt</h3>
                <p className={`${isMobile ? 'text-sm' : ''} text-gray-300 ${isMobile ? 'mb-2' : 'mb-4'}`}>Pikachu's signature move, learned through friendship</p>
                <div className={`${isMobile ? 'text-sm' : ''} text-yellow-400 font-bold`}>Power: 90 • Accuracy: 100%</div>
              </div>
              
              <div className={`backdrop-blur-xl bg-white/5 rounded-2xl ${isMobile ? 'p-4' : 'p-8'} border-2 border-orange-400/30 text-center`}>
                <div className={`${isMobile ? 'text-4xl mb-2' : 'text-5xl mb-4'}`}>💛</div>
                <h3 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-orange-300 ${isMobile ? 'mb-2' : 'mb-3'}`}>Loyalty</h3>
                <p className={`${isMobile ? 'text-sm' : ''} text-gray-300 ${isMobile ? 'mb-2' : 'mb-4'}`}>Refuses to evolve to stay with its trainer</p>
                <div className={`${isMobile ? 'text-sm' : ''} text-orange-400 font-bold`}>Unique among all Pokémon</div>
              </div>
              
              <div className={`backdrop-blur-xl bg-white/5 rounded-2xl ${isMobile ? 'p-4' : 'p-8'} border-2 border-amber-400/30 text-center`}>
                <div className={`${isMobile ? 'text-4xl mb-2' : 'text-5xl mb-4'}`}>🎮</div>
                <h3 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-amber-300 ${isMobile ? 'mb-2' : 'mb-3'}`}>Icon Status</h3>
                <p className={`${isMobile ? 'text-sm' : ''} text-gray-300 ${isMobile ? 'mb-2' : 'mb-4'}`}>The official mascot of the Pokémon franchise</p>
                <div className={`${isMobile ? 'text-sm' : ''} text-amber-400 font-bold`}>Recognized worldwide</div>
              </div>
            </div>
          </div>

          {/* Battle Section */}
          <div ref={battleSectionRef} className={isMobile ? 'mb-16' : 'mb-32'}>
            <div className={`backdrop-blur-xl bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-3xl ${isMobile ? 'p-4' : 'p-8 md:p-12'} border-2 border-red-400/30`}>
              <h2 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-bold text-red-300 ${isMobile ? 'mb-4' : 'mb-6'} text-center`}>
                First Battle
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-2xl font-bold text-red-300 mb-4">Test Your Skills</h3>
                  <p className="text-gray-300 leading-relaxed mb-6">
                    Every trainer must prove themselves in battle. Your first real test against another 
                    trainer will challenge both your strategy and your bond with Pikachu.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-red-500/10 rounded-xl p-4 text-center">
                      <div className="text-2xl mb-2">⚔️</div>
                      <div className="font-bold text-red-300">Type Matchups</div>
                      <div className="text-sm text-gray-400">Electric vs Flying</div>
                    </div>
                    <div className="bg-red-500/10 rounded-xl p-4 text-center">
                      <div className="text-2xl mb-2">🎯</div>
                      <div className="font-bold text-red-300">Strategy</div>
                      <div className="text-sm text-gray-400">Timing & Moves</div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold text-red-300 mb-4">Battle Status</h3>
                  <div className="space-y-4">
                    <div className="bg-gray-900/50 rounded-xl p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-yellow-300">Pikachu</span>
                        <span className="text-yellow-400">HP: 100%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full w-full" />
                      </div>
                    </div>
                    
                    <div className="bg-gray-900/50 rounded-xl p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-blue-300">Opponent's Pokémon</span>
                        <span className="text-blue-400">HP: {isBattling ? '78%' : '100%'}</span>
                      </div>
                      <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-1000"
                          style={{ width: isBattling ? '78%' : '100%' }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 text-center">
                    <div className="text-sm text-gray-400 mb-2">
                      Battle {isBattling ? 'In Progress ⚡' : 'Ready'}
                    </div>
                    <div className="text-4xl animate-pulse">
                      {isBattling ? '⚔️' : '🛡️'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="backdrop-blur-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-3xl p-8 md:p-12 border-2 border-yellow-400/30">
            <h2 className="text-4xl font-bold text-center text-white mb-8">
              The Journey Continues
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/10 rounded-xl p-6 text-center">
                <div className="text-4xl mb-4">🏆</div>
                <h3 className="text-xl font-bold text-yellow-300 mb-3">First Gym</h3>
                <p className="text-gray-300">Challenge Brock in Pewter City</p>
              </div>
              
              <div className="bg-white/10 rounded-xl p-6 text-center">
                <div className="text-4xl mb-4">🌳</div>
                <h3 className="text-xl font-bold text-green-300 mb-3">Viridian Forest</h3>
                <p className="text-gray-300">Catch bug-type Pokémon</p>
              </div>
              
              <div className="bg-white/10 rounded-xl p-6 text-center">
                <div className="text-4xl mb-4">👥</div>
                <h3 className="text-xl font-bold text-blue-300 mb-3">Meet Rivals</h3>
                <p className="text-gray-300">Face other trainers</p>
              </div>
              
              <div className="bg-white/10 rounded-xl p-6 text-center">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-purple-300 mb-3">Discover Secrets</h3>
                <p className="text-gray-300">Uncover hidden locations</p>
              </div>
            </div>
            
            <div className="text-center mt-8">
              <button
                onClick={handleContinue}
                type="button"
                className={`continue-button ${isMobile ? 'px-8 py-3 text-base' : 'px-12 py-4 text-xl'} bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 rounded-full text-white font-bold hover:scale-105 active:scale-95 transition-all duration-300 shadow-2xl hover:shadow-orange-500/50 w-full ${isMobile ? 'max-w-[280px]' : 'max-w-xs'}`}
              >
                CONTINUE JOURNEY →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className={`fixed ${isMobile ? 'bottom-4' : 'bottom-8'} left-1/2 transform -translate-x-1/2 z-50 w-full max-w-xs px-4`}>
        <div className={`flex ${isMobile ? 'flex-col gap-3' : 'flex-col md:flex-row items-center gap-6'}`}>
          <button
            onClick={handleBack}
            type="button"
            className={`group ${isMobile ? 'px-6 py-2.5 text-base w-full' : 'px-8 py-3 text-lg'} bg-gradient-to-r from-yellow-500/90 to-orange-500/90 backdrop-blur-sm rounded-full text-white font-bold hover:scale-105 active:scale-95 transition-all duration-300 shadow-2xl hover:shadow-yellow-500/50 border border-yellow-400/30`}
          >
            <span className="flex items-center justify-center gap-2">
              ← Back
            </span>
          </button>
          
          {/* Progress Indicator */}
          {!isMobile && (
            <div className="flex flex-col items-center gap-2">
              <div className="text-sm text-yellow-300 font-mono">
                SCROLL: {Math.round(scrollProgress * 100)}%
              </div>
              <div className="w-48 h-1 bg-yellow-500/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-300"
                  style={{ width: `${scrollProgress * 100}%` }}
                />
              </div>
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
        
        .friendship-celebration {
          transition: all 0.3s ease;
        }
        
        :root {
          --camera-x: 0;
          --camera-y: 2;
          --camera-z: 6;
        }
      `}</style>
    </section>
  )
}

export default JourneyPage2