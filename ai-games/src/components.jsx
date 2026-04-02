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
    <div className={`glass-panel status-banner ${typeClass}`} style={{ 
      textAlign: 'left', 
      marginBottom: '20px', 
      fontWeight: '600', 
      padding: '16px 20px', 
      display: 'flex', 
      alignItems: 'center',
      borderLeftWidth: '6px',
      gap: '12px'
    }}>
      {status === 'thinking' ? <BrainCircuit size={20} className="spin" style={{ color: 'var(--color-warning)' }} /> : null}
      <span style={{ fontSize: '1rem', letterSpacing: '0.01em' }}>{message}</span>
    </div>
  );
}

export function SessionStats({ stats }) {
  if (!stats) return null;
  return (
    <div className="glass-panel" style={{ padding: '12px 20px', marginBottom: '24px', display: 'flex', justifyContent: 'center', gap: '32px' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '4px' }}>Wins</div>
        <div style={{ color: 'var(--color-primary)', fontSize: '1.25rem', fontWeight: '700' }}>{stats.wins}</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '4px' }}>Losses</div>
        <div style={{ color: 'var(--color-alert)', fontSize: '1.25rem', fontWeight: '700' }}>{stats.losses}</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '4px' }}>Draws</div>
        <div style={{ color: 'var(--color-link)', fontSize: '1.25rem', fontWeight: '700' }}>{stats.draws}</div>
      </div>
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
    <div className="glass-panel" style={{ marginTop: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--color-text-main)', fontSize: '1rem', margin: 0 }}>
          <Bot size={20} className={isAuto === 'pva' ? 'spin' : ''} /> 
          {title}
        </h3>
        {isAuto === 'pva' && <span className="mono" style={{ color: 'var(--color-link)', fontSize: '0.7rem', padding: '2px 8px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '10px' }}>LIVE_THINKING</span>}
      </div>
      
      {showControls && !isAuto.toString().includes('pva') && (
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button className="btn" onClick={onStep} disabled={isAuto} title="Calculate and take 1 move">
            <Play size={16} /> Step
          </button>
          <button className="btn btn-primary" onClick={onAutoSolve} disabled={isAuto}>
            <FastForward size={16} /> Auto-Solve
          </button>
        </div>
      )}

      <div style={{ 
        background: 'rgba(0,0,0,0.4)', 
        padding: '16px', 
        border: '1px solid var(--color-border)', 
        borderRadius: '12px', 
        maxHeight: '220px', 
        overflowY: 'auto' 
      }}>
        <div style={{ color: 'var(--color-text-muted)', marginBottom: '12px', fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.05em' }}>AI DECISION MATRIX</div>
        {moveResults.sorted && moveResults.sorted.map((m, idx) => {
          const mStr = JSON.stringify(m.move);
          const chosenStr = JSON.stringify(moveResults.chosen?.move);
          const isChosen = mStr === chosenStr;
          
          let color = 'rgba(255,255,255,0.4)';
          let fontWeight = '400';
          let background = 'transparent';
          if (isChosen) {
            color = '#fff';
            fontWeight = '600';
            background = 'rgba(16, 185, 129, 0.1)';
          }

          return (
            <div key={idx} style={{ 
              color, 
              fontWeight, 
              display: 'flex', 
              justifyContent: 'space-between', 
              padding: '6px 10px', 
              fontFamily: 'var(--mono)', 
              fontSize: '0.8rem', 
              borderRadius: '6px',
              marginBottom: '2px',
              backgroundColor: background,
              border: isChosen ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid transparent'
            }}>
              <span>{isChosen ? '→ ' : '  '}{mStr}</span>
              <span>{m.score.toFixed(2)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

