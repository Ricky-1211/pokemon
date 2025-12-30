# 🏛️ Pokémon Digital Museum - Ultimate 2025 Experience

A **stunning, award-ready** Pokémon website that combines a virtual museum experience with cutting-edge 3D graphics, cinematic camera systems, and interactive features. Built with **Three.js**, **GSAP**, and **React** - perfect for portfolios, interviews, and Awwwards-type showcases.

![Pokémon Digital Museum](https://img.shields.io/badge/Pokémon-Digital%20Museum-red?style=for-the-badge&logo=pokemon)
![React](https://img.shields.io/badge/React-18.2-blue?style=for-the-badge&logo=react)
![Three.js](https://img.shields.io/badge/Three.js-0.158-black?style=for-the-badge&logo=three.js)

## ✨ Modern Features (2025 Ready)

### 🎬 Cinematic Camera System
- **Mouse Parallax** - Subtle camera movement following cursor
- **Scroll-Based Camera Paths** - Smooth cinematic transitions between sections
- **Dramatic Zoom** - Click Pokémon for impressive camera zooms
- **Smooth Lerping** - Professional camera movement with GSAP timelines

### 🎭 Pokémon Personality Animations
- **Idle State** - Breathing and floating animations
- **Hover Effects** - Eye blinks, glow effects, and scale transforms
- **Click Interactions** - Signature move poses with dramatic rotations
- **Scroll Reactive** - Pokémon respond to scroll speed and direction

### 🎨 Real-Time Pokémon Customizer
- **Shiny Mode Toggle** - Switch between normal and shiny variants
- **Environment Changes** - Forest, Fire, Water, Neon, and more
- **Lighting Modes** - Sunset, Night, Day, Studio lighting
- **Color Shift Control** - Real-time color manipulation

### 🤖 AI-Style Pokédex Assistant
- **Chat Interface** - Conversational AI-style interactions
- **Animated Responses** - Typewriter effect with stat visualizations
- **Pokémon Focus** - Ask about Pokémon and camera focuses on them
- **Interactive Stats** - Animated bar charts for Pokémon stats

### 🔊 Sound Design + Haptics
- **Hover Sounds** - Subtle audio feedback on interactions
- **Pokémon Cries** - Unique sounds based on Pokémon names
- **Scroll Bass Hits** - Low-frequency thumps on section changes
- **Haptic Feedback** - Vibration support for mobile devices

### 🏛️ Museum Architecture
- **Lobby** - Cinematic entrance with 3D Pokéball
- **Generation Rooms** - Explore Gen I, II, III with themed galleries
- **Legendary Vault** - Special chamber for rare Pokémon
- **Evolution Chamber** - Witness transformation journeys
- **Navigation System** - Smooth transitions between museum sections

## 🚀 Tech Stack

- **React 18** - Modern UI framework
- **Vite** - Lightning-fast build tool
- **Three.js** - 3D graphics engine
- **@react-three/fiber** - React renderer for Three.js
- **@react-three/drei** - Useful helpers and components
- **GSAP** - Professional animation library
- **Tailwind CSS** - Utility-first CSS framework
- **PokeAPI** - Pokémon data source

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd pokemon-3d
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   - The app will automatically open at `http://localhost:3678`

## 🏗️ Project Structure

```
pokemon-3d/
├── public/
├── src/
│   ├── components/
│   │   ├── museum/
│   │   │   ├── MuseumLobby.jsx          # Entrance lobby
│   │   │   ├── MuseumNavigation.jsx     # Top navigation
│   │   │   ├── GenerationRoom.jsx       # Gen I, II, III rooms
│   │   │   ├── LegendaryVault.jsx       # Legendary chamber
│   │   │   └── EvolutionChamber.jsx     # Evolution showcase
│   │   ├── three/
│   │   │   ├── Pokeball3D.jsx           # 3D Pokéball
│   │   │   └── Pokemon3D.jsx            # Enhanced Pokémon with animations
│   │   ├── customizer/
│   │   │   └── PokemonCustomizer.jsx    # Real-time customization panel
│   │   ├── pokedex/
│   │   │   └── PokedexAssistant.jsx     # AI-style chat assistant
│   │   └── [legacy components]
│   ├── three/
│   │   ├── SceneManager.js              # Scene state management
│   │   └── CameraController.js          # Cinematic camera system
│   ├── hooks/
│   │   └── useSound.js                  # Sound effects hook
│   ├── utils/
│   │   └── pokeapi.js                   # PokeAPI integration
│   ├── App.jsx                          # Main app with routing
│   ├── main.jsx                         # Entry point
│   └── index.css                        # Global styles
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## 🎯 Key Components

### SceneManager
Manages global Three.js scene state, lighting, and environment settings.

### CameraController
Cinematic camera system with:
- Mouse parallax effects
- Smooth position lerping
- Scroll-based camera paths
- Dramatic zoom animations

### Pokemon3D
Enhanced 3D Pokémon component with:
- Idle breathing animations
- Hover glow effects
- Click signature moves
- Scroll-reactive movements

### MuseumNavigation
Top navigation bar with:
- Smooth section transitions
- Active state indicators
- Mobile-responsive menu
- Sound feedback

### PokemonCustomizer
Real-time customization panel featuring:
- Shiny mode toggle
- Environment presets
- Lighting mood controls
- Color shift slider

### PokedexAssistant
AI-style chat interface with:
- Typewriter responses
- Stat visualizations
- Pokémon focus triggers
- Smooth animations

## 🎨 Customization

### Modify Camera Parallax Strength
Edit `src/three/CameraController.js`:
```javascript
parallaxStrength={0.5} // Increase for more parallax
```

### Change Museum Sections
Edit `src/App.jsx`:
```javascript
const museumSections = [
  { id: 'lobby', name: 'Lobby' },
  // Add your custom sections
]
```

### Adjust Sound Effects
Edit `src/hooks/useSound.js`:
```javascript
const playHoverSound = useCallback(() => {
  playTone(800, 0.05, 'sine') // Frequency, duration, type
}, [playTone])
```

### Customize Colors
Edit `tailwind.config.js` to modify type colors and theme.

## 🎬 Usage Guide

1. **Enter Museum** - Start in the lobby, click "Enter Museum"
2. **Navigate** - Use the top navigation to explore sections
3. **Interact** - Click Pokémon cards to open customizer
4. **Chat** - Use Pokédex Assistant (bottom right) to ask questions
5. **Customize** - Modify Pokémon appearance in real-time
6. **Explore** - Scroll through sections for cinematic camera movements

## 🏆 Portfolio Features

This project showcases:
- ✅ Advanced Three.js implementation
- ✅ Cinematic camera systems
- ✅ GSAP ScrollTrigger mastery
- ✅ React state management
- ✅ Modern UI/UX design
- ✅ Sound design integration
- ✅ Responsive design
- ✅ Performance optimization

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🔮 Future Enhancements

- [ ] GLTF Pokémon model integration
- [ ] Real-time multiplayer features
- [ ] Advanced shader effects
- [ ] Particle systems
- [ ] AR/VR support
- [ ] Real AI integration for Pokédex

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- **PokeAPI** - For providing comprehensive Pokémon data
- **Three.js** - For the amazing 3D library
- **GSAP** - For professional animations
- **Pokémon Company** - For creating the amazing Pokémon universe

---

**Built with ❤️ for the Pokémon community**

*This is an educational project showcasing modern web development techniques.*
