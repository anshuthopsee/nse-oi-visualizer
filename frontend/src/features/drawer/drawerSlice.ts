import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { type RootState } from "../../store";

const initialState = {
  isOpen: false,
};

const drawerSlice = createSlice({
  name: 'drawer',
  initialState,
  reducers: {
    setDrawerState(state, action: PayloadAction<boolean>) {
      state.isOpen = action.payload;
    },
  },
});

export const getDrawerState = (state: RootState) => state.drawer.isOpen;

export const { setDrawerState } = drawerSlice.actions;

export default drawerSlice.reducer;