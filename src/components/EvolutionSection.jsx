import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { fetchPokemonDetails } from '../utils/pokeapi'
import { getTypeColor } from '../utils/pokeapi'

gsap.registerPlugin(ScrollTrigger)

const EvolutionSection = () => {
  const sectionRef = useRef(null)
  const titleRef = useRef(null)
  const [evolutionChain, setEvolutionChain] = useState([
    { id: 1, name: 'bulbasaur' },
    { id: 2, name: 'ivysaur' },
    { id: 3, name: 'venusaur' },
  ])
  const [evolutionData, setEvolutionData] = useState([])

  useEffect(() => {
    const loadEvolutionData = async () => {
      try {
        const data = await Promise.all(
          evolutionChain.map((pokemon) => fetchPokemonDetails(pokemon.id))
        )
        setEvolutionData(data)
      } catch (error) {
        console.error('Error loading evolution data:', error)
      }
    }
    loadEvolutionData()
  }, [])

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation
      gsap.fromTo(
        titleRef.current,
        {
          opacity: 0,
          y: 50,
        },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: titleRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      )

      // Evolution cards animation
      const cards = sectionRef.current?.querySelectorAll('.evolution-card')
      if (cards) {
        cards.forEach((card, index) => {
          gsap.fromTo(
            card,
            {
              opacity: 0,
              scale: 0.8,
              y: 50,
            },
            {
              opacity: 1,
              scale: 1,
              y: 0,
              duration: 0.8,
              ease: 'back.out(1.7)',
              scrollTrigger: {
                trigger: card,
                start: 'top 85%',
                toggleActions: 'play none none none',
              },
              delay: index * 0.2,
            }
          )
        })

        // Arrow animations
        const arrows = sectionRef.current?.querySelectorAll('.evolution-arrow')
        arrows.forEach((arrow, index) => {
          gsap.fromTo(
            arrow,
            {
              opacity: 0,
              scale: 0,
              rotation: -180,
            },
            {
              opacity: 1,
              scale: 1,
              rotation: 0,
              duration: 0.6,
              ease: 'back.out(1.7)',
              scrollTrigger: {
                trigger: arrow,
                start: 'top 85%',
                toggleActions: 'play none none none',
              },
              delay: index * 0.2 + 0.3,
            }
          )
        })
      }

      // Morph animation on scroll
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top center',
        end: 'bottom center',
        scrub: true,
        onUpdate: (self) => {
          cards?.forEach((card, index) => {
            if (index < cards.length - 1) {
              const progress = Math.max(0, Math.min(1, (self.progress - index * 0.3) * 2))
              gsap.set(card, {
                scale: 1 - progress * 0.1,
                opacity: 1 - progress * 0.3,
              })
            }
          })
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [evolutionData])

  return (
    <section
      ref={sectionRef}
      className="min-h-screen py-20 px-4 bg-gradient-to-b from-black via-purple-900/20 to-black"
    >
      <div className="max-w-6xl mx-auto">
        <h2
          ref={titleRef}
          className="text-5xl md:text-6xl font-bold text-center mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
        >
          Evolution Chain
        </h2>
        <p className="text-center text-gray-400 mb-16 text-lg">
          Watch Pokémon evolve as you scroll
        </p>

        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
          {evolutionData.map((pokemon, index) => (
            <div key={pokemon.id} className="flex items-center gap-8 md:gap-12">
              <div className="evolution-card">
                <div
                  className="relative p-6 rounded-3xl overflow-hidden transition-all duration-500"
                  style={{
                    background: `linear-gradient(135deg, ${getTypeColor(pokemon.types?.[0] || 'normal')}20 0%, ${getTypeColor(pokemon.types?.[0] || 'normal')}10 100%)`,
                    border: `2px solid ${getTypeColor(pokemon.types?.[0] || 'normal')}40`,
                  }}
                >
                  <div className="text-center mb-2">
                    <p className="text-sm text-gray-400 mb-1">
                      #{String(pokemon.id).padStart(3, '0')}
                    </p>
                    <h3 className="text-2xl font-bold capitalize mb-2">
                      {pokemon.name}
                    </h3>
                  </div>

                  <div className="w-48 h-48 mx-auto mb-4 flex items-center justify-center">
                    <img
                      src={pokemon.image || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`}
                      alt={pokemon.name}
                      className="w-full h-full object-contain filter drop-shadow-2xl"
                      onError={(e) => {
                        // Fallback chain: official artwork -> regular sprite
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

                  <div className="flex gap-2 justify-center flex-wrap">
                    {pokemon.types?.map((type) => (
                      <span
                        key={type}
                        className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                        style={{ backgroundColor: getTypeColor(type) }}
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {index < evolutionData.length - 1 && (
                <div className="evolution-arrow hidden md:block">
                  <svg
                    width="60"
                    height="60"
                    viewBox="0 0 60 60"
                    fill="none"
                    className="text-purple-400"
                  >
                    <path
                      d="M30 10 L50 30 L30 50 M50 30 L10 30"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default EvolutionSection

