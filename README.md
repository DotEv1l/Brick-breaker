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

### Planned
- Ball physics and brick collision detection
- Procedural level generation using seeded random values
- Power-ups (expand paddle, extra life, etc.)
- Score tracking and increasing difficulty
- Roguelike meta-progression: upgrades, relics, and run persistence

---

## Project Structure

Brick-breaker/
│
├── index.html # Main HTML file (Bootstrap layout + canvas)
├── styles.css # Custom styles for the game
└── script.js # Core game logic and classes


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
| Launch Ball | Space (to be implemented) |
| Pause | Button in UI or Space (planned) |

---

## Code Highlights

The game loop uses `requestAnimationFrame` for smooth 60 FPS updates:

```js
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

