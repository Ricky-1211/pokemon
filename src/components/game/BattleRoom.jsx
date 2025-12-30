import { useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Text } from '@react-three/drei'
import { gsap } from 'gsap'
import SceneManager from '../../three/SceneManager'
import CameraController from '../../three/CameraController'
import Pokemon3D from '../three/Pokemon3D'
import useSound from '../../hooks/useSound'
import { 
  fetchPokemonDetails, 
  getRandomMove, 
  getMovesForPokemon, 
  getTypeEffectiveness, 
  calculateHP, 
  calculateStat,
  getTypeColor 
} from '../../utils/pokeapi'

const BattleRoom = ({ onBackToLobby, playerPokemon: propPlayerPokemon, enemyPokemon: propEnemyPokemon }) => {
  const sectionRef = useRef(null)
  const titleRef = useRef(null)
  const playerPokemonRef = useRef(null)
  const enemyPokemonRef = useRef(null)
  const battleAreaRef = useRef(null)
  const damageTextRef = useRef(null)
  const [playerPokemon, setPlayerPokemon] = useState(null)
  const [enemyPokemon, setEnemyPokemon] = useState(null)
  const [playerHP, setPlayerHP] = useState(100)
  const [playerMaxHP, setPlayerMaxHP] = useState(100)
  const [enemyHP, setEnemyHP] = useState(100)
  const [enemyMaxHP, setEnemyMaxHP] = useState(100)
  const [battleLog, setBattleLog] = useState([])
  const [isPlayerTurn, setIsPlayerTurn] = useState(true)
  const [isAttacking, setIsAttacking] = useState(false)
  const [winner, setWinner] = useState(null)
  const [playerMoves, setPlayerMoves] = useState([])
  const [lastDamage, setLastDamage] = useState(null)
  const [effectivenessMessage, setEffectivenessMessage] = useState(null)
  const { playClickSound, playAttackSound, playVictorySound, playDamageSound } = useSound()

  // Load Pokémon from props or fallback to defaults
  useEffect(() => {
    const loadBattlePokemon = async () => {
      try {
        let player, enemy
        
        if (propPlayerPokemon && propEnemyPokemon) {
          // Use provided Pokémon (ensure we have full details)
          player = propPlayerPokemon.id ? propPlayerPokemon : await fetchPokemonDetails(propPlayerPokemon.id || 25)
          enemy = propEnemyPokemon.id ? propEnemyPokemon : await fetchPokemonDetails(propEnemyPokemon.id || 6)
        } else {
          // Fallback to default Pokémon
          player = await fetchPokemonDetails(25) // Pikachu
          enemy = await fetchPokemonDetails(6) // Charizard
        }
        
        // Calculate HP based on base stats
        const playerBaseHP = player.stats?.find(s => s.name === 'hp')?.value || 50
        const enemyBaseHP = enemy.stats?.find(s => s.name === 'hp')?.value || 50
        const playerHPValue = calculateHP(playerBaseHP, 50)
        const enemyHPValue = calculateHP(enemyBaseHP, 50)
        
        setPlayerMaxHP(playerHPValue)
        setPlayerHP(playerHPValue)
        setEnemyMaxHP(enemyHPValue)
        setEnemyHP(enemyHPValue)
        
        // Set Pokémon with calculated HP
        setPlayerPokemon({ ...player, hp: playerHPValue, maxHP: playerHPValue })
        setEnemyPokemon({ ...enemy, hp: enemyHPValue, maxHP: enemyHPValue })
        
        // Get moves for player's Pokémon
        const moves = getMovesForPokemon(player)
        setPlayerMoves(moves)
      } catch (error) {
        console.error('Error loading battle Pokémon:', error)
      }
    }
    loadBattlePokemon()
  }, [propPlayerPokemon, propEnemyPokemon])

  useEffect(() => {
    if (!playerPokemon || !enemyPokemon) return
    if (!playerPokemonRef.current || !enemyPokemonRef.current) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      tl.fromTo(
        sectionRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.5 }
      )
        .fromTo(
          titleRef.current,
          { opacity: 0, y: -50, scale: 0.8 },
          { opacity: 1, y: 0, scale: 1, duration: 1 },
          '-=0.3'
        )
        .fromTo(
          playerPokemonRef.current,
          { opacity: 0, x: -100, scale: 0.5 },
          { opacity: 1, x: -3, scale: 1.5, duration: 1.2, ease: 'back.out(1.7)' },
          '-=0.5'
        )
        .fromTo(
          enemyPokemonRef.current,
          { opacity: 0, x: 100, scale: 0.5 },
          { opacity: 1, x: 3, scale: 1.5, duration: 1.2, ease: 'back.out(1.7)' },
          '-=0.8'
        )
        .call(() => {
          addBattleLog(`${playerPokemon.name.toUpperCase()} vs ${enemyPokemon.name.toUpperCase()}! Battle Start!`)
        })
    }, sectionRef)

    return () => ctx.revert()
  }, [playerPokemon, enemyPokemon])

  const addBattleLog = (message) => {
    setBattleLog(prev => [...prev.slice(-9), message])
  }

  // Calculate damage with type effectiveness, stats, and critical hits
  const calculateDamage = (attacker, defender, move) => {
    const movePower = move.power || 40
    const moveType = move.type || 'normal'
    
    // Get attacker's attack stat
    const attackStat = attacker.stats?.find(s => s.name === 'attack')?.value || 50
    const calculatedAttack = calculateStat(attackStat, 50)
    
    // Get defender's defense stat
    const defenseStat = defender.stats?.find(s => s.name === 'defense')?.value || 50
    const calculatedDefense = calculateStat(defenseStat, 50)
    
    // Calculate base damage
    let damage = Math.floor((((2 * 50 / 5 + 2) * movePower * calculatedAttack / calculatedDefense) / 50) + 2)
    
    // Apply type effectiveness
    const effectiveness = getTypeEffectiveness(moveType, defender.types || [])
    damage = Math.floor(damage * effectiveness)
    
    // Critical hit chance (6.25%)
    const isCritical = Math.random() < 0.0625
    if (isCritical) {
      damage = Math.floor(damage * 1.5)
    }
    
    // Random factor (0.85 to 1.0)
    const randomFactor = 0.85 + Math.random() * 0.15
    damage = Math.floor(damage * randomFactor)
    
    // Ensure minimum damage of 1
    damage = Math.max(1, damage)
    
    return { damage, isCritical, effectiveness }
  }

  const playerAttack = async (move) => {
    if (!isPlayerTurn || isAttacking || winner || !move) return
    
    setIsAttacking(true)
    setEffectivenessMessage(null)
    
    // Check accuracy
    const accuracy = move.accuracy || 100
    const hitCheck = Math.random() * 100
    
    if (hitCheck > accuracy) {
      addBattleLog(`${playerPokemon.name}'s ${move.name} missed!`)
      setIsPlayerTurn(false)
      setIsAttacking(false)
      setTimeout(() => {
        enemyAttack()
      }, 1500)
      return
    }
    
    // Visual attack animation
    await animateAttack('player', move)
    
    // Calculate damage
    const { damage, isCritical, effectiveness } = calculateDamage(playerPokemon, enemyPokemon, move)
    const newEnemyHP = Math.max(0, enemyHP - damage)
    setEnemyHP(newEnemyHP)
    
    // Update enemy Pokémon HP
    setEnemyPokemon(prev => ({ ...prev, hp: newEnemyHP }))
    
    // Show damage text
    setLastDamage({ amount: damage, position: 'enemy', isCritical })
    
    // Build damage message
    let damageMessage = `${playerPokemon.name} used ${move.name}!`
    if (isCritical) {
      damageMessage += ' A critical hit!'
    }
    
    // Effectiveness message
    let effMessage = ''
    if (effectiveness >= 2) {
      effMessage = "It's super effective!"
      setEffectivenessMessage({ type: 'super', message: effMessage })
    } else if (effectiveness <= 0.5 && effectiveness > 0) {
      effMessage = "It's not very effective..."
      setEffectivenessMessage({ type: 'weak', message: effMessage })
    } else if (effectiveness === 0) {
      effMessage = "It doesn't affect the target!"
      setEffectivenessMessage({ type: 'immune', message: effMessage })
    }
    
    addBattleLog(`${damageMessage} (${damage} damage) ${effMessage}`)
    
    // Check if enemy fainted
    if (newEnemyHP <= 0) {
      setWinner('player')
      addBattleLog(`${enemyPokemon.name} fainted! ${playerPokemon.name.toUpperCase()} wins!`)
      playVictorySound()
      victoryAnimation('player')
      setIsAttacking(false)
      return
    }
    
    // Enemy's turn after a delay
    setIsPlayerTurn(false)
    setIsAttacking(false)
    
    setTimeout(() => {
      enemyAttack()
    }, 2000)
  }

  const enemyAttack = async () => {
    // Select a random move from enemy's moveset
    const enemyMoves = getMovesForPokemon(enemyPokemon)
    const attackMove = enemyMoves[Math.floor(Math.random() * enemyMoves.length)]
    
    // Check accuracy
    const accuracy = attackMove.accuracy || 100
    const hitCheck = Math.random() * 100
    
    if (hitCheck > accuracy) {
      addBattleLog(`${enemyPokemon.name}'s ${attackMove.name} missed!`)
      setIsPlayerTurn(true)
      setIsAttacking(false)
      return
    }
    
    // Visual attack animation
    await animateAttack('enemy', attackMove)
    
    // Calculate damage
    const { damage, isCritical, effectiveness } = calculateDamage(enemyPokemon, playerPokemon, attackMove)
    const newPlayerHP = Math.max(0, playerHP - damage)
    setPlayerHP(newPlayerHP)
    
    // Update player Pokémon HP
    setPlayerPokemon(prev => ({ ...prev, hp: newPlayerHP }))
    
    // Show damage text
    setLastDamage({ amount: damage, position: 'player', isCritical })
    
    // Build damage message
    let damageMessage = `${enemyPokemon.name} used ${attackMove.name}!`
    if (isCritical) {
      damageMessage += ' A critical hit!'
    }
    
    // Effectiveness message
    let effMessage = ''
    if (effectiveness >= 2) {
      effMessage = "It's super effective!"
      setEffectivenessMessage({ type: 'super', message: effMessage })
    } else if (effectiveness <= 0.5 && effectiveness > 0) {
      effMessage = "It's not very effective..."
      setEffectivenessMessage({ type: 'weak', message: effMessage })
    } else if (effectiveness === 0) {
      effMessage = "It doesn't affect the target!"
      setEffectivenessMessage({ type: 'immune', message: effMessage })
    }
    
    addBattleLog(`${damageMessage} (${damage} damage) ${effMessage}`)
    
    // Check if player fainted
    if (newPlayerHP <= 0) {
      setWinner('enemy')
      addBattleLog(`${playerPokemon.name} fainted! ${enemyPokemon.name.toUpperCase()} wins!`)
      victoryAnimation('enemy')
      setIsAttacking(false)
      return
    }
    
    // Back to player's turn
    setIsPlayerTurn(true)
    setIsAttacking(false)
  }

  const animateAttack = (attacker, move) => {
    return new Promise((resolve) => {
      playAttackSound()
      
      const target = attacker === 'player' ? enemyPokemonRef : playerPokemonRef
      const attackerRef = attacker === 'player' ? playerPokemonRef : enemyPokemonRef
      const direction = attacker === 'player' ? 1 : -1
      
      const tl = gsap.timeline({
        onComplete: () => {
          setLastDamage(null)
          setEffectivenessMessage(null)
          resolve()
        }
      })
      
      // Attacker moves forward
      tl.to(attackerRef.current.position, {
        x: `+=${direction * 1.5}`,
        duration: 0.2,
        ease: 'power2.out'
      })
      .to(target.current.scale, {
        x: 1.2,
        y: 1.2,
        z: 1.2,
        duration: 0.1,
        ease: 'power2.in',
        onStart: () => playDamageSound()
      })
      .to(target.current.scale, {
        x: 1.5,
        y: 1.5,
        z: 1.5,
        duration: 0.1,
        ease: 'power2.out'
      })
      .to(attackerRef.current.position, {
        x: attacker === 'player' ? -3 : 3,
        duration: 0.3,
        ease: 'back.out(1.7)'
      }, '-=0.1')
    })
  }

  const victoryAnimation = (winner) => {
    const winnerRef = winner === 'player' ? playerPokemonRef : enemyPokemonRef
    
    gsap.timeline()
      .to(winnerRef.current.scale, {
        x: 2,
        y: 2,
        z: 2,
        duration: 0.5,
        ease: 'elastic.out(1, 0.5)'
      })
      .to(winnerRef.current.rotation, {
        y: Math.PI * 2,
        duration: 1,
        ease: 'power2.out'
      })
  }

  const resetBattle = () => {
    setPlayerHP(playerMaxHP)
    setEnemyHP(enemyMaxHP)
    setPlayerPokemon(prev => ({ ...prev, hp: playerMaxHP }))
    setEnemyPokemon(prev => ({ ...prev, hp: enemyMaxHP }))
    setBattleLog([])
    setIsPlayerTurn(true)
    setIsAttacking(false)
    setWinner(null)
    setLastDamage(null)
    setEffectivenessMessage(null)
    
    // Reset positions
    if (playerPokemonRef.current && enemyPokemonRef.current) {
      gsap.to(playerPokemonRef.current.position, { x: -3, duration: 0.5 })
      gsap.to(enemyPokemonRef.current.position, { x: 3, duration: 0.5 })
      gsap.to(playerPokemonRef.current.scale, { x: 1.5, y: 1.5, z: 1.5, duration: 0.5 })
      gsap.to(enemyPokemonRef.current.scale, { x: 1.5, y: 1.5, z: 1.5, duration: 0.5 })
    }
    
    addBattleLog('Battle reset!')
  }

  const handleBack = () => {
    playClickSound()
    const tl = gsap.timeline({
      onComplete: () => {
        if (onBackToLobby) onBackToLobby()
      },
    })

    tl.to(sectionRef.current, {
      opacity: 0,
      scale: 0.95,
      duration: 0.4,
      ease: 'power2.in',
    })
  }

  // Get move button color based on type
  const getMoveButtonColor = (moveType) => {
    const typeColors = {
      fire: 'from-red-500 to-orange-500',
      water: 'from-blue-500 to-cyan-500',
      grass: 'from-green-500 to-emerald-500',
      electric: 'from-yellow-500 to-amber-500',
      psychic: 'from-pink-500 to-purple-500',
      ice: 'from-cyan-400 to-blue-400',
      dragon: 'from-purple-600 to-indigo-600',
      normal: 'from-gray-500 to-gray-600',
      fighting: 'from-red-700 to-red-800',
      flying: 'from-indigo-400 to-purple-400',
      poison: 'from-purple-500 to-fuchsia-500',
      ground: 'from-amber-700 to-yellow-700',
      rock: 'from-stone-600 to-gray-600',
      bug: 'from-green-600 to-lime-600',
      ghost: 'from-purple-800 to-indigo-800',
      steel: 'from-gray-400 to-slate-400',
      dark: 'from-gray-800 to-black',
      fairy: 'from-pink-400 to-rose-400',
    }
    return typeColors[moveType] || 'from-gray-500 to-gray-600'
  }

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen w-full overflow-hidden"
    >
      {/* Enhanced Battle arena background */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-950/60 via-orange-950/50 via-yellow-950/50 to-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(239,68,68,0.3),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(251,146,60,0.3),transparent_60%)]" />
        
        {/* Animated battle arena ground */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-yellow-900/40 to-transparent">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(251,191,36,0.1),transparent)] animate-pulse" />
        </div>
      </div>

      {/* 3D Battle Scene */}
      <div className="absolute inset-0 z-0">
        <Canvas>
          <PerspectiveCamera makeDefault position={[0, 2, 10]} fov={50} />
          <SceneManager enableFog={true}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 10, 5]} intensity={1.5} />
            <pointLight position={[-5, 5, -5]} intensity={0.8} color="#ef4444" />
            <pointLight position={[5, 5, -5]} intensity={0.8} color="#f97316" />
            
            {/* HP Bars in 3D */}
            {playerPokemon && playerMaxHP > 0 && (
              <group position={[-3, 2.5, 0]}>
                <Text
                  position={[0, 0.3, 0]}
                  fontSize={0.3}
                  color="#ffffff"
                  anchorX="center"
                  anchorY="middle"
                >
                  {playerPokemon.name || 'Player'}
                </Text>
                <mesh position={[0, 0, 0]}>
                  <boxGeometry args={[3, 0.2, 0.1]} />
                  <meshBasicMaterial color="#4a5568" />
                </mesh>
                {playerHP > 0 && (
                  <mesh position={[-1.5 + Math.max(0, (playerHP/playerMaxHP)) * 1.5, 0, 0.05]}>
                    <boxGeometry args={[Math.max(0.01, (playerHP/playerMaxHP) * 3), 0.15, 0.1]} />
                    <meshBasicMaterial color={playerHP > playerMaxHP * 0.5 ? "#48bb78" : playerHP > playerMaxHP * 0.25 ? "#ed8936" : "#f56565"} />
                  </mesh>
                )}
              </group>
            )}

            {enemyPokemon && enemyMaxHP > 0 && (
              <group position={[3, 2.5, 0]}>
                <Text
                  position={[0, 0.3, 0]}
                  fontSize={0.3}
                  color="#ffffff"
                  anchorX="center"
                  anchorY="middle"
                >
                  {enemyPokemon.name || 'Enemy'}
                </Text>
                <mesh position={[0, 0, 0]}>
                  <boxGeometry args={[3, 0.2, 0.1]} />
                  <meshBasicMaterial color="#4a5568" />
                </mesh>
                {enemyHP > 0 && (
                  <mesh position={[-1.5 + Math.max(0, (enemyHP/enemyMaxHP)) * 1.5, 0, 0.05]}>
                    <boxGeometry args={[Math.max(0.01, (enemyHP/enemyMaxHP) * 3), 0.15, 0.1]} />
                    <meshBasicMaterial color={enemyHP > enemyMaxHP * 0.5 ? "#48bb78" : enemyHP > enemyMaxHP * 0.25 ? "#ed8936" : "#f56565"} />
                  </mesh>
                )}
              </group>
            )}
            
            {/* Damage Text Display */}
            {lastDamage && lastDamage.amount && (
              <Text
                position={lastDamage.position === 'player' ? [-3, 1, 0] : [3, 1, 0]}
                fontSize={0.4}
                color={lastDamage.isCritical ? "#ff0000" : "#ffffff"}
                anchorX="center"
                anchorY="middle"
              >
                -{lastDamage.amount}
              </Text>
            )}
            
            {/* Battle area container */}
            <group ref={battleAreaRef}>
              {/* Player Pokémon (left side) */}
              {playerPokemon && (
                <group ref={playerPokemonRef} position={[-3, -1, 0]} scale={[1.5, 1.5, 1.5]}>
                  <Pokemon3D
                    name={playerPokemon.name || 'pikachu'}
                    position={[0, 0, 0]}
                    scale={1}
                    animateIdle={!isAttacking && !winner}
                  />
                </group>
              )}

              {/* Enemy Pokémon (right side) */}
              {enemyPokemon && (
                <group ref={enemyPokemonRef} position={[3, -1, 0]} scale={[1.5, 1.5, 1.5]}>
                  <Pokemon3D
                    name={enemyPokemon.name || 'charizard'}
                    position={[0, 0, 0]}
                    scale={1}
                    animateIdle={!isAttacking && !winner}
                  />
                </group>
              )}
            </group>

            <CameraController
              targetPosition={[0, 2, 10]}
              targetLookAt={[0, 0, 0]}
              enableMouseParallax={true}
              parallaxStrength={0.2}
            />
            <OrbitControls enableZoom={false} enablePan={false} />
          </SceneManager>
        </Canvas>
      </div>

      {/* Battle UI Overlay */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="pt-20 px-4 text-center">
          <h1
            ref={titleRef}
            className="text-5xl md:text-7xl font-black mb-4 bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent"
            style={{
              textShadow: '0 0 60px rgba(239, 68, 68, 0.5)',
              letterSpacing: '-0.03em',
            }}
          >
            {winner ? `${winner === 'player' ? playerPokemon?.name.toUpperCase() : enemyPokemon?.name.toUpperCase()} WINS!` : 'BATTLE ARENA'}
          </h1>
          
          {/* Effectiveness Message */}
          {effectivenessMessage && (
            <div className={`mt-4 px-6 py-2 rounded-full text-lg font-bold inline-block ${
              effectivenessMessage.type === 'super' ? 'bg-green-500/80 text-white' :
              effectivenessMessage.type === 'weak' ? 'bg-yellow-500/80 text-white' :
              'bg-gray-500/80 text-white'
            }`}>
              {effectivenessMessage.message}
            </div>
          )}
        </div>

        {/* Enhanced Battle Log */}
        <div className="mt-8 px-4 max-w-2xl mx-auto w-full">
          <div className="bg-black/60 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl">
            <h3 className="text-xl font-bold text-yellow-300 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
              Battle Log
            </h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {battleLog.map((log, index) => (
                <div key={index} className="text-white/90 text-sm animate-fadeIn font-medium">
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pokémon Info Cards with Enhanced HP Bars */}
        <div className="flex-1 flex flex-col md:flex-row justify-around items-center px-4 py-8 gap-8">
          {/* Player Pokémon Card */}
          <div className="relative w-full md:w-96 bg-gradient-to-br from-blue-900/70 to-blue-950/70 backdrop-blur-lg rounded-2xl p-6 border-2 border-blue-400/40 shadow-2xl">
            {playerPokemon && (
              <>
                <div className="text-center mb-4">
                  <h3 className="text-2xl font-bold text-blue-300 mb-2">{playerPokemon.name.toUpperCase()}</h3>
                  <p className="text-sm text-gray-300">Lv. 50 | #{playerPokemon.id}</p>
                </div>
                
                {/* Enhanced HP Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-white mb-2 font-semibold">
                    <span>HP</span>
                    <span>{playerHP}/{playerMaxHP}</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-4 overflow-hidden border border-gray-600">
                    <div 
                      className="h-full rounded-full transition-all duration-500 ease-out relative"
                      style={{ 
                        width: `${(playerHP/playerMaxHP) * 100}%`,
                        background: playerHP > playerMaxHP * 0.5 ? 'linear-gradient(90deg, #10b981, #34d399)' : 
                                  playerHP > playerMaxHP * 0.25 ? 'linear-gradient(90deg, #f59e0b, #fbbf24)' : 
                                  'linear-gradient(90deg, #ef4444, #f87171)'
                      }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 mt-1 text-center">
                    {Math.round((playerHP/playerMaxHP) * 100)}%
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                  {playerPokemon.types?.map((type) => (
                    <span
                      key={type}
                      className="px-3 py-1.5 rounded-full text-center text-white font-bold text-xs"
                      style={{ 
                        backgroundColor: getTypeColor(type) + '80',
                        border: `1px solid ${getTypeColor(type)}`
                      }}
                    >
                      {type.toUpperCase()}
                    </span>
                  ))}
                </div>
                
                {/* Enhanced Move Buttons */}
                {!winner && isPlayerTurn && !isAttacking && (
                  <div className="grid grid-cols-2 gap-3">
                    {playerMoves.map((move, index) => (
                      <button
                        key={index}
                        onClick={() => playerAttack(move)}
                        className={`px-4 py-3 bg-gradient-to-r ${getMoveButtonColor(move.type)} rounded-lg text-white font-bold transition-all hover:scale-105 hover:shadow-lg border-2 border-white/20 text-sm`}
                      >
                        <div className="font-bold">{move.name}</div>
                        <div className="text-xs opacity-80 mt-0.5">Pwr: {move.power} | Acc: {move.accuracy}%</div>
                      </button>
                    ))}
                  </div>
                )}
                {!isPlayerTurn && !winner && (
                  <div className="text-center py-4">
                    <div className="text-yellow-300 animate-pulse font-bold">
                      Waiting for enemy...
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* VS Divider with Enhanced Turn Indicator */}
          <div className="flex flex-col items-center gap-4">
            <div className="text-6xl md:text-8xl font-black text-red-400/90 drop-shadow-2xl animate-pulse">
              VS
            </div>
            {!winner && (
              <div className={`px-6 py-3 rounded-full backdrop-blur-md border-2 ${
                isPlayerTurn 
                  ? 'bg-blue-500/40 border-blue-400/60 shadow-lg shadow-blue-500/50' 
                  : 'bg-red-500/40 border-red-400/60 shadow-lg shadow-red-500/50'
              }`}>
                <span className="text-white font-bold text-lg">
                  {isPlayerTurn ? '⚡ Your Turn' : '⚔️ Enemy Turn'}
                </span>
              </div>
            )}
          </div>

          {/* Enemy Pokémon Card */}
          <div className="relative w-full md:w-96 bg-gradient-to-br from-red-900/70 to-red-950/70 backdrop-blur-lg rounded-2xl p-6 border-2 border-red-400/40 shadow-2xl">
            {enemyPokemon && (
              <>
                <div className="text-center mb-4">
                  <h3 className="text-2xl font-bold text-red-300 mb-2">{enemyPokemon.name.toUpperCase()}</h3>
                  <p className="text-sm text-gray-300">Lv. 50 | #{enemyPokemon.id}</p>
                </div>
                
                {/* Enhanced HP Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-white mb-2 font-semibold">
                    <span>HP</span>
                    <span>{enemyHP}/{enemyMaxHP}</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-4 overflow-hidden border border-gray-600">
                    <div 
                      className="h-full rounded-full transition-all duration-500 ease-out relative"
                      style={{ 
                        width: `${(enemyHP/enemyMaxHP) * 100}%`,
                        background: enemyHP > enemyMaxHP * 0.5 ? 'linear-gradient(90deg, #10b981, #34d399)' : 
                                  enemyHP > enemyMaxHP * 0.25 ? 'linear-gradient(90deg, #f59e0b, #fbbf24)' : 
                                  'linear-gradient(90deg, #ef4444, #f87171)'
                      }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 mt-1 text-center">
                    {Math.round((enemyHP/enemyMaxHP) * 100)}%
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {enemyPokemon.types?.map((type) => (
                    <span
                      key={type}
                      className="px-3 py-1.5 rounded-full text-center text-white font-bold text-xs"
                      style={{ 
                        backgroundColor: getTypeColor(type) + '80',
                        border: `1px solid ${getTypeColor(type)}`
                      }}
                    >
                      {type.toUpperCase()}
                    </span>
                  ))}
                </div>
                
                {/* Enemy Status */}
                {!isPlayerTurn && !winner && (
                  <div className="mt-4 text-center">
                    <div className="text-yellow-300 animate-pulse font-bold">
                      Enemy is thinking...
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Control Buttons */}
        <div className="pb-12 px-4 flex justify-center gap-4">
          {winner ? (
            <>
              <button
                onClick={resetBattle}
                className="group relative px-10 py-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full text-white font-bold text-lg hover:scale-110 transition-all duration-300 shadow-2xl hover:shadow-green-500/50"
              >
                Rematch
              </button>
              <button
                onClick={handleBack}
                className="group relative px-10 py-4 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 rounded-full text-white font-bold text-lg hover:scale-110 transition-all duration-300 shadow-2xl hover:shadow-red-500/50"
              >
                Back to Lobby
              </button>
            </>
          ) : (
            <button
              onClick={handleBack}
              className="group relative px-10 py-4 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 rounded-full text-white font-bold text-lg hover:scale-110 transition-all duration-300 shadow-2xl hover:shadow-red-500/50"
            >
              <span className="relative z-10 flex items-center gap-3">
                Back to Lobby
                <svg
                  className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          )}
        </div>
      </div>
    </section>
  )
}

export default BattleRoom
