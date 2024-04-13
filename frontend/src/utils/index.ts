import { IdentifiersType as Underlying } from "../identifiers";
import { StrikeDistancesFromATM, Data, DataItem, GroupedData, Categorized,ContractData } from "../features/selected/types";

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

const getCurrentAndNextExpiry = (payload: { 
  groupedData: GroupedData, 
  expiryDates: string[],
  isIndex: boolean, 
  isMonthly: boolean }) => {

  const { groupedData, expiryDates, isIndex, isMonthly } = payload;
  
  const parsedDates = expiryDates.map(parseDate);

  const categorized: Categorized = {
    current: null,
    next: null 
  };

  if (!isIndex) {
    const [currentDate, nextDate] = parsedDates;
    const [formattedCurrentDate, formattedNextDate] = [
      formatDate(currentDate), 
      formatDate(nextDate)
    ];

    categorized.current = {
      expiryDate: formattedCurrentDate,
      data: groupedData[formattedCurrentDate]
    };

    categorized.next = {
      expiryDate: formattedNextDate,
      data: groupedData[formattedNextDate]
    };

    return categorized;
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 1; i < parsedDates.length; i++) {
    const date = parsedDates[i - 1];
    const nextDate = parsedDates[i];
    const formattedDate = formatDate(date);

    if (
      categorized.current &&
      categorized.next
    ) {
      break;
    };

    if (!isMonthly) {
      if (date >= today && !categorized.current) {
        categorized.current = {
          expiryDate: formattedDate,
          data: groupedData[formattedDate]
        }
      } else if (
        date > today &&
        categorized.current &&
        !categorized.next
      ) {
        categorized.next = {
          expiryDate: formattedDate,
          data: groupedData[formattedDate]
        };
      };
    } else {
      if (
        date >= today &&
        date.getMonth() !== nextDate.getMonth() &&
        !categorized.current
      ) {
        categorized.current = {
          expiryDate: formattedDate,
          data: groupedData[formattedDate]
        }
      } else if (
        date > today &&
        date.getMonth() !== nextDate.getMonth() &&
        categorized.current &&
        !categorized.next
      ) {
        categorized.next = {
          expiryDate: formattedDate,
          data: groupedData[formattedDate]
        };
      };
    };
  };

  return categorized;
};

const formatData = (data: Data, underlying: Underlying) => {
  const records = data.records;
  const groupedData = records.data.reduce((group, item) => {
    const { expiryDate } = item;
    group[expiryDate] = group[expiryDate] || [];
    group[expiryDate].push(item);
    return group;
  }, {} as { [key: string]: DataItem[] });

  const isMonthly = underlying.endsWith(" - Monthly");

  const indices = ["NIFTY", "BANKNIFTY", "FINNIFTY", "MIDCPNIFTY"];

  const isIndex = indices.some((index) => underlying.startsWith(index));

  const formattedData = getCurrentAndNextExpiry({
    groupedData, 
    expiryDates: records.expiryDates,
    isIndex,
    isMonthly,
  });

  const currentStrikePrices = formattedData.current?.data.map((item) => item.strikePrice) || [];
  const nextStrikePrices = formattedData.next?.data.map((item) => item.strikePrice) || [];
  const mergedStrikePrices = mergeTwoArrays(currentStrikePrices, nextStrikePrices);

  return {
    ...formattedData,
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

const mergeAndAddValues = (currentData: ContractData, nextData: ContractData) => {
  const merged = {
    ...currentData,
    openInterest: currentData.openInterest + nextData.openInterest,
    changeinOpenInterest: currentData.changeinOpenInterest + nextData.changeinOpenInterest,
    pchangeinOpenInterest: currentData.pchangeinOpenInterest + nextData.pchangeinOpenInterest,
    totalTradedVolume: currentData.totalTradedVolume + nextData.totalTradedVolume,
    change: currentData.change + nextData.change,
    pChange: currentData.pChange + nextData.pChange,
    totalBuyQuantity: currentData.totalBuyQuantity + nextData.totalBuyQuantity,
    totalSellQuantity: currentData.totalSellQuantity + nextData.totalSellQuantity,
  };

  return merged;
};

export const filterDataOnStrikeRange = (data: DataItem[], minStrike: number, maxStrike: number) => {
  return data.filter((item) => item.strikePrice >= minStrike && item.strikePrice <= maxStrike);
};

export const combineCurrentAndNextData = (data: ReturnType<typeof formatData>) => {
  const mergedAndValuesSummed: DataItem[] = [];

  for (const strikePrice of data.strikePrices) {
    const current = data.current?.data.find((item) => item.strikePrice === strikePrice);
    const next = data.next?.data.find((item) => item.strikePrice === strikePrice);
    
    if (current && next) {
      const merged = {
        ...current
      };

      if (current.CE && next.CE) {
        merged.CE = mergeAndAddValues(current.CE, next.CE);
      };

      if (current.PE && next.PE) {
        merged.PE = mergeAndAddValues(current.PE, next.PE);
      };

      if (!current.CE && next.CE) {
        merged.CE = next.CE;
      };

      mergedAndValuesSummed.push(merged);

    } else if (current && !next) {
      mergedAndValuesSummed.push(current);

    } else if (!current && next) {    
      mergedAndValuesSummed.push(next);
      
    } else {
      return null;
    };
  };

  return mergedAndValuesSummed;
};

export const formatAndAddSuffix = (value: number) => {
  if (Math.abs(value) >= 100000) {
    return (value / 100000).toFixed(1) + "L";
  } else if (Math.abs(value) >= 1000) {
    return (value / 1000).toFixed(0) + "K";
  } else {
    return String(value);
  };
};

export const getCurrentTime = () => {
  const date = new Date();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};


export default formatData;