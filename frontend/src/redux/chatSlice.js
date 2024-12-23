import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

// Create an async thunk for fetching chat history
export const fetchChatHistory = createAsyncThunk('chat/fetchChatHistory', async () => {
    const response = await axios.get('/api/v1/user/chat-history', { withCredentials: true });
    console.log("Fetched chat history:", response.data.conversations); // Log the fetched data
    return response.data.conversations; // Ensure this returns the correct data structure
});

const chatSlice = createSlice({
    name: 'chat',
    initialState: {
        conversations: [],
        status: 'idle', // Add status for loading
        error: null,
    },
    reducers: {
        removeConversation: (state, action) => {
            state.conversations = state.conversations.filter(conv => conv.user._id !== action.payload);
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchChatHistory.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchChatHistory.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.conversations = action.payload; // Update conversations with fetched data
            })
            .addCase(fetchChatHistory.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message; // Capture error message
            });
    },
});

export const { removeConversation } = chatSlice.actions;
export default chatSlice.reducer; 