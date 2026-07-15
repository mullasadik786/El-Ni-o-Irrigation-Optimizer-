import React, { useState } from 'react';
import { CropType, SoilType, IrrigationMethod, Field } from '../types';
import { X, Sprout, AlertCircle } from 'lucide-react';

interface AddFieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (newField: Omit<Field, 'id' | 'sensorData'>) => void;
}

export default function AddFieldModal({ isOpen, onClose, onAdd }: AddFieldModalProps) {
  const [name, setName] = useState('');
  const [crop, setCrop] = useState<CropType>('Almonds');
  const [soil, setSoil] = useState<SoilType>('Loamy');
  const [method, setMethod] = useState<IrrigationMethod>('Drip');
  const [size, setSize] = useState('25');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please provide a descriptive name for your agricultural zone.');
      return;
    }

    const fieldSize = parseFloat(size);
    if (isNaN(fieldSize) || fieldSize <= 0) {
      setError('Please input a valid size in acres greater than 0.');
      return;
    }

    onAdd({
      name: name.trim(),
      crop,
      soil,
      method,
      size: fieldSize
    });

    // Reset Form
    setName('');
    setCrop('Almonds');
    setSoil('Loamy');
    setMethod('Drip');
    setSize('25');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in" id="add-field-modal-wrapper">
      <div className="relative w-full max-w-md bg-white border-4 border-slate-900 rounded-none p-6 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]" id="add-field-modal">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-900 transition cursor-pointer"
          id="btn-close-modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6" id="modal-header">
          <div className="p-2 bg-emerald-100 border-2 border-slate-900 rounded-none">
            <Sprout className="w-5 h-5 text-emerald-900" />
          </div>
          <div>
            <h3 className="font-display text-base font-black text-slate-900 uppercase tracking-tight">
              Provision New Crop Zone
            </h3>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Add localized sensors to your water schedule</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4" id="modal-form">
          {error && (
            <div className="p-3 bg-red-100 border-2 border-slate-900 rounded-none flex items-start gap-2.5 text-xs text-red-950 font-semibold" id="modal-error">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-900" />
              <span>{error}</span>
            </div>
          )}

          {/* Name */}
          <div className="space-y-1" id="form-name">
            <label className="text-[11px] text-slate-500 uppercase tracking-widest font-black block mb-1">
              Zone Identifier / Name
            </label>
            <input
              type="text"
              placeholder="e.g. West Orchard Slope"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-900 rounded-none px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-450 focus:outline-none focus:border-emerald-500 transition font-bold"
              id="input-zone-name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Crop Select */}
            <div className="space-y-1" id="form-crop">
              <label className="text-[11px] text-slate-500 uppercase tracking-widest font-black block mb-1">
                Crop Selection
              </label>
              <select
                value={crop}
                onChange={(e) => setCrop(e.target.value as CropType)}
                className="w-full bg-slate-50 border-2 border-slate-900 rounded-none px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 cursor-pointer font-bold"
                id="select-crop"
              >
                <option value="Almonds">Almonds</option>
                <option value="Wine Grapes">Wine Grapes</option>
                <option value="Corn">Maize / Corn</option>
                <option value="Lettuce">Lettuce</option>
                <option value="Avocados">Avocados</option>
              </select>
            </div>

            {/* Size (Acres) */}
            <div className="space-y-1" id="form-size">
              <label className="text-[11px] text-slate-500 uppercase tracking-widest font-black block mb-1">
                Size (Acres)
              </label>
              <input
                type="number"
                placeholder="25"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-900 rounded-none px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 transition font-bold"
                id="input-size"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Soil Type */}
            <div className="space-y-1" id="form-soil">
              <label className="text-[11px] text-slate-500 uppercase tracking-widest font-black block mb-1">
                Soil Profile
              </label>
              <select
                value={soil}
                onChange={(e) => setSoil(e.target.value as SoilType)}
                className="w-full bg-slate-50 border-2 border-slate-900 rounded-none px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 cursor-pointer font-bold"
                id="select-soil"
              >
                <option value="Loamy">Loamy (Ideal)</option>
                <option value="Sandy">Sandy (Low Retention)</option>
                <option value="Clayey">Clayey (Low Drainage)</option>
              </select>
            </div>

            {/* Irrigation Method */}
            <div className="space-y-1" id="form-method">
              <label className="text-[11px] text-slate-500 uppercase tracking-widest font-black block mb-1">
                Irrigation System
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as IrrigationMethod)}
                className="w-full bg-slate-50 border-2 border-slate-900 rounded-none px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 cursor-pointer font-bold"
                id="select-method"
              >
                <option value="Drip">Micro Drip (High Eff)</option>
                <option value="Sprinkler">Sprinkler (Med Eff)</option>
                <option value="Flood">Flood (Low Eff)</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t-2 border-slate-200" id="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border-2 border-slate-900 hover:bg-slate-100 rounded-none text-xs text-slate-900 font-black uppercase tracking-wider transition cursor-pointer"
              id="btn-cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white border-2 border-slate-900 rounded-none text-xs font-black tracking-widest uppercase transition cursor-pointer shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]"
              id="btn-submit"
            >
              Provision Zone
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
