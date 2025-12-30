import { useState, useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import useSound from '../../hooks/useSound'

const PokedexAssistant = ({ pokemon, onFocusPokemon }) => {
  const [messages, setMessages] = useState([
    {
      type: 'assistant',
      text: "Hello! I'm your Pokédex Assistant. Ask me about any Pokémon, or try: 'Tell me about Charizard'",
    },
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const chatRef = useRef(null)
  const { playClickSound, playHoverSound } = useSound()

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Predefined responses (simulated AI)
  const getResponse = (query) => {
    const lowerQuery = query.toLowerCase()
    
    // Check for Pokémon name patterns
    const pokemonMentions = {
      charizard: {
        text: "Charizard is a Fire/Flying type Pokémon! 🔥 It has impressive wingspan and can breathe flames hot enough to melt boulders. Its stats: HP 78, Attack 84, Defense 78, Sp. Atk 109, Sp. Def 85, Speed 100.",
        focus: 'charizard',
        stats: { hp: 78, attack: 84, defense: 78, spAtk: 109, spDef: 85, speed: 100 },
      },
      pikachu: {
        text: "Pikachu is the Electric Mouse Pokémon! ⚡ This adorable Pokémon can store electricity in its cheeks. Stats: HP 35, Attack 55, Defense 40, Sp. Atk 50, Sp. Def 50, Speed 90.",
        focus: 'pikachu',
        stats: { hp: 35, attack: 55, defense: 40, spAtk: 50, spDef: 50, speed: 90 },
      },
      bulbasaur: {
        text: "Bulbasaur is a Grass/Poison type! 🌱 It carries a plant seed on its back that grows larger as it evolves. Stats: HP 45, Attack 49, Defense 49, Sp. Atk 65, Sp. Def 65, Speed 45.",
        focus: 'bulbasaur',
        stats: { hp: 45, attack: 49, defense: 49, spAtk: 65, spDef: 65, speed: 45 },
      },
    }

    for (const [name, data] of Object.entries(pokemonMentions)) {
      if (lowerQuery.includes(name)) {
        return data
      }
    }

    // Default responses
    if (lowerQuery.includes('help') || lowerQuery.includes('what can')) {
      return {
        text: "I can tell you about Pokémon stats, types, abilities, and help you explore the museum! Try asking about a specific Pokémon by name.",
      }
    }

    if (lowerQuery.includes('generation') || lowerQuery.includes('gen')) {
      return {
        text: "The museum has multiple generation rooms! Each generation introduces new Pokémon with unique designs and typings. Navigate using the top menu to explore different generations.",
      }
    }

    return {
      text: "I'm still learning! Try asking about specific Pokémon like 'Tell me about Charizard' or ask for help to see what I can do.",
    }
  }

  const handleSend = () => {
    if (!inputValue.trim() || isTyping) return

    playClickSound()

    // Store input value before clearing
    const query = inputValue.trim()

    // Add user message
    const userMessage = { type: 'user', text: query }
    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    // Simulate AI thinking delay
    setTimeout(() => {
      const response = getResponse(query)
      
      // Type out response character by character
      const responseText = response.text
      let currentIndex = 0
      const typingInterval = setInterval(() => {
        if (currentIndex < responseText.length) {
          setMessages((prev) => {
            const newMessages = [...prev]
            if (newMessages[newMessages.length - 1].type === 'assistant') {
              newMessages[newMessages.length - 1].text = responseText.slice(0, currentIndex + 1)
            } else {
              newMessages.push({
                type: 'assistant',
                text: responseText.slice(0, currentIndex + 1),
                focus: response.focus,
                stats: response.stats,
              })
            }
            return newMessages
          })
          currentIndex++
        } else {
          clearInterval(typingInterval)
          setIsTyping(false)
          
          // Focus on Pokémon if specified
          if (response.focus && onFocusPokemon) {
            setTimeout(() => {
              onFocusPokemon(response.focus)
            }, 500)
          }
        }
      }, 30)
    }, 500)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div
      ref={chatRef}
      className="fixed bottom-0 right-0 w-full md:w-96 h-[500px] md:h-[600px] bg-black/95 backdrop-blur-xl border-t border-l border-white/10 z-40 flex flex-col"
    >
      {/* Header */}
      <div className="bg-black/80 backdrop-blur-md border-b border-white/10 p-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
          <span className="text-xl">📱</span>
        </div>
        <div>
          <h3 className="font-bold text-lg">Pokédex Assistant</h3>
          <p className="text-xs text-gray-400">Your AI-powered guide</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                msg.type === 'user'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                  : 'bg-gray-800 text-gray-100'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
              {msg.stats && (
                <div className="mt-3 space-y-2">
                  {Object.entries(msg.stats).map(([stat, value]) => (
                    <div key={stat} className="flex items-center gap-2">
                      <span className="text-xs font-semibold capitalize w-16">
                        {stat === 'spAtk' ? 'Sp. Atk' : stat === 'spDef' ? 'Sp. Def' : stat}:
                      </span>
                      <div className="flex-1 bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-400 to-purple-500 transition-all duration-1000"
                          style={{ width: `${(value / 150) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs w-10 text-right">{value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-2xl px-4 py-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-white/10 p-4 bg-black/80">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about a Pokémon..."
            className="flex-1 bg-gray-800 border border-white/20 rounded-xl px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
          />
          <button
            onClick={handleSend}
            onMouseEnter={playHoverSound}
            disabled={!inputValue.trim() || isTyping}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-semibold hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}

export default PokedexAssistant

