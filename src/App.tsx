import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { RotateCcw, Sparkles } from 'lucide-react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { ThemeToggle } from './components/ThemeToggle';
import { DailyPreparation } from './components/DailyPreparation';
import { MarketStructure } from './components/MarketStructure';
import { KeyLevels } from './components/KeyLevels';
import { ExecutionParams } from './components/ExecutionParams';
import { NonNegotiables } from './components/NonNegotiables';
import { VerdictPanel } from './components/VerdictPanel';
import { TradingTimeline } from './components/TradingTimeline';
import { PDFExport } from './components/PDFExport';
import type {
  BiasOption,
  DailyPrepState,
  ExecutionParamsState,
  KeyLevelOption,
  KeyLevelsState,
  LiquidityOption,
  MarketStructureState,
  NonNegotiablesState,
  ThemeMode,
  TimelineEntry,
  TradeScreenshots,
  TradingSession,
  VerdictOption,
} from './types';

const defaultDailyPrep: DailyPrepState = { pdhMarked: false, pdlMarked: false };
const defaultMarketStructure: MarketStructureState = {
  bias4h: '',
  bias1h: '',
  bias15m: '',
  note4h: '',
  note1h: '',
  note15m: '',
  confirmed4h: false,
  confirmed1h: false,
  confirmed15m: false,
};
const defaultKeyLevels: KeyLevelsState = {
  fourHour: { entry: '', exit: '', liquidity: [] },
  oneHour: { entry: '', exit: '', liquidity: [] },
  fifteenMinute: { entry: '', exit: '', liquidity: [] },
};
const defaultExecutionParams: ExecutionParamsState = {
  model: '',
  liquiditySweep: false,
  engulfingCandle: false,
  candleClosed: false,
  chochFormed: false,
  retestEntry: false,
  riskEntry: false,
};
const defaultNonNegotiables: NonNegotiablesState = {
  protectCapital: false,
  oneLossPerDay: false,
  oneTradePerDay: false,
  oneWinPerDay: false,
  emotionsRegulated: false,
  strictlyFollowingPlan: false,
};
const defaultScreenshots: TradeScreenshots = { htfScreenshot: '', entryScreenshot: '' };

const liquidityOptions: LiquidityOption[] = ['Asia Swing High/Low', 'Fair Value Gap', 'Inducements', 'Consolidations'];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const normalizeBoolean = (value: unknown) => typeof value === 'boolean' ? value : false;

const normalizeKeyLevelOption = (value: unknown): KeyLevelOption =>
  value === 'Demand Zone' || value === 'Supply Zone' || value === 'Order Block' ? value : '';

const normalizeBiasOption = (value: unknown) =>
  value === 'Bullish' || value === 'Bearish' || value === 'Range' ? value : '';

const normalizeString = (value: unknown) => typeof value === 'string' ? value : '';

const normalizeLiquidityOption = (value: unknown): LiquidityOption | '' => {
  if (value === 'Asia Swing High') return 'Asia Swing High/Low';
  return liquidityOptions.includes(value as LiquidityOption) ? value as LiquidityOption : '';
};

const normalizeLiquidity = (value: unknown): LiquidityOption[] => {
  if (!Array.isArray(value)) return [];
  return Array.from(new Set(value.map(normalizeLiquidityOption).filter((item): item is LiquidityOption => Boolean(item))));
};

const normalizeMarketStructure = (value: unknown): MarketStructureState => {
  if (!isRecord(value)) return defaultMarketStructure;

  return {
    bias4h: normalizeBiasOption(value.bias4h),
    bias1h: normalizeBiasOption(value.bias1h),
    bias15m: normalizeBiasOption(value.bias15m),
    note4h: normalizeString(value.note4h),
    note1h: normalizeString(value.note1h),
    note15m: normalizeString(value.note15m),
    confirmed4h: normalizeBoolean(value.confirmed4h),
    confirmed1h: normalizeBoolean(value.confirmed1h),
    confirmed15m: normalizeBoolean(value.confirmed15m),
  };
};

const firstLegacyLevel = (value: Record<string, unknown>, fields: string[]): KeyLevelOption => {
  for (const field of fields) {
    if (value[field] === true) {
      if (field.toLowerCase().includes('demand')) return 'Demand Zone';
      if (field.toLowerCase().includes('supply')) return 'Supply Zone';
      if (field.toLowerCase().includes('orderblock')) return 'Order Block';
    }
  }

  return '';
};

const normalizeKeyLevels = (value: unknown): KeyLevelsState => {
  if (!isRecord(value)) return defaultKeyLevels;

  if (isRecord(value.fourHour) || isRecord(value.oneHour) || isRecord(value.fifteenMinute)) {
    return {
      fourHour: {
        entry: normalizeKeyLevelOption(isRecord(value.fourHour) ? value.fourHour.entry : ''),
        exit: normalizeKeyLevelOption(isRecord(value.fourHour) ? value.fourHour.exit : ''),
        liquidity: normalizeLiquidity(isRecord(value.fourHour) ? value.fourHour.liquidity : []),
      },
      oneHour: {
        entry: normalizeKeyLevelOption(isRecord(value.oneHour) ? value.oneHour.entry : ''),
        exit: normalizeKeyLevelOption(isRecord(value.oneHour) ? value.oneHour.exit : ''),
        liquidity: normalizeLiquidity(isRecord(value.oneHour) ? value.oneHour.liquidity : []),
      },
      fifteenMinute: {
        entry: normalizeKeyLevelOption(isRecord(value.fifteenMinute) ? value.fifteenMinute.entry : ''),
        exit: normalizeKeyLevelOption(isRecord(value.fifteenMinute) ? value.fifteenMinute.exit : ''),
        liquidity: normalizeLiquidity(isRecord(value.fifteenMinute) ? value.fifteenMinute.liquidity : []),
      },
    };
  }

  return {
    fourHour: { entry: firstLegacyLevel(value, ['demand4h', 'supply4h', 'orderBlock4h']), exit: '', liquidity: [] },
    oneHour: { entry: firstLegacyLevel(value, ['demand1h', 'supply1h', 'orderBlock1h']), exit: '', liquidity: [] },
    fifteenMinute: { entry: firstLegacyLevel(value, ['demand15m', 'supply15m', 'orderBlock15m']), exit: '', liquidity: [] },
  };
};

const normalizeExecutionParams = (value: unknown): ExecutionParamsState => {
  if (!isRecord(value)) return defaultExecutionParams;

  const aggressive = {
    liquiditySweep: normalizeBoolean(value.liquiditySweep),
    engulfingCandle: normalizeBoolean(value.engulfingCandle),
    candleClosed: normalizeBoolean(value.candleClosed),
  };
  const conservative = {
    chochFormed: normalizeBoolean(value.chochFormed),
    retestEntry: normalizeBoolean(value.retestEntry),
    riskEntry: normalizeBoolean(value.riskEntry),
  };
  const hasAggressive = Object.values(aggressive).some(Boolean);
  const hasConservative = Object.values(conservative).some(Boolean);
  const model = value.model === 'Aggressive' || value.model === 'Conservative'
    ? value.model
    : hasAggressive
      ? 'Aggressive'
      : hasConservative
        ? 'Conservative'
        : '';

  return {
    model,
    liquiditySweep: model === 'Aggressive' ? aggressive.liquiditySweep : false,
    engulfingCandle: model === 'Aggressive' ? aggressive.engulfingCandle : false,
    candleClosed: model === 'Aggressive' ? aggressive.candleClosed : false,
    chochFormed: model === 'Conservative' ? conservative.chochFormed : false,
    retestEntry: model === 'Conservative' ? conservative.retestEntry : false,
    riskEntry: model === 'Conservative' ? conservative.riskEntry : false,
  };
};

const normalizeNonNegotiables = (value: unknown): NonNegotiablesState => {
  if (!isRecord(value)) return defaultNonNegotiables;

  return {
    protectCapital: normalizeBoolean(value.protectCapital),
    oneLossPerDay: normalizeBoolean(value.oneLossPerDay),
    oneTradePerDay: normalizeBoolean(value.oneTradePerDay),
    oneWinPerDay: normalizeBoolean(value.oneWinPerDay),
    emotionsRegulated: normalizeBoolean(value.emotionsRegulated),
    strictlyFollowingPlan: normalizeBoolean(value.strictlyFollowingPlan),
  };
};

const calculateVerdictStats = (marketStructure: MarketStructureState) => {
  const biases: BiasOption[] = [
    marketStructure.bias4h,
    marketStructure.bias1h,
    marketStructure.bias15m,
  ].filter((bias): bias is Exclude<BiasOption, ''> => Boolean(bias));
  const total = biases.length;
  const bullish = biases.filter((bias) => bias === 'Bullish').length;
  const bearish = biases.filter((bias) => bias === 'Bearish').length;
  const range = biases.filter((bias) => bias === 'Range').length;
  const max = Math.max(bullish, bearish, range);
  const leaders = [
    bullish === max && bullish > 0 ? 'Bullish' : '',
    bearish === max && bearish > 0 ? 'Bearish' : '',
    range === max && range > 0 ? 'Range' : '',
  ].filter(Boolean);

  return {
    label: total === 0 ? '' as VerdictOption : leaders.length !== 1 ? 'No Trade' as VerdictOption : leaders[0] as VerdictOption,
    percent: total ? Math.round((max / total) * 100) : 0,
    bullish,
    bearish,
    range,
    total,
  };
};

export default function App() {
  const [currentDate, setCurrentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  const [theme, setTheme] = useLocalStorage<ThemeMode>('tj_theme', 'dark');
  const [savedDate, setSavedDate] = useLocalStorage<string>('tj_date', currentDate);
  const [dailyPrep, setDailyPrep] = useLocalStorage<DailyPrepState>('tj_prep', defaultDailyPrep);
  const [marketStructure, setMarketStructure] = useLocalStorage<MarketStructureState>('tj_ms', defaultMarketStructure, normalizeMarketStructure);
  const [keyLevels, setKeyLevels] = useLocalStorage<KeyLevelsState>('tj_kl', defaultKeyLevels, normalizeKeyLevels);
  const [executionParams, setExecutionParams] = useLocalStorage<ExecutionParamsState>('tj_exec', defaultExecutionParams, normalizeExecutionParams);
  const [session, setSession] = useLocalStorage<TradingSession>('tj_session', '');
  const [nonNegotiables, setNonNegotiables] = useLocalStorage<NonNegotiablesState>('tj_nn', defaultNonNegotiables, normalizeNonNegotiables);
  const [timelineEntries, setTimelineEntries] = useLocalStorage<TimelineEntry[]>('tj_timeline', []);
  const [screenshots, setScreenshots] = useLocalStorage<TradeScreenshots>('tj_screenshots', defaultScreenshots);

  const [notification, setNotification] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const showNotification = useCallback((msg: string) => {
    setNotification(msg);
    window.setTimeout(() => setNotification(null), 5000);
  }, []);

  const resetSession = useCallback(() => {
    setDailyPrep(defaultDailyPrep);
    setMarketStructure(defaultMarketStructure);
    setKeyLevels(defaultKeyLevels);
    setExecutionParams(defaultExecutionParams);
    setSession('');
    setNonNegotiables(defaultNonNegotiables);
    setTimelineEntries([]);
    setScreenshots(defaultScreenshots);
  }, [
    setDailyPrep,
    setExecutionParams,
    setKeyLevels,
    setMarketStructure,
    setNonNegotiables,
    setScreenshots,
    setSession,
    setTimelineEntries,
  ]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const updateCursorGlow = (event: PointerEvent) => {
      document.documentElement.style.setProperty('--cursor-x', `${event.clientX}px`);
      document.documentElement.style.setProperty('--cursor-y', `${event.clientY}px`);
    };

    window.addEventListener('pointermove', updateCursorGlow, { passive: true });
    return () => window.removeEventListener('pointermove', updateCursorGlow);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
      const today = new Date().toISOString().split('T')[0];
      setCurrentDate((prevDate) => prevDate === today ? prevDate : today);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    if (savedDate !== today) {
      window.setTimeout(() => {
        resetSession();
        setSavedDate(today);
        showNotification('New trading day started. Previous session cleared.');
      }, 0);
    }
  }, [savedDate, setSavedDate, resetSession, showNotification]);

  const handleManualReset = () => {
    resetSession();
    setShowResetConfirm(false);
    showNotification('Session reset successfully.');
  };

  const verdictStats = calculateVerdictStats(marketStructure);
  const activeVerdict = verdictStats.label;

  return (
    <div className="relative z-10 min-h-screen pb-16 px-4 md:px-8 max-w-7xl mx-auto pt-4">
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-5 py-3 rounded-xl text-xs font-bold flex items-center gap-3 shadow-xl"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-active)',
              color: 'var(--accent)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <Sparkles size={14} />
            <span>{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <header
        className="glass-card p-5 mb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        id="app-header"
      >
        <div>
          <div className="flex items-center gap-2.5">
            <span className="h-2 w-2 rounded-full animate-pulse" style={{ background: 'var(--accent)' }} />
            <h1
              className="text-lg md:text-xl font-extrabold tracking-wide"
              style={{ color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif" }}
            >
              6O.CJFX Trading Journal
            </h1>
          </div>
          <p className="text-[10px] mt-0.5 uppercase tracking-widest font-semibold" style={{ color: 'var(--text-muted)' }}>
            Discretionary Trading Workspace
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="text-right font-mono text-xs">
            <div className="font-bold" style={{ color: 'var(--text-primary)' }}>{currentDate}</div>
            <div className="mt-0.5" style={{ color: 'var(--text-muted)' }}>{currentTime}</div>
          </div>

          <ThemeToggle theme={theme} setTheme={setTheme} />

          <button
            onClick={() => setShowResetConfirm(true)}
            className="p-2.5 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-primary)',
              color: 'var(--text-secondary)',
            }}
            title="Reset Session"
            aria-label="Reset session"
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </header>

      <div className="lg:hidden sticky top-3 z-30 mb-5">
        <div className="space-y-3">
          <VerdictPanel
            marketStructure={marketStructure}
            stats={verdictStats}
            activeVerdict={activeVerdict}
            compact
          />
          <NonNegotiables
            nonNegotiables={nonNegotiables}
            setNonNegotiables={setNonNegotiables}
            compact
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-5 items-start">
        <div className="min-w-0">
          <main className="space-y-5">
            <DailyPreparation prep={dailyPrep} setPrep={setDailyPrep} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
              <MarketStructure structure={marketStructure} setStructure={setMarketStructure} />
              <KeyLevels levels={keyLevels} setLevels={setKeyLevels} />
            </div>

            <ExecutionParams
              params={executionParams}
              setParams={setExecutionParams}
              session={session}
              setSession={setSession}
            />

            <TradingTimeline entries={timelineEntries} setEntries={setTimelineEntries} />

            <PDFExport
              date={currentDate}
              dailyPrep={dailyPrep}
              marketStructure={marketStructure}
              keyLevels={keyLevels}
              executionParams={executionParams}
              timelineEntries={timelineEntries}
              screenshots={screenshots}
              setScreenshots={setScreenshots}
              session={session}
              nonNegotiables={nonNegotiables}
              verdictText={activeVerdict || 'Establish Session Bias'}
            />
          </main>
        </div>

        <aside className="hidden lg:block sticky top-4 space-y-5">
          <VerdictPanel
            marketStructure={marketStructure}
            stats={verdictStats}
            activeVerdict={activeVerdict}
          />
          <NonNegotiables
            nonNegotiables={nonNegotiables}
            setNonNegotiables={setNonNegotiables}
          />
        </aside>
      </div>

      <AnimatePresence>
        {showResetConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)' }}
            onClick={() => setShowResetConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                Reset Trading Session?
              </h3>
              <p className="text-xs mb-5 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                This will clear all sections including market structure, key levels, execution parameters, session, non-negotiables, timeline entries, and uploaded screenshots.
              </p>
              <div className="flex gap-2.5">
                <button
                  onClick={handleManualReset}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all"
                  style={{ background: '#ef4444', color: '#fff' }}
                >
                  Reset Session
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-primary)', color: 'var(--text-secondary)' }}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
