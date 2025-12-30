import { useState, useEffect } from 'react'
import MuseumLobby from './components/museum/MuseumLobby'
import MuseumNavigation from './components/museum/MuseumNavigation'
import GenerationRoom from './components/museum/GenerationRoom'
import LegendaryVault from './components/museum/LegendaryVault'
import EvolutionChamber from './components/museum/EvolutionChamber'
import GameStartRoom from './components/game/GameStartRoom'
import BattleRoom from './components/game/BattleRoom'
import PokemonSelection from './components/game/PokemonSelection'
import PokemonCustomizer from './components/customizer/PokemonCustomizer'
import PokedexAssistant from './components/pokedex/PokedexAssistant'
import JourneyPage1 from './components/museum/journey/JourneyPage1'
import JourneyPage2 from './components/museum/journey/JourneyPage2'
import JourneyPage3 from './components/museum/journey/JourneyPage3'
import JourneyPage4 from './components/museum/journey/JourneyPage4'
import JourneyPage5 from './components/museum/journey/JourneyPage5'
import JourneyPage6 from './components/museum/journey/JourneyPage6'
import PokemonComparison from './components/museum/PokemonComparison'
import { fetchPokemonList } from './utils/pokeapi'

function App() {
  const [currentSection, setCurrentSection] = useState('lobby') // lobby, gen1, gen2, gen3, legendary, evolution, gameStart, battle, pokemonSelection
  const [selectedPokemon, setSelectedPokemon] = useState(null)
  const [showCustomizer, setShowCustomizer] = useState(false)
  const [pokemonList, setPokemonList] = useState([])
  const [loading, setLoading] = useState(true)
  const [showPokedex, setShowPokedex] = useState(true)
  const [battlePokemon, setBattlePokemon] = useState({ player: null, enemy: null })

  useEffect(() => {
    const loadPokemon = async () => {
      try {
        // Load 386 Pokémon to include Gen I, Gen II, and Gen III (IDs 1-386)
        const data = await fetchPokemonList(386)
        setPokemonList(data)
        setLoading(false)
      } catch (error) {
        console.error('Error loading Pokémon:', error)
        setLoading(false)
      }
    }
    loadPokemon()
  }, [])

  // Museum sections configuration
  const museumSections = [
    { id: 'lobby', name: 'Lobby' },
    { id: 'gen1', name: 'Gen I' },
    { id: 'gen2', name: 'Gen II' },
    { id: 'gen3', name: 'Gen III' },
    { id: 'legendary', name: 'Legendary' },
    { id: 'evolution', name: 'Evolution' },
  ]

  const handleEnterMuseum = () => {
    setCurrentSection('gen1')
  }

  const handleStartGame = () => {
    setCurrentSection('gameStart')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBattle = () => {
    setCurrentSection('pokemonSelection')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleStartBattle = (playerPokemon, enemyPokemon) => {
    setBattlePokemon({ player: playerPokemon, enemy: enemyPokemon })
    setCurrentSection('battle')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePokemonComparison = () => {
    setCurrentSection('comparison')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBackToLobby = () => {
    setCurrentSection('lobby')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCardClick = (cardId) => {
    setCurrentSection(`journey${cardId}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleNavigate = (section) => {
    setCurrentSection(section)
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePokemonSelect = (pokemon) => {
    setSelectedPokemon(pokemon)
    setShowCustomizer(true)
  }

  const handlePokedexFocus = (pokemonName) => {
    // Find Pokémon by name and open customizer
    const pokemon = pokemonList.find((p) => p.name.toLowerCase() === pokemonName.toLowerCase())
    if (pokemon) {
      setSelectedPokemon(pokemon)
      setShowCustomizer(true)
    }
  }

  // Filter legendary Pokémon (famous ones)
  const legendaryPokemon = pokemonList.filter((p) => {
    const legendaryIds = [144, 145, 146, 150, 151, 243, 244, 245, 249, 250, 251]
    return legendaryIds.includes(p.id)
  })

  // Render current section
  const renderSection = () => {
    switch (currentSection) {
      case 'lobby':
        return (
          <MuseumLobby
            onEnterMuseum={handleEnterMuseum}
            onStartGame={handleStartGame}
            onBattle={handleBattle}
            onCardClick={handleCardClick}
            onPokemonComparison={handlePokemonComparison}
          />
        )
      case 'gameStart':
        return <GameStartRoom onBackToLobby={handleBackToLobby} />
      case 'pokemonSelection':
        return (
          <PokemonSelection 
            onPokemonSelected={setSelectedPokemon}
            onStartBattle={handleStartBattle}
            onBack={handleBackToLobby}
          />
        )
      case 'battle':
        return (
          <BattleRoom 
            onBackToLobby={handleBackToLobby}
            playerPokemon={battlePokemon.player}
            enemyPokemon={battlePokemon.enemy}
          />
        )
      case 'gen1':
        return (
          <GenerationRoom
            generation={1}
            pokemonList={pokemonList}
            onPokemonSelect={handlePokemonSelect}
          />
        )
      case 'gen2':
        return (
          <GenerationRoom
            generation={2}
            pokemonList={pokemonList}
            onPokemonSelect={handlePokemonSelect}
          />
        )
      case 'gen3':
        return (
          <GenerationRoom
            generation={3}
            pokemonList={pokemonList}
            onPokemonSelect={handlePokemonSelect}
          />
        )
      case 'legendary':
        return (
          <LegendaryVault
            legendaryPokemon={legendaryPokemon}
            onPokemonSelect={handlePokemonSelect}
          />
        )
      case 'evolution':
        return (
          <EvolutionChamber
            evolutionChains={[]}
            onPokemonSelect={handlePokemonSelect}
          />
        )
      case 'journey1':
        return <JourneyPage1 onBack={handleBackToLobby} />
      case 'journey2':
        return <JourneyPage2 onBack={handleBackToLobby} />
      case 'journey3':
        return <JourneyPage3 onBack={handleBackToLobby} />
      case 'journey4':
        return <JourneyPage4 onBack={handleBackToLobby} />
      case 'journey5':
        return <JourneyPage5 onBack={handleBackToLobby} />
      case 'journey6':
        return <JourneyPage6 onBack={handleBackToLobby} />
      case 'comparison':
        return <PokemonComparison onBack={handleBackToLobby} />
      default:
        return (
          <MuseumLobby
            onEnterMuseum={handleEnterMuseum}
            onStartGame={handleStartGame}
            onBattle={handleBattle}
            onCardClick={handleCardClick}
            onPokemonComparison={handlePokemonComparison}
          />
        )
    }
  }

  return (
    <div className="App">
      {/* Navigation - show after lobby, but not in game rooms, journey pages, or comparison */}
      {currentSection !== 'lobby' && 
       currentSection !== 'gameStart' && 
       currentSection !== 'battle' && 
       currentSection !== 'pokemonSelection' &&
       currentSection !== 'comparison' &&
       !currentSection.startsWith('journey') && (
        <MuseumNavigation
          currentSection={currentSection}
          onNavigate={handleNavigate}
          sections={museumSections}
        />
      )}

      {/* Main Content */}
      <div className={currentSection !== 'lobby' && 
                      currentSection !== 'gameStart' && 
                      currentSection !== 'battle' && 
                      currentSection !== 'pokemonSelection' &&
                      currentSection !== 'comparison' &&
                      !currentSection.startsWith('journey') ? 'pt-20' : ''}>
        {renderSection()}
      </div>

      {/* Pokémon Customizer Panel */}
      {showCustomizer && selectedPokemon && (
        <PokemonCustomizer
          pokemon={selectedPokemon}
          onClose={() => {
            setShowCustomizer(false)
            setSelectedPokemon(null)
          }}
        />
      )}

      {/* Pokédex Assistant - show after lobby, but not in game rooms, journey pages, or comparison */}
      {currentSection !== 'lobby' && 
       currentSection !== 'gameStart' && 
       currentSection !== 'battle' && 
       currentSection !== 'pokemonSelection' &&
       currentSection !== 'comparison' &&
       !currentSection.startsWith('journey') && 
       showPokedex && (
        <PokedexAssistant
          pokemon={selectedPokemon}
          onFocusPokemon={handlePokedexFocus}
        />
      )}

      {/* Toggle Pokédex Button - show after lobby, but not in game rooms, journey pages, or comparison */}
      {currentSection !== 'lobby' && 
       currentSection !== 'gameStart' && 
       currentSection !== 'battle' && 
       currentSection !== 'pokemonSelection' &&
       currentSection !== 'comparison' &&
       !currentSection.startsWith('journey') && (
        <button
          onClick={() => setShowPokedex(!showPokedex)}
          className="fixed bottom-6 right-6 md:right-[420px] w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-2xl hover:scale-110 transition-transform z-50 flex items-center justify-center text-2xl"
          title={showPokedex ? 'Hide Pokédex' : 'Show Pokédex'}
        >
          📱
        </button>
      )}
    </div>
  )
}

export default App
