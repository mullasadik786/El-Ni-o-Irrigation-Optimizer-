import React, { useState, useEffect } from 'react';
import { Field } from '../types';
import { 
  Calculator, 
  Cpu, 
  Droplet, 
  Leaf, 
  Info, 
  Sparkles, 
  Send, 
  Compass, 
  Radio, 
  CheckCircle, 
  AlertCircle, 
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  DollarSign,
  Sprout
} from 'lucide-react';

interface FarmersTechHubProps {
  selectedField: Field;
  onSprayFertilizer: (fieldId: string, ureaApplied: boolean) => void;
  fertilizerHistory: Record<string, { lastApplied: string; bagsSaved: number; efficiencyScore: number }>;
}

interface SynergyTech {
  id: string;
  name: string;
  category: string;
  waterReduction: number; // e.g. 0.30 for 30% reduction
  yieldBoost: number; // e.g. 0.25 for 25% boost
  description: string;
  icon: string;
  costPerAcre: number;
}

export default function FarmersTechHub({ 
  selectedField, 
  onSprayFertilizer,
  fertilizerHistory 
}: FarmersTechHubProps) {
  // Calculator States
  const [calcAcres, setCalcAcres] = useState<number>(selectedField.size);
  const [calcDays, setCalcDays] = useState<number>(30);
  const [wateringMethod, setWateringMethod] = useState<'sprinkler' | 'flood'>('sprinkler');

  // Drone Simulator States
  const [droneStatus, setDroneStatus] = useState<'idle' | 'taking_off' | 'scanning' | 'spraying' | 'landing' | 'completed'>('idle');
  const [droneProgress, setDroneProgress] = useState<number>(0);
  const [droneTelemetry, setDroneTelemetry] = useState({
    altitude: 0,
    speed: 0,
    payload: 100,
    battery: 100,
    coords: '0.0000° N, 0.0000° W'
  });
  const [scannedStressPoints, setScannedStressPoints] = useState<number>(0);

  // Synergy Tech Toggles
  const [activeTechs, setActiveTechs] = useState<string[]>(['drip']); // Drip active by default

  // Sync calcAcres when selectedField changes
  useEffect(() => {
    setCalcAcres(selectedField.size);
  }, [selectedField]);

  // Calculations for Water Savings
  // Sprinkler uses approx 30,000 gallons per acre per day in hot climate.
  // Flood uses approx 50,000 gallons per acre per day.
  // Drip uses approx 15,000 gallons (50% savings over sprinkler, 70% over flood).
  const waterRateTraditional = wateringMethod === 'flood' ? 45000 : 28000;
  const waterRateDrip = 13500;
  
  const traditionalWaterUsed = calcAcres * waterRateTraditional * calcDays;
  const dripWaterUsed = calcAcres * waterRateDrip * calcDays;
  const waterSaved = traditionalWaterUsed - dripWaterUsed;
  const costSaved = Math.round(waterSaved * 0.0035); // simulated irrigation cost per gallon

  // Drone Flight Loop simulation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (droneStatus !== 'idle' && droneStatus !== 'completed') {
      timer = setInterval(() => {
        setDroneProgress((prev) => {
          const next = prev + 5;
          
          // Telemetry simulation during progress
          if (next <= 20) {
            setDroneStatus('taking_off');
            setDroneTelemetry({
              altitude: Math.round((next / 20) * 12), // rises to 12m
              speed: Math.round((next / 20) * 8),
              payload: 100,
              battery: Math.max(92, 100 - Math.round(next * 0.1)),
              coords: `34.${Math.round(2045 + next * 3)}° N, -118.${Math.round(4812 - next * 2)}° W`
            });
          } else if (next <= 60) {
            setDroneStatus('scanning');
            setDroneTelemetry({
              altitude: 12,
              speed: 15,
              payload: 100,
              battery: Math.max(80, 100 - Math.round(next * 0.25)),
              coords: `34.${Math.round(2105 + next * 5)}° N, -118.${Math.round(4700 + next * 4)}° W`
            });
            // Simulate scanning crop stress spots
            if (next === 30) setScannedStressPoints(2);
            if (next === 50) setScannedStressPoints(4);
          } else if (next <= 90) {
            setDroneStatus('spraying');
            const sprayPercentage = (next - 60) / 30;
            setDroneTelemetry({
              altitude: 4, // lowers to spray Nano Urea closer
              speed: 6,
              payload: Math.round(100 - sprayPercentage * 90), // sprays 90% of payload
              battery: Math.max(68, 100 - Math.round(next * 0.3)),
              coords: `34.${Math.round(2405 - (next - 60) * 4)}° N, -118.${Math.round(4900 - (next - 60) * 3)}° W`
            });
          } else if (next < 100) {
            setDroneStatus('landing');
            setDroneTelemetry({
              altitude: Math.round(4 * (1 - (next - 90) / 10)),
              speed: 2,
              payload: 10,
              battery: Math.max(65, 100 - Math.round(next * 0.35)),
              coords: '34.2045° N, -118.4812° W'
            });
          } else {
            setDroneStatus('completed');
            setDroneProgress(100);
            setDroneTelemetry(prevTelemetry => ({
              ...prevTelemetry,
              altitude: 0,
              speed: 0,
              battery: 64,
              coords: 'Hangar Station Grounded'
            }));
            // Trigger fertilizer spray logic on main state
            onSprayFertilizer(selectedField.id, true);
            // Auto-enable Nano Urea in the Synergy Lab
            if (!activeTechs.includes('nanourea')) {
              setActiveTechs(prev => [...prev, 'nanourea']);
            }
            return 100;
          }
          return next;
        });
      }, 300);
    }
    return () => clearInterval(timer);
  }, [droneStatus, selectedField.id, activeTechs]);

  const handleResetDrone = () => {
    setDroneStatus('idle');
    setDroneProgress(0);
    setScannedStressPoints(0);
    setDroneTelemetry({
      altitude: 0,
      speed: 0,
      payload: 100,
      battery: 100,
      coords: 'Grounded'
    });
  };

  const currentFieldHistory = fertilizerHistory[selectedField.id] || null;

  // Synergy Lab Technologies List
  const availableTechnologies: SynergyTech[] = [
    {
      id: 'drip',
      name: 'Precision Micro-Drip',
      category: 'Irrigation',
      waterReduction: 0.50,
      yieldBoost: 0.25,
      description: 'Feeds water directly to target roots, eliminating runoff and evaporation.',
      icon: '💧',
      costPerAcre: 350
    },
    {
      id: 'hydrogel',
      name: 'Superabsorbent Hydrogels',
      category: 'Soil Amendment',
      waterReduction: 0.35,
      yieldBoost: 0.20,
      description: 'Eco-friendly starch polymers hold water in soil, releasing it under crop demand.',
      icon: '🧪',
      costPerAcre: 120
    },
    {
      id: 'nanourea',
      name: 'Nano Urea Foliar Spray',
      category: 'Fertilizer',
      waterReduction: 0.15,
      yieldBoost: 0.30,
      description: 'Nano-scale nitrogen particles sprayed on leaves. bypasses soil leaching and saves water.',
      icon: '🍃',
      costPerAcre: 80
    },
    {
      id: 'mycorrhizal',
      name: 'Mycorrhizal Fungi Inoculant',
      category: 'Bio-Stimulant',
      waterReduction: 0.25,
      yieldBoost: 0.22,
      description: 'Symbiotic root extensions that pull water from sub-layers, multiplying drought resilience.',
      icon: '🍄',
      costPerAcre: 45
    },
    {
      id: 'sap_flow',
      name: 'Plant Stem Sap-Flow Sensors',
      category: 'IoT Hardware',
      waterReduction: 0.20,
      yieldBoost: 0.15,
      description: 'Needle sensors read actual plant transpiration speed. Irrigates only at exact dehydration point.',
      icon: '📡',
      costPerAcre: 190
    },
    {
      id: 'laser_mulch',
      name: 'Bio-Degradable Straw Mulching',
      category: 'Moisture Guard',
      waterReduction: 0.30,
      yieldBoost: 0.12,
      description: 'Maintains uniform temperature and locks surface evaporation from harsh hot winds.',
      icon: '🌾',
      costPerAcre: 60
    }
  ];

  const handleToggleTech = (techId: string) => {
    setActiveTechs(prev => 
      prev.includes(techId) ? prev.filter(id => id !== techId) : [...prev, techId]
    );
  };

  // Calculations for Crop Yield and Water Synergy
  // Baseline stats per Crop Type
  const cropBaselines: Record<string, { baselineYield: number; unit: string; pricePerUnit: number }> = {
    'Almonds': { baselineYield: 1.1, unit: 'Tons', pricePerUnit: 3400 },
    'Avocados': { baselineYield: 4.8, unit: 'Tons', pricePerUnit: 2800 },
    'Alfalfa': { baselineYield: 7.5, unit: 'Tons', pricePerUnit: 290 },
    'Citrus': { baselineYield: 14.2, unit: 'Tons', pricePerUnit: 620 },
    'Grapes': { baselineYield: 5.5, unit: 'Tons', pricePerUnit: 1100 }
  };

  const cropMeta = cropBaselines[selectedField.crop] || { baselineYield: 5.0, unit: 'Tons', pricePerUnit: 1000 };
  
  // Calculate combined effects
  // Compounding water savings: Water Used = Baseline * (1 - tech1) * (1 - tech2) ...
  let waterMultiplier = 1.0;
  let totalYieldMultiplier = 1.0;
  let totalInstallCost = 0;

  availableTechnologies.forEach(tech => {
    if (activeTechs.includes(tech.id)) {
      waterMultiplier *= (1 - tech.waterReduction);
      totalYieldMultiplier += tech.yieldBoost;
      totalInstallCost += tech.costPerAcre * selectedField.size;
    }
  });

  // Keep water multiplier within physically logical limits
  if (waterMultiplier < 0.20) waterMultiplier = 0.20; // Max 80% total savings

  const simulatedSeasonWaterBaseline = selectedField.size * 320000; // Gallons per standard El Niño season per acre
  const seasonalWaterSaved = Math.round(simulatedSeasonWaterBaseline * (1 - waterMultiplier));
  
  const optimizedYieldPerAcre = cropMeta.baselineYield * totalYieldMultiplier;
  const totalOptimizedYield = optimizedYieldPerAcre * selectedField.size;
  const baselineTotalYield = cropMeta.baselineYield * selectedField.size;
  
  const additionalYield = totalOptimizedYield - baselineTotalYield;
  const financialGain = Math.round(additionalYield * cropMeta.pricePerUnit);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6" id="farmers-tech-hub">
      
      {/* 1. Drip Irrigation Calculator Section (Col span 6) */}
      <div className="xl:col-span-6 bg-white border-4 border-slate-900 p-5 flex flex-col justify-between shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]" id="drip-calculator-card">
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="p-2 bg-sky-100 border-2 border-slate-900">
              <Calculator className="w-5 h-5 text-sky-700" />
            </div>
            <div>
              <h3 className="font-display text-base font-black text-slate-900 uppercase tracking-tight">
                Drip Irrigation Water Saver
              </h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                Compare traditional flooding vs. micro-drip setups
              </p>
            </div>
          </div>

          <div className="space-y-4 my-4 p-4 bg-slate-50 border-2 border-slate-900" id="calculator-inputs">
            {/* Input fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-600 font-black uppercase tracking-wider block mb-1">
                  Active Area (Acres)
                </label>
                <input 
                  type="number"
                  min="1"
                  max="500"
                  value={calcAcres}
                  onChange={(e) => setCalcAcres(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full bg-white border-2 border-slate-900 px-3 py-1.5 text-xs text-slate-900 font-black focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-600 font-black uppercase tracking-wider block mb-1">
                  Duration (Days)
                </label>
                <input 
                  type="number"
                  min="1"
                  max="365"
                  value={calcDays}
                  onChange={(e) => setCalcDays(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full bg-white border-2 border-slate-900 px-3 py-1.5 text-xs text-slate-900 font-black focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-600 font-black uppercase tracking-wider block mb-1">
                Compare With Traditional Method
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setWateringMethod('sprinkler')}
                  className={`px-3 py-1.5 border-2 text-xs font-black uppercase tracking-wider cursor-pointer transition ${
                    wateringMethod === 'sprinkler' 
                      ? 'bg-slate-900 text-white border-slate-900' 
                      : 'bg-white text-slate-900 border-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Sprinkler Rainers
                </button>
                <button
                  type="button"
                  onClick={() => setWateringMethod('flood')}
                  className={`px-3 py-1.5 border-2 text-xs font-black uppercase tracking-wider cursor-pointer transition ${
                    wateringMethod === 'flood' 
                      ? 'bg-slate-900 text-white border-slate-900' 
                      : 'bg-white text-slate-900 border-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Canal Flooding
                </button>
              </div>
            </div>
          </div>

          {/* Results outputs */}
          <div className="grid grid-cols-3 gap-2.5 mt-4" id="calculator-results">
            <div className="bg-emerald-50 border-2 border-slate-900 p-2.5 text-center">
              <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider block">Total Traditional</span>
              <span className="text-xs font-mono font-black text-slate-900">{(traditionalWaterUsed / 1000).toFixed(0)}k gal</span>
            </div>
            <div className="bg-sky-50 border-2 border-slate-900 p-2.5 text-center">
              <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider block">Precision Drip</span>
              <span className="text-xs font-mono font-black text-slate-900">{(dripWaterUsed / 1000).toFixed(0)}k gal</span>
            </div>
            <div className="bg-emerald-100 border-2 border-emerald-950 p-2.5 text-center">
              <span className="text-[8px] text-emerald-900 font-black uppercase tracking-wider block">Net Saved</span>
              <span className="text-xs font-mono font-black text-emerald-950">{(waterSaved / 1000).toFixed(0)}k gal</span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t-2 border-slate-100 flex items-center justify-between text-xs font-bold uppercase tracking-wide">
          <span className="text-slate-500 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-sky-600" />
            Estimated savings rate:
          </span>
          <span className="text-emerald-700 font-black text-sm">
            {Math.round((waterSaved / traditionalWaterUsed) * 100)}% H₂O / ${costSaved.toLocaleString()} Saved
          </span>
        </div>
      </div>

      {/* 2. Drone Spraying & Nano Urea Simulator Section (Col span 6) */}
      <div className="xl:col-span-6 bg-white border-4 border-slate-900 p-5 flex flex-col justify-between shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]" id="nano-urea-drone-card">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-100 border-2 border-slate-900">
                <Cpu className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <h3 className="font-display text-base font-black text-slate-900 uppercase tracking-tight">
                  Nano Urea & Drone Sprayer
                </h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  Replace heavy chemical nitrogen with leaf-absorbing drone mist
                </p>
              </div>
            </div>
            
            {currentFieldHistory?.lastApplied && (
              <span className="bg-emerald-100 text-emerald-950 text-[9px] font-black uppercase tracking-wider border-2 border-slate-900 px-2 py-0.5">
                Active Nano Coating
              </span>
            )}
          </div>

          {/* Interactive Drone Radar Canvas */}
          <div className="bg-slate-950 border-2 border-slate-900 p-4 relative min-h-[175px] flex flex-col justify-between overflow-hidden" id="drone-radar-display">
            {/* Grid overlay */}
            <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 opacity-15 pointer-events-none">
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className="border border-emerald-500" />
              ))}
            </div>

            {/* Radar swept lines */}
            {droneStatus === 'scanning' && (
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/20 to-transparent h-12 w-full animate-pulse pointer-events-none" style={{ animationDuration: '2s' }} />
            )}

            {/* Drone graphic & state indicator */}
            {droneStatus === 'idle' ? (
              <div className="flex flex-col items-center justify-center py-6 text-center z-10">
                <Radio className="w-8 h-8 text-slate-600 animate-pulse mb-1.5" />
                <p className="text-[11px] font-mono text-emerald-500 font-bold uppercase tracking-wider">
                  UAV Mission Station Ready
                </p>
                <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                  Select <span className="text-emerald-400 font-bold">{selectedField.name}</span> to deploy
                </p>
              </div>
            ) : (
              <div className="z-10 flex flex-col justify-between h-full space-y-3 font-mono text-[10px]">
                {/* Header status */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    UAV STATUS: {droneStatus.toUpperCase()}
                  </span>
                  <span className="text-slate-400 font-bold">TASK PROGRESS: {droneProgress}%</span>
                </div>

                {/* Drone and Field animation area */}
                <div className="relative h-16 w-full flex items-center justify-center">
                  {/* Virtual Drone */}
                  <div 
                    className="absolute transition-all duration-300 flex flex-col items-center"
                    style={{
                      left: `${droneProgress * 0.8}%`,
                      transform: 'translateX(-50%)',
                      bottom: droneStatus === 'spraying' ? '12px' : '36px'
                    }}
                  >
                    {/* Drone arms and rotors */}
                    <div className="flex gap-4 items-center">
                      <span className={`w-3.5 h-0.5 bg-slate-400 ${droneStatus !== 'completed' ? 'animate-spin' : ''}`} style={{ animationDuration: '0.15s' }} />
                      <div className="w-7 h-4 bg-emerald-500 border border-white flex items-center justify-center text-[7px] font-bold text-slate-950">
                        UAV
                      </div>
                      <span className={`w-3.5 h-0.5 bg-slate-400 ${droneStatus !== 'completed' ? 'animate-spin' : ''}`} style={{ animationDuration: '0.15s' }} />
                    </div>
                    {/* Droplets coming out during spraying */}
                    {droneStatus === 'spraying' && (
                      <div className="flex flex-col items-center mt-1 space-y-0.5 animate-bounce">
                        <Droplet className="w-2 h-2 text-emerald-400 fill-current" />
                        <span className="text-[6px] text-emerald-400 font-black">NANO-COAT</span>
                      </div>
                    )}
                  </div>

                  {/* Scanned crop stressors */}
                  {scannedStressPoints > 0 && (
                    <div className="absolute left-1/3 top-6 bg-red-900/40 border border-red-500 text-[8px] text-red-200 px-1 py-0.5 flex items-center gap-1">
                      <AlertCircle className="w-2 h-2" />
                      {scannedStressPoints} Nitrogen Deficit Zones Detected
                    </div>
                  )}
                </div>

                {/* Live Telemetry Footer */}
                <div className="grid grid-cols-4 gap-2 border-t border-slate-800 pt-1.5 text-[8px] text-slate-400">
                  <div>
                    <span className="block text-slate-600">ALTITUDE</span>
                    <span className="font-bold text-white font-mono">{droneTelemetry.altitude} m</span>
                  </div>
                  <div>
                    <span className="block text-slate-600">SPEED</span>
                    <span className="font-bold text-white font-mono">{droneTelemetry.speed} m/s</span>
                  </div>
                  <div>
                    <span className="block text-slate-600">NANO PAYLOAD</span>
                    <span className="font-bold text-emerald-400 font-mono">{droneTelemetry.payload}%</span>
                  </div>
                  <div>
                    <span className="block text-slate-600">BATTERY</span>
                    <span className="font-bold text-white font-mono">{droneTelemetry.battery}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Trigger Row */}
          <div className="mt-4 flex items-center justify-between gap-3" id="drone-action-triggers">
            {droneStatus === 'idle' ? (
              <button
                onClick={() => setDroneStatus('taking_off')}
                className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white border-2 border-slate-900 py-2.5 text-xs font-black uppercase tracking-widest transition cursor-pointer shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]"
                id="btn-launch-drone"
              >
                <Send className="w-4 h-4" />
                Launch Nano Spray Drone
              </button>
            ) : droneStatus === 'completed' ? (
              <div className="w-full flex gap-2">
                <div className="flex-1 bg-slate-50 border-2 border-slate-900 px-3 py-2 text-xs font-black uppercase tracking-tight text-slate-900 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  Spray Mission Completed on {selectedField.name}!
                </div>
                <button
                  onClick={handleResetDrone}
                  className="bg-white hover:bg-slate-100 text-slate-900 border-2 border-slate-900 px-4 py-2 text-xs font-black uppercase tracking-wider cursor-pointer"
                >
                  Reset Station
                </button>
              </div>
            ) : (
              <div className="w-full h-11 bg-slate-100 border-2 border-slate-900 flex items-center justify-center">
                <span className="text-xs font-mono font-black text-slate-900 animate-pulse flex items-center gap-1.5">
                  <Compass className="w-4 h-4 animate-spin" />
                  Mission in progress... {droneProgress}%
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Nutritional & ecological benefits feedback */}
        <div className="mt-4 pt-3 border-t-2 border-slate-100 grid grid-cols-2 gap-4 text-[10px] text-slate-500 font-bold uppercase tracking-wide">
          <div>
            <span className="block text-slate-400">Nutrient Efficiency</span>
            <strong className="text-emerald-700 font-black text-xs">
              {currentFieldHistory ? `${currentFieldHistory.efficiencyScore}% (Leaf-Absorbed)` : 'Normal (30% Soil Loss)'}
            </strong>
          </div>
          <div>
            <span className="block text-slate-400">Conventional Bags Replaced</span>
            <strong className="text-slate-900 font-black text-xs">
              {currentFieldHistory ? `${currentFieldHistory.bagsSaved} Bags Saved (Runoff Guarded)` : '0 Bags Saved'}
            </strong>
          </div>
        </div>
      </div>

      {/* NEW INTERACTIVE SYNERGY LAB SECTION (Col span 12) */}
      <div className="xl:col-span-12 bg-white border-4 border-slate-900 p-5 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]" id="synergy-tech-lab">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between border-b-4 border-slate-900 pb-4 mb-5 gap-4">
          <div>
            <h3 className="font-display text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600 animate-pulse" />
              Crop Yield & Water Saver Synergy Lab
            </h3>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-0.5">
              Activate multiple precision technologies to simulate combined yield boost and water retention.
            </p>
          </div>
          <div className="bg-emerald-100 border-2 border-slate-900 px-3 py-1.5 text-xs text-slate-900 font-black uppercase tracking-wide flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-800" />
            Field Target: <span className="text-emerald-950 font-black underline">{selectedField.name} ({selectedField.crop})</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Tech Toggles List (Span 2) */}
          <div className="lg:col-span-2 space-y-3" id="tech-selector-grid">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2">
              Select Smart Technologies to Combine:
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availableTechnologies.map(tech => {
                const isActive = activeTechs.includes(tech.id);
                return (
                  <div 
                    key={tech.id} 
                    onClick={() => handleToggleTech(tech.id)}
                    className={`p-3 border-2 cursor-pointer transition flex flex-col justify-between ${
                      isActive 
                        ? 'bg-emerald-50 border-emerald-900 shadow-[2px_2px_0px_0px_rgba(16,185,129,1)]' 
                        : 'bg-white border-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xl">{tech.icon}</span>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 border ${
                          isActive 
                            ? 'bg-emerald-200 text-emerald-950 border-emerald-900' 
                            : 'bg-slate-100 text-slate-500 border-slate-300'
                        }`}>
                          {tech.category}
                        </span>
                      </div>
                      <h5 className="font-display text-xs font-black text-slate-900 uppercase tracking-wide">
                        {tech.name}
                      </h5>
                      <p className="text-[10px] text-slate-600 leading-tight mt-1 font-medium">
                        {tech.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-dashed border-slate-300 flex items-center justify-between text-[9px] font-mono font-bold">
                      <span className="text-sky-700">💧 -{(tech.waterReduction * 100)}% Water</span>
                      <span className="text-emerald-700">📈 +{(tech.yieldBoost * 100)}% Yield</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Real-time Yield Simulation Board (Span 1) */}
          <div className="bg-slate-50 border-4 border-slate-900 p-4 flex flex-col justify-between shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]" id="synergy-metrics-card">
            <div>
              <div className="flex items-center gap-1.5 mb-3">
                <Sprout className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Simulation Outputs
                </h4>
              </div>

              {/* Meter graphic */}
              <div className="bg-white border-2 border-slate-900 p-3.5 text-center my-3 relative overflow-hidden">
                <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider block">Yield Synergy Multiplier</span>
                <span className="text-2xl font-mono font-black text-emerald-900 block my-1">
                  {totalYieldMultiplier.toFixed(2)}x
                </span>
                <div className="w-full bg-slate-200 h-2 border border-slate-900 mt-2">
                  <div 
                    className="bg-emerald-500 h-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, (totalYieldMultiplier - 1.0) * 100)}%` }}
                  />
                </div>
                <span className="text-[9px] text-emerald-700 font-black uppercase block mt-1.5">
                  +{Math.round((totalYieldMultiplier - 1.0) * 100)}% Yield Surge
                </span>
              </div>

              <div className="space-y-2 text-xs font-bold uppercase tracking-wide mt-4">
                <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
                  <span className="text-slate-500 text-[10px]">Crop Baseline:</span>
                  <span className="text-slate-900 font-black">{baselineTotalYield.toFixed(1)} {cropMeta.unit}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
                  <span className="text-emerald-700 text-[10px]">Optimized Yield:</span>
                  <span className="text-emerald-950 font-black">{totalOptimizedYield.toFixed(1)} {cropMeta.unit}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
                  <span className="text-sky-700 text-[10px]">Seasonal Water Saved:</span>
                  <span className="text-sky-950 font-black font-mono">{seasonalWaterSaved.toLocaleString()} Gal</span>
                </div>
                <div className="flex justify-between items-center pb-1.5 text-emerald-800">
                  <span className="text-[10px] font-black">Net Extra Yield Income:</span>
                  <span className="font-black text-sm font-mono">+${financialGain.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t-2 border-slate-200" id="tech-lab-footer">
              <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-mono font-black uppercase">
                <DollarSign className="w-3.5 h-3.5 text-slate-700" />
                Est. Setup Cost: ${totalInstallCost.toLocaleString()}
              </div>
              <p className="text-[8px] text-slate-400 mt-1 leading-normal font-bold">
                *Simulated projections are calculated using crop-coefficient evapotranspiration trends during high El Niño dry wind stress.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* 3. Water-Saving Tech Best Practices Reference Box (Col span 12) */}
      <div className="xl:col-span-12 bg-white border-4 border-slate-900 p-5 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]" id="save-water-tech-directory">
        <h3 className="font-display text-base font-black text-slate-900 uppercase tracking-tight mb-4 flex items-center gap-2">
          <Leaf className="w-5 h-5 text-emerald-600" />
          El Niño Water Conservation & Climate-Tech Guidebook
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="tech-guidebook-grid">
          {/* Guide Card 1 */}
          <div className="p-4 bg-slate-50 border-2 border-slate-900 flex flex-col justify-between" id="guide-card-drip">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] text-sky-900 font-black bg-sky-100 border border-sky-950 px-1.5 py-0.5 uppercase">
                  Drip Irrigation
                </span>
                <span className="text-[10px] font-mono font-black text-emerald-700">Save up to 60%</span>
              </div>
              <h4 className="font-display text-xs font-black text-slate-900 uppercase tracking-wide mb-1">
                Root-Zone Target Delivery
              </h4>
              <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                Eliminates evaporation. By feeding water slowly and directly to the crop's roots, capillary action secures absorption with zero waste or ponding, crucial for high solar radiation days.
              </p>
            </div>
            <div className="mt-3 text-[9px] text-slate-500 font-black uppercase flex items-center justify-between">
              <span>Soil Evaporative Lock</span>
              <span className="text-slate-900">Optimal</span>
            </div>
          </div>

          {/* Guide Card 2 */}
          <div className="p-4 bg-slate-50 border-2 border-slate-900 flex flex-col justify-between" id="guide-card-urea">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] text-emerald-900 font-black bg-emerald-100 border border-emerald-950 px-1.5 py-0.5 uppercase">
                  Nano Urea
                </span>
                <span className="text-[10px] font-mono font-black text-emerald-700">90% Absorption</span>
              </div>
              <h4 className="font-display text-xs font-black text-slate-900 uppercase tracking-wide mb-1">
                Next-Gen Foliar Spraying
              </h4>
              <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                Liquid nitrogen nanoparticles are sprayed directly on the crop leaves rather than the soil. This prevents groundwater contamination and safeguards soil health from extreme salt loading.
              </p>
            </div>
            <div className="mt-3 text-[9px] text-slate-500 font-black uppercase flex items-center justify-between">
              <span>Runoff Prevention</span>
              <span className="text-slate-900">Grounded Shield</span>
            </div>
          </div>

          {/* Guide Card 3 */}
          <div className="p-4 bg-slate-50 border-2 border-slate-900 flex flex-col justify-between" id="guide-card-drone">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] text-purple-900 font-black bg-purple-100 border border-purple-950 px-1.5 py-0.5 uppercase">
                  Drone Technology
                </span>
                <span className="text-[10px] font-mono font-black text-emerald-700">Live Stress Index</span>
              </div>
              <h4 className="font-display text-xs font-black text-slate-900 uppercase tracking-wide mb-1">
                Multispectral Aerial Analytics
              </h4>
              <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                Saves water by detecting early signs of crop dehydration and stress from the skies before it is visible to the human eye. Target your irrigation precisely instead of generic grid-wide watering.
              </p>
            </div>
            <div className="mt-3 text-[9px] text-slate-500 font-black uppercase flex items-center justify-between">
              <span>Dehydration Warning</span>
              <span className="text-slate-900">Sub-meter Resolution</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
