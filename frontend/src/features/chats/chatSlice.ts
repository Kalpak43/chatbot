import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

type ChatState = {
  chats: ChatType[];
  activeChatId: string | null;
};

const initialState: ChatState = {
  chats: [],
  activeChatId: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    addMessage: (
      state,
      action: PayloadAction<{ chatId: string; message: MessageType }>
    ) => {
      const chat = state.chats.find((c) => c.id === action.payload.chatId);
      if (chat) {
        if (
          action.payload.message.role == "ai" &&
          chat.messages.length > 0 &&
          chat.messages[chat.messages.length - 1].role === "ai"
        ) {
          console.log(1);
          chat.messages.splice(chat.messages.length - 1, 1); // Remove the last AI message
        }
        chat.messages.push(action.payload.message);
      }
    },
    createChat: (state, action: PayloadAction<string>) => {
      const newChat: ChatType = {
        id: action.payload,
        messages: [],
        created_at: new Date(),
      };
      state.chats.push(newChat);
      state.activeChatId = newChat.id;
    },
    setActiveChat: (state, action: PayloadAction<string>) => {
      state.activeChatId = action.payload;
    },
    deleteChat: (state, action: PayloadAction<string>) => {
      state.chats = state.chats.filter((c) => c.id !== action.payload);
      if (state.activeChatId === action.payload) {
        state.activeChatId = state.chats.length ? state.chats[0].id : null;
      }
    },
  },
});

export const { addMessage, createChat, setActiveChat, deleteChat } =
  chatSlice.actions;

// Persist configuration
const persistConfig = { key: "chat", storage, blacklist: ["activeChatId"] };
export const chatReducer = persistReducer(persistConfig, chatSlice.reducer);
