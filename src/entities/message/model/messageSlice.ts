import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Message } from './types';

interface MessageState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

const initialState: MessageState = {
  messages: [],
  isLoading: false,
  error: null,
};

function getStatusMessage(status: number): string {
  if (status === 429) return 'Превышен лимит запросов. Подождите немного и попробуйте снова.';
  if (status === 401 || status === 403) return 'Неверный API ключ. Проверьте настройки.';
  if (status >= 500) return 'Ошибка сервера. Попробуйте позже.';
  return `Ошибка запроса (${status})`;
}

export const sendMessage = createAsyncThunk<
  string,
  { text: string },
  { rejectValue: string }
>(
  'message/sendMessage',
  async ({ text }, { signal, rejectWithValue }) => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
        signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData.error || getStatusMessage(response.status));
      }

      const data = await response.json();
      return data.reply;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return rejectWithValue('__aborted__');
      }
      if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
        return rejectWithValue('Нет подключения к интернету. Проверьте сеть.');
      }
      return rejectWithValue(err.message || 'Произошла неизвестная ошибка.');
    }
  }
);

const messageSlice = createSlice({
  name: 'message',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
    },
    clearMessages: (state) => {
      state.messages = [];
      state.error = null;
    },
    abortRequest: (state) => {
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendMessage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages.push({
          id: Date.now().toString(),
          role: 'ai',
          content: action.payload,
        });
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isLoading = false;
        if (action.payload === '__aborted__') return;
        const errorText = action.payload || 'Произошла неизвестная ошибка.';
        state.error = errorText;
        state.messages.push({
          id: Date.now().toString(),
          role: 'ai',
          content: errorText,
          isError: true,
        });
      });
  },
});

export const { addMessage, clearMessages, abortRequest } = messageSlice.actions;
export default messageSlice.reducer;
