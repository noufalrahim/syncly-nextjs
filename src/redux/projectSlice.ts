import { createSlice } from "@reduxjs/toolkit";
import type { TProject } from "@/types";

export interface IProjectState {
  entity: TProject | null;
}

const initialState: IProjectState = {
  entity: null,
};

export const projectSlice = createSlice({
  name: "project",
  initialState,
  reducers: {
    setProject: (state, action) => {
      state.entity = action.payload;
    },
    clearProject: (state) => {
      state.entity = null;
    },
  },
});

export const { setProject, clearProject } = projectSlice.actions;
export default projectSlice.reducer;
