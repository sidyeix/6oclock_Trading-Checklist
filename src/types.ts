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

export interface MarketStructureState {
  bias4h: BiasOption;
  bias1h: BiasOption;
  bias15m: BiasOption;
}

// Key Levels — checkboxes grouped by timeframe
export interface KeyLevelsState {
  // 4H
  demand4h: boolean;
  supply4h: boolean;
  orderBlock4h: boolean;
  // 1H
  demand1h: boolean;
  supply1h: boolean;
  orderBlock1h: boolean;
  // 15M
  demand15m: boolean;
  supply15m: boolean;
  orderBlock15m: boolean;
}

// Non Negotiables Checklist
export interface NonNegotiablesState {
  htfAlignment: boolean;
  liquiditySwept: boolean;
  rrValid: boolean;
}

// Execution Parameters — Aggressive & Conservative Entry Models
export interface ExecutionParamsState {
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
