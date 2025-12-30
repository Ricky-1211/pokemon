import { useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerspectiveCamera, Environment } from '@react-three/drei'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SceneManager from '../../three/SceneManager'
import CameraController from '../../three/CameraController'
import useSound from '../../hooks/useSound'

gsap.registerPlugin(ScrollTrigger)

const LegendaryVault = ({ legendaryPokemon = [], onPokemonSelect }) => {
  const sectionRef = useRef(null)
  const titleRef = useRef(null)
  const vaultRef = useRef(null)
  const gridRef = useRef(null)
  const { playScrollBass } = useSound()
  const [visibleCount, setVisibleCount] = useState(9) // Initial visible Pokémon
  const [imageErrors, setImageErrors] = useState(new Set()) // Track failed image loads

  // Legendary Pokémon IDs (100 legendary and mythical Pokémon)
  const legendaryIds = [
    // Kanto
    144, 145, 146, 150, 151, // Articuno, Zapdos, Moltres, Mewtwo, Mew
    
    // Johto
    243, 244, 245, 249, 250, 251, // Raikou, Entei, Suicune, Lugia, Ho-Oh, Celebi
    
    // Hoenn
    377, 378, 379, 380, 381, 382, 383, 384, 385, // Regirock, Regice, Registeel, Latias, Latios, Kyogre, Groudon, Rayquaza, Jirachi
    386, // Deoxys
    
    // Sinnoh
    480, 481, 482, 483, 484, 485, 486, 487, 488, 489, 490, 491, 492, 493,
    // Uxie, Mesprit, Azelf, Dialga, Palkia, Heatran, Regigigas, Giratina, Cresselia, Phione, Manaphy, Darkrai, Shaymin, Arceus
    
    // Unova
    494, 638, 639, 640, 641, 642, 643, 644, 645, 646, 647, 648, 649,
    // Victini, Cobalion, Terrakion, Virizion, Tornadus, Thundurus, Reshiram, Zekrom, Landorus, Kyurem, Keldeo, Meloetta, Genesect
    
    // Kalos
    716, 717, 718, 719, 720, 721,
    // Xerneas, Yveltal, Zygarde, Diancie, Hoopa, Volcanion
    
    // Alola
    785, 786, 787, 788, 789, 790, 791, 792, 793, 794, 795, 796, 797, 798, 799, 800, 801, 802,
    // Tapu Koko, Tapu Lele, Tapu Bulu, Tapu Fini, Cosmog, Cosmoem, Solgaleo, Lunala, Nihilego, Buzzwole, Pheromosa, Xurkitree, Celesteela, Kartana, Guzzlord, Necrozma, Magearna, Marshadow
    
    // Galar
    888, 889, 890, 891, 892, 893, 894, 895, 896, 897, 898,
    // Zacian, Zamazenta, Eternatus, Kubfu, Urshifu, Zarude, Regieleki, Regidrago, Glastrier, Spectrier, Calyrex
    
    // Hisui
    1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008,
    // (Alternative forms of existing legendaries)
    
    // Paldea
    1009, 1010, 1011, 1012, 1013, 1014, 1015, 1016, 1017,
    // Koraidon, Miraidon, Wo-Chien, Chien-Pao, Ting-Lu, Chi-Yu, Roaring Moon, Iron Valiant, etc.
    
    // Additional Mythicals
    151, 251, 385, 386, 489, 490, 492, 493, 494, 648, 649, 719, 720, 721, 801, 802,
    // Duplicates for emphasis on mythicals
  ].slice(0, 100) // Ensure exactly 100 IDs

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Dramatic title reveal
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, scale: 0.5, rotation: -180 },
        {
          opacity: 1,
          scale: 1,
          rotation: 0,
          duration: 1.5,
          ease: 'back.out(2)',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            onEnter: () => playScrollBass(),
          },
        }
      )

      // Vault entrance animation
      if (vaultRef.current) {
        gsap.fromTo(
          vaultRef.current,
          { y: 100, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 70%',
            },
          }
        )
      }

      // Grid stagger animation
      if (gridRef.current) {
        const cards = gridRef.current.querySelectorAll('.pokemon-card')
        gsap.fromTo(
          cards,
          { 
            y: 50,
            opacity: 0,
            scale: 0.8
          },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.6,
            stagger: {
              each: 0.05,
              from: 'center',
              grid: [5, 6],
              ease: 'back.out(1.2)'
            },
            scrollTrigger: {
              trigger: gridRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [playScrollBass, legendaryPokemon])

  const loadMorePokemon = () => {
    setVisibleCount(prev => Math.min(prev + 12, legendaryPokemon.length))
  }

  const showAllPokemon = () => {
    setVisibleCount(legendaryPokemon.length)
  }

  const displayedPokemon = legendaryPokemon.slice(0, visibleCount)

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen w-full py-20 px-4 overflow-hidden"
    >
      {/* Enhanced Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-950/80 via-black to-yellow-950/60">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,215,0,0.25),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.3),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,20,147,0.15),transparent_60%)]" />
        
        {/* Animated grid pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="h-full w-full bg-[linear-gradient(to_right,rgba(255,215,0,0.2)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,215,0,0.2)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        </div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-[2px] h-[2px] bg-yellow-400 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto">
        <h2
          ref={titleRef}
          className="text-6xl md:text-8xl lg:text-9xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-purple-400 to-pink-400 text-center tracking-tighter"
          style={{ textShadow: '0 0 80px rgba(255,215,0,0.7)' }}
        >
          LEGENDARY VAULT
        </h2>
        <p className="text-xl md:text-2xl text-center text-gray-300 mb-12 max-w-4xl mx-auto px-4">
          <span className="text-yellow-400 font-bold">{legendaryPokemon.length}</span> legendary and mythical Pokémon, 
          preserved in their eternal chambers of power and mystery.
        </p>

        {/* 3D Vault Scene */}
        <div
          ref={vaultRef}
          className="h-[600px] md:h-[700px] w-full mb-16 rounded-3xl overflow-hidden bg-black/60 backdrop-blur-md border-2 border-yellow-500/40 shadow-2xl shadow-yellow-500/30"
        >
          <Canvas>
            <PerspectiveCamera makeDefault position={[0, 3, 12]} fov={45} />
            <SceneManager enableFog={true} fogColor="#000000" fogNear={5} fogFar={20}>
              <ambientLight intensity={0.4} />
              <directionalLight 
                position={[10, 10, 5]} 
                intensity={1.8} 
                color="#FFD700"
                castShadow
              />
              <pointLight position={[-8, 5, -8]} intensity={1.2} color="#8b5cf6" />
              <pointLight position={[0, 2, 8]} intensity={0.8} color="#FFD700" />
              <CameraController
                targetPosition={[0, 3, 12]}
                enableMouseParallax={true}
                parallaxStrength={0.7}
              />
              <Environment preset="night" />
              {/* Could add rotating legendary models here */}
            </SceneManager>
          </Canvas>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-gradient-to-br from-yellow-900/40 to-yellow-600/20 rounded-2xl p-6 text-center border border-yellow-500/30">
            <div className="text-3xl font-bold text-yellow-400">{legendaryPokemon.length}</div>
            <div className="text-sm text-gray-300">Total Legendaries</div>
          </div>
          <div className="bg-gradient-to-br from-purple-900/40 to-purple-600/20 rounded-2xl p-6 text-center border border-purple-500/30">
            <div className="text-3xl font-bold text-purple-400">100</div>
            <div className="text-sm text-gray-300">Available Slots</div>
          </div>
          <div className="bg-gradient-to-br from-pink-900/40 to-pink-600/20 rounded-2xl p-6 text-center border border-pink-500/30">
            <div className="text-3xl font-bold text-pink-400">8</div>
            <div className="text-sm text-gray-300">Generations</div>
          </div>
          <div className="bg-gradient-to-br from-blue-900/40 to-blue-600/20 rounded-2xl p-6 text-center border border-blue-500/30">
            <div className="text-3xl font-bold text-blue-400">24</div>
            <div className="text-sm text-gray-300">Mythical</div>
          </div>
        </div>

        {/* Legendary Grid */}
        <div ref={gridRef} className="relative">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-12">
            {displayedPokemon.length > 0 ? (
              displayedPokemon.map((pokemon, index) => (
                <div
                  key={pokemon.id}
                  className="pokemon-card group relative aspect-square bg-gradient-to-br from-yellow-900/50 via-purple-900/50 to-pink-900/50 rounded-2xl overflow-hidden cursor-pointer border-2 border-yellow-500/40 hover:border-yellow-300 hover:shadow-2xl hover:shadow-yellow-500/60 transition-all duration-500 hover:scale-[1.05] hover:z-10"
                  onClick={() => onPokemonSelect?.(pokemon)}
                >
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  
                  {/* Background glow */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                  
                  {/* Rarity badge */}
                  <div className="absolute top-3 right-3 z-20">
                    <div className={`text-xs px-2 py-1 rounded-full font-bold ${
                      pokemon.id <= 151 ? 'bg-red-500/30 text-red-300' :
                      pokemon.id <= 251 ? 'bg-green-500/30 text-green-300' :
                      pokemon.id <= 386 ? 'bg-blue-500/30 text-blue-300' :
                      'bg-purple-500/30 text-purple-300'
                    }`}>
                      Gen {Math.ceil(pokemon.id / 151)}
                    </div>
                  </div>

                  <div className="relative z-10 p-4 h-full flex flex-col items-center justify-center">
                    {/* Legendary symbol */}
                    <div className="text-2xl mb-1 opacity-80">⚡</div>
                    
                    {/* Pokémon ID */}
                    <span className="text-xs text-gray-400 mb-1 font-mono">
                      #{String(pokemon.id).padStart(4, '0')}
                    </span>
                    
                    {/* Pokémon Image */}
                    <div className="relative w-full h-28 flex items-center justify-center mb-2">
                      {!imageErrors.has(pokemon.id) ? (
                        <img
                          src={pokemon.image || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`}
                          alt={pokemon.name}
                          className="w-full h-full object-contain filter drop-shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3"
                          onError={(e) => {
                            // Prevent error from showing in console
                            e.preventDefault?.()
                            
                            // Try fallback sources silently
                            if (e.target.src.includes('official-artwork')) {
                              e.target.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`
                            } else if (e.target.src.includes('sprites/pokemon/') && !e.target.src.includes('dream-world')) {
                              e.target.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/${pokemon.id}.svg`
                            } else if (e.target.src.includes('dream-world')) {
                              e.target.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${pokemon.id}.png`
                            } else {
                              // All fallbacks failed, hide image and show placeholder
                              setImageErrors(prev => new Set(prev).add(pokemon.id))
                              e.target.style.display = 'none'
                            }
                          }}
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-yellow-900/30 to-purple-900/30 rounded-lg">
                          <span className="text-4xl opacity-50">⚡</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Pokémon Name */}
                    <h3 className="text-lg font-black text-center text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-purple-300 group-hover:scale-105 transition-transform capitalize">
                      {pokemon.name}
                    </h3>
                    
                    {/* Type indicator */}
                    <div className="mt-2 flex gap-1 opacity-70">
                      {pokemon.types?.slice(0, 2).map(type => (
                        <span key={type} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800/50">
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center text-gray-400 py-20">
                <div className="text-4xl mb-4">✨</div>
                <div>Loading legendary Pokémon...</div>
                <div className="text-sm mt-2 text-gray-500">Preparing 100 legendary beings</div>
              </div>
            )}
          </div>

          {/* Load More / View All Controls */}
          {legendaryPokemon.length > 0 && visibleCount < legendaryPokemon.length && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button
                onClick={loadMorePokemon}
                className="px-8 py-3 bg-gradient-to-r from-yellow-600 to-purple-600 rounded-full font-bold text-white hover:from-yellow-500 hover:to-purple-500 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-yellow-500/30"
              >
                Load More ({legendaryPokemon.length - visibleCount} remaining)
              </button>
              
              <button
                onClick={showAllPokemon}
                className="px-8 py-3 bg-gradient-to-r from-purple-700/50 to-pink-700/50 rounded-full font-bold text-gray-300 border border-purple-500/30 hover:border-purple-400 hover:text-white transition-all duration-300 hover:scale-105"
              >
                Show All {legendaryPokemon.length} Pokémon
              </button>
            </div>
          )}

          {/* Counter */}
          <div className="text-center text-gray-400 text-sm mb-8">
            Showing {Math.min(visibleCount, legendaryPokemon.length)} of {legendaryPokemon.length} legendary Pokémon
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center text-gray-500 text-sm mt-16 pt-8 border-t border-gray-800/50">
          <p>Legendary Pokémon are rare, powerful creatures that often play key roles in the Pokémon world's mythology.</p>
          <p className="mt-2">Each one represents a unique aspect of nature, time, space, or reality itself.</p>
        </div>
      </div>
    </section>
  )
}

export default LegendaryVault