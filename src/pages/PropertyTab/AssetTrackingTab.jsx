/**
 * Asset Tracking Tab
 * ------------------
 * Data from backend: getAssets(), getAssetSummary()
 * Backend: GET /api/assets, GET /api/assets/summary
 */

import { useState, useEffect } from "react";
import { getAssets, getAssetSummary } from "./propertyService";

export default function AssetTrackingTab() {
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("list");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [sortBy, setSortBy] = useState("Newest");
  const [page, setPage] = useState(1);
  const [assets, setAssets] = useState([]);
  const [summary, setSummary] = useState(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [assetsRes, summaryRes] = await Promise.all([
          getAssets({ search, page, type: typeFilter, sort: sortBy }),
          getAssetSummary(),
        ]);
        if (cancelled) return;
        const list = Array.isArray(assetsRes) ? assetsRes : assetsRes?.list ?? [];
        setAssets(list);
        setTotal(assetsRes?.total ?? list.length);
        setSummary(summaryRes);
      } catch {
        if (!cancelled) setAssets([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [search, page, typeFilter, sortBy]);

  const s = summary || { total: 1284, needsAttention: 12, upcomingService: 48, uptimeRate: 99.8 };
  const perPage = 4;
  const totalPages = Math.ceil(total / perPage) || 1;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#0d121b]">Asset Management</h2>
        <p className="text-sm text-gray-500 mt-0.5">Monitor, track, and schedule maintenance for critical facility infrastructure.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Assets</h4>
          <p className="text-2xl font-bold text-[#0d121b] mt-1">{loading ? "—" : s.total?.toLocaleString() ?? "1,284"}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Needs Attention</h4>
          <p className="text-2xl font-bold text-red-600 mt-1">{loading ? "—" : s.needsAttention ?? "12"}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Upcoming Service</h4>
          <p className="text-2xl font-bold text-[#0d121b] mt-1">{loading ? "—" : s.upcomingService ?? "48"}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Uptime Rate</h4>
          <p className="text-2xl font-bold text-green-600 mt-1">{loading ? "—" : `${s.uptimeRate ?? 99.8}%`}</p>
        </div>
      </div>

      {/* Search, filters, view toggle */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Q</span>
          <input
            type="text"
            placeholder="Search HVAC, Elevator, ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg bg-white text-sm outline-none focus:ring-2 focus:ring-[#1f2937]/20"
          />
        </div>
        <div className="flex rounded-lg overflow-hidden border border-gray-300">
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={`px-4 py-2 text-sm font-medium ${viewMode === "list" ? "bg-[#1f2937] text-white" : "bg-white text-gray-700 hover:bg-gray-50"}`}
          >
            List View
          </button>
          <button
            type="button"
            onClick={() => setViewMode("map")}
            className={`px-4 py-2 text-sm font-medium ${viewMode === "map" ? "bg-[#1f2937] text-white" : "bg-white text-gray-700 hover:bg-gray-50"}`}
          >
            Map View
          </button>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
          Filters
        </button>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-sm"
        >
          <option>All Types</option>
          <option>HVAC</option>
          <option>Elevator</option>
          <option>Generator</option>
          <option>Ventilation</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-sm"
        >
          <option>Sort by: Newest</option>
          <option>Sort by: Oldest</option>
          <option>Sort by: Condition</option>
          <option>Sort by: Next Service</option>
        </select>
      </div>

      {/* Asset table (or map placeholder) */}
      {viewMode === "map" ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
          <p className="font-medium text-[#0d121b]">Map View</p>
          <p className="text-sm mt-1">Map integration coming soon.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500 tracking-wide">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold">Asset Name</th>
                  <th className="text-left py-3 px-4 font-semibold">Location</th>
                  <th className="text-left py-3 px-4 font-semibold">Condition</th>
                  <th className="text-left py-3 px-4 font-semibold">Last Maint.</th>
                  <th className="text-left py-3 px-4 font-semibold">Next Service</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan={5} className="py-8 text-center text-gray-500">Loading...</td></tr>
                ) : assets.length === 0 ? (
                  <tr><td colSpan={5} className="py-8 text-center text-gray-500">No assets found</td></tr>
                ) : (
                  assets.map((a) => (
                    <tr key={a.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <span className="flex items-center gap-2">
                          <span className="text-base" aria-hidden>◉</span>
                          <div>
                            <p className="font-medium text-[#0d121b]">{a.name}</p>
                            <p className="text-xs text-gray-500">ID: {a.id}</p>
                          </div>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-700">{a.location}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${a.conditionClass || "bg-gray-100 text-gray-800"}`}>
                          {a.condition}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{a.lastMaint}</td>
                      <td className={`py-3 px-4 font-medium ${a.nextServiceUrgent ? "text-red-600" : "text-gray-700"}`}>
                        {a.nextService}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 py-3 px-4 border-t border-gray-200 bg-gray-50/50">
            <p className="text-sm text-gray-600">Showing 1 to {Math.min(perPage, assets.length)} of {total} assets</p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 rounded border border-gray-300 bg-white text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              {[1, 2, 3].filter((n) => n <= totalPages).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPage(n)}
                  className={`min-w-[32px] py-1.5 rounded border text-sm font-medium ${page === n ? "bg-[#1f2937] text-white border-[#1f2937]" : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"}`}
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 rounded border border-gray-300 bg-white text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
