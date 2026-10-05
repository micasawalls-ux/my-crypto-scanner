import { useEffect, useState } from "react";
import type { Signal } from "./types";
import { SignalFeed } from "./SignalFeed";

/* ------------------------------------------------------------------ */
/* Wix CMS → Signal mapper                                            */
/* ------------------------------------------------------------------ */
interface WixCmsRecord {
  _id: string;
  title?: string;
  direction?: string;
  currentPrice?: number;
  aiAnalysis?: string;
  _createdDate?: string;
  volumeSpikeRatio?: number;
  rsi?: number;
}

function mapWixRecord(record: WixCmsRecord): Signal {
  const rawDir = (record.direction || "").toLowerCase();

  return {
    id: record._id,
    ticker: record.title ?? "UNKNOWN",
    direction:
      rawDir === "bullish" || rawDir === "bearish" || rawDir === "neutral"
        ? rawDir
        : "neutral",
    entry_price: record.currentPrice ?? 0,
    current_price: record.currentPrice ?? undefined,
    analysis: record.aiAnalysis ?? "",
    volume_spike_ratio: record.volumeSpikeRatio,
    rsi: record.rsi,
    created_at: record._createdDate ?? new Date().toISOString(),
  };
}

/* ------------------------------------------------------------------ */
/* App                                                                */
/* ------------------------------------------------------------------ */
export default function App() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wix's $w("#html1").postMessage(payload) arrives here.
    const handleMessage = (event: MessageEvent) => {
      // In production, lock this down to your Wix site's origin:
      // if (event.origin !== "https://therubicsquare.wixsite.com") return;
      const data = event.data;

      // Wix may send the array directly, or wrap it as { signals: [...] }
      const records: WixCmsRecord[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.signals)
          ? data.signals
          : [];

      if (records.length === 0 && !Array.isArray(data) && !data?.signals) {
        // Ignore unrecognised messages (Wix/analytics chatter)
        return;
      }

      setSignals(records.map(mapWixRecord));
      setLoading(false);
    };

    window.addEventListener("message", handleMessage);

    // Fallback: stop showing the skeleton after 3s even if no message arrives
    const timeout = setTimeout(() => setLoading(false), 3000);

    return () => {
      window.removeEventListener("message", handleMessage);
      clearTimeout(timeout);
    };
  }, []);

  return <SignalFeed signals={signals} isLoading={loading} />;
}