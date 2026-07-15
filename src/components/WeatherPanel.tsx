import React from 'react';
import { ClimateForecast } from '../types';
import { Sun, CloudRain, Flame, Wind, CloudSun, AlertTriangle, Droplets } from 'lucide-react';

interface WeatherPanelProps {
  forecast: ClimateForecast[];
  activeScenario: string;
  onSelectScenario: (scenario: string) => void;
}

export const weatherIcons: Record<string, React.ReactNode> = {
  Sunny: <CloudSun className="w-6 h-6 text-yellow-400" id="icon-sunny" />,
  Heatwave: <Flame className="w-6 h-6 text-red-500 animate-pulse" id="icon-heatwave" />,
  'Dry Winds': <Wind className="w-6 h-6 text-amber-400" id="icon-dry-winds" />,
  'Sudden Shower': <CloudRain className="w-6 h-6 text-sky-400" id="icon-sudden-shower" />,
  Overcast: <CloudSun className="w-6 h-6 text-slate-400" id="icon-overcast" />
};

export default function WeatherPanel({ forecast, activeScenario, onSelectScenario }: WeatherPanelProps) {
  return (
    <div className="bg-white border-4 border-slate-900 rounded-none p-5 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]" id="weather-panel-container">
      {/* Header and Controller */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5" id="weather-header">
        <div>
          <h2 className="font-display text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
            <Flame className="w-5 h-5 text-red-600" />
            Super El Niño Climate Forecaster
          </h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-0.5">
            Modeling high-temperature anomalies & localized convective downpours
          </p>
        </div>

        {/* Dynamic Scenario Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-none border-2 border-slate-900" id="scenario-selector">
          <button
            onClick={() => onSelectScenario('extreme')}
            className={`px-3 py-1.5 rounded-none text-xs font-black tracking-wide uppercase transition duration-150 cursor-pointer ${
              activeScenario === 'extreme'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
            id="scenario-extreme-btn"
          >
            Heatwave Dome
          </button>
          <button
            onClick={() => onSelectScenario('winds')}
            className={`px-3 py-1.5 rounded-none text-xs font-black tracking-wide uppercase transition duration-150 cursor-pointer ${
              activeScenario === 'winds'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
            id="scenario-winds-btn"
          >
            Arid Gale Block
          </button>
          <button
            onClick={() => onSelectScenario('torrential')}
            className={`px-3 py-1.5 rounded-none text-xs font-black tracking-wide uppercase transition duration-150 cursor-pointer ${
              activeScenario === 'torrential'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
            id="scenario-torrential-btn"
          >
            Convective Storms
          </button>
        </div>
      </div>

      {/* 5-Day Card Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3" id="weather-grid">
        {forecast.map((f, idx) => {
          const isHighEvap = f.temp >= 38 || f.condition === 'Dry Winds';
          
          return (
            <div
              key={f.day}
              className={`p-4 rounded-none border-2 border-slate-900 flex flex-col items-center justify-between text-center relative overflow-hidden transition-all duration-150 ${
                isHighEvap
                  ? 'bg-red-100/50 hover:bg-red-100'
                  : 'bg-white hover:bg-slate-50'
              }`}
              id={`weather-day-${idx}`}
            >
              {isHighEvap && (
                <div className="absolute top-0 right-0 left-0 h-1 bg-red-600" />
              )}
              
              <span className="text-xs font-black text-slate-400 block mb-1">
                {f.day}
              </span>

              <div className="my-2.5" id={`weather-icon-day-${idx}`}>
                {weatherIcons[f.condition] || <Sun className="w-6 h-6 text-yellow-500" />}
              </div>

              <div className="space-y-1" id={`weather-data-day-${idx}`}>
                <p className="text-lg font-black text-slate-900 font-mono">
                  {f.temp}°C
                </p>
                <p className="text-xs font-bold text-slate-500 uppercase">
                  {f.condition}
                </p>
              </div>

              {/* Moisture status indicator under current forecast */}
              <div className="mt-3 w-full pt-2.5 border-t-2 border-slate-100 space-y-1" id={`precipitation-day-${idx}`}>
                <div className="flex items-center justify-center gap-1 text-[10px] font-mono font-bold text-slate-600">
                  <Droplets className="w-3 h-3 text-sky-600" />
                  <span>Rain: {f.precipitationProbability}%</span>
                </div>
                {isHighEvap && (
                  <div className="flex items-center justify-center gap-0.5 text-[8px] font-black uppercase font-mono text-red-900 bg-red-200 py-0.5 px-1 border border-red-950">
                    <AlertTriangle className="w-3.5 h-3.5" /> High Evap
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
