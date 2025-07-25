import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import { AlertTriangle, Droplets, Calendar, Users, MapPin } from 'lucide-react';
import { RiskLevel, LocationKey, locationRisk } from './types';

const hazardData: Record<RiskLevel, { days: number; waterPerDay: number; riskColor: string }> = {
  low: { days: 3, waterPerDay: 3, riskColor: '#22c55e' },
  medium: { days: 5, waterPerDay: 3, riskColor: '#f59e0b' },
  high: { days: 7, waterPerDay: 3, riskColor: '#ef4444' },
  critical: { days: 10, waterPerDay: 4, riskColor: '#dc2626' }
};

const DisasterPreparednessCalculator = () => {
  const [employeeCount, setEmployeeCount] = useState<number>(100);
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('high');
  const [location, setLocation] = useState<LocationKey>('tokyo');

  // 各品目の現在の数量（初期値は必要数量と同じ）
  const [currentWater, setCurrentWater] = useState<number>(0);
  const [currentFood, setCurrentFood] = useState<number>(0);
  const [currentKits, setCurrentKits] = useState<number>(0);
  const [currentLights, setCurrentLights] = useState<number>(0);
  const [currentBlankets, setCurrentBlankets] = useState<number>(0);
  const [currentLifeWater, setCurrentLifeWater] = useState<number>(0); // 追加

  // 計算結果
  const calculations = useMemo(() => {
    const hazard = hazardData[riskLevel];
    const locationInfo = locationRisk[location];
    const stockpileDays = Math.ceil(hazard.days * locationInfo.multiplier);

    // 地域ごとの備蓄必要日数で必要量を再計算
    const totalWaterNeeded = employeeCount * hazard.waterPerDay * stockpileDays;
    const totalFoodNeeded = employeeCount * stockpileDays;
    const emergencyKitNeeded = Math.ceil(employeeCount / 10);
    const lightsNeeded = Math.ceil(employeeCount / 20);
    const blanketsNeeded = Math.ceil(employeeCount / 2);

    // 1日あたりの消費量を「推奨量÷備蓄日数」で算出
    const dailyWater = totalWaterNeeded / stockpileDays;
    const dailyFood = totalFoodNeeded / stockpileDays;

    return {
      stockpileDays,
      totalWater: Math.ceil(totalWaterNeeded),
      dailyWater,
      dailyFood,
      totalFood: totalFoodNeeded,
      emergencyKits: emergencyKitNeeded,
      lights: lightsNeeded,
      blankets: blanketsNeeded,
      estimatedCost: Math.ceil((totalWaterNeeded * 100 + totalFoodNeeded * 500 + emergencyKitNeeded * 10000) / 1000) * 1000
    };
  }, [employeeCount, riskLevel, location]);

  // 推奨数量（グラフ・表で共通で使う）
  const recommendedDrinkingWater = employeeCount * 3 * calculations.stockpileDays;
  const recommendedWater = Math.ceil(recommendedDrinkingWater / 0.7);
  const recommendedLifeWater = recommendedWater - recommendedDrinkingWater;

  // 推奨非常食（1人1日3食計算）
  const recommendedFood = employeeCount * 3 * calculations.stockpileDays;

  // 1日当たり食料（必要食料（総計）を日数で割る）
  const recommendedDailyFood = Math.ceil(recommendedFood / calculations.stockpileDays);

  // 1日当たり水量（必要水量（総計）を備蓄必要日数で割る）
  const recommendedDailyWater = Math.ceil(recommendedWater / calculations.stockpileDays);

  // 備蓄量から日ごとに減っていくグラフデータ
  const dailyConsumptionData = Array.from({ length: calculations.stockpileDays + 1 }, (_, i) => {
    const day = i + 1;
    // 初期値は現在数量（飲料水＋生活用水、非常食）を用いる
    const initialWater = currentWater + currentLifeWater;
    const initialFood = currentFood;
    // 水の減少量は1日当たり水量（recommendedDailyWater）で計算
    const waterLeft = Math.max(initialWater - recommendedDailyWater * i, 0);
    // 1日当たり食料の計算し直しを反映
    const foodLeft = Math.max(initialFood - recommendedDailyFood * i, 0);
    return {
      day,
      waterLeft,
      foodLeft
    };
  });

  // 水の現在数量は飲料水＋生活用水（緊急用水含む）の合算
  const totalCurrentWater = currentWater + currentLifeWater;

  // グラフ用データ（現在の数量を反映）
  const comparisonData = [
    { category: '水（L）', current: totalCurrentWater, recommended: recommendedWater },
    { category: '食料（食）', current: currentFood, recommended: recommendedFood }
  ];

  // 判定ロジック（現在数量と推奨数量で判定）
  const waterOk = totalCurrentWater >= recommendedWater;
  const foodOk = currentFood >= recommendedFood;

  let statusClass = '';
  let statusContent = '';
  if (waterOk && foodOk) {
    statusClass = 'text-green-500';
    statusContent = '〇';
  } else if (waterOk || foodOk) {
    statusClass = 'text-yellow-500';
    statusContent = '△';
  } else {
    statusClass = 'text-red-500';
    statusContent = '×';
  }

  // 水の用途別分布（推奨数量ベースで7:3で分割）
  const waterDistributionData = [
    { name: '飲料水', value: recommendedDrinkingWater, color: '#3b82f6' },
    { name: '生活用水（緊急用水含む）', value: recommendedLifeWater, color: '#06b6d4' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 flex flex-col justify-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <AlertTriangle className="text-red-500" />
            災害備蓄計画ダッシュボード
          </h1>
        </div>

        {/* 入力パネル＋備蓄判定タイル */}
        <div className="flex flex-col md:flex-row gap-6 mb-6">
          {/* 入力パネル（左） */}
          <div className="bg-white rounded-lg shadow-lg p-6 flex-1">
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
                  min={1}
                  max={10000}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">地域選択</label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value as LocationKey)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="tokyo">東京都</option>
                  <option value="osaka">大阪府</option>
                  <option value="aichi">愛知県</option>
                  <option value="sendai">仙台市</option>
                  <option value="fukuoka">福岡市</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">リスクレベル</label>
                <select
                  value={riskLevel}
                  onChange={(e) => setRiskLevel(e.target.value as RiskLevel)}
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
          {/* 備蓄判定タイル（右） */}
          <div className="bg-white rounded-lg shadow-lg p-4 md:p-3 flex flex-col items-center justify-center w-full md:max-w-xs">
            <div className="text-lg font-semibold mb-4">備蓄判定</div>
            <span
              className={`text-7xl font-bold ${statusClass} select-none`}
              aria-label="備蓄判定"
            >
              {statusContent}
            </span>
            <div className="mt-1 text-sm text-gray-500 text-center">
              {statusContent === '〇' && <>水と非常食の両方が推奨数量を満たしています</>}
              {statusContent === '△' && <>水または非常食のどちらかが推奨数量を満たしています</>}
              {statusContent === '×' && <>水も非常食も推奨数量を満たしていません</>}
            </div>
          </div>
        </div>

        {/* KPI カード */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">備蓄必要日数</p>
                <p className="text-2xl font-bold text-blue-600">{calculations.stockpileDays}日</p>
              </div>
              <Calendar className="text-blue-500 w-8 h-8" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">必要水量（総計）</p>
                <p className="text-2xl font-bold text-cyan-600">
                  {recommendedWater}L
                </p>
              </div>
              <Droplets className="text-cyan-500 w-8 h-8" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">1日当たり水量</p>
                <p className="text-2xl font-bold text-green-600">{recommendedDailyWater}L</p>
              </div>
              <Droplets className="text-green-500 w-8 h-8" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">必要食料（総計）</p>
                <p className="text-2xl font-bold text-rose-600">{recommendedFood}食</p>
              </div>
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-rose-100">
                <svg className="w-6 h-6 text-rose-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </span>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">1日当たり食料</p>
                <p className="text-2xl font-bold text-pink-600">{recommendedDailyFood}食</p>
              </div>
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-pink-100">
                <svg className="w-6 h-6 text-pink-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </span>
            </div>
          </div>
        </div>

        {/* 備蓄品目（KPIカードの直後に移動） */}
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
          <h3 className="text-lg font-semibold mb-4">備蓄品目</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="py-2 px-4 font-semibold">品目</th>
                  <th className="py-2 px-4 font-semibold text-right">現在数量</th>
                  <th className="py-2 px-4 font-semibold text-right">推奨数量</th>
                  <th className="py-2 px-4 font-semibold text-center">単位</th>
                  <th className="py-2 px-4 font-semibold">備考</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 px-4">飲料水</td>
                  <td className="py-2 px-4 text-right">
                    <input
                      type="number"
                      min={0}
                      className="w-24 px-2 py-1 border border-gray-300 rounded text-right"
                      value={currentWater}
                      onChange={e => setCurrentWater(Number(e.target.value))}
                    />
                  </td>
                  <td className="py-2 px-4 text-right">{recommendedDrinkingWater}</td>
                  <td className="py-2 px-4 text-center">L</td>
                  <td className="py-2 px-4">1人1日3L</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-4">生活用水（緊急用水含む）</td>
                  <td className="py-2 px-4 text-right">
                    <input
                      type="number"
                      min={0}
                      className="w-24 px-2 py-1 border border-gray-300 rounded text-right"
                      value={currentLifeWater}
                      onChange={e => setCurrentLifeWater(Number(e.target.value))}
                    />
                  </td>
                  <td className="py-2 px-4 text-right">{recommendedLifeWater}</td>
                  <td className="py-2 px-4 text-center">L</td>
                  <td className="py-2 px-4">飲料水：生活用水=7:3</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-4">非常食</td>
                  <td className="py-2 px-4 text-right">
                    <input
                      type="number"
                      min={0}
                      className="w-24 px-2 py-1 border border-gray-300 rounded text-right"
                      value={currentFood}
                      onChange={e => setCurrentFood(Number(e.target.value))}
                    />
                  </td>
                  <td className="py-2 px-4 text-right">{recommendedFood}</td>
                  <td className="py-2 px-4 text-center">食</td>
                  <td className="py-2 px-4">1人1日3食</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-4">救急セット</td>
                  <td className="py-2 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <input
                        type="number"
                        min={0}
                        className="w-24 px-2 py-1 border border-gray-300 rounded text-right"
                        value={currentKits}
                        onChange={e => setCurrentKits(Number(e.target.value))}
                      />
                    </div>
                  </td>
                  <td className="py-2 px-4 text-right">{calculations.emergencyKits}</td>
                  <td className="py-2 px-4 text-center">セット</td>
                  <td className="py-2 px-4">10人に1セット</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-4">懐中電灯</td>
                  <td className="py-2 px-4 text-right">
                    <input
                      type="number"
                      min={0}
                      className="w-24 px-2 py-1 border border-gray-300 rounded text-right"
                      value={currentLights}
                      onChange={e => setCurrentLights(Number(e.target.value))}
                    />
                  </td>
                  <td className="py-2 px-4 text-right">{calculations.lights}</td>
                  <td className="py-2 px-4 text-center">個</td>
                  <td className="py-2 px-4">20人に1個</td>
                </tr>
                <tr>
                  <td className="py-2 px-4">毛布</td>
                  <td className="py-2 px-4 text-right">
                    <input
                      type="number"
                      min={0}
                      className="w-24 px-2 py-1 border border-gray-300 rounded text-right"
                      value={currentBlankets}
                      onChange={e => setCurrentBlankets(Number(e.target.value))}
                    />
                  </td>
                  <td className="py-2 px-4 text-right">{calculations.blankets}</td>
                  <td className="py-2 px-4 text-center">枚</td>
                  <td className="py-2 px-4">2人に1枚</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 現在数量 vs 推奨数量（備蓄品目の直後に移動） */}
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
          <h3 className="text-lg font-semibold mb-4">現在数量 vs 推奨数量</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="current" fill="#3b82f6" name="現在数量" />
              <Bar dataKey="recommended" fill="#10b981" name="推奨数量" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* チャートセクション */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* 水の用途別分布 */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">水の用途別分布</h3>
            <div className="w-full overflow-x-auto">
              <div style={{ minWidth: 420 }}>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={waterDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => (
                        <tspan>
                          {name}
                          <tspan x="0" dy="1.2em">{` ${(percent * 100).toFixed(0)}%`}</tspan>
                        </tspan>
                      )}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                    >
                      {waterDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const entry = payload[0].payload;
                          const percent = (
                            entry.value /
                            (waterDistributionData[0].value + waterDistributionData[1].value)
                          ) * 100;
                          const style = {
                            color: entry.color,
                            fontWeight: 'bold'
                          };
                          return (
                            <div className="custom-tooltip" style={{ background: '#fff', border: '1px solid #ccc', padding: 8, borderRadius: 6, minWidth: 220 }}>
                              <span style={style}>
                                {entry.name}：{entry.value}L（{percent.toFixed(0)}%）
                              </span>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* 凡例を追加 */}
                <div className="flex gap-6 justify-center mt-4 flex-wrap">
                  {waterDistributionData.map((entry, idx) => {
                    const total = waterDistributionData[0].value + waterDistributionData[1].value;
                    const percent = total > 0 ? (entry.value / total) * 100 : 0;
                    return (
                      <div key={entry.name} className="flex items-center gap-2 min-w-[120px]">
                        <span
                          style={{
                            display: 'inline-block',
                            width: 16,
                            height: 16,
                            backgroundColor: entry.color,
                            borderRadius: 4,
                            marginRight: 6,
                          }}
                        />
                        <span className="text-sm" style={{ color: entry.color, fontWeight: 'bold' }}>
                          {entry.name}（{percent.toFixed(0)}%）
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* 日別消費量 */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">備蓄残目安</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dailyConsumptionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip
                  formatter={(value: number, name: string) => {
                    if (name === "waterLeft") return [`${value}L`, "残り水量"];
                    if (name === "foodLeft") return [`${value}食`, "残り食料"];
                    return [value, name];
                  }}
                  labelFormatter={(label) => `${label}日目`}
                />
                <Area type="monotone" dataKey="waterLeft" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} name="残り水量（L）" />
                <Area type="monotone" dataKey="foodLeft" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} name="残り食料（食）" />
                <Line type="monotone" dataKey="waterLeft" stroke="#3b82f6" name="残り水量（L）" dot={false} />
                <Line type="monotone" dataKey="foodLeft" stroke="#ef4444" name="残り食料（食）" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisasterPreparednessCalculator;