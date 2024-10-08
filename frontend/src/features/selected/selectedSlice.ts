import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { type RootState } from "../../store";
import { type Identifier as Underlying } from "../../identifiers";
import { modifyOptionLegs, getTargetDateTime, getActiveOptionLegs, getMaxTargetDateTime } from "../../utils";
import { type StrikeDistancesFromATM, type Expiry, type StrikeRange, type OptionLeg,
  type ATMIVsPerExpiry, type FuturesPerExpiry, type BuilderData, type TargetUnderlyingPrice, type TargetDateTime } from "./types";

export type RequestStatus = "idle" | "loading" | "succeeded" | "failed";

export type OptionLegPayload = {
  type: "add";
  optionLeg: OptionLeg;
} | {
  type: "replace"
  optionLeg: OptionLeg;
  optionLegIndex: number;
} | {
  type: "delete";
  optionLegIndex: number;
} | {
  type: "set";
  optionLegs: OptionLeg[];
};

export type StrategyBuilder = {
  expiry: string | null;
  underlyingPrice: number | null;
  targetUnderlyingPrice: TargetUnderlyingPrice;
  targetDateTimeISOString: TargetDateTime;
  atmIVsPerExpiry: ATMIVsPerExpiry | null;
  futuresPerExpiry: FuturesPerExpiry | null;
  optionLegs: OptionLeg[];
  projectedFuturePrices: BuilderData["projectedFuturesPrices"];
};

type SelectedState = {
  underlying: Underlying;
  expiries: Expiry[] | null;
  strikeRange: StrikeRange;
  strikeDistanceFromATM: StrikeDistancesFromATM;
  nextUpdateAt: string | null;
  strategyBuilder: StrategyBuilder;
};

const initialState: SelectedState = {
  underlying: "NIFTY",
  expiries: null,
  strikeRange: {
    min: null,
    max: null,
  },
  strikeDistanceFromATM: "10",
  nextUpdateAt: null,
  strategyBuilder: {
    expiry: null,
    underlyingPrice: null,
    targetUnderlyingPrice: {
      value: null,
      autoUpdate: true,
    },
    targetDateTimeISOString: {
      value: getTargetDateTime().toISOString(),
      autoUpdate: true,
    },
    atmIVsPerExpiry: null,
    futuresPerExpiry: null,
    optionLegs: [],
    projectedFuturePrices: [],
  },
};

const selectSlice = createSlice({
  name: "selected",
  initialState,
  reducers: {
    setUnderlying: (state, action: PayloadAction<Underlying>) => {
      state.underlying = action.payload;
    },
    setExpiries: (state, action: PayloadAction<Expiry[]>) => {
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
    setNextUpdateAt: (state, action: PayloadAction<string>) => {
      state.nextUpdateAt = action.payload;
    },
    setSBExpiry: (state, action: PayloadAction<string>) => {
      state.strategyBuilder.expiry = action.payload;
    },
    setSBUnderlyingPrice: (state, action: PayloadAction<number>) => {
      state.strategyBuilder.underlyingPrice = action.payload;
    },
    setSBTargetDateTime: (state, action: PayloadAction<TargetDateTime>) => {
      state.strategyBuilder.targetDateTimeISOString = action.payload;
    },
    setSBTargetUnderlyingPrice: (state, action: PayloadAction<TargetUnderlyingPrice>) => {
      state.strategyBuilder.targetUnderlyingPrice = action.payload;
    },
    setSBATMIVsPerExpiry: (state, action: PayloadAction<ATMIVsPerExpiry>) => {
      state.strategyBuilder.atmIVsPerExpiry = action.payload;
    },
    setSBFuturesPerExpiry: (state, action: PayloadAction<FuturesPerExpiry>) => {
      state.strategyBuilder.futuresPerExpiry = action.payload;
    },
    setSBOptionLegs: (state, action: PayloadAction<OptionLegPayload>) => {
      const optionLegs = state.strategyBuilder.optionLegs;
      let updatedOptionLegs: OptionLeg[] = [];
      if (action.payload.type === "add") {
        updatedOptionLegs = modifyOptionLegs({
          optionLegs: optionLegs,
          newOptionLeg: action.payload.optionLeg,
          type: action.payload.type
        });
      } else if (action.payload.type === "replace") {
        updatedOptionLegs = modifyOptionLegs({
          optionLegs: optionLegs,
          newOptionLeg: action.payload.optionLeg,
          optionLegIndex: action.payload.optionLegIndex,
          type: action.payload.type
        });
      } else if (action.payload.type === "delete") {
        updatedOptionLegs = modifyOptionLegs({
          optionLegs: optionLegs,
          optionLegIndex: action.payload.optionLegIndex,
          type: action.payload.type
        });
      } else if (action.payload.type === "set") {
        updatedOptionLegs = action.payload.optionLegs;
      };
      state.strategyBuilder.optionLegs = updatedOptionLegs;
      const activeOptionLegs = getActiveOptionLegs(updatedOptionLegs);
      const maxTargetDateTime = getMaxTargetDateTime(activeOptionLegs);
      const targetDateTime = new Date(state.strategyBuilder.targetDateTimeISOString.value);
      if (maxTargetDateTime && targetDateTime.getTime() > maxTargetDateTime.getTime()) {
        state.strategyBuilder.targetDateTimeISOString = {
          ...state.strategyBuilder.targetDateTimeISOString,
          value: maxTargetDateTime.toISOString()
        };
      };
    },
    setSBProjectedFuturePrices: (state, action: PayloadAction<BuilderData["projectedFuturesPrices"]>) => {
      state.strategyBuilder.projectedFuturePrices = action.payload;
    },
  },
});

export const getUnderlying = (store: RootState) => store.selected.underlying;

export const getExpiries = (store: RootState) => store.selected.expiries;

export const getStrikeRange = (store: RootState) => store.selected.strikeRange;

export const getStrikeDistanceFromATM = (store: RootState) => store.selected.strikeDistanceFromATM;

export const getNextUpdateAt = (store: RootState) => store.selected.nextUpdateAt;

export const getSBExpiry = (store: RootState) => store.selected.strategyBuilder.expiry;

export const getSBTargetDateTime = (store: RootState) => store.selected.strategyBuilder.targetDateTimeISOString;

export const getSBUnderlyingPrice = (store: RootState) => store.selected.strategyBuilder.underlyingPrice;

export const getSBTargetUnderlyingPrice = (store: RootState) => store.selected.strategyBuilder.targetUnderlyingPrice;

export const getSBATMIVsPerExpiry = (store: RootState) => store.selected.strategyBuilder.atmIVsPerExpiry;

export const getSBFuturesPerExpiry = (store: RootState) => store.selected.strategyBuilder.futuresPerExpiry;

export const getSBOptionLegs = (store: RootState) => store.selected.strategyBuilder.optionLegs;

export const getSBProjectedFuturePrices = (store: RootState) => store.selected.strategyBuilder.projectedFuturePrices;

export const { setUnderlying, setExpiries, setMinMaxStrike, setStrikeRange, setStrikeDistanceFromATM, setNextUpdateAt, 
  setSBExpiry, setSBOptionLegs, setSBUnderlyingPrice, setSBTargetUnderlyingPrice, setSBTargetDateTime, setSBATMIVsPerExpiry, 
  setSBFuturesPerExpiry, setSBProjectedFuturePrices } = selectSlice.actions;

export default selectSlice.reducer;