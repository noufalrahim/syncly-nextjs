import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import workspaceReducer from "./workspaceSlice";
import projectReducer from "./projectSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    workspace: workspaceReducer,
    project: projectReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
