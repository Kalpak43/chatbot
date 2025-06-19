import { createSlice } from "@reduxjs/toolkit";

interface PromptState {
  prompt: string;
  attachments: Attachment[];
  abortController: AbortController | null;
  model: string;
  webSearch: boolean;
  rateLimit: {
    limit: string | null;
    remaining: string | null;
    reset: string | null;
  } | null;
}

const initialState: PromptState = {
  prompt: "",
  attachments: [],
  abortController: null,
  model: "sarvam-ai",
  webSearch: false,
  rateLimit: null,
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
    setModel: (state, action) => {
      state.model = action.payload;
    },
    toggleWebSearch: (state) => {
      state.webSearch = !state.webSearch;
    },
    updateLimit: (state, action) => {
      state.rateLimit = action.payload;
    },
  },
});

export const {
  setPrompt,
  setAttachments,
  setAbortController,
  setModel,
  toggleWebSearch,
  updateLimit,
} = promptSlice.actions;

export default promptSlice.reducer;
