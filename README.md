# Interactive Game Boy - Three.js Journey Challenge
![screenshot-for-post](https://github.com/Snokke/game-boy-challenge/assets/36459180/339a94c1-4a83-406e-9a56-829173cd136d)
🔥 **Live: [gameboy.andriibabintsev.com](https://gameboy.andriibabintsev.com/)**

This is my project for **Three.js Journey Challenge** - challenge by **Bruno Simon** ([threejs-journey.com](https://threejs-journey.com/)), where participants should create project in two weeks with main renderer library Three.js on a given theme. Theme of this challenge was **Game Boy**. And I was fortunate to have won this challenge: [Winners](https://threejs-journey.com/challenges/001-game-boy)🏆

My idea was to create an interactive Game Boy and from scratch create at least one game for it (without emulator).

All buttons of Game Boy are active, including the power switch on top and the volume controller at the side. You can also insert any of three cartridges into the Game Boy.
Making the model of the Game Boy was a challenge, but I'm happy with the final result of the model and the grainy texture.

## Games
![games](https://github.com/Snokke/game-boy-challenge/assets/36459180/c1cde4d1-63da-4899-844b-1cecd10edb91)
**Tetris** - this is not an emulator. I always wanted to try to create some classic game, so making Tetris was really fun and interesting. It's a full game with all the main logic (only Type-A game - endless game), all shapes, music, SFX, scores, and so on. Also there is one new shape - invisible shape (you can turn it off is control panel)

**Space Invaders** - this is also not an emulator. I tried to recreate legendary old classic Space Invaders. Invaders are coming, kill them all! 🛸

**Legend of Zelda** - give it a try, but I have a feeling that there is something wrong with the cartridge 👀

## Controls
- Arrows, WASD - D-pad
- Z, Space - A button
- X - B button
- Enter - START

Mouse Scroll - Zoom to the Game Boy. On mobile, tap on the screen to zoom in/out. After you rotate the Game Boy, you can reset the rotation by clicking on the background. Also, in Tetris, you can turn off the music by pressing SELECT.

## Technical details
- 3D engine: [Three.js](https://threejs.org/)
- 2D engine for games: [PixiJS](https://pixijs.com/)
- Control panel: [Tweakpane](https://cocopon.github.io/tweakpane/)
- Models are done with [Blender](https://www.blender.org/)

## Setup
Download [Node.js](https://nodejs.org/en/download). Run this followed commands:

```
# Install dependencies
npm install

# Run the local server at localhost:5173
npm start

# Build for production in the dist/ directory
npm run build
```

## Copyrights
Nintendo logo is trademark of Nintendo.
Tetris logo and Tetriminos are trademarks of Tetris Holding.
Space Invaders logo is trademark of Taito Corporation.
