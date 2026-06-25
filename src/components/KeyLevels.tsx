import type { FC } from 'react';
import { Layers } from 'lucide-react';
import type { KeyLevelOption, KeyLevelSelection, KeyLevelsState, LiquidityOption } from '../types';

interface KeyLevelsProps {
  levels: KeyLevelsState;
  setLevels: (val: KeyLevelsState) => void;
}

const levelOptions: { value: KeyLevelOption; label: string }[] = [
  { value: '', label: 'Select level' },
  { value: 'Demand Zone', label: 'Demand Zone' },
  { value: 'Supply Zone', label: 'Supply Zone' },
  { value: 'Order Block', label: 'Order Block' },
];

const levelGroups = [
  { key: 'fourHour' as const, title: '4H Levels' },
  { key: 'oneHour' as const, title: '1H Levels' },
  { key: 'fifteenMinute' as const, title: '15M Levels' },
];

const liquidityOptions: LiquidityOption[] = [
  'Asia Swing High/Low',
  'Fair Value Gap',
  'Inducements',
  'Consolidations',
];

export const KeyLevels: FC<KeyLevelsProps> = ({ levels, setLevels }) => {
  const updateLevel = (
    timeframe: keyof KeyLevelsState,
    field: keyof KeyLevelSelection,
    value: KeyLevelOption,
  ) => {
    setLevels({
      ...levels,
      [timeframe]: {
        ...levels[timeframe],
        [field]: value,
      },
    });
  };

  const toggleLiquidity = (timeframe: keyof KeyLevelsState, value: LiquidityOption) => {
    const current = levels[timeframe].liquidity;
    const liquidity = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];

    setLevels({
      ...levels,
      [timeframe]: {
        ...levels[timeframe],
        liquidity,
      },
    });
  };

  return (
    <div className="glass-card workflow-card p-5 h-full" id="key-levels">
      <div className="flex items-center gap-3 pb-3 mb-4" style={{ borderBottom: '1px solid var(--border-primary)' }}>
        <div className="section-badge">
          <Layers size={16} />
        </div>
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
            High Timeframe Key Levels
          </h2>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            Entry and exit zones by timeframe
          </p>
        </div>
      </div>

      <div className="workflow-card-body key-level-stack">
        {levelGroups.map((group) => (
          <div
            key={group.key}
            className={`key-level-panel ${levels[group.key].entry ? 'has-entry-level' : ''} ${levels[group.key].exit ? 'has-exit-level' : ''} ${levels[group.key].liquidity.length ? 'has-liquidity-level' : ''}`}
          >
            <div className="flex items-center justify-between gap-3 mb-3">
              <span className="text-[10px] font-bold uppercase tracking-widest block" style={{ color: 'var(--text-muted)' }}>
                {group.title}
              </span>
              <div className="flex flex-wrap justify-end gap-1.5">
                {levels[group.key].entry && (
                  <span className="entry-level-badge">
                    Entry marked
                  </span>
                )}
                {levels[group.key].exit && (
                  <span className="exit-level-badge">
                    Exit marked
                  </span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block">
                <span className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
                  Entry Key Level
                </span>
                <select
                  value={levels[group.key].entry}
                  onChange={(event) => updateLevel(group.key, 'entry', event.target.value as KeyLevelOption)}
                  className="select-control"
                  aria-label={`${group.title} Entry Key Level`}
                >
                  {levelOptions.map((opt) => (
                    <option key={opt.label} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
                  Exit Key Level
                </span>
                <select
                  value={levels[group.key].exit}
                  onChange={(event) => updateLevel(group.key, 'exit', event.target.value as KeyLevelOption)}
                  className="select-control"
                  aria-label={`${group.title} Exit Key Level`}
                >
                  {levelOptions.map((opt) => (
                    <option key={opt.label} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-3">
              <span className="text-[10px] font-bold uppercase tracking-wider mb-2 block" style={{ color: 'var(--text-secondary)' }}>
                Liquidity
              </span>
              <div className="liquidity-button-grid">
                {liquidityOptions.map((item) => {
                  const active = levels[group.key].liquidity.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleLiquidity(group.key, item)}
                      className={`liquidity-button ${active ? 'active' : ''}`}
                      aria-pressed={active}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
