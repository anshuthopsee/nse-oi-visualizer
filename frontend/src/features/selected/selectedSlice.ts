import axios from "axios";
import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { type RootState } from "../../store";
import { type IdentifiersType as Underlying } from "../../identifiers";
import formatData, { getMinAndMaxStrikePrice } from "../../utils";
import { type StrikeDistancesFromATM, type Expiries, type StrikeRange } from "./types";

export type Data = ReturnType<typeof formatData> | null;

export type RequestStatus = "idle" | "loading" | "succeeded" | "failed";

type SelectedState = {
  underlying: Underlying;
  expiries: Expiries;
  strikeRange: StrikeRange;
  strikeDistanceFromATM: StrikeDistancesFromATM;
  requestStatus: RequestStatus;
  data: Data;
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
  requestStatus: "idle",
  data: null,
};


type Controller = AbortController | null;

type FetchOIDataPayload = {
  underlying: Underlying,
  controller: Controller,
};

export const fetchOIData = createAsyncThunk("data/fetchOIData", async ({ underlying, controller }: FetchOIDataPayload) => {
  let identifier: string = underlying;

  if (identifier.endsWith(" - Weekly")) {
    identifier = identifier.replace(" - Weekly", "");
  } else if (identifier.endsWith(" - Monthly")) {
    identifier = identifier.replace(" - Monthly", "");
  };

  identifier =  encodeURIComponent(identifier);

  const url = `/api?identifier=${identifier}`;

  const options = {
    method: 'GET',
    url: url,
    signal: controller?.signal,
  };

  const res = await axios.request(options);
  return res.data;
});

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
    setStrikeRange: (state, action: PayloadAction<{ strikeRange: StrikeRange, customStrikeRange: boolean }>) => {
      state.strikeRange = action.payload.strikeRange;
      if (action.payload.customStrikeRange) {
        state.strikeDistanceFromATM = null;
      };
    },
    setStrikeDistanceFromATM: (state, action: PayloadAction<StrikeDistancesFromATM>) => {
      state.strikeDistanceFromATM = action.payload;

      if (state.data) {
        const { strikePrices, underlyingValue } = state.data;
        const { minStrike, maxStrike } = getMinAndMaxStrikePrice(
          strikePrices, 
          underlyingValue, 
          action.payload
        );
        state.strikeRange.min = minStrike;
        state.strikeRange.max = maxStrike;
      };
    },
    setData: (state, action: PayloadAction<Data>) => {
      state.data = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOIData.pending, (state) => {
        state.requestStatus = "loading";
      })
      .addCase(fetchOIData.fulfilled, (state, action) => {
        console.log("fulfilled");
        const data = formatData(action.payload, state.underlying);
        state.data = data;
        const { strikePrices, underlyingValue } = data;

        if (state.strikeDistanceFromATM !== null) {
          const { minStrike, maxStrike } = getMinAndMaxStrikePrice(
            strikePrices, 
            underlyingValue, 
            state.strikeDistanceFromATM
          );

          state.strikeRange.min = minStrike;
          state.strikeRange.max = maxStrike;
        };

        state.requestStatus = "succeeded";
      })
      .addCase(fetchOIData.rejected, (state, action) => {
        if (action.error.name !== "CanceledError") {
          state.requestStatus = "failed";
        };

        console.log("rejected");
      });
  },
});

export const getUnderlying = (store: RootState) => store.selected.underlying;

export const getExpiries = (store: RootState) => store.selected.expiries;

export const getStrikeRange = (store: RootState) => store.selected.strikeRange;

export const getStrikeDistanceFromATM = (store: RootState) => store.selected.strikeDistanceFromATM;

export const getRequestStatus = (store: RootState) => store.selected.requestStatus;

export const getData = (store: RootState) => store.selected.data;

export const { setUnderlying, setExpiries, setStrikeRange, setStrikeDistanceFromATM } = selectSlice.actions;

export default selectSlice.reducer;