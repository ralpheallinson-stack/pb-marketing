// src/components/watchlist/mockData.ts
// Development fixture for the watchlist reskin.
// Real production data flows through pb_watchlist localStorage +
// watchlist-quotes / watchlist-sparks endpoints. Use this for
// component development before wiring real data, and for filling
// fields (topTrades, conviction, ivRank) that may not have
// endpoints yet — wire those in a Phase 2 commit.

export type TradeRow = {
  time: string;          // 'HH:MM' 24h
  side: 'BUY' | 'SELL';
  cp: 'Call' | 'Put';
  strike: number;
  expiry: string;        // 'M/D'
  size: number;
  prem: number;          // millions
  grade: 'WHALE' | 'LARGE';
  conds: string[];
};

export type Ticker = {
  symbol: string;
  name: string;
  spot: number;
  change: number;        // daily % change
  ivRank: number;        // 0-100
  optVol: number;        // total options volume today
  mcap: string;          // pre-formatted ('$3.6T')
  priceSpark: number[];  // 10 points, 2-day price
  netPrem: number;       // millions, signed (negative = put-heavy)
  cpRatio: number;
  topTrade: number;      // millions
  topGrade: 'WHALE' | 'LARGE';
  flowSpark: number[];   // 10 points, cumulative premium intraday
  conviction: string | null;
  topTrades: TradeRow[];
};

export const mockTickers: Ticker[] = [
  {
    symbol: 'SPY', name: 'SPDR S&P 500 ETF',
    spot: 585.42, change: 0.42,
    ivRank: 32, optVol: 8_200_000, mcap: '$5.4T',
    priceSpark: [580, 581, 581.5, 582, 583, 584, 585, 585.3, 585.5, 585.42],
    netPrem: 24.3, cpRatio: 0.82, topTrade: 4.5, topGrade: 'WHALE',
    flowSpark: [0, 3, 7, 11, 15, 18, 21, 23, 24, 24.3],
    conviction: 'ACCUM 3X',
    topTrades: [
      { time: '15:42', side: 'BUY',  cp: 'Call', strike: 592, expiry: '6/27', size: 8500, prem: 4.5, grade: 'WHALE', conds: ['ACCUM 3X', 'OPENING'] },
      { time: '14:18', side: 'BUY',  cp: 'Call', strike: 590, expiry: '6/27', size: 5200, prem: 2.8, grade: 'LARGE', conds: ['OPENING'] },
      { time: '13:55', side: 'SELL', cp: 'Put',  strike: 575, expiry: '6/27', size: 3800, prem: 1.9, grade: 'LARGE', conds: ['OPENING', 'MULTI-LEG'] },
      { time: '11:08', side: 'BUY',  cp: 'Call', strike: 595, expiry: '7/18', size: 2400, prem: 1.4, grade: 'LARGE', conds: [] },
      { time: '10:22', side: 'BUY',  cp: 'Call', strike: 590, expiry: '6/27', size: 1800, prem: 1.1, grade: 'LARGE', conds: ['OPENING'] },
    ],
  },
  {
    symbol: 'NVDA', name: 'NVIDIA Corp',
    spot: 145.67, change: 2.18,
    ivRank: 58, optVol: 12_400_000, mcap: '$3.6T',
    priceSpark: [142, 142.5, 143, 143.8, 144.5, 145, 145.2, 145.5, 145.6, 145.67],
    netPrem: 87.1, cpRatio: 0.41, topTrade: 12.8, topGrade: 'WHALE',
    flowSpark: [0, 8, 18, 32, 48, 62, 73, 80, 85, 87.1],
    conviction: 'UNUSUAL 84X',
    topTrades: [
      { time: '15:38', side: 'BUY',  cp: 'Call', strike: 150, expiry: '6/27', size: 14200, prem: 12.8, grade: 'WHALE', conds: ['UNUSUAL 84X', 'ACCUM 5X', 'OPENING'] },
      { time: '14:51', side: 'BUY',  cp: 'Call', strike: 155, expiry: '7/18', size: 9800,  prem: 8.4,  grade: 'WHALE', conds: ['UNUSUAL 32X', 'OPENING'] },
      { time: '13:22', side: 'BUY',  cp: 'Call', strike: 148, expiry: '6/27', size: 7100,  prem: 6.2,  grade: 'WHALE', conds: ['ACCUM 5X'] },
      { time: '12:04', side: 'BUY',  cp: 'Call', strike: 150, expiry: '6/27', size: 5400,  prem: 4.8,  grade: 'WHALE', conds: ['UNUSUAL 18X'] },
      { time: '10:47', side: 'SELL', cp: 'Put',  strike: 140, expiry: '6/27', size: 6200,  prem: 3.9,  grade: 'LARGE', conds: ['OPENING'] },
    ],
  },
  {
    symbol: 'TSLA', name: 'Tesla Inc',
    spot: 273.18, change: -1.23,
    ivRank: 71, optVol: 18_700_000, mcap: '$870B',
    priceSpark: [277, 276.5, 276, 275.5, 275, 274.5, 274, 273.8, 273.4, 273.18],
    netPrem: -15.2, cpRatio: 1.84, topTrade: 3.2, topGrade: 'WHALE',
    flowSpark: [0, -2, -4, -6, -9, -11, -13, -14, -14.8, -15.2],
    conviction: 'EARNINGS 2D',
    topTrades: [
      { time: '14:58', side: 'BUY',  cp: 'Put',  strike: 270, expiry: '6/27', size: 4800, prem: 3.2, grade: 'WHALE', conds: ['EARNINGS 2D', 'OPENING'] },
      { time: '13:41', side: 'BUY',  cp: 'Put',  strike: 265, expiry: '6/27', size: 3600, prem: 2.4, grade: 'LARGE', conds: ['EARNINGS 2D'] },
      { time: '12:18', side: 'BUY',  cp: 'Put',  strike: 275, expiry: '6/27', size: 3100, prem: 2.1, grade: 'LARGE', conds: ['OPENING'] },
      { time: '10:55', side: 'SELL', cp: 'Call', strike: 285, expiry: '6/27', size: 2800, prem: 1.7, grade: 'LARGE', conds: ['MULTI-LEG'] },
      { time: '10:12', side: 'BUY',  cp: 'Put',  strike: 270, expiry: '7/18', size: 2200, prem: 1.5, grade: 'LARGE', conds: ['EARNINGS 2D'] },
    ],
  },
  {
    symbol: 'AAPL', name: 'Apple Inc',
    spot: 231.95, change: 0.18,
    ivRank: 24, optVol: 6_100_000, mcap: '$3.5T',
    priceSpark: [231.5, 231.6, 231.7, 231.8, 231.9, 231.85, 231.92, 231.9, 231.93, 231.95],
    netPrem: 8.4, cpRatio: 0.96, topTrade: 1.8, topGrade: 'LARGE',
    flowSpark: [0, 1, 2, 3, 4, 5, 6, 7, 7.8, 8.4],
    conviction: null,
    topTrades: [
      { time: '14:28', side: 'BUY',  cp: 'Call', strike: 235, expiry: '7/18', size: 3200, prem: 1.8, grade: 'LARGE', conds: ['OPENING'] },
      { time: '13:14', side: 'SELL', cp: 'Put',  strike: 225, expiry: '6/27', size: 2800, prem: 1.2, grade: 'LARGE', conds: ['OPENING', 'MULTI-LEG'] },
      { time: '11:42', side: 'BUY',  cp: 'Call', strike: 232, expiry: '6/27', size: 1900, prem: 0.9, grade: 'LARGE', conds: [] },
    ],
  },
  {
    symbol: 'AMD', name: 'Advanced Micro Devices',
    spot: 164.32, change: 3.45,
    ivRank: 52, optVol: 14_300_000, mcap: '$266B',
    priceSpark: [159, 159.5, 160.5, 161.5, 162, 163, 163.5, 164, 164.2, 164.32],
    netPrem: 31.6, cpRatio: 0.55, topTrade: 5.7, topGrade: 'WHALE',
    flowSpark: [0, 4, 8, 13, 18, 22, 26, 29, 31, 31.6],
    conviction: 'ACCUM 5X',
    topTrades: [
      { time: '15:11', side: 'BUY',  cp: 'Call', strike: 170, expiry: '7/18', size: 6800, prem: 5.7, grade: 'WHALE', conds: ['ACCUM 5X', 'OPENING'] },
      { time: '14:02', side: 'BUY',  cp: 'Call', strike: 165, expiry: '6/27', size: 5200, prem: 4.1, grade: 'WHALE', conds: ['UNUSUAL 24X'] },
      { time: '12:45', side: 'BUY',  cp: 'Call', strike: 168, expiry: '7/18', size: 3800, prem: 2.9, grade: 'LARGE', conds: ['ACCUM 5X'] },
      { time: '11:22', side: 'BUY',  cp: 'Call', strike: 170, expiry: '8/15', size: 2400, prem: 2.1, grade: 'LARGE', conds: ['OPENING'] },
      { time: '10:18', side: 'SELL', cp: 'Put',  strike: 155, expiry: '6/27', size: 1800, prem: 1.4, grade: 'LARGE', conds: ['MULTI-LEG'] },
    ],
  },
  {
    symbol: 'MSFT', name: 'Microsoft Corp',
    spot: 428.79, change: 0.89,
    ivRank: 28, optVol: 4_800_000, mcap: '$3.2T',
    priceSpark: [425, 425.5, 426, 426.5, 427, 427.5, 428, 428.3, 428.6, 428.79],
    netPrem: 11.9, cpRatio: 0.72, topTrade: 2.4, topGrade: 'LARGE',
    flowSpark: [0, 1.5, 3, 5, 6.5, 8, 9.5, 10.5, 11.5, 11.9],
    conviction: null,
    topTrades: [
      { time: '14:33', side: 'BUY',  cp: 'Call', strike: 435, expiry: '7/18', size: 2800, prem: 2.4, grade: 'LARGE', conds: ['OPENING'] },
      { time: '13:18', side: 'BUY',  cp: 'Call', strike: 430, expiry: '6/27', size: 2100, prem: 1.6, grade: 'LARGE', conds: [] },
      { time: '11:55', side: 'SELL', cp: 'Put',  strike: 420, expiry: '6/27', size: 1700, prem: 1.1, grade: 'LARGE', conds: ['OPENING'] },
    ],
  },
  {
    symbol: 'AMZN', name: 'Amazon.com Inc',
    spot: 208.45, change: -0.62,
    ivRank: 35, optVol: 7_200_000, mcap: '$2.2T',
    priceSpark: [209.5, 209.4, 209.2, 209, 208.8, 208.7, 208.6, 208.5, 208.5, 208.45],
    netPrem: -4.1, cpRatio: 1.31, topTrade: 1.5, topGrade: 'LARGE',
    flowSpark: [0, -0.5, -1, -1.5, -2, -2.5, -3, -3.5, -3.9, -4.1],
    conviction: null,
    topTrades: [
      { time: '14:42', side: 'BUY',  cp: 'Put',  strike: 205, expiry: '6/27', size: 2400, prem: 1.5, grade: 'LARGE', conds: ['OPENING'] },
      { time: '13:28', side: 'BUY',  cp: 'Put',  strike: 210, expiry: '6/27', size: 1800, prem: 1.0, grade: 'LARGE', conds: [] },
    ],
  },
  {
    symbol: 'QQQ', name: 'Invesco QQQ Trust',
    spot: 497.83, change: 1.05,
    ivRank: 41, optVol: 9_600_000, mcap: '—',
    priceSpark: [492, 493, 494, 495, 496, 496.5, 497, 497.3, 497.6, 497.83],
    netPrem: 18.7, cpRatio: 0.68, topTrade: 3.9, topGrade: 'WHALE',
    flowSpark: [0, 2, 5, 8, 11, 13, 15, 17, 18.3, 18.7],
    conviction: 'UNUSUAL 21X',
    topTrades: [
      { time: '15:22', side: 'BUY',  cp: 'Call', strike: 500, expiry: '6/27', size: 5200, prem: 3.9, grade: 'WHALE', conds: ['UNUSUAL 21X', 'OPENING'] },
      { time: '14:08', side: 'BUY',  cp: 'Call', strike: 502, expiry: '7/18', size: 3800, prem: 2.6, grade: 'LARGE', conds: ['OPENING'] },
      { time: '12:34', side: 'BUY',  cp: 'Call', strike: 500, expiry: '6/27', size: 2900, prem: 2.0, grade: 'LARGE', conds: [] },
    ],
  },
];
