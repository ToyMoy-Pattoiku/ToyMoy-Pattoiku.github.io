import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { AlertTriangle, Droplets, Calendar, Users, MapPin } from 'lucide-react';

const DisasterPreparednessCalculator = () => {
  const [employeeCount, setEmployeeCount] = useState(100);
  const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high' | 'critical'>('high');
  const [location, setLocation] = useState<'tokyo' | 'osaka' | 'sendai' | 'fukuoka'>('tokyo');

  // ハザードマップに基づくリスク評価
  const hazardData = {
    low: { days: 3, waterPerDay: 3, riskColor: '#22c55e' },
    medium: { days: 5, waterPerDay: 3, riskColor: '#f59e0b' },
    high: { days: 7, waterPerDay: 3, riskColor: '#ef4444' },
    critical: { days: 10, waterPerDay: 4, riskColor: '#dc2626' }
  };

  // 地域別リスク設定
  const locationRisk = {
    tokyo: { baseRisk: 'high', multiplier: 1.2, name: '東京都' },
    osaka: { baseRisk: 'medium', multiplier: 1.1, name: '大阪府' },
    sendai: { baseRisk: 'high', multiplier: 1.3, name: '仙台市' },
    fukuoka: { baseRisk: 'medium', multiplier: 1.0, name: '福岡市' }
  };

  // 計算結果
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

  // チャート用データ
  const waterDistributionData = [
    { name: '飲料水', value: calculations.totalWater * 0.7, color: '#3b82f6' },
    { name: '生活用水', value: calculations.totalWater * 0.2, color: '#06b6d4' },
    { name: '緊急用水', value: calculations.totalWater * 0.1, color: '#0ea5e9' }
  ];

  const dailyConsumptionData = Array.from({ length: calculations.stockpileDays }, (_, i) => ({
    day: i + 1,
    water: calculations.dailyWater,
    food: employeeCount * 3
  }));

  const comparisonData = [
    { category: '水（L）', current: calculations.totalWater, recommended: calculations.totalWater * 1.2 },
    { category: '食料（食）', current: calculations.totalFood, recommended: calculations.totalFood * 1.1 },
    { category: '救急セット', current: calculations.emergencyKits, recommended: calculations.emergencyKits }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <AlertTriangle className="text-red-500" />
            災害備蓄計画ダッシュボード
          </h1>
          <p className="text-gray-600">ハザードマップを参考にした企業向け備蓄計画システム</p>
        </div>

        {/* 入力パネル */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Users className="text-blue-500" />
            基本情報入力
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">社員数</label>
              <input
                type="number"
                value={employeeCount}
                onChange={(e) => setEmployeeCount(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                max="10000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">地域選択</label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value as 'tokyo' | 'osaka' | 'sendai' | 'fukuoka')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="tokyo">東京都</option>
                <option value="osaka">大阪府</option>
                <option value="sendai">仙台市</option>
                <option value="fukuoka">福岡市</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">リスクレベル</label>
              <select
                value={riskLevel}
                onChange={(e) => setRiskLevel(e.target.value as 'low' | 'medium' | 'high' | 'critical')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">低リスク</option>
                <option value="medium">中リスク</option>
                <option value="high">高リスク</option>
                <option value="critical">最高リスク</option>
              </select>
            </div>
          </div>
        </div>

        {/* KPI カード */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">備蓄必要日数</p>
                <p className="text-2xl font-bold text-blue-600">{calculations.stockpileDays}日</p>
              </div>
              <Calendar className="text-blue-500 w-8 h-8" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">必要水量（総計）</p>
                <p className="text-2xl font-bold text-cyan-600">{calculations.totalWater}L</p>
              </div>
              <Droplets className="text-cyan-500 w-8 h-8" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">1日当たり水量</p>
                <p className="text-2xl font-bold text-green-600">{calculations.dailyWater}L</p>
              </div>
              <Droplets className="text-green-500 w-8 h-8" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">推定コスト</p>
                <p className="text-2xl font-bold text-orange-600">¥{calculations.estimatedCost.toLocaleString()}</p>
              </div>
              <MapPin className="text-orange-500 w-8 h-8" />
            </div>
          </div>
        </div>

        {/* チャートセクション */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* 水の用途別分布 */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">水の用途別分布</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={waterDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {waterDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}L`, '']} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* 日別消費量 */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">日別消費量予測</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyConsumptionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="water" stroke="#3b82f6" name="水（L）" />
                <Line type="monotone" dataKey="food" stroke="#ef4444" name="食料（食）" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 推奨値との比較 */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-4">現在の計画 vs 推奨値</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="current" fill="#3b82f6" name="現在の計画" />
              <Bar dataKey="recommended" fill="#10b981" name="推奨値" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 詳細情報テーブル */}
        <div className="bg-white p-6 rounded-lg shadow-lg mt-6">
          <h3 className="text-lg font-semibold mb-4">備蓄品目詳細</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="py-2 px-4 font-semibold">品目</th>
                  <th className="py-2 px-4 font-semibold">必要数量</th>
                  <th className="py-2 px-4 font-semibold">単位</th>
                  <th className="py-2 px-4 font-semibold">備考</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 px-4">飲料水</td>
                  <td className="py-2 px-4">{calculations.totalWater}</td>
                  <td className="py-2 px-4">L</td>
                  <td className="py-2 px-4">1人1日3-4L計算</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-4">非常食</td>
                  <td className="py-2 px-4">{calculations.totalFood}</td>
                  <td className="py-2 px-4">食</td>
                  <td className="py-2 px-4">1人1日3食計算</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-4">救急セット</td>
                  <td className="py-2 px-4">{calculations.emergencyKits}</td>
                  <td className="py-2 px-4">セット</td>
                  <td className="py-2 px-4">10人に1セット</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-4">懐中電灯</td>
                  <td className="py-2 px-4">{Math.ceil(employeeCount / 20)}</td>
                  <td className="py-2 px-4">個</td>
                  <td className="py-2 px-4">20人に1個</td>
                </tr>
                <tr>
                  <td className="py-2 px-4">毛布</td>
                  <td className="py-2 px-4">{Math.ceil(employeeCount / 2)}</td>
                  <td className="py-2 px-4">枚</td>
                  <td className="py-2 px-4">2人に1枚</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisasterPreparednessCalculator;