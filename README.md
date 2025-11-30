Brick Slayer: Roguelike Brick breaker game

A browser-based roguelike Brick Breaker game built with HTML, CSS, Bootstrap, and JavaScript.
Originally created as the portfolio project for the Nucamp JavaScript course — now evolved into a fully-featured, deterministic roguelite arcade game.

Overview

This game reimagines the classic Brick Breaker arcade formula into a roguelike progression system.
Each run generates seeded level layouts, bricks have dynamic HP, the difficulty scales, and players can invest currency into permanent upgrades.

The project is now well beyond MVP level and includes:

Procedural levels

Seed-based determinism

Save/Load system

Main menu

Persistent upgrades

Off-canvas pause menu

Full HUD with live updates

Features
Implemented
Core Gameplay

Canvas-based rendering at 60 FPS using requestAnimationFrame

Paddle movement (Arrow Keys or A/D)

Full ball physics with bounce angles and speed clamping

Brick collision with variable HP and color-coded states

Score system based on brick difficulty

Launch button + Spacebar to begin ball movement

Dynamic difficulty scaling

Procedural Level Generator

Deterministic seeded generation using mulberry32

“Patterns” system (Simple / Mixed / Dense rows)

Brick HP scaling by:

Difficulty

Level number

Row bonus

Random per-brick HP increase

Fully repeatable runs based on seed input

Deterministic Seed System

Seed input field with “auto” mode

Displays current seed in HUD

All randomness replaced with PRNG (no Math.random)

Identical levels for identical seeds

Save / Load System

Saves run automatically at end of each cleared level

Continue Run button loads:

Seed

Level

Lives

Score

Difficulty

Clears run on Game Over

Abandon Run option available in Pause menu

Meta-Currency & Upgrades

Earn 10 × level currency for every cleared level

Two persistent upgrades:

Wider Paddle (start runs with a bigger paddle)

Extra Life (start runs with more lives)

Currency and upgrades stored in localStorage

Upgrades apply on New Run

Main Menu + UI

Main menu screen with:

New Run

Continue Run

Upgrades menu

Full HUD in game view:

Score

Level

Lives

Seed

Difficulty selector

Modal-based Upgrades UI

Modal Game Over screen

Off-canvas Pause Menu with:

Mouse control toggle

Reset Best Score

Abandon Run

Project Structure
Brick-breaker/
│
├── index.html      # Main layout + canvas + UI + menus
├── styles.css      # Dark theme, brick colors, layout polish
└── script.js       # Game logic, physics, PRNG, meta-progression

File Descriptions
index.html

Canvas container

Main menu

Offcanvas pause menu

Game Over modal

Upgrades modal

Controls legend

HUD elements (score, level, lives, current seed)

styles.css

Dark-themed aesthetic

Canvas frame styling

Responsive layout

HUD card visuals

Color mapping for brick HP

Menu & modal styling

script.js

Paddle / Ball / Brick classes

Collisions & physics

Procedural generation

Deterministic seeded RNG

Save/load logic

Meta-upgrades system

Main menu & screen switching

Key listeners & input control

Game loop (update, draw, loop)

Controls
Action	Keys / Buttons
Move Left	A / ←
Move Right	D / →
Launch Ball	Space / Launch button
Pause	Pause navbar button
Next Level	Button (appears after clearing level)
Abandon Run	Pause menu (offcanvas)
Scoring System

Bricks award points based on difficulty:

score += brick.maxHp * 10;


Harder bricks = more score.

Procedural Generation (Seed-based)

Every level uses:

A chosen pattern row

Difficulty multipliers

Row-based HP bonuses

Random per-brick HP variance

All randomness is driven by:

rng = mulberry32(seed);


So the entire run is 100% reproducible.

Roadmap
Completed

Main menu

Continue Run

Save/Load run persistence

Deterministic seeded levels

Difficulty selector

Meta-upgrades system

Pause menu + Abandon Run

UI/HUD polish

Full commit history with iterative development ✔

In Progress / Next Steps

UI polish for upgrades (animations, icons)

Disable Continue button when no save exists

Power-ups (slow ball, widen paddle temporarily, multi-ball)

Brick destruction particles

Light SFX

Achievements

Daily seed challenge

Deployment

This project can be deployed using GitHub Pages, Netlify, or Vercel.

Recommended:

Push repo to GitHub

Enable GitHub Pages (branch: main, folder /root)

Done — your game is online

Author

Erick V. Lozano
Brick Slayer – JavaScript Portfolio Project (Nucamp)