import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import "dotenv/config";

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
  console.log("Gemini client successfully initialized.");
} else {
  console.warn("GEMINI_API_KEY is not defined. Using local fallback heuristic engine for optimization.");
}

const app = express();
const PORT = 3000;

app.use(express.json());

// Scientific Fallback Engine for Agricultural Water Conservation (El Niño parameters)
function calculateFallbackSchedule(field: any, forecast: any[]): any {
  const { crop, soil, method, size, sensorData } = field;
  const { soilMoisture, airTemp, humidity, windSpeed, solarRadiation } = sensorData;

  // Baseline calculations
  let baseMinutes = 40;
  let multiplier = 1.0;
  let riskLevel: 'Low' | 'Medium' | 'High' | 'Critical' = 'Medium';
  const strategies: string[] = [];

  // Weather stress adjustments (El Niño conditions)
  if (airTemp > 38) {
    multiplier *= 0.8; // Reduce direct watering, focus on night application
    riskLevel = 'Critical';
    strategies.push("Apply organic straw mulch to cut surface soil temperature by up to 8°C");
  } else if (airTemp > 30) {
    multiplier *= 0.9;
    riskLevel = 'High';
    strategies.push("Inject micro-doses of wetting agents (surfactants) to prevent dry water channeling");
  }

  if (windSpeed > 25 && method === 'Sprinkler') {
    multiplier *= 0.6; // Sprinklers blow away under high wind
    strategies.push("Suspend sprinkler scheduling during high winds; switch to direct under-canopy micro-drip");
  }

  // Soil-retention factor
  if (soil === 'Sandy') {
    baseMinutes = 20; // Sandy soils need shorter, more frequent watering (pulse irrigation)
    strategies.push("Deploy 'Pulse Irrigation' (3 short 10-minute cycles) to keep moisture in the active root zone");
  } else if (soil === 'Clayey') {
    baseMinutes = 60; // Clayey soils drain slowly, needs long soak
    strategies.push("Ensure 12-hour dry spell post-watering to prevent fungal root diseases in dense clay");
  } else {
    // Loamy
    baseMinutes = 35;
    strategies.push("Target watering strictly during peak humidity periods (01:00 AM - 04:00 AM) to maximize deep-root uptake");
  }

  // Crop-specific factors
  let recommendedWaterPerAc = 4500; // Gallons/acre standard
  if (crop === 'Almonds') {
    recommendedWaterPerAc = 5500;
    strategies.push("Use regulated deficit irrigation (RDI) during pre-harvest hull split to secure crop quality while saving 15% water");
  } else if (crop === 'Wine Grapes') {
    recommendedWaterPerAc = 2200; // Drought hardy
    strategies.push("Practice strict deficit watering during fruit set to trigger deep vine roots search and premium grape flavors");
  } else if (crop === 'Avocados') {
    recommendedWaterPerAc = 6500; // Water-thirsty, shallow roots
    strategies.push("Install overhead misting arrays to control ambient air moisture and prevent leaf burn from high heatwaves");
  } else if (crop === 'Lettuce') {
    recommendedWaterPerAc = 3000;
    strategies.push("Irrigate with fine micro-drips early morning to prevent delicate crop sunburn during super El Niño peak midday sun");
  }

  // Calculate dynamic outputs
  const runDuration = Math.round(baseMinutes * multiplier);
  const waterSavedPercentage = Math.round((0.15 + (100 - soilMoisture) * 0.002) * 100);
  const recommendedAmount = Math.round(recommendedWaterPerAc * (sensorData.soilMoisture < 30 ? 1.1 : 0.8) * multiplier);
  const moistureTargetAfter = Math.min(85, Math.round(soilMoisture + (runDuration * 0.8)));

  const rationales: { [key: string]: string } = {
    Almonds: `In Sandy Soil, almond roots suffer rapid moisture stress under ${airTemp}°C heat. Standard irrigation has an evaporation rate of 42% in midday. Shifting delivery to a pulse drip routine at night reduces wind loss and secures root vigor.`,
    'Wine Grapes': `Grapes are remarkably resilient. Deficit watering under current ${soilMoisture}% moisture levels will induce optimal sugar concentration while reducing total water consumption by ${waterSavedPercentage}%.`,
    Avocados: `Avocado root structures are highly susceptible to heat exhaustion. Keeping watering to nocturnal cycles maintains soil temperature balances, securing root health during this extreme El Niño.`,
    Corn: `Corn has high moisture needs during tasseling. Adjusting drip schedules dynamically based on wind patterns prevents canopy dryness and reduces structural wilt risk.`,
    Lettuce: `Lettuce is a fast-growing, shallow-root crop. Directing waterings to pre-dawn hours ensures maximum leaf turgidity and prevents early leaf-tip burn caused by high solar radiation.`
  };

  return {
    recommendedAmount,
    runDuration,
    bestTimeOfDay: "01:00 AM - 04:00 AM",
    waterSavedPercentage,
    rationale: rationales[crop] || `Optimized scheduling for ${crop} in ${soil} soil using micro-irrigation reduces El Niño water-loss to evaporation.`,
    elNinoStrategies: strategies.slice(0, 3),
    moistureTargetAfter,
    riskLevel,
    createdAt: new Date().toISOString()
  };
}

// Optimization endpoint
app.post("/api/optimize", async (req, res) => {
  try {
    const { field, forecast } = req.body;

    if (!field) {
      return res.status(400).json({ success: false, error: "Missing field parameter" });
    }

    // If Gemini client is not initialized or API key is missing, fall back safely
    if (!ai) {
      console.log("No Gemini API key detected. Generating heuristic recommendation.");
      const fallbackSchedule = calculateFallbackSchedule(field, forecast || []);
      return res.json({
        success: true,
        schedule: fallbackSchedule,
        isFallback: true
      });
    }

    // Craft custom agricultural optimization prompt for Super El Niño conditions
    const prompt = `
You are an expert AI Agricultural Agronomist specializing in high-precision micro-irrigation optimization during extreme climate fluctuations, particularly Super El Niño droughts characterized by high evaporation rates, high ambient temperature, and dry desiccating winds.

Analyze the following high-resolution, hyper-local sensor telemetry and field configuration to calculate an optimized irrigation schedule:

FIELD CONFIGURATION:
- Field Name: "${field.name}"
- Crop Type: "${field.crop}" (Agronomic water requirements, root depth, heat susceptibility)
- Soil Type: "${field.soil}" (Sandy = low retention, Loamy = medium retention, Clayey = high retention, risk of compaction)
- Irrigation Method: "${field.method}" (Drip, Sprinkler, or Flood - account for efficiency and evaporation drift)
- Size: ${field.size} Acres

TELEMETRY READINGS:
- Current Soil Moisture: ${field.sensorData.soilMoisture}%
- Air Temperature: ${field.sensorData.airTemp}°C
- Humidity: ${field.sensorData.humidity}%
- Wind Speed: ${field.sensorData.windSpeed} km/h
- Solar Radiation: ${field.sensorData.solarRadiation} W/m²
- Soil Temperature: ${field.sensorData.soilTemp}°C

7-DAY CLIMATE FORECAST:
${JSON.stringify(forecast)}

TASK:
Provide an engineered water-conservation irrigation plan. To maximize crop health and minimize waste, shift watering to cold, still night blocks, split applications to avoid pooling or runoff, and factor in soil moisture capacity.

Determine:
1. Recommended water amount in Gallons Per Acre.
2. Run duration in minutes.
3. Optimal night/dawn hour block (e.g., '02:00 AM - 04:00 AM').
4. Projected water savings percentage compared to conventional schedules (e.g., typical unoptimized high-volume watering).
5. A concise, professional agronomic explanation (rationale).
6. exactly 3 actionable, highly localized El Niño farming actions (mulching, pulse drips, soil surfactant additives, regulated deficit irrigation, shading) specifically suited to this crop and soil.
7. Estimated target soil moisture percentage after this water cycle.
8. Climate Evaporative Risk Level (must be 'Low', 'Medium', 'High', or 'Critical').
`;

    // Query Gemini 3.5 Flash using structured schema
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a professional agronomist specializing in hyper-local climate-smart irrigation technology under extreme El Niño droughts. Your output must strictly adhere to the requested JSON schema.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendedAmount: {
              type: Type.INTEGER,
              description: "Water amount to apply in gallons per acre."
            },
            runDuration: {
              type: Type.INTEGER,
              description: "Water run duration in minutes."
            },
            bestTimeOfDay: {
              type: Type.STRING,
              description: "Optimal night/dawn period (e.g. '01:00 AM - 03:00 AM') to prevent evaporation."
            },
            waterSavedPercentage: {
              type: Type.INTEGER,
              description: "Projected water saved compared to baseline (e.g. 15-50%)."
            },
            rationale: {
              type: Type.STRING,
              description: "Agronomic scientific rationale explaining how this schedule optimizes for this crop and soil type."
            },
            elNinoStrategies: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Exactly 3 crop-specific strategies (e.g. mulching, pulse-watering) for this Super El Niño condition."
            },
            moistureTargetAfter: {
              type: Type.INTEGER,
              description: "Target soil moisture (%) following watering, within the 40-90% range."
            },
            riskLevel: {
              type: Type.STRING,
              description: "Climate stress level: 'Low', 'Medium', 'High', or 'Critical'."
            }
          },
          required: [
            "recommendedAmount",
            "runDuration",
            "bestTimeOfDay",
            "waterSavedPercentage",
            "rationale",
            "elNinoStrategies",
            "moistureTargetAfter",
            "riskLevel"
          ]
        }
      }
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);

    res.json({
      success: true,
      schedule: {
        ...result,
        createdAt: new Date().toISOString()
      },
      isFallback: false
    });

  } catch (error: any) {
    console.error("Gemini API call failed, backing up to scientific calculation:", error);
    // Graceful backup
    const fallbackSchedule = calculateFallbackSchedule(req.body.field, req.body.forecast || []);
    res.json({
      success: true,
      schedule: fallbackSchedule,
      isFallback: true,
      error: error.message
    });
  }
});

// Setup Vite Dev Server / Static Files Serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware mounted.");
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Support single-page fallback
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log("Production static files server configured.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Agriculture Irrigation Optimizer server running on http://localhost:${PORT}`);
  });
}

startServer();
