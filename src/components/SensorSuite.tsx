import React from 'react';
import { SensorData, Field } from '../types';
import { Sliders, Sun, Thermometer, Wind, Droplet, Zap, Gauge, AlertTriangle, ShieldCheck } from 'lucide-react';

interface SensorSuiteProps {
  field: Field;
  onSensorChange: (updatedSensor: SensorData) => void;
}

export default function SensorSuite({ field, onSensorChange }: SensorSuiteProps) {
  const { sensorData } = field;

  const updateField = (key: keyof SensorData, value: number) => {
    onSensorChange({
      ...sensorData,
      [key]: value
    });
  };

  // Preset Scenario Activators
  const applyScenario = (name: string) => {
    let preset: SensorData;
    switch (name) {
      case 'Heatwave':
        preset = {
          soilMoisture: 14,
          airTemp: 42,
          humidity: 11,
          windSpeed: 22,
          solarRadiation: 960,
          soilTemp: 37
        };
        break;
      case 'DryWinds':
        preset = {
          soilMoisture: 19,
          airTemp: 38,
          humidity: 7,
          windSpeed: 45,
          solarRadiation: 850,
          soilTemp: 32
        };
        break;
      case 'Torrential':
        preset = {
          soilMoisture: 82,
          airTemp: 29,
          humidity: 92,
          windSpeed: 31,
          solarRadiation: 120,
          soilTemp: 24
        };
        break;
      default: // Normal baseline
        preset = {
          soilMoisture: 48,
          airTemp: 24,
          humidity: 62,
          windSpeed: 12,
          solarRadiation: 450,
          soilTemp: 21
        };
        break;
    }
    onSensorChange(preset);
  };

  // Determine sensor warning severity
  const getMoistureStatus = (val: number) => {
    if (val < 20) return { label: 'Critical Wilting Point', color: 'text-rose-900', bg: 'bg-rose-100 border-2 border-rose-900 animate-pulse' };
    if (val < 35) return { label: 'Moderate Depletion', color: 'text-amber-900', bg: 'bg-amber-100 border-2 border-amber-900' };
    return { label: 'Safe Capacity', color: 'text-emerald-900', bg: 'bg-emerald-100 border-2 border-emerald-900' };
  };

  const getHeatStatus = (val: number) => {
    if (val >= 40) return { label: 'Severe Sunscald Threat', color: 'text-rose-900', bg: 'bg-rose-100 border-2 border-rose-900' };
    if (val >= 32) return { label: 'High Evaporation Strain', color: 'text-amber-900', bg: 'bg-amber-100 border-2 border-amber-900' };
    return { label: 'Normal Thermal Range', color: 'text-slate-900', bg: 'bg-slate-50 border-2 border-slate-900' };
  };

  const moistureStatus = getMoistureStatus(sensorData.soilMoisture);
  const heatStatus = getHeatStatus(sensorData.airTemp);

  return (
    <div className="bg-white border-4 border-slate-900 rounded-none p-5 flex flex-col h-full shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]" id="sensor-suite-container">
      {/* Header */}
      <div className="mb-5" id="sensor-header">
        <h2 className="font-display text-lg font-black text-slate-900 uppercase flex items-center gap-2 tracking-tight">
          <Sliders className="w-5 h-5 text-emerald-600" />
          Hyper-Local Telemetry Suite
        </h2>
        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-0.5">
          Simulate environmental forces on <strong className="text-emerald-700">{field.name}</strong>
        </p>
      </div>

      {/* Climate Presets */}
      <div className="mb-6 p-4 bg-slate-50 border-2 border-slate-900 rounded-none" id="preset-selector">
        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black block mb-2.5">
          El Niño Condition Simulators
        </span>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <button
            onClick={() => applyScenario('Normal')}
            className="px-2 py-1.5 rounded-none border-2 border-slate-900 bg-white text-slate-900 hover:bg-slate-100 text-[10px] font-black uppercase tracking-wider transition duration-150 cursor-pointer text-center"
            id="preset-normal"
          >
            Baseline
          </button>
          <button
            onClick={() => applyScenario('Heatwave')}
            className="px-2 py-1.5 rounded-none border-2 border-slate-900 bg-red-100 text-red-900 hover:bg-red-200 text-[10px] font-black uppercase tracking-wider transition duration-150 cursor-pointer text-center flex items-center justify-center gap-1"
            id="preset-heatwave"
          >
            <AlertTriangle className="w-3 h-3 text-red-900" />
            Heatwave
          </button>
          <button
            onClick={() => applyScenario('DryWinds')}
            className="px-2 py-1.5 rounded-none border-2 border-slate-900 bg-amber-100 text-amber-900 hover:bg-amber-200 text-[10px] font-black uppercase tracking-wider transition duration-150 cursor-pointer text-center flex items-center justify-center gap-1"
            id="preset-winds"
          >
            <Wind className="w-3 h-3 text-amber-900" />
            Dry Winds
          </button>
          <button
            onClick={() => applyScenario('Torrential')}
            className="px-2 py-1.5 rounded-none border-2 border-slate-900 bg-sky-100 text-sky-900 hover:bg-sky-200 text-[10px] font-black uppercase tracking-wider transition duration-150 cursor-pointer text-center flex items-center justify-center gap-1"
            id="preset-torrent"
          >
            <Droplet className="w-3 h-3 text-sky-900" />
            Storm
          </button>
        </div>
      </div>

      {/* Dynamic Alerts Indicator */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6" id="telemetry-alerts-grid">
        <div className={`p-2.5 rounded-none flex items-center gap-3 ${moistureStatus.bg}`} id="moisture-status-indicator">
          <Droplet className={`w-5 h-5 ${moistureStatus.color}`} />
          <div>
            <p className="text-[10px] text-slate-600 font-mono font-bold uppercase">Soil Moisture Stress</p>
            <p className={`text-xs font-black uppercase ${moistureStatus.color}`}>{moistureStatus.label}</p>
          </div>
        </div>
        <div className={`p-2.5 rounded-none flex items-center gap-3 ${heatStatus.bg}`} id="heat-status-indicator">
          <Thermometer className={`w-5 h-5 ${heatStatus.color}`} />
          <div>
            <p className="text-[10px] text-slate-600 font-mono font-bold uppercase">Solar Evaporative Strain</p>
            <p className={`text-xs font-black uppercase ${heatStatus.color}`}>{heatStatus.label}</p>
          </div>
        </div>
      </div>

      {/* Interactive Controls */}
      <div className="space-y-4 flex-1" id="sliders-controls">
        {/* Soil Moisture */}
        <div className="space-y-1.5" id="slider-soil-moisture">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-900 font-black flex items-center gap-1.5 uppercase tracking-wide">
              <Droplet className="w-3.5 h-3.5 text-sky-600" />
              Soil Moisture Level
            </span>
            <span className="text-xs font-mono font-black text-slate-900">{sensorData.soilMoisture}%</span>
          </div>
          <input
            type="range"
            min="5"
            max="95"
            value={sensorData.soilMoisture}
            onChange={(e) => updateField('soilMoisture', parseInt(e.target.value))}
            className="w-full h-3 bg-slate-100 rounded-none border-2 border-slate-900 appearance-none cursor-pointer accent-slate-900 transition"
          />
          <div className="flex justify-between text-[10px] font-mono font-bold text-slate-500 uppercase mt-0.5">
            <span>5% (Dry Sand)</span>
            <span>95% (Waterlogged)</span>
          </div>
        </div>

        {/* Ambient Temperature */}
        <div className="space-y-1.5" id="slider-temp">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-900 font-black flex items-center gap-1.5 uppercase tracking-wide">
              <Thermometer className="w-3.5 h-3.5 text-orange-600" />
              Air Temperature
            </span>
            <span className="text-xs font-mono font-black text-slate-900">{sensorData.airTemp}°C</span>
          </div>
          <input
            type="range"
            min="10"
            max="50"
            value={sensorData.airTemp}
            onChange={(e) => updateField('airTemp', parseInt(e.target.value))}
            className="w-full h-3 bg-slate-100 rounded-none border-2 border-slate-900 appearance-none cursor-pointer accent-slate-900 transition"
          />
          <div className="flex justify-between text-[10px] font-mono font-bold text-slate-500 uppercase mt-0.5">
            <span>10°C (Cool)</span>
            <span>50°C (Extreme Desert)</span>
          </div>
        </div>

        {/* Humidity */}
        <div className="space-y-1.5" id="slider-humidity">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-900 font-black flex items-center gap-1.5 uppercase tracking-wide">
              <Gauge className="w-3.5 h-3.5 text-emerald-600" />
              Relative Humidity
            </span>
            <span className="text-xs font-mono font-black text-slate-900">{sensorData.humidity}%</span>
          </div>
          <input
            type="range"
            min="5"
            max="100"
            value={sensorData.humidity}
            onChange={(e) => updateField('humidity', parseInt(e.target.value))}
            className="w-full h-3 bg-slate-100 rounded-none border-2 border-slate-900 appearance-none cursor-pointer accent-slate-900 transition"
          />
          <div className="flex justify-between text-[10px] font-mono font-bold text-slate-500 uppercase mt-0.5">
            <span>5% (Arid)</span>
            <span>100% (Saturated)</span>
          </div>
        </div>

        {/* Wind Speed */}
        <div className="space-y-1.5" id="slider-wind">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-900 font-black flex items-center gap-1.5 uppercase tracking-wide">
              <Wind className="w-3.5 h-3.5 text-amber-600" />
              Wind Velocity
            </span>
            <span className="text-xs font-mono font-black text-slate-900">{sensorData.windSpeed} km/h</span>
          </div>
          <input
            type="range"
            min="0"
            max="60"
            value={sensorData.windSpeed}
            onChange={(e) => updateField('windSpeed', parseInt(e.target.value))}
            className="w-full h-3 bg-slate-100 rounded-none border-2 border-slate-900 appearance-none cursor-pointer accent-slate-900 transition"
          />
          <div className="flex justify-between text-[10px] font-mono font-bold text-slate-500 uppercase mt-0.5">
            <span>0 km/h (Still)</span>
            <span>60 km/h (Gale Storm)</span>
          </div>
        </div>

        {/* Solar Radiation */}
        <div className="space-y-1.5" id="slider-solar">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-900 font-black flex items-center gap-1.5 uppercase tracking-wide">
              <Sun className="w-3.5 h-3.5 text-yellow-600" />
              Solar Intensity
            </span>
            <span className="text-xs font-mono font-black text-slate-900">{sensorData.solarRadiation} W/m²</span>
          </div>
          <input
            type="range"
            min="50"
            max="1100"
            value={sensorData.solarRadiation}
            onChange={(e) => updateField('solarRadiation', parseInt(e.target.value))}
            className="w-full h-3 bg-slate-100 rounded-none border-2 border-slate-900 appearance-none cursor-pointer accent-slate-900 transition"
          />
          <div className="flex justify-between text-[10px] font-mono font-bold text-slate-500 uppercase mt-0.5">
            <span>50 W/m² (Shaded/Night)</span>
            <span>1100 W/m² (Zenith Sun)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
