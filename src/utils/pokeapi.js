import axios from 'axios'

const API_BASE = 'https://pokeapi.co/api/v2'

export const fetchPokemonList = async (limit = 151) => {
  try {
    const response = await axios.get(`${API_BASE}/pokemon?limit=${limit}`)
    const pokemonPromises = response.data.results.map(async (pokemon, index) => {
      const details = await fetchPokemonDetails(index + 1)
      return {
        id: index + 1,
        name: pokemon.name,
        url: pokemon.url,
        ...details
      }
    })
    return Promise.all(pokemonPromises)
  } catch (error) {
    console.error('Error fetching Pokémon list:', error)
    throw error
  }
}

export const fetchPokemonDetails = async (id) => {
  try {
    const response = await axios.get(`${API_BASE}/pokemon/${id}`)
    const data = response.data
    
    // Safely extract image URL with proper fallbacks
    let imageUrl = null
    if (data.sprites?.other?.['official-artwork']?.front_default) {
      imageUrl = data.sprites.other['official-artwork'].front_default
    } else if (data.sprites?.other?.dream_world?.front_default) {
      imageUrl = data.sprites.other.dream_world.front_default
    } else if (data.sprites?.front_default) {
      imageUrl = data.sprites.front_default
    } else {
      // Fallback to GitHub CDN if API doesn't provide image
      imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
    }
    
    return {
      id: data.id,
      name: data.name,
      image: imageUrl,
      types: data.types.map(t => t.type.name),
      stats: data.stats.map(s => ({
        name: s.stat.name,
        value: s.base_stat
      })),
      height: data.height,
      weight: data.weight,
      abilities: data.abilities.map(a => a.ability.name),
      species: data.species.name
    }
  } catch (error) {
    console.error(`Error fetching Pokémon ${id}:`, error)
    throw error
  }
}

export const fetchPokemonSpecies = async (id) => {
  try {
    const response = await axios.get(`${API_BASE}/pokemon-species/${id}`)
    return response.data
  } catch (error) {
    console.error(`Error fetching Pokémon species ${id}:`, error)
    throw error
  }
}

export const getTypeColor = (type) => {
  const colors = {
    fire: '#F08030',
    water: '#6890F0',
    grass: '#78C850',
    electric: '#F8D030',
    psychic: '#F85888',
    ice: '#98D8D8',
    dragon: '#7038F8',
    dark: '#705848',
    fairy: '#EE99AC',
    normal: '#A8A878',
    fighting: '#C03028',
    flying: '#A890F0',
    poison: '#A040A0',
    ground: '#E0C068',
    rock: '#B8A038',
    bug: '#A8B820',
    ghost: '#705898',
    steel: '#B8B8D0',
  }
  return colors[type] || '#A8A878'
}

// Common Pokémon moves for battle
const COMMON_MOVES = [
  { name: 'Tackle', type: 'normal', power: 40, accuracy: 100 },
  { name: 'Thunderbolt', type: 'electric', power: 90, accuracy: 100 },
  { name: 'Quick Attack', type: 'normal', power: 40, accuracy: 100 },
  { name: 'Iron Tail', type: 'steel', power: 100, accuracy: 75 },
  { name: 'Flamethrower', type: 'fire', power: 90, accuracy: 100 },
  { name: 'Water Gun', type: 'water', power: 40, accuracy: 100 },
  { name: 'Solar Beam', type: 'grass', power: 120, accuracy: 100 },
  { name: 'Psychic', type: 'psychic', power: 90, accuracy: 100 },
  { name: 'Ice Beam', type: 'ice', power: 90, accuracy: 100 },
  { name: 'Thunder', type: 'electric', power: 110, accuracy: 70 },
  { name: 'Fire Blast', type: 'fire', power: 110, accuracy: 85 },
  { name: 'Surf', type: 'water', power: 90, accuracy: 100 },
  { name: 'Earthquake', type: 'ground', power: 100, accuracy: 100 },
  { name: 'Hyper Beam', type: 'normal', power: 150, accuracy: 90 },
]

export const getRandomMove = () => {
  const randomIndex = Math.floor(Math.random() * COMMON_MOVES.length)
  return COMMON_MOVES[randomIndex]
}

// Get moves suitable for a Pokemon based on its types
export const getMovesForPokemon = (pokemon) => {
  if (!pokemon || !pokemon.types) return COMMON_MOVES.slice(0, 4)
  
  const pokemonTypes = pokemon.types.map(t => t.toLowerCase())
  const typeMoves = {
    fire: ['Flamethrower', 'Fire Blast', 'Ember'],
    water: ['Water Gun', 'Surf', 'Hydro Pump'],
    grass: ['Solar Beam', 'Vine Whip', 'Razor Leaf'],
    electric: ['Thunderbolt', 'Thunder', 'Thunder Shock'],
    psychic: ['Psychic', 'Psybeam', 'Confusion'],
    ice: ['Ice Beam', 'Blizzard', 'Ice Punch'],
    dragon: ['Dragon Claw', 'Dragon Breath'],
    normal: ['Tackle', 'Quick Attack', 'Hyper Beam'],
    fighting: ['Brick Break', 'Focus Punch', 'Karate Chop'],
    flying: ['Aerial Ace', 'Sky Attack', 'Wing Attack'],
    poison: ['Poison Jab', 'Sludge Bomb', 'Acid'],
    ground: ['Earthquake', 'Dig', 'Earth Power'],
    rock: ['Stone Edge', 'Rock Slide', 'Rock Throw'],
    bug: ['Bug Buzz', 'X-Scissor', 'Pin Missile'],
    ghost: ['Shadow Ball', 'Shadow Claw', 'Night Shade'],
    steel: ['Iron Tail', 'Flash Cannon', 'Metal Claw'],
    dark: ['Dark Pulse', 'Night Slash', 'Crunch'],
    fairy: ['Moonblast', 'Dazzling Gleam', 'Fairy Wind'],
  }
  
  // Get moves matching Pokemon's types, then fill with common moves
  const matchingMoves = []
  pokemonTypes.forEach(type => {
    if (typeMoves[type]) {
      typeMoves[type].forEach(moveName => {
        const move = COMMON_MOVES.find(m => m.name === moveName)
        if (move && !matchingMoves.find(m => m.name === moveName)) {
          matchingMoves.push(move)
        }
      })
    }
  })
  
  // Fill remaining slots with common moves
  const finalMoves = [...matchingMoves]
  COMMON_MOVES.forEach(move => {
    if (finalMoves.length < 4 && !finalMoves.find(m => m.name === move.name)) {
      finalMoves.push(move)
    }
  })
  
  return finalMoves.slice(0, 4)
}

// Type effectiveness chart (multiplier)
export const getTypeEffectiveness = (attackType, defenderTypes) => {
  const effectivenessChart = {
    normal: { rock: 0.5, ghost: 0, steel: 0.5 },
    fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
    water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
    electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
    grass: { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
    ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
    fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
    poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
    ground: { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
    flying: { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
    psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
    bug: { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
    rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
    ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
    dragon: { dragon: 2, steel: 0.5, fairy: 0 },
    dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
    steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
    fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 },
  }
  
  if (!effectivenessChart[attackType] || !defenderTypes || defenderTypes.length === 0) {
    return 1
  }
  
  let multiplier = 1
  defenderTypes.forEach(defenderType => {
    const typeEffect = effectivenessChart[attackType][defenderType]
    if (typeEffect !== undefined) {
      multiplier *= typeEffect
    }
  })
  
  return multiplier
}

// Calculate HP based on base stats (formula: HP = (2 * BaseStat + 100) * Level / 100 + 10)
export const calculateHP = (baseHP, level = 50) => {
  return Math.floor((2 * baseHP + 100) * level / 100 + 10)
}

// Get stat value (formula: Stat = (2 * BaseStat + 31) * Level / 100 + 5)
export const calculateStat = (baseStat, level = 50) => {
  return Math.floor((2 * baseStat + 31) * level / 100 + 5)
}