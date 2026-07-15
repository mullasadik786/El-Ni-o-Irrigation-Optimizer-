import React from 'react';
import { Field } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { BarChart3, LineChart, Info, HelpCircle } from 'lucide-react';

interface ChartsPanelProps {
  field: Field;
}

export default function ChartsPanel({ field }: ChartsPanelProps) {
  // Generate dynamic, crop-specific data for real-time engagement
  const generateMoistureTrendData = () => {
    const moisture = field.sensorData.soilMoisture;
    const baseTrend = [
      { day: 'Mon', Moisture: Math.min(95, Math.round(moisture * 1.3)) },
      { day: 'Tue', Moisture: Math.min(95, Math.round(moisture * 1.15)) },
      { day: 'Wed', Moisture: Math.min(95, Math.round(moisture * 1.05)) },
      { day: 'Thu', Moisture: Math.round(moisture) },
      { day: 'Fri', Moisture: Math.max(5, Math.round(moisture * 0.85)) },
      { day: 'Sat', Moisture: Math.max(5, Math.round(moisture * 0.72)) },
      { day: 'Sun', Moisture: Math.max(5, Math.round(moisture * 0.61)) },
    ];
    return baseTrend;
  };

  const generateConsumptionData = () => {
    const schedule = field.activeSchedule;
    const savingsRate = schedule ? schedule.waterSavedPercentage : 25;
    const optimizedVal = schedule ? Math.round(schedule.recommendedAmount * field.size) : Math.round(4500 * field.size);
    const baselineVal = Math.round(optimizedVal / (1 - (savingsRate / 100)));

    return [
      {
        name: field.crop,
        Standard: baselineVal,
        Optimized: optimizedVal,
      }
    ];
  };

  const moistureData = generateMoistureTrendData();
  const consumptionData = generateConsumptionData();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5" id="charts-panel-grid">
      {/* Soil Moisture Depletion Curve */}
      <div className="bg-white border-4 border-slate-900 rounded-none p-5 flex flex-col shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]" id="chart-moisture-container">
        <div className="flex items-center justify-between mb-4" id="moisture-chart-header">
          <div>
            <h3 className="font-display text-sm font-black text-slate-900 uppercase flex items-center gap-2 tracking-tight">
              <LineChart className="w-4 h-4 text-sky-600" />
              Soil Moisture Depletion Curve (7-Day Trend)
            </h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
              Active transpiration tracking for <strong className="text-emerald-700">{field.crop}</strong>
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-[9px] text-slate-900 font-mono font-bold uppercase" id="ideal-zone-legend">
            <span className="w-3.5 h-3.5 bg-emerald-100 border-2 border-slate-900 rounded-none" />
            <span>Target Zone (45-85%)</span>
          </div>
        </div>

        <div className="h-56 w-full mt-2" id="moisture-chart-render">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={moistureData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="moistureGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#cbd5e1" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" stroke="#0f172a" fontSize={10} tickLine={false} axisLine={false} style={{ fontWeight: 'bold' }} />
              <YAxis stroke="#0f172a" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} style={{ fontWeight: 'bold' }} />
              <Tooltip
                contentStyle={{ background: '#ffffff', border: '3px solid #0f172a', borderRadius: '0px', boxShadow: '2px 2px 0px 0px rgba(15,23,42,1)' }}
                labelStyle={{ color: '#0f172a', fontSize: '11px', fontWeight: 'bold' }}
                itemStyle={{ color: '#0284c7', fontSize: '11px', fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="Moisture" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#moistureGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Water Volume Saving Bar Chart */}
      <div className="bg-white border-4 border-slate-900 rounded-none p-5 flex flex-col shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]" id="chart-savings-container">
        <div className="flex items-center justify-between mb-4" id="savings-chart-header">
          <div>
            <h3 className="font-display text-sm font-black text-slate-900 uppercase flex items-center gap-2 tracking-tight">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              Water Delivery Comparison (Standard vs AI-Optimized)
            </h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
              Refined water footprint calculation in gallons per active irrigation cycle
            </p>
          </div>
          <span className="flex items-center gap-1 text-[9px] text-emerald-900 font-bold uppercase tracking-wide bg-emerald-100 px-2 py-1 border-2 border-slate-900">
            <Info className="w-3.5 h-3.5" />
            Adaptive Drip Savings
          </span>
        </div>

        <div className="h-56 w-full mt-2" id="savings-chart-render">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={consumptionData} margin={{ top: 15, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid stroke="#cbd5e1" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" stroke="#0f172a" fontSize={10} tickLine={false} axisLine={false} style={{ fontWeight: 'bold' }} />
              <YAxis stroke="#0f172a" fontSize={10} tickLine={false} axisLine={false} style={{ fontWeight: 'bold' }} />
              <Tooltip
                contentStyle={{ background: '#ffffff', border: '3px solid #0f172a', borderRadius: '0px', boxShadow: '2px 2px 0px 0px rgba(15,23,42,1)' }}
                itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
              />
              <Legend verticalAlign="top" height={36} iconSize={10} wrapperStyle={{ fontSize: '10px', color: '#0f172a', fontWeight: 'bold', textTransform: 'uppercase' }} />
              <Bar dataKey="Standard" name="Conventional Schedule (gal)" fill="#94a3b8" stroke="#0f172a" strokeWidth={2.5} radius={[0, 0, 0, 0]} />
              <Bar dataKey="Optimized" name="AI Precision Drip (gal)" fill="#10b981" stroke="#0f172a" strokeWidth={2.5} radius={[0, 0, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
