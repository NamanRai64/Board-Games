import React, { useState, useEffect, useCallback } from 'react';
import { topNRandom } from '../utils';
import { AgentLogPanel, StatusBanner, SessionStats, ResultModal } from '../components';

export default function TicTacToe() {
  const [size, setSize] = useState(3);
  const [board, setBoard] = useState(Array(size * size).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [mode, setMode] = useState('pva');
  const [agentLogs, setAgentLogs] = useState(null);
  const [isAuto, setIsAuto] = useState(false);
  const [stats, setStats] = useState({ wins: 0, losses: 0, draws: 0 });

  const calculateWinner = useCallback((squares) => {
    const lines = [];
    for (let i = 0; i < size; i++) {
      const row = [];
      for (let j = 0; j < size; j++) row.push(i * size + j);
      lines.push(row);
    }
    for (let i = 0; i < size; i++) {
      const col = [];
      for (let j = 0; j < size; j++) col.push(j * size + i);
      lines.push(col);
    }
    const d1 = [];
    for (let i = 0; i < size; i++) d1.push(i * size + i);
    lines.push(d1);
    const d2 = [];
    for (let i = 0; i < size; i++) d2.push(i * size + (size - 1 - i));
    lines.push(d2);

    for (let line of lines) {
      const first = squares[line[0]];
      if (first && line.every(idx => squares[idx] === first)) return first;
    }
    return squares.includes(null) ? null : 'Draw';
  }, [size]);

  const minimax = useCallback(function minimaxRec(squares, depth, isMaximizing, playerChar) {
    const result = calculateWinner(squares);
    const depthLimit = size === 3 ? 10 : 4;

    if (result === playerChar) return 10 - depth;
    if (result === (playerChar === 'X' ? 'O' : 'X')) return depth - 10;
    if (result === 'Draw' || depth >= depthLimit) return 0;

    const availableIndices = squares.map((v, i) => v === null ? i : null).filter(v => v !== null);

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i of availableIndices) {
        squares[i] = playerChar;
        let score = minimaxRec(squares, depth + 1, false, playerChar);
        squares[i] = null;
        bestScore = Math.max(bestScore, score);
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      const opponentChar = playerChar === 'X' ? 'O' : 'X';
      for (let i of availableIndices) {
        squares[i] = opponentChar;
        let score = minimaxRec(squares, depth + 1, true, playerChar);
        squares[i] = null;
        bestScore = Math.min(bestScore, score);
      }
      return bestScore;
    }
  }, [size, calculateWinner]);

  const resetGame = useCallback(() => {
    setBoard(Array(size * size).fill(null));
    setIsXNext(true);
    setAgentLogs(null);
    setIsAuto(false);
  }, [size]);

  const performAgentMove = useCallback(() => {
    const gameWinner = calculateWinner(board);
    if (gameWinner) {
      setIsAuto(false);
      return;
    }
    const currentPlayer = isXNext ? 'X' : 'O';
    const empty = board.map((v, i) => v === null ? i : null).filter(v => v !== null);
    const sampleSize = size === 3 ? 9 : 14;
    const sample = empty.sort(() => Math.random() - 0.5).slice(0, sampleSize);
    let scoredMoves = [];
    for (let i of sample) {
      const newBoard = [...board];
      newBoard[i] = currentPlayer;
      let score = minimax(newBoard, 0, false, currentPlayer);
      scoredMoves.push({ move: i, score });
    }
    const result = topNRandom(scoredMoves, 5);
    if (result && result.chosen) {
      setAgentLogs({ ...result, chosen: { ...result.chosen } });
      const moveIdx = result.chosen.move;
      setBoard(prev => {
        const next = [...prev];
        next[moveIdx] = currentPlayer;
        return next;
      });
      setIsXNext(prev => !prev);
    } else {
      setIsAuto(false);
    }
  }, [board, isXNext, size, calculateWinner, minimax]);

  const winner = calculateWinner(board);

  // Update Stats
  useEffect(() => {
    if (winner) {
      if (winner === 'X') setStats(prev => ({ ...prev, wins: prev.wins + 1 }));
      else if (winner === 'O') setStats(prev => ({ ...prev, losses: prev.losses + 1 }));
      else if (winner === 'Draw') setStats(prev => ({ ...prev, draws: prev.draws + 1 }));
    }
  }, [winner]);

  useEffect(() => {
    resetGame();
  }, [size, resetGame]);

  useEffect(() => {
    if (mode === 'pva' && !isXNext && !winner) {
      const timeout = setTimeout(() => performAgentMove(), 600);
      return () => clearTimeout(timeout);
    }
  }, [mode, isXNext, winner, board, performAgentMove]);

  useEffect(() => {
    let timeout;
    if (mode === 'agent' && isAuto && !winner) {
      timeout = setTimeout(() => performAgentMove(), 600);
    }
    return () => clearTimeout(timeout);
  }, [mode, isAuto, board, winner, performAgentMove]);

  const handleCellClick = (index) => {
    if (board[index] || winner || (mode === 'agent' && isAuto)) return;
    if (mode === 'pva' && !isXNext) return;
    setBoard(prev => {
      const next = [...prev];
      next[index] = isXNext ? 'X' : 'O';
      return next;
    });
    setIsXNext(prev => !prev);
  };



  let statusMsg = winner ? (winner === 'Draw' ? 'Game Over: Draw!' : `Winner: ${winner}`) : `Next player: ${isXNext ? 'X' : 'O'}`;
  let statusType = winner ? (winner === 'Draw' ? 'thinking' : 'win') : '';

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2 className="arcade-title">TIC_TAC_TOE //</h2>

      <SessionStats stats={stats} />

      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '32px' }}>
        <div className="toggle-group">
          <button className={`toggle-btn ${mode === '2player' ? 'active' : ''}`} onClick={() => setMode('2player')}>P2P</button>
          <button className={`toggle-btn ${mode === 'pva' ? 'active' : ''}`} onClick={() => setMode('pva')}>P2A</button>
        </div>
        <div className="toggle-group">
          <button className={`toggle-btn ${size === 3 ? 'active' : ''}`} onClick={() => setSize(3)}>3x3</button>
          <button className={`toggle-btn ${size === 4 ? 'active' : ''}`} onClick={() => setSize(4)}>4x4</button>
        </div>
      </div>

      <StatusBanner status={statusType} message={statusMsg} />

      <div className="board-grid" style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${size}, 80px)`,
        width: `${size * 90}px`, // Fixed width based on size
        margin: '0 auto',
        padding: '12px',
        gap: '10px',
        justifyContent: 'center'
      }}>
        {board.map((cell, idx) => (
          <button
            key={idx}
            className={`cell ${cell ? 'active' : ''}`}
            onClick={() => handleCellClick(idx)}
            disabled={!!winner || (mode === 'agent' && isAuto) || (mode === 'pva' && !isXNext)}
            style={{
              fontSize: size === 3 ? '2.5rem' : '1.8rem',
              width: '80px',
              height: '80px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
            {cell === 'X' ? <span style={{ color: 'var(--color-link)', filter: 'drop-shadow(0 0 8px var(--color-glow-link))', lineHeight: 1 }}>X</span> : cell === 'O' ? <span style={{ color: 'var(--color-alert)', filter: 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.4))', lineHeight: 1 }}>O</span> : null}
          </button>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: '32px' }}>
        <button className="btn" style={{ padding: '12px 32px' }} onClick={resetGame}>Restart Session</button>
      </div>

      {(mode === 'pva') && (
        <AgentLogPanel
          moveResults={agentLogs}
          isAuto={isAuto || !!winner ? 'pva' : ''}
          title="AGENT_TELEMETRY"
        />
      )}

      <ResultModal
        status={winner === 'Draw' ? 'draw' : winner === 'X' ? 'win' : winner === 'O' ? 'lose' : null}
        onRestart={resetGame}
      />
    </div>
  );
}
