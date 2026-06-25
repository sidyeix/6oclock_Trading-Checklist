import type { FC } from 'react';
import { ShieldCheck } from 'lucide-react';
import type { NonNegotiablesState } from '../types';

interface NonNegotiablesProps {
  nonNegotiables: NonNegotiablesState;
  setNonNegotiables: (val: NonNegotiablesState) => void;
  compact?: boolean;
}

const items = [
  { key: 'protectCapital', label: 'Protect Capital', desc: 'Capital protection comes before opportunity' },
  { key: 'oneLossPerDay', label: '1 loss/day', desc: 'Stop trading after one losing trade' },
  { key: 'oneTradePerDay', label: '1 trade/day', desc: 'Only one quality execution per day' },
  { key: 'oneWinPerDay', label: '1 win/day', desc: 'Do not give back a finished day' },
  { key: 'emotionsRegulated', label: 'Emotions regulated', desc: 'Enter only when calm and objective' },
  { key: 'strictlyFollowingPlan', label: 'Strictly following plan', desc: 'No improvising outside the rules' },
] as const;

export const NonNegotiables: FC<NonNegotiablesProps> = ({
  nonNegotiables,
  setNonNegotiables,
  compact = false,
}) => {
  const toggle = (key: keyof NonNegotiablesState) => {
    setNonNegotiables({
      ...nonNegotiables,
      [key]: !nonNegotiables[key],
    });
  };

  const completedCount = items.filter((item) => nonNegotiables[item.key]).length;

  return (
    <div className={`glass-card ${compact ? 'p-3' : 'p-5'}`} id={compact ? 'non-negotiables-compact' : 'non-negotiables'}>
      <div
        className={`flex items-center gap-3 ${compact ? 'pb-2 mb-2' : 'pb-3 mb-4'}`}
        style={{ borderBottom: '1px solid var(--border-primary)' }}
      >
        <div className="section-badge">
          <ShieldCheck size={16} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
            Non-Negotiables
          </h2>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            {completedCount}/{items.length} reminders checked
          </p>
        </div>
      </div>

      <div className={compact ? 'grid grid-cols-2 sm:grid-cols-3 gap-2' : 'space-y-2.5'}>
        {items.map((item) => {
          const checked = nonNegotiables[item.key];
          return (
            <label
              key={item.key}
              className={`check-label flex items-start gap-3 cursor-pointer ${checked ? 'checked' : ''}`}
              style={compact ? { padding: '9px 10px' } : undefined}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(item.key)}
                className="sr-only"
              />
              <span
                className="w-4 h-4 rounded flex items-center justify-center transition-all mt-0.5 flex-shrink-0"
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
              </span>
              <span className="flex-1 min-w-0">
                <span className={`${compact ? 'text-[11px]' : 'text-xs'} font-semibold block check-text leading-tight`} style={{ color: checked ? 'var(--accent)' : 'var(--text-primary)' }}>
                  {item.label}
                </span>
                {!compact && (
                  <span className="text-[10px] block leading-tight mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {item.desc}
                  </span>
                )}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
};
