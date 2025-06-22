import { createSlice, isAnyOf } from "@reduxjs/toolkit";
import {
  createNewChat,
  deleteChat,
  getChats,
  pullRemoteChanges,
  updateChat,
} from "./chatThunk";

interface ChatState {
  chats: ChatType[];
  activeChatId: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  chats: [],
  activeChatId: null,
  loading: false,
  error: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setActiveChatId: (state, action) => {
      state.activeChatId = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(createNewChat.fulfilled, (state, action) => {
        const existingIndex = state.chats.findIndex(
          (chat) => chat.id === action.payload.id
        );

        if (existingIndex === -1) {
          state.chats.unshift(action.payload);
        }
      })
      .addCase(getChats.fulfilled, (state, action) => {
        state.chats = action.payload;
      })
      .addCase(updateChat.fulfilled, (state, action) => {
        const { chatId, data } = action.payload;
        const chatIndex = state.chats.findIndex((chat) => chat.id === chatId);

        if (chatIndex !== -1) {
          state.chats[chatIndex] = { ...state.chats[chatIndex], ...data };
        }
      })
      .addCase(deleteChat.fulfilled, (state, action) => {
        const { chatId } = action.payload;

        state.chats = state.chats.filter((chat) => chat.id != chatId);
      })
      .addCase(pullRemoteChanges.fulfilled, (state, action) => {
        const { chats } = action.payload;

        // Merge and remove duplicates by chat id, keeping the latest by last_message_at
        const mergedChats = [...state.chats, ...chats];
        const chatMap = new Map<string, ChatType>();

        mergedChats.forEach((chat) => {
          const existing = chatMap.get(chat.id);
          if (!existing || chat.last_message_at > existing.last_message_at) {
            chatMap.set(chat.id, chat);
          }
        });

        state.chats = Array.from(chatMap.values()).sort(
          (a, b) => b.last_message_at - a.last_message_at
        );
      })
      .addMatcher(
        isAnyOf(
          // createNewChat.pending,
          getChats.pending,
          // updateChat.pending,
          // deleteChat.pending
        ),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        isAnyOf(
          // createNewChat.rejected,
          getChats.rejected,
        ),
        (state, action) => {
          state.loading = false;
          state.error = action.error.message || "Failed to create chat";
        }
      )
      .addMatcher(
        isAnyOf(
          createNewChat.fulfilled,
          getChats.fulfilled,
          updateChat.fulfilled,
          deleteChat.fulfilled
        ),
        (state) => {
          state.loading = false;
        }
      );
  },
});

export const { setActiveChatId } = chatSlice.actions;

export default chatSlice.reducer;
