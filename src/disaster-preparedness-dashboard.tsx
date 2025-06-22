import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { AlertTriangle, Droplets, Calendar, Users, MapPin } from 'lucide-react';
import { RiskLevel, HazardData, locationRisk, LocationKey } from './types';

const DisasterPreparednessCalculator = () => {
  const [employeeCount, setEmployeeCount] = useState(100);
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('low');
  const [location, setLocation] = useState<LocationKey>('tokyo');

  const hazardData: HazardData = {
    low: { days: 3, waterPerDay: 2, riskColor: 'green' },
    medium: { days: 5, waterPerDay: 3, riskColor: 'yellow' },
    high: { days: 7, waterPerDay: 4, riskColor: 'orange' },
    critical: { days: 10, waterPerDay: 5, riskColor: 'red' }
  };

  const calculations = useMemo(() => {
    const hazard = hazardData[riskLevel];
    const locationInfo = locationRisk[location];
    
    const totalWaterNeeded = employeeCount * hazard.waterPerDay * hazard.days * locationInfo.multiplier;
    const totalFoodNeeded = employeeCount * hazard.days;
    const emergencyKitNeeded = Math.ceil(employeeCount / 10);
    
    return {
      stockpileDays: Math.ceil(hazard.days * locationInfo.multiplier),
      totalWater: Math.ceil(totalWaterNeeded),
      dailyWater: Math.ceil(employeeCount * hazard.waterPerDay * locationInfo.multiplier),
      totalFood: totalFoodNeeded,
      emergencyKits: emergencyKitNeeded,
      estimatedCost: Math.ceil((totalWaterNeeded * 100 + totalFoodNeeded * 500 + emergencyKitNeeded * 10000) / 1000) * 1000
    };
  }, [employeeCount, riskLevel, location]);

  const waterDistributionData = [
    { name: '飲料水', value: calculations.totalWater * 0.7, color: '#3b82f6' },
    { name: '生活用水', value: calculations.totalWater * 0.2, color: '#06b6d4' },
    { name: '緊急用水', value: calculations.totalWater * 0.1, color: '#0ea5e9' }
  ];

  const dailyConsumptionData = Array.from({ length: calculations.stockpileDays }, (_, i) => ({
    day: i + 1,
    water: calculations.dailyWater,
    food: calculations.totalFood / calculations.stockpileDays
  }));

  return (
    <div>
      <h1>災害準備計算機</h1>
      {/* UI components for input and displaying results */}
      <BarChart width={600} height={300} data={dailyConsumptionData}>
        <XAxis dataKey="day" />
        <YAxis />
        <Tooltip />
        <CartesianGrid strokeDasharray="3 3" />
        <Bar dataKey="water" fill="#3b82f6" />
        <Bar dataKey="food" fill="#06b6d4" />
      </BarChart>
      <PieChart width={400} height={400}>
        <Pie data={waterDistributionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8">
          {waterDistributionData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
      </PieChart>
      {/* Additional UI components for displaying calculations */}
    </div>
  );
};

export default DisasterPreparednessCalculator;