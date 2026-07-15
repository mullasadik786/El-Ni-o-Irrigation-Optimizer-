import React, { useState } from 'react';
import { Field, CropType } from '../types';
import { Sprout, TreePine, Leaf, Flame, HelpCircle, Plus, Search, Droplets, RefreshCw } from 'lucide-react';

interface FieldsListProps {
  fields: Field[];
  selectedFieldId: string;
  onSelectField: (id: string) => void;
  onOpenAddField: () => void;
}

export const cropIcons: Record<CropType, React.ReactNode> = {
  Almonds: <TreePine className="w-5 h-5 text-amber-500" id="icon-almond" />,
  'Wine Grapes': <Flame className="w-5 h-5 text-purple-400" id="icon-grape" />, // Flame representing sunset vineyards / premium grapes
  Corn: <Sprout className="w-5 h-5 text-yellow-400" id="icon-corn" />,
  Lettuce: <Leaf className="w-5 h-5 text-emerald-400" id="icon-lettuce" />,
  Avocados: <Droplets className="w-5 h-5 text-green-500" id="icon-avocado" />
};

export default function FieldsList({
  fields,
  selectedFieldId,
  onSelectField,
  onOpenAddField
}: FieldsListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFields = fields.filter((f) =>
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.crop.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white border-4 border-slate-900 rounded-none p-5 flex flex-col h-full shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]" id="fields-list-container">
      <div className="flex items-center justify-between mb-5" id="fields-header">
        <div>
          <h2 className="font-display text-lg font-black text-slate-900 uppercase flex items-center gap-2 tracking-tight">
            <Sprout className="w-5 h-5 text-emerald-600" />
            Agricultural Zones
          </h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-0.5">Monitoring {fields.length} active crops</p>
        </div>
        <button
          onClick={onOpenAddField}
          className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white border-2 border-slate-900 px-3 py-1.5 rounded-none text-xs font-black tracking-widest uppercase transition duration-150 cursor-pointer shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]"
          id="btn-add-zone"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Zone
        </button>
      </div>

      <div className="relative mb-4" id="search-container">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search crop or field name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-50 border-2 border-slate-900 rounded-none pl-9 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-450 focus:outline-none focus:border-emerald-500 transition"
          id="field-search-input"
        />
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[420px] md:max-h-none" id="fields-scroll-area">
        {filteredFields.length === 0 ? (
          <div className="text-center py-8" id="no-fields-view">
            <HelpCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-500 uppercase font-bold">No zones found matching "{searchTerm}"</p>
          </div>
        ) : (
          filteredFields.map((field) => {
            const isSelected = field.id === selectedFieldId;
            const moisture = field.sensorData.soilMoisture;
            
            // Soil moisture warning thresholds
            let moistureColor = 'bg-rose-500';
            let moistureText = 'Critical';
            if (moisture >= 45) {
              moistureColor = 'bg-emerald-500';
              moistureText = 'Optimal';
            } else if (moisture >= 25) {
              moistureColor = 'bg-amber-500';
              moistureText = 'Warning';
            }

            return (
              <div
                key={field.id}
                id={`field-card-${field.id}`}
                onClick={() => onSelectField(field.id)}
                className={`p-3.5 rounded-none border-2 border-slate-900 text-left cursor-pointer transition duration-150 relative overflow-hidden group ${
                  isSelected
                    ? 'bg-emerald-50 border-4 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]'
                    : 'bg-white hover:bg-slate-50'
                }`}
              >
                {/* Dynamic visual indicator glow */}
                {isSelected && (
                  <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-slate-900" />
                )}

                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-none ${isSelected ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-900 group-hover:bg-slate-200'} border-2 border-slate-900`}>
                      {cropIcons[field.crop] || <HelpCircle className="w-5 h-5 text-slate-400" />}
                    </div>
                    <div>
                      <h3 className="font-display text-sm font-black text-slate-900 group-hover:text-emerald-700 transition-colors duration-150 uppercase tracking-tight">
                        {field.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-slate-900 font-mono bg-slate-100 px-1.5 py-0.5 rounded-none border border-slate-900 font-bold">
                          {field.size} Ac
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                          {field.soil} Soil
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-none font-black uppercase border-2 ${
                    moistureText === 'Optimal' 
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-950' 
                      : moistureText === 'Warning' 
                        ? 'bg-amber-100 text-amber-900 border-amber-950' 
                        : 'bg-rose-100 text-rose-900 border-rose-950 animate-pulse'
                  }`}>
                    {moistureText}
                  </span>
                </div>

                {/* Soil Moisture Mini Meter */}
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-[10px] font-mono font-bold">
                    <span className="text-slate-500 flex items-center gap-0.5 uppercase">
                      <Droplets className="w-3.5 h-3.5 text-sky-600" /> Moisture
                    </span>
                    <span className="text-slate-900 font-black">{moisture}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-none overflow-hidden border-2 border-slate-900">
                    <div
                      className={`h-full transition-all duration-500 ${moistureColor}`}
                      style={{ width: `${moisture}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2.5 pt-2 border-t-2 border-slate-100 text-[10px] text-slate-500 font-bold uppercase tracking-wide">
                  <span>Method: <strong className="text-slate-900 font-black">{field.method}</strong></span>
                  {field.lastOptimizedAt ? (
                    <span className="flex items-center gap-1 text-emerald-600 font-black">
                      <RefreshCw className="w-2.5 h-2.5" /> Optimized
                    </span>
                  ) : (
                    <span className="text-slate-400">Not optimized</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
