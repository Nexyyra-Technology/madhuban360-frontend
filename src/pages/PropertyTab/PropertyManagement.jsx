/**
 * Property Management (main container)
 * ------------------------------------
 * Fetches properties from backend via propertyService.
 * Tabs: Properties (grid), Work Orders, Asset Tracking, Reports, Settings.
 */

import { useState, useEffect } from "react";
import WorkorderTab from "./WorkorderTab";
import AssetTrackingTab from "./AssetTrackingTab";
import ReportsTab from "./ReportsTab";
import AddPropertyModal from "./AddPropertyModal";
import { getProperties, getPropertySummary } from "./propertyService";

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

  const handleAddSuccess = () => {
    loadProperties();
    loadSummary();
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
          icon={<span className="text-lg" aria-hidden>🔧</span>}
          label="Work Orders"
        />
        <TabButton
          active={activeTab === TAB_KEYS.assetTracking}
          onClick={() => setActiveTab(TAB_KEYS.assetTracking)}
          icon={<span className="text-lg" aria-hidden>📁</span>}
          label="Asset Tracking"
        />
        <TabButton
          active={activeTab === TAB_KEYS.reports}
          onClick={() => setActiveTab(TAB_KEYS.reports)}
          icon={<span className="text-lg" aria-hidden>📊</span>}
          label="Reports"
        />
        <TabButton
          active={activeTab === TAB_KEYS.settings}
          onClick={() => setActiveTab(TAB_KEYS.settings)}
          icon={<span className="text-lg" aria-hidden>⚙</span>}
          label="Settings"
        />
        <TabButton
          active={activeTab === TAB_KEYS.properties}
          onClick={() => setActiveTab(TAB_KEYS.properties)}
          icon={<span className="text-lg" aria-hidden>🏢</span>}
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
              <p className="text-sm text-amber-600 mt-1 flex items-center gap-1">Renewal due in 30 days ⚠</p>
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
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
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
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-sm">
              <option>Property Type</option>
              <option>Commercial</option>
              <option>Residential</option>
              <option>Industrial</option>
            </select>
            <button type="button" className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
              Advanced
            </button>
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
                      <button type="button" className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-gray-600 hover:bg-white">⋯</button>
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-[#0d121b]">{p.name}</h3>
                      <p className="text-xs text-[#4c669a] mb-3">{p.location}</p>
                      <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                        <div>
                          <p className="text-gray-500">TOTAL UNITS</p>
                          <p className="font-semibold text-[#0d121b]">{p.totalUnits} Units</p>
                        </div>
                        <div>
                          <p className="text-gray-500">UNITS SOLD</p>
                          <p className="font-semibold text-[#0d121b]">{p.unitsSold} Units</p>
                        </div>
                        <div>
                          <p className="text-gray-500">UNITS UNSOLD</p>
                          <p className="font-semibold text-[#0d121b]">{p.unitsUnsold} Units</p>
                        </div>
                      </div>
                      <p className={`text-xs font-semibold ${p.amcColor || "text-green-600"}`}>• {p.amcStatus || "ACTIVE"}</p>
                      <button type="button" className="mt-3 text-sm font-semibold text-[#1f2937] hover:underline">
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
              <button type="button" className="p-2 rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50" disabled={page <= 1}>←</button>
              {[1, 2, 3].map((n) => (
                <button key={n} type="button" onClick={() => setPage(n)} className={`min-w-[36px] py-2 rounded-lg border text-sm font-medium ${page === n ? "bg-[#1f2937] text-white border-[#1f2937]" : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"}`}>{n}</button>
              ))}
              <span className="px-2 text-gray-500">…</span>
              <button type="button" className="min-w-[36px] py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">9</button>
              <button type="button" className="p-2 rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50">→</button>
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
    </div>
  );
}
