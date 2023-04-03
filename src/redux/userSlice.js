import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    user: null,
    allUsers: [],
    allChats: [],
    selectedChat: null,
    selectGroupForEdit: null,
  },

  reducers: {
    SetUser: (state, action) => {
      state.user = action.payload;
    },
    SetAllUsers: (state, action) => {
      state.allUsers = action.payload;
    },
    SetAllChats: (state, action) => {
      state.allChats = action.payload;
    },
    SetSelectedChat: (state, action) => {
      state.selectedChat = action.payload;
    },
    SetSelectGroupForEdit: (state, action) => {
      state.selectGroupForEdit = action.payload;
    },
    Logout: (state, action) => {
      state.user = null;
      state.allUsers = [];
      state.allChats = [];
      state.selectedChat = null;
      state.selectGroupForEdit = null;
    },
  },
});

export const {
  SetUser,
  SetAllUsers,
  SetAllChats,
  SetSelectedChat,
  SetSelectGroupForEdit,
  Logout,
} = userSlice.actions;

export default userSlice.reducer;
