import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle, Info, Flame, Sparkles
} from 'lucide-react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { getDailyQuote } from './data/quotes';
import { ResetModal } from './components/ResetModal';
import { NonNegotiables } from './components/NonNegotiables';
import { ScoreEngine } from './components/ScoreEngine';
import { SessionChecklist } from './components/SessionChecklist';
import { TradingJournal } from './components/TradingJournal';
import { MobileVerdictFAB } from './components/MobileVerdictFAB';
import type {
  MarketStructureState, KeyLevelsState,
  SessionConfirmationState, EntryConfirmationState,
  RiskManagementState, PsychologyState, JournalState
} from './types';

// Default initial state for a trading day
const defaultMarketStructure: MarketStructureState = {
  bias4h: '', bias1h: '', bias15m: '',
  reason4h: '', reason1h: '', reason15m: '',
  confirm4h: false, confirm1h: false, confirm15m: false,
  htfAlignment: false,
  screenshot4h: '', screenshot1h: '', screenshot15m: ''
};

const defaultKeyLevels: KeyLevelsState = {
  at1hKeyLevel: false,
  at15mKeyLevel: false,
  freshSupplyZone: false,
  freshDemandZone: false,
  premiumArea: false,
  discountArea: false,
  dailyHighLiquidity: false,
  dailyLowLiquidity: false
};

const defaultSessionConfirmation: SessionConfirmationState = {
  sessionType: '',
  sessionAligns: false
};

const defaultEntryConfirmation: EntryConfirmationState = {
  entryType: '',
  liquiditySweep: false,
  engulfingCandle: false,
  mss: false,
  threeCandle: false,
  retest: false,
  structureShift: false
};

const defaultRiskManagement: RiskManagementState = {
  riskOnePercent: false,
  rrThreeToOne: false,
  slDefined: false,
  tpDefined: false,
};

const defaultPsychology: PsychologyState = {
  fear: 3,
  confidence: 7,
  patience: 7,
  focus: 8,
  greed: 2,
  frustration: 1,
  emotionStable: false,
  noFomo: false,
  followingPlan: false
};

const defaultJournal: JournalState = {
  whatDoISee: '',
  whyShouldPriceMove: '',
  whatInvalidates: '',
  whatEmotion: '',
  targetLiquidity: '',
  whatMistake: ''
};

export default function App() {
  const [currentDate, setCurrentDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Local Storage state hooks
  const [savedDate, setSavedDate] = useLocalStorage<string>('trading_edge_date', currentDate);
  const [marketStructure, setMarketStructure] = useLocalStorage<MarketStructureState>('trading_edge_ms', defaultMarketStructure);
  const [keyLevels, setKeyLevels] = useLocalStorage<KeyLevelsState>('trading_edge_kl', defaultKeyLevels);
  const [sessionConfirmation, setSessionConfirmation] = useLocalStorage<SessionConfirmationState>('trading_edge_sc', defaultSessionConfirmation);
  const [entryConfirmation, setEntryConfirmation] = useLocalStorage<EntryConfirmationState>('trading_edge_ec', defaultEntryConfirmation);
  const [riskManagement, setRiskManagement] = useLocalStorage<RiskManagementState>('trading_edge_rm', defaultRiskManagement);
  const [psychology, setPsychology] = useLocalStorage<PsychologyState>('trading_edge_psych', defaultPsychology);
  const [journal, setJournal] = useLocalStorage<JournalState>('trading_edge_journal', defaultJournal);

  const [isExecuted, setIsExecuted] = useLocalStorage<boolean>('trading_edge_executed', false);
  const [executedAt, setExecutedAt] = useLocalStorage<string>('trading_edge_executed_at', '');

  // Local session variables
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  // Real-time ticking clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Automatic Daily Reset Check
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setCurrentDate(today);

    if (savedDate !== today) {
      resetDailySession();
      setSavedDate(today);
      setNotification("New Trading Day Started. Previous Session Cleared.");
      setTimeout(() => setNotification(null), 8000);
    }
  }, [savedDate]);

  // Reset helper
  const resetDailySession = () => {
    setMarketStructure(defaultMarketStructure);
    setKeyLevels(defaultKeyLevels);
    setSessionConfirmation(defaultSessionConfirmation);
    setEntryConfirmation(defaultEntryConfirmation);
    setRiskManagement(defaultRiskManagement);
    setPsychology(defaultPsychology);
    setJournal(defaultJournal);
    setIsExecuted(false);
    setExecutedAt('');
  };

  const manualReset = () => {
    resetDailySession();
    setNotification("Trading Session Manually Reset.");
    setTimeout(() => setNotification(null), 4000);
  };

  // Score Math (Weights: MS 20%, KL 25%, EC 25%, RM 15%, Psych 15%)
  const calculateScore = (): number => {
    let score = 0;

    // Market Structure (Max 20%)
    if (marketStructure.confirm4h) score += 5;
    if (marketStructure.confirm1h) score += 5;
    if (marketStructure.confirm15m) score += 5;
    if (marketStructure.htfAlignment) score += 5;

    // Key Level (Max 25%)
    if (keyLevels.at1hKeyLevel) score += 5;
    if (keyLevels.at15mKeyLevel) score += 5;
    if (keyLevels.freshSupplyZone) score += 5;
    if (keyLevels.freshDemandZone) score += 5;
    if (keyLevels.dailyHighLiquidity || keyLevels.dailyLowLiquidity) score += 5;

    // Entry Confirmation (Max 25%)
    if (sessionConfirmation.sessionAligns) score += 5;
    if (entryConfirmation.entryType === 'Aggressive') {
      let count = 0;
      if (entryConfirmation.liquiditySweep) count++;
      if (entryConfirmation.mss) count++;
      if (entryConfirmation.engulfingCandle) count++;

      if (count === 1) score += 5;
      else if (count === 2) score += 10;
      else if (count === 3) score += 20;
    } else if (entryConfirmation.entryType === 'Conservative') {
      let count = 0;
      if (entryConfirmation.structureShift) count++;
      if (entryConfirmation.threeCandle) count++;
      if (entryConfirmation.retest) count++;

      if (count === 1) score += 5;
      else if (count === 2) score += 10;
      else if (count === 3) score += 20;
    }

    // Risk Management (Max 15%)
    if (riskManagement.riskOnePercent) score += 5;
    if (riskManagement.rrThreeToOne) score += 5;
    if (riskManagement.slDefined && riskManagement.tpDefined) score += 5;

    // Psychology (Max 15%)
    if (psychology.emotionStable) score += 5;
    if (psychology.noFomo) score += 5;
    if (psychology.followingPlan) score += 5;

    return Math.min(score, 100);
  };

  const calculateTotalConfluences = (): number => {
    let count = 0;
    if (marketStructure.confirm4h) count++;
    if (marketStructure.confirm1h) count++;
    if (marketStructure.confirm15m) count++;
    if (marketStructure.htfAlignment) count++;

    count += Object.values(keyLevels).filter(Boolean).length;

    if (sessionConfirmation.sessionAligns) count++;

    if (entryConfirmation.entryType === 'Aggressive') {
      if (entryConfirmation.liquiditySweep) count++;
      if (entryConfirmation.mss) count++;
      if (entryConfirmation.engulfingCandle) count++;
    } else if (entryConfirmation.entryType === 'Conservative') {
      if (entryConfirmation.structureShift) count++;
      if (entryConfirmation.threeCandle) count++;
      if (entryConfirmation.retest) count++;
    }

    count += Object.values(riskManagement).filter(val => val === true).length;

    if (psychology.emotionStable) count++;
    if (psychology.noFomo) count++;
    if (psychology.followingPlan) count++;

    return count;
  };

  const calculatePsychScore = (): number => {
    const { confidence, patience, focus, fear, greed, frustration } = psychology;
    return Math.round(((confidence + patience + focus + (10 - fear) + (10 - greed) + (10 - frustration)) / 6) * 10);
  };

  const checkRiskReady = (): boolean => {
    return !!(
      riskManagement.riskOnePercent &&
      riskManagement.rrThreeToOne &&
      riskManagement.slDefined &&
      riskManagement.tpDefined
    );
  };

  const checkPsychAcceptable = (): boolean => {
    const score = calculatePsychScore();
    const { fear, greed, frustration, focus, patience } = psychology;
    return !(score < 50 || fear >= 7 || greed >= 7 || frustration >= 7 || focus < 4 || patience < 4);
  };

  // Verdict label helper
  const getVerdictLabel = (s: number): string => {
    if (s >= 85) return 'A+ SETUP';
    if (s >= 70) return 'HIGH PROBABILITY';
    if (s >= 50) return 'WAIT';
    return 'NO TRADE';
  };

  const score = calculateScore();
  const totalConfluences = calculateTotalConfluences();
  const psychScore = calculatePsychScore();
  const isRiskReadyVal = checkRiskReady();
  const isPsychAcceptable = checkPsychAcceptable();
  const verdictLabel = getVerdictLabel(score);

  // Activator state for READY TO EXECUTE
  const isReadyToExecute = score >= 70 && isPsychAcceptable && isRiskReadyVal;

  const handleExecute = () => {
    if (!isReadyToExecute) return;
    setIsExecuted(true);
    setExecutedAt(new Date().toLocaleTimeString());
    setNotification("Trade Executed Successfully. Mindset Locked.");
    setTimeout(() => setNotification(null), 5000);
  };

  // Theme styling based on score thresholds
  let edgeThemeClass = "border-white/5 shadow-black/80";
  if (score >= 85) {
    edgeThemeClass = "border-amber-500/20 shadow-amber-950/10 animate-glow-gold";
  } else if (score >= 70) {
    edgeThemeClass = "border-emerald-500/20 shadow-emerald-950/10 animate-glow-green";
  }

  // Execution Gateway panel — reused in both desktop sidebar and mobile FAB
  const executionGatewayContent = (
    <>
      <div className={`glass-card p-6 border relative overflow-hidden transition-all duration-500 ${edgeThemeClass}`}>
        <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
          <span className="text-xs font-bold text-gray-400 tracking-widest uppercase">Execution Gateway</span>
          <span className="text-[10px] text-gray-500 font-mono">Discipline Lock</span>
        </div>

        <div className="space-y-4">
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 font-medium">1. Trade Quality Score (≥ 70%)</span>
              <span className={`font-bold font-mono ${score >= 70 ? 'text-emerald-400' : 'text-red-500'}`}>
                {score}% {score >= 70 ? "✓" : "✗"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 font-medium">2. Psychology Mindset</span>
              <span className={`font-bold font-mono ${isPsychAcceptable ? 'text-emerald-400' : 'text-red-500'}`}>
                {psychScore}% {isPsychAcceptable ? "✓" : "✗"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 font-medium">3. Risk Management Parameters</span>
              <span className={`font-bold font-mono ${isRiskReadyVal ? 'text-emerald-400' : 'text-red-500'}`}>
                {isRiskReadyVal ? "Ready ✓" : "Incomplete ✗"}
              </span>
            </div>
          </div>

          {isExecuted ? (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-center py-3.5 rounded-xl font-bold flex flex-col items-center justify-center gap-1 shadow-lg shadow-emerald-950/20">
              <div className="flex items-center gap-1.5 text-base">
                <CheckCircle size={18} />
                <span>SESSION SECURED</span>
              </div>
              <span className="text-[10px] font-mono opacity-80">Executed at {executedAt}</span>
            </div>
          ) : (
            <button
              disabled={!isReadyToExecute}
              onClick={handleExecute}
              className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                isReadyToExecute
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/20 scale-[1.01] hover:scale-[1.02]'
                  : 'bg-white/5 border border-white/5 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isReadyToExecute ? <Flame size={16} className="animate-pulse" /> : null}
              Ready To Execute
            </button>
          )}

          {!isReadyToExecute && (
            <div className="p-3 bg-amber-500/5 border border-amber-500/15 rounded-lg flex items-start gap-2.5">
              <Info size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-gray-400 leading-normal font-medium">
                To unlock the execution gateway, ensure your quality score is green (≥ 70%), risk check confluences are all complete, and emotional state is safe.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Motivation card */}
      {score >= 85 && (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-4 bg-amber-500/10 border border-amber-500/25 rounded-xl flex items-center gap-3 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-full blur-xl" />
          <Flame size={20} className="text-amber-400 animate-bounce flex-shrink-0" />
          <div>
            <p className="text-xs font-bold text-amber-300">🔥 A+ Setup Detected</p>
            <p className="text-[10px] text-gray-400 mt-0.5 font-light">"Patience created this setup. You waited for confirmation. Trade like a professional."</p>
          </div>
        </motion.div>
      )}
    </>
  );

  return (
    <div className="min-h-screen pb-12 px-4 md:px-8 max-w-7xl mx-auto space-y-6 pt-4">

      {/* Top Banner Notifications */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 glass-card px-5 py-3 border border-emerald-500/30 bg-emerald-950/80 text-emerald-300 text-xs font-bold flex items-center gap-3 shadow-xl"
          >
            <Sparkles size={16} className="text-amber-400 animate-spin" />
            <span>{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER SECTION */}
      <header className="glass-card p-6 border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        {/* Background glow overlay */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-12 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="h-2.5 w-2.5 bg-emerald-500 rounded-full animate-ping" />
            <h1 className="text-xl md:text-2xl font-black text-white tracking-wider font-mono">
              6O.CJFX TRADING EDGE
            </h1>
          </div>
          <p className="text-[10px] text-gray-400 tracking-widest font-bold uppercase">
            Discipline Cockpit & checklist engine
          </p>
        </div>

        {/* Quotes Scroller */}
        <div className="flex-1 max-w-md mx-auto hidden lg:block text-center px-4 py-2 border-l border-r border-white/5">
          <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest font-mono block mb-0.5">Daily Directives</span>
          <p className="text-xs text-gray-300 font-medium italic">
            "{getDailyQuote(currentDate)}"
          </p>
        </div>

        {/* Date, Time & Reset Action */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-white/5 pt-3 md:pt-0">
          <div className="text-right font-mono text-xs">
            <div className="text-white font-bold">{currentDate}</div>
            <div className="text-gray-400 mt-0.5">{currentTime}</div>
          </div>

          <button
            onClick={() => setIsResetOpen(true)}
            className="px-3.5 py-2 text-xs font-bold text-gray-300 hover:text-white bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg flex items-center gap-2 cursor-pointer transition-all shadow-md"
          >
            🔄 Reset Session
          </button>
        </div>
      </header>

      {/* DASHBOARD COCKPIT GRID */}
      <main className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">

        {/* Sticky left column: Non-Negotiables (desktop only) */}
        <section className="hidden lg:block lg:col-span-1 lg:sticky lg:top-6 space-y-6">
          <NonNegotiables />
        </section>

        {/* Mobile Non-Negotiables (collapsible would be nice, but keeping it simple) */}
        <section className="lg:hidden">
          <NonNegotiables />
        </section>

        {/* Checklist Inputs (2 cols width on LG) */}
        <section className="lg:col-span-2 space-y-6">
          <SessionChecklist
            marketStructure={marketStructure}
            setMarketStructure={setMarketStructure}
            keyLevels={keyLevels}
            setKeyLevels={setKeyLevels}
            sessionConfirmation={sessionConfirmation}
            setSessionConfirmation={setSessionConfirmation}
            entryConfirmation={entryConfirmation}
            setEntryConfirmation={setEntryConfirmation}
            riskManagement={riskManagement}
            setRiskManagement={setRiskManagement}
            psychology={psychology}
            setPsychology={setPsychology}
            journal={journal}
            setJournal={setJournal}
          />
        </section>

        {/* Sticky right column: Verdict Engine + Execution Gateway (desktop only) */}
        <section className="hidden lg:block lg:col-span-1 lg:sticky lg:top-6 space-y-6">
          <ScoreEngine score={score} confluencesCount={totalConfluences} />
          {executionGatewayContent}
        </section>
      </main>

      {/* TRADING JOURNAL (replaces old Analytics Center) */}
      <section className="border-t border-white/5 pt-8">
        <TradingJournal
          date={currentDate}
          marketStructure={marketStructure}
          keyLevels={keyLevels}
          sessionConfirmation={sessionConfirmation}
          entryConfirmation={entryConfirmation}
          riskManagement={riskManagement}
          psychology={psychology}
          journal={journal}
          score={score}
          psychScore={psychScore}
          confluencesCount={totalConfluences}
          isRiskReady={isRiskReadyVal}
          verdictLabel={verdictLabel}
          isExecuted={isExecuted}
          executedAt={executedAt}
        />
      </section>

      {/* MOBILE VERDICT FAB (only visible on mobile/tablet) */}
      <MobileVerdictFAB score={score} verdictLabel={verdictLabel}>
        <ScoreEngine score={score} confluencesCount={totalConfluences} />
        {executionGatewayContent}
      </MobileVerdictFAB>

      {/* CONFIRMATION MODALS */}
      <ResetModal
        isOpen={isResetOpen}
        onClose={() => setIsResetOpen(false)}
        onConfirm={manualReset}
      />

    </div>
  );
}
