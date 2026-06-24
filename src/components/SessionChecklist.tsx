import { useRef } from 'react';
import type { FC, ChangeEvent } from 'react';
import {
  TrendingUp, Key, Clock, Percent, Heart, BookOpen, AlertCircle, Upload, X, Image as ImageIcon
} from 'lucide-react';
import type {
  MarketStructureState, KeyLevelsState, SessionConfirmationState,
  EntryConfirmationState, RiskManagementState, PsychologyState, JournalState
} from '../types';

interface SessionChecklistProps {
  marketStructure: MarketStructureState;
  setMarketStructure: (val: MarketStructureState) => void;
  keyLevels: KeyLevelsState;
  setKeyLevels: (val: KeyLevelsState) => void;
  sessionConfirmation: SessionConfirmationState;
  setSessionConfirmation: (val: SessionConfirmationState) => void;
  entryConfirmation: EntryConfirmationState;
  setEntryConfirmation: (val: EntryConfirmationState) => void;
  riskManagement: RiskManagementState;
  setRiskManagement: (val: RiskManagementState) => void;
  psychology: PsychologyState;
  setPsychology: (val: PsychologyState) => void;
  journal: JournalState;
  setJournal: (val: JournalState) => void;
}

export const SessionChecklist: FC<SessionChecklistProps> = ({
  marketStructure, setMarketStructure,
  keyLevels, setKeyLevels,
  sessionConfirmation, setSessionConfirmation,
  entryConfirmation, setEntryConfirmation,
  riskManagement, setRiskManagement,
  psychology, setPsychology,
  journal, setJournal
}) => {

  // File input refs for screenshots
  const fileRef4h = useRef<HTMLInputElement>(null);
  const fileRef1h = useRef<HTMLInputElement>(null);
  const fileRef15m = useRef<HTMLInputElement>(null);

  // Update handlers
  const updateMS = (fields: Partial<MarketStructureState>) => {
    setMarketStructure({ ...marketStructure, ...fields });
  };

  const updateKL = (fields: Partial<KeyLevelsState>) => {
    setKeyLevels({ ...keyLevels, ...fields });
  };

  const updateSC = (fields: Partial<SessionConfirmationState>) => {
    setSessionConfirmation({ ...sessionConfirmation, ...fields });
  };

  const updateEC = (fields: Partial<EntryConfirmationState>) => {
    setEntryConfirmation({ ...entryConfirmation, ...fields });
  };

  const updateRM = (fields: Partial<RiskManagementState>) => {
    setRiskManagement({ ...riskManagement, ...fields });
  };

  const updatePsych = (fields: Partial<PsychologyState>) => {
    setPsychology({ ...psychology, ...fields });
  };

  const updateJournal = (fields: Partial<JournalState>) => {
    setJournal({ ...journal, ...fields });
  };

  // Screenshot handler — compress to max 800px width
  const handleScreenshot = (field: 'screenshot4h' | 'screenshot1h' | 'screenshot15m', e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = (height * MAX_WIDTH) / width;
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', 0.75);
        updateMS({ [field]: compressed });
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);

    // Reset input so same file can be re-uploaded
    e.target.value = '';
  };

  // Psychology Score and State derivation
  const calculatePsychScore = () => {
    const { confidence, patience, focus, fear, greed, frustration } = psychology;
    return Math.round(((confidence + patience + focus + (10 - fear) + (10 - greed) + (10 - frustration)) / 6) * 10);
  };

  const getPsychState = (score: number) => {
    const { fear, greed, frustration, focus, patience } = psychology;
    if (score < 50 || fear >= 7 || greed >= 7 || frustration >= 7 || focus < 4 || patience < 4) {
      return { label: "Not Suitable To Trade", color: "text-red-500 bg-red-500/10 border-red-500/20", icon: "🔴" };
    } else if (score < 75 || fear >= 5 || greed >= 5 || frustration >= 5) {
      return { label: "Caution", color: "text-amber-500 bg-amber-500/10 border-amber-500/20", icon: "🟡" };
    } else {
      return { label: "Optimal Trading State", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", icon: "🟢" };
    }
  };

  const psychScore = calculatePsychScore();
  const psychState = getPsychState(psychScore);

  // Risk Checkboxes verification
  const isRiskReady =
    riskManagement.riskOnePercent &&
    riskManagement.rrThreeToOne &&
    riskManagement.slDefined &&
    riskManagement.tpDefined;

  // Timeframe config with screenshot fields and refs
  const timeframes = [
    { key: '4h', label: '4H Timeframe Bias', dropdown: marketStructure.bias4h, reason: marketStructure.reason4h, confirmed: marketStructure.confirm4h, screenshot: marketStructure.screenshot4h, fieldBias: 'bias4h', fieldReason: 'reason4h', fieldConfirm: 'confirm4h', fieldScreenshot: 'screenshot4h' as const, fileRef: fileRef4h },
    { key: '1h', label: '1H Timeframe Bias', dropdown: marketStructure.bias1h, reason: marketStructure.reason1h, confirmed: marketStructure.confirm1h, screenshot: marketStructure.screenshot1h, fieldBias: 'bias1h', fieldReason: 'reason1h', fieldConfirm: 'confirm1h', fieldScreenshot: 'screenshot1h' as const, fileRef: fileRef1h },
    { key: '15m', label: '15M Timeframe Bias', dropdown: marketStructure.bias15m, reason: marketStructure.reason15m, confirmed: marketStructure.confirm15m, screenshot: marketStructure.screenshot15m, fieldBias: 'bias15m', fieldReason: 'reason15m', fieldConfirm: 'confirm15m', fieldScreenshot: 'screenshot15m' as const, fileRef: fileRef15m },
  ];

  return (
    <div className="space-y-6">

      {/* SECTION 3 — TOP DOWN ANALYSIS */}
      <div className="glass-card glass-card-hover p-6 border border-white/5">
        <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-4">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-lg">
            <TrendingUp size={18} />
          </div>
          <div>
            <h3 className="text-md font-bold text-white uppercase tracking-wider">Section 3 — Market Structure</h3>
            <p className="text-xs text-gray-400">Validate higher and lower timeframe bias confluences (Weight: 20%)</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Timeframe Bias Grids with Screenshot Support */}
          {timeframes.map((tf) => (
            <div key={tf.key} className="p-4 bg-white/3 border border-white/5 rounded-xl space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-sm font-bold text-gray-200">{tf.label}</span>
                <div className="flex items-center gap-4">
                  <select
                    value={tf.dropdown}
                    onChange={(e) => updateMS({ [tf.fieldBias]: e.target.value })}
                    className="bg-[#12131a] text-xs font-semibold text-gray-300 border border-white/10 rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">Select Bias...</option>
                    <option value="Bullish">📈 Bullish</option>
                    <option value="Bearish">📉 Bearish</option>
                    <option value="Ranging">↔ Ranging</option>
                  </select>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-300">
                    <input
                      type="checkbox"
                      checked={tf.confirmed}
                      onChange={(e) => updateMS({ [tf.fieldConfirm]: e.target.checked })}
                      className="rounded border-white/10 bg-[#12131a] text-emerald-500 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                    />
                    Confirm
                  </label>
                </div>
              </div>

              <textarea
                value={tf.reason}
                onChange={(e) => updateMS({ [tf.fieldReason]: e.target.value })}
                placeholder={`Why is the ${tf.key.toUpperCase()} market bullish, bearish or ranging? Describe structure breaks, liquidity points, etc.`}
                className="w-full bg-[#12131a] border border-white/5 text-xs text-gray-300 rounded-lg p-3 min-h-[60px] focus:outline-none focus:border-white/20 resize-y"
              />

              {/* Screenshot Upload Area */}
              <div className="space-y-2">
                <input
                  ref={tf.fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleScreenshot(tf.fieldScreenshot, e)}
                />

                {tf.screenshot ? (
                  <div className="relative group">
                    <img
                      src={tf.screenshot}
                      alt={`${tf.key.toUpperCase()} chart screenshot`}
                      className="w-full max-h-48 object-contain rounded-lg border border-white/10 bg-black/30"
                    />
                    <button
                      onClick={() => updateMS({ [tf.fieldScreenshot]: '' })}
                      className="absolute top-2 right-2 p-1.5 bg-red-500/80 hover:bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                    <button
                      onClick={() => tf.fileRef.current?.click()}
                      className="absolute bottom-2 right-2 px-2 py-1 bg-white/10 hover:bg-white/20 text-gray-300 text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer uppercase tracking-wider"
                    >
                      Replace
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => tf.fileRef.current?.click()}
                    className="w-full py-3 border border-dashed border-white/10 hover:border-emerald-500/30 rounded-lg flex items-center justify-center gap-2 text-xs text-gray-500 hover:text-emerald-400 transition-all cursor-pointer group"
                  >
                    <Upload size={14} className="group-hover:animate-bounce" />
                    <span>Upload {tf.key.toUpperCase()} Chart Screenshot</span>
                    <ImageIcon size={12} className="opacity-50" />
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* HTF Alignment Checkbox */}
          <div className="p-3 bg-white/3 border border-white/5 rounded-xl flex items-center justify-between">
            <span className="text-xs text-gray-300">High Timeframe Alignment (4H + 1H are in sync)</span>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={marketStructure.htfAlignment}
                onChange={(e) => updateMS({ htfAlignment: e.target.checked })}
                className="rounded border-white/10 bg-[#12131a] text-emerald-500 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
              />
              <span className="text-xs font-bold text-gray-300">HTF Sync</span>
            </label>
          </div>
        </div>
      </div>

      {/* SECTION 4 — KEY LEVEL VALIDATION */}
      <div className="glass-card glass-card-hover p-6 border border-white/5">
        <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-4">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-lg">
            <Key size={18} />
          </div>
          <div>
            <h3 className="text-md font-bold text-white uppercase tracking-wider">Section 4 — Key Levels & Zones</h3>
            <p className="text-xs text-gray-400">Identify structural supply/demand and liquidity zones (Weight: 25%)</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {[
            { field: 'at1hKeyLevel', label: 'At 1H Key Level', hasScore: true },
            { field: 'at15mKeyLevel', label: 'At 15M Key Level', hasScore: true },
            { field: 'freshSupplyZone', label: 'Fresh Supply Zone', hasScore: true },
            { field: 'freshDemandZone', label: 'Fresh Demand Zone', hasScore: true },
            { field: 'dailyHighLiquidity', label: 'Daily High Liquidity Area', hasScore: false, subText: "Daily Liquidity Area" },
            { field: 'dailyLowLiquidity', label: 'Daily Low Liquidity Area', hasScore: false, subText: "Daily Liquidity Area" },
            { field: 'premiumArea', label: 'In Premium Area (Shorts only)', hasScore: false },
            { field: 'discountArea', label: 'In Discount Area (Longs only)', hasScore: false },
          ].map((item) => (
            <label
              key={item.field}
              className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer select-none transition-all duration-300 ${keyLevels[item.field as keyof KeyLevelsState]
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 scale-[1.01]'
                  : 'bg-white/3 border-white/5 text-gray-300 hover:bg-white/5'
                }`}
            >
              <input
                type="checkbox"
                checked={keyLevels[item.field as keyof KeyLevelsState] as boolean}
                onChange={(e) => updateKL({ [item.field]: e.target.checked })}
                className="rounded border-white/10 bg-[#12131a] text-emerald-500 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
              />
              <div className="flex flex-col">
                <span className="text-xs font-semibold leading-none">{item.label}</span>
                {item.hasScore && <span className="text-[10px] text-emerald-500/70 font-semibold font-mono mt-1">+5% Score Confluence</span>}
                {item.subText && <span className="text-[10px] text-amber-500/70 font-semibold font-mono mt-1">Satisfies {item.subText} (+5%)</span>}
                {!item.hasScore && !item.subText && <span className="text-[10px] text-gray-500 mt-1">Qualitative assessment</span>}
              </div>
            </label>
          ))}
        </div>

        <div className="mt-4 p-3 bg-[#12131a] border border-white/5 rounded-xl flex items-center justify-between text-xs text-gray-400 font-mono">
          <span>Confluences Found</span>
          <span className="text-emerald-500 font-black">
            {Object.values(keyLevels).filter(Boolean).length} confluences
          </span>
        </div>
      </div>

      {/* SECTION 5 & 6 — SESSION & ENTRY CONFIRMATION */}
      <div className="glass-card glass-card-hover p-6 border border-white/5">
        <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-4">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-lg">
            <Clock size={18} />
          </div>
          <div>
            <h3 className="text-md font-bold text-white uppercase tracking-wider">Section 5 & 6 — Execution Parameters</h3>
            <p className="text-xs text-gray-400">Session confirmation and entry trigger selection (Weight: 25%)</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Section 5 — Session */}
          <div className="p-4 bg-white/3 border border-white/5 rounded-xl space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">Section 5 — Session</span>
            </div>

            <div className="space-y-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400">Planned Session Type</label>
                <select
                  value={sessionConfirmation.sessionType}
                  onChange={(e) => updateSC({ sessionType: e.target.value as SessionConfirmationState['sessionType'] })}
                  className="bg-[#12131a] text-xs font-semibold text-gray-300 border border-white/10 rounded-lg px-3 py-2 w-full focus:outline-none focus:border-emerald-500"
                >
                  <option value="">Select Session...</option>
                  <option value="London Continuation">🇬🇧 London Continuation</option>
                  <option value="New York Reversal">🇺🇸 New York Reversal</option>
                  <option value="London-New York Overlap">🌐 London-New York Overlap</option>
                </select>
              </div>

              <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer select-none transition-all duration-300 ${sessionConfirmation.sessionAligns
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-white/3 border-white/5 text-gray-300'
                }`}>
                <input
                  type="checkbox"
                  checked={sessionConfirmation.sessionAligns}
                  onChange={(e) => updateSC({ sessionAligns: e.target.checked })}
                  className="rounded border-white/10 bg-[#12131a] text-emerald-500 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-semibold">Session aligns with setup</span>
                  <span className="text-[10px] text-emerald-500/70 font-semibold font-mono mt-0.5">+5% Score</span>
                </div>
              </label>
            </div>
          </div>

          {/* Section 6 — Entry Trigger */}
          <div className="p-4 bg-white/3 border border-white/5 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">Section 6 — Entry Type</span>
              <select
                value={entryConfirmation.entryType}
                onChange={(e) => updateEC({ entryType: e.target.value as EntryConfirmationState['entryType'] })}
                className="bg-[#12131a] text-xs font-semibold text-gray-300 border border-white/10 rounded-lg px-3 py-1 focus:outline-none focus:border-emerald-500"
              >
                <option value="">Select Entry...</option>
                <option value="Aggressive">Aggressive</option>
                <option value="Conservative">Conservative</option>
              </select>
            </div>

            {entryConfirmation.entryType === 'Aggressive' && (
              <div className="space-y-2.5 animate-fadeIn">
                <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">Aggressive Requirements:</span>
                {[
                  { field: 'liquiditySweep', label: 'Liquidity Sweep' },
                  { field: 'engulfingCandle', label: 'Engulfing Candle' },
                  { field: 'mss', label: 'MSS (Market Structure Shift)' },
                ].map((item) => (
                  <label key={item.field} className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer select-none transition-all duration-300 ${entryConfirmation[item.field as keyof EntryConfirmationState]
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-white/3 border-white/5 text-gray-300'
                    }`}>
                    <input
                      type="checkbox"
                      checked={entryConfirmation[item.field as keyof EntryConfirmationState] as boolean}
                      onChange={(e) => updateEC({ [item.field]: e.target.checked })}
                      className="rounded border-white/10 bg-[#12131a] text-emerald-500 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs font-semibold">{item.label}</span>
                  </label>
                ))}
              </div>
            )}

            {entryConfirmation.entryType === 'Conservative' && (
              <div className="space-y-2.5 animate-fadeIn">
                <span className="text-[10px] text-sky-500 font-bold uppercase tracking-wider">Conservative Requirements:</span>
                {[
                  { field: 'threeCandle', label: 'Three Candle Formation' },
                  { field: 'retest', label: 'Retest of Break' },
                  { field: 'structureShift', label: 'Structure Shift' },
                ].map((item) => (
                  <label key={item.field} className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer select-none transition-all duration-300 ${entryConfirmation[item.field as keyof EntryConfirmationState]
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-white/3 border-white/5 text-gray-300'
                    }`}>
                    <input
                      type="checkbox"
                      checked={entryConfirmation[item.field as keyof EntryConfirmationState] as boolean}
                      onChange={(e) => updateEC({ [item.field]: e.target.checked })}
                      className="rounded border-white/10 bg-[#12131a] text-emerald-500 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs font-semibold">{item.label}</span>
                  </label>
                ))}
              </div>
            )}

            {!entryConfirmation.entryType && (
              <div className="h-[120px] flex items-center justify-center border border-dashed border-white/5 rounded-xl">
                <p className="text-xs text-gray-500">Please select entry type to view checklist.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 7 — RISK MANAGEMENT (Checkboxes only, no calculator) */}
      <div className="glass-card glass-card-hover p-6 border border-white/5">
        <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-4">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-lg">
            <Percent size={18} />
          </div>
          <div>
            <h3 className="text-md font-bold text-white uppercase tracking-wider">Section 7 — Risk Management</h3>
            <p className="text-xs text-gray-400">Strict sizing rules and risk validation (Weight: 15%)</p>
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold text-gray-300 uppercase tracking-wider block">Risk Confluences Checklist</span>

          {[
            { field: 'riskOnePercent', label: 'Risk is restricted to exactly 1% per trade' },
            { field: 'rrThreeToOne', label: 'Risk to reward ratio is at least 1:3' },
            { field: 'slDefined', label: 'Stop Loss parameters are explicitly set' },
            { field: 'tpDefined', label: 'Take Profit parameters are explicitly set' },
          ].map((item) => (
            <label key={item.field} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors duration-300 ${riskManagement[item.field as keyof RiskManagementState]
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-white/3 border-white/5 text-gray-300'
              }`}>
              <input
                type="checkbox"
                checked={riskManagement[item.field as keyof RiskManagementState] as boolean}
                onChange={(e) => updateRM({ [item.field]: e.target.checked })}
                className="rounded border-white/10 bg-[#12131a] text-emerald-500 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
              />
              <span className="text-xs font-semibold">{item.label}</span>
            </label>
          ))}

          <div className={`mt-3 p-2.5 rounded-lg border text-center text-xs font-bold flex items-center justify-center gap-2 ${isRiskReady ? 'bg-emerald-500/15 border-emerald-500/35 text-emerald-400' : 'bg-red-500/10 border-red-500/25 text-red-400'
            }`}>
            <AlertCircle size={14} />
            {isRiskReady ? "Risk Management Ready" : "Risk Parameters Missing"}
          </div>
        </div>
      </div>

      {/* SECTION 8 — EMOTIONAL TRACKER */}
      <div className="glass-card glass-card-hover p-6 border border-white/5">
        <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-4">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-lg">
            <Heart size={18} />
          </div>
          <div>
            <h3 className="text-md font-bold text-white uppercase tracking-wider">Section 8 — Psychology & Mindset</h3>
            <p className="text-xs text-gray-400">Assess emotional biases and declare psychological safety (Weight: 15%)</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sliders Grid */}
          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { field: 'fear', label: 'Fear / Anxiety', class: 'slider-red', minLabel: 'Calm', maxLabel: 'Panicked' },
                { field: 'confidence', label: 'Confidence', class: '', minLabel: 'Hesitant', maxLabel: 'Clear' },
                { field: 'patience', label: 'Patience', class: '', minLabel: 'Rushed', maxLabel: 'Waiting' },
                { field: 'focus', label: 'Focus / Presence', class: '', minLabel: 'Distracted', maxLabel: 'Laser' },
                { field: 'greed', label: 'Greed / FOMO', class: 'slider-red', minLabel: 'Passive', maxLabel: 'Chasing' },
                { field: 'frustration', label: 'Frustration', class: 'slider-red', minLabel: 'Sober', maxLabel: 'Agitated' }
              ].map((slider) => (
                <div key={slider.field} className="p-3 bg-white/3 border border-white/5 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-gray-300">{slider.label}</span>
                    <span className={`font-mono text-sm px-1.5 py-0.5 rounded ${slider.class === 'slider-red' ? 'text-red-400 bg-red-500/5 border border-red-500/10' : 'text-emerald-400 bg-emerald-500/5 border border-emerald-500/10'
                      }`}>
                      {psychology[slider.field as keyof PsychologyState] as number}/10
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={psychology[slider.field as keyof PsychologyState] as number}
                    onChange={(e) => updatePsych({ [slider.field]: parseInt(e.target.value) })}
                    className={`w-full ${slider.class}`}
                  />
                  <div className="flex justify-between text-[9px] text-gray-500 uppercase font-semibold tracking-wider px-0.5">
                    <span>{slider.minLabel}</span>
                    <span>{slider.maxLabel}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Psychology score card */}
          <div className="flex flex-col justify-between p-5 bg-white/3 border border-white/5 rounded-xl">
            <div className="space-y-4">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Mindset Status</span>

              <div className="flex items-baseline gap-1.5 justify-center">
                <span className="text-4xl font-black font-mono text-white">{psychScore}%</span>
                <span className="text-[10px] text-gray-400 uppercase font-bold">Score</span>
              </div>

              <div className={`p-3 rounded-lg border text-center text-xs font-bold flex items-center justify-center gap-2 ${psychState.color}`}>
                <span>{psychState.icon}</span>
                <span>{psychState.label}</span>
              </div>
            </div>

            {/* Checkboxes adding to score */}
            <div className="space-y-2.5 mt-6 border-t border-white/5 pt-4">
              {[
                { field: 'emotionStable', label: 'Emotion is fully stable' },
                { field: 'noFomo', label: 'I am trading with NO FOMO' },
                { field: 'followingPlan', label: 'Strictly following planned setup' }
              ].map((item) => (
                <label key={item.field} className={`flex items-center gap-3 p-2 border rounded-lg cursor-pointer transition-colors duration-300 ${psychology[item.field as keyof PsychologyState]
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-white/3 border-white/5 text-gray-300'
                  }`}>
                  <input
                    type="checkbox"
                    checked={psychology[item.field as keyof PsychologyState] as boolean}
                    onChange={(e) => updatePsych({ [item.field]: e.target.checked })}
                    className="rounded border-white/10 bg-[#12131a] text-emerald-500 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                  />
                  <span className="text-xs font-semibold">{item.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 9 — THOUGHT PROCESS JOURNAL */}
      <div className="glass-card glass-card-hover p-6 border border-white/5">
        <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-4">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-lg">
            <BookOpen size={18} />
          </div>
          <div>
            <h3 className="text-md font-bold text-white uppercase tracking-wider">Section 9 — Pre-Trade Thought Journal</h3>
            <p className="text-xs text-gray-400">Formulate your logical narrative and clarify details before clicking execute</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { field: 'whatDoISee', label: '1. What do I see in the charts?', placeholder: 'Describe the raw price action, candle formations, key levels broken, structures...' },
            { field: 'whyShouldPriceMove', label: '2. Why should price move from here?', placeholder: 'Describe the order flow imbalance, premium/discount offset, target draws...' },
            { field: 'whatInvalidates', label: '3. What invalidates my trade?', placeholder: 'Specify what level price breaches that breaks this thesis completely...' },
            { field: 'whatEmotion', label: '4. What emotion am I currently feeling?', placeholder: 'Fear, greed, excitement, boredom? Force yourself to declare it...' },
            { field: 'targetLiquidity', label: '5. What is my target liquidity?', placeholder: 'E.g. equal highs, HTF supply level, daily low...' },
            { field: 'whatMistake', label: '6. What mistake am I trying to avoid today?', placeholder: 'Overleveraging, entering early, wide stops, chasing FOMO spikes...' }
          ].map((item) => (
            <div key={item.field} className="space-y-1.5 p-3 bg-white/3 border border-white/5 rounded-xl">
              <label className="text-xs font-bold text-gray-200">{item.label}</label>
              <textarea
                value={journal[item.field as keyof JournalState]}
                onChange={(e) => updateJournal({ [item.field]: e.target.value })}
                placeholder={item.placeholder}
                className="w-full bg-[#12131a] border border-white/5 text-xs text-gray-300 rounded-lg p-3 min-h-[80px] focus:outline-none focus:border-white/20 resize-y"
              />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
