import { configureStore } from "@reduxjs/toolkit";
import chatReducer from "../features/chats/chatSlice";
import authReducer from "../features/auth/authSlice";
import { syncMiddleware } from "../middlewares/sync-middleware";

export const store = configureStore({
  reducer: { chat: chatReducer, auth: authReducer },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(syncMiddleware),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
