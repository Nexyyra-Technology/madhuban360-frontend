/**
 * Add New Property Modal
 * ----------------------
 * Opens from "+ Add Property" button. Saves to database via propertyService.createProperty.
 * Backend: POST /api/properties
 */

import { useState } from "react";
import { createProperty } from "./propertyService";

const IMAGE_ACCEPT = "image/jpeg,image/png,image/gif,image/webp";
const IMAGE_PREVIEW_WIDTH = 400;
const IMAGE_PREVIEW_HEIGHT = 300;

const initialState = {
  propertyName: "",
  imageFile: null,
  imagePreview: null,
  floors: [
    {
      floorNumber: "",
      zones: [{ name: "" }],
    },
  ],
};

export default function AddPropertyModal({ isOpen, onClose, onSuccess }) {
  const [form, setForm] = useState(initialState);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/^image\/(jpeg|png|gif|webp)$/i.test(file.type)) {
      setError("Please select a valid image (jpeg, png, gif, webp)");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setForm((prev) => ({ ...prev, imageFile: file, imagePreview: reader.result }));
    reader.readAsDataURL(file);
    setError("");
  };

  const handleRemoveImage = () => {
    setForm((prev) => ({ ...prev, imageFile: null, imagePreview: null }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const floors = (form.floors || [])
        .filter(
          (floor) =>
            floor.floorNumber &&
            floor.zones &&
            floor.zones.some((z) => z.name && z.name.trim())
        )
        .map((floor) => ({
          floorNumber: Number(floor.floorNumber),
          zones: floor.zones
            .filter((z) => z.name && z.name.trim())
            .map((z) => ({ name: z.name.trim() })),
        }));

      const fd = new FormData();
      fd.append("propertyName", form.propertyName);
      fd.append("floors", JSON.stringify(floors));
      if (form.imageFile) fd.append("image", form.imageFile);

      await createProperty(fd);
      setForm(initialState);
      onClose();
      onSuccess?.();
    } catch (err) {
      setError(err.message || "Failed to save property");
    } finally {
      setSaving(false);
    }
  };

  const handleFloorNumberChange = (index, value) => {
    setForm((prev) => {
      const floors = [...prev.floors];
      floors[index] = { ...floors[index], floorNumber: value };
      return { ...prev, floors };
    });
    setError("");
  };

  const handleZoneNameChange = (floorIndex, zoneIndex, value) => {
    setForm((prev) => {
      const floors = [...prev.floors];
      const zones = [...(floors[floorIndex]?.zones || [])];
      zones[zoneIndex] = { ...zones[zoneIndex], name: value };
      floors[floorIndex] = { ...floors[floorIndex], zones };
      return { ...prev, floors };
    });
    setError("");
  };

  const handleAddFloor = () => {
    setForm((prev) => ({
      ...prev,
      floors: [
        ...prev.floors,
        {
          floorNumber: "",
          zones: [{ name: "" }],
        },
      ],
    }));
    setError("");
  };

  const handleRemoveFloor = (index) => {
    setForm((prev) => {
      const floors = [...prev.floors];
      if (floors.length <= 1) return prev;
      floors.splice(index, 1);
      return { ...prev, floors };
    });
    setError("");
  };

  const handleAddZone = (floorIndex) => {
    setForm((prev) => {
      const floors = [...prev.floors];
      const zones = [...(floors[floorIndex]?.zones || [])];
      zones.push({ name: "" });
      floors[floorIndex] = { ...floors[floorIndex], zones };
      return { ...prev, floors };
    });
    setError("");
  };

  const handleRemoveZone = (floorIndex, zoneIndex) => {
    setForm((prev) => {
      const floors = [...prev.floors];
      const zones = [...(floors[floorIndex]?.zones || [])];
      if (zones.length <= 1) return prev;
      zones.splice(zoneIndex, 1);
      floors[floorIndex] = { ...floors[floorIndex], zones };
      return { ...prev, floors };
    });
    setError("");
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Property Image</label>
                <p className="text-xs text-gray-500 mb-2">jpeg, png, gif, webp</p>
                {form.imagePreview ? (
                  <div className="space-y-2">
                    <div
                      className="border border-gray-200 rounded-lg overflow-hidden bg-gray-100"
                      style={{ width: IMAGE_PREVIEW_WIDTH, height: IMAGE_PREVIEW_HEIGHT }}
                    >
                      <img
                        src={form.imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        style={{ width: IMAGE_PREVIEW_WIDTH, height: IMAGE_PREVIEW_HEIGHT }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Remove image
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    style={{ width: IMAGE_PREVIEW_WIDTH, height: IMAGE_PREVIEW_HEIGHT }}
                  >
                    <span className="text-sm text-gray-500">Click to upload</span>
                    <input
                      type="file"
                      accept={IMAGE_ACCEPT}
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Floors & Zones</h3>
            <div className="space-y-4">
              {form.floors.map((floor, floorIndex) => (
                <div key={floorIndex} className="border border-gray-200 rounded-lg p-3 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Floor Number
                      </label>
                      <input
                        type="number"
                        min="1"
                        placeholder="e.g. 1"
                        value={floor.floorNumber}
                        onChange={(e) => handleFloorNumberChange(floorIndex, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#1f2937]/20"
                        required
                      />
                    </div>
                    {form.floors.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveFloor(floorIndex)}
                        className="mt-6 px-2 py-1 text-xs text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                      >
                        Remove Floor
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Zones
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAddZone(floorIndex)}
                        className="text-xs text-[#1f2937] font-medium hover:underline"
                      >
                        + Add Zone
                      </button>
                    </div>

                    <div className="space-y-2">
                      {floor.zones.map((zone, zoneIndex) => (
                        <div key={zoneIndex} className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="e.g. Zone A"
                            value={zone.name}
                            onChange={(e) =>
                              handleZoneNameChange(floorIndex, zoneIndex, e.target.value)
                            }
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#1f2937]/20"
                            required
                          />
                          {floor.zones.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveZone(floorIndex, zoneIndex)}
                              className="px-2 py-1 text-xs text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddFloor}
                className="w-full border border-dashed border-gray-300 rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                + Add Floor
              </button>
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
