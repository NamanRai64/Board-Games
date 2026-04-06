import React, { useState } from 'react';
import TicTacToe from './games/TicTacToe';
import EightPuzzle from './games/EightPuzzle';
import NQueens from './games/NQueens';
import Wumpus from './games/Wumpus';
import MapColoring from './games/MapColoring';
import Missionaries from './games/Missionaries';

function App() {
  const [activeGame, setActiveGame] = useState(null);

  const games = [
    { id: 'tictactoe', name: 'Tic-Tac-Toe', desc: 'Face off against Minimax AI in 3x3 or 4x4 boards.', img: '/assets/tictactoe.png', component: <TicTacToe /> },
    { id: 'missionaries', name: 'River Crossing', desc: 'Solve the Missionaries & Cannibals river puzzle using state-space search.', img: '/assets/river_crossing.png', component: <Missionaries /> },
    { id: 'eightpuzzle', name: '8-Puzzle', desc: 'Solve classic sliding tiles using Manhattan & Linear Conflict A* heuristics.', img: '/assets/eightpuzzle.png', component: <EightPuzzle /> },
    { id: 'nqueens', name: 'N-Queens', desc: 'Place queens safely on boards up to 12x12 using LCV constraint rules.', img: '/assets/nqueens.png', component: <NQueens /> },
    { id: 'wumpus', name: 'Wumpus World', desc: 'Navigate treacherous pits using logical inference and sensor hints.', img: '/assets/wumpus_new.png', component: <Wumpus /> },
    { id: 'mapcoloring', name: 'Map Coloring', desc: 'Color graphs without neighbor conflicts using Constraint Satisfaction.', img: '/assets/mapcoloring.png', component: <MapColoring /> },
  ];

  const currentComponent = games.find(g => g.id === activeGame)?.component;

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: 'var(--color-bg)' }}>
      <header style={{
        padding: activeGame ? '16px 24px' : '48px 24px 24px',
        borderBottom: activeGame ? '1px solid var(--color-border)' : 'none',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'var(--color-bg)'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: activeGame ? 'space-between' : 'flex-start' }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {activeGame && (
              <button
                className="btn-minimal"
                onClick={() => setActiveGame(null)}
              >
                [← Back]
              </button>
            )}
            <h1 className="mono" style={{ fontSize: activeGame ? '1.2rem' : '2rem', margin: 0, fontWeight: 700, letterSpacing: '-0.02em', color: '#fff' }}>{'AI_SIM_ENVIRONMENT'}</h1>
          </div>

        </div>
      </header>

      <main style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
        {!activeGame ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div className="mono" style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '16px', letterSpacing: '0.1em' }}>AVAILABLE MODULES //</div>
            {games.map(game => (
              <div
                key={game.id}
                className="minimal-list-item"
                onClick={() => setActiveGame(game.id)}
              >
                <div style={{ flex: 1 }}>
                  <h3 className="mono">{game.name}</h3>
                  <p>{game.desc}</p>
                </div>
                <div className="mono" style={{ color: 'var(--color-link)' }}>[ INIT ]</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            {currentComponent}
          </div>
        )}
      </main>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}} />
    </div>
  );
}

export default App;
