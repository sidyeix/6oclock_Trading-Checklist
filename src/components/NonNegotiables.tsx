import type { FC } from 'react';
import { ShieldCheck } from 'lucide-react';
import type { NonNegotiablesState } from '../types';

interface NonNegotiablesProps {
  nonNegotiables: NonNegotiablesState;
  setNonNegotiables: (val: NonNegotiablesState) => void;
}

export const NonNegotiables: FC<NonNegotiablesProps> = ({ nonNegotiables, setNonNegotiables }) => {
  const toggle = (key: keyof NonNegotiablesState) => {
    setNonNegotiables({
      ...nonNegotiables,
      [key]: !nonNegotiables[key],
    });
  };

  const items = [
    { key: 'htfAlignment', label: 'HTF Alignment', desc: 'Daily & 4H structure aligned with trade direction' },
    { key: 'liquiditySwept', label: 'Liquidity Pool Swept', desc: 'Previous session/daily high/low or inducement swept' },
    { key: 'rrValid', label: 'R:R Ratio Valid', desc: 'Minimum 1:2 risk-to-reward ratio setup confirmed' },
  ] as const;

  return (
    <div className="glass-card p-5" id="non-negotiables">
      <div className="flex items-center gap-3 pb-3 mb-4" style={{ borderBottom: '1px solid var(--border-primary)' }}>
        <div className="section-badge">
          <ShieldCheck size={16} />
        </div>
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
            Non-Negotiables
          </h2>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            Must be met before initiating any position
          </p>
        </div>
      </div>

      <div className="space-y-2.5">
        {items.map((item) => {
          const checked = nonNegotiables[item.key];
          return (
            <label
              key={item.key}
              className={`check-label flex items-start gap-3 cursor-pointer ${checked ? 'checked' : ''}`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(item.key)}
                className="sr-only"
              />
              <div
                className="w-4 h-4 rounded flex items-center justify-center transition-all mt-0.5"
                style={{
                  border: `1.5px solid ${checked ? 'var(--accent)' : 'var(--text-muted)'}`,
                  background: checked ? 'var(--accent)' : 'transparent',
                }}
              >
                {checked && (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <span className="text-xs font-semibold block check-text" style={{ color: checked ? 'var(--accent)' : 'var(--text-primary)' }}>
                  {item.label}
                </span>
                <span className="text-[10px] block leading-tight mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {item.desc}
                </span>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
};
