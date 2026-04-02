import React, { useState, useEffect } from 'react';
import { Bot, User, BrainCircuit, Play, FastForward, Info, AlertTriangle } from 'lucide-react';

export function topNRandom(scoredMoves, n = 1) {
  if (!scoredMoves || scoredMoves.length === 0) return null;
  const sorted = [...scoredMoves].sort((a, b) => b.score - a.score);
  // Always return the best move for professional optimal performance
  return { chosen: sorted[0], topN: sorted.slice(0, n), sorted };
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

export function AgentLogPanel({ moveResults, onStep, onAutoSolve, isAuto, title = "Agent Analysis" }) {
  if (!moveResults) return null;

  const showControls = onStep && onAutoSolve;

  return (
    <div className="glass-panel" style={{ marginTop: '24px', backgroundColor: 'var(--color-bg)' }}>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-main)', marginBottom: '16px', fontSize: '1rem' }}>
        <Bot size={18} /> {title}
      </h3>
      
      {showControls && !isAuto.toString().includes('pva') && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <button className="btn" onClick={onStep} disabled={isAuto} title="Calculate and take 1 move">
            <Play size={14} /> Step
          </button>
          <button className="btn btn-primary" onClick={onAutoSolve} disabled={isAuto}>
            <FastForward size={14} /> Auto-Solve
          </button>
        </div>
      )}

      {isAuto === 'pva' && (
        <div style={{ color: 'var(--color-link)', marginBottom: '16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <BrainCircuit size={14} className="spin" /> Agent is playing...
        </div>
      )}

      <div style={{ background: '#010409', padding: '12px', border: '1px solid var(--color-panel-border)', borderRadius: '6px', maxHeight: '180px', overflowY: 'auto' }}>
        <div style={{ color: 'var(--color-text-muted)', marginBottom: '8px', fontSize: '0.75rem', fontWeight: '600' }}>LATEST AI LOG</div>
        {moveResults.sorted && moveResults.sorted.map((m, idx) => {
          const mStr = JSON.stringify(m.move);
          const chosenStr = JSON.stringify(moveResults.chosen?.move);
          const isChosen = mStr === chosenStr;
          
          let color = 'var(--color-text-muted)';
          let fontWeight = '400';
          if (isChosen) {
            color = 'var(--color-primary)';
            fontWeight = '600';
          }

          return (
            <div key={idx} style={{ color, fontWeight, display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontFamily: 'var(--mono)', fontSize: '0.8rem', borderBottom: '1px solid #1c2128' }}>
              <span>{isChosen ? '→ ' : '  '}Move: {mStr}</span>
              <span>Score: {m.score}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

