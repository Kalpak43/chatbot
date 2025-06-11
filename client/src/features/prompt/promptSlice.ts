import { createSlice } from "@reduxjs/toolkit";

interface PromptState {
  prompt: string;
  attachments: Attachment[];
  abortController: AbortController | null;
}

const initialState: PromptState = {
  prompt: "",
  attachments: [],
  abortController: null,
};

const promptSlice = createSlice({
  name: "prompt",
  initialState,
  reducers: {
    setPrompt: (state, action) => {
      state.prompt = action.payload;
    },
    setAttachments: (state, action) => {
      state.attachments = action.payload;
    },
    setAbortController: (state, action) => {
      state.abortController = action.payload;
    },
  },
});

export const { setPrompt, setAttachments, setAbortController } =
  promptSlice.actions;

export default promptSlice.reducer;
