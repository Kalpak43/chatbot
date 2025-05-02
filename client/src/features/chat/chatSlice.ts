import {
  createListenerMiddleware,
  createSlice,
  isAnyOf,
} from "@reduxjs/toolkit";
import {
  createNewChat,
  deleteChatAndMessages,
  fetchMessages,
  getChat,
  getChats,
  pullRemoteChanges,
  updateChat,
} from "./chatThunk";
import { RootState } from "@/app/store";

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

export const chatListenerMiddleware = createListenerMiddleware();

chatListenerMiddleware.startListening({
  matcher: isAnyOf(
    getChats.fulfilled,
    updateChat.fulfilled,
    pullRemoteChanges.fulfilled,
    deleteChatAndMessages.fulfilled
  ),
  effect: async (_, listenerApi) => {
    const state = listenerApi.getState() as RootState;

    // Filter out deleted chats (e.g., assuming a `deleted` flag)
    const filteredChats = state.chat.chats.filter(
      (chat) => chat.status != "deleted"
    );

    console.log("Filtered Chats (middleware):", filteredChats);

    // Optional: Dispatch an error if filtering goes wrong
    if (!Array.isArray(filteredChats)) {
      listenerApi.dispatch(setError("Filtering chats failed"));
    }
  },
});

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
      .addCase(getChats.fulfilled, (state, action) => {
        console.log(action.payload);
        state.chats = action.payload.sort(
          (a, b) => b.created_at - a.created_at
        );
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
        const { chatId, data } = action.payload;

        const chat = state.chats.find((chat) => chat.id == chatId);

        if (chat) {
          Object.assign(chat, data);
        }

        if (state.activeChat && state.activeChat.id == chatId) {
          Object.assign(state.activeChat, updateChat);
        }
      })
      .addCase(updateChat.rejected, (state, action) => {
        state.error = action.error.message ?? "An error occurred";
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.activeMessages = action.payload.sort((a, b) => {
          return a.created_at - b.created_at;
        });
      })
      .addCase(deleteChatAndMessages.fulfilled, (state, action) => {
        state.chats = state.chats.filter((chat) => chat.id !== action.payload);
      })
      .addCase(pullRemoteChanges.fulfilled, (state, action) => {
        state.chats = action.payload.chats;

        if (state.activeChatId) {
          const activeChat = action.payload.chats.find(
            (chat) => chat.id === state.activeChatId
          );
          if (activeChat) {
            state.activeChat = activeChat;
          }
        }
      })
      .addCase(pullRemoteChanges.rejected, (state, action) => {
        state.error = action.error.message ?? "An unknown error occurred";
      });
  },
});

export const { setActiveChatId, resetMessages, setError, setActiveChat } =
  chatSlice.actions;

export default chatSlice.reducer;
