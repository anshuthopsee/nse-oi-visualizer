import { euroImpliedVol76, gbs, gbsLimits } from "./black76.js";

const mergeTwoArrays = (arr1, arr2) => {
  return [...new Set([...arr1, ...arr2])].sort((a, b) => a - b);
};

const formatDate = (date) => {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const day = String(date.getDate()).padStart(2, '0');
  const monthAbbreviation = months[date.getMonth()];
  const year = date.getFullYear();

  return `${day}-${monthAbbreviation}-${year}`;
};

const parseDate = (dateStr) => {
  const [day, monthAbbr, year] = dateStr.split("-");
  const monthNames = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
  };
  const month = monthNames[monthAbbr];
  return new Date(Number(year), month, Number(day));
};

const getFilteredExpiries = (params) => {

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

    const filteredExpiries = [];

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

export const getNearestStrikePrice = (strikePrices, underlyingValue) => {
  const nearestStrikePrice = strikePrices.reduce((prev, curr) => {
    return Math.abs(curr - underlyingValue) < Math.abs(prev - underlyingValue) ? curr : prev;
  }, 0);
  return nearestStrikePrice;
};

export const getIST = (date = new Date()) => {
  const currentTime = date;
  const currentOffset = currentTime.getTimezoneOffset();
  const ISTOffset = 330;   // IST offset UTC +5:30 
  const ISTTime = new Date(currentTime.getTime() + (ISTOffset + currentOffset) * 60000);
  return ISTTime;
};

export const getLatestWeekday = () => {
  const date = getIST();
  const marketOpen = new Date(date);
  marketOpen.setHours(9, 15, 0);
  const day = date.getDay();
  if (day === 6) { // Saturday
      date.setDate(date.getDate() - 1);
  } else if (day === 0) { // Sunday
      date.setDate(date.getDate() - 2);
  } else if (date.getDay() === 1 && date < marketOpen) {
    date.setDate(date.getDate() - 3);
  } else if (date < marketOpen) {
    date.setDate(date.getDate() - 1);
  };

  return date;
};

export const convertMsToDays = (ms) => {
  return ms / 1000 / 60 / 60/ 24;
};

export const convertDaysToYears = (days) => {
  const daysInYear = new Date().getFullYear() % 4 === 0 ? 366 : 365;
  return days / daysInYear;
};

export const getDaysToExpiry = (expiry, targetDateTime) => {
  const latestWeekday = getLatestWeekday();
  const today = getIST();

  const expiryDay = new Date(expiry);
  expiryDay.setHours(15, 30, 0);
  let daysToExpiry;

  if (targetDateTime) {
    const diffInMs = expiryDay.getTime() - targetDateTime.getTime();
    daysToExpiry = convertMsToDays(diffInMs);
    return daysToExpiry;
  };

  if (formatDate(latestWeekday) === formatDate(today)) {

    const todayMarketClose = new Date(today);
    todayMarketClose.setHours(15, 30, 0);

    if (today > todayMarketClose) {
      today.setHours(15, 30, 0);
    };

    const diffInMs = daysToExpiry = expiryDay.getTime() - today.getTime();
    daysToExpiry = convertMsToDays(diffInMs);
    return daysToExpiry;
  };

  latestWeekday.setHours(15, 30, 0);
  const diffInMs = expiryDay.getTime() - latestWeekday.getTime()
  daysToExpiry = convertMsToDays(diffInMs);
  return daysToExpiry;
};

export const getSyntheticFuturesPrice = (allStrikes, underlyingValue, data) => {

  if (allStrikes.length === 0 || underlyingValue === 0) return null;

  const spotATMStrike = getNearestStrikePrice(allStrikes, underlyingValue);
  const spotATMStrikeData = data.find((item) => item.strikePrice === spotATMStrike);

  if (!spotATMStrikeData) return null;

  if (!spotATMStrikeData.CE || !spotATMStrikeData.PE) {
    const filteredStrikes = allStrikes.filter((strike) => strike !== spotATMStrike)
    const syntheticFuturesPrice = getSyntheticFuturesPrice(filteredStrikes, underlyingValue, data);
    if (syntheticFuturesPrice === null) {
      return underlyingValue;
    };
    return syntheticFuturesPrice;
  };

  const syntheticFuturesPrice = (spotATMStrikeData.strikePrice + 
    (spotATMStrikeData.CE.lastPrice)) - (spotATMStrikeData.PE.lastPrice);
    
  return syntheticFuturesPrice;
};

export const getIVAndGreeks = ({ futuresPrice, timeToExpiry, riskFreeRate = 0, costOfCarry = 0 }, item) => {
  const { strikePrice } = item;
  let iv = null;
  let ce = strikePrice < futuresPrice ? 
  [null, 1, null, null, null] : [null, null, null, null, null];
  let pe = strikePrice > futuresPrice ? 
  [null, 1, null, null, null] : [null, null, null, null, null];

  if (timeToExpiry >= gbsLimits.minT) {
    const type = strikePrice > futuresPrice ? "c" : "p";
    const cp = futuresPrice ? strikePrice > futuresPrice ? item.CE ? item.CE.lastPrice : 0 :
    item.PE ? item.PE.lastPrice : 0 : 0;
    iv = cp !== null ? euroImpliedVol76(type, futuresPrice, strikePrice, timeToExpiry, riskFreeRate, cp) : null;
    ce = iv ? gbs("c", futuresPrice, strikePrice, timeToExpiry, riskFreeRate, costOfCarry, iv) : null;
    pe = iv ? gbs("p", futuresPrice, strikePrice, timeToExpiry, riskFreeRate, costOfCarry, iv) : null;
  };

  const daysInYear = new Date().getFullYear() % 4 === 0 ? 366 : 365;

  const ceGreeks = ce ? {
    delta: ce[1],
    gamma: ce[2],
    theta: ce[3] / daysInYear,
  } : null;

  const peGreeks = pe ? {
    delta: pe[1],
    gamma: pe[2],
    theta: pe[3] / daysInYear,
  }: null;

  return [iv, { ceGreeks, peGreeks }]
};

export const formatData = (data, underlying) => {
  const records = data.records;
  const dataPerExpiry = records.data.reduce((group, item) => {
    const { expiryDate } = item;
    group[expiryDate] = group[expiryDate] || [];
    group[expiryDate].push(item);
    return group;
  }, {});


  let groupedData = {};
  const { underlyingValue } = data.records;
  const expiries = Object.keys(dataPerExpiry);

  expiries.map((expiry) => {
    const allStrikes = dataPerExpiry[expiry].map((item) => item.strikePrice);
    const futuresPrice = getSyntheticFuturesPrice(allStrikes, underlyingValue, dataPerExpiry[expiry]);
    const timeToExpiry = convertDaysToYears(getDaysToExpiry(expiry));
    const futureATMStrike = getNearestStrikePrice(allStrikes, futuresPrice);

    let summary = {
      atmStrike: null,
      atmIV: null,
      syntheticFuturesPrice: futuresPrice,
    };

    const dataItem = dataPerExpiry[expiry].map((item) => {

      const [iv, { ceGreeks, peGreeks }] = getIVAndGreeks({
        futuresPrice,
        timeToExpiry,
      }, item);

      if (item.strikePrice === futureATMStrike) {
        summary.atmStrike = item.strikePrice;
        summary.atmIV = iv;
      };
      
      return {
        ...item,
        CE: item.CE ? { ...item.CE, greeks: ceGreeks } : null,
        PE: item.PE ? { ...item.PE, greeks: peGreeks } : null,
        syntheticFuturesPrice: futuresPrice,
        iv: iv
      };
    })

    groupedData[expiry] = {
      ...summary,
      data: dataItem
    };
  });


  const indices = ["NIFTY", "BANKNIFTY", "FINNIFTY", "MIDCPNIFTY"];
  const isIndex = indices.some((index) => underlying.startsWith(index));

  const filteredExpiries = getFilteredExpiries({
    expiryDates: records.expiryDates,
    isIndex
  });

  let mergedStrikePrices = [];
  for (const expiry of filteredExpiries) {
    const strikePrices = dataPerExpiry[expiry].map((item) => item.strikePrice);
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

export const getTargetDateFuturesPrices = (
  underlyingPrice, targetUnderlyingPrice, 
  optionLegs, futuresPerExpiry, targetDateTimeISOString
) => {

  const projectedFuturesPrices = new Map();
  if (!optionLegs || optionLegs.length === 0) {
    return projectedFuturesPrices;
  };

  const targetDateTime = getIST(new Date(targetDateTimeISOString));
  const sortedOptionLegs = optionLegs.sort((a, b) => {
    return getDaysToExpiry(a.expiry) - getDaysToExpiry(b.expiry);
  });

  for (const optionLeg of sortedOptionLegs) {
    const { expiry } = optionLeg;
    const futuresPrice = futuresPerExpiry[expiry];

    if (projectedFuturesPrices.get(expiry)) {
      continue;
    };

    const targetDay = targetDateTime.getDay();
    if (targetDay === 6 || targetDay === 0) {
      projectedFuturesPrices.set(expiry, futuresPrice);
      continue;
    };

    const distToExpiry = getDaysToExpiry(expiry);
    const targetDateDistToExpiry = getDaysToExpiry(expiry, targetDateTime);
    const priceDiff = futuresPrice - underlyingPrice;
    const projectedFuturesPrice = targetUnderlyingPrice + 
    (priceDiff * (targetDateDistToExpiry / distToExpiry));
    projectedFuturesPrices.set(expiry, projectedFuturesPrice);
  };

  return projectedFuturesPrices;
};

export const getOptionPrice = ({ type, futuresPrice, strike, timeToExpiry, 
  iv, riskFreeRate = 0, costOfCarry = 0 }) => {

  if (futuresPrice <= gbsLimits.minFs || timeToExpiry <= gbsLimits.minT || iv === gbsLimits.minV || !iv) {
    return type === "c" ? Math.max(futuresPrice - strike, 0) 
    : Math.max(strike - futuresPrice, 0);
  };

  const priceAndGreeks = gbs(type, futuresPrice, strike, timeToExpiry, riskFreeRate, costOfCarry, iv);
  const price = priceAndGreeks[0];
  return price;
};
;
const roundToSignificant = (value) => {
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
  const increment = magnitude / 10;
  return Math.round(value / increment) * increment;
};

export const getExpiryDateTime = (expiryDate) => {
  const expiryDateTime = new Date(expiryDate);
  expiryDateTime.setHours(15, 30, 0, 0);
  return expiryDateTime;
};

const generatePayoffRange = ({ optionLegs, lotSize, projectedFuturesPrices, 
  targetDateTime, targetUnderlyingPrice, currentUnderlyingPrice, isIndex 
}) => {

  targetDateTime = new Date(targetDateTime);
  const sortedOptionLegs = optionLegs.sort((a, b) => {
    return getDaysToExpiry(a.expiry) - getDaysToExpiry(b.expiry);
  });

  const minStrike = sortedOptionLegs.reduce((prev, curr) => {
    return curr.strike < prev ? curr.strike : prev;
  }, Infinity);

  const maxStrike = sortedOptionLegs.reduce((prev, curr) => {
    return curr.strike > prev ? curr.strike : prev;
  }, 0);

  const minExpiry = sortedOptionLegs[0]?.expiry;
  const roundedPrice = roundToSignificant(currentUnderlyingPrice);
  const [outerLower, outerUpper] = [roundedPrice * 0.8, roundedPrice * 1.2];
  const [innerLower, innerUpper] = [roundedPrice * 0.9, roundedPrice * 1.1];
  const innerStep = roundedPrice * 0.001;
  const middleStep = innerStep * 10;
  const outerStep = innerStep * 10;  

  let payoffsAtTarget = new Map();
  let payoffsAtExpiry = new Map();

  for (let i = 0; i < sortedOptionLegs.length; i++) {
    const optionLeg = sortedOptionLegs[i];
    const { expiry, strike, lots, iv, price, action } = optionLeg;
    
    const projectedFuturePrice = projectedFuturesPrices.get(expiry);
    const timeToExpiry = convertDaysToYears(getDaysToExpiry(expiry, targetDateTime));

    const minExpiryDateTime = getExpiryDateTime(minExpiry);
    const timeToExpiryFromMin = convertDaysToYears(getDaysToExpiry(expiry, minExpiryDateTime));

    const type = optionLeg.type === "CE" ? "c" : "p";
    const priceDiff = projectedFuturePrice - targetUnderlyingPrice;
    let underlyingPrice = 0;
    let maxUnderlyingPrice = roundedPrice * 2;

    while (underlyingPrice <= maxUnderlyingPrice) {
      let step;
      if (underlyingPrice >= innerLower && underlyingPrice <= innerUpper) {
        step = innerStep;
      } else if (underlyingPrice >= outerLower && underlyingPrice <= outerUpper) {
        step = middleStep;
      } else {
        step = outerStep;
      };
      
      const targetF = Math.max(underlyingPrice + priceDiff, 0.01);
      const expiryF = timeToExpiry <= gbsLimits.minT ? underlyingPrice : 
      Math.max(underlyingPrice + (priceDiff * (timeToExpiryFromMin / timeToExpiry)), 0);
      const payoffAtTarget = calcPayoff(type, targetF, strike, timeToExpiry, iv, price, lots, lotSize, action);
      const payoffAtExpiry = calcPayoff(type, expiryF, strike, timeToExpiryFromMin, iv, price, lots, lotSize, action);
      const existingPayoffAtTarget = payoffsAtTarget.get(underlyingPrice) || 0;
      const existingPayoffAtExpiry = payoffsAtExpiry.get(underlyingPrice) || 0;
      const cumulativePayoffAtTarget = existingPayoffAtTarget + payoffAtTarget;
      const cumulativePayoffAtExpiry = existingPayoffAtExpiry + payoffAtExpiry;
      payoffsAtTarget.set(underlyingPrice, cumulativePayoffAtTarget);
      payoffsAtExpiry.set(underlyingPrice, cumulativePayoffAtExpiry);

      underlyingPrice += step;
    };
  };

  const [minBound, maxBound] = isIndex ? [0.975, 1.025] : [0.8, 1.2];

  let xMin = minStrike * minBound;
  let xMax = maxStrike * maxBound;

  xMin = Math.min(xMin, targetUnderlyingPrice * minBound, innerLower);
  xMax = Math.max(xMax, targetUnderlyingPrice * maxBound, innerUpper);
 
  payoffsAtTarget = Array.from(payoffsAtTarget, ([s, payoff]) => ({ payoff, at: s }));
  payoffsAtExpiry = Array.from(payoffsAtExpiry, ([s, payoff]) => ({ payoff, at: s }));

  return [payoffsAtTarget, payoffsAtExpiry, { xMin, xMax }];
};

const calcPayoff = (type, futuresPrice, strike, timeToExpiry, iv, price, lots, lotSize, action) => {
  const sign = action === "B" ? 1 : -1;
  const premium = (price * lots * lotSize) * sign;
  const newPrice = Math.max(0, getOptionPrice({ type, futuresPrice, strike, timeToExpiry, iv }));
  const newPremium = (newPrice * lots * lotSize) * sign;
  return newPremium - premium;
};

export const getPayoffData = (builderData) => {

  const { optionLegs, underlyingPrice, targetUnderlyingPrice, 
    futuresPerExpiry, targetDateTimeISOString, lotSize, isIndex 
  } = builderData;

  // Projected futures prices per expiry at target datetime
  const projectedFuturesPrices = getTargetDateFuturesPrices(
    underlyingPrice, targetUnderlyingPrice, 
    optionLegs, futuresPerExpiry, 
    targetDateTimeISOString
  );

  const targetDateTime = getIST(new Date(targetDateTimeISOString));
  const sortedOptionLegs = optionLegs.sort((a, b) => {
    return getDaysToExpiry(a.expiry) - getDaysToExpiry(b.expiry);
  });

  let payoffAtTarget = 0;
  let payoffAtExpiry = 0;
  
  for (const optionLeg of sortedOptionLegs) {
    const { expiry, strike, lots, iv, price: cp, action } = optionLeg;

    const type = optionLeg.type === "CE" ? "c" : "p";
    const targetF = projectedFuturesPrices.get(expiry);
    const timeToExpiry = convertDaysToYears(getDaysToExpiry(expiry, targetDateTime));
    payoffAtTarget += calcPayoff(type, targetF, strike, timeToExpiry, iv, cp, lots, lotSize, action);
  };

  const payoffs = generatePayoffRange({
    optionLegs,
    lotSize,
    projectedFuturesPrices,
    targetDateTime,
    targetUnderlyingPrice,
    currentUnderlyingPrice: 
    underlyingPrice,
    isIndex
  });

  return {
    payoffsAtTarget: payoffs[0],
    payoffsAtExpiry: payoffs[1],
    xMin: payoffs[2].xMin,
    xMax: payoffs[2].xMax,
    underlyingPrice,
    targetUnderlyingPrice,
    payoffAtTarget,
    payoffAtExpiry,
    projectedFuturesPrices: Array.from(
      projectedFuturesPrices, 
      ([expiry, price]) => ({ expiry, price })
    )
  };
};