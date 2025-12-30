import { useEffect, useRef, useState, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SceneManager from '../../three/SceneManager'
import CameraController from '../../three/CameraController'
import Pikachu3D from '../three/Pikachu3D'
import Pokeball3D from '../three/Pokeball3D'
import Pokemon3D from '../three/Pokemon3D'
import useSound from '../../hooks/useSound'
import { useIsMobile } from '../../hooks/use-mobail'

gsap.registerPlugin(ScrollTrigger)

// Journey cards data
const journeyCards = [
  {
    id: 1,
    title: 'The Beginning',
    description: 'Your journey starts here, in the world of Pokémon',
    icon: '🌟',
    color: 'from-blue-500 to-cyan-500',
    gradient: 'from-blue-500/20 to-cyan-500/20',
    borderColor: 'border-blue-400/50',
  },
  {
    id: 2,
    title: 'First Encounter',
    description: 'Meet your first Pokémon companion',
    icon: '⚡',
    color: 'from-yellow-500 to-orange-500',
    gradient: 'from-yellow-500/20 to-orange-500/20',
    borderColor: 'border-yellow-400/50',
  },
  {
    id: 3,
    title: 'The Adventure',
    description: 'Explore vast regions and discover new species',
    icon: '🗺️',
    color: 'from-green-500 to-emerald-500',
    gradient: 'from-green-500/20 to-emerald-500/20',
    borderColor: 'border-green-400/50',
  },
  {
    id: 4,
    title: 'Battles & Growth',
    description: 'Train hard and become a Pokémon Master',
    icon: '⚔️',
    color: 'from-red-500 to-pink-500',
    gradient: 'from-red-500/20 to-pink-500/20',
    borderColor: 'border-red-400/50',
  },
  {
    id: 5,
    title: 'Evolution',
    description: 'Watch your Pokémon evolve and grow stronger',
    icon: '✨',
    color: 'from-purple-500 to-indigo-500',
    gradient: 'from-purple-500/20 to-indigo-500/20',
    borderColor: 'border-purple-400/50',
  },
  {
    id: 6,
    title: 'Legendary Quest',
    description: 'Face the ultimate challenge and catch legendary Pokémon',
    icon: '👑',
    color: 'from-amber-500 to-yellow-500',
    gradient: 'from-amber-500/20 to-yellow-500/20',
    borderColor: 'border-amber-400/50',
  },
]

const MuseumLobby = ({ onEnterMuseum, onStartGame, onBattle, onCardClick, onPokemonComparison }) => {
  const containerRef = useRef(null)
  const heroRef = useRef(null)
  const titleRef = useRef(null)
  const subtitleRef = useRef(null)
  const buttonRef = useRef(null)
  const startButtonRef = useRef(null)
  const battleButtonRef = useRef(null)
  const progressBarRef = useRef(null)
  const journeySectionRef = useRef(null)
  const progressLineRef = useRef(null)
  const cardRefs = useRef([])
  const particleContainerRef = useRef(null)

  const { playClickSound, playThunderSound, initAudioContext } = useSound()
  const isMobile = useIsMobile()
  const [audioInitialized, setAudioInitialized] = useState(false)
  const [pikachuType, setPikachuType] = useState('normal')
  const [pikachuPosition, setPikachuPosition] = useState({ x: 0, y: 0, scale: 1 })
  const [scrollProgress, setScrollProgress] = useState(0)
  const previousTypeRef = useRef('normal')
  const [selectedPokemon, setSelectedPokemon] = useState(null)
  const modalRef = useRef(null)

  useEffect(() => {
    initAudioContext()
    setAudioInitialized(true)

    // Create floating particles (reduced on mobile)
    const createParticles = () => {
      if (!particleContainerRef.current) return
      const container = particleContainerRef.current
      container.innerHTML = ''
      
      const particleCount = isMobile ? 20 : 50
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div')
        particle.className = 'absolute rounded-full bg-gradient-to-r from-purple-400/30 to-blue-400/30 blur-sm'
        particle.style.width = `${Math.random() * 4 + 2}px`
        particle.style.height = particle.style.width
        particle.style.left = `${Math.random() * 100}%`
        particle.style.top = `${Math.random() * 100}%`
        particle.style.animationDelay = `${Math.random() * 5}s`
        particle.style.animation = `float ${5 + Math.random() * 5}s ease-in-out infinite`
        container.appendChild(particle)
      }
    }

    createParticles()

    const ctx = gsap.context(() => {
      // Hero section entrance animation
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      tl.fromTo(
        titleRef.current,
        { opacity: 0, y: 100, scale: 0.8 },
        { opacity: 1, y: 0, scale: 1, duration: 1.5 }
      )
        .fromTo(
          subtitleRef.current,
          { opacity: 0, y: 50 },
          { opacity: 1, y: 0, duration: 1.2 },
          '-=0.8'
        )
        .fromTo(
          buttonRef.current,
          { opacity: 0, scale: 0.5, rotation: -180 },
          { opacity: 1, scale: 1, rotation: 0, duration: 1, ease: 'back.out(2)' },
          '-=0.5'
        )
        .fromTo(
          startButtonRef.current,
          { opacity: 0, x: -100, scale: 0.8 },
          { opacity: 1, x: 0, scale: 1, duration: 0.8, ease: 'back.out(1.7)' },
          '-=0.3'
        )
        .fromTo(
          battleButtonRef.current,
          { opacity: 0, x: 100, scale: 0.8 },
          { opacity: 1, x: 0, scale: 1, duration: 0.8, ease: 'back.out(1.7)' },
          '-=0.8'
        )

      // Floating animations for buttons (only if refs exist)
      if (buttonRef.current) {
        gsap.to(buttonRef.current, {
          y: '+=10',
          duration: 2,
          ease: 'power1.inOut',
          yoyo: true,
          repeat: -1,
        })
      }

      if (startButtonRef.current) {
        gsap.to(startButtonRef.current, {
          y: '+=8',
          duration: 2.2,
          ease: 'power1.inOut',
          yoyo: true,
          repeat: -1,
          delay: 0.3,
        })
      }

      if (battleButtonRef.current) {
        gsap.to(battleButtonRef.current, {
          y: '+=8',
          duration: 2.2,
          ease: 'power1.inOut',
          yoyo: true,
          repeat: -1,
          delay: 0.6,
        })
      }

      // Progress bar animation
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => {
          const progress = self.progress
          setScrollProgress(progress)
          
          if (progressBarRef.current) {
            gsap.set(progressBarRef.current, {
              scaleX: progress,
            })
          }
        },
      })

      // Pikachu scroll animations
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => {
          const progress = self.progress
          
          // Pikachu moves horizontally and grows
          const horizontalMove = progress * window.innerWidth * 0.6 - window.innerWidth * 0.3
          const scale = 1 + progress * 1.5
          const verticalMove = progress * window.innerHeight * 0.8
          
          setPikachuPosition({
            x: horizontalMove,
            y: -verticalMove,
            scale: scale,
          })

          // Type transformation based on scroll
          let newType = pikachuType
          if (progress < 0.3) {
            newType = 'normal'
          } else if (progress < 0.7) {
            newType = 'electric'
          } else {
            newType = 'thunderbolt'
          }

          // Play thunder sound when transitioning TO thunderbolt
          if (newType === 'thunderbolt' && previousTypeRef.current !== 'thunderbolt') {
            playThunderSound()
          }

          if (newType !== pikachuType) {
            setPikachuType(newType)
            previousTypeRef.current = newType
          }

          // Pikachu position is controlled via state (pikachuPosition), not GSAP
        },
      })

      // Journey cards animations
      cardRefs.current.forEach((cardRef, index) => {
        if (cardRef) {
          gsap.fromTo(
            cardRef,
            {
              opacity: 0,
              y: 100,
              scale: 0.8,
              rotationY: -45,
            },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              rotationY: 0,
              duration: 1,
              ease: 'back.out(1.7)',
              scrollTrigger: {
                trigger: cardRef,
                start: 'top 85%',
                toggleActions: 'play none none none',
              },
              delay: index * 0.15,
            }
          )

          // Hover effect
          cardRef.addEventListener('mouseenter', () => {
            gsap.to(cardRef, {
              scale: 1.05,
              y: -10,
              duration: 0.3,
              ease: 'power2.out',
            })
          })

          cardRef.addEventListener('mouseleave', () => {
            gsap.to(cardRef, {
              scale: 1,
              y: 0,
              duration: 0.3,
              ease: 'power2.out',
            })
          })
        }
      })

      // Progress line animation
      ScrollTrigger.create({
        trigger: journeySectionRef.current,
        start: 'top center',
        end: 'bottom center',
        scrub: true,
        onUpdate: (self) => {
          if (progressLineRef.current) {
            const progress = self.progress
            gsap.set(progressLineRef.current, {
              scaleY: progress,
            })
          }
        },
      })

      // Parallax effects
      ScrollTrigger.create({
        trigger: heroRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        onUpdate: (self) => {
          if (titleRef.current) {
            gsap.set(titleRef.current, {
              y: self.progress * -100,
              opacity: 1 - self.progress * 0.8,
            })
          }
          if (subtitleRef.current) {
            gsap.set(subtitleRef.current, {
              y: self.progress * -50,
              opacity: 1 - self.progress * 0.6,
            })
          }
        },
      })
    }, containerRef)

    return () => ctx.revert()
  }, [pikachuType, playThunderSound, isMobile])

  // Modal animation
  useEffect(() => {
    if (selectedPokemon && modalRef.current) {
      const modal = modalRef.current.querySelector('.modal-content')
      if (modal) {
        gsap.fromTo(
          modal,
          { scale: 0.5, opacity: 0, rotationY: -180 },
          { scale: 1, opacity: 1, rotationY: 0, duration: 0.6, ease: 'back.out(2)' }
        )
      }
    }
  }, [selectedPokemon])

  const handleEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
    playClickSound()
    if (onEnterMuseum) {
      if (buttonRef.current) {
        gsap.to(buttonRef.current, {
          scale: 0.95,
          duration: 0.1,
          yoyo: true,
          repeat: 1,
        })
      }
      
      if (containerRef.current) {
        gsap.to(containerRef.current, {
          opacity: 0,
          scale: 0.95,
          duration: 0.5,
          ease: 'power2.in',
          onComplete: () => {
            setTimeout(() => {
              if (onEnterMuseum) onEnterMuseum()
            }, 100)
          },
        })
      } else {
        setTimeout(() => {
          if (onEnterMuseum) onEnterMuseum()
        }, 100)
      }
    }
  }

  const handleStartGame = (e) => {
    e.preventDefault()
    e.stopPropagation()
    playClickSound()
    if (onStartGame) {
      if (startButtonRef.current) {
        gsap.to(startButtonRef.current, {
          scale: 0.95,
          duration: 0.1,
          yoyo: true,
          repeat: 1,
        })
      }
      
      if (containerRef.current) {
        gsap.to(containerRef.current, {
          opacity: 0,
          scale: 0.95,
          duration: 0.5,
          ease: 'power2.in',
          onComplete: () => {
            setTimeout(() => {
              if (onStartGame) onStartGame()
            }, 100)
          },
        })
      } else {
        setTimeout(() => {
          if (onStartGame) onStartGame()
        }, 100)
      }
    }
  }

  const handleBattle = (e) => {
    e.preventDefault()
    e.stopPropagation()
    playClickSound()
    if (onBattle) {
      if (battleButtonRef.current) {
        gsap.to(battleButtonRef.current, {
          scale: 0.95,
          duration: 0.1,
          yoyo: true,
          repeat: 1,
        })
      }
      
      if (containerRef.current) {
        gsap.to(containerRef.current, {
          opacity: 0,
          scale: 0.95,
          duration: 0.5,
          ease: 'power2.in',
          onComplete: () => {
            setTimeout(() => {
              if (onBattle) onBattle()
            }, 100)
          },
        })
      } else {
        setTimeout(() => {
          if (onBattle) onBattle()
        }, 100)
      }
    }
  }

  const handlePokemonComparison = (e) => {
    e?.preventDefault()
    e?.stopPropagation()
    playClickSound()
    if (onPokemonComparison) {
      if (startButtonRef.current) {
        gsap.to(startButtonRef.current, {
          scale: 0.95,
          duration: 0.1,
          yoyo: true,
          repeat: 1,
        })
      }
      
      if (containerRef.current) {
        gsap.to(containerRef.current, {
          opacity: 0,
          scale: 0.95,
          duration: 0.5,
          ease: 'power2.in',
          onComplete: () => {
            setTimeout(() => {
              if (onPokemonComparison) onPokemonComparison()
            }, 100)
          },
        })
      } else {
        setTimeout(() => {
          if (onPokemonComparison) onPokemonComparison()
        }, 100)
      }
    }
  }

  return (
    <div ref={containerRef} className="relative w-full overflow-x-hidden">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-black/50 z-50 backdrop-blur-sm">
        <div
          ref={progressBarRef}
          className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 origin-left"
          style={{ transform: 'scaleX(0)' }}
        />
      </div>

      {/* Floating Particles Background */}
      <div
        ref={particleContainerRef}
        className="fixed inset-0 pointer-events-none z-0"
        style={{ overflow: 'hidden' }}
      />

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative h-screen w-full overflow-hidden flex items-center justify-center"
      >
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/40 via-purple-950/40 via-pink-950/40 to-black">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
          {/* Grid pattern overlay */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `
                linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
            }}
          />
        </div>

        {/* 3D Scene with Pikachu and Pokeball */}
        <div className="absolute inset-0 z-0">
          <Canvas>
            <PerspectiveCamera makeDefault position={[0, 0, 6]} fov={50} />
            <SceneManager enableFog={true}>
              <ambientLight intensity={0.4} />
              <directionalLight position={[5, 5, 5]} intensity={1.2} />
              <pointLight position={[-5, -5, -5]} intensity={0.6} color="#8b5cf6" />
              <pointLight position={[5, -5, 5]} intensity={0.6} color="#3b82f6" />
              <Pikachu3D
                position={[pikachuPosition.x * 0.005, -pikachuPosition.y * 0.005, 0]}
                scale={Math.max(isMobile ? 0.3 : 0.5, pikachuPosition.scale * (isMobile ? 0.2 : 0.3))}
                type={pikachuType}
                scrollProgress={scrollProgress}
              />
              <Pokeball3D />
              <CameraController
                targetPosition={[0, 0, 6]}
                targetLookAt={[0, 0, 0]}
                enableMouseParallax={true}
                parallaxStrength={0.3}
              />
              <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
              <Suspense fallback={null}>
                <Environment preset="sunset" />
              </Suspense>
            </SceneManager>
          </Canvas>
        </div>

        {/* Content Overlay */}
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto pointer-events-none">
          <h1
            ref={titleRef}
            className={`${isMobile ? 'text-5xl' : 'text-8xl md:text-[12rem]'} font-black ${isMobile ? 'mb-4' : 'mb-8'} bg-gradient-to-r from-blue-400 via-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-[shimmer_3s_ease-in-out_infinite]`}
            style={{
              textShadow: isMobile ? '0 0 40px rgba(139, 92, 246, 0.5)' : '0 0 80px rgba(139, 92, 246, 0.5)',
              letterSpacing: '-0.05em',
              fontFamily: "'Bebas Neue', sans-serif",
            }}
          >
            POKÉMON
          </h1>
   
          <p
            ref={subtitleRef}
            className={`${isMobile ? 'text-base' : 'text-xl md:text-2xl'} text-gray-300 ${isMobile ? 'mb-6' : 'mb-12'} max-w-2xl mx-auto leading-relaxed px-2`}
          >
            <span className="text-purple-400">Experience generations, legends, and evolution.</span>
          </p>
        
          {/* Action Buttons */}
          <div className={`flex ${isMobile ? 'flex-col gap-3' : 'flex-col md:flex-row gap-4'} justify-center items-center ${isMobile ? 'mb-4' : 'mb-6'} pointer-events-auto`}>
            <button
              ref={startButtonRef}
              onClick={handleStartGame}
              type="button"
              className={`group relative ${isMobile ? 'px-5 py-2.5 text-sm' : 'px-8 py-3 text-base'} bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 rounded-full text-white font-bold hover:scale-105 active:scale-95 transition-all duration-300 shadow-xl hover:shadow-emerald-500/50 overflow-hidden backdrop-blur-sm border border-emerald-400/30 ${isMobile ? 'w-full max-w-[280px]' : 'min-w-[180px]'}`}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Start Game
                <svg
                  className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} group-hover:translate-x-1 transition-transform pointer-events-none`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-teal-500 via-green-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </button>

            <button
              ref={battleButtonRef}
              onClick={handleBattle}
              type="button"
              className={`group relative ${isMobile ? 'px-5 py-2.5 text-sm' : 'px-8 py-3 text-base'} bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 rounded-full text-white font-bold hover:scale-105 active:scale-95 transition-all duration-300 shadow-xl hover:shadow-red-500/50 overflow-hidden backdrop-blur-sm border border-red-400/30 ${isMobile ? 'w-full max-w-[280px]' : 'min-w-[180px]'}`}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Battle
                <svg
                  className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} group-hover:rotate-90 transition-transform pointer-events-none`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </button>

            <button
              ref={startButtonRef}
              onClick={handlePokemonComparison}
              type="button"
              className={`group relative ${isMobile ? 'px-5 py-2.5 text-sm' : 'px-8 py-3 text-base'} bg-gradient-to-r from-blue-600 via-purple-600 via-pink-500 to-red-500 rounded-full text-white font-bold hover:scale-105 active:scale-95 transition-all duration-300 shadow-2xl hover:shadow-purple-500/60 overflow-hidden backdrop-blur-sm border-2 border-purple-400/60 ${isMobile ? 'w-full max-w-[280px]' : 'min-w-[200px]'}`}
            >
              <span className="relative z-10 flex items-center justify-center gap-2 drop-shadow-lg">
                POKEMON
                <svg
                  className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} group-hover:translate-x-1 transition-transform pointer-events-none`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-pink-500 via-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              {/* Animated shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
            </button>

          
          </div>

          <button
            ref={buttonRef}
            onClick={handleEnter}
            type="button"
            className={`group relative ${isMobile ? 'px-6 py-3 text-sm' : 'px-10 py-4 text-lg'} bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full text-white font-bold hover:scale-105 active:scale-95 transition-all duration-300 shadow-xl hover:shadow-purple-500/50 overflow-hidden backdrop-blur-sm border border-purple-400/30 ${isMobile ? 'w-full max-w-[280px]' : 'min-w-[200px]'} pointer-events-auto`}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              Enter Museum
              <svg
                className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} group-hover:translate-x-1 transition-transform pointer-events-none`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </button>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10">
          <div className="w-6 h-10 border-2 border-purple-400/50 rounded-full flex justify-center backdrop-blur-sm bg-black/20">
            <div className="w-1.5 h-4 bg-purple-400 rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </section>

      {/* Journey Section */}
      <section
        ref={journeySectionRef}
        className="relative min-h-screen py-20 px-4 bg-gradient-to-b from-black via-purple-900/20 to-black overflow-hidden"
      >
        {/* 3D Scene with Pikachu for Journey Section */}
        <div className="absolute inset-0 z-0">
          <Canvas>
            <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={50} />
            <SceneManager enableFog={true}>
              <ambientLight intensity={0.5} />
              <directionalLight position={[5, 5, 5]} intensity={1.5} />
              <pointLight position={[-5, -5, -5]} intensity={0.8} color="#8b5cf6" />
              <pointLight position={[5, -5, 5]} intensity={0.8} color="#3b82f6" />
              <Pikachu3D
                position={[0, 0, 0]}
                scale={1.2}
                type={pikachuType}
                scrollProgress={scrollProgress}
              />
              <CameraController
                targetPosition={[0, 0, 8]}
                targetLookAt={[0, 0, 0]}
                enableMouseParallax={true}
                parallaxStrength={0.2}
              />
              <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.3} />
              <Suspense fallback={null}>
                <Environment preset="sunset" />
              </Suspense>
            </SceneManager>
          </Canvas>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <h2 className={`${isMobile ? 'text-4xl' : 'text-6xl md:text-8xl'} font-black text-center mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent ${isMobile ? 'mb-4' : 'mb-8'} px-4`} style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            PIKACHU'S JOURNEY
          </h2>
          <p className={`text-center text-gray-400 ${isMobile ? 'mb-8 text-base' : 'mb-16 text-xl'} max-w-2xl mx-auto px-4`}>
            Scroll to follow Pikachu's transformation from normal to thunderbolt type
          </p>

          {/* Progress Line */}
          <div className="relative hidden md:block">
            <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500/30 to-pink-500/30 transform -translate-x-1/2">
              <div
                ref={progressLineRef}
                className="absolute top-0 left-0 w-full bg-gradient-to-b from-purple-500 to-pink-500 origin-top"
                style={{ transform: 'scaleY(0)' }}
              />
            </div>
          </div>

          {/* Journey Cards Grid */}
          <div className={`grid grid-cols-1 ${isMobile ? 'gap-4' : 'md:grid-cols-2 lg:grid-cols-3 gap-8'} relative z-10 px-4`}>
            {journeyCards.map((card, index) => (
              <div
                key={card.id}
                ref={(el) => (cardRefs.current[index] = el)}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  playClickSound()
                  if (onCardClick) {
                    onCardClick(card.id)
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    e.stopPropagation()
                    playClickSound()
                    if (onCardClick) {
                      onCardClick(card.id)
                    }
                  }
                }}
                role="button"
                tabIndex={0}
                className={`group relative ${isMobile ? 'p-4' : 'p-8'} rounded-3xl backdrop-blur-md bg-gradient-to-br ${card.gradient} border-2 ${card.borderColor} transition-all duration-500 hover:shadow-2xl cursor-pointer active:scale-95 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-black`}
                style={{
                  transformStyle: 'preserve-3d',
                }}
              >
                {/* Glass-morphism effect */}
                <div className="absolute inset-0 bg-white/5 rounded-3xl backdrop-blur-sm" />
                
                {/* Gradient border glow on hover */}
                <div className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${card.color} opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl`} />
                
                {/* Content */}
                <div className="relative z-10">
                  <div className={`${isMobile ? 'text-4xl mb-2' : 'text-6xl mb-4'} transform group-hover:scale-110 transition-transform duration-300`}>
                    {card.icon}
                  </div>
                  <h3 className={`${isMobile ? 'text-xl' : 'text-3xl'} font-bold ${isMobile ? 'mb-2' : 'mb-4'} bg-gradient-to-r ${card.color} bg-clip-text text-transparent`}>
                    {card.title}
                  </h3>
                  <p className={`text-gray-300 ${isMobile ? 'text-sm' : ''} leading-relaxed`}>
                    {card.description}
                  </p>
                </div>

                {/* Card number badge */}
                <div className={`absolute ${isMobile ? '-top-2 -right-2 w-8 h-8 text-sm' : '-top-4 -right-4 w-12 h-12 text-lg'} rounded-full bg-gradient-to-r ${card.color} flex items-center justify-center text-white font-bold shadow-lg`}>
                  {card.id}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Legendary Pokémon */}
      <section className="relative min-h-screen py-20 px-4 bg-gradient-to-b from-black via-purple-900/20 to-black overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <h2 className={`${isMobile ? 'text-4xl' : 'text-6xl md:text-8xl'} font-black text-center mb-4 bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 bg-clip-text text-transparent ${isMobile ? 'mb-4' : 'mb-8'} px-4`} style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            LEGENDARY POKÉMON
          </h2>
          <p className={`text-center text-gray-400 ${isMobile ? 'mb-8 text-base' : 'mb-16 text-xl'} max-w-2xl mx-auto px-4`}>
            Discover the most powerful and legendary Pokémon from across the regions
          </p>

          {/* Legendary Pokémon Grid with Images */}
          <div className={`grid ${isMobile ? 'grid-cols-2 gap-4' : 'grid-cols-3 lg:grid-cols-4 gap-6'} px-4`}>
            {[
              { name: 'Mewtwo', id: 150, color: '#8b5cf6', type: 'psychic' },
              { name: 'Lugia', id: 249, color: '#3b82f6', type: 'psychic' },
              { name: 'Ho-Oh', id: 250, color: '#ef4444', type: 'fire' },
              { name: 'Rayquaza', id: 384, color: '#10b981', type: 'dragon' },
              { name: 'Dialga', id: 483, color: '#6366f1', type: 'steel' },
              { name: 'Palkia', id: 484, color: '#a855f7', type: 'water' },
              { name: 'Giratina', id: 487, color: '#1e293b', type: 'ghost' },
              { name: 'Kyogre', id: 382, color: '#0ea5e9', type: 'water' },
              { name: 'Groudon', id: 383, color: '#dc2626', type: 'ground' },
              { name: 'Zacian', id: 888, color: '#3b82f6', type: 'fairy' },
              { name: 'Zamazenta', id: 889, color: '#ef4444', type: 'fighting' },
            ].map((pokemon, index) => (
              <div
                key={pokemon.name}
                className="relative group cursor-pointer"
                onClick={() => {
                  playClickSound()
                  setSelectedPokemon(pokemon)
                }}
              >
                <div className="relative h-64 rounded-2xl overflow-hidden backdrop-blur-md bg-gradient-to-br from-black/40 to-black/60 border-2 border-purple-500/30 hover:border-purple-400/60 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/30 active:scale-95">
                  {/* Pokémon Image */}
                  <div className="relative w-full h-full flex items-center justify-center p-4">
                    <img
                      src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`}
                      alt={pokemon.name}
                      className="w-full h-full object-contain drop-shadow-2xl transition-transform duration-300 group-hover:scale-110"
                      onError={(e) => {
                        if (e.target.src.includes('official-artwork')) {
                          e.target.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`
                        } else if (e.target.src.includes('sprites/pokemon/') && !e.target.src.includes('dream-world')) {
                          e.target.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/${pokemon.id}.svg`
                        }
                      }}
                    />
                    
                    {/* Image glow effect */}
                    <div 
                      className="absolute inset-0 rounded-full blur-2xl opacity-30 transition-opacity duration-300 group-hover:opacity-50 pointer-events-none"
                      style={{ backgroundColor: pokemon.color }}
                    />
                  </div>
                  
                  {/* Pokémon Name Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/70 to-transparent">
                    <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-white text-center`}>
                      {pokemon.name}
                    </h3>
                    <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-400 text-center capitalize mt-1`}>
                      {pokemon.type}
                    </p>
                  </div>

                  {/* Glow effect on hover */}
                  <div 
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{
                      background: `radial-gradient(circle at center, ${pokemon.color}20, transparent 70%)`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modal for 3D Pokémon View */}
      {selectedPokemon && (
        <div
          ref={modalRef}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={(e) => {
            if (e.target === modalRef.current) {
              playClickSound()
              setSelectedPokemon(null)
            }
          }}
        >
          <div 
            className="modal-content relative w-full max-w-4xl h-[90vh] rounded-3xl overflow-hidden bg-gradient-to-br from-black/90 via-purple-900/30 to-black/90 border-2 border-purple-500/50 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => {
                playClickSound()
                setSelectedPokemon(null)
              }}
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-red-500/80 border-2 border-white/30 flex items-center justify-center text-white font-bold text-xl transition-all duration-300 hover:scale-110 active:scale-95"
            >
              ×
            </button>

            {/* 3D Canvas */}
            <div className="absolute inset-0 z-0">
              <Canvas gl={{ antialias: true, alpha: true }}>
                <Suspense fallback={null}>
                  <PerspectiveCamera makeDefault position={[0, 0, 6]} fov={50} />
                  <ambientLight intensity={0.6} />
                  <directionalLight position={[5, 5, 5]} intensity={1.2} />
                  <pointLight position={[-5, -5, -5]} intensity={0.8} color={selectedPokemon.color} />
                  <pointLight position={[5, -5, 5]} intensity={0.8} color={selectedPokemon.color} />
                  <Pokemon3D
                    name={selectedPokemon.name}
                    position={[0, 0, 0]}
                    scale={1.5}
                    variant="normal"
                  />
                  <CameraController
                    targetPosition={[0, 0, 6]}
                    targetLookAt={[0, 0, 0]}
                    enableMouseParallax={true}
                    parallaxStrength={0.3}
                  />
                  <OrbitControls enableZoom={true} enablePan={false} autoRotate autoRotateSpeed={0.5} />
                </Suspense>
              </Canvas>
            </div>

            {/* Pokémon Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 z-10 p-6 bg-gradient-to-t from-black/95 via-black/80 to-transparent">
              <div className="text-center">
                <h3 className={`${isMobile ? 'text-4xl' : 'text-5xl md:text-6xl'} font-black mb-2 bg-gradient-to-r ${selectedPokemon.color.includes('#8b5cf6') ? 'from-purple-400 to-pink-400' : selectedPokemon.color.includes('#3b82f6') ? 'from-blue-400 to-cyan-400' : selectedPokemon.color.includes('#ef4444') ? 'from-red-400 to-orange-400' : selectedPokemon.color.includes('#10b981') ? 'from-green-400 to-emerald-400' : 'from-amber-400 to-yellow-400'} bg-clip-text text-transparent`} style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                  {selectedPokemon.name}
                </h3>
                <p className={`${isMobile ? 'text-base' : 'text-xl'} text-gray-300 capitalize mb-2`}>
                  {selectedPokemon.type} Type
                </p>
                <p className={`${isMobile ? 'text-sm' : 'text-base'} text-gray-400`}>
                  Legendary Pokémon #{selectedPokemon.id}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Add CSS for floating animation */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          25% {
            transform: translateY(-20px) translateX(10px);
          }
          50% {
            transform: translateY(-40px) translateX(-10px);
          }
          75% {
            transform: translateY(-20px) translateX(5px);
          }
        }
        @keyframes shimmer {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </div>
  )
}

export default MuseumLobby
