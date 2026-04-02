import React from 'react';
import { Bot, User, BrainCircuit, Play, FastForward, Info } from 'lucide-react';

/**
 * Shared utility: Given an array of { move, score }, sort descending by score.
 * Take up to `n` elements from the top (all of which have valid scores).
 * If there are fewer than `n`, take what's available.
 * Returns one chosen move randomly from that top slice.
 */
export function topNRandom(scoredMoves, n = 5) {
  if (!scoredMoves || scoredMoves.length === 0) return null;
  // Sort descending by score
  const sorted = [...scoredMoves].sort((a, b) => b.score - a.score);
  // Take top N
  const topN = sorted.slice(0, n);
  // Pick random from top N
  const randomIndex = Math.floor(Math.random() * topN.length);
  return { chosen: topN[randomIndex], topN, sorted };
}

export function StatusBanner({ status, message }) {
  if (!status) return null;
  
  let colorClass = 'btn-cyan';
  if (status === 'win') colorClass = 'btn-green';
  if (status === 'lose') colorClass = 'btn-red';
  if (status === 'thinking') colorClass = 'btn-amber';

  return (
    <div className={`glass-panel ${colorClass} status-banner`} style={{ textAlign: 'center', marginBottom: '20px', fontWeight: '800' }}>
      {status === 'thinking' ? <BrainCircuit className="inline-icon spin" /> : null}
      <span style={{ marginLeft: '8px' }}>{message}</span>
    </div>
  );
}

export function AgentLogPanel({ moveResults, onStep, onAutoSolve, isAuto }) {
  if (!moveResults) return null;

  return (
    <div className="glass-panel" style={{ marginTop: '20px' }}>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-neon-amber)', marginBottom: '15px' }}>
        <Bot size={20} /> Agent Control
      </h3>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <button className="btn btn-amber" onClick={onStep} disabled={isAuto} title="Calculate and take 1 move">
          <Play size={16} style={{ verticalAlign: 'middle', marginRight: '5px' }}/> Step
        </button>
        <button className="btn btn-green" onClick={onAutoSolve} disabled={isAuto}>
          <FastForward size={16} style={{ verticalAlign: 'middle', marginRight: '5px' }}/> Auto-Solve
        </button>
      </div>

      <div style={{ background: 'rgba(0,0,0,0.5)', padding: '10px', borderRadius: '4px', maxHeight: '150px', overflowY: 'auto', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem' }}>
        <div style={{ color: 'var(--color-text-muted)', marginBottom: '5px' }}>Last Turn Analysis:</div>
        {moveResults.sorted && moveResults.sorted.map((m, idx) => {
          const isChosen = m === moveResults.chosen?.move;
          const isTopN = moveResults.topN?.includes(m);
          let color = 'var(--color-text-muted)';
          if (isChosen) color = 'var(--color-neon-green)';
          else if (isTopN) color = 'var(--color-neon-cyan)';

          return (
            <div key={idx} style={{ color, display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
              <span>{isChosen ? '> ' : '  '}Move: {JSON.stringify(m.move)}</span>
              <span>Score: {m.score}</span>
            </div>
          );
        })}
        {!moveResults.sorted?.length && <div style={{ color: 'var(--color-text-muted)' }}>No valid moves evaluated yet.</div>}
      </div>
    </div>
  );
}
