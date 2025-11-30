# Brick Slayer  
Roguelike Brick Breaker Game

Brick Slayer is a browser-based roguelike brick breaker game built with HTML, CSS, Bootstrap, and JavaScript.  
Originally created as a portfolio project for the Nucamp JavaScript course, it has evolved into a feature-complete, deterministic roguelite arcade experience.

## Overview

Brick Slayer reimagines the classic brick breaker formula by adding procedural generation, seeded runs, scalable difficulty, and permanent upgrades.  
Each run is deterministic based on a player-defined seed, and completed levels reward currency for long-term progression.

Current version includes:

- Procedural level layouts  
- Seed-based determinism  
- Save/Load system  
- Main menu and pause menu  
- Persistent upgrades  
- Full in-game HUD  
- Scalable difficulty and level progression  

## Features

### Core Gameplay

- Canvas rendering at 60 FPS using `requestAnimationFrame`
- Paddle movement with arrow keys or A/D
- Ball physics with bounce angles and speed clamping
- Brick collision detection with variable HP and color-coded states
- Score system based on brick difficulty
- Launch button and Spacebar support
- Difficulty scaling per level

### Procedural Level Generator

- Deterministic PRNG using `mulberry32`
- Level patterns divided into Simple, Mixed, Dense categories
- HP scaling influenced by:
  - Difficulty
  - Level number
  - Row index
  - Randomized HP variance  
- Identical level layouts for identical seeds

### Deterministic Seed System

- Seed input with automatic fallback  
- Seed displayed in HUD  
- All randomness replaced by PRNG  
- Fully reproducible runs  

### Save and Load System

- Automatic save when clearing a level  
- Continue Run restores:
  - Seed  
  - Level  
  - Score  
  - Lives  
  - Difficulty  
- Save file cleared on Game Over  
- Abandon Run option available in the pause menu  

### Meta-Currency & Upgrades

- Earn `10 × level` currency for each cleared level  
- Permanent upgrades:
  - Wider Paddle  
  - Extra Life  
- Stored in `localStorage`  
- Upgrades take effect on New Run  

## User Interface

### Main Menu

- New Run  
- Continue Run  
- Upgrades  

### In-Game HUD

- Score  
- Level  
- Lives  
- Current seed  
- Difficulty selector  

### Modals & Menus

- Upgrade modal  
- Game Over modal  
- Off-canvas pause menu with:
  - Mouse input toggle  
  - Best score reset  
  - Abandon Run  

## Project Structure

```
Brick-Slayer/
│
├── index.html      # Layout, canvas, UI, menus
├── styles.css      # Theme, layout, HUD, colors
└── script.js       # Game logic, physics, RNG, upgrades
```

## File Details

### index.html
Contains all main UI elements including canvas, main menu, pause menu, HUD, difficulty selector, upgrade modal, and Game Over modal.

### styles.css
Dark theme, canvas frame, brick HP colors, HUD styling, and responsive layout.

### script.js
Implements paddle, ball, brick classes, physics, procedural generation, deterministic RNG, save/load logic, upgrades, menu switching, and the game loop.

## Controls

| Action        | Keys / Buttons                       |
|---------------|--------------------------------------|
| Move Left     | A or ←                               |
| Move Right    | D or →                               |
| Launch Ball   | Space or Launch button               |
| Pause         | Pause button (navbar)                |
| Next Level    | Only appears after clearing level    |
| Abandon Run   | Pause menu                           |

## Scoring System

Bricks award points based on their maximum HP:

```javascript
score += brick.maxHp * 10;
```

## Procedural Generation Summary

Runs are fully deterministic using:

```javascript
rng = mulberry32(seed);
```

## Roadmap

### Completed
- Main menu  
- Continue Run  
- Save/Load persistence  
- Seed-based procedural levels  
- Difficulty selection  
- Permanent upgrades  
- Pause menu with Abandon Run  
- UI and HUD polish  
- Organized commit history  

### In Progress / Planned
- Improved upgrade UI  
- Disable Continue Run when no save exists  
- Power-ups  
- Brick destruction particles  
- Sound effects  
- Achievements  
- Daily seed challenge  

## Deployment

Recommended deployment via GitHub Pages:

1. Push project to GitHub  
2. Settings → Pages  
3. Select branch: `main`, folder: `/`  
4. Save and wait for build  

Your game becomes publicly accessible.

## Author

**Erick V. Lozano**  
Brick Slayer – Nucamp JavaScript Portfolio Project