export interface MarketStructureState {
  bias4h: 'Bullish' | 'Bearish' | 'Ranging' | '';
  bias1h: 'Bullish' | 'Bearish' | 'Ranging' | '';
  bias15m: 'Bullish' | 'Bearish' | 'Ranging' | '';
  reason4h: string;
  reason1h: string;
  reason15m: string;
  confirm4h: boolean;
  confirm1h: boolean;
  confirm15m: boolean;
  htfAlignment: boolean;
  screenshot4h: string;
  screenshot1h: string;
  screenshot15m: string;
}

export interface KeyLevelsState {
  at1hKeyLevel: boolean;
  at15mKeyLevel: boolean;
  freshSupplyZone: boolean;
  freshDemandZone: boolean;
  premiumArea: boolean;
  discountArea: boolean;
  dailyHighLiquidity: boolean;
  dailyLowLiquidity: boolean;
}

export interface SessionConfirmationState {
  sessionType: 'London Continuation' | 'New York Reversal' | 'London-New York Overlap' | '';
  sessionAligns: boolean;
}

export interface EntryConfirmationState {
  entryType: 'Aggressive' | 'Conservative' | '';
  liquiditySweep: boolean;
  engulfingCandle: boolean;
  mss: boolean;
  threeCandle: boolean;
  retest: boolean;
  structureShift: boolean;
}

export interface RiskManagementState {
  riskOnePercent: boolean;
  rrThreeToOne: boolean;
  slDefined: boolean;
  tpDefined: boolean;
}

export interface PsychologyState {
  fear: number;
  confidence: number;
  patience: number;
  focus: number;
  greed: number;
  frustration: number;
  emotionStable: boolean;
  noFomo: boolean;
  followingPlan: boolean;
}

export interface JournalState {
  whatDoISee: string;
  whyShouldPriceMove: string;
  whatInvalidates: string;
  whatEmotion: string;
  targetLiquidity: string;
  whatMistake: string;
}

export interface TradingSession {
  date: string;
  marketStructure: MarketStructureState;
  keyLevels: KeyLevelsState;
  sessionConfirmation: SessionConfirmationState;
  entryConfirmation: EntryConfirmationState;
  riskManagement: RiskManagementState;
  psychology: PsychologyState;
  journal: JournalState;
  tradeQualityScore: number;
  verdict: string;
  isExecuted: boolean;
  executedAt?: string;
}
