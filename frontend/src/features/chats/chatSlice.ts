import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

type ChatState = {
  chats: ChatType[];
  activeChatId: string | null;
  typing: boolean;
};

const initialState: ChatState = {
  chats: [],
  activeChatId: null,
  typing: false,
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
        if (chat.messages.length == 0) {
          chat.title = action.payload.message.text
            .split(" ")
            .slice(0, 10)
            .join(" ");
        }

        if (
          action.payload.message.role == "ai" &&
          chat.messages.length > 0 &&
          chat.messages[chat.messages.length - 1].role === "ai"
        ) {
          chat.messages.splice(chat.messages.length - 1, 1); // Remove the last AI message
        }
        chat.messages.push(action.payload.message);
      }
    },
    createChat: (state, action: PayloadAction<string>) => {
      const newChat: ChatType = {
        title: "Untitled",
        id: action.payload,
        messages: [],
        created_at: new Date().getTime(),
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
    editMessage: (
      state,
      action: PayloadAction<{
        chatId: string;
        messageId: number;
        newText: string;
      }>
    ) => {
      const { chatId, messageId, newText } = action.payload;
      const chat = state.chats.find((c) => c.id === chatId);
      if (chat && chat.messages[messageId].role === "user") {
        chat.messages[messageId].text = newText;
      }
    },
    deleteMessage: (
      state,
      action: PayloadAction<{ chatId: string; messageId: number }>
    ) => {
      const { chatId, messageId } = action.payload;
      const chat = state.chats.find((c) => c.id === chatId);
      if (chat) {
        chat.messages = chat.messages.slice(0, messageId);
      }
    },
    setTyping: (state, action: PayloadAction<boolean>) => {
      state.typing = action.payload;
    },
    setTitle: (
      state,
      action: PayloadAction<{ title: string; chatId: string }>
    ) => {
      const chat = state.chats.find((c) => c.id === action.payload.chatId);
      if (chat) {
        chat.title = action.payload.title;
      }
    },
  },
});

export const {
  addMessage,
  createChat,
  setActiveChat,
  deleteChat,
  editMessage,
  deleteMessage,
  setTyping,
  setTitle,
} = chatSlice.actions;

// Persist configuration
const persistConfig = {
  key: "chat",
  storage,
  blacklist: ["activeChatId", "typing"],
};
export const chatReducer = persistReducer(persistConfig, chatSlice.reducer);
