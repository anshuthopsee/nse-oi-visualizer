import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { type RootState } from "../../store";

export type ThemeMode = "dark" | "light";

type ThemeState = {
  mode: ThemeMode;
};

const initialState: ThemeState = {
  mode: "light",
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setThemeMode(state, action: PayloadAction<ThemeMode>) {
      state.mode = action.payload;
    },
  },
});

export const getThemeMode = (store: RootState) => store.theme.mode;

export const { setThemeMode } = themeSlice.actions;

export default themeSlice.reducer;