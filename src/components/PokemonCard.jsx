import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { getTypeColor } from '../utils/pokeapi'

const PokemonCard = ({ pokemon, isHovered, onHover, onLeave, onClick }) => {
  const cardRef = useRef(null)
  const imageRef = useRef(null)

  useEffect(() => {
    if (isHovered && cardRef.current) {
      gsap.to(cardRef.current, {
        y: -10,
        scale: 1.05,
        duration: 0.3,
        ease: 'power2.out',
      })
      gsap.to(imageRef.current, {
        scale: 1.2,
        rotation: 5,
        duration: 0.3,
        ease: 'power2.out',
      })
    } else if (cardRef.current) {
      gsap.to(cardRef.current, {
        y: 0,
        scale: 1,
        duration: 0.3,
        ease: 'power2.out',
      })
      gsap.to(imageRef.current, {
        scale: 1,
        rotation: 0,
        duration: 0.3,
        ease: 'power2.out',
      })
    }
  }, [isHovered])

  const primaryType = pokemon.types?.[0] || 'normal'
  const typeColor = getTypeColor(primaryType)

  return (
    <div
      ref={cardRef}
      className="pokemon-card relative cursor-pointer group"
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onClick}
    >
      <div
        className="relative p-4 rounded-2xl overflow-hidden transition-all duration-300"
        style={{
          background: `linear-gradient(135deg, ${typeColor}20 0%, ${typeColor}10 100%)`,
          border: `2px solid ${typeColor}40`,
        }}
      >
        {/* Glow effect on hover */}
        {isHovered && (
          <div
            className="absolute inset-0 opacity-50 blur-xl"
            style={{ backgroundColor: typeColor }}
          />
        )}

        {/* Pokémon number */}
        <div className="absolute top-2 right-2 text-xs font-bold text-gray-400">
          #{String(pokemon.id).padStart(3, '0')}
        </div>

        {/* Pokémon image */}
        <div className="relative h-32 flex items-center justify-center mb-2">
          <img
            ref={imageRef}
            src={pokemon.image || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`}
            alt={pokemon.name}
            className="w-full h-full object-contain filter drop-shadow-lg"
            onError={(e) => {
              e.target.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`
            }}
          />
        </div>

        {/* Pokémon name */}
        <h3 className="text-center font-semibold text-white capitalize mb-2 text-sm md:text-base">
          {pokemon.name}
        </h3>

        {/* Types */}
        <div className="flex gap-1 justify-center flex-wrap">
          {pokemon.types?.map((type) => (
            <span
              key={type}
              className="px-2 py-1 rounded-full text-xs font-medium text-white"
              style={{
                backgroundColor: getTypeColor(type),
              }}
            >
              {type}
            </span>
          ))}
        </div>

        {/* Hover overlay */}
        <div
          className={`absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl`}
        >
          <span className="text-white font-semibold">View Details</span>
        </div>
      </div>
    </div>
  )
}

export default PokemonCard

