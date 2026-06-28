import { mockDataRepository } from '../repositories/mockData.repository';

// Keep the types for backward compatibility, although they can map directly to Prisma types
export type MockPredictionRound =
  | { id: string; asset: string; mode: 'updown'; status: 'live' | 'new'; startPrice: number; poolUp: number; poolDown: number; closesAt: string; }
  | { id: string; asset: string; mode: 'precision'; status: 'live' | 'new'; startPrice: number; totalPool: number; predictionCount: number; closesAt: string; };

export type MockLeaderboardUser = {
  rank: number;
  address: string;
  totalWins: number;
  totalLosses: number;
  winStreak: number;
  xp: number;
  rankTitle: string;
};

// Async functions calling the new Prisma repository
export const getMockRounds = async (): Promise<MockPredictionRound[]> => {
  const rounds = await mockDataRepository.getRounds();
  // Map Prisma models back to the expected union type
  return rounds.map(r => {
    if (r.mode === 'updown') {
      return {
        id: r.id, asset: r.asset, mode: 'updown', status: r.status as 'live' | 'new',
        startPrice: r.startPrice, poolUp: r.poolUp!, poolDown: r.poolDown!, closesAt: r.closesAt
      };
    }
    return {
      id: r.id, asset: r.asset, mode: 'precision', status: r.status as 'live' | 'new',
      startPrice: r.startPrice, totalPool: r.totalPool!, predictionCount: r.predictionCount!, closesAt: r.closesAt
    };
  });
};

export const getMockLeaderboard = async (): Promise<MockLeaderboardUser[]> => {
  return mockDataRepository.getLeaderboard();
};

export const getMockData = async () => {
  const platformStats = await mockDataRepository.getPlatformStats();
  const leaderboard = await getMockLeaderboard();

  return {
    prices: mockData.prices,
    platformStats: platformStats ? {
      totalRounds: platformStats.totalRounds,
      totalVxlmDistributed: platformStats.totalVxlmDistributed,
      activePlayers: platformStats.activePlayers,
      totalBetsPlaced: platformStats.totalBetsPlaced,
    } : {
      totalRounds: 1247,
      totalVxlmDistributed: 4200000,
      activePlayers: 893,
      totalBetsPlaced: 8432,
    },
    leaderboard,
  };
};

// Synchronous prices array remains in memory because price polling relies on it synchronously if DB fallback is invoked
export const mockData = {
  prices: [
    { id: 'bitcoin', symbol: 'btc', price: 60000 },
    { id: 'ethereum', symbol: 'eth', price: 3000 },
  ],
};

/**
 * Static mock constants used as a fallback by the stats service when the
 * database is empty or unreachable.
 */
export const MOCK_PLATFORM_STATS = {
  totalRounds: 0,
  totalUsers: 0,
  totalBets: 0,
} as const;