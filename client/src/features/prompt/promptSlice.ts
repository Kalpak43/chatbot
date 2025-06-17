import { createSlice } from "@reduxjs/toolkit";

interface PromptState {
  prompt: string;
  attachments: Attachment[];
  abortController: AbortController | null;
  model: string;
  webSearch: boolean;
}

const initialState: PromptState = {
  prompt: "",
  attachments: [],
  abortController: null,
  model: "gemini-2.0-flash",
  webSearch: false,
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
  },
});

export const {
  setPrompt,
  setAttachments,
  setAbortController,
  setModel,
  toggleWebSearch,
} = promptSlice.actions;

export default promptSlice.reducer;
