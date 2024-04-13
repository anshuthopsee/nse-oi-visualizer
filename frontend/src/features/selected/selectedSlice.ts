import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { type RootState } from "../../store";
import { type IdentifiersType as Underlying } from "../../identifiers";
import formatData from "../../utils";
import { type StrikeDistancesFromATM, type Expiries, type StrikeRange } from "./types";

export type Data = ReturnType<typeof formatData> | null;

export type RequestStatus = "idle" | "loading" | "succeeded" | "failed";

type SelectedState = {
  underlying: Underlying;
  expiries: Expiries;
  strikeRange: StrikeRange;
  strikeDistanceFromATM: StrikeDistancesFromATM;
  lastRequestAt: string | null;
};

const initialState: SelectedState = {
  underlying: "NIFTY - Weekly",
  expiries: {
    current: true,
    next: true,
  },
  strikeRange: {
    min: null,
    max: null,
  },
  strikeDistanceFromATM: "10",
  lastRequestAt: null,
};

const selectSlice = createSlice({
  name: "selected",
  initialState,
  reducers: {
    setUnderlying: (state, action: PayloadAction<Underlying>) => {
      state.underlying = action.payload;
    },
    setExpiries: (state, action: PayloadAction<Expiries>) => {
      state.expiries = action.payload;
    },
    setMinMaxStrike: (state, action: PayloadAction<{ min: number | null, max: number | null }>) => {
      state.strikeRange.min = action.payload.min;
      state.strikeRange.max = action.payload.max;
    },
    setStrikeRange: (state, action: PayloadAction<{ strikeRange: StrikeRange, customStrikeRange: boolean }>) => {
      state.strikeRange = action.payload.strikeRange;
      if (action.payload.customStrikeRange) {
        state.strikeDistanceFromATM = null;
      };
    },
    setStrikeDistanceFromATM: (state, action: PayloadAction<StrikeDistancesFromATM>) => {
      state.strikeDistanceFromATM = action.payload;
    },
    setLastRequestAt: (state, action: PayloadAction<string>) => {
      state.lastRequestAt = action.payload;
    }
  },
});

export const getUnderlying = (store: RootState) => store.selected.underlying;

export const getExpiries = (store: RootState) => store.selected.expiries;

export const getStrikeRange = (store: RootState) => store.selected.strikeRange;

export const getStrikeDistanceFromATM = (store: RootState) => store.selected.strikeDistanceFromATM;

export const getLastRequestAt = (store: RootState) => store.selected.lastRequestAt;

export const { setUnderlying, setExpiries, setMinMaxStrike , setStrikeRange, setStrikeDistanceFromATM, setLastRequestAt } = selectSlice.actions;

export default selectSlice.reducer;