import { useRef, useCallback } from 'react'

/**
 * useSound - Hook for managing sound effects
 * Supports hover sounds, Pokémon cries, and scroll bass hits
 */
export const useSound = () => {
  const audioContextRef = useRef(null)
  const soundsRef = useRef(new Map())

  // Initialize AudioContext on first use
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
      } catch (e) {
        console.warn('AudioContext not supported')
      }
    }
  }, [])

  // Generate a simple sound effect
  const playTone = useCallback((frequency = 440, duration = 0.1, type = 'sine') => {
    if (!audioContextRef.current) initAudioContext()
    if (!audioContextRef.current) return

    // Resume AudioContext if suspended (required after user gesture)
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume().catch(() => {
        // Silently fail if resume is not possible
      })
    }

    try {
      const oscillator = audioContextRef.current.createOscillator()
      const gainNode = audioContextRef.current.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContextRef.current.destination)

      oscillator.frequency.value = frequency
      oscillator.type = type

      gainNode.gain.setValueAtTime(0.3, audioContextRef.current.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration)

      oscillator.start(audioContextRef.current.currentTime)
      oscillator.stop(audioContextRef.current.currentTime + duration)
    } catch (error) {
      // Silently handle audio errors
      console.warn('Audio playback error:', error)
    }
  }, [initAudioContext])

  // Play hover sound (subtle whoosh)
  const playHoverSound = useCallback(() => {
    playTone(800, 0.05, 'sine')
  }, [playTone])

  // Play click sound (higher pitch tap)
  const playClickSound = useCallback(() => {
    playTone(1000, 0.08, 'square')
  }, [playTone])

  // Play scroll bass hit (low frequency thump)
  const playScrollBass = useCallback(() => {
    if (!audioContextRef.current) initAudioContext()
    if (!audioContextRef.current) return

    const oscillator = audioContextRef.current.createOscillator()
    const gainNode = audioContextRef.current.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContextRef.current.destination)

    oscillator.frequency.value = 60
    oscillator.type = 'sine'

    gainNode.gain.setValueAtTime(0.2, audioContextRef.current.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.3)

    oscillator.start(audioContextRef.current.currentTime)
    oscillator.stop(audioContextRef.current.currentTime + 0.3)
  }, [initAudioContext])

  // Play Pokémon cry (multiple tones for character)
  const playPokemonCry = useCallback((pokemonName) => {
    if (!audioContextRef.current) initAudioContext()
    if (!audioContextRef.current) return

    // Generate unique cry based on name hash
    const hash = pokemonName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const baseFreq = 300 + (hash % 400)

    // Play a sequence of tones
    playTone(baseFreq, 0.15, 'sawtooth')
    setTimeout(() => playTone(baseFreq * 1.3, 0.12, 'sawtooth'), 100)
  }, [initAudioContext, playTone])

  // Haptic feedback (where supported)
  const playHaptic = useCallback((type = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: 10,
        medium: 20,
        heavy: 40,
      }
      navigator.vibrate(patterns[type] || patterns.light)
    }
  }, [])

  // Battle sound effects
  const playAttackSound = useCallback(() => {
    if (!audioContextRef.current) initAudioContext()
    if (!audioContextRef.current) return

    // Sharp attack sound (multiple frequencies for impact)
    playTone(600, 0.1, 'square')
    setTimeout(() => playTone(800, 0.08, 'square'), 50)
    setTimeout(() => playTone(400, 0.12, 'square'), 100)
  }, [initAudioContext, playTone])

  const playDamageSound = useCallback(() => {
    if (!audioContextRef.current) initAudioContext()
    if (!audioContextRef.current) return

    // Lower frequency hit sound
    playTone(200, 0.15, 'sawtooth')
    setTimeout(() => playTone(150, 0.1, 'sawtooth'), 80)
  }, [initAudioContext, playTone])

  const playVictorySound = useCallback(() => {
    if (!audioContextRef.current) initAudioContext()
    if (!audioContextRef.current) return

    // Victory fanfare (ascending tones)
    playTone(523, 0.2, 'sine') // C
    setTimeout(() => playTone(659, 0.2, 'sine'), 150) // E
    setTimeout(() => playTone(784, 0.2, 'sine'), 300) // G
    setTimeout(() => playTone(1047, 0.4, 'sine'), 450) // C (high)
  }, [initAudioContext, playTone])

  // Play thunder sound effect
  const playThunderSound = useCallback(() => {
    if (!audioContextRef.current) initAudioContext()
    if (!audioContextRef.current) return

    // Thunder sound - multiple frequencies for dramatic effect
    const frequencies = [100, 150, 200, 250, 300]
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        const oscillator = audioContextRef.current.createOscillator()
        const gainNode = audioContextRef.current.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContextRef.current.destination)

        oscillator.frequency.value = freq
        oscillator.type = 'sawtooth'

        gainNode.gain.setValueAtTime(0.4, audioContextRef.current.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.5)

        oscillator.start(audioContextRef.current.currentTime)
        oscillator.stop(audioContextRef.current.currentTime + 0.5)
      }, index * 50)
    })
  }, [initAudioContext])

  // Play select sound (pleasant confirmation tone)
  const playSelectSound = useCallback(() => {
    playTone(600, 0.15, 'sine')
    setTimeout(() => playTone(800, 0.1, 'sine'), 100)
  }, [playTone])

  // Play whoosh sound (swoosh effect)
  const playWhooshSound = useCallback(() => {
    if (!audioContextRef.current) initAudioContext()
    if (!audioContextRef.current) return

    // Whoosh sound - frequency sweep
    const oscillator = audioContextRef.current.createOscillator()
    const gainNode = audioContextRef.current.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContextRef.current.destination)

    oscillator.frequency.setValueAtTime(400, audioContextRef.current.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(200, audioContextRef.current.currentTime + 0.3)
    oscillator.type = 'sawtooth'

    gainNode.gain.setValueAtTime(0.3, audioContextRef.current.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.3)

    oscillator.start(audioContextRef.current.currentTime)
    oscillator.stop(audioContextRef.current.currentTime + 0.3)
  }, [initAudioContext])

  // Play friendship sound (warm, friendly tone)
  const playFriendshipSound = useCallback(() => {
    if (!audioContextRef.current) initAudioContext()
    if (!audioContextRef.current) return

    // Warm, ascending tones for friendship
    playTone(400, 0.2, 'sine')
    setTimeout(() => playTone(500, 0.2, 'sine'), 150)
    setTimeout(() => playTone(600, 0.3, 'sine'), 300)
  }, [initAudioContext, playTone])

  // Play battle sound (intense, action-packed)
  const playBattleSound = useCallback(() => {
    if (!audioContextRef.current) initAudioContext()
    if (!audioContextRef.current) return

    // Intense battle sound
    playTone(300, 0.15, 'square')
    setTimeout(() => playTone(400, 0.15, 'square'), 50)
    setTimeout(() => playTone(500, 0.15, 'square'), 100)
    setTimeout(() => playTone(600, 0.2, 'square'), 150)
  }, [initAudioContext, playTone])

  // Play evolution sound (magical transformation sound)
  const playEvolutionSound = useCallback(() => {
    if (!audioContextRef.current) initAudioContext()
    if (!audioContextRef.current) return

    // Resume AudioContext if suspended (required after user gesture)
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume().catch(() => {
        // Silently fail if resume is not possible
      })
    }

    // Magical evolution sound - ascending tones with sparkle effect
    playTone(400, 0.2, 'sine')
    setTimeout(() => playTone(500, 0.2, 'sine'), 100)
    setTimeout(() => playTone(600, 0.2, 'sine'), 200)
    setTimeout(() => playTone(700, 0.3, 'sine'), 300)
    setTimeout(() => playTone(800, 0.4, 'sine'), 400)
  }, [initAudioContext, playTone])

  return {
    playHoverSound,
    playClickSound,
    playScrollBass,
    playPokemonCry,
    playHaptic,
    playAttackSound,
    playDamageSound,
    playVictorySound,
    playThunderSound,
    playSelectSound,
    playWhooshSound,
    playFriendshipSound,
    playBattleSound,
    playEvolutionSound,
    initAudioContext,
  }
}

export default useSound

