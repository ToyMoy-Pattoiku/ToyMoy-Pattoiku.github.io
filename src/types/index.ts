export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type HazardData = {
  [K in RiskLevel]: {
    days: number;
    waterPerDay: number;
    riskColor: string;
  }
};