import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { getTypeColor } from '../utils/pokeapi'

const PokemonDetails = ({ pokemon, onClose }) => {
  const modalRef = useRef(null)
  const overlayRef = useRef(null)
  const contentRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Fade in overlay
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3 }
      )

      // Slide up modal
      gsap.fromTo(
        modalRef.current,
        { y: 100, opacity: 0, scale: 0.9 },
        { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.7)' }
      )

      // Animate content
      gsap.fromTo(
        contentRef.current?.children,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          delay: 0.2,
          ease: 'power2.out',
        }
      )

      // Animate stats
      const statBars = contentRef.current?.querySelectorAll('.stat-bar')
      if (statBars) {
        gsap.fromTo(
          statBars,
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 1,
            stagger: 0.05,
            delay: 0.5,
            ease: 'power2.out',
          }
        )
      }
    })

    // Close on Escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }
    window.addEventListener('keydown', handleEscape)

    return () => {
      ctx.revert()
      window.removeEventListener('keydown', handleEscape)
    }
  }, [])

  const handleClose = () => {
    const ctx = gsap.context(() => {
      gsap.to(modalRef.current, {
        y: 100,
        opacity: 0,
        scale: 0.9,
        duration: 0.3,
        onComplete: onClose,
      })
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.3 })
    })
  }

  const primaryType = pokemon.types?.[0] || 'normal'
  const typeColor = getTypeColor(primaryType)

  const statNames = {
    hp: 'HP',
    attack: 'Attack',
    defense: 'Defense',
    'special-attack': 'Sp. Atk',
    'special-defense': 'Sp. Def',
    speed: 'Speed',
  }

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="fixed inset-4 md:inset-10 lg:inset-20 z-50 overflow-y-auto"
      >
        <div
          className="relative bg-gradient-to-br from-gray-900 to-black rounded-3xl p-6 md:p-8 lg:p-12 max-w-4xl mx-auto border-2"
          style={{ borderColor: typeColor }}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-white text-xl transition-colors"
          >
            ×
          </button>

          <div ref={contentRef} className="grid md:grid-cols-2 gap-8">
            {/* Left: Image */}
            <div className="flex flex-col items-center">
              <div
                className="w-full aspect-square rounded-2xl p-8 flex items-center justify-center mb-4"
                style={{
                  background: `linear-gradient(135deg, ${typeColor}20 0%, ${typeColor}05 100%)`,
                }}
              >
                <img
                  src={pokemon.image || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`}
                  alt={pokemon.name}
                  className="w-full h-full object-contain filter drop-shadow-2xl"
                  onError={(e) => {
                    // Fallback chain: official artwork -> regular sprite -> placeholder
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

              <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold capitalize mb-2">
                  {pokemon.name}
                </h2>
                <p className="text-gray-400 mb-4">
                  #{String(pokemon.id).padStart(3, '0')}
                </p>
                <div className="flex gap-2 justify-center flex-wrap">
                  {pokemon.types?.map((type) => (
                    <span
                      key={type}
                      className="px-4 py-2 rounded-full text-sm font-semibold text-white"
                      style={{ backgroundColor: getTypeColor(type) }}
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Stats and Info */}
            <div className="space-y-6">
              {/* Stats */}
              <div>
                <h3 className="text-2xl font-bold mb-4">Base Stats</h3>
                <div className="space-y-3">
                  {pokemon.stats?.map((stat) => (
                    <div key={stat.name} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize font-medium">
                          {statNames[stat.name] || stat.name}
                        </span>
                        <span className="text-gray-400">{stat.value}</span>
                      </div>
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="stat-bar h-full rounded-full transition-all"
                          style={{
                            width: `${(stat.value / 255) * 100}%`,
                            backgroundColor: typeColor,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <p className="text-gray-400 text-sm mb-1">Height</p>
                  <p className="text-xl font-semibold">
                    {(pokemon.height / 10).toFixed(1)} m
                  </p>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <p className="text-gray-400 text-sm mb-1">Weight</p>
                  <p className="text-xl font-semibold">
                    {(pokemon.weight / 10).toFixed(1)} kg
                  </p>
                </div>
              </div>

              {/* Abilities */}
              {pokemon.abilities && pokemon.abilities.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold mb-3">Abilities</h3>
                  <div className="flex gap-2 flex-wrap">
                    {pokemon.abilities.map((ability, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-800 rounded-full text-sm capitalize"
                      >
                        {ability}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default PokemonDetails

