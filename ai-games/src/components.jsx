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
  
  let typeClass = '';
  if (status === 'win') typeClass = 'win';
  if (status === 'lose') typeClass = 'lose';
  if (status === 'thinking') typeClass = 'thinking';

  return (
    <div className={`glass-panel status-banner ${typeClass}`} style={{ textAlign: 'left', marginBottom: '20px', fontWeight: '600', padding: '12px 16px', display: 'flex', alignItems: 'center' }}>
      {status === 'thinking' ? <BrainCircuit size={18} className="spin" style={{ marginRight: '10px' }} /> : null}
      <span>{message}</span>
    </div>
  );
}

// Custom Warning Popup to replace window.alert
export function WarningPopup({ message, onClose }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(t);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="custom-popup">
      <AlertTriangle size={20} />
      <span>{message}</span>
    </div>
  );
}

export function AgentLogPanel({ moveResults, onStep, onAutoSolve, isAuto }) {
  if (!moveResults) return null;

  return (
    <div className="glass-panel" style={{ marginTop: '24px', backgroundColor: 'var(--color-bg)' }}>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-main)', marginBottom: '16px', fontSize: '1rem' }}>
        <Bot size={18} /> Agent Control
      </h3>
      
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button className="btn" onClick={onStep} disabled={isAuto} title="Calculate and take 1 move">
          <Play size={14} /> Step
        </button>
        <button className="btn btn-primary" onClick={onAutoSolve} disabled={isAuto}>
          <FastForward size={14} /> Auto-Solve
        </button>
      </div>

      <div style={{ background: '#010409', padding: '12px', border: '1px solid var(--color-panel-border)', borderRadius: '6px', maxHeight: '180px', overflowY: 'auto' }}>
        <div style={{ color: 'var(--color-text-muted)', marginBottom: '8px', fontSize: '0.8rem', fontWeight: '600' }}>AGENT LOG (LATEST ANALYSIS)</div>
        {moveResults.sorted && moveResults.sorted.map((m, idx) => {
          const isChosen = m === moveResults.chosen?.move;
          const isTopN = moveResults.topN?.some(tn => tn.move === m.move);
          let color = 'var(--color-text-muted)';
          let fontWeight = '400';
          if (isChosen) {
            color = 'var(--color-primary)';
            fontWeight = '600';
          } else if (isTopN) {
            color = 'var(--color-link)';
          }

          return (
            <div key={idx} style={{ color, fontWeight, display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontFamily: 'var(--mono)', fontSize: '0.85rem', borderBottom: '1px solid #1c2128' }}>
              <span>{isChosen ? '→ ' : '  '}Move: {JSON.stringify(m.move)}</span>
              <span>Score: {m.score}</span>
            </div>
          );
        })}
        {!moveResults.sorted?.length && <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>No valid moves found.</div>}
      </div>
    </div>
  );
}
