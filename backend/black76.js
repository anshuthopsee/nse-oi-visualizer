import gaussian from "gaussian";

const norm = gaussian(0, 1);

export const gbsLimits = {
  // An GBS model will return an error if an out-of-bound input is input
  max32: 2147483248.0,

  minT: 0.000001902, // 1.0 / 1000.0, // requires some time left before expiration
  minX: 0.01,
  minFs: 0.01,

  // Volatility smaller than 0.5% causes American Options calculations
  // to fail (Number too large errors).
  // GBS() should be OK with any positive number. Since vols less
  // than 0.5% are expected to be extremely rare, and most likely bad inputs,
  // _gbs() is assigned this limit too
  minV: 0.005,

  maxT: 100,
  maxX: 2147483248.0,
  maxFs: 2147483248.0,

  // Asian Option limits
  // maximum TA is time to expiration for the option
  minTa: 0,

  // This model will work with higher values for b, r, and V. However, such values are extremely uncommon. 
  // To catch some common errors, interest rates and volatility are capped to 100%
  // This reason for 1 (100%) is mostly to cause the library to throw an exception 
  // if a value like 15% is entered as 15 rather than 0.15)
  minB: -1,
  minR: -1,

  maxB: 1,
  maxR: 1,
  maxV: 1,
};

const testOptionType = (optionType) => {
  if ((optionType !== "c") && (optionType !== "p")) {
      throw Error(`Invalid Input optionType (${0}). Acceptable value are: c, p`)
  };
};

function gbsTestInputs(optionType, fs, x, t, r, b, v) {
  // Test inputs are reasonable
  testOptionType(optionType);

  if (x < gbsLimits.minX || x > gbsLimits.maxX) {
      throw new Error(`Invalid Input Strike Price (X). Acceptable range for inputs is ${gbsLimits.minX} to ${gbsLimits.maxX}`);
  }

  if (fs < gbsLimits.minFs || fs > gbsLimits.maxFs) {
      throw new Error(`Invalid Input Forward/Spot Price (FS). Acceptable range for inputs is ${gbsLimits.minFs} to ${gbsLimits.maxFs}`);
  }

  if (t < gbsLimits.minT || t > gbsLimits.maxT) {
      throw new Error(`Invalid Input Time (T = ${t}). Acceptable range for inputs is ${gbsLimits.minT} to ${gbsLimits.maxT}`);
  }

  if (b < gbsLimits.minB || b > gbsLimits.maxB) {
      throw new Error(`Invalid Input Cost of Carry (b = ${b}). Acceptable range for inputs is ${gbsLimits.minB} to ${gbsLimits.maxB}`);
  }

  if (r < gbsLimits.minR || r > gbsLimits.maxR) {
      throw new Error(`Invalid Input Risk-Free Rate (r = ${r}). Acceptable range for inputs is ${gbsLimits.minR} to ${gbsLimits.maxR}`);
  }

  if (v < gbsLimits.minV || v > gbsLimits.maxV) {
      throw new Error(`Invalid Input Implied Volatility (V = ${v}). Acceptable range for inputs is ${gbsLimits.minV} to ${gbsLimits.maxV}`);
  }
}

export function gbs(optionType, fs, x, t, r, b, v) {
    // Test Inputs (throwing an exception on failure)
    gbsTestInputs(optionType, fs, x, t, r, b, v);

    // Create preliminary calculations
    const tSqrt = Math.sqrt(t);
    const d1 = (Math.log(fs / x) + (b + (v * v) / 2) * t) / (v * tSqrt);
    const d2 = d1 - v * tSqrt;

    let value, delta, gamma, theta, vega, rho;
    
    if (optionType === "c") {
        value = fs * Math.exp((b - r) * t) * norm.cdf(d1) - x * Math.exp(-r * t) * norm.cdf(d2);
        delta = Math.exp((b - r) * t) * norm.cdf(d1);
        gamma = Math.exp((b - r) * t) * norm.pdf(d1) / (fs * v * tSqrt);
        theta = -(fs * v * Math.exp((b - r) * t) * norm.pdf(d1)) / (2 * tSqrt) - (b - r) * fs * Math.exp((b - r) * t) * norm.cdf(d1) - r * x * Math.exp(-r * t) * norm.cdf(d2);
        vega = Math.exp((b - r) * t) * fs * tSqrt * norm.pdf(d1);
        rho = x * t * Math.exp(-r * t) * norm.cdf(d2);
    } else {
        value = x * Math.exp(-r * t) * norm.cdf(-d2) - (fs * Math.exp((b - r) * t) * norm.cdf(-d1));
        delta = -Math.exp((b - r) * t) * norm.cdf(-d1);
        gamma = Math.exp((b - r) * t) * norm.pdf(d1) / (fs * v * tSqrt);
        theta = -(fs * v * Math.exp((b - r) * t) * norm.pdf(d1)) / (2 * tSqrt) + (b - r) * fs * Math.exp((b - r) * t) * norm.cdf(-d1) + r * x * Math.exp(-r * t) * norm.cdf(-d2);
        vega = Math.exp((b - r) * t) * fs * tSqrt * norm.pdf(d1);
        rho = -x * t * Math.exp(-r * t) * norm.cdf(-d2);
    }
    
    return [value, delta, gamma, theta, vega, rho];
};

const approxImpliedVol = (optionType, fs, x, t, r, b, cp) => {
    testOptionType(optionType)

    const ebrt = Math.exp((b - r) * t);
    const ert = Math.exp(-r * t);

    const a = Math.sqrt(2 * Math.PI) / (fs * ebrt + x * ert);

    let payoff

    if (optionType == "c") {
        payoff = fs * ebrt - x * ert
    } else {
        payoff = x * ert - fs * ebrt
    }

    b = cp - payoff / 2
    let c = (payoff ** 2) / Math.PI

    let v = (a * (b + Math.sqrt(b ** 2 + c))) / Math.sqrt(t)

    return v
}

function newtonImpliedVol(valFn, optionType, x, fs, t, b, r, cp, precision = 0.00001, maxSteps = 100) {
  // Make sure a valid option type was entered
  testOptionType(optionType);

  // Estimate starting Vol, making sure it is within allowable range
  let v = approxImpliedVol(optionType, fs, x, t, r, b, cp);
  v = Math.max(gbsLimits.minV, v);
  v = Math.min(gbsLimits.maxV, v);

  // Calculate the value at the estimated vol
  let [value, delta, gamma, theta, vega, rho] = valFn(optionType, fs, x, t, r, b, v);
  let minDiff = Math.abs(cp - value);

  // Newton-Raphson Search
  let counter = 0;
  while (precision <= Math.abs(cp - value) && Math.abs(cp - value) <= minDiff && counter < maxSteps) {
    v = v - (value - cp) / vega;

    // Check if the volatility is within bounds
    if (v > gbsLimits.maxV || v < gbsLimits.minV) {
      // Volatility out of bounds
      break;
    }

    [value, delta, gamma, theta, vega, rho] = valFn(optionType, fs, x, t, r, b, v);
    minDiff = Math.min(Math.abs(cp - value), minDiff);

    // Keep track of how many iterations
    counter += 1;
  }

  // Check if function converged and return a value
  if (Math.abs(cp - value) < precision) {
    // The search function converged
    return v;
  } else {
    // If the search function didn't converge, try a bisection search
    return bisectionImpliedVol(valFn, optionType, fs, x, t, r, b, cp, precision, maxSteps);
  }
}

const bisectionImpliedVol = (valFn, optionType, fs, x, t, r, b, cp, precision = 0.00001, maxSteps = 100) => {
  // Estimate Upper and Lower bounds on volatility
  // Assume American Implied vol is within +/- 50% of the GBS Implied Vol
  let vMid = approxImpliedVol(optionType, fs, x, t, r, b, cp);

  let vLow, vHigh;
  if (vMid <= gbsLimits.minV || vMid >= gbsLimits.maxV) {
      // If the volatility estimate is out of bounds, search entire allowed vol space
      vLow = gbsLimits.minV;
      vHigh = gbsLimits.maxV;
      vMid = (vLow + vHigh) / 2;
  } else {
      // Reduce the size of the vol space
      vLow = Math.max(gbsLimits.minV, vMid * 0.5);
      vHigh = Math.min(gbsLimits.maxV, vMid * 1.5);
  }

  // Estimate the high/low bounds on price
  let cpMid = valFn(optionType, fs, x, t, r, b, vMid)[0];

  // Initialize bisection loop
  let currentStep = 0;
  let diff = Math.abs(cp - cpMid);

  // Keep bisection volatility until correct price is found
  while (diff > precision && currentStep < maxSteps) {
      currentStep += 1;

      // Cut the search area in half
      if (cpMid < cp) {
      vLow = vMid;
      } else {
      vHigh = vMid;
      }

      let cpLow = valFn(optionType, fs, x, t, r, b, vLow)[0];
      let cpHigh = valFn(optionType, fs, x, t, r, b, vHigh)[0];

      vMid = vLow + (cp - cpLow) * (vHigh - vLow) / (cpHigh - cpLow);
      vMid = Math.max(gbsLimits.minV, vMid);  // Enforce high/low bounds
      vMid = Math.min(gbsLimits.maxV, vMid);  // Enforce high/low bounds

      cpMid = valFn(optionType, fs, x, t, r, b, vMid)[0];
      diff = Math.abs(cp - cpMid);
  }

  // Return output
  if (Math.abs(cp - cpMid) < precision) {
      return vMid;
  } else {
      // throw new Error(`Implied Vol did not converge. Best Guess=${vMid}, Price diff=${diff}, Required Precision=${precision}`);
      return vMid;
  }
}

const gbsImpliedVol = (optionType, fs, x, t, r, b, cp, precision=.00001, maxSteps=100) => {
  return newtonImpliedVol(gbs, optionType, x, fs, t, b, r, cp, precision, maxSteps)
};

export const euroImpliedVol76 = (optionType, fs, x, t, r, cp) =>  {
  const b = 0
  return gbsImpliedVol(optionType, fs, x, t, r, b, cp)
};
    