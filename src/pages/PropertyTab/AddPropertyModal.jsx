/**
 * Add New Property Modal
 * ----------------------
 * Opens from "+ Add Property" button. Saves to database via propertyService.createProperty.
 * Backend: POST /api/properties
 */

import { useState } from "react";
import { createProperty } from "./propertyService";

const PROPERTY_TYPES = [
  { value: "", label: "Select type" },
  { value: "COMMERCIAL", label: "Commercial" },
  { value: "RESIDENTIAL", label: "Residential" },
  { value: "INDUSTRIAL", label: "Industrial" },
  { value: "MIXED", label: "Mixed Use" },
];

const initialState = {
  propertyName: "",
  propertyId: "PROP-XXX",
  propertyType: "",
  fullAddress: "",
  city: "",
  stateProvince: "",
  zipCode: "",
  totalUnits: "",
  unitsSold: "",
  unitsUnsold: "",
  primaryContact: "",
};

export default function AddPropertyModal({ isOpen, onClose, onSuccess }) {
  const [form, setForm] = useState(initialState);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = {
        name: form.propertyName,
        propertyId: form.propertyId || undefined,
        type: form.propertyType,
        address: form.fullAddress,
        city: form.city,
        stateProvince: form.stateProvince,
        zipCode: form.zipCode,
        totalUnits: Number(form.totalUnits) || 0,
        unitsSold: Number(form.unitsSold) || 0,
        unitsUnsold: Number(form.unitsUnsold) || 0,
        primaryContact: form.primaryContact,
      };
      await createProperty(payload);
      setForm(initialState);
      onClose();
      onSuccess?.();
    } catch (err) {
      setError(err.message || "Failed to save property");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
      setForm(initialState);
      setError("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={handleClose}>
      <div
        className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#0d121b]">Add New Property</h2>
            <p className="text-sm text-gray-500 mt-0.5">Register a new asset in the management system</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={saving}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 disabled:opacity-50"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
          )}

          <section>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Property Information</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property Name</label>
                <input
                  type="text"
                  placeholder="e.g. Skyline Heights"
                  value={form.propertyName}
                  onChange={(e) => handleChange("propertyName", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#1f2937]/20"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property ID</label>
                <input
                  type="text"
                  placeholder="PROP-XXX"
                  value={form.propertyId}
                  onChange={(e) => handleChange("propertyId", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 outline-none focus:ring-2 focus:ring-[#1f2937]/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                <select
                  value={form.propertyType}
                  onChange={(e) => handleChange("propertyType", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#1f2937]/20"
                >
                  {PROPERTY_TYPES.map((opt) => (
                    <option key={opt.value || "empty"} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Location Details</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Address</label>
                <input
                  type="text"
                  placeholder="Street address, apartment, suite..."
                  value={form.fullAddress}
                  onChange={(e) => handleChange("fullAddress", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#1f2937]/20"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    placeholder="City name"
                    value={form.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#1f2937]/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State/Province</label>
                  <input
                    type="text"
                    placeholder="State"
                    value={form.stateProvince}
                    onChange={(e) => handleChange("stateProvince", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#1f2937]/20"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
                <input
                  type="text"
                  placeholder="Zip"
                  value={form.zipCode}
                  onChange={(e) => handleChange("zipCode", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#1f2937]/20"
                />
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Operational Details</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Units / Area (sq ft)</label>
                <input
                  type="text"
                  placeholder="e.g. 120"
                  value={form.totalUnits}
                  onChange={(e) => handleChange("totalUnits", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#1f2937]/20"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Units Sold</label>
                  <input
                    type="text"
                    placeholder="e.g. 120"
                    value={form.unitsSold}
                    onChange={(e) => handleChange("unitsSold", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#1f2937]/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Units Unsold</label>
                  <input
                    type="text"
                    placeholder="e.g. 120"
                    value={form.unitsUnsold}
                    onChange={(e) => handleChange("unitsUnsold", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#1f2937]/20"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Primary Contact Person</label>
                <input
                  type="text"
                  placeholder="Manager name / Contact Number"
                  value={form.primaryContact}
                  onChange={(e) => handleChange("primaryContact", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#1f2937]/20"
                />
              </div>
            </div>
          </section>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={saving}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-[#1f2937] text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Property"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
