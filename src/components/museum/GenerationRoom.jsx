import { useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerspectiveCamera, Environment } from '@react-three/drei'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SceneManager from '../../three/SceneManager'
import CameraController from '../../three/CameraController'
import useSound from '../../hooks/useSound'

gsap.registerPlugin(ScrollTrigger)

const GenerationRoom = ({ generation, pokemonList = [], onPokemonSelect }) => {
  const sectionRef = useRef(null)
  const titleRef = useRef(null)
  const { playScrollBass } = useSound()

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation on enter
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, x: -100 },
        {
          opacity: 1,
          x: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            end: 'top 50%',
            scrub: false,
            onEnter: () => playScrollBass(),
          },
        }
      )

      // Camera animation on scroll
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        onUpdate: (self) => {
          // Camera path based on scroll
          const progress = self.progress
          const cameraZ = 5 + progress * 2
          const cameraY = progress * 1
          // Update camera via GSAP timeline would be handled in parent
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [playScrollBass])

  const genInfo = {
    1: { name: 'Generation I', start: 1, end: 151, color: 'from-red-500/20 to-blue-500/20' },
    2: { name: 'Generation II', start: 152, end: 251, color: 'from-yellow-500/20 to-cyan-500/20' },
    3: { name: 'Generation III', start: 252, end: 386, color: 'from-green-500/20 to-emerald-500/20' },
  }

  const info = genInfo[generation] || genInfo[1]
  const filteredPokemon = pokemonList.filter(
    (p) => p.id >= info.start && p.id <= info.end
  )

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen w-full py-20 px-4"
      data-generation={generation}
    >
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${info.color} to-black`} />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto">
        <h2
          ref={titleRef}
          className="text-6xl md:text-8xl font-black mb-8 text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-pink-200"
        >
          {info.name}
        </h2>
        <p className="text-xl text-gray-300 mb-12">
          Pokémon #{info.start} - #{info.end}
        </p>

        {/* 3D Scene */}
        <div className="h-[600px] w-full mb-12 rounded-2xl overflow-hidden bg-black/30 backdrop-blur-sm border border-white/10">
          <Canvas>
            <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={50} />
            <SceneManager>
              <ambientLight intensity={0.5} />
              <directionalLight position={[5, 5, 5]} intensity={1} />
              <CameraController
                targetPosition={[0, 0, 8]}
                enableMouseParallax={true}
                parallaxStrength={0.4}
              />
              <Environment preset="sunset" />
              {/* Pokémon models would go here */}
            </SceneManager>
          </Canvas>
        </div>

        {/* Pokémon Grid */}
        {filteredPokemon.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredPokemon.map((pokemon) => (
              <div
                key={pokemon.id}
                onClick={() => onPokemonSelect?.(pokemon)}
                className="group relative aspect-square bg-gradient-to-br from-purple-900/40 to-pink-900/40 rounded-xl overflow-hidden cursor-pointer border border-white/10 hover:border-purple-400/50 transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-purple-500/30"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="relative z-10 p-4 h-full flex flex-col items-center justify-center">
                  <span className="text-xs text-gray-400 mb-1">#{String(pokemon.id).padStart(3, '0')}</span>
                  
                  {/* Pokémon Image */}
                  <div className="relative w-full h-24 flex items-center justify-center mb-2">
                    <img
                      src={pokemon.image || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`}
                      alt={pokemon.name}
                      className="w-full h-full object-contain filter drop-shadow-lg transition-transform duration-300 group-hover:scale-110"
                      onError={(e) => {
                        // Fallback to regular sprite if official artwork fails
                        if (e.target.src.includes('official-artwork')) {
                          e.target.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`
                        } else if (e.target.src.includes('sprites/pokemon/')) {
                          e.target.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/${pokemon.id}.svg`
                        } else {
                          e.target.style.display = 'none'
                        }
                      }}
                    />
                  </div>
                  
                  <h3 className="text-sm font-bold text-center text-white group-hover:text-purple-300 transition-colors capitalize">
                    {pokemon.name}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="inline-block w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-xl text-gray-400">Loading {info.name} Pokémon...</p>
            <p className="text-sm text-gray-500 mt-2">Pokémon #{info.start} - #{info.end}</p>
          </div>
        )}
      </div>
    </section>
  )
}

export default GenerationRoom

