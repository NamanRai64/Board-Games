import React, { useState, useEffect } from 'react';
import { Bot, User, BrainCircuit, Play, FastForward, Info, AlertTriangle } from 'lucide-react';

export function topNRandom(scoredMoves, n = 5) {
  if (!scoredMoves || scoredMoves.length === 0) return null;
  const sorted = [...scoredMoves].sort((a, b) => b.score - a.score);
  const topN = sorted.slice(0, n);
  const randomIndex = Math.floor(Math.random() * topN.length);
  return { chosen: topN[randomIndex], topN, sorted };
}

export function StatusBanner({ status, message }) {
  if (!status) return null;
  
  let colorClass = 'btn-secondary';
  if (status === 'win') colorClass = 'btn-primary';
  if (status === 'lose') colorClass = '';
  if (status === 'thinking') colorClass = 'btn-secondary';

  return (
    <div className={`glass-panel ${colorClass} status-banner`} style={{ textAlign: 'center', marginBottom: '20px', fontWeight: '800', padding: '15px' }}>
      {status === 'thinking' ? <BrainCircuit className="inline-icon spin" style={{ marginRight: '8px', verticalAlign: 'middle' }} /> : null}
      <span style={{ verticalAlign: 'middle' }}>{message}</span>
    </div>
  );
}

// Custom Warning Popup to replace window.alert
export function WarningPopup({ message, onClose }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(t);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="custom-popup">
      <AlertTriangle size={24} />
      <span>{message}</span>
    </div>
  );
}

export function AgentLogPanel({ moveResults, onStep, onAutoSolve, isAuto }) {
  if (!moveResults) return null;

  return (
    <div className="glass-panel" style={{ marginTop: '20px' }}>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)', marginBottom: '15px' }}>
        <Bot size={20} /> Agent Control
      </h3>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <button className="btn btn-secondary" onClick={onStep} disabled={isAuto} title="Calculate and take 1 move">
          <Play size={16} style={{ verticalAlign: 'middle', marginRight: '5px' }}/> Step
        </button>
        <button className="btn btn-primary" onClick={onAutoSolve} disabled={isAuto}>
          <FastForward size={16} style={{ verticalAlign: 'middle', marginRight: '5px' }}/> Auto-Solve
        </button>
      </div>

      <div style={{ background: 'rgba(0,0,0,0.5)', padding: '10px', borderRadius: '4px', maxHeight: '150px', overflowY: 'auto', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem' }}>
        <div style={{ color: 'var(--color-text-muted)', marginBottom: '5px' }}>Last Turn Analysis:</div>
        {moveResults.sorted && moveResults.sorted.map((m, idx) => {
          const isChosen = m === moveResults.chosen?.move;
          const isTopN = moveResults.topN?.includes(m);
          let color = 'var(--color-text-muted)';
          if (isChosen) color = 'var(--color-primary)';
          else if (isTopN) color = 'var(--color-secondary)';

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
