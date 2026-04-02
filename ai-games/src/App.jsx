import React, { useState } from 'react';
import TicTacToe from './games/TicTacToe';
import EightPuzzle from './games/EightPuzzle';
import NQueens from './games/NQueens';
import Wumpus from './games/Wumpus';
import MapColoring from './games/MapColoring';

function App() {
  const [activeGame, setActiveGame] = useState(null);

  const games = [
    { id: 'tictactoe', name: 'Tic-Tac-Toe', desc: 'Minimax on 3x3 or 4x4 boards.', img: '/assets/tictactoe.png', component: <TicTacToe /> },
    { id: 'eightpuzzle', name: '8-Puzzle', desc: 'Classic 3x3 sliding challenge.', img: '/assets/eightpuzzle.png', component: <EightPuzzle /> },
    { id: 'nqueens', name: 'N-Queens', desc: 'Scale from 4x4 up to 12x12.', img: '/assets/nqueens.png', component: <NQueens /> },
    { id: 'wumpus', name: 'Wumpus World', desc: 'Scale from 4x4 up to 8x8 caverns.', img: '/assets/wumpus.png', component: <Wumpus /> },
    { id: 'mapcoloring', name: 'Map Coloring', desc: 'Easy to Hard graph topologies.', img: '/assets/mapcoloring.png', component: <MapColoring /> },
  ];

  return (
    <>
      <header style={{
        padding: '32px 20px',
        textAlign: 'center',
        borderBottom: activeGame ? '1px solid var(--color-panel-border)' : 'none',
        background: 'var(--color-header-bg)'
      }}>
        <h1 style={{ color: 'var(--color-text-main)', margin: 0, fontSize: '2rem' }}>AI Arcade</h1>
        <p style={{ color: 'var(--color-text-muted)', marginTop: '8px' }}>Explore classic AI algorithms with interactive agents.</p>
        
        {activeGame && (
          <button 
            className="btn" 
            style={{ marginTop: '24px' }}
            onClick={() => setActiveGame(null)}
          >
            ← Back to Games Menu
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
                <div style={{ width: '100%', height: '140px', overflow: 'hidden', borderRadius: '4px', marginBottom: '16px', backgroundColor: '#010409' }}>
                    <img src={game.img} alt={game.name} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: '0.8' }} />
                </div>
                <h3>{game.name}</h3>
                <p>{game.desc}</p>
                <div className="btn btn-primary" style={{ marginTop: 'auto', width: '100%' }}>Play Now</div>
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
