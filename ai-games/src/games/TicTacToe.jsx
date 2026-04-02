import React, { useState, useEffect } from 'react';
import { topNRandom, AgentLogPanel, StatusBanner } from '../components';
import { Users, Bot } from 'lucide-react';

export default function TicTacToe() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [mode, setMode] = useState('2player'); // '2player' or 'agent'
  const [agentLogs, setAgentLogs] = useState(null);
  const [isAuto, setIsAuto] = useState(false);

  const calculateWinner = (squares) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ];
    for (let [a, b, c] of lines) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return squares.includes(null) ? null : 'Draw';
  };

  const winner = calculateWinner(board);

  // Minimax algorithm to score a move
  const minimax = (squares, depth, isMaximizing, playerChar) => {
    const result = calculateWinner(squares);
    if (result === playerChar) return 10 - depth;
    if (result === (playerChar === 'X' ? 'O' : 'X')) return depth - 10;
    if (result === 'Draw') return 0;

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (!squares[i]) {
          squares[i] = playerChar;
          let score = minimax(squares, depth + 1, false, playerChar);
          squares[i] = null;
          bestScore = Math.max(bestScore, score);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      const opponentChar = playerChar === 'X' ? 'O' : 'X';
      for (let i = 0; i < 9; i++) {
        if (!squares[i]) {
          squares[i] = opponentChar;
          let score = minimax(squares, depth + 1, true, playerChar);
          squares[i] = null;
          bestScore = Math.min(bestScore, score);
        }
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

    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        // temp board
        const newBoard = [...board];
        newBoard[i] = currentPlayer;
        // score for the current player
        let score = minimax(newBoard, 0, false, currentPlayer);
        scoredMoves.push({ move: i, score });
      }
    }

    const result = topNRandom(scoredMoves, 5); // top 5
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
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setAgentLogs(null);
    setIsAuto(false);
  };

  let statusMsg = winner ? (winner === 'Draw' ? 'Game Over: Draw!' : `Winner: ${winner}`) : `Next player: ${isXNext ? 'X' : 'O'}`;
  let statusType = winner ? (winner === 'Draw' ? 'thinking' : 'win') : '';

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ color: 'var(--color-secondary)', marginBottom: '20px', textAlign: 'center' }}>Tic-Tac-Toe</h2>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
        <button className={`btn ${mode === '2player' ? 'btn-primary' : ''}`} onClick={() => setMode('2player')}>
          <Users size={18} className="inline-icon" /> 2 Player
        </button>
        <button className={`btn ${mode === 'agent' ? 'btn-primary' : ''}`} onClick={() => setMode('agent')}>
          <Bot size={18} className="inline-icon" /> Agent vs Auto
        </button>
      </div>

      <StatusBanner status={statusType} message={statusMsg} />

      <div className="board-grid" style={{ gridTemplateColumns: 'repeat(3, 100px)', gridTemplateRows: 'repeat(3, 100px)', width: 'fit-content' }}>
        {board.map((cell, idx) => (
          <button 
            key={idx} 
            className={`cell ${cell ? 'active' : ''}`} 
            onClick={() => handleCellClick(idx)}
            disabled={!!winner || (mode === 'agent' && isAuto)}
          >
            {cell}
          </button>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button className="btn btn-secondary" onClick={resetGame}>Restart Game</button>
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
