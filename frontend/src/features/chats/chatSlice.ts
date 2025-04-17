import { createSlice } from "@reduxjs/toolkit";
import {
  createNewChat,
  deleteChatAndMessages,
  fetchMessages,
  getChat,
  getChats,
  updateChat,
  updateChatStatus,
  updateChatTitle,
} from "./chatThunk";

type ChatState = {
  chats: ChatType[];
  activeChatId: string | null;
  error: string | null;
  activeMessages: MessageType[];
  activeChat: ChatType | null;
};

const initialState: ChatState = {
  chats: [],
  activeChatId: null,
  error: null,
  activeMessages: [],
  activeChat: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setActiveChatId: (state, action) => {
      state.activeChatId = action.payload;
    },
    resetMessages: (state) => {
      state.activeMessages = [];
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setActiveChat: (state, action) => {
      state.activeChat = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createNewChat.fulfilled, (state, action) => {
        state.chats.push(action.payload);
        state.activeChatId = action.payload.id;
      })
      .addCase(createNewChat.rejected, (state, action) => {
        state.error = action.error.message ?? "An error occurred";
      })
      .addCase(updateChatStatus.fulfilled, (state, action) => {
        const chat = state.chats.find(
          (chat) => chat.id === action.payload.chatId
        );
        if (chat) {
          chat.status = action.payload.status;
        }
      })
      .addCase(updateChatStatus.rejected, (state, action) => {
        state.error = action.error.message ?? "An error occurred";
      })
      .addCase(updateChatTitle.fulfilled, (state, action) => {
        const chat = state.chats.find(
          (chat) => chat.id === action.payload.chatId
        );
        if (chat) {
          chat.title = action.payload.title;
        }
      })
      .addCase(updateChatTitle.rejected, (state, action) => {
        state.error = action.error.message ?? "An error occurred";
      })
      .addCase(getChats.fulfilled, (state, action) => {
        state.chats = action.payload;
      })
      .addCase(getChats.rejected, (state, action) => {
        state.error = action.error.message ?? "An error occurred";
      })
      .addCase(getChat.fulfilled, (state, action) => {
        state.activeChat = action.payload;
      })
      .addCase(getChat.rejected, (state, action) => {
        state.error = action.error.message ?? "An error occurred";
      })
      .addCase(updateChat.fulfilled, (state, action) => {
        const { chatId, ...updateData } = action.payload;
        const chat = state.chats.find((chat) => chat.id === chatId);
        if (chat) {
          Object.assign(chat, updateData);
        }

        // Update activeChat if it's the same chat
        if (state.activeChat && state.activeChat.id === chatId) {
          Object.assign(state.activeChat, updateData);
        }
      })
      .addCase(updateChat.rejected, (state, action) => {
        state.error = action.error.message ?? "An error occurred";
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.activeMessages = action.payload;
      })
      .addCase(deleteChatAndMessages.fulfilled, (state, action) => {
        state.chats = state.chats.filter((chat) => chat.id !== action.payload);
      });
  },
});

export const { setActiveChatId, resetMessages, setError, setActiveChat } =
  chatSlice.actions;

export default chatSlice.reducer;
