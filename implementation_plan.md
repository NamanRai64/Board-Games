# AI Games Implementation Plan

This plan outlines the steps and architecture for building the `ai-games` React application.

## 1. Project Initialization & Theming
- **Setup**: Create a new Vite+React project named `ai-games`.
- **Styling**: Configure `src/index.css` with a Dark Retro-Tech theme.
  - Import the *Syne* font from Google Fonts.
  - Set up CSS variables for glowing terminal colors (neon green, cyan, amber, stark black background).
  - Add standard reset and styling rules for retro UI elements (glassmorphism / terminal aesthetic).

## 2. Core Architecture (`src/components.js`)
- **`topNRandom(scoredMoves, n = 5)`**: A utility function that takes an array of `{ move, score }`, sorts them by score descending, slices the top N elements, and returns one randomly.
- **`AgentStats` & `AgentLogPanel`**: Reusable UI components that display the scored moves, the randomly chosen move from the top 5, and Step / Auto-Solve buttons.
- **`GameContainer` / `StatusBanner`**: Standardized layouts for rendering individual games, including win/lose/thinking states.

## 3. Game Implementations (`src/games/`)
All games will support a manual mode (labeled 2-Player or Manual Game) and an automated Agent Mode.

### A. Tic-Tac-Toe (`TicTacToe.js`)
- **Board**: Standard 3x3 grid.
- **Agent Logic**: Uses a Minimax algorithm to score every empty cell. The move array is grouped to pick randomly from the up to 5 best options.

### B. 8-Puzzle (`EightPuzzle.js`)
- **Board**: 3x3 grid with sliding tiles.
- **Agent Logic**: Evaluates up to 4 possible adjacent moves using the reduction in Manhattan distance. The agent selects randomly from these moves based on their heuristic score.

### C. N-Queens (`NQueens.js`)
- **Board**: NxN chessboard.
- **Agent Logic**: Backtracking approach step-by-step. Scores valid columns in the current row based on how many valid future options are preserved in the next row, picking from the top 5 valid placement options.
- **Modes**: Agent Mode and Manual Mode (with Hint System). The Hint system uses the agent logic to suggest a move.

### D. Wumpus World (`Wumpus.js`)
- **Board**: 4x4 grid containing Wumpus, Gold, Pits, Stench, Breeze.
- **Agent Logic**: A reactive/heuristic agent. It scores the 4 adjacent directions:
  - Unvisited: +50
  - Potential Pit: -1000
  - Stench (Potential Wumpus): -20
  - Visited: -1
  - Picks from the best valid moves.
- **Modes**: Agent Mode and Manual Mode (with Hint System). The Hint system uses the agent logic to suggest a safe move.

### E. Map Coloring (`MapColoring.js`)
- **Board**: A predefined set of nodes (e.g., states on a mini map) with edges.
- **Agent Logic**: Uses the Least Constraining Value (LCV) heuristic. When assigning a color to a node, it scores the valid colors based on how many options remain for adjacent nodes. It randomly selects from the top up to 5 best colors.

## 4. Main Application (`src/App.js`)
- **Navigation Hub**: A sticky header with a stylized "AI Arcade" title and tabs/buttons to navigate between the 5 games.
- **State Management**: Mounts and unmounts the appropriately selected game component, handling global transitions cleanly.

## User Review Required

> [!CAUTION]
> Wumpus World, 8-Puzzle, and N-Queens are single-agent simulation games.
> The requirement mentioned "2 player mode — players alternate turns". 
> I will implement "2 player mode" literally for Tic-Tac-Toe and Map Coloring (where players can take turns making moves), and for the puzzles, it will be a "Manual" vs "Agent" mode. 

Please confirm this plan.
