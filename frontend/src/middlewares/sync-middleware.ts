// syncMiddleware.ts
import { Middleware } from "redux";
import { syncService } from "../services/sync-service";
import { RootState } from "../app/store";

// Create middleware
export const syncMiddleware =
  (store: any) => (next: any) => (action: any) => {
    // Process the action first
    const result = next(action);

    // Actions that should trigger a sync
    const syncTriggerActions = [
      "chat/createNewChat/fulfilled",
      "chat/addMessage/fulfilled",
      "chat/updateChatTitle/fulfilled",
      "chat/deleteChat/fulfilled",
    ];

    // Check if this is a sync-triggering action
    if (syncTriggerActions.includes(action.type)) {
      // For these actions, we want immediate sync if online
      if (navigator.onLine) {
        syncService.syncAll();
      }
    }

    return result;
  };
