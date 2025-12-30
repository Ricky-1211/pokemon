// components/PokemonSelection.jsx
import { useEffect, useState } from 'react'
import { gsap } from 'gsap'
import useSound from '../../hooks/useSound'
import { fetchPokemonList, getTypeColor } from '../../utils/pokeapi'

const PokemonSelection = ({ onPokemonSelected, onStartBattle, onBack }) => {
  const [pokemonList, setPokemonList] = useState([])
  const [selectedPokemon, setSelectedPokemon] = useState(null)
  const [playerPokemon, setPlayerPokemon] = useState(null)
  const [enemyPokemon, setEnemyPokemon] = useState(null)
  const [loading, setLoading] = useState(true)
  const { playClickSound, playSelectSound } = useSound()

  useEffect(() => {
    loadPokemon()
  }, [])

  const loadPokemon = async () => {
    try {
      setLoading(true)
      const pokemons = await fetchPokemonList(20) // Load first 20 Pokémon
      setPokemonList(pokemons)
      
      // Auto-select first Pokémon
      if (pokemons.length > 0) {
        setSelectedPokemon(pokemons[0])
      }
    } catch (error) {
      console.error('Error loading Pokémon:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePokemonSelect = (pokemon) => {
    playSelectSound()
    setSelectedPokemon(pokemon)
    
    // Animate selection
    gsap.to('.pokemon-card', {
      scale: 1,
      duration: 0.3,
      ease: 'back.out(1.7)'
    })
    
    gsap.to(`#pokemon-${pokemon.id}`, {
      scale: 1.1,
      duration: 0.3,
      ease: 'back.out(1.7)'
    })
  }

  const handleSelectForBattle = (isPlayer = true) => {
    playClickSound()
    if (!selectedPokemon) return
    
    if (isPlayer) {
      setPlayerPokemon(selectedPokemon)
      gsap.to('#player-selection', {
        scale: 1.05,
        duration: 0.3,
        ease: 'elastic.out(1, 0.5)'
      })
    } else {
      // Random enemy selection if no player selection
      if (!playerPokemon) {
        const randomPokemon = pokemonList[Math.floor(Math.random() * pokemonList.length)]
        setPlayerPokemon(randomPokemon)
      }
      
      // Select random enemy (different from player)
      let enemy = selectedPokemon
      while (enemy.id === (playerPokemon?.id || selectedPokemon.id)) {
        enemy = pokemonList[Math.floor(Math.random() * pokemonList.length)]
      }
      setEnemyPokemon(enemy)
      gsap.to('#enemy-selection', {
        scale: 1.05,
        duration: 0.3,
        ease: 'elastic.out(1, 0.5)'
      })
    }
  }

  const handleStartBattle = () => {
    if (!playerPokemon || !enemyPokemon) {
      // Auto-select if missing
      if (!playerPokemon) {
        setPlayerPokemon(selectedPokemon || pokemonList[0])
      }
      if (!enemyPokemon) {
        let enemy = pokemonList[Math.floor(Math.random() * pokemonList.length)]
        while (enemy.id === (playerPokemon?.id || selectedPokemon?.id)) {
          enemy = pokemonList[Math.floor(Math.random() * pokemonList.length)]
        }
        setEnemyPokemon(enemy)
      }
      
      setTimeout(() => {
        handleStartBattle()
      }, 100)
      return
    }
    
    playClickSound()
    onStartBattle(playerPokemon, enemyPokemon)
  }

  const handleBack = () => {
    playClickSound()
    if (onBack) onBack()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <div className="pt-8 pb-4">
          <button
            onClick={handleBack}
            className="group relative px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-800 rounded-full text-white font-bold hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-gray-500/50 flex items-center gap-2"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Lobby
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-12 pt-4">
          <h1 className="text-6xl md:text-7xl font-black mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            CHOOSE YOUR POKÉMON
          </h1>
          <p className="text-gray-300 text-lg">
            Select your Pokémon and start an epic battle!
          </p>
        </div>

        {/* Selection Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Player Selection */}
          <div 
            id="player-selection"
            className="bg-gradient-to-br from-blue-900/40 to-blue-950/40 backdrop-blur-lg rounded-3xl p-8 border-2 border-blue-400/30"
          >
            <h2 className="text-3xl font-bold text-blue-300 mb-6 text-center">Your Pokémon</h2>
            {playerPokemon ? (
              <div className="text-center">
                <div className="relative w-48 h-48 mx-auto mb-6">
                  <img 
                    src={playerPokemon.image} 
                    alt={playerPokemon.name}
                    className="w-full h-full object-contain drop-shadow-2xl"
                  />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2 capitalize">{playerPokemon.name}</h3>
                <div className="flex justify-center gap-2 mb-4">
                  {playerPokemon.types.map(type => (
                    <span
                      key={type}
                      className="px-4 py-1 rounded-full text-sm font-bold"
                      style={{ backgroundColor: getTypeColor(type) + '40', color: getTypeColor(type) }}
                    >
                      {type}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => setPlayerPokemon(null)}
                  className="px-6 py-2 bg-red-500/30 hover:bg-red-500/50 rounded-full text-red-200 transition-colors"
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="text-center h-64 flex flex-col justify-center">
                <p className="text-gray-400 mb-6">Select a Pokémon from the list</p>
                <button
                  onClick={() => handleSelectForBattle(true)}
                  disabled={!selectedPokemon}
                  className={`px-8 py-3 rounded-full font-bold transition-all ${selectedPokemon ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-700 cursor-not-allowed'}`}
                >
                  Select as Player
                </button>
              </div>
            )}
          </div>

          {/* VS Divider */}
          <div className="flex flex-col items-center justify-center">
            <div className="text-8xl font-black text-red-400/50 mb-8">VS</div>
            <div className="text-center">
              <p className="text-gray-300 mb-4">Ready to battle?</p>
              <button
                onClick={handleStartBattle}
                disabled={!playerPokemon || !enemyPokemon}
                className={`px-10 py-4 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 rounded-full text-white font-bold text-lg transition-all hover:scale-105 ${(!playerPokemon || !enemyPokemon) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                START BATTLE!
              </button>
            </div>
          </div>

          {/* Enemy Selection */}
          <div 
            id="enemy-selection"
            className="bg-gradient-to-br from-red-900/40 to-red-950/40 backdrop-blur-lg rounded-3xl p-8 border-2 border-red-400/30"
          >
            <h2 className="text-3xl font-bold text-red-300 mb-6 text-center">Opponent</h2>
            {enemyPokemon ? (
              <div className="text-center">
                <div className="relative w-48 h-48 mx-auto mb-6">
                  <img 
                    src={enemyPokemon.image} 
                    alt={enemyPokemon.name}
                    className="w-full h-full object-contain drop-shadow-2xl"
                  />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2 capitalize">{enemyPokemon.name}</h3>
                <div className="flex justify-center gap-2 mb-4">
                  {enemyPokemon.types.map(type => (
                    <span
                      key={type}
                      className="px-4 py-1 rounded-full text-sm font-bold"
                      style={{ backgroundColor: getTypeColor(type) + '40', color: getTypeColor(type) }}
                    >
                      {type}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => setEnemyPokemon(null)}
                  className="px-6 py-2 bg-red-500/30 hover:bg-red-500/50 rounded-full text-red-200 transition-colors"
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="text-center h-64 flex flex-col justify-center">
                <p className="text-gray-400 mb-6">Select opponent Pokémon</p>
                <div className="space-y-3">
                  <button
                    onClick={() => handleSelectForBattle(false)}
                    disabled={!selectedPokemon}
                    className={`px-8 py-3 rounded-full font-bold transition-all w-full ${selectedPokemon ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 cursor-not-allowed'}`}
                  >
                    Select as Opponent
                  </button>
                  <button
                    onClick={() => {
                      // Random opponent
                      const randomPokemon = pokemonList[Math.floor(Math.random() * pokemonList.length)]
                      setEnemyPokemon(randomPokemon)
                    }}
                    className="px-8 py-3 bg-purple-500 hover:bg-purple-600 rounded-full font-bold transition-all w-full"
                  >
                    Random Opponent
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pokémon Grid */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Available Pokémon</h2>
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              <p className="text-gray-400 mt-4">Loading Pokémon...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {pokemonList.map(pokemon => (
                <div
                  key={pokemon.id}
                  id={`pokemon-${pokemon.id}`}
                  className={`pokemon-card bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-md rounded-2xl p-4 cursor-pointer transition-all hover:scale-105 border-2 ${selectedPokemon?.id === pokemon.id ? 'border-blue-500' : 'border-gray-700/50'}`}
                  onClick={() => handlePokemonSelect(pokemon)}
                >
                  <div className="relative w-full h-32 mb-4">
                    <img 
                      src={pokemon.image} 
                      alt={pokemon.name}
                      className="w-full h-full object-contain drop-shadow-lg"
                    />
                    <div className="absolute top-2 right-2 bg-black/50 rounded-full w-8 h-8 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">#{pokemon.id}</span>
                    </div>
                  </div>
                  <h3 className="text-center font-bold text-white capitalize mb-2">{pokemon.name}</h3>
                  <div className="flex justify-center gap-1">
                    {pokemon.types.map(type => (
                      <span
                        key={type}
                        className="px-2 py-1 rounded-full text-xs"
                        style={{ backgroundColor: getTypeColor(type) + '40', color: getTypeColor(type) }}
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PokemonSelection