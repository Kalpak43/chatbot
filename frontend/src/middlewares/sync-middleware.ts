import { syncService } from "../services/sync-service";

// Create middleware
// @ts-ignore
export const syncMiddleware = (store: any) => (next: any) => (action: any) => {
  // Process the action first
  const result = next(action);

  // Actions that should trigger a sync
  const syncTriggerActions = [
    "chat/createNewChat/fulfilled",
    "chat/addNewMessage/fulfilled",
    "chat/updateMessageStatus/fulfilled",
    "chat/updateMessageContent/fulfilled",
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
