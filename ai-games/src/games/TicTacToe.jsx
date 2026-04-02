import React, { useState, useEffect } from 'react';
import { topNRandom, AgentLogPanel, StatusBanner } from '../components';
import { Users, Bot } from 'lucide-react';

export default function TicTacToe() {
  const [size, setSize] = useState(3);
  const [board, setBoard] = useState(Array(size * size).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [mode, setMode] = useState('2player'); 
  const [agentLogs, setAgentLogs] = useState(null);
  const [isAuto, setIsAuto] = useState(false);

  useEffect(() => {
    resetGame();
  }, [size]);

  const calculateWinner = (squares) => {
    const lines = [];
    // Rows
    for (let i = 0; i < size; i++) {
        const row = [];
        for (let j = 0; j < size; j++) row.push(i*size + j);
        lines.push(row);
    }
    // Cols
    for (let i = 0; i < size; i++) {
        const col = [];
        for (let j = 0; j < size; j++) col.push(j*size + i);
        lines.push(col);
    }
    // Diagonals
    const d1 = [];
    for (let i = 0; i < size; i++) d1.push(i*size + i);
    lines.push(d1);
    const d2 = [];
    for (let i = 0; i < size; i++) d2.push(i*size + (size - 1 - i));
    lines.push(d2);

    for (let line of lines) {
      const first = squares[line[0]];
      if (first && line.every(idx => squares[idx] === first)) return first;
    }
    return squares.includes(null) ? null : 'Draw';
  };

  const winner = calculateWinner(board);

  // Minimax with depth limit for larger boards
  const minimax = (squares, depth, isMaximizing, playerChar) => {
    const result = calculateWinner(squares);
    const depthLimit = size === 3 ? 10 : 3; // Keep 4x4 fast

    if (result === playerChar) return 10 - depth;
    if (result === (playerChar === 'X' ? 'O' : 'X')) return depth - 10;
    if (result === 'Draw' || depth >= depthLimit) return 0;

    const availableIndices = squares.map((v, i) => v === null ? i : null).filter(v => v !== null);

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i of availableIndices) {
        squares[i] = playerChar;
        let score = minimax(squares, depth + 1, false, playerChar);
        squares[i] = null;
        bestScore = Math.max(bestScore, score);
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      const opponentChar = playerChar === 'X' ? 'O' : 'X';
      for (let i of availableIndices) {
        squares[i] = opponentChar;
        let score = minimax(squares, depth + 1, true, playerChar);
        squares[i] = null;
        bestScore = Math.min(bestScore, score);
      }
      return bestScore;
    }
  };

  const performAgentMove = () => {
    if (winner) {
      setIsAuto(false);
      return;
    }

    const currentPlayer = isXNext ? 'X' : 'O';
    let scoredMoves = [];

    const empty = board.map((v, i) => v === null ? i : null).filter(v => v !== null);
    // Limit move consideration for 4x4 to keep UI responsive
    const sample = size === 3 ? empty : empty.sort(() => Math.random() - 0.5).slice(0, 8);

    for (let i of sample) {
      const newBoard = [...board];
      newBoard[i] = currentPlayer;
      let score = minimax(newBoard, 0, false, currentPlayer);
      scoredMoves.push({ move: i, score });
    }

    const result = topNRandom(scoredMoves, 5); 
    if (result && result.chosen) {
      setAgentLogs({ ...result, chosen: { ...result.chosen } });
      const newBoard = [...board];
      newBoard[result.chosen.move] = currentPlayer;
      setBoard(newBoard);
      setIsXNext(!isXNext);
    } else {
      setIsAuto(false);
    }
  };

  useEffect(() => {
    let timeout;
    if (mode === 'agent' && isAuto && !winner) {
      timeout = setTimeout(() => {
        performAgentMove();
      }, 500); // delay for effect
    }
    return () => clearTimeout(timeout);
  }, [mode, isAuto, board, isXNext, winner]);

  const handleCellClick = (index) => {
    if (board[index] || winner || (mode === 'agent' && isAuto)) return;
    
    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    setIsXNext(!isXNext);
  };

  const resetGame = () => {
    setBoard(Array(size * size).fill(null));
    setIsXNext(true);
    setAgentLogs(null);
    setIsAuto(false);
  };

  let statusMsg = winner ? (winner === 'Draw' ? 'Game Over: Draw!' : `Winner: ${winner}`) : `Next player: ${isXNext ? 'X' : 'O'}`;
  let statusType = winner ? (winner === 'Draw' ? 'thinking' : 'win') : '';

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ color: 'var(--color-text-main)', marginBottom: '24px', textAlign: 'center' }}>Tic-Tac-Toe</h2>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className={`btn ${mode === '2player' ? 'btn-primary' : ''}`} onClick={() => setMode('2player')}>
            2 Player
          </button>
          <button className={`btn ${mode === 'agent' ? 'btn-primary' : ''}`} onClick={() => setMode('agent')}>
             Agent
          </button>
        </div>
        <div style={{ borderLeft: '1px solid var(--color-panel-border)', paddingLeft: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Level:</span>
          <button className={`btn ${size === 3 ? 'btn-secondary' : ''}`} onClick={() => setSize(3)}>3x3</button>
          <button className={`btn ${size === 4 ? 'btn-secondary' : ''}`} onClick={() => setSize(4)}>4x4</button>
        </div>
      </div>

      <StatusBanner status={statusType} message={statusMsg} />

      <div className="board-grid" style={{ gridTemplateColumns: `repeat(${size}, 80px)`, width: 'fit-content' }}>
        {board.map((cell, idx) => (
          <button 
            key={idx} 
            className={`cell ${cell ? 'active' : ''}`} 
            onClick={() => handleCellClick(idx)}
            disabled={!!winner || (mode === 'agent' && isAuto)}
            style={{ fontSize: size === 3 ? '2rem' : '1.5rem', width: '80px', height: '80px' }}
          >
            {cell === 'X' ? <span style={{ color: 'var(--color-link)' }}>X</span> : cell === 'O' ? <span style={{ color: 'var(--color-alert)' }}>O</span> : null}
          </button>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: '24px' }}>
        <button className="btn" onClick={resetGame}>Restart Game</button>
      </div>

      {mode === 'agent' && (
        <AgentLogPanel 
          moveResults={agentLogs} 
          onStep={performAgentMove} 
          onAutoSolve={() => setIsAuto(true)} 
          isAuto={isAuto || !!winner}
        />
      )}
    </div>
  );
}
