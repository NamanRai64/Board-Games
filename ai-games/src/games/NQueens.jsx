import React, { useState, useEffect } from 'react';
import { topNRandom, AgentLogPanel, StatusBanner } from '../components';
import { MousePointer2, Bot, Lightbulb } from 'lucide-react';

const SIZE = 8;

export default function NQueens() {
  const [board, setBoard] = useState([]); // Array of column indices for each row
  const [mode, setMode] = useState('manual'); // 'manual' or 'agent'
  const [agentLogs, setAgentLogs] = useState(null);
  const [isAuto, setIsAuto] = useState(false);
  const [hintCol, setHintCol] = useState(null);

  const isSafe = (testBoard, row, col) => {
    for (let r = 0; r < row; r++) {
      const c = testBoard[r];
      if (c === col || Math.abs(c - col) === Math.abs(r - row)) {
        return false;
      }
    }
    return true;
  };

  const getValidCols = (currentBoard, row) => {
    const valid = [];
    for (let c = 0; c < SIZE; c++) {
      if (isSafe(currentBoard, row, c)) valid.push(c);
    }
    return valid;
  };

  const computeScore = (currentBoard, row, col) => {
    if (row === SIZE - 1) return 100; // Winning move
    const testBoard = [...currentBoard, col];
    return getValidCols(testBoard, row + 1).length; // Number of valid options in next row
  };

  const calculateAgentMoves = (currentBoard) => {
    const currentRow = currentBoard.length;
    if (currentRow >= SIZE) return null;

    const validCols = getValidCols(currentBoard, currentRow);
    const scoredMoves = validCols.map(col => ({
      move: col, // the column choice for this row
      score: computeScore(currentBoard, currentRow, col)
    }));

    return topNRandom(scoredMoves, 5);
  };

  const performAgentMove = () => {
    if (board.length >= SIZE) {
      setIsAuto(false);
      return;
    }

    const result = calculateAgentMoves(board);
    if (result && result.chosen) {
      setAgentLogs({ ...result, chosen: { ...result.chosen } });
      setBoard([...board, result.chosen.move]);
      setHintCol(null);
    } else {
      // Dead end
      setAgentLogs({ error: "Dead End reached. No valid moves.", sorted: [] });
      setIsAuto(false);
    }
  };

  const provideHint = () => {
    const result = calculateAgentMoves(board);
    if (result && result.chosen) {
      setAgentLogs({ ...result, chosen: { ...result.chosen } });
      setHintCol(result.chosen.move);
    } else {
      setAgentLogs({ error: "No valid moves from here.", sorted: [] });
    }
  };

  useEffect(() => {
    let timeout;
    if (mode === 'agent' && isAuto && board.length < SIZE) {
      timeout = setTimeout(() => {
        performAgentMove();
      }, 400);
    }
    return () => clearTimeout(timeout);
  }, [mode, isAuto, board]);

  const handleCellClick = (row, col) => {
    if (mode === 'agent' || isAuto || board.length !== row) return; // Can only place in the current row
    
    if (isSafe(board, row, col)) {
      setBoard([...board, col]);
      setHintCol(null);
      setAgentLogs(null);
    } else {
      alert("Invalid placement! Conflict detected.");
    }
  };

  const undoMove = () => {
    if (board.length > 0) {
      setBoard(board.slice(0, -1));
      setHintCol(null);
      setAgentLogs(null);
    }
  };

  const resetGame = () => {
    setBoard([]);
    setAgentLogs(null);
    setIsAuto(false);
    setHintCol(null);
  };

  const isSolved = board.length === SIZE;
  const isDeadEnd = !isSolved && getValidCols(board, board.length).length === 0;
  
  let statusMsg = isSolved ? 'All Queens Placed Successfully!' : 
                  isDeadEnd ? 'Dead End! Must Undo.' : 
                  `Placing Queen for Row ${board.length + 1}`;
  let statusType = isSolved ? 'win' : isDeadEnd ? 'lose' : 'thinking';

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ color: 'var(--color-neon-green)', marginBottom: '20px', textAlign: 'center' }}>N-Queens</h2>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
        <button className={`btn ${mode === 'manual' ? 'btn-green' : ''}`} onClick={() => { setMode('manual'); setIsAuto(false); }}>
          <MousePointer2 size={18} className="inline-icon" /> Manual
        </button>
        <button className={`btn ${mode === 'agent' ? 'btn-green' : ''}`} onClick={() => setMode('agent')}>
          <Bot size={18} className="inline-icon" /> Agent Solve
        </button>
      </div>

      <StatusBanner status={statusType} message={statusMsg} />

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: `repeat(${SIZE}, 40px)`, 
        gridTemplateRows: `repeat(${SIZE}, 40px)`,
        gap: '2px',
        justifyContent: 'center',
        margin: '20px 0'
      }}>
        {Array.from({ length: SIZE }).map((_, r) => (
          Array.from({ length: SIZE }).map((__, c) => {
            const isPlaced = board[r] === c;
            const isClickableRow = mode === 'manual' && r === board.length;
            const isHint = hintCol !== null && isClickableRow && c === hintCol;
            // Alternating checkerboard color just for visuals
            const isDark = (r + c) % 2 === 1;

            return (
              <button 
                key={`${r}-${c}`}
                style={{ 
                  width: '40px', height: '40px',
                  backgroundColor: isPlaced ? 'var(--color-neon-green)' : 
                                   isHint ? 'var(--color-neon-amber)' : 
                                   isDark ? '#222' : '#444',
                  border: isHint ? '2px solid var(--color-neon-yellow)' : '1px solid #111',
                  cursor: isClickableRow ? 'pointer' : 'default',
                  color: '#000',
                  fontWeight: 'bold',
                  fontSize: '20px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
                onClick={() => handleCellClick(r, c)}
                disabled={!isClickableRow}
                title={isHint ? "Hint: Suggested placement" : ""}
              >
                {isPlaced ? '♛' : ''}
              </button>
            )
          })
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: '20px', gap: '10px', display: 'flex', justifyContent: 'center' }}>
        <button className="btn btn-cyan" onClick={resetGame}>Restart</button>
        {mode === 'manual' && board.length > 0 && <button className="btn" onClick={undoMove}>Undo</button>}
        {mode === 'manual' && !isSolved && !isDeadEnd && (
          <button className="btn btn-amber" onClick={provideHint}>
            <Lightbulb size={18} className="inline-icon" /> Hint
          </button>
        )}
      </div>

      {(mode === 'agent' || (mode === 'manual' && agentLogs)) && (
        <AgentLogPanel 
          moveResults={agentLogs} 
          onStep={performAgentMove} 
          onAutoSolve={() => setIsAuto(true)} 
          isAuto={isAuto || isSolved || isDeadEnd}
        />
      )}
    </div>
  );
}
