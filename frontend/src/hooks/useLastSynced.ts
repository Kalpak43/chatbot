import { useState } from "react";

const LAST_SYNCED_KEY = "lastSynced";

export function useLastSynced() {
  const [lastSynced, setLastSyncedState] = useState<number>(() => {
    const stored = localStorage.getItem(LAST_SYNCED_KEY);
    return stored ? parseInt(stored, 10) : 0;
  });

  const setLastSynced = (value: number) => {
    setLastSyncedState(value);
    localStorage.setItem(LAST_SYNCED_KEY, value.toString());
  };

  return [lastSynced, setLastSynced] as const;
}
