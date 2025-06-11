import { configureStore } from "@reduxjs/toolkit";

import authReducer from "@/features/auth/authSlice";
import chatReducer from "@/features/chats/chatSlice";
import messageReducer from "@/features/messages/messageSlice";
import promptReducer from "@/features/prompt/promptSlice";

import {
  deleteChatMiddleware,
  syncMiddleware,
} from "@/middleware/chats/middleware";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
    messages: messageReducer,
    prompt: promptReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([deleteChatMiddleware, syncMiddleware]),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
