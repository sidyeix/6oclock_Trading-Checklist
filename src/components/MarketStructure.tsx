import type { FC } from 'react';
import { TrendingUp } from 'lucide-react';
import type { MarketStructureState, BiasOption } from '../types';

interface MarketStructureProps {
  structure: MarketStructureState;
  setStructure: (val: MarketStructureState) => void;
}

const biasOptions: { value: BiasOption; label: string; activeClass: string }[] = [
  { value: 'Bullish', label: '📈 Bullish', activeClass: 'active-bullish' },
  { value: 'Bearish', label: '📉 Bearish', activeClass: 'active-bearish' },
  { value: 'Range', label: '↔ Range', activeClass: 'active-range' },
];

const timeframes = [
  { key: 'bias4h' as const, label: '4H Bias' },
  { key: 'bias1h' as const, label: '1H Bias' },
  { key: 'bias15m' as const, label: '15M Bias' },
];

export const MarketStructure: FC<MarketStructureProps> = ({ structure, setStructure }) => {
  const setBias = (field: keyof MarketStructureState, value: BiasOption) => {
    // Toggle off if already selected
    const newValue = structure[field] === value ? '' : value;
    setStructure({ ...structure, [field]: newValue });
  };

  return (
    <div className="glass-card p-5 h-full" id="market-structure">
      <div className="flex items-center gap-3 pb-3 mb-4" style={{ borderBottom: '1px solid var(--border-primary)' }}>
        <div className="section-badge">
          <TrendingUp size={16} />
        </div>
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
            Multi-Timeframe Market Structure
          </h2>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            Quick reminder of current market direction
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {timeframes.map((tf) => (
          <div
            key={tf.key}
            className="p-4 rounded-xl"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-primary)' }}
          >
            <span className="text-xs font-bold uppercase tracking-wider block mb-3" style={{ color: 'var(--text-secondary)' }}>
              {tf.label}
            </span>
            <div className="flex flex-wrap gap-2">
              {biasOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setBias(tf.key, opt.value)}
                  className={`bias-pill ${structure[tf.key] === opt.value ? opt.activeClass : ''}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
