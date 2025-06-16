import { createSlice, isAnyOf } from "@reduxjs/toolkit";
import { addNewMessage, getMessages } from "./messageThunk";

interface MessageState {
  messages: {
    id: string;
    chatId: string;
    created_at: number;
    status: Status;
    role: "user" | "ai";
  }[];
  loading: boolean;
  error: string | null;
}

const initialState: MessageState = {
  messages: [],
  loading: false,
  error: null,
};

const messageSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(getMessages.fulfilled, (state, action) => {
        state.messages = action.payload;
      })
      .addCase(addNewMessage.fulfilled, (state, action) => {
        // Avoid duplicates by checking message id before adding
        if (!state.messages.some((msg) => msg.id === action.payload.id)) {
          state.messages.push(action.payload);
        }
      })
      .addMatcher(isAnyOf(getMessages.pending), (state) => {
        state.loading = true;
        state.error = null;
      })
      .addMatcher(isAnyOf(getMessages.rejected), (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to create chat";
      })
      .addMatcher(isAnyOf(getMessages.fulfilled), (state) => {
        state.loading = false;
      });
  },
});

export const { setMessages } = messageSlice.actions;

export default messageSlice.reducer;
