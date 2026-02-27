/**
 * Property Management (main container)
 * ------------------------------------
 * Fetches properties from backend via propertyService.
 * Tabs: Properties (grid), Work Orders, Asset Tracking, Reports, Settings.
 */

import { useState, useEffect } from "react";
import { Wrench, FolderOpen, BarChart3, Settings, Building, Search, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import WorkorderTab from "./WorkorderTab";
import AssetTrackingTab from "./AssetTrackingTab";
import ReportsTab from "./ReportsTab";
import AddPropertyModal from "./AddPropertyModal";
import { getProperties, getPropertySummary, deleteProperty, updateProperty, getPropertyWithFloors } from "./propertyService";

const IMAGE_ACCEPT = "image/jpeg,image/png,image/gif,image/webp";
const IMAGE_PREVIEW_WIDTH = 400;
const IMAGE_PREVIEW_HEIGHT = 260;

const TAB_KEYS = {
  properties: "properties",
  workOrders: "work-orders",
  assetTracking: "asset-tracking",
  reports: "reports",
  settings: "settings",
};

function TabButton({ active, onClick, icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition ${active ? "bg-[#1f2937] text-white" : "text-gray-600 hover:bg-gray-100"}`}
    >
      {icon}
      {label}
    </button>
  );
}

export default function PropertyManagement() {
  const [activeTab, setActiveTab] = useState(TAB_KEYS.properties);
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [typeFilter, setTypeFilter] = useState("Property Type");
  const [page, setPage] = useState(1);
  const [properties, setProperties] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [editProperty, setEditProperty] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsProperty, setDetailsProperty] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState(null);

  const loadProperties = () => {
    setLoading(true);
    getProperties({ search, status: statusFilter, type: typeFilter, page })
      .then((res) => {
        const list = Array.isArray(res) ? res : res?.list ?? [];
        setProperties(list);
      })
      .catch(() => setProperties([]))
      .finally(() => setLoading(false));
  };

  const loadSummary = () => {
    getPropertySummary().then(setSummary).catch(() => {});
  };

  useEffect(() => {
    loadProperties();
  }, [search, statusFilter, typeFilter, page]);

  useEffect(() => {
    loadSummary();
  }, []);

  useEffect(() => {
    if (!menuOpenId) return;
    const close = () => setMenuOpenId(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [menuOpenId]);

  const handleAddSuccess = () => {
    loadProperties();
    loadSummary();
  };

  const handleDeleteClick = (e, id) => {
    e.stopPropagation();
    setMenuOpenId(null);
    setDeleteError(null);
    setDeleteConfirmId(id);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmId) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      const res = await deleteProperty(deleteConfirmId);
      if (res?.success !== false) {
        setDeleteConfirmId(null);
        loadProperties();
        loadSummary();
      } else {
        setDeleteError(res?.message || "Failed to delete property");
      }
    } catch (err) {
      setDeleteError(err?.message || "Failed to delete property");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmId(null);
    setDeleteError(null);
  };

  const handleEditClick = async (e, property) => {
    e.stopPropagation();
    setMenuOpenId(null);
    setEditError(null);
    setEditLoading(true);
    try {
      const data = await getPropertyWithFloors(property.id);
      const floors = (data?.floors || []).map((floor) => ({
        floorNumber: floor.floorNumber ?? "",
        zones: (floor.zones && floor.zones.length
          ? floor.zones
          : [{ name: "" }]
        ).map((z) => ({ name: z.name || "" })),
      }));

      setEditProperty({
        id: data?.id ?? property.id,
        propertyName: data?.propertyName || property.name || "",
        imageFile: null,
        imagePreview: data?.imageUrl || property.image || null,
        floors: floors.length
          ? floors
          : [
              {
                floorNumber: "",
                zones: [{ name: "" }],
              },
            ],
      });
    } catch (err) {
      setEditError(err?.message || "Failed to load property");
    } finally {
      setEditLoading(false);
    }
  };

  const handleEditCancel = () => {
    setEditProperty(null);
    setEditError(null);
  };

  const handleEditSave = async () => {
    if (!editProperty?.id) return;
    setEditLoading(true);
    setEditError(null);
    try {
      const floors = (editProperty.floors || [])
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
      fd.append("propertyName", editProperty.propertyName || "");
      fd.append("floors", JSON.stringify(floors));
      if (editProperty.imageFile) fd.append("image", editProperty.imageFile);

      const res = await updateProperty(editProperty.id, fd);
      if (res?.success === false) {
        setEditError(res?.message || "Failed to update property");
      } else {
        setEditProperty(null);
        loadProperties();
        loadSummary();
      }
    } catch (err) {
      setEditError(err?.message || "Failed to update property");
    } finally {
      setEditLoading(false);
    }
  };

  const handleEditFieldChange = (field, value) => {
    setEditProperty((prev) => (prev ? { ...prev, [field]: value } : prev));
    setEditError(null);
  };

  const handleEditFloorNumberChange = (index, value) => {
    setEditProperty((prev) => {
      if (!prev) return prev;
      const floors = [...(prev.floors || [])];
      floors[index] = { ...floors[index], floorNumber: value };
      return { ...prev, floors };
    });
    setEditError(null);
  };

  const handleEditZoneNameChange = (floorIndex, zoneIndex, value) => {
    setEditProperty((prev) => {
      if (!prev) return prev;
      const floors = [...(prev.floors || [])];
      const zones = [...(floors[floorIndex]?.zones || [])];
      zones[zoneIndex] = { ...zones[zoneIndex], name: value };
      floors[floorIndex] = { ...floors[floorIndex], zones };
      return { ...prev, floors };
    });
    setEditError(null);
  };

  const handleEditAddFloor = () => {
    setEditProperty((prev) => {
      if (!prev) return prev;
      const floors = [...(prev.floors || [])];
      floors.push({
        floorNumber: "",
        zones: [{ name: "" }],
      });
      return { ...prev, floors };
    });
    setEditError(null);
  };

  const handleEditRemoveFloor = (index) => {
    setEditProperty((prev) => {
      if (!prev) return prev;
      const floors = [...(prev.floors || [])];
      if (floors.length <= 1) return prev;
      floors.splice(index, 1);
      return { ...prev, floors };
    });
    setEditError(null);
  };

  const handleEditAddZone = (floorIndex) => {
    setEditProperty((prev) => {
      if (!prev) return prev;
      const floors = [...(prev.floors || [])];
      const zones = [...(floors[floorIndex]?.zones || [])];
      zones.push({ name: "" });
      floors[floorIndex] = { ...floors[floorIndex], zones };
      return { ...prev, floors };
    });
    setEditError(null);
  };

  const handleEditRemoveZone = (floorIndex, zoneIndex) => {
    setEditProperty((prev) => {
      if (!prev) return prev;
      const floors = [...(prev.floors || [])];
      const zones = [...(floors[floorIndex]?.zones || [])];
      if (zones.length <= 1) return prev;
      zones.splice(zoneIndex, 1);
      floors[floorIndex] = { ...floors[floorIndex], zones };
      return { ...prev, floors };
    });
    setEditError(null);
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/^image\/(jpeg|png|gif|webp)$/i.test(file.type)) {
      setEditError("Please select a valid image (jpeg, png, gif, webp)");
      return;
    }
    const reader = new FileReader();
    reader.onload = () =>
      setEditProperty((prev) =>
        prev ? { ...prev, imageFile: file, imagePreview: reader.result } : prev
      );
    reader.readAsDataURL(file);
    setEditError(null);
  };

  const handleEditRemoveImage = () => {
    setEditProperty((prev) =>
      prev ? { ...prev, imageFile: null, imagePreview: null } : prev
    );
    setEditError(null);
  };

  const handleViewDetails = async (id) => {
    setDetailsOpen(true);
    setDetailsLoading(true);
    setDetailsError(null);
    setDetailsProperty(null);
    try {
      const data = await getPropertyWithFloors(id);
      setDetailsProperty(data);
    } catch (err) {
      setDetailsError(err?.message || "Failed to load property details");
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleDetailsClose = () => {
    setDetailsOpen(false);
    setDetailsProperty(null);
    setDetailsError(null);
  };

  const s = summary || { total: 42, activeAmc: 38, expiringAmc: 4, occupancyPercent: 92 };
  const totalProperties = Array.isArray(properties) ? properties.length : 0;
  const displayTotal = summary?.total ?? 42;

  return (
    <div className="bg-[#f5f7fb] min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0d121b]">Property Management</h1>
          <p className="text-[#4c669a] mt-1 text-sm">Manage and track your portfolio assets across all locations.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-[#1f2937] text-white px-5 py-3 rounded-lg font-semibold text-sm shadow-lg hover:opacity-90 transition"
        >
          + Add Property
        </button>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-2 mb-6">
        <TabButton
          active={activeTab === TAB_KEYS.workOrders}
          onClick={() => setActiveTab(TAB_KEYS.workOrders)}
          icon={<Wrench className="w-5 h-5" aria-hidden />}
          label="Work Orders"
        />
        <TabButton
          active={activeTab === TAB_KEYS.assetTracking}
          onClick={() => setActiveTab(TAB_KEYS.assetTracking)}
          icon={<FolderOpen className="w-5 h-5" aria-hidden />}
          label="Asset Tracking"
        />
        <TabButton
          active={activeTab === TAB_KEYS.reports}
          onClick={() => setActiveTab(TAB_KEYS.reports)}
          icon={<BarChart3 className="w-5 h-5" aria-hidden />}
          label="Reports"
        />
        <TabButton
          active={activeTab === TAB_KEYS.settings}
          onClick={() => setActiveTab(TAB_KEYS.settings)}
          icon={<Settings className="w-5 h-5" aria-hidden />}
          label="Settings"
        />
        <TabButton
          active={activeTab === TAB_KEYS.properties}
          onClick={() => setActiveTab(TAB_KEYS.properties)}
          icon={<Building className="w-5 h-5" aria-hidden />}
          label="Properties"
        />
      </div>

      {activeTab === TAB_KEYS.workOrders && <WorkorderTab />}
      {activeTab === TAB_KEYS.assetTracking && <AssetTrackingTab />}
      {activeTab === TAB_KEYS.reports && <ReportsTab />}

      {activeTab === TAB_KEYS.properties && (
        <>
          {/* Summary cards (from backend/database) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Properties</h4>
              <p className="text-2xl font-bold text-[#0d121b] mt-1">{loading ? "—" : displayTotal}</p>
              <p className="text-sm text-green-600 mt-1">+3 from last month</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Active AMC</h4>
              <p className="text-2xl font-bold text-[#0d121b] mt-1">{loading ? "—" : s.activeAmc}</p>
              <p className="text-sm text-gray-600 mt-1">90.4% coverage</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Expiring AMC</h4>
              <p className="text-2xl font-bold text-[#0d121b] mt-1">{loading ? "—" : s.expiringAmc}</p>
              <p className="text-sm text-amber-600 mt-1 flex items-center gap-1">Renewal due in 30 days <AlertTriangle className="w-4 h-4 inline" /></p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Occupancy</h4>
              <p className="text-2xl font-bold text-[#0d121b] mt-1">{loading ? "—" : `${s.occupancyPercent}%`}</p>
              <div className="h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${s.occupancyPercent ?? 92}%` }} />
              </div>
            </div>
          </div>

          {/* Search & filters */}
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, location or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg bg-white text-sm outline-none focus:ring-2 focus:ring-[#1f2937]/20"
              />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-sm">
              <option>All Status</option>
              <option>Active</option>
              <option>Expired</option>
              <option>Expiring Soon</option>
            </select>
            {/* <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-sm">
              <option>Property Type</option>
              <option>Commercial</option>
              <option>Residential</option>
              <option>Industrial</option>
            </select>
            <button type="button" className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
              Advanced
            </button> */}
          </div>

          {/* Property grid (from backend/database) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {loading ? (
              <div className="col-span-full py-12 text-center text-gray-500">Loading...</div>
            ) : (
              <>
                {properties.map((p) => (
                  <div key={p.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
                    <div className="relative h-40 bg-gray-200">
                      <img src={p.image} alt="" className="w-full h-full object-cover" />
                      <span className="absolute top-3 left-3 px-2 py-0.5 bg-gray-800 text-white text-xs font-semibold rounded">{p.category}</span>
                      <div className="absolute top-3 right-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpenId(menuOpenId === p.id ? null : p.id);
                          }}
                          className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-gray-600 hover:bg-white"
                          aria-haspopup="true"
                          aria-expanded={menuOpenId === p.id}
                        >
                          ⋯
                        </button>
                        {menuOpenId === p.id && (
                          <div className="absolute right-0 top-full mt-1 py-1 w-44 bg-white rounded-lg border border-gray-200 shadow-lg z-10">
                            <button
                              type="button"
                              onClick={(e) => handleEditClick(e, p)}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded"
                            >
                              Edit Property
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleDeleteClick(e, p.id)}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
                            >
                              Delete Property
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-[#0d121b]">{p.name}</h3>
                      {/* <p className="text-xs text-[#4c669a] mb-3">{p.location}</p> */}
                      <p className={`text-xs font-semibold ${p.amcColor || "text-green-600"}`}>• {p.amcStatus || "ACTIVE"}</p>
                      <button
                        type="button"
                        onClick={() => handleViewDetails(p.id)}
                        className="mt-3 text-sm font-semibold text-[#1f2937] hover:underline"
                      >
                        {p.isExpired ? "Renew Now →" : "View Details →"}
                      </button>
                    </div>
                  </div>
                ))}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setShowAddModal(true)}
                  onKeyDown={(e) => e.key === "Enter" && setShowAddModal(true)}
                  className="bg-white rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center min-h-[320px] text-gray-500 hover:border-[#1f2937] hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <span className="text-4xl mb-2">+</span>
                  <p className="font-semibold text-[#0d121b]">+ Add New Asset</p>
                  <p className="text-xs mt-1 text-center px-4">Start managing a new property and track its lifecycle.</p>
                </div>
              </>
            )}
          </div>

          {/* Pagination */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-gray-600">Showing 1 to {Math.min(5, properties.length)} of {displayTotal} properties</p>
            <div className="flex items-center gap-1">
              <button type="button" className="p-2 rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50" disabled={page <= 1}><ChevronLeft className="w-4 h-4" /></button>
              {[1, 2, 3].map((n) => (
                <button key={n} type="button" onClick={() => setPage(n)} className={`min-w-[36px] py-2 rounded-lg border text-sm font-medium ${page === n ? "bg-[#1f2937] text-white border-[#1f2937]" : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"}`}>{n}</button>
              ))}
              <span className="px-2 text-gray-500">…</span>
              <button type="button" className="min-w-[36px] py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">9</button>
              <button type="button" className="p-2 rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        </>
      )}

      {activeTab === TAB_KEYS.settings && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
          <p className="font-medium text-[#0d121b]">Settings</p>
          <p className="text-sm mt-1">This section is coming soon.</p>
        </div>
      )}

      <AddPropertyModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSuccess={handleAddSuccess} />

      {/* Delete confirmation modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={handleDeleteCancel}>
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
            <p className="text-[#0d121b] font-semibold text-center">Do you really want to delete this property?</p>
            {deleteError && <p className="mt-2 text-sm text-red-600 text-center">{deleteError}</p>}
            <div className="mt-6 flex gap-3 justify-center">
              <button
                type="button"
                onClick={handleDeleteCancel}
                disabled={deleteLoading}
                className="px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
                className="px-4 py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {deleteLoading ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit property modal (uses PATCH /api/properties/:id with floors & image) */}
      {editProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={handleEditCancel}>
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-start justify-between">
              <div>
                <p className="text-lg font-bold text-[#0d121b]">Edit Property</p>
                <p className="text-sm text-gray-500 mt-0.5">Update name, image, floors and zones</p>
              </div>
              <button
                type="button"
                onClick={handleEditCancel}
                disabled={editLoading}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 disabled:opacity-50"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              <section>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Property Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Property Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Skyline Heights"
                      value={editProperty.propertyName || ""}
                      onChange={(e) => handleEditFieldChange("propertyName", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#1f2937]/20"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Property Image</label>
                    <p className="text-xs text-gray-500 mb-2">jpeg, png, gif, webp</p>
                    {editProperty.imagePreview ? (
                      <div className="space-y-2">
                        <div
                          className="border border-gray-200 rounded-lg overflow-hidden bg-gray-100"
                          style={{ width: IMAGE_PREVIEW_WIDTH, height: IMAGE_PREVIEW_HEIGHT }}
                        >
                          <img
                            src={editProperty.imagePreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            style={{ width: IMAGE_PREVIEW_WIDTH, height: IMAGE_PREVIEW_HEIGHT }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleEditRemoveImage}
                          className="text-sm text-red-600 hover:underline"
                        >
                          Remove image
                        </button>
                      </div>
                    ) : (
                      <label
                        className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                        style={{ width: IMAGE_PREVIEW_WIDTH, height: IMAGE_PREVIEW_HEIGHT }}
                      >
                        <span className="text-sm text-gray-500">Click to upload</span>
                        <input
                          type="file"
                          accept={IMAGE_ACCEPT}
                          onChange={handleEditImageChange}
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
                  {editProperty.floors.map((floor, floorIndex) => (
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
                            onChange={(e) => handleEditFloorNumberChange(floorIndex, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#1f2937]/20"
                            required
                          />
                        </div>
                        {editProperty.floors.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleEditRemoveFloor(floorIndex)}
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
                            onClick={() => handleEditAddZone(floorIndex)}
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
                                  handleEditZoneNameChange(floorIndex, zoneIndex, e.target.value)
                                }
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#1f2937]/20"
                                required
                              />
                              {floor.zones.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleEditRemoveZone(floorIndex, zoneIndex)}
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
                    onClick={handleEditAddFloor}
                    className="w-full border border-dashed border-gray-300 rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50"
                  >
                    + Add Floor
                  </button>
                </div>
              </section>

              {editError && <p className="text-sm text-red-600 text-center">{editError}</p>}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleEditCancel}
                  disabled={editLoading}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleEditSave}
                  disabled={editLoading}
                  className="px-4 py-2 bg-[#1f2937] text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"
                >
                  {editLoading ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View details modal (GET /api/properties/:id?include=floors) */}
      {detailsOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/50" onClick={handleDetailsClose}>
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-start justify-between">
              <div>
                <p className="text-lg font-bold text-[#0d121b]">
                  {detailsProperty?.propertyName || "Property Details"}
                </p>
                {detailsProperty && (
                  <p className="text-xs text-gray-500 mt-0.5">
                     • Created{" "}
                    {new Date(detailsProperty.createdAt).toLocaleString()}  • Updated{" "}
                    {new Date(detailsProperty.updatedAt).toLocaleString()}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={handleDetailsClose}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {detailsLoading && (
                <p className="text-sm text-gray-500 text-center">Loading property details…</p>
              )}

              {detailsError && (
                <p className="text-sm text-red-600 text-center">{detailsError}</p>
              )}

              {detailsProperty && !detailsLoading && !detailsError && (
                <>
                  {detailsProperty.imageUrl && (
                    <div
                      className="border border-gray-200 rounded-lg overflow-hidden bg-gray-100 mx-auto"
                      style={{ width: IMAGE_PREVIEW_WIDTH, height: IMAGE_PREVIEW_HEIGHT }}
                    >
                      <img
                        src={detailsProperty.imageUrl}
                        alt={detailsProperty.propertyName}
                        className="w-full h-full object-cover"
                        style={{ width: IMAGE_PREVIEW_WIDTH, height: IMAGE_PREVIEW_HEIGHT }}
                      />
                    </div>
                  )}

                  <section>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                      Floors & Zones
                    </h3>
                    {detailsProperty.floors && detailsProperty.floors.length ? (
                      <div className="space-y-3">
                        {detailsProperty.floors.map((floor) => (
                          <div
                            key={floor.id}
                            className="border border-gray-200 rounded-lg p-3 flex justify-between items-start"
                          >
                            <div>
                              <p className="text-sm font-semibold text-[#0d121b]">
                                Floor {floor.floorNumber}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                Created {new Date(floor.createdAt).toLocaleString()}
                              </p>
                            </div>
                            <div className="text-sm text-gray-700">
                              {floor.zones && floor.zones.length ? (
                                <span>
                                  Zones:{" "}
                                  {floor.zones.map((z) => z.name).join(", ")}
                                </span>
                              ) : (
                                <span>No zones</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No floors configured.</p>
                    )}
                  </section>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
