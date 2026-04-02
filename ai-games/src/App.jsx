import React, { useState } from 'react';
import TicTacToe from './games/TicTacToe';
import EightPuzzle from './games/EightPuzzle';
import NQueens from './games/NQueens';
import Wumpus from './games/Wumpus';
import MapColoring from './games/MapColoring';

function App() {
  const [activeGame, setActiveGame] = useState(null);

  const games = [
    { id: 'tictactoe', name: 'Tic-Tac-Toe', desc: 'Minimax algorithm in action.', component: <TicTacToe /> },
    { id: 'eightpuzzle', name: '8-Puzzle', desc: 'Manhattan heuristic solving.', component: <EightPuzzle /> },
    { id: 'nqueens', name: 'N-Queens', desc: 'Backtracking with hints.', component: <NQueens /> },
    { id: 'wumpus', name: 'Wumpus World', desc: 'Reactive semantic agent.', component: <Wumpus /> },
    { id: 'mapcoloring', name: 'Map Coloring', desc: 'Constraint satisfaction using LCV.', component: <MapColoring /> },
  ];

  return (
    <>
      <header style={{
        padding: '20px',
        textAlign: 'center',
        borderBottom: activeGame ? '1px solid var(--color-panel-border)' : 'none',
        background: 'var(--color-bg)'
      }}>
        <h1 style={{ color: 'var(--color-primary)', margin: 0, fontSize: '2.5rem', textShadow: 'var(--glow-primary)' }}>AI Arcade</h1>
        <p style={{ color: 'var(--color-text-muted)', marginTop: '10px' }}>Explore classic AI algorithms.</p>
        
        {activeGame && (
          <button 
            className="btn btn-secondary" 
            style={{ marginTop: '20px' }}
            onClick={() => setActiveGame(null)}
          >
            ← Back to Menu
          </button>
        )}
      </header>

      <main style={{ padding: '40px 20px' }}>
        {!activeGame ? (
          <div className="menu-grid">
            {games.map(game => (
              <div 
                key={game.id} 
                className="menu-card"
                onClick={() => setActiveGame(game.id)}
              >
                <h3>{game.name}</h3>
                <p>{game.desc}</p>
                <div className="btn btn-primary" style={{ marginTop: 'auto' }}>Play Now</div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            {games.find(g => g.id === activeGame)?.component}
          </div>
        )}
      </main>
    </>
  );
}

export default App;
