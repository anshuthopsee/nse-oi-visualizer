import { Identifier as Underlying } from "../identifiers";
import { type StrikeDistancesFromATM, type DataItem, type ContractData, type TransformedData } from "../features/selected/types";

export const formatDate = (date: Date): string => {
  const months: string[] = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const day = String(date.getDate()).padStart(2, '0');
  const monthAbbreviation = months[date.getMonth()];
  const year = date.getFullYear();

  return `${day}-${monthAbbreviation}-${year}`;
};

export const parseDate = (dateStr: string) => {
  const [day, monthAbbr, year] = dateStr.split("-");
  const monthNames: { [key: string]: number } = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
  };
  const month = monthNames[monthAbbr];
  return new Date(Number(year), month, Number(day));
};

export const getNearestStrikePrice = (strikePrices: number[], underlyingValue: number) => {
  const nearestStrikePrice = strikePrices.reduce((prev, curr) => {
    return Math.abs(curr - underlyingValue) < Math.abs(prev - underlyingValue) ? curr : prev;
  }, 0);
  return nearestStrikePrice;
};

export const getMinAndMaxStrikePrice = (
  strikePrices: number[], 
  underlyingValue: number, 
  strikeDistanceFromATM: StrikeDistancesFromATM
) => {

  if (strikePrices.length === 0) {
    return {
      minStrike: null,
      maxStrike: null
    };
  };

  if (strikeDistanceFromATM === "All") {
    return {
      minStrike: strikePrices[0],
      maxStrike: strikePrices[strikePrices.length - 1]
    };
  };

  const nearestStrikePrice = getNearestStrikePrice(strikePrices, underlyingValue);

  const strikeDistance = Number(strikeDistanceFromATM);

  const nearestStrikePriceIndex = strikePrices.findIndex((strikePrice) => strikePrice === nearestStrikePrice);
  const minStrike = strikePrices[nearestStrikePriceIndex - strikeDistance] || strikePrices[0];
  const maxStrike = strikePrices[nearestStrikePriceIndex + strikeDistance] || strikePrices[strikePrices.length - 1];

  return {
    minStrike,
    maxStrike
  };
};

const mergeAndAddValues = (dataA: ContractData, dataB: ContractData) => {
  const merged = {
    ...dataA,
    openInterest: dataA.openInterest + dataB.openInterest,
    changeinOpenInterest: dataA.changeinOpenInterest + dataB.changeinOpenInterest,
    pchangeinOpenInterest: dataA.pchangeinOpenInterest + dataB.pchangeinOpenInterest,
    totalTradedVolume: dataA.totalTradedVolume + dataB.totalTradedVolume,
    change: dataA.change + dataB.change,
    pChange: dataA.pChange + dataB.pChange,
    totalBuyQuantity: dataA.totalBuyQuantity + dataB.totalBuyQuantity,
    totalSellQuantity: dataA.totalSellQuantity + dataB.totalSellQuantity,
  };

  return merged;
};

export const filterDataOnStrikeRange = (data: DataItem[], minStrike: number, maxStrike: number) => {
  return data.filter((item) => item.strikePrice >= minStrike && item.strikePrice <= maxStrike);
};

export const combineSelectedExpiriesData = (data: TransformedData, expiries: string[]) => {

  const { grouped } = data;

  const mergedAndValuesSummed: DataItem[] = [];

  for (const strikePrice of data.strikePrices) {

    let merged: DataItem | null = null;

    for (let i = 0; i < expiries.length; i++) {

      const currentData = grouped[expiries[i]]?.data || [];

      const current = currentData.find((item) => item.strikePrice === strikePrice);

      if (!merged) {
        
        if (current) {
          merged = {
            ...current
          };
        };
        continue;
      };

      if (merged && current) {

        if (merged.CE && current.CE) {
          merged.CE = mergeAndAddValues(merged.CE, current.CE);
        };

        if (merged.PE && current.PE) {
          merged.PE = mergeAndAddValues(merged.PE, current.PE);
        };

        if (!merged.CE && current.CE) {
          merged.CE = current.CE;
        };
      };

    };

    if (merged) {
      mergedAndValuesSummed.push(merged);
    };
  };

  return mergedAndValuesSummed;
};

export const formatAndAddSuffix = (value: number) => {
  if (Math.abs(value) >= 100000) {
    return (value / 100000).toFixed(1) + "L";
  } else if (Math.abs(value) >= 1000) {
    return (value / 1000).toFixed(1) + "K";
  } else {
    return String(value);
  };
};

export const getTimeStamp = (date: Date) => {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

export const generateMinuteMarks = () => {
  const minuteMarks = [];
  for (let i = 0; i <= 60; i+=3) {
    minuteMarks.push(i);
  };

  return minuteMarks;
};

export const getCurrentTime = (date: Date) => {
  return getTimeStamp(date);
};

export const getNextTime = (date: Date) => {
  const minuteMarks = generateMinuteMarks();
  const currentMinutes = date.getMinutes();
  const nextMinuteMark = minuteMarks.find((mark) => mark > currentMinutes);
  const next = new Date(date);
  next.setMinutes(nextMinuteMark || 0);
  next.setSeconds(0);
  return getTimeStamp(next);
};

export const haveExpiriesChanged = (currentExpiries: string[], nextExpiries: string[]) => {
  if (currentExpiries.length !== nextExpiries.length) {
    return true;
  };

  for (let i = 0; i < currentExpiries.length; i++) {
    if (currentExpiries[i] !== nextExpiries[i]) {
      return true;
    };
  };

  return false;
};

export const getExpiryDatesHeader = (initialText: string, expiryDates: string[]) => {
  let header = initialText;
  
  for (let i = 0; i < expiryDates.length; i++) {
    const expiryDate = expiryDates[i].replace(/-/g, " ");
    if (i < expiryDates.length - 1) {
      header += i === 0 ? " " : ", ";
      header += `${expiryDate}`;
    } else {
      header += expiryDates.length > 1 ? " & " : " ";
      header += `${expiryDate} ${expiryDates.length > 1 ? "Expiries" : "Expiry"}`;
    };
  };

  return header;
};

type OptionLeg = {
  active: boolean;
  action: "B" | "S";
  expiry: string;
  strike: number;
  type: "CE" | "PE";
  lots: number;
  price: number | null;
  iv: number | null;
};

type ModifyOptionLegsPayload = {
  type: "add";
  optionLegs: OptionLeg[] | null;
  newOptionLeg: OptionLeg;
} | {
  type: "replace";
  optionLegs: OptionLeg[] | null;
  newOptionLeg: OptionLeg;
  optionLegIndex: number;
} | {
  type: "delete";
  optionLegs: OptionLeg[] | null;
  optionLegIndex: number;
};

export const modifyOptionLegs = (payload: ModifyOptionLegsPayload) => {

  if (payload.type === "add") {
    const { optionLegs, newOptionLeg } = payload;

    if (!optionLegs || optionLegs.length === 0) {
      return [newOptionLeg];
    };

    return [...optionLegs, newOptionLeg];
  } else if (payload.type === "replace") {
    const { optionLegs, newOptionLeg, optionLegIndex } = payload;

    if (!optionLegs || optionLegs.length === 0) {
      return [newOptionLeg];
    };

    const modifiedOptionLegs = [...optionLegs];
    modifiedOptionLegs[optionLegIndex] = newOptionLeg;
    return modifiedOptionLegs;
  } else if (payload.type === "delete") {
    const { optionLegs, optionLegIndex } = payload;

    if (!optionLegs || optionLegs.length === 0) {
      return [];
    };

    const modifiedOptionLegs = [...optionLegs];
    modifiedOptionLegs.splice(optionLegIndex, 1);
    return modifiedOptionLegs;
  } else {
    return [];
  };
};

const getNextWeekdayDate = (date: Date) => {
  const day = date.getDay();
  let add = 1;
  if (day === 6) {
    add = 2 
  } else if (day === 5) {
    add = 3;
  }
  date.setDate(date.getDate() + add);
  return date;
};

export const getIST = () => {
  const currentTime = new Date();
  const currentOffset = currentTime.getTimezoneOffset();
  const ISTOffset = 330;   // IST offset UTC +5:30 
  const ISTTime = new Date(currentTime.getTime() + (ISTOffset + currentOffset) * 60000);
  return ISTTime;
};

export const getExpiryDateTime = (expiryDate: string) => {
  const expiryDateTime = new Date(expiryDate);
  expiryDateTime.setHours(15, 30, 0, 0);
  return expiryDateTime;
};

export const getTargetDateTime = () => {
  const dateTimeIST = getIST();
  const marketOpen = new Date(dateTimeIST);
  marketOpen.setHours(9, 15, 0, 0);
  const marketClose = new Date(dateTimeIST);
  marketClose.setHours(15, 30, 0, 0);
  const nextWeekday = getNextWeekdayDate(new Date(dateTimeIST));
  nextWeekday.setHours(9, 15, 0, 0);
  
  if (dateTimeIST.getDay() === 6 
  || dateTimeIST.getDay() === 0) {
    return nextWeekday;
  };

  if (dateTimeIST > marketClose) {
    return marketClose;
  };

  if (dateTimeIST < marketOpen) {
    return marketOpen;
  };

  return dateTimeIST;
};

export const getUnderlyingType = (underlying: Underlying) => {
  return underlying === "NIFTY" || underlying === "BANKNIFTY"
  || underlying === "FINNIFTY" || underlying === "MIDCPNIFTY";
};