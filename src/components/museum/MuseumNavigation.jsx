import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import useSound from '../../hooks/useSound'

const MuseumNavigation = ({ currentSection, onNavigate, sections }) => {
  const navRef = useRef(null)
  const { playClickSound, playHoverSound } = useSound()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (navRef.current) {
      gsap.fromTo(
        navRef.current,
        { y: -100, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.5 }
      )
    }
  }, [])

  const handleNavClick = (section) => {
    playClickSound()
    setIsOpen(false)
    onNavigate(section)
  }

  return (
    <nav
      ref={navRef}
      className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-xl">⚡</span>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Pokémon Museum
          </span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => handleNavClick(section.id)}
              onMouseEnter={playHoverSound}
              className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
                currentSection === section.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-purple-500/50 scale-105'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {section.name}
            </button>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => {
            setIsOpen(!isOpen)
            playClickSound()
          }}
          className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-md border-t border-white/10">
          <div className="px-4 py-4 flex flex-col gap-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => handleNavClick(section.id)}
                className={`px-6 py-3 rounded-lg font-semibold text-left transition-all ${
                  currentSection === section.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                    : 'text-gray-300 hover:bg-white/10'
                }`}
              >
                {section.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}

export default MuseumNavigation

