import type { FC } from 'react';
import { Check, TrendingUp } from 'lucide-react';
import type { BiasOption, MarketStructureState } from '../types';

interface MarketStructureProps {
  structure: MarketStructureState;
  setStructure: (val: MarketStructureState) => void;
}

const biasOptions: { value: BiasOption; label: string }[] = [
  { value: '', label: 'Select bias' },
  { value: 'Bullish', label: 'Bullish' },
  { value: 'Bearish', label: 'Bearish' },
  { value: 'Range', label: 'Range' },
];

const timeframes = [
  {
    biasKey: 'bias4h' as const,
    noteKey: 'note4h' as const,
    confirmedKey: 'confirmed4h' as const,
    label: '4H Bias',
    noteLabel: '4H bias note',
  },
  {
    biasKey: 'bias1h' as const,
    noteKey: 'note1h' as const,
    confirmedKey: 'confirmed1h' as const,
    label: '1H Bias',
    noteLabel: '1H bias note',
  },
  {
    biasKey: 'bias15m' as const,
    noteKey: 'note15m' as const,
    confirmedKey: 'confirmed15m' as const,
    label: '15M Bias',
    noteLabel: '15M bias note',
  },
];

const biasClass = (bias: BiasOption) => {
  if (bias === 'Bullish') return 'bias-state-bullish';
  if (bias === 'Bearish') return 'bias-state-bearish';
  if (bias === 'Range') return 'bias-state-range';
  return '';
};

export const MarketStructure: FC<MarketStructureProps> = ({ structure, setStructure }) => {
  const setBias = (
    biasKey: 'bias4h' | 'bias1h' | 'bias15m',
    confirmedKey: 'confirmed4h' | 'confirmed1h' | 'confirmed15m',
    value: BiasOption,
  ) => {
    setStructure({ ...structure, [biasKey]: value, [confirmedKey]: false });
  };

  const setNote = (
    noteKey: 'note4h' | 'note1h' | 'note15m',
    value: string,
  ) => {
    setStructure({ ...structure, [noteKey]: value });
  };

  const confirmBias = (confirmedKey: 'confirmed4h' | 'confirmed1h' | 'confirmed15m') => {
    setStructure({ ...structure, [confirmedKey]: true });
  };

  return (
    <div className="glass-card workflow-card p-5 h-full" id="market-structure">
      <div className="flex items-center gap-3 pb-3 mb-4" style={{ borderBottom: '1px solid var(--border-primary)' }}>
        <div className="section-badge">
          <TrendingUp size={16} />
        </div>
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
            Multi-Timeframe Market Structure
          </h2>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            Confirm each bias and record the reason behind it
          </p>
        </div>
      </div>

      <div className="workflow-card-body market-structure-stack">
        {timeframes.map((tf) => {
          const bias = structure[tf.biasKey];
          const confirmed = structure[tf.confirmedKey];

          return (
            <div
              key={tf.biasKey}
              className={`bias-state-panel market-structure-panel ${biasClass(bias)} ${confirmed ? 'bias-state-confirmed' : ''}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                <label className="block flex-1">
                  <span className="text-xs font-bold uppercase tracking-wider block mb-2" style={{ color: 'var(--text-secondary)' }}>
                    {tf.label}
                  </span>
                  <select
                    value={bias}
                    onChange={(event) => setBias(tf.biasKey, tf.confirmedKey, event.target.value as BiasOption)}
                    className="select-control"
                    aria-label={tf.label}
                  >
                    {biasOptions.map((opt) => (
                      <option key={opt.label} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </label>

                <button
                  type="button"
                  onClick={() => confirmBias(tf.confirmedKey)}
                  disabled={!bias}
                  className="confirm-bias-button"
                  aria-pressed={confirmed}
                >
                  <Check size={14} />
                  {confirmed ? 'Confirmed' : 'Confirm'}
                </button>
              </div>

              <label className="block mt-3 market-note-label">
                <span className="sr-only">{tf.noteLabel}</span>
                <textarea
                  value={structure[tf.noteKey]}
                  onChange={(event) => setNote(tf.noteKey, event.target.value)}
                  placeholder={`Paste why ${tf.label.replace(' Bias', '')} is bullish, bearish, or ranging...`}
                  className="note-control market-note-control"
                  rows={4}
                />
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
};
