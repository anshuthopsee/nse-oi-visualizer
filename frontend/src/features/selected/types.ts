export const strikeDistancesFromATM = ["5", "10", "15", "20", "25", "All"] as const;

export type StrikeDistancesFromATM = typeof strikeDistancesFromATM[number] | null;

export type ATMIVsPerExpiry = { [key: string]: number };
export type FuturesPerExpiry = { [key: string]: number };

export type Contract = {
  totalOI: number;
  totalVol: number;
};

export type Records = {
  data: DataItem[];
  expiryDates: string[];
  strikePrices: number[];
  timestamp: string;
  underlyingValue: number;
};

export type Greeks = {
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  rho: number;
};

export type ContractData = {
  askPrice: number;
  askQty: number;
  bidprice: number;
  bidQty: number;
  change: number;
  changeinOpenInterest: number;
  expiryDate: string;
  identifier: string;
  impliedVolatility: number;
  lastPrice: number;
  openInterest: number;
  pChange: number;
  pchangeinOpenInterest: number;
  strikePrice: number;
  totalBuyQuantity: number;
  totalSellQuantity: number;
  totalTradedVolume: number;
  underlying: string;
  underlyingValue: number;
  greeks: Greeks | null;
};

export type DataItem = {
  strikePrice: number;
  expiryDate: string;
  PE?: ContractData;
  CE?: ContractData;
  syntheticFuturesPrice: number;
  iv: number;
};

export type DataItemWithSFP = DataItem & {
  syntheticFuturesPrice: number;
};

export type Filtered = {
  data: DataItem[];
  CE: Contract;
  PE: Contract;
};

export type Data = {
  filtered: Filtered;
  records: Records;
};

export type CurrentAndNext = {
  expiryDate: string;
  data: DataItem[];
};

export type Categorized = {
  current: CurrentAndNext | null;
  next: CurrentAndNext | null;
};

export type GroupedData = {
  [key: string]: {
    atmStrike: number | null;
    atmIV: number | null;
    syntheticFuturesPrice: number | null;
    data: DataItem[];
  };
};

export type StrikeRange = {
  min: number | null;
  max: number | null;
};

export type Expiry = {
  date: string;
  chosen: boolean;
};

export type TransformedData = {
  underlying: string;
  grouped: GroupedData;
  filteredExpiries: string[];
  allExpiries: string[];
  strikePrices: number[];
  underlyingValue: number;
};

export type ProjectedFuturesPrices = {
  expiry: string;
  price: number;
}[];

export type PayoffAt = {
  payoff: number;
  at: number;
};

export type BuilderData = {
  payoffsAtTarget: PayoffAt[];
  payoffsAtExpiry: PayoffAt[];
  xMin: number;
  xMax: number;
  projectedFuturesPrices: ProjectedFuturesPrices;
  underlyingPrice: number;
  targetUnderlyingPrice: number;
  payoffAtTarget: number;
};

export type OptionLeg = {
  active: boolean;
  action: "B" | "S";
  expiry: string;
  strike: number;
  type: "CE" | "PE";
  lots: number;
  price: number | null;
  iv: number | null;
};

export type ActiveOptionLeg = Omit<OptionLeg, "active">;