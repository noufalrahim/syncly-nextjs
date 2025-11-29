import { configureStore } from "@reduxjs/toolkit";
import projectReducer from "./projectSlice";
import userReducer from "./userSlice";
import workspaceReducer from "./workspaceSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    workspace: workspaceReducer,
    project: projectReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
