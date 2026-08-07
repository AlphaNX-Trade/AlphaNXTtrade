export type OptionType = 'CE' | 'PE';
export type Moneyness = 'ITM' | 'ATM' | 'OTM';

export interface OptionContract {
  symbol: string;
  underlyingSymbol: string;
  strikePrice: number;
  optionType: OptionType;
  expiryDate: string;
  spotPrice: number;
  premium: number;
  prevPremium: number;
  change: number;
  changePercent: number;
  iv: number;
  delta: number;
  theta: number;
  oi: number;
  oiChange: number;
  volume: number;
  bidPrice: number;
  askPrice: number;
  moneyness: Moneyness;
  lotSize: number;
}

export interface StrikeRow {
  strikePrice: number;
  isAtm: boolean;
  call: OptionContract;
  put: OptionContract;
}

export interface OptionIndexConfig {
  symbol: string;
  name: string;
  lotSize: number;
  strikeGap: number;
  expiries: string[];
}

export const OPTION_INDEX_CONFIGS: Record<string, OptionIndexConfig> = {
  NIFTY50: {
    symbol: 'NIFTY50',
    name: 'NIFTY 50',
    lotSize: 25,
    strikeGap: 50,
    expiries: ['28 AUG 2026', '04 SEP 2026', '11 SEP 2026', '25 SEP 2026'],
  },
  BANKNIFTY: {
    symbol: 'BANKNIFTY',
    name: 'BANK NIFTY',
    lotSize: 15,
    strikeGap: 100,
    expiries: ['28 AUG 2026', '04 SEP 2026', '11 SEP 2026', '25 SEP 2026'],
  },
  FINNIFTY: {
    symbol: 'FINNIFTY',
    name: 'FIN NIFTY',
    lotSize: 25,
    strikeGap: 50,
    expiries: ['28 AUG 2026', '04 SEP 2026', '11 SEP 2026', '25 SEP 2026'],
  },
};

/** Approximate Black-Scholes / Intrinsic + Time-Value premium calculator */
export function calculateOptionPremium(
  spotPrice: number,
  strikePrice: number,
  optionType: OptionType,
  daysToExpiry: number = 7,
  volatility: number = 0.16,
): { premium: number; iv: number; delta: number; theta: number } {
  const t = Math.max(0.1, daysToExpiry) / 365;
  const r = 0.065; // 6.5% risk free rate
  const v = volatility;

  // Intrinsic value
  const intrinsic =
    optionType === 'CE' ? Math.max(0, spotPrice - strikePrice) : Math.max(0, strikePrice - spotPrice);

  // Time value simulation (decaying with sqrt(t) and distance from strike)
  const d1 =
    (Math.log(spotPrice / strikePrice) + (r + 0.5 * v * v) * t) / (v * Math.sqrt(t));
  const d2 = d1 - v * Math.sqrt(t);

  // Approximate cumulative normal distribution N(x)
  const normCdf = (x: number) => {
    const t = 1 / (1 + 0.2316419 * Math.abs(x));
    const d = 0.3989423 * Math.exp((-x * x) / 2);
    const prob =
      d *
      t *
      (0.3193815 +
        t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return x >= 0 ? 1 - prob : prob;
  };

  let delta = optionType === 'CE' ? normCdf(d1) : normCdf(d1) - 1;
  const timeValue = Math.max(
    2.5,
    spotPrice * v * Math.sqrt(t) * Math.exp(-0.5 * d1 * d1) * 0.4,
  );

  let rawPremium = intrinsic + timeValue;
  if (rawPremium < 0.5) rawPremium = 0.5;

  const theta = -((spotPrice * v) / (2 * Math.sqrt(t))) * 0.01;

  return {
    premium: Math.round(rawPremium * 20) / 20, // Rounded to 0.05 ticks
    iv: Math.round(volatility * 100 * 10) / 10,
    delta: Math.round(delta * 100) / 100,
    theta: Math.round(theta * 10) / 10,
  };
}

/** Generates realistic option chain strike rows around the spot price */
export function generateOptionChain(
  underlyingSymbol: string,
  spotPrice: number,
  selectedExpiry?: string,
  strikesCount: number = 10,
): { config: OptionIndexConfig; expiry: string; rows: StrikeRow[] } {
  const config =
    OPTION_INDEX_CONFIGS[underlyingSymbol] || OPTION_INDEX_CONFIGS['NIFTY50'];
  const expiry = selectedExpiry || config.expiries[0];
  const gap = config.strikeGap;

  // Find nearest ATM strike
  const atmStrike = Math.round(spotPrice / gap) * gap;

  const strikes: number[] = [];
  for (let i = -strikesCount; i <= strikesCount; i++) {
    strikes.push(atmStrike + i * gap);
  }

  const rows: StrikeRow[] = strikes.map((strikePrice) => {
    const isAtm = strikePrice === atmStrike;

    // Determine Call Moneyness: Spot > Strike = ITM, Spot < Strike = OTM
    let callMoneyness: Moneyness = 'OTM';
    if (isAtm) callMoneyness = 'ATM';
    else if (spotPrice > strikePrice) callMoneyness = 'ITM';

    // Determine Put Moneyness: Spot < Strike = ITM, Spot > Strike = OTM
    let putMoneyness: Moneyness = 'OTM';
    if (isAtm) putMoneyness = 'ATM';
    else if (spotPrice < strikePrice) putMoneyness = 'ITM';

    const callCalc = calculateOptionPremium(spotPrice, strikePrice, 'CE');
    const putCalc = calculateOptionPremium(spotPrice, strikePrice, 'PE');

    // Pseudo-random deterministic metrics based on strike
    const seed = strikePrice % 1000;
    const callOi = Math.round((25000 + ((seed * 37) % 75000)) / config.lotSize) * config.lotSize;
    const putOi = Math.round((28000 + ((seed * 43) % 80000)) / config.lotSize) * config.lotSize;

    const callOiChg = Math.round((((seed % 200) - 90) * 120) / config.lotSize) * config.lotSize;
    const putOiChg = Math.round((((seed % 180) - 80) * 140) / config.lotSize) * config.lotSize;

    const callVol = Math.round(callOi * 0.4);
    const putVol = Math.round(putOi * 0.45);

    const callBid = Math.max(0.05, Math.round((callCalc.premium - 0.25) * 20) / 20);
    const callAsk = Math.round((callCalc.premium + 0.25) * 20) / 20;

    const putBid = Math.max(0.05, Math.round((putCalc.premium - 0.25) * 20) / 20);
    const putAsk = Math.round((putCalc.premium + 0.25) * 20) / 20;

    const callSymbol = `${underlyingSymbol}${expiry.replace(/\s+/g, '')}${strikePrice}CE`;
    const putSymbol = `${underlyingSymbol}${expiry.replace(/\s+/g, '')}${strikePrice}PE`;

    const callContract: OptionContract = {
      symbol: callSymbol,
      underlyingSymbol,
      strikePrice,
      optionType: 'CE',
      expiryDate: expiry,
      spotPrice,
      premium: callCalc.premium,
      prevPremium: Math.max(0.5, callCalc.premium - ((seed % 10) - 4)),
      change: Math.round(((seed % 10) - 4) * 100) / 100,
      changePercent: Math.round(((seed % 10) - 4) * 2.5 * 100) / 100,
      iv: callCalc.iv,
      delta: callCalc.delta,
      theta: callCalc.theta,
      oi: callOi,
      oiChange: callOiChg,
      volume: callVol,
      bidPrice: callBid,
      askPrice: callAsk,
      moneyness: callMoneyness,
      lotSize: config.lotSize,
    };

    const putContract: OptionContract = {
      symbol: putSymbol,
      underlyingSymbol,
      strikePrice,
      optionType: 'PE',
      expiryDate: expiry,
      spotPrice,
      premium: putCalc.premium,
      prevPremium: Math.max(0.5, putCalc.premium - ((seed % 12) - 5)),
      change: Math.round(((seed % 12) - 5) * 100) / 100,
      changePercent: Math.round(((seed % 12) - 5) * 2.2 * 100) / 100,
      iv: putCalc.iv,
      delta: putCalc.delta,
      theta: putCalc.theta,
      oi: putOi,
      oiChange: putOiChg,
      volume: putVol,
      bidPrice: putBid,
      askPrice: putAsk,
      moneyness: putMoneyness,
      lotSize: config.lotSize,
    };

    return {
      strikePrice,
      isAtm,
      call: callContract,
      put: putContract,
    };
  });

  return { config, expiry, rows };
}
