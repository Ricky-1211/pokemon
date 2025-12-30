import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { fetchPokemonDetails } from '../utils/pokeapi'
import { getTypeColor } from '../utils/pokeapi'
import PokemonCard from './PokemonCard'

gsap.registerPlugin(ScrollTrigger)

const PokemonGallery = ({ pokemonList, loading, onSelectPokemon }) => {
  const sectionRef = useRef(null)
  const titleRef = useRef(null)
  const [hoveredId, setHoveredId] = useState(null)

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

      // Cards stagger animation
      const cards = sectionRef.current?.querySelectorAll('.pokemon-card')
      if (cards) {
        gsap.fromTo(
          cards,
          {
            opacity: 0,
            y: 50,
            scale: 0.9,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            ease: 'power2.out',
            stagger: 0.05,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 70%',
              toggleActions: 'play none none none',
            },
          }
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [pokemonList])

  const handleCardClick = async (pokemon) => {
    try {
      const details = await fetchPokemonDetails(pokemon.id)
      onSelectPokemon({ ...pokemon, ...details })
    } catch (error) {
      console.error('Error fetching Pokémon details:', error)
    }
  }

  if (loading) {
    return (
      <section className="gallery-section min-h-screen py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-xl text-gray-400">Loading Pokémon...</p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section ref={sectionRef} className="gallery-section min-h-screen py-20 px-4 bg-gradient-to-b from-black via-gray-900 to-black">
      <div className="max-w-7xl mx-auto">
        <h2
          ref={titleRef}
          className="text-5xl md:text-6xl font-bold text-center mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
        >
          Pokémon Gallery
        </h2>
        <p className="text-center text-gray-400 mb-12 text-lg">
          Click on any Pokémon to see detailed information
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {pokemonList.map((pokemon) => (
            <PokemonCard
              key={pokemon.id}
              pokemon={pokemon}
              isHovered={hoveredId === pokemon.id}
              onHover={() => setHoveredId(pokemon.id)}
              onLeave={() => setHoveredId(null)}
              onClick={() => handleCardClick(pokemon)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default PokemonGallery

