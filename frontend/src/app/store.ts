import { configureStore } from "@reduxjs/toolkit";
import { chatReducer } from "../features/chats/chatSlice";
import authReducer from "../features/auth/authSlice";
import { persistReducer, persistStore } from "redux-persist";
import { combineReducers } from "redux";
import storage from "redux-persist/lib/storage";

const persistConfig = {
  key: "root",
  storage,
  blacklist: ["auth"], // Exclude authReducer from being persisted
};

const rootReducer = combineReducers({ chat: chatReducer, auth: authReducer });
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
});

export const persistor = persistStore(store);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
