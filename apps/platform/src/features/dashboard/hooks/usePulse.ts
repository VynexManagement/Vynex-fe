import { useEffect, useState } from "react";
import { getPulseMetrics } from "../services/pulse.service";

export function usePulse() {
  const [pulse, setPulse] = useState({ totalStores: 0, totalLeads: 0, activeNiches: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPulse = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getPulseMetrics();
      setPulse(data);
    } catch (err) {
      console.error("Pulse metrics fetch failed", err);
      setError("Failed to fetch live platform metrics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPulse();
  }, []);

  return {
    pulse,
    loading,
    error,
    refetch: fetchPulse,
  };
}
