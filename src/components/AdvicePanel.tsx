import React, { useState, useEffect } from 'react';
import { Field, IrrigationSchedule } from '../types';
import { Brain, Sparkles, Clock, Droplet, ArrowRight, CheckCircle2, ShieldAlert, Zap, AlertCircle } from 'lucide-react';

interface AdvicePanelProps {
  field: Field;
  isOptimizing: boolean;
  onOptimize: () => void;
  onRunIrrigation: (schedule: IrrigationSchedule) => void;
  isIrrigating: boolean;
  irrigationProgress: number;
}

export default function AdvicePanel({
  field,
  isOptimizing,
  onOptimize,
  onRunIrrigation,
  isIrrigating,
  irrigationProgress
}: AdvicePanelProps) {
  const schedule = field.activeSchedule;

  // Render a skeleton layout during Gemini query resolution
  if (isOptimizing) {
    return (
      <div className="bg-white border-4 border-slate-900 rounded-none p-6 flex flex-col h-full min-h-[400px] justify-between relative overflow-hidden shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]" id="advice-skeleton-panel">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-500" />
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-none bg-slate-50 border-2 border-slate-900">
              <Brain className="w-5 h-5 text-emerald-600 animate-pulse" />
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="h-4 bg-slate-100 border border-slate-200 rounded-none w-1/3 animate-pulse" />
              <div className="h-3 bg-slate-100 border border-slate-200 rounded-none w-1/2 animate-pulse" />
            </div>
          </div>

          <div className="p-4 bg-slate-50 border-2 border-slate-900 rounded-none space-y-3">
            <div className="h-3 bg-slate-200 rounded-none w-5/6 animate-pulse" />
            <div className="h-3 bg-slate-200 rounded-none w-4/5 animate-pulse" />
            <div className="h-3 bg-slate-200 rounded-none w-3/4 animate-pulse" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 border-2 border-slate-900 rounded-none space-y-2">
              <div className="h-2.5 bg-slate-200 rounded-none w-1/2 animate-pulse" />
              <div className="h-5 bg-slate-200 rounded-none w-3/4 animate-pulse" />
            </div>
            <div className="p-4 bg-slate-50 border-2 border-slate-900 rounded-none space-y-2">
              <div className="h-2.5 bg-slate-200 rounded-none w-1/2 animate-pulse" />
              <div className="h-5 bg-slate-200 rounded-none w-3/4 animate-pulse" />
            </div>
          </div>
        </div>

        <div className="text-center py-4 space-y-2">
          <p className="text-xs text-slate-900 font-black uppercase tracking-wide animate-bounce">Analyzing plant evapotranspiration models...</p>
          <p className="text-[10px] text-slate-500 font-mono font-bold">Running @google/genai & gemini-3.5-flash...</p>
        </div>
      </div>
    );
  }

  // Active irrigation progress display
  if (isIrrigating) {
    const totalWaterUsedThisCycle = schedule ? Math.round(schedule.recommendedAmount * field.size * (irrigationProgress / 100)) : 0;
    
    return (
      <div className="bg-white border-4 border-slate-900 rounded-none p-6 flex flex-col h-full min-h-[400px] justify-between relative overflow-hidden shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]" id="advice-irrigating-panel">
        <div className="absolute inset-0 bg-emerald-500/[0.01] pointer-events-none" />
        
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-none bg-emerald-100 border-2 border-slate-900">
              <Droplet className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-display text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-1.5">
                Precision Cycle Active
              </h3>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                Water delivery system online for <strong className="text-emerald-700">{field.name}</strong>
              </p>
            </div>
          </div>

          <div className="bg-slate-50 border-2 border-slate-900 p-5 rounded-none text-center space-y-4">
            <div className="relative inline-block mx-auto">
              {/* Circular progress meter */}
              <div className="w-24 h-24 rounded-full border-4 border-slate-900 bg-white flex items-center justify-center">
                <span className="text-xl font-mono font-black text-slate-900">{irrigationProgress}%</span>
              </div>
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1.5 rounded-none border-2 border-slate-900">
                <Clock className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 text-left">
              <div className="bg-white p-3 rounded-none border-2 border-slate-900">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wide">Delivered Volume</p>
                <p className="text-sm font-black text-slate-900 font-mono mt-0.5">{totalWaterUsedThisCycle.toLocaleString()} gal</p>
              </div>
              <div className="bg-white p-3 rounded-none border-2 border-slate-900">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wide">Avg Flow Rate</p>
                <p className="text-sm font-black text-slate-900 font-mono mt-0.5">4.2 gal/sec</p>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-500 font-mono font-bold uppercase">
              <span>Applying {field.method} irrigation</span>
              <span>{Math.round((schedule?.runDuration || 30) * (1 - irrigationProgress/100))} mins remaining</span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-none overflow-hidden border-2 border-slate-900">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${irrigationProgress}%` }}
              />
            </div>
          </div>
        </div>

        <p className="text-[10px] text-center text-slate-500 font-mono font-bold uppercase mt-4">
          Drippers and soil moisture sensors syncing in real-time. Do not close tab.
        </p>
      </div>
    );
  }

  // Not optimized yet state
  if (!schedule) {
    return (
      <div className="bg-white border-4 border-slate-900 rounded-none p-6 flex flex-col items-center justify-center text-center h-full min-h-[400px] shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]" id="advice-not-optimized-panel">
        <div className="p-4 rounded-none bg-emerald-50 border-2 border-slate-900 mb-5 relative group">
          <Brain className="w-10 h-10 text-emerald-600 group-hover:rotate-12 transition-transform duration-300" />
          <Sparkles className="w-4 h-4 text-emerald-500 absolute -top-1 -right-1 animate-pulse" />
        </div>
        
        <h3 className="font-display text-lg font-black text-slate-900 uppercase tracking-tight mb-1.5">
          Gemini Irrigation Advisory Engine
        </h3>
        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider max-w-sm mx-auto mb-6 leading-relaxed">
          Connect your hyper-local moisture sensors and upcoming climate forecasts to generate a custom, water-optimized night scheduler.
        </p>

        <button
          onClick={onOptimize}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white border-2 border-slate-900 px-5 py-2.5 rounded-none text-xs font-black tracking-widest uppercase transition duration-150 cursor-pointer shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]"
          id="btn-optimize-initial"
        >
          <Sparkles className="w-4 h-4" />
          Analyze & Optimize Schedule
        </button>
      </div>
    );
  }

  // Render the generated advice
  const totalWaterRequired = Math.round(schedule.recommendedAmount * field.size);
  const totalWaterSaved = Math.round(totalWaterRequired * (schedule.waterSavedPercentage / 100));

  return (
    <div className="bg-white border-4 border-slate-900 rounded-none p-6 flex flex-col h-full min-h-[400px] justify-between relative shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]" id="advice-complete-panel">
      
      {/* Scrollable Advice Details */}
      <div className="space-y-5 overflow-y-auto max-h-[460px] pr-1" id="advice-scroll-container">
        
        {/* Title */}
        <div className="flex items-start justify-between" id="advice-panel-title">
          <div>
            <span className="text-[10px] text-emerald-900 font-black bg-emerald-100 border-2 border-emerald-950 px-2 py-0.5 rounded-none uppercase tracking-wider">
              Gemini Optimized Plan
            </span>
            <h3 className="font-display text-lg font-black text-slate-900 uppercase tracking-tight mt-2">
              Adaptive Schedule: {field.name}
            </h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide mt-0.5">
              Generated {new Date(schedule.createdAt).toLocaleTimeString()}
            </p>
          </div>

          <button
            onClick={onOptimize}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-900 font-black border-2 border-slate-900 px-3 py-1.5 rounded-none text-[10px] tracking-wider uppercase transition cursor-pointer"
            id="btn-re-optimize"
          >
            <Sparkles className="w-3 h-3" />
            Recalculate
          </button>
        </div>

        {/* Core Metrics Grid */}
        <div className="grid grid-cols-2 gap-3" id="advice-metrics-grid">
          {/* Water Savings Rate Card */}
          <div className="bg-emerald-100 border-2 border-slate-900 p-3.5 rounded-none flex items-center justify-between text-emerald-950">
            <div>
              <p className="text-[10px] text-emerald-900 uppercase font-bold tracking-wide">Conserved Rate</p>
              <p className="text-2xl font-display font-black text-emerald-950 mt-0.5">{schedule.waterSavedPercentage}%</p>
            </div>
            <span className="p-1.5 bg-emerald-200 border border-emerald-950 rounded-none">
              <Zap className="w-4 h-4 text-emerald-900" />
            </span>
          </div>

          {/* Optimal Window Card */}
          <div className="bg-slate-50 border-2 border-slate-900 p-3.5 rounded-none flex items-center justify-between text-slate-900">
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wide">Target Window</p>
              <p className="text-xs font-mono font-black text-slate-900 mt-1">{schedule.bestTimeOfDay}</p>
            </div>
            <span className="p-1.5 bg-slate-100 border border-slate-900 rounded-none">
              <Clock className="w-4 h-4 text-sky-600" />
            </span>
          </div>
        </div>

        {/* Scientific Water Volume Statistics */}
        <div className="p-4 bg-slate-50 border-2 border-slate-900 rounded-none space-y-2.5" id="volume-statistics">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1">
              <Droplet className="w-3.5 h-3.5 text-sky-600" /> Volume Per Acre:
            </span>
            <span className="text-slate-900 font-mono font-black">{schedule.recommendedAmount.toLocaleString()} gal/Ac</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-bold uppercase tracking-wider">Total Run Duration:</span>
            <span className="text-slate-900 font-mono font-black">{schedule.runDuration} mins ({field.method})</span>
          </div>
          <div className="flex justify-between items-center text-xs pt-2 border-t-2 border-slate-200">
            <span className="text-slate-500 font-bold uppercase tracking-wider">Conserved Volume:</span>
            <span className="text-emerald-700 font-mono font-black">-{totalWaterSaved.toLocaleString()} gal</span>
          </div>
        </div>

        {/* Agronomic Rationale */}
        <div className="bg-emerald-50/50 border-2 border-slate-900 p-4 rounded-none" id="agronomic-rationale">
          <span className="text-[9px] text-emerald-900 uppercase tracking-widest font-black block mb-1.5">
            Agronomic AI Analysis
          </span>
          <p className="text-xs text-slate-800 leading-relaxed italic font-semibold">
            "{schedule.rationale}"
          </p>
        </div>

        {/* El Niño Mitigation Actions */}
        <div className="space-y-2.5" id="el-nino-strategies-section">
          <span className="text-[9px] text-slate-500 uppercase tracking-widest font-black block">
            Critical El Niño Crop Strategies
          </span>
          <div className="space-y-2">
            {schedule.elNinoStrategies.map((strategy, index) => (
              <div
                key={index}
                className="flex items-start gap-2.5 p-2.5 bg-white border-2 border-slate-900 rounded-none text-xs text-slate-800 hover:bg-slate-50 transition"
              >
                <span className="text-[10px] text-white font-black bg-slate-900 w-5 h-5 rounded-none flex items-center justify-center shrink-0">
                  {index + 1}
                </span>
                <span className="leading-normal font-medium">{strategy}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Soil Moisture Target projection */}
        <div className="p-3.5 bg-slate-50 border-2 border-slate-900 rounded-none" id="moisture-projection-bar">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-slate-500 font-bold uppercase tracking-wide">Estimated Moisture Target:</span>
            <span className="text-emerald-700 font-mono font-black">
              {field.sensorData.soilMoisture}% <ArrowRight className="inline w-3 h-3 mx-0.5" /> {schedule.moistureTargetAfter}%
            </span>
          </div>
          <div className="relative h-3 bg-slate-100 rounded-none overflow-hidden border-2 border-slate-900">
            {/* Current Moisture Portion */}
            <div
              className="absolute left-0 top-0 bottom-0 bg-sky-500"
              style={{ width: `${field.sensorData.soilMoisture}%` }}
            />
            {/* Targeted Boost Portion */}
            <div
              className="absolute top-0 bottom-0 bg-emerald-500/40 animate-pulse"
              style={{
                left: `${field.sensorData.soilMoisture}%`,
                width: `${Math.max(0, schedule.moistureTargetAfter - field.sensorData.soilMoisture)}%`
              }}
            />
          </div>
        </div>

      </div>

      {/* Manual Override Action Box */}
      <div className="mt-5 pt-4 border-t-2 border-slate-100" id="precision-valve-control-panel">
        <button
          onClick={() => onRunIrrigation(schedule)}
          className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white border-2 border-slate-900 py-3 rounded-none text-xs font-black tracking-widest uppercase transition cursor-pointer shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]"
          id="btn-run-irrigation"
        >
          <Droplet className="w-4 h-4 fill-current text-white" />
          Activate Precision Water Cycle
        </button>
      </div>

    </div>
  );
}
