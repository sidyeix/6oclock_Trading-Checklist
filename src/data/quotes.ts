export const TRADING_QUOTES = [
  "Protect Capital First. Survival is the ultimate trading edge.",
  "Patience Pays More Than Prediction. Wait for the market to come to you.",
  "Trade the Setup, Not the Emotion. Execution is purely mechanical.",
  "Discipline Creates Consistency. The rules are non-negotiable.",
  "Amateurs focus on how much they can make. Professionals focus on risk.",
  "If you cannot accept a loss, you cannot trade. It is the cost of doing business.",
  "The market is a device for transferring money from the impatient to the patient.",
  "Your job is to execute your plan perfectly. The outcome of any single trade is random.",
  "Do not force confluences. If the setup is not obvious, it is not there.",
  "Revenge trading is a shortcut to bankruptcy. Walk away after a loss.",
  "A high quality setup is a result of waiting. A+ setups are rare and obvious.",
  "Emotional capital is just as important as financial capital. Guard it.",
  "Your cursor is a weapon. Only pull the trigger when the targets align.",
  "The best trades are often the ones you did not take because confluences were missing.",
  "Do not let a winning streak make you greedy, nor a losing streak make you fearful."
];

export function getDailyQuote(dateStr: string): string {
  // Hash the date string to get a consistent index for the day
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = dateStr.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % TRADING_QUOTES.length;
  return TRADING_QUOTES[index];
}
