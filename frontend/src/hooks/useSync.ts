import { useEffect, useState, useCallback } from "react";
import {
  syncLocalChanges,
  pullRemoteChanges,
} from "../features/chats/chatThunk";
import { useAppDispatch, useAppSelector } from "../app/hooks";

export const useSync = () => {
  const dispatch = useAppDispatch();
  const error = useAppSelector((state) => state.chat.error);
  const user = useAppSelector((state) => state.auth.user);

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSyncTime, setLastSyncTime] = useState<number>(() => {
    // Try to get last sync time from local storage
    const storedTime = localStorage.getItem("lastSyncTime");
    return storedTime ? parseInt(storedTime, 10) : 0;
  });
  const [isSyncing, setIsSyncing] = useState(false);

  // Update local storage when lastSyncTime changes
  useEffect(() => {
    localStorage.setItem("lastSyncTime", lastSyncTime.toString());
  }, [lastSyncTime]);

  // Track online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    // Initial sync when component mounts
    if (isOnline && user) {
      syncData();
    }

    // Set up periodic sync every 5 minutes when online
    const intervalId = setInterval(() => {
      if (isOnline) {
        syncData();
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [isOnline, dispatch, user]);

  const syncData = useCallback(async () => {
    if (isSyncing || !isOnline) return;

    try {
      setIsSyncing(true);
      // First sync local changes to server
      await dispatch(syncLocalChanges());

      // Then pull changes from server
      const result: any = await dispatch(
        pullRemoteChanges({ lastSyncTimestamp: lastSyncTime })
      );

      if (
        result.meta.requestStatus === "fulfilled" &&
        result.payload?.syncTimestamp
      ) {
        // Update last sync time
        setLastSyncTime(result.payload.syncTimestamp);
      }
    } catch (error) {
      console.error("Sync failed:", error);
    } finally {
      setIsSyncing(false);
    }
  }, [dispatch, isOnline, isSyncing, lastSyncTime]);

  return {
    isOnline,
    isSyncing,
    lastSyncTime,
    error,
    syncData,
  };
};
