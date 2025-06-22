import { useState } from 'react';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type HazardData = {
  [K in RiskLevel]: {
    days: number;
    waterPerDay: number;
    riskColor: string;
  }
};

export type LocationKey = 'tokyo' | 'osaka' | 'sendai' | 'fukuoka';

export const locationRisk: Record<LocationKey, { baseRisk: string; multiplier: number; name: string }> = {
  tokyo: { baseRisk: 'high', multiplier: 1.2, name: '東京' },
  osaka: { baseRisk: 'medium', multiplier: 1.1, name: '大阪' },
  sendai: { baseRisk: 'critical', multiplier: 1.3, name: '仙台' },
  fukuoka: { baseRisk: 'low', multiplier: 1.0, name: '福岡' }
};

const [location, setLocation] = useState<LocationKey>('tokyo');