export type Direction = "bullish" | "bearish" | "neutral";

export interface Signal {
  id: string;                    // uuid from backend
  ticker: string;                // "SOLUSDT"
  direction: Direction;
  entry_price: number;
  current_price?: number;        // optional live tick for P&L
  analysis: string;              // multi-line rich text
  volume_spike_ratio?: number;   // optional context
  rsi?: number;                  // optional context
  created_at: string;            // ISO timestamp
}