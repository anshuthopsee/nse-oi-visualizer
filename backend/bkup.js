import { euroImpliedVol76, _gbs } from "./black76.js";

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

export const getIST = () => {
  const currentTime = new Date();
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
    return getSyntheticFuturesPrice(filteredStrikes, underlyingValue, data);
  };

  const syntheticFuturesPrice = (spotATMStrikeData.strikePrice + 
    (spotATMStrikeData.CE.lastPrice)) - (spotATMStrikeData.PE.lastPrice);
    
  return syntheticFuturesPrice;
};

export const getIVAndGreeks = ({ fs, t, r, b }, item) => {
  const x = item.strikePrice;
  let iv = null;
  // FIX THIS LATER
  let ce = x < fs ? [null, 1, null, null, null] : [null, null, null, null, null];
  let pe = x > fs ? [null, 1, null, null, null] : [null, null, null, null, null];

  if (t > 0) {
    const type = x > fs ? "c" : "p";
    const cp = fs ? x > fs ? item.CE ? item.CE.lastPrice : null :
    item.PE ? item.PE.lastPrice : null : null;
    iv = cp ? euroImpliedVol76(type, fs, x, t, r, cp) : null;
    ce = iv ? _gbs("c", fs, x, t, r, b, iv) : null;
    pe = iv ? _gbs("p", fs, x, t, r, b, iv) : null;
  };

  const daysInYear = new Date().getFullYear() % 4 === 0 ? 366 : 365;

  const ceGreeks = ce ? {
    delta: ce[1],
    gamma: ce[2],
    theta: ce[3] / daysInYear,
    vega: ce[4] / 100,
    rho: ce[5]
  } : null;

  const peGreeks = pe ? {
    delta: pe[1],
    gamma: pe[2],
    theta: pe[3],
    vega: pe[4],
    rho: pe[5]
  }: null;

  return [iv, { ceGreeks, peGreeks }]
};

export const formatData = (data, underlying) => {
  const records = data.records;

  const groupedData = records.data.reduce((group, item) => {
    const { expiryDate } = item;
    group[expiryDate] = group[expiryDate] || [];
    group[expiryDate].push(item);
    return group;
  }, {});


  let groupedDataWithSFP = {};

  const { underlyingValue } = data.records;

  Object.keys(groupedData).map((key) => {
    
    const allStrikes = groupedData[key].map((item) => item.strikePrice);

    const syntheticFuturesPrice = getSyntheticFuturesPrice(allStrikes, underlyingValue, groupedData[key]);

    console.log(syntheticFuturesPrice)

    const daysToExpiry = getDaysToExpiry(key);
    const yearsToExpiry = convertDaysToYears(daysToExpiry);

    const futureATMStrike = getNearestStrikePrice(allStrikes, syntheticFuturesPrice);

    let metaData = {
      atmStrike: null,
      atmIV: null,
      syntheticFuturesPrice
    };

    const dataItemWithSFP = groupedData[key].map((item) => {

      const [iv, { ceGreeks, peGreeks }] = getIVAndGreeks({
        fs: syntheticFuturesPrice,
        t: yearsToExpiry,
        r: 0,
        b: 0
      }, item);

      if (item.strikePrice === futureATMStrike) {
        metaData.atmStrike = item.strikePrice;
        metaData.atmIV = iv;
      };
      
      return {
        ...item,
        CE: item.CE ? { ...item.CE, greeks: ceGreeks } : null,
        PE: item.PE ? { ...item.PE, greeks: peGreeks } : null,
        syntheticFuturesPrice,
        iv: iv
      };
    })

    groupedDataWithSFP[key] = {
      ...metaData,
      data: dataItemWithSFP
    };
  });


  const indices = ["NIFTY", "BANKNIFTY", "FINNIFTY", "MIDCPNIFTY"];

  const isIndex = indices.some((index) => underlying.startsWith(index));

  const filteredExpiries = getFilteredExpiries({
    expiryDates: records.expiryDates,
    isIndex
  });

  let mergedStrikePrices = [];

  for (const expiryDate of filteredExpiries) {
    const strikePrices = groupedData[expiryDate].map((item) => item.strikePrice);
    mergedStrikePrices = mergeTwoArrays(mergedStrikePrices, strikePrices);
  };

  return {
    underlying,
    grouped: groupedDataWithSFP,
    filteredExpiries,
    allExpiries: records.expiryDates,
    strikePrices: mergedStrikePrices,
    underlyingValue: records.underlyingValue,
  };
};

export const getTargetDateFuturesPrices = (
  underlyingPrice, targetUnderlyingPrice, optionLegs, futuresPerExpiry, targetDateTimeISOString
) => {
  if (!optionLegs || optionLegs.length === 0) {
    return null;
  };

  const targetDateTime = new Date(targetDateTimeISOString);

  const sortedOptionLegs = optionLegs.sort((a, b) => {
    return getDaysToExpiry(a.expiry) - getDaysToExpiry(b.expiry);
  });

  const projectedFuturesPricesPerExpiry = new Map();

  for (const optionLeg of sortedOptionLegs) {
    const { expiry } = optionLeg;
    const futuresPrice = futuresPerExpiry[expiry];

    const diff = futuresPrice - underlyingPrice;

    const targetDay = targetDateTime.getDay();

    // What happens if its weekday and time is after 3:30 PM? or before 9:15 AM?
    // NEED TO HANDLE LOT SIZES WHEN CALC PNLS

    // COMEBACK TO ABOVE LATER

    const expiryAlreadyAdded = projectedFuturesPricesPerExpiry.get(expiry);

    if (expiryAlreadyAdded) {
      continue;
    };

    // target day === today what does that do? why was it added?
    if (
      targetDay === 6 || 
      targetDay === 0) {
      projectedFuturesPricesPerExpiry.set(expiry, futuresPrice);
      continue;
    };

    const distToExpiry = getDaysToExpiry(expiry);
    const targetDateDistToExpiry = getDaysToExpiry(expiry, targetDateTime);

    console.log(distToExpiry, targetDateDistToExpiry)

    const projectedFuturesPrice = targetUnderlyingPrice + (diff * (targetDateDistToExpiry / distToExpiry));

    projectedFuturesPricesPerExpiry.set(expiry, projectedFuturesPrice);
  };

  return projectedFuturesPricesPerExpiry;
};

export const getOptionPrice = ({ type, fs, x, t, r = 0, b = 0, iv }) => {

  if (t === 0) {
    return type === "c" ? Math.max(fs - x, 0) : Math.max(x - fs, 0);
  };

  const priceAndGreeks = _gbs(type, fs, x, t, r, b, iv);
  const price = priceAndGreeks[0];
  return price;
};

const roundToSignificant = (value) => {
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)));

  const increment = magnitude / 10;
  
  return Math.round(value / increment) * increment
};

const generatePayoffs = ({ optionLegs, lotSize, projectedFuturesPricesPerExpiry, targetDateTime, targetUnderlyingPrice, underlyingPrice }) => {

  let payoffsAtTarget = new Map();
  let payoffsAtExpiry = new Map();

  targetDateTime = new Date(targetDateTime);

  const activeOptionLegs = optionLegs.filter((optionLeg) => optionLeg.active);
  const minStrike = activeOptionLegs.reduce((prev, curr) => {
    return curr.strike < prev ? curr.strike : prev;
  }, Infinity);

  const maxStrike = activeOptionLegs.reduce((prev, curr) => {
    return curr.strike > prev ? curr.strike : prev;
  }, 0);

  const sortedOptionLegs = activeOptionLegs.sort((a, b) => {
    return getDaysToExpiry(a.expiry) - getDaysToExpiry(b.expiry);
  });

  const minExpiry = sortedOptionLegs[0]?.expiry;

  let maxPayoff = 0;
  let maxPayoffExpiryPrice = 0;
  let maxLoss = 0;
  let maxLossExpiryPrice = 0;

  let s = underlyingPrice;

  const roundedPrice = roundToSignificant(s);
  const fivePercentDown = roundedPrice * 0.95;
  const fivePercentUp = roundedPrice * 1.05;
  const fiftyPercentDown = roundedPrice * 0.5;
  const fiftyPercentUp = roundedPrice * 1.5;

  const fivePercentStep = (Math.round(roundedPrice * 0.001) / 10) * 5;
  const fiftyToFivePercentStep = (Math.round(fivePercentStep) * 10);
  const fiftyPercentAboveStep = (Math.round(fivePercentStep) * 100);

  const start = 0;
  const end = roundedPrice * 2;

  for (let i = 0; i < sortedOptionLegs.length; i++) {
    const optionLeg = sortedOptionLegs[i];
    let { expiry, strike, type, lots, iv, price, action, active } = optionLeg;

    if (!active) continue;
    
    const projectedFuturesPrice = projectedFuturesPricesPerExpiry.get(expiry);
    const daysToExpiry = getDaysToExpiry(expiry, targetDateTime);
    const yearsToExpiry = convertDaysToYears(daysToExpiry);
    const minExpiryDatetime = new Date(minExpiry);
    minExpiryDatetime.setHours(15, 30, 0);
    const daysToExpiryFromMin = getDaysToExpiry(expiry, minExpiryDatetime);
    const yearsToMinExpiry = convertDaysToYears(daysToExpiryFromMin);
    const expiryT = yearsToMinExpiry;

    type = type === "CE" ? "c" : "p";
    
    let fsDiff = projectedFuturesPrice - targetUnderlyingPrice;
  

    let x = strike;
    let t = yearsToExpiry;

    // NEED TO SET LIMIT ON OPTION LEGS, 10 IS MAX
    // NEED TO MAKE OPTION LEGS UPDATE / ADD / DELETE MORE EFFICIENT
    // MAY NEED TO USE MAP INSTEAD OF ARRAY FOR OPTION LEGS

    // NEED TO CLEAN THIS UP

  // NEED TO ADD TOAST NOTIFICATIONS FOR EXAMPLE WHEN STRIKE IS NOT AVAILABLE WHEN EXPIRY CHANGED
  // OR WHEN A STRIKE DATA IS NOT AVAILABLE IN THE NEXT AUTO UPDATED DATA

    s = start

    while (s <= end) {
      let step;
      if (s >= fivePercentDown && s <= fivePercentUp) {
        step = fivePercentStep;
      } else if (s >= fiftyPercentDown && s <= fiftyPercentUp) {
        step = fiftyToFivePercentStep;
      } else {
        step = fiftyPercentAboveStep;
      };
      
      const targetS = Math.max(s + fsDiff, 0);
      const expiryS = expiryT === 0 ? s : Math.max(s + (fsDiff * (expiryT / t)), 0);
      
      const payoffAtTarget = calcPayoff(type, targetS, x, t, iv, price, lots, lotSize, action);
      const payoffAtExpiry = calcPayoff(type, expiryS, x, expiryT, iv, price, lots, lotSize, action);
      const existingPayoffAtTarget = payoffsAtTarget.get(s) || 0;
      const existingPayoffAtExpiry = payoffsAtExpiry.get(s) || 0;
      const cumulativePayoffAtTarget = existingPayoffAtTarget + payoffAtTarget;
      const cumulativePayoffAtExpiry = existingPayoffAtExpiry + payoffAtExpiry;
      payoffsAtTarget.set(s, cumulativePayoffAtTarget);
      payoffsAtExpiry.set(s, cumulativePayoffAtExpiry);

      if (cumulativePayoffAtExpiry > maxPayoff && i === sortedOptionLegs.length - 1) {
        maxPayoff = cumulativePayoffAtExpiry;
        maxPayoffExpiryPrice = s;
      };

      if (cumulativePayoffAtExpiry < maxLoss && i === sortedOptionLegs.length - 1) {
        maxLoss = cumulativePayoffAtExpiry;
        maxLossExpiryPrice = s;
      };

      s += step

    };
  };

  let xMin = minStrike * 0.975;
  let xMax = maxStrike * 1.025;

  xMin = Math.min(xMin, targetUnderlyingPrice * 0.975, fivePercentDown);
  xMax = Math.max(xMax, targetUnderlyingPrice * 1.025, fivePercentUp);
 
  payoffsAtTarget = Array.from(payoffsAtTarget, ([s, payoff]) => ({ payoff, at: s }));
  payoffsAtExpiry = Array.from(payoffsAtExpiry, ([s, payoff]) => ({ payoff, at: s }));

  return [payoffsAtTarget, payoffsAtExpiry, { xMin, xMax }];
};

const calcPayoff = (type, fs, x, t, iv, price, lots, lotSize, action, log = false) => {
  const sign = action === "B" ? 1 : -1;
  const premium = (price * lots * lotSize) * sign;
  const newPrice = Math.max(0, getOptionPrice({ type, fs, x, t, iv }));
  const newPremium = (newPrice * lots * lotSize) * sign;
  return newPremium - premium;
};

export const getPayoff = (builderData) => {

  const { optionLegs, underlyingPrice, targetUnderlyingPrice, futuresPerExpiry, targetDateTimeISOString, lotSize } = builderData;

  const projectedFuturesPricesPerExpiry = getTargetDateFuturesPrices(
    underlyingPrice, targetUnderlyingPrice, optionLegs, futuresPerExpiry, targetDateTimeISOString
  );

  const targetDateTime = new Date(targetDateTimeISOString);

  let payoffAtTarget = 0;
  let payoffAtExpiry = 0;

  const filteredOptionLegs = optionLegs.filter((optionLeg) => optionLeg.active);

  const sortedOptionLegs = filteredOptionLegs.sort((a, b) => {
    return getDaysToExpiry(a.expiry) - getDaysToExpiry(b.expiry);
  });

  for (const optionLeg of sortedOptionLegs) {
    const { expiry, strike, lots, iv, price, action } = optionLeg;

    const type = optionLeg.type === "CE" ? "c" : "p";
    const projectedFuturesPrice = projectedFuturesPricesPerExpiry.get(expiry);
    const daysToExpiry = getDaysToExpiry(expiry, targetDateTime);
    const yearsToExpiry = convertDaysToYears(daysToExpiry);
    // Check projectedFuturesPrice calc again, it seems correct and its for target date
    let fsDiff = projectedFuturesPrice - targetUnderlyingPrice;
    const s = targetUnderlyingPrice;
    const targetS = Math.max(s + fsDiff, 0);

    payoffAtTarget += calcPayoff(type, targetS, strike, yearsToExpiry, iv, price, lots, lotSize, action, true);
  };

  const payoffs = generatePayoffs({
    optionLegs,
    lotSize,
    projectedFuturesPricesPerExpiry,
    targetDateTime,
    targetUnderlyingPrice,
    underlyingPrice
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
      projectedFuturesPricesPerExpiry, 
      ([expiry, price]) => ({ expiry, price })
    )
  };
};

const roundedPrice = roundToSignificant(currentUnderlyingPrice);
  const [outerLower, outerUpper] = [roundedPrice * 0.8, roundedPrice * 1.2];
  const [innerLower, innerUpper] = [roundedPrice * 0.95, roundedPrice * 1.05];
  const innerStep = (Math.round(roundedPrice * 0.001) / 10) * 10;
  const middleStep = (((Math.round(innerStep) / 10) / 10) * 10) * 10;
  const outerStep = (Math.round(innerStep) * 100);