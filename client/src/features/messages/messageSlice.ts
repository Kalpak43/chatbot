import { createSlice, isAnyOf } from "@reduxjs/toolkit";
import { getMessages } from "./messageThunk";

interface MessageState {
  messages: MessageType[];
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
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(getMessages.fulfilled, (state, action) => {
        state.messages = action.payload;
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

export default messageSlice.reducer;
