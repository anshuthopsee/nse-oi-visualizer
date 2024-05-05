import { IdentifiersType as Underlying } from "../identifiers";
import { StrikeDistancesFromATM, Data, DataItem,ContractData } from "../features/selected/types";

const formatDate = (date: Date): string => {
  const months: string[] = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const day = String(date.getDate()).padStart(2, '0');
  const monthAbbreviation = months[date.getMonth()];
  const year = date.getFullYear();

  return `${day}-${monthAbbreviation}-${year}`;
};

const parseDate = (dateStr: string) => {
  const [day, monthAbbr, year] = dateStr.split("-");
  const monthNames: { [key: string]: number } = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
  };
  const month = monthNames[monthAbbr];
  return new Date(Number(year), month, Number(day));
};

const mergeTwoArrays = (arr1: number[], arr2: number[]) => {
  return [...new Set([...arr1, ...arr2])].sort((a, b) => a - b);
};

const getFilteredExpiries = (params: { 
  expiryDates: string[],
  isIndex: boolean }) => {

  const { expiryDates, isIndex } = params;
  const parsedDates = expiryDates.map(parseDate);

  if (!isIndex) {
    const [currentDate, nextDate] = parsedDates;
    const [formattedCurrentDate, formattedNextDate] = [
      formatDate(currentDate), 
      formatDate(nextDate)
    ];

    return [formattedCurrentDate, formattedNextDate];

  } else {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let monthExpiryCount = 0;

    const filteredExpiries: string[] = [];

    for (let i = 1; i < parsedDates.length; i++) {
      const date = parsedDates[i - 1];
      const nextDate = parsedDates[i];
      const formattedDate = formatDate(date);

      if (i <= 2) {
        filteredExpiries.push(formattedDate);
        continue;
      };

      if (date >= today &&
          date.getMonth() !== nextDate.getMonth()
      ) {
        if (monthExpiryCount === 2) {
          break;
        };

        filteredExpiries.push(formattedDate);
        monthExpiryCount++;
      };
    };

    return filteredExpiries;
  };
};

const formatData = (data: Data, underlying: Underlying) => {
  const records = data.records;
  const groupedData = records.data.reduce((group, item) => {
    const { expiryDate } = item;
    group[expiryDate] = group[expiryDate] || [];
    group[expiryDate].push(item);
    return group;
  }, {} as { [key: string]: DataItem[] });

  const indices = ["NIFTY", "BANKNIFTY", "FINNIFTY", "MIDCPNIFTY"];

  const isIndex = indices.some((index) => underlying.startsWith(index));

  const filteredExpiries = getFilteredExpiries({
    expiryDates: records.expiryDates,
    isIndex
  });

  let mergedStrikePrices: number[] = [];

  for (const expiryDate of filteredExpiries) {
    const strikePrices = groupedData[expiryDate].map((item) => item.strikePrice);
    mergedStrikePrices = mergeTwoArrays(mergedStrikePrices, strikePrices);
  };

  return {
    underlying,
    grouped: groupedData,
    filteredExpiries,
    allExpiries: records.expiryDates,
    strikePrices: mergedStrikePrices,
    underlyingValue: records.underlyingValue,
  };
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

export const combineSelectedExpiriesData = (data: ReturnType<typeof formatData>, expiries: string[]) => {

  const { grouped } = data;

  const mergedAndValuesSummed: DataItem[] = [];

  for (const strikePrice of data.strikePrices) {

    let merged: DataItem | null = null;

    for (let i = 0; i < expiries.length; i++) {

      const currentData = grouped[expiries[i]] || [];

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


export default formatData;