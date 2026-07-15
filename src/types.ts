export type CropType = 'Almonds' | 'Wine Grapes' | 'Corn' | 'Lettuce' | 'Avocados';
export type SoilType = 'Sandy' | 'Loamy' | 'Clayey';
export type IrrigationMethod = 'Drip' | 'Sprinkler' | 'Flood';

export interface Field {
  id: string;
  name: string;
  crop: CropType;
  soil: SoilType;
  method: IrrigationMethod;
  size: number; // in acres
  sensorData: SensorData;
  activeSchedule?: IrrigationSchedule;
  lastOptimizedAt?: string;
}

export interface SensorData {
  soilMoisture: number; // %
  airTemp: number; // °C
  humidity: number; // %
  windSpeed: number; // km/h
  solarRadiation: number; // W/m²
  soilTemp: number; // °C
}

export interface ClimateForecast {
  day: string;
  temp: number;
  humidity: number;
  condition: 'Sunny' | 'Heatwave' | 'Dry Winds' | 'Sudden Shower' | 'Overcast';
  precipitationProbability: number; // %
}

export interface IrrigationSchedule {
  recommendedAmount: number; // Gallons per acre
  runDuration: number; // minutes
  bestTimeOfDay: string; // e.g. "02:00 AM - 04:00 AM"
  waterSavedPercentage: number; // %
  rationale: string;
  elNinoStrategies: string[];
  moistureTargetAfter: number; // %
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  createdAt: string;
}

export interface OptimizationResponse {
  success: boolean;
  schedule: IrrigationSchedule;
  error?: string;
}
