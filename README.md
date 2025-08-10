# LetterFall 🅻

A competitive falling-letter word puzzle game that combines the fast-paced action of Tetris with the strategic word-building of Wordle. Built as a Progressive Web App (PWA) with serverless peer-to-peer multiplayer.

## 🎮 Game Modes

- **Solo**: Endless gameplay with increasing difficulty and local high scores
- **Versus**: Real-time multiplayer battles using peer-to-peer WebRTC connections
- **Daily**: Fixed daily challenges with secret word bonuses

## ✨ Features

- 📱 **Mobile-First**: Optimized touch controls and responsive design
- 🌐 **No Servers**: Direct peer-to-peer multiplayer via WebRTC signaling
- 📴 **Offline Ready**: PWA with full offline support for solo and daily modes
- ⚡ **60fps Gameplay**: Canvas-based rendering for smooth performance
- 🔒 **Privacy Focused**: No data collection, tracking, or accounts required

## 🚀 Quick Start

### Development

```bash
npm install
npm run dev
```

### Build for Production

```bash
npm run build
```

### Deploy to GitHub Pages

1. Fork this repository
2. Enable GitHub Pages in repository settings
3. Set source to "GitHub Actions"
4. Push to main branch - automatic deployment will trigger

## 🎯 How to Play

### Basic Gameplay
- Letter-filled Tetris pieces fall from the top
- Rotate and position pieces to form words
- Words must be 3+ letters long (horizontal or vertical)
- Clear words to score points and trigger cascades

### Special Tiles
- **?** = Wildcard (resolves to any letter)
- **💣** = Bomb (clears 3×3 area on placement)

### Controls
- **Desktop**: Arrow keys to move, Up/Space to rotate, Enter to hard drop
- **Mobile**: Touch controls with swipe gestures and on-screen buttons

### Versus Mode
- Connect via QR codes (no servers needed!)
- Clear words to send junk rows to opponent
- Longer words = more attack power:
  - 3-4 letters → +1 junk row
  - 5-6 letters → +2 junk rows  
  - 7+ letters → +5 junk rows

## 🛠 Technical Architecture

### Stack
- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **State**: Zustand
- **Routing**: React Router (hash routing for GitHub Pages)
- **P2P**: WebRTC DataChannels with manual signaling
- **PWA**: Service Worker, Web App Manifest

### Game Engine
- **Rendering**: HTML5 Canvas 2D
- **Physics**: Custom collision detection and gravity system
- **RNG**: SplitMix64 for deterministic gameplay
- **Dictionary**: ~1000 word dictionary with trie-based lookups

### P2P Multiplayer
- Host generates WebRTC offer → compressed → QR code
- Guest scans QR → creates answer → shows QR back to host
- Direct DataChannel connection (no STUN/TURN servers)
- Deterministic gameplay with shared RNG seed
- Time-synchronized attack system

### PWA Features
- Installable on mobile/desktop
- Offline gameplay (Solo/Daily modes)
- Background sync ready
- Push notifications ready
- Responsive 192x192 and 512x512 icons

## 📱 Browser Support

- Chrome/Edge 88+
- Firefox 90+  
- Safari 14.5+
- Mobile browsers with WebRTC support

## 🔧 Configuration

### Vite Config
- Base path set to `/letterfall/` for GitHub Pages
- Hash router for client-side routing
- Service worker registration

### PWA Manifest
- Standalone display mode
- Portrait orientation lock
- Game category
- Maskable icons support

## 🧪 Testing

```bash
npm run test        # Unit tests
npm run test:e2e    # End-to-end tests  
npm run lighthouse  # PWA audit
```

## 📦 Build Output

- Static assets only - deployable to any static host
- Gzipped bundle ~200KB
- Service worker for offline caching
- All assets properly hashed for cache busting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally and run build
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🎊 Credits

- Game concept inspired by Tetris and Wordle
- Built with modern web technologies
- No external game engines or heavy dependencies
- Designed for maximum performance and accessibility

---

**Play now**: https://keiranholloway.github.io/letterfall/

**No downloads, no accounts, no servers - just pure word puzzle fun!**
