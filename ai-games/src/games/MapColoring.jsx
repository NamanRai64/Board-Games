import React, { useState, useEffect, useCallback } from 'react';
import { topNRandom, AgentLogPanel, StatusBanner, WarningPopup } from '../components';
import { Users, Bot } from 'lucide-react';

const NODES = [
  { id: 0, x: 100, y: 50, label: 'A' },
  { id: 1, x: 250, y: 50, label: 'B' },
  { id: 2, x: 175, y: 150, label: 'C' },
  { id: 3, x: 50, y: 250, label: 'D' },
  { id: 4, x: 300, y: 250, label: 'E' },
];

const EDGES = [
  [0, 1], [0, 2], [1, 2], [0, 3], [2, 3], [2, 4], [1, 4], [3, 4]
];

const COLORS = ['#ff3333', '#39ff14', '#00ffff']; // Red, Green, Cyan

export default function MapColoring() {
  const [board, setBoard] = useState(Array(5).fill(null)); // store color index
  const [isP1Next, setIsP1Next] = useState(true);
  const [mode, setMode] = useState('2player');
  const [agentLogs, setAgentLogs] = useState(null);
  const [isAuto, setIsAuto] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [warningMsg, setWarningMsg] = useState('');

  const getNeighbors = (nId) => {
    return EDGES.filter(e => e.includes(nId)).map(e => e[0] === nId ? e[1] : e[0]);
  };

  const getValidColors = (currentBoard, nId) => {
    const neighbors = getNeighbors(nId);
    const usedColors = neighbors.map(neighborId => currentBoard[neighborId]).filter(c => c !== null);
    return [0, 1, 2].filter(c => !usedColors.includes(c)); // indices 0,1,2
  };

  const countOptionsForNeighbor = (currentBoard, neighborId) => {
    return getValidColors(currentBoard, neighborId).length;
  };

  // Agent Logic: Least Constraining Value (LCV)
  const calculateAgentMoves = useCallback(() => {
    const uncolored = board.findIndex(c => c === null);
    if (uncolored === -1) return null; // Fully colored

    const validColorsForNode = getValidColors(board, uncolored);
    if (validColorsForNode.length === 0) return null; // Dead end

    const scoredMoves = validColorsForNode.map(colorIdx => {
      // Simulate assigning colorIdx
      const tempBoard = [...board];
      tempBoard[uncolored] = colorIdx;

      let score = 0;
      const neighbors = getNeighbors(uncolored);
      for (const nb of neighbors) {
        if (tempBoard[nb] === null) {
          // LCV: sum of remaining valid colors for uncolored neighbors
          score += countOptionsForNeighbor(tempBoard, nb);
        }
      }

      return { move: { node: uncolored, color: colorIdx }, score };
    });

    return topNRandom(scoredMoves, 5);
  }, [board]);

  const performAgentMove = useCallback(() => {
    if (!board.includes(null)) {
      setIsAuto(false);
      return;
    }

    const result = calculateAgentMoves();
    if (result && result.chosen) {
      setAgentLogs({ ...result, chosen: { ...result.chosen } });
      const newBoard = [...board];
      newBoard[result.chosen.move.node] = result.chosen.move.color;
      setBoard(newBoard);
      setIsP1Next(!isP1Next);
    } else {
      setAgentLogs({ error: "Dead End. Cannot color the map.", sorted: [] });
      setIsAuto(false);
    }
  }, [calculateAgentMoves, board, isP1Next]);

  useEffect(() => {
    let timeout;
    if (mode === 'agent' && isAuto && board.includes(null)) {
      timeout = setTimeout(() => performAgentMove(), 600);
    }
    return () => clearTimeout(timeout);
  }, [mode, isAuto, board, performAgentMove]);

  const handleNodeClick = (nId) => {
    if (mode === 'agent' || isAuto) return;
    if (board[nId] !== null) return; // already colored
    
    // In 2 player, user must select node first, then a color
    setSelectedNode(nId);
  };

  const selectColor = (colorIdx) => {
    if (selectedNode === null) return;
    const valid = getValidColors(board, selectedNode);
    if (!valid.includes(colorIdx)) {
      setWarningMsg("Invalid color! Neighbor uses this already.");
      return;
    }

    const newBoard = [...board];
    newBoard[selectedNode] = colorIdx;
    setBoard(newBoard);
    setIsP1Next(!isP1Next);
    setSelectedNode(null);
    setAgentLogs(null);
  };

  const resetGame = () => {
    setBoard(Array(5).fill(null));
    setIsP1Next(true);
    setAgentLogs(null);
    setIsAuto(false);
    setSelectedNode(null);
  };

  const isComplete = !board.includes(null);
  let hasDeadEnd = false;
  if (!isComplete && board.some((val, idx) => val === null && getValidColors(board, idx).length === 0)) {
    hasDeadEnd = true;
  }

  let statusMsg = isComplete ? 'Map Colored Successfully!' :
                  hasDeadEnd ? 'Dead End! Cannot finish.' :
                  `Turn: Player ${isP1Next ? '1' : '2'}`;
  let statusType = isComplete ? 'win' : hasDeadEnd ? 'lose' : 'thinking';

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <WarningPopup message={warningMsg} onClose={() => setWarningMsg('')} />
      <h2 style={{ color: 'var(--color-primary)', marginBottom: '20px', textAlign: 'center' }}>Map Coloring (CSP)</h2>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
        <button className={`btn ${mode === '2player' ? 'btn-primary' : ''}`} onClick={() => setMode('2player')}>
          <Users size={18} className="inline-icon" /> 2 Player
        </button>
        <button className={`btn ${mode === 'agent' ? 'btn-primary' : ''}`} onClick={() => setMode('agent')}>
          <Bot size={18} className="inline-icon" /> Agent vs Auto
        </button>
      </div>

      <StatusBanner status={statusType} message={statusMsg} />

      <div style={{ position: 'relative', width: '350px', height: '300px', margin: '40px auto', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
        {/* Draw Edges */}
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
          {EDGES.map((edge, idx) => {
            const A = NODES[edge[0]];
            const B = NODES[edge[1]];
            return <line key={idx} x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke="var(--color-panel-border)" strokeWidth="3" />;
          })}
        </svg>

        {/* Draw Nodes */}
        {NODES.map(n => {
          const isSelected = selectedNode === n.id;
          const bg = board[n.id] !== null ? COLORS[board[n.id]] : '#111';
          return (
            <div 
              key={n.id}
              onClick={() => handleNodeClick(n.id)}
              style={{
                position: 'absolute',
                left: n.x - 20, top: n.y - 20,
                width: '40px', height: '40px',
                borderRadius: '50%',
                background: bg,
                border: isSelected ? '2px solid var(--color-accent)' : '2px solid #555',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: (board[n.id] === null && mode === '2player') ? 'pointer' : 'default',
                color: board[n.id] !== null ? '#000' : 'var(--color-text-main)',
                fontWeight: 'bold', zIndex: 10,
                boxShadow: board[n.id] !== null ? `0 0 10px ${bg}` : 'none'
              }}
            >
              {n.label}
            </div>
          );
        })}
      </div>

      {mode === '2player' && selectedNode !== null && (
        <div className="glass-panel" style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h4>Choose a color for Region {NODES[selectedNode].label}</h4>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '10px' }}>
            {COLORS.map((c, idx) => {
              const isValid = getValidColors(board, selectedNode).includes(idx);
              return (
                <button 
                  key={idx} 
                  style={{ width: '40px', height: '40px', background: c, borderRadius: '50%', opacity: isValid ? 1 : 0.2, cursor: isValid ? 'pointer' : 'not-allowed', border: 'none' }}
                  onClick={() => selectColor(idx)}
                  disabled={!isValid}
                />
              );
            })}
          </div>
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button className="btn btn-secondary" onClick={resetGame}>Restart Game</button>
      </div>

      {mode === 'agent' && (
        <AgentLogPanel 
          moveResults={agentLogs} 
          onStep={performAgentMove} 
          onAutoSolve={() => setIsAuto(true)} 
          isAuto={isAuto || isComplete || hasDeadEnd}
        />
      )}
    </div>
  );
}
