import { createSlice, isAnyOf } from "@reduxjs/toolkit";
import { createNewChat, deleteChat, getChats, updateChat } from "./chatThunk";

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
  reducers: {},
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
      .addMatcher(
        isAnyOf(
          createNewChat.pending,
          getChats.pending,
          updateChat.pending,
          deleteChat.pending
        ),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        isAnyOf(
          createNewChat.rejected,
          getChats.rejected,
          updateChat.rejected,
          deleteChat.rejected
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

export default chatSlice.reducer;
