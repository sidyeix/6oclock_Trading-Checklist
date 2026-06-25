// Theme
export type ThemeMode = 'light' | 'dark';

// Trading Session
export type TradingSession = 'Asia' | 'London' | 'New York' | '';

// Daily Preparation
export interface DailyPrepState {
  pdhMarked: boolean;
  pdlMarked: boolean;
}

// Market Structure — simple bias per timeframe
export type BiasOption = 'Bullish' | 'Bearish' | 'Range' | '';
export type VerdictOption = 'Bullish' | 'Bearish' | 'Range' | 'No Trade' | '';

export interface MarketStructureState {
  bias4h: BiasOption;
  bias1h: BiasOption;
  bias15m: BiasOption;
  note4h: string;
  note1h: string;
  note15m: string;
  confirmed4h: boolean;
  confirmed1h: boolean;
  confirmed15m: boolean;
}

// Key Levels — checkboxes grouped by timeframe
export type KeyLevelOption = 'Demand Zone' | 'Supply Zone' | 'Order Block' | '';
export type LiquidityOption = 'Asia Swing High/Low' | 'Fair Value Gap' | 'Inducements' | 'Consolidations';

export interface KeyLevelSelection {
  entry: KeyLevelOption;
  exit: KeyLevelOption;
  liquidity: LiquidityOption[];
}

export interface KeyLevelsState {
  fourHour: KeyLevelSelection;
  oneHour: KeyLevelSelection;
  fifteenMinute: KeyLevelSelection;
}

// Non Negotiables Checklist
export interface NonNegotiablesState {
  protectCapital: boolean;
  oneLossPerDay: boolean;
  oneTradePerDay: boolean;
  oneWinPerDay: boolean;
  emotionsRegulated: boolean;
  strictlyFollowingPlan: boolean;
}

// Execution Parameters — Aggressive & Conservative Entry Models
export type ExecutionModel = 'Aggressive' | 'Conservative' | '';

export interface ExecutionParamsState {
  model: ExecutionModel;
  // Aggressive
  liquiditySweep: boolean;
  engulfingCandle: boolean;
  candleClosed: boolean;
  // Conservative
  chochFormed: boolean;
  retestEntry: boolean;
  riskEntry: boolean;
}

// Timeline Journal Entry
export interface TimelineEntry {
  id: string;
  timestamp: string;
  note: string;
  isAutoTimestamp: boolean;
}

// Trade Screenshots for PDF Export
export interface TradeScreenshots {
  htfScreenshot: string;   // base64 data URL — 4H or 1H chart
  entryScreenshot: string; // base64 data URL — 15M or 5M chart
}
