import { createSlice } from "@reduxjs/toolkit";
import type { TUser } from "@/types";

export interface UserState {
  entity: TUser | null;
}

const initialState: UserState = {
  entity: null,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.entity = action.payload;
    },
    clearUser: (state) => {
      state.entity = null;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
