import React, { useState } from 'react';
import TicTacToe from './games/TicTacToe';
import EightPuzzle from './games/EightPuzzle';
import NQueens from './games/NQueens';
import Wumpus from './games/Wumpus';
import MapColoring from './games/MapColoring';

function App() {
  const [activeGame, setActiveGame] = useState('tictactoe');

  const games = [
    { id: 'tictactoe', name: 'Tic-Tac-Toe', component: <TicTacToe /> },
    { id: 'eightpuzzle', name: '8-Puzzle', component: <EightPuzzle /> },
    { id: 'nqueens', name: 'N-Queens', component: <NQueens /> },
    { id: 'wumpus', name: 'Wumpus World', component: <Wumpus /> },
    { id: 'mapcoloring', name: 'Map Coloring', component: <MapColoring /> },
  ];

  return (
    <>
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        background: 'rgba(5, 5, 5, 0.9)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--color-panel-border)',
        padding: '15px 20px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '20px',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <h1 style={{ color: 'var(--color-neon-amber)', margin: 0, fontSize: '1.5rem', marginRight: '20px' }}>AI Arcade</h1>
        
        <nav style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {games.map(game => (
            <button
              key={game.id}
              className={`btn ${activeGame === game.id ? 'btn-green' : ''}`}
              onClick={() => setActiveGame(game.id)}
            >
              {game.name}
            </button>
          ))}
        </nav>
      </header>

      <main style={{ padding: '20px' }}>
        {games.find(g => g.id === activeGame)?.component}
      </main>
    </>
  );
}

export default App;
