export const strikeDistancesFromATM = ["5", "10", "15", "20", "25", "All"] as const;

export type StrikeDistancesFromATM = typeof strikeDistancesFromATM[number] | null;

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
};

export type DataItem = {
  strikePrice: number;
  expiryDate: string;
  PE?: ContractData;
  CE?: ContractData;
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
  [key: string]: DataItem[];
};

export type StrikeRange = {
  min: number | null;
  max: number | null;
};

export type Expiries = {
  date: string;
  chosen: boolean;
}[] | null;