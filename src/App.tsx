import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Sparkles, AlertTriangle } from 'lucide-react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { ThemeToggle } from './components/ThemeToggle';
import { DailyPreparation } from './components/DailyPreparation';
import { MarketStructure } from './components/MarketStructure';
import { KeyLevels } from './components/KeyLevels';
import { ExecutionParams } from './components/ExecutionParams';
import { NonNegotiables } from './components/NonNegotiables';
import { SessionSelector } from './components/SessionSelector';
import { TradingTimeline } from './components/TradingTimeline';
import { PDFExport } from './components/PDFExport';
import type {
  ThemeMode, DailyPrepState, MarketStructureState,
  KeyLevelsState, ExecutionParamsState, TimelineEntry, TradeScreenshots,
  TradingSession, NonNegotiablesState
} from './types';

// Default states
const defaultDailyPrep: DailyPrepState = { pdhMarked: false, pdlMarked: false };
const defaultMarketStructure: MarketStructureState = { bias4h: '', bias1h: '', bias15m: '' };
const defaultKeyLevels: KeyLevelsState = {
  demand4h: false, supply4h: false, orderBlock4h: false,
  demand1h: false, supply1h: false, orderBlock1h: false,
  demand15m: false, supply15m: false, orderBlock15m: false,
};
const defaultExecutionParams: ExecutionParamsState = {
  liquiditySweep: false, engulfingCandle: false, candleClosed: false,
  chochFormed: false, retestEntry: false, riskEntry: false,
};
const defaultNonNegotiables: NonNegotiablesState = {
  htfAlignment: false,
  liquiditySwept: false,
  rrValid: false,
};
const defaultScreenshots: TradeScreenshots = { htfScreenshot: '', entryScreenshot: '' };

export default function App() {
  const [currentDate, setCurrentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  // Theme
  const [theme, setTheme] = useLocalStorage<ThemeMode>('tj_theme', 'dark');

  // Daily session state
  const [savedDate, setSavedDate] = useLocalStorage<string>('tj_date', currentDate);
  const [dailyPrep, setDailyPrep] = useLocalStorage<DailyPrepState>('tj_prep', defaultDailyPrep);
  const [marketStructure, setMarketStructure] = useLocalStorage<MarketStructureState>('tj_ms', defaultMarketStructure);
  const [keyLevels, setKeyLevels] = useLocalStorage<KeyLevelsState>('tj_kl', defaultKeyLevels);
  const [executionParams, setExecutionParams] = useLocalStorage<ExecutionParamsState>('tj_exec', defaultExecutionParams);
  const [session, setSession] = useLocalStorage<TradingSession>('tj_session', '');
  const [nonNegotiables, setNonNegotiables] = useLocalStorage<NonNegotiablesState>('tj_nn', defaultNonNegotiables);
  const [timelineEntries, setTimelineEntries] = useLocalStorage<TimelineEntry[]>('tj_timeline', []);
  const [screenshots, setScreenshots] = useLocalStorage<TradeScreenshots>('tj_screenshots', defaultScreenshots);

  // UI state
  const [notification, setNotification] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Apply theme on mount
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Real-time clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Automatic daily reset
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setCurrentDate(today);
    if (savedDate !== today) {
      resetSession();
      setSavedDate(today);
      showNotification('New trading day started. Previous session cleared.');
    }
  }, [savedDate]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 5000);
  };

  const resetSession = () => {
    setDailyPrep(defaultDailyPrep);
    setMarketStructure(defaultMarketStructure);
    setKeyLevels(defaultKeyLevels);
    setExecutionParams(defaultExecutionParams);
    setSession('');
    setNonNegotiables(defaultNonNegotiables);
    setTimelineEntries([]);
    setScreenshots(defaultScreenshots);
  };

  const handleManualReset = () => {
    resetSession();
    setShowResetConfirm(false);
    showNotification('Session reset successfully.');
  };

  // Verdict engine logic
  const getVerdict = () => {
    const biases = [marketStructure.bias4h, marketStructure.bias1h, marketStructure.bias15m].filter(Boolean);
    if (biases.length === 0) {
      return {
        text: 'Establish Session Bias',
        desc: 'Select multi-timeframe bias to calculate session rules.',
        color: 'var(--text-secondary)',
        bgColor: 'var(--bg-elevated)',
        borderColor: 'var(--border-primary)',
      };
    }

    const hasBullish = biases.includes('Bullish');
    const hasBearish = biases.includes('Bearish');
    const hasRange = biases.includes('Range');

    if (hasRange || (hasBullish && hasBearish)) {
      return {
        text: 'NO TRADE',
        desc: 'Market is ranging or conflicting. Wait for clean structure alignment.',
        color: '#fbbf24',
        bgColor: 'rgba(251, 191, 36, 0.08)',
        borderColor: 'rgba(251, 191, 36, 0.25)',
      };
    }

    if (hasBullish) {
      return {
        text: 'Only trade Bullish positions',
        desc: 'Trend structure is aligned Bullish. Look for long triggers only.',
        color: 'var(--success)',
        bgColor: 'var(--success-muted)',
        borderColor: 'rgba(52, 211, 153, 0.25)',
      };
    }

    if (hasBearish) {
      return {
        text: 'Only trade Bearish positions',
        desc: 'Trend structure is aligned Bearish. Look for short triggers only.',
        color: '#ef4444',
        bgColor: 'rgba(239, 68, 68, 0.08)',
        borderColor: 'rgba(239, 68, 68, 0.25)',
      };
    }

    return {
      text: 'Establish Session Bias',
      desc: 'Select multi-timeframe bias to calculate session rules.',
      color: 'var(--text-secondary)',
      bgColor: 'var(--bg-elevated)',
      borderColor: 'var(--border-primary)',
    };
  };

  const verdict = getVerdict();

  return (
    <div className="min-h-screen pb-16 px-4 md:px-8 max-w-4xl mx-auto pt-4">

      {/* Notification Banner */}
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

      {/* Header */}
      <header
        className="glass-card p-5 mb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        id="app-header"
      >
        <div>
          <div className="flex items-center gap-2.5">
            <span
              className="h-2 w-2 rounded-full animate-pulse"
              style={{ background: 'var(--accent)' }}
            />
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
          {/* Date & Time */}
          <div className="text-right font-mono text-xs">
            <div className="font-bold" style={{ color: 'var(--text-primary)' }}>{currentDate}</div>
            <div className="mt-0.5" style={{ color: 'var(--text-muted)' }}>{currentTime}</div>
          </div>

          {/* Theme Toggle */}
          <ThemeToggle theme={theme} setTheme={setTheme} />

          {/* Reset Button */}
          <button
            onClick={() => setShowResetConfirm(true)}
            className="p-2.5 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-primary)',
              color: 'var(--text-secondary)',
            }}
            title="Reset Session"
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </header>

      {/* Dynamic Verdict Engine Banner */}
      <div
        className="glass-card p-4 mb-5 flex items-center gap-4 transition-all duration-300"
        style={{
          backgroundColor: verdict.bgColor,
          borderColor: verdict.borderColor,
        }}
      >
        <div
          className="p-2 rounded-lg"
          style={{
            background: 'var(--bg-elevated)',
            color: verdict.color,
          }}
        >
          <AlertTriangle size={18} />
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-widest font-bold" style={{ color: 'var(--text-muted)' }}>
            Current Verdict Rule
          </div>
          <h2 className="text-sm font-extrabold mt-0.5" style={{ color: verdict.color }}>
            {verdict.text}
          </h2>
          <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {verdict.desc}
          </p>
        </div>
      </div>

      {/* Main Sections */}
      <main className="space-y-5">
        {/* Section 1 — Daily Preparation */}
        <DailyPreparation prep={dailyPrep} setPrep={setDailyPrep} />

        {/* Row 1 — Market Structure & Key Levels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <MarketStructure structure={marketStructure} setStructure={setMarketStructure} />
          <KeyLevels levels={keyLevels} setLevels={setKeyLevels} />
        </div>

        {/* Row 2 — Execution Parameters & Session + Non Negotiables */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <ExecutionParams params={executionParams} setParams={setExecutionParams} />
          <div className="flex flex-col gap-5">
            <SessionSelector session={session} setSession={setSession} />
            <NonNegotiables nonNegotiables={nonNegotiables} setNonNegotiables={setNonNegotiables} />
          </div>
        </div>

        {/* Section 5 — Trading Timeline Journal (Primary Feature) */}
        <TradingTimeline entries={timelineEntries} setEntries={setTimelineEntries} />

        {/* PDF Export */}
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
          verdictText={verdict.text}
        />
      </main>

      {/* Reset Confirmation Modal */}
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
