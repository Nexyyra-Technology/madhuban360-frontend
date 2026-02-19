/**
 * Reports Tab (Analytics & Reports)
 * ---------------------------------
 * Data from backend: getReports(), getReportsAnalytics()
 * Backend: GET /api/reports, GET /api/reports/analytics
 */

import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import { getReports, getReportsAnalytics } from "./propertyService";

const ANALYTICS_TABS = ["Overview", "Financial", "Operational", "Sustainability"];

const CHART_COLORS = ["#1f2937", "#3b82f6", "#f59e0b", "#10b981"];

export default function ReportsTab() {
  const [period, setPeriod] = useState("Last 30 Days");
  const [analyticsTab, setAnalyticsTab] = useState("Overview");
  const [reports, setReports] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [reportsRes, analyticsRes] = await Promise.all([
          getReports({ period }),
          getReportsAnalytics({ period }),
        ]);
        if (cancelled) return;
        const list = Array.isArray(reportsRes) ? reportsRes : reportsRes?.list ?? [];
        setReports(list);
        setAnalytics(analyticsRes);
      } catch {
        if (!cancelled) setReports([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [period]);

  const kpis = analytics?.kpis ?? [
    { label: "TOTAL SPEND", value: "$42,500", trend: "-5.2% vs last month", trendDown: true },
    { label: "TASK COMPLETION", value: "94.2%", trend: "+2.8% vs last month", trendDown: false },
    { label: "ENERGY USAGE", value: "4.2k kWh", trend: "-2.1% efficiency drop", trendDown: true },
  ];

  const costsData = analytics?.chartData?.costsVsBudget ?? [
    { name: "Jan", actual: 38, budget: 40 },
    { name: "Feb", actual: 42, budget: 42 },
    { name: "Mar", actual: 45, budget: 44 },
    { name: "Apr", actual: 41, budget: 46 },
  ];

  const taskData = analytics?.chartData?.taskTrends ?? [
    { name: "WK 1", completed: 24 },
    { name: "WK 2", completed: 28 },
    { name: "WK 3", completed: 22 },
    { name: "WK 4", completed: 30 },
  ];

  const energyData = analytics?.chartData?.energyByProperty ?? [
    { name: "North Wing", value: 35, color: "#3b82f6" },
    { name: "South Hub", value: 28, color: "#ef4444" },
    { name: "West Plaza", value: 22, color: "#f59e0b" },
    { name: "Other", value: 15, color: "#10b981" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0d121b]">Analytics & Reports</h2>
          <p className="text-sm text-gray-500 mt-0.5">Monitor facility performance, maintenance trends, and energy efficiency</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm"
          >
            <option>Last 30 Days</option>
            <option>Last 7 Days</option>
            <option>Last 90 Days</option>
          </select>
          <button className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
            Export All
          </button>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-2">
        {ANALYTICS_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setAnalyticsTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${analyticsTab === tab ? "bg-[#1f2937] text-white" : "text-gray-600 hover:bg-gray-100"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {kpis.map((k, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{k.label}</h4>
                <p className="text-2xl font-bold text-[#0d121b] mt-1">{k.value}</p>
                <p className={`text-sm mt-1 ${k.trendDown ? "text-red-600" : "text-green-600"}`}>{k.trend}</p>
              </div>
              <span className="text-2xl" aria-hidden>{i === 1 ? "✓" : "~"}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h4 className="text-sm font-semibold text-[#0d121b] mb-3">Costs vs Budget</h4>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={costsData}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Area type="monotone" dataKey="actual" stroke="#3b82f6" fill="#93c5fd" fillOpacity={0.4} />
                <Area type="monotone" dataKey="budget" stroke="#9ca3af" strokeDasharray="4 4" fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-gray-500 mt-2">4.2k TOTAL KWH</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h4 className="text-sm font-semibold text-[#0d121b] mb-3">Task Trends</h4>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={taskData}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Area type="monotone" dataKey="completed" stroke="#1f2937" fill="#1f2937" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-gray-500 mt-2">Completed tasks per week</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h4 className="text-sm font-semibold text-[#0d121b] mb-3">Energy by Property</h4>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={energyData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={2} dataKey="value">
                  {energyData.map((e, i) => (
                    <Cell key={i} fill={e.color || CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3 mt-2">
            {energyData.map((e, i) => (
              <span key={i} className="flex items-center gap-1.5 text-xs text-gray-600">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: e.color || CHART_COLORS[i] }} />
                {e.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Reports table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-b border-gray-200">
          <h3 className="font-semibold text-[#0d121b]">Recent Reports</h3>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50">Filters</button>
            <button className="p-2 rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50">Search</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 tracking-wide">
              <tr>
                <th className="text-left py-3 px-4 font-semibold">Report Name</th>
                <th className="text-left py-3 px-4 font-semibold">Category</th>
                <th className="text-left py-3 px-4 font-semibold">Generated Date</th>
                <th className="text-left py-3 px-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={4} className="py-8 text-center text-gray-500">Loading...</td></tr>
              ) : reports.length === 0 ? (
                <tr><td colSpan={4} className="py-8 text-center text-gray-500">No reports</td></tr>
              ) : (
                reports.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-[#0d121b]">{r.name}</td>
                    <td className="py-3 px-4 text-gray-600">{r.category}</td>
                    <td className="py-3 px-4 text-gray-600">{r.generatedDate}</td>
                    <td className="py-3 px-4">
                      <button type="button" className="text-[#1f2937] font-medium hover:underline">Download</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-200">
          <button type="button" className="text-sm font-medium text-[#1f2937] hover:underline">
            View All Historical Reports
          </button>
        </div>
      </div>
    </div>
  );
}
