# Roguelike Brick Breaker

A browser-based Brick Breaker game built with HTML, CSS, Bootstrap, and JavaScript.  
This project started as part of the Nucamp Web Development Bootcamp (JavaScript Portfolio Project).

---

## Overview

The goal is to build a roguelike version of the classic Brick Breaker arcade game.  
Players progress through procedurally generated levels, collect power-ups, and unlock persistent upgrades between runs.

This project is currently in development.  
The focus is on implementing the core game loop, paddle and ball mechanics, and an extendable structure for roguelike progression.

---

## Features

### Implemented
- Canvas-based rendering with a smooth animation loop (`requestAnimationFrame`)
- Paddle movement controlled by arrow keys and WASD
- Basic collision boundaries for the paddle
- Responsive Bootstrap 5 layout
- Modular JavaScript structure with clear separation of logic
- Ball physics with full paddle bounce logic and angle calculation.
- Brick collision with HP-based destruction.
- Score system based on brick.maxHp (higher HP bricks give more points).
- Procedural level generation using Tetris-like row patterns.
- Level scaling through increased brick HP and pattern cycling.
- HUD synchronized every frame (Score, Level, Lives).

### Planned
- Life system and proper Game Over handling
- Seeded procedural generation
- Power-up system
- Persistent meta-progression (currency, upgrades, relics)
- Procedural level generation using seeded random values
- Power-ups (expand paddle, extra life, etc.)
- Score tracking and increasing difficulty
- Roguelike meta-progression: upgrades, relics, and run persistence

### Scoring System
Bricks grant points based on their max HP:

    score += brick.maxHp * 10;

This ensures harder bricks are worth more points and contributes to the roguelike scaling.

### Procedural Level Generation
Levels keep a fixed number of rows, but each row uses a pattern selected from
a Tetris-like pattern list. Brick HP scales with level, rows add bonus HP,
and a small random chance increases individual brick HP.

This creates varied shapes without increasing row count.

---

## Project Structure

Brick-breaker/
│
├── index.html # Main HTML file (Bootstrap layout + canvas)
├── styles.css # Custom styles for the game
└── script.js # Game loop, Ball/Paddle/Brick classes, collisions, score, and level generation


### File Descriptions
- **index.html**  
  Contains the layout: canvas area, controls, score display, and pause/offcanvas menu.

- **styles.css**  
  Handles the dark theme, HUD styles, Bootstrap customizations, and color mapping for brick health.

- **script.js**  
  Implements the game loop (`initGame`, `update`, `draw`, `loop`), paddle movement, and future classes for game entities (Ball, Brick, PowerUp, LevelGen, PlayerStats).

---

## Current Controls

| Action | Keys |
|--------|------|
| Move Left | Arrow Left or A |
| Move Right | Arrow Right or D |
| Launch Ball | Space or button in UI |
| Next level | Button in UI
| Pause | Planned |

---

## Code Highlights

HUD (Score, Level, Lives) is refreshed each frame:

```js
    updateHud(); 
```

This ensures the UI reflects the live game state.


The game loop uses `requestAnimationFrame` for smooth 60 FPS updates:

```js
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}
```


