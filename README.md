# Platformer Quest: JSON-Driven Level Game

---

## Group Members

Nicole Wu | n9wu | 21085480

---

## Description

This is a 2D platformer game built with HTML5 Canvas and vanilla JavaScript that demonstrates object-oriented design, JSON-based data loading, and dynamic level progression.

**What the user sees:**

- A charming pixel-art inspired platformer with a sky-blue gradient background, parallax-scrolling clouds, and glowing visual effects
- A blue elliptical player character with drop shadow
- Five progressively difficult levels with platforms (static and moving), obstacles, collectible coins, and patrolling enemies
- A glowing green goal zone that advances to the next level
- A score tracker that rewards (+10 for coins, +5 for level completion) and penalizes (-1 for hits/falls)

**How they interact:**

- Arrow keys to move left/right
- Space or Up arrow to jump (with double-jump enabled)
- Navigate platforms, avoid red obstacles and enemies, collect yellow coins, reach the green goal
- Score increases on coin collection and level completion; resets deduct 1 point

**Design inspiration:**
This project showcases how JSON data structures enable scalable game development. Rather than hard-coding five levels, level definitions (platforms, obstacles, coins, enemies, moving platforms) are stored in a single JSON file, making it trivial to add or modify levels without touching game logic. Object-oriented design (Platform, Obstacle, Player, Enemy, Level, Game classes) separates concerns and makes the codebase maintainable and extensible.

---

## Interaction Instructions

### Getting Started

1. Open a terminal in the project folder
2. Run a local HTTP server:
   ```bash
   python -m http.server 8000
   ```
3. Open your browser to `http://localhost:8000`
4. The game loads with **Level 1**

### Controls

- **Move Left/Right:** Arrow keys (`←` / `→`)
- **Jump:** `Space` or `ArrowUp` (press twice for double-jump)
- **Complete Level:** Reach the glowing green box
- **Collect Coins:** Yellow circles grant +10 points
- **Avoid Hazards:** Red squares and dark enemies reset you to level start (-1 point); falling off the bottom also resets

### Visual & Audio Feedback

- **Coins:** Glow and emit particle burst when collected
- **Player:** Rounded ellipse with subtle drop shadow
- **Goal:** Pulsing green aura and rounded corners
- **Platforms:** Moving platforms shift color slightly (teal) and fade dynamically
- **HUD:** Top-left box shows current level and score; bottom center displays controls
- **Progression:** Auto-advances to next level on goal contact; final level shows "You beat all levels!"

---

## Assets

All assets are original and generated procedurally within the code:

- **Background & Clouds:** Procedural gradient and ellipse-based parallax clouds (original, created in JavaScript canvas API)
- **Player Character:** Rounded ellipse with shadow (original)
- **Platforms:** Colored rectangles with subtle highlight gradients (original)
- **Coins:** Radial gradient with shine highlight (original)
- **Enemies & Obstacles:** Solid rectangles (original)
- **Goal Zone:** Rounded rectangle with radial glow (original)
- **Particles:** Simple colored squares with physics (original)
- **Font:** Inter from Google Fonts (imported via CDN in `index.html`)

---

## References

[1] Mozilla Developer Network. (2024). "Canvas API - MDN Web Docs." Retrieved from https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API

[2] Mozilla Developer Network. (2024). "CanvasRenderingContext2D - MDN Web Docs." Retrieved from https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D

[3] Mozilla Developer Network. (2024). "Fetch API - MDN Web Docs." Retrieved from https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API

[4] Mozilla Developer Network. (2024). "JSON.parse() - MDN Web Docs." Retrieved from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse

[5] Google Fonts. (2024). "Inter Font Family." Retrieved from https://fonts.google.com/specimen/Inter

[6] W3C. (2024). "HTML Standard - Canvas Element." Retrieved from https://html.spec.whatwg.org/multipage/canvas.html
