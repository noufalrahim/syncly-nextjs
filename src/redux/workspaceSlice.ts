import { createSlice } from "@reduxjs/toolkit";
import type { TWorkspace } from "@/types";

export interface IWorkspaceState {
  entity: TWorkspace | null;
}

const initialState: IWorkspaceState = {
  entity: null,
};

export const workspaceSlice = createSlice({
  name: "workspace",
  initialState,
  reducers: {
    setWorkspace: (state, action) => {
      state.entity = action.payload;
    },
    clearWorkspace: (state) => {
      state.entity = null;
    },
  },
});

export const { setWorkspace, clearWorkspace } = workspaceSlice.actions;
export default workspaceSlice.reducer;
