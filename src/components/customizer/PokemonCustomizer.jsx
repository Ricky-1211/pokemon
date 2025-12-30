import { useState, useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei'
import { gsap } from 'gsap'
import useSound from '../../hooks/useSound'
import Pokemon3D from '../three/Pokemon3D'
import SceneManager from '../../three/SceneManager'

const PokemonCustomizer = ({ pokemon, onClose }) => {
  const [variants, setVariants] = useState({
    shiny: false,
    environment: 'default',
    lighting: 'sunset',
    colorShift: 0,
  })
  const panelRef = useRef(null)
  const previewContainerRef = useRef(null)
  const { playClickSound, playHoverSound } = useSound()

  useEffect(() => {
    if (panelRef.current && previewContainerRef.current) {
      // 360-degree rotation effect on open
      const tl = gsap.timeline()
      
      // Initial rotation state - start rotated
      gsap.set(previewContainerRef.current, { 
        rotateY: 360, 
        opacity: 0,
      })
      
      // Panel slide in
      tl.fromTo(
        panelRef.current,
        { x: '100%', opacity: 0 },
        { x: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }
      )
      
      // 360-degree rotation with fade in
      tl.to(
        previewContainerRef.current,
        {
          rotateY: 0,
          opacity: 1,
          duration: 1.2,
          ease: 'power2.out',
        },
        '-=0.3'
      )
    }
  }, [])

  const environments = [
    { 
      id: 'default', 
      name: 'Default', 
      gradient: 'from-gray-900 to-black',
      envPreset: 'sunset',
      bgColor: '#0f172a',
      lightColor: '#ffffff'
    },
    { 
      id: 'forest', 
      name: 'Forest', 
      gradient: 'from-green-900 to-emerald-900',
      envPreset: 'forest',
      bgColor: '#064e3b',
      lightColor: '#22c55e'
    },
    { 
      id: 'fire', 
      name: 'Fire', 
      gradient: 'from-orange-900 to-red-900',
      envPreset: 'sunset',
      bgColor: '#7c2d12',
      lightColor: '#f97316'
    },
    { 
      id: 'water', 
      name: 'Water', 
      gradient: 'from-blue-900 to-cyan-900',
      envPreset: 'dawn',
      bgColor: '#0c4a6e',
      lightColor: '#3b82f6'
    },
    { 
      id: 'neon', 
      name: 'Neon', 
      gradient: 'from-purple-900 via-pink-900 to-cyan-900',
      envPreset: 'night',
      bgColor: '#581c87',
      lightColor: '#a855f7'
    },
  ]

  const lightingModes = [
    { id: 'sunset', name: 'Sunset', icon: '🌅', intensity: 1.2, color: '#f97316' },
    { id: 'night', name: 'Night', icon: '🌙', intensity: 0.6, color: '#6366f1' },
    { id: 'day', name: 'Day', icon: '☀️', intensity: 1.8, color: '#fbbf24' },
    { id: 'studio', name: 'Studio', icon: '💡', intensity: 2.0, color: '#ffffff' },
  ]

  const currentEnv = environments.find(e => e.id === variants.environment) || environments[0]
  const currentLight = lightingModes.find(l => l.id === variants.lighting) || lightingModes[0]

  const handleVariantChange = (key, value) => {
    playClickSound()
    setVariants((prev) => {
      const newVariants = { ...prev, [key]: value }
      
      // Emit event for parent to update 3D scene
      if (window.dispatchEvent) {
        window.dispatchEvent(
          new CustomEvent('pokemonCustomize', {
            detail: { pokemon, variants: newVariants },
          })
        )
      }
      
      return newVariants
    })
    
    // Add rotation animation when changing variants
    if (previewContainerRef.current) {
      const currentRotation = gsap.getProperty(previewContainerRef.current, 'rotateY') || 0
      gsap.to(previewContainerRef.current, {
        rotateY: currentRotation + 360,
        duration: 0.8,
        ease: 'power2.inOut',
      })
    }
  }

  const handleClose = () => {
    gsap.to(panelRef.current, {
      x: '100%',
      opacity: 0,
      duration: 0.3,
      ease: 'power3.in',
      onComplete: onClose,
    })
  }

  if (!pokemon) return null

  return (
    <div
      ref={panelRef}
      className="fixed top-0 right-0 h-full w-full md:w-96 bg-black/95 backdrop-blur-xl border-l border-white/10 z-50 overflow-y-auto"
      style={{
        background: `linear-gradient(135deg, ${currentEnv.bgColor}20 0%, #000000 100%)`,
      }}
    >
      {/* Header */}
      <div className="sticky top-0 bg-black/80 backdrop-blur-md border-b border-white/10 p-6 flex items-center justify-between z-10">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Customize
        </h2>
        <button
          onClick={handleClose}
          onMouseEnter={playHoverSound}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-6 space-y-8">
        {/* 3D Preview with 360 rotation */}
        <div className="relative h-64 w-full rounded-2xl overflow-hidden border-2 border-purple-500/30 bg-gradient-to-br from-black/50 to-purple-900/20">
          <div 
            ref={previewContainerRef}
            className="w-full h-full"
            style={{ 
              transformStyle: 'preserve-3d',
              perspective: '1000px'
            }}
          >
            <Canvas shadows camera={{ position: [0, 0, 5], fov: 50 }}>
              <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />
              <SceneManager enableFog={true}>
                {/* Dynamic Lighting based on mode */}
                <ambientLight intensity={currentLight.intensity * 0.3} color={currentLight.color} />
                <directionalLight 
                  position={[5, 5, 5]} 
                  intensity={currentLight.intensity}
                  color={currentLight.color}
                  castShadow
                />
                <pointLight 
                  position={[-5, -5, -5]} 
                  intensity={currentLight.intensity * 0.4} 
                  color={currentEnv.lightColor}
                />
                <pointLight 
                  position={[5, -5, 5]} 
                  intensity={currentLight.intensity * 0.4} 
                  color={currentEnv.lightColor}
                />
                
                {/* Pokemon 3D Model */}
                <Pokemon3D
                  name={pokemon.name}
                  position={[0, 0, 0]}
                  scale={1.5}
                  variant={variants.shiny ? 'shiny' : 'normal'}
                />
                
                {/* Environment */}
                <Environment preset={currentEnv.envPreset} />
                
                <OrbitControls 
                  enableZoom={true}
                  enablePan={false}
                  autoRotate={true}
                  autoRotateSpeed={1}
                  minDistance={3}
                  maxDistance={8}
                />
              </SceneManager>
            </Canvas>
          </div>
          
          {/* Preview Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-purple-300">3D Preview</span>
              <span className="text-gray-400">Drag to rotate</span>
            </div>
          </div>
        </div>

        {/* Pokémon Info */}
        <div className="text-center">
          <h3 className="text-3xl font-bold mb-2 capitalize">{pokemon.name}</h3>
          <span className="text-gray-400">#{pokemon.id}</span>
        </div>

        {/* Shiny Mode / Variant */}
        <div>
          <label className="block text-sm font-semibold mb-4 text-gray-300">
            Variant
          </label>
          <button
            onClick={() => handleVariantChange('shiny', !variants.shiny)}
            onMouseEnter={playHoverSound}
            className={`w-full p-4 rounded-xl border-2 transition-all duration-300 ${
              variants.shiny
                ? 'border-yellow-400 bg-yellow-400/20 shadow-lg shadow-yellow-400/30'
                : 'border-white/20 hover:border-yellow-400/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">✨ Shiny Mode</span>
              <div
                className={`w-12 h-6 rounded-full transition-colors ${
                  variants.shiny ? 'bg-yellow-400' : 'bg-gray-600'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-transform duration-300 ${
                    variants.shiny ? 'translate-x-6' : 'translate-x-0.5'
                  } mt-0.5`}
                />
              </div>
            </div>
          </button>
        </div>

        {/* Environment */}
        <div>
          <label className="block text-sm font-semibold mb-4 text-gray-300">
            Environment
          </label>
          <div className="grid grid-cols-2 gap-3">
            {environments.map((env) => (
              <button
                key={env.id}
                onClick={() => handleVariantChange('environment', env.id)}
                onMouseEnter={playHoverSound}
                className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                  variants.environment === env.id
                    ? 'border-purple-400 bg-purple-400/20 scale-105 shadow-lg shadow-purple-400/30'
                    : 'border-white/20 hover:border-purple-400/50 hover:scale-102'
                }`}
              >
                <div className={`h-16 rounded-lg bg-gradient-to-br ${env.gradient} mb-2 transition-all`} />
                <span className="text-sm font-semibold">{env.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Lighting Mood */}
        <div>
          <label className="block text-sm font-semibold mb-4 text-gray-300">
            Lighting Mood
          </label>
          <div className="grid grid-cols-4 gap-3">
            {lightingModes.map((light) => (
              <button
                key={light.id}
                onClick={() => handleVariantChange('lighting', light.id)}
                onMouseEnter={playHoverSound}
                className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                  variants.lighting === light.id
                    ? 'border-purple-400 bg-purple-400/20 scale-105 shadow-lg shadow-purple-400/30'
                    : 'border-white/20 hover:border-purple-400/50 hover:scale-102'
                }`}
              >
                <div className="text-3xl mb-2 transition-transform hover:scale-110">
                  {light.icon}
                </div>
                <span className="text-xs font-semibold">{light.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Color Shift Slider */}
        <div>
          <label className="block text-sm font-semibold mb-4 text-gray-300">
            Color Shift: {variants.colorShift > 0 ? `+${variants.colorShift}` : variants.colorShift}
          </label>
          <input
            type="range"
            min="-50"
            max="50"
            value={variants.colorShift}
            onChange={(e) => handleVariantChange('colorShift', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
            style={{
              background: `linear-gradient(to right, #6366f1 0%, #8b5cf6 50%, #f59e0b 100%)`
            }}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>Cool</span>
            <span>Neutral</span>
            <span>Warm</span>
          </div>
        </div>

        {/* Reset Button */}
        <button
          onClick={() => {
            playClickSound()
            setVariants({
              shiny: false,
              environment: 'default',
              lighting: 'sunset',
              colorShift: 0,
            })
            // Rotate on reset - double rotation for dramatic effect
            if (previewContainerRef.current) {
              const currentRotation = gsap.getProperty(previewContainerRef.current, 'rotateY') || 0
              gsap.to(previewContainerRef.current, {
                rotateY: currentRotation + 720,
                duration: 1,
                ease: 'power2.inOut',
              })
            }
          }}
          onMouseEnter={playHoverSound}
          className="w-full p-4 bg-gray-800 hover:bg-gray-700 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
        >
          Reset to Default
        </button>
      </div>
    </div>
  )
}

export default PokemonCustomizer
