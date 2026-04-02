import React, { useState } from 'react';
import TicTacToe from './games/TicTacToe';
import EightPuzzle from './games/EightPuzzle';
import NQueens from './games/NQueens';
import Wumpus from './games/Wumpus';
import MapColoring from './games/MapColoring';

function App() {
  const [activeGame, setActiveGame] = useState(null);

  const games = [
    { id: 'tictactoe', name: 'Tic-Tac-Toe', desc: 'Face off against Minimax AI in 3x3 or 4x4 boards.', img: '/assets/tictactoe.png', component: <TicTacToe /> },
    { id: 'eightpuzzle', name: '8-Puzzle', desc: 'Solve classic sliding tiles using Manhattan & Linear Conflict A* heuristics.', img: '/assets/eightpuzzle.png', component: <EightPuzzle /> },
    { id: 'nqueens', name: 'N-Queens', desc: 'Place queens safely on boards up to 12x12 using LCV constraint rules.', img: '/assets/nqueens.png', component: <NQueens /> },
    { id: 'wumpus', name: 'Wumpus World', desc: 'Navigate treacherous pits using logical inference and sensor hints.', img: '/assets/wumpus.png', component: <Wumpus /> },
    { id: 'mapcoloring', name: 'Map Coloring', desc: 'Color graphs without neighbor conflicts using Constraint Satisfaction.', img: '/assets/mapcoloring.png', component: <MapColoring /> },
  ];

  const currentComponent = games.find(g => g.id === activeGame)?.component;

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <header style={{
        padding: '64px 20px 48px',
        textAlign: 'center',
        background: 'rgba(3, 7, 18, 0.4)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--color-border)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        transition: 'all 0.3s ease'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h1 className="arcade-title" style={{ fontSize: activeGame ? '2.5rem' : '4rem', transition: 'all 0.5s ease' }}>AI Arcade</h1>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '12px', fontSize: '1.1rem', fontWeight: 500, maxWidth: '600px' }}>
            A premium collection of classic logic games and advanced AI algorithms.
          </p>
          
          {activeGame && (
            <button 
              className="btn btn-secondary" 
              style={{ marginTop: '24px', borderRadius: '30px', padding: '12px 24px' }}
              onClick={() => setActiveGame(null)}
            >
              ← Back to Universe
            </button>
          )}
        </div>
      </header>

      <main style={{ padding: '64px 20px', maxWidth: '1400px', margin: '0 auto' }}>
        {!activeGame ? (
          <div className="menu-grid">
            {games.map(game => (
              <div 
                key={game.id} 
                className="menu-card"
                onClick={() => setActiveGame(game.id)}
              >
                <div style={{ 
                  width: '100%', 
                  height: '240px', // Bigger container
                  overflow: 'hidden', 
                  borderRadius: '16px', 
                  marginBottom: '24px', 
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '20px'
                }}>
                    <img src={game.img} alt={game.name} style={{ width: '100%', height: '100%', objectFit: 'contain', transition: '0.6s cubic-bezier(0.2, 0.8, 0.2, 1)' }} />
                </div>
                <h3>{game.name}</h3>
                <p style={{ minHeight: '3em' }}>{game.desc}</p>
                <div className="btn btn-primary" style={{ marginTop: '20px', width: '100%', py: '14px', borderRadius: '12px' }}>Enter Simulation</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ animation: 'fadeIn 0.5s ease' }}>
            {currentComponent}
          </div>
        )}
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}

export default App;
