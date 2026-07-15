import React, { useState, useEffect } from 'react';
import { Field, SensorData, ClimateForecast, IrrigationSchedule, OptimizationResponse } from './types';
import FieldsList from './components/FieldsList';
import SensorSuite from './components/SensorSuite';
import WeatherPanel from './components/WeatherPanel';
import AdvicePanel from './components/AdvicePanel';
import ChartsPanel from './components/ChartsPanel';
import AddFieldModal from './components/AddFieldModal';
import FarmersTechHub from './components/FarmersTechHub';
import { Sprout, ShieldAlert, Droplets, Trophy, Waves, Flame, HelpCircle } from 'lucide-react';

// Pre-defined 5-Day Climate Forecast Scenarios under Super El Niño conditions
const weatherForecastScenarios: Record<string, ClimateForecast[]> = {
  extreme: [
    { day: 'Wed', temp: 41, humidity: 12, condition: 'Heatwave', precipitationProbability: 0 },
    { day: 'Thu', temp: 42, humidity: 11, condition: 'Heatwave', precipitationProbability: 0 },
    { day: 'Fri', temp: 40, humidity: 15, condition: 'Heatwave', precipitationProbability: 5 },
    { day: 'Sat', temp: 39, humidity: 18, condition: 'Sunny', precipitationProbability: 10 },
    { day: 'Sun', temp: 38, humidity: 22, condition: 'Sunny', precipitationProbability: 15 },
  ],
  winds: [
    { day: 'Wed', temp: 38, humidity: 8, condition: 'Dry Winds', precipitationProbability: 0 },
    { day: 'Thu', temp: 39, humidity: 7, condition: 'Dry Winds', precipitationProbability: 0 },
    { day: 'Fri', temp: 37, humidity: 10, condition: 'Dry Winds', precipitationProbability: 0 },
    { day: 'Sat', temp: 35, humidity: 14, condition: 'Sunny', precipitationProbability: 5 },
    { day: 'Sun', temp: 34, humidity: 18, condition: 'Sunny', precipitationProbability: 10 },
  ],
  torrential: [
    { day: 'Wed', temp: 32, humidity: 75, condition: 'Overcast', precipitationProbability: 40 },
    { day: 'Thu', temp: 30, humidity: 90, condition: 'Sudden Shower', precipitationProbability: 85 },
    { day: 'Fri', temp: 31, humidity: 85, condition: 'Sudden Shower', precipitationProbability: 70 },
    { day: 'Sat', temp: 33, humidity: 60, condition: 'Sunny', precipitationProbability: 20 },
    { day: 'Sun', temp: 34, humidity: 55, condition: 'Sunny', precipitationProbability: 15 },
  ],
  normal: [
    { day: 'Wed', temp: 24, humidity: 62, condition: 'Sunny', precipitationProbability: 10 },
    { day: 'Thu', temp: 25, humidity: 60, condition: 'Sunny', precipitationProbability: 15 },
    { day: 'Fri', temp: 26, humidity: 58, condition: 'Sunny', precipitationProbability: 5 },
    { day: 'Sat', temp: 23, humidity: 65, condition: 'Overcast', precipitationProbability: 25 },
    { day: 'Sun', temp: 25, humidity: 61, condition: 'Sunny', precipitationProbability: 10 },
  ]
};

// Initial Farm Zones Seed Data
const initialFields: Field[] = [
  {
    id: 'field-1',
    name: 'North Almond Grove',
    crop: 'Almonds',
    soil: 'Sandy',
    method: 'Drip',
    size: 45,
    sensorData: {
      soilMoisture: 22,
      airTemp: 41,
      humidity: 12,
      windSpeed: 24,
      solarRadiation: 940,
      soilTemp: 34
    }
  },
  {
    id: 'field-2',
    name: 'Valley Vineyards',
    crop: 'Wine Grapes',
    soil: 'Loamy',
    method: 'Drip',
    size: 80,
    sensorData: {
      soilMoisture: 33,
      airTemp: 37,
      humidity: 16,
      windSpeed: 12,
      solarRadiation: 860,
      soilTemp: 29
    }
  },
  {
    id: 'field-3',
    name: 'South Maize Field',
    crop: 'Corn',
    soil: 'Clayey',
    method: 'Sprinkler',
    size: 110,
    sensorData: {
      soilMoisture: 18,
      airTemp: 36,
      humidity: 19,
      windSpeed: 28,
      solarRadiation: 780,
      soilTemp: 27
    }
  },
  {
    id: 'field-4',
    name: 'Delta Organic Lettuce',
    crop: 'Lettuce',
    soil: 'Loamy',
    method: 'Sprinkler',
    size: 15,
    sensorData: {
      soilMoisture: 42,
      airTemp: 31,
      humidity: 34,
      windSpeed: 14,
      solarRadiation: 620,
      soilTemp: 23
    }
  },
  {
    id: 'field-5',
    name: 'Ridge Avocado Patch',
    crop: 'Avocados',
    soil: 'Sandy',
    method: 'Drip',
    size: 30,
    sensorData: {
      soilMoisture: 15,
      airTemp: 42,
      humidity: 11,
      windSpeed: 16,
      solarRadiation: 960,
      soilTemp: 36
    }
  }
];

export default function App() {
  const [fields, setFields] = useState<Field[]>(initialFields);
  const [selectedFieldId, setSelectedFieldId] = useState<string>('field-1');
  const [activeScenario, setActiveScenario] = useState<string>('extreme');
  const [forecast, setForecast] = useState<ClimateForecast[]>(weatherForecastScenarios.extreme);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [isAddFieldOpen, setIsAddFieldOpen] = useState<boolean>(false);
  const [totalWaterSavedAcrossFarm, setTotalWaterSavedAcrossFarm] = useState<number>(145000); // Baseline simulated savings tally

  // Fertilizer spraying persistence (Nano Urea drone applications)
  const [fertilizerHistory, setFertilizerHistory] = useState<Record<string, { lastApplied: string; bagsSaved: number; efficiencyScore: number }>>({});

  const handleSprayFertilizer = (fieldId: string, ureaApplied: boolean) => {
    if (ureaApplied) {
      const fieldObj = fields.find(f => f.id === fieldId);
      const size = fieldObj ? fieldObj.size : 10;
      const bagsSaved = Math.max(1, Math.round(size / 2));
      setFertilizerHistory(prev => ({
        ...prev,
        [fieldId]: {
          lastApplied: new Date().toLocaleTimeString(),
          bagsSaved,
          efficiencyScore: 92
        }
      }));
    }
  };

  // Irrigation Delivery States (Valves simulation)
  const [isIrrigating, setIsIrrigating] = useState<boolean>(false);
  const [irrigationProgress, setIrrigationProgress] = useState<number>(0);
  const [irrigatingFieldId, setIrrigatingFieldId] = useState<string | null>(null);

  const selectedField = fields.find((f) => f.id === selectedFieldId) || fields[0];

  // Adjust current weather forecast and active sensors when a user switches weather scenarios
  const handleSelectScenario = (scenarioKey: string) => {
    setActiveScenario(scenarioKey);
    const selectedForecast = weatherForecastScenarios[scenarioKey] || weatherForecastScenarios.extreme;
    setForecast(selectedForecast);

    // Dynamic environmental sensor updates across all fields to mirror weather shift
    const nextTemp = selectedForecast[1].temp;
    const nextHumidity = selectedForecast[1].humidity;
    const nextCondition = selectedForecast[1].condition;

    setFields((prev) =>
      prev.map((field) => {
        let moistureDelta = 0;
        let windSpeed = field.sensorData.windSpeed;
        let solarRadiation = field.sensorData.solarRadiation;

        if (nextCondition === 'Heatwave') {
          moistureDelta = -10;
          windSpeed = 22;
          solarRadiation = 950;
        } else if (nextCondition === 'Dry Winds') {
          moistureDelta = -12;
          windSpeed = 44;
          solarRadiation = 840;
        } else if (nextCondition === 'Sudden Shower') {
          moistureDelta = 35;
          windSpeed = 16;
          solarRadiation = 150;
        } else {
          moistureDelta = -2;
          windSpeed = 10;
          solarRadiation = 450;
        }

        const nextMoisture = Math.max(5, Math.min(95, field.sensorData.soilMoisture + moistureDelta));
        return {
          ...field,
          sensorData: {
            ...field.sensorData,
            soilMoisture: nextMoisture,
            airTemp: nextTemp + (field.crop === 'Ridge Avocado Patch' ? 1 : 0), // Avocado patch is high ridge
            humidity: nextHumidity,
            windSpeed,
            solarRadiation,
            soilTemp: Math.max(15, Math.min(45, Math.round(nextTemp * 0.85)))
          }
        };
      })
    );
  };

  // Sync state change from the sliders
  const handleSensorChange = (updatedSensor: SensorData) => {
    setFields((prev) =>
      prev.map((f) => (f.id === selectedFieldId ? { ...f, sensorData: updatedSensor } : f))
    );
  };

  // AI Irrigation Optimization Service Call
  const handleOptimizeIrrigation = async () => {
    setIsOptimizing(true);
    try {
      const response = await fetch('/api/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          field: selectedField,
          forecast: forecast,
        }),
      });

      const data: OptimizationResponse & { isFallback?: boolean } = await response.json();

      if (data.success && data.schedule) {
        setFields((prev) =>
          prev.map((f) =>
            f.id === selectedFieldId
              ? {
                  ...f,
                  activeSchedule: data.schedule,
                  lastOptimizedAt: new Date().toISOString()
                }
              : f
          )
        );
      } else {
        console.error("Optimization failed:", data.error);
      }
    } catch (err) {
      console.error("Error communicating with optimization API:", err);
    } finally {
      setIsOptimizing(false);
    }
  };

  // Physical irrigation valve delivery loop
  const handleRunIrrigation = (schedule: IrrigationSchedule) => {
    setIsIrrigating(true);
    setIrrigatingFieldId(selectedFieldId);
    setIrrigationProgress(0);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isIrrigating && irrigationProgress < 100) {
      interval = setInterval(() => {
        setIrrigationProgress((prev) => {
          if (prev >= 100) {
            setIsIrrigating(false);
            
            // Post-watering success updates: increment moisture and add water savings metrics
            setFields((prevFields) =>
              prevFields.map((f) => {
                if (f.id === irrigatingFieldId && f.activeSchedule) {
                  // Push soil moisture directly up to target moisture percentage
                  const targetMoisture = f.activeSchedule.moistureTargetAfter;
                  const savingsVolume = Math.round(
                    f.activeSchedule.recommendedAmount * f.size * (f.activeSchedule.waterSavedPercentage / 100)
                  );
                  
                  // Accumulate total saved water across manual runs
                  setTotalWaterSavedAcrossFarm((prevTally) => prevTally + savingsVolume);
                  
                  return {
                    ...f,
                    sensorData: {
                      ...f.sensorData,
                      soilMoisture: targetMoisture,
                      soilTemp: Math.max(18, f.sensorData.soilTemp - 4) // Cooling factor of water application
                    }
                  };
                }
                return f;
              })
            );

            setIrrigatingFieldId(null);
            return 100;
          }
          return prev + 10;
        });
      }, 400); // Slower progress step to make simulation satisfying and visible
    }
    return () => clearInterval(interval);
  }, [isIrrigating, irrigationProgress, irrigatingFieldId]);

  // Handle dynamic additions of new fields
  const handleAddField = (newFieldData: Omit<Field, 'id' | 'sensorData'>) => {
    const newField: Field = {
      ...newFieldData,
      id: `field-${Date.now()}`,
      sensorData: {
        soilMoisture: 35,
        airTemp: 32,
        humidity: 30,
        windSpeed: 12,
        solarRadiation: 500,
        soilTemp: 25
      }
    };
    setFields((prev) => [...prev, newField]);
    setSelectedFieldId(newField.id);
  };

  // Dynamic alert compiler: Count fields suffering under drought stress (< 25% moisture) or heat threat (> 38°C)
  const compileAlerts = () => {
    const alerts: string[] = [];
    fields.forEach((f) => {
      if (f.sensorData.soilMoisture < 25) {
        alerts.push(`${f.name}: Severe Moisture Depletion (${f.sensorData.soilMoisture}%)`);
      }
      if (f.sensorData.airTemp >= 40) {
        alerts.push(`${f.name}: Critical High Temperature (${f.sensorData.airTemp}°C)`);
      }
    });
    return alerts;
  };

  const activeAlerts = compileAlerts();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans" id="app-root-container">
      
      {/* Top Header / Stats Bar */}
      <header className="border-b-4 border-slate-900 bg-white sticky top-0 z-40 shadow-[0_4px_0_0_rgba(15,23,42,0.05)]" id="app-header">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500 border-2 border-slate-900 rounded-none shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
              <Waves className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-display text-lg font-black tracking-tight text-slate-900 uppercase flex items-center gap-2">
                El Niño Irrigation Optimizer
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-none bg-red-100 text-red-900 border-2 border-slate-900">
                  Super El Niño Stage 3
                </span>
              </h1>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-0.5">Climate-Adaptive Agricultural Water Conservation Core</p>
            </div>
          </div>

          {/* Aggregate Stats */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-mono" id="stats-ribbon">
            {/* Fields Monitored */}
            <div className="bg-white border-2 border-slate-900 rounded-none px-3.5 py-1.5 flex items-center gap-2.5 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
              <Sprout className="w-4 h-4 text-emerald-600" />
              <div>
                <p className="text-[9px] text-slate-500 font-bold uppercase">MONITORED</p>
                <p className="font-black text-slate-900">{fields.length} Zones</p>
              </div>
            </div>

            {/* Total Water Saved */}
            <div className="bg-emerald-100 border-2 border-slate-900 rounded-none px-3.5 py-1.5 flex items-center gap-2.5 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
              <Trophy className="w-4 h-4 text-emerald-800" />
              <div>
                <p className="text-[9px] text-emerald-800 font-bold uppercase">SAVED WATER</p>
                <p className="font-black text-emerald-950 font-mono">
                  {totalWaterSavedAcrossFarm.toLocaleString()} gal
                </p>
              </div>
            </div>

            {/* Active System Alerts */}
            <div className={`rounded-none px-3.5 py-1.5 flex items-center gap-2.5 border-2 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] ${
              activeAlerts.length > 0 
                ? 'bg-red-100 text-red-950 border-red-900 animate-pulse font-black' 
                : 'bg-white text-slate-900 border-slate-900'
            }`}>
              <ShieldAlert className="w-4 h-4" />
              <div>
                <p className="text-[9px] text-slate-500 font-bold uppercase">RISK STATUS</p>
                <p className="font-black font-mono">
                  {activeAlerts.length > 0 ? `${activeAlerts.length} Alerts` : 'System Safe'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Flashing Alerts Banner (If under severe stress) */}
      {activeAlerts.length > 0 && (
        <div className="bg-red-500 border-b-4 border-slate-900 py-2.5 text-center text-xs text-white px-4 font-black uppercase tracking-wider" id="alerts-banner">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 flex-wrap">
            <Flame className="w-4 h-4 animate-bounce" />
            <span>Active Drought Alarms:</span>
            <span className="text-white font-mono text-[11px] bg-red-700/55 px-2 py-0.5 border border-slate-900">
              {activeAlerts.slice(0, 2).join(' | ')}
              {activeAlerts.length > 2 ? ` (+${activeAlerts.length - 2} more)` : ''}
            </span>
          </div>
        </div>
      )}

      {/* Main Content Layout Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-6" id="dashboard-content">
        
        {/* Top Segment: Forecaster Simulator */}
        <section id="weather-forecast-section">
          <WeatherPanel
            forecast={forecast}
            activeScenario={activeScenario}
            onSelectScenario={handleSelectScenario}
          />
        </section>

        {/* Middle Segment: Core Monitoring Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-5" id="monitoring-grid">
          {/* Left Column: Agricultural Zones Selector */}
          <div className="lg:col-span-3 h-full" id="col-zones-selector">
            <FieldsList
              fields={fields}
              selectedFieldId={selectedFieldId}
              onSelectField={setSelectedFieldId}
              onOpenAddField={() => setIsAddFieldOpen(true)}
            />
          </div>

          {/* Middle Column: Hyper-Local Telemetry Suite */}
          <div className="lg:col-span-5 h-full" id="col-sensor-telemetry">
            <SensorSuite
              field={selectedField}
              onSensorChange={handleSensorChange}
            />
          </div>

          {/* Right Column: AI Advisory Board & Scheduler */}
          <div className="lg:col-span-4 h-full" id="col-ai-advisory">
            <AdvicePanel
              field={selectedField}
              isOptimizing={isOptimizing}
              onOptimize={handleOptimizeIrrigation}
              onRunIrrigation={handleRunIrrigation}
              isIrrigating={isIrrigating}
              irrigationProgress={irrigationProgress}
            />
          </div>
        </section>

        {/* Climate-Tech & Advanced Practice Hub */}
        <section className="pt-2" id="farmers-tech-hub-section">
          <FarmersTechHub 
            selectedField={selectedField}
            onSprayFertilizer={handleSprayFertilizer}
            fertilizerHistory={fertilizerHistory}
          />
        </section>

        {/* Bottom Segment: Analytics Visualizer */}
        <section className="pt-2" id="analytics-section">
          <ChartsPanel field={selectedField} />
        </section>

      </main>

      {/* Footer Branding */}
      <footer className="border-t-4 border-slate-900 bg-white py-6 mt-8" id="dashboard-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p className="flex items-center gap-1 font-bold text-slate-600 uppercase tracking-wide">
            <Sprout className="w-4 h-4 text-emerald-600" />
            Adaptive Micro-Irrigation Core — Powered by Google AI Studio Build
          </p>
          <p className="font-mono font-bold text-slate-500 uppercase tracking-wider">
            Telemetry Feed Active — ISO 14046 Standard compliant
          </p>
        </div>
      </footer>

      {/* Add Field / Zone Provisioning Drawer Modal */}
      <AddFieldModal
        isOpen={isAddFieldOpen}
        onClose={() => setIsAddFieldOpen(false)}
        onAdd={handleAddField}
      />

    </div>
  );
}
