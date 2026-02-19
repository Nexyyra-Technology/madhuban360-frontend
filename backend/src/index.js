/**
 * Madhuban360 Backend API
 * =======================
 * Serves /api/* - proxy from Vite (localhost:5001).
 * Replace in-memory stores with real DB (MongoDB, Postgres) for production.
 */

import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { v4 as uuidv4 } from "uuid";

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

// -----------------------------------------------------------------------------
// IN-MEMORY STORES (replace with database in production)
// -----------------------------------------------------------------------------
let properties = [
  { id: "1", name: "Grand Plaza Office Tower", location: "Downtown Financial District, NY", category: "COMMERCIAL", image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab", totalUnits: 245, unitsSold: 240, unitsUnsold: 5, amcStatus: "ACTIVE", amcColor: "text-green-600" },
  { id: "2", name: "Blue Water Residences", location: "Bayfront Avenue, Miami", category: "RESIDENTIAL", image: "https://images.unsplash.com/photo-1560185127-6ed189bf02f4", totalUnits: 120, unitsSold: 118, unitsUnsold: 2, amcStatus: "ACTIVE", amcColor: "text-green-600" },
  { id: "3", name: "Metro Logistics Hub", location: "Industrial Park, Chicago", category: "INDUSTRIAL", image: "https://images.unsplash.com/photo-1567401898914-159092af3f38", totalUnits: 48, unitsSold: 48, unitsUnsold: 0, amcStatus: "EXPIRED", amcColor: "text-red-600", isExpired: true },
  { id: "4", name: "Riverside Retail Complex", location: "Riverside Drive, LA", category: "COMMERCIAL", image: "https://images.unsplash.com/photo-1497366216548-37526070297c", totalUnits: 85, unitsSold: 80, unitsUnsold: 5, amcStatus: "EXPIRING SOON", amcColor: "text-amber-600" },
  { id: "5", name: "Park View Apartments", location: "Central Park West, NY", category: "RESIDENTIAL", image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00", totalUnits: 200, unitsSold: 184, unitsUnsold: 16, amcStatus: "ACTIVE", amcColor: "text-green-600" },
];

const assets = [
  { id: "FAC-HVAC-004", name: "Chiller Unit #4", location: "Roof West - Section A", condition: "Excellent", conditionClass: "bg-emerald-100 text-emerald-800", lastMaint: "Oct 12, 2023", nextService: "Jan 15, 2024", nextServiceUrgent: false },
  { id: "FAC-ELV-012", name: "Elevator B", location: "Main Lobby - South Bank", condition: "Good", conditionClass: "bg-blue-100 text-blue-800", lastMaint: "Nov 05, 2023", nextService: "Feb 05, 2024", nextServiceUrgent: false },
  { id: "FAC-PWR-001", name: "Generator 01", location: "Basement Mech Room", condition: "Fair", conditionClass: "bg-amber-100 text-amber-800", lastMaint: "Sep 20, 2023", nextService: "Dec 20, 2023", nextServiceUrgent: true },
  { id: "FAC-VENT-012", name: "Exhaust Fan #12", location: "North Wing - Attic", condition: "Poor", conditionClass: "bg-red-100 text-red-800", lastMaint: "Aug 15, 2023", nextService: "ASAP", nextServiceUrgent: true },
];

let users = [
  { _id: "1", name: "Johnathan Doe", email: "j.doe@example.com", phone: "+1 (555) 902-3481", role: "Admin", status: "Active", jobTitle: "Senior Facility Manager" },
  { _id: "2", name: "Sarah Chen", email: "s.chen@example.com", phone: "+1 (555) 123-4567", role: "Manager", status: "Active", jobTitle: "Facility Manager" },
];

const reports = [
  { id: "1", name: "Q3 Financial Audit 2023", category: "Financial", generatedDate: "Oct 24, 2023" },
  { id: "2", name: "Monthly Energy Log - Portfolio", category: "Sustainability", generatedDate: "Oct 20, 2023" },
  { id: "3", name: "HVAC Maintenance Performance", category: "Operational", generatedDate: "Oct 18, 2023" },
  { id: "4", name: "Security Incident Annual Review", category: "Operational", generatedDate: "Oct 15, 2023" },
];

// -----------------------------------------------------------------------------
// PROPERTIES API (GET, POST - persists to store/database)
// -----------------------------------------------------------------------------
app.get("/api/properties", (req, res) => {
  res.json(properties);
});

app.get("/api/properties/summary", (req, res) => {
  const total = properties.length;
  const activeAmc = properties.filter((p) => p.amcStatus === "ACTIVE").length;
  const expiringAmc = properties.filter((p) => p.amcStatus === "EXPIRING SOON").length;
  const sold = properties.reduce((s, p) => s + (p.unitsSold || 0), 0);
  const totalUnits = properties.reduce((s, p) => s + (p.totalUnits || 0), 1);
  const occupancyPercent = Math.round((sold / totalUnits) * 100);
  res.json({ total, activeAmc, expiringAmc, occupancyPercent: Math.min(100, occupancyPercent) });
});

app.get("/api/properties/:id", (req, res) => {
  const p = properties.find((x) => String(x.id) === String(req.params.id));
  if (!p) return res.status(404).json({ error: "Property not found" });
  res.json(p);
});

app.post("/api/properties", (req, res) => {
  const body = req.body || {};
  const id = String(uuidv4()).slice(0, 8);
  const newProp = {
    id,
    name: body.name || "New Property",
    location: [body.address, body.city, body.stateProvince, body.zipCode].filter(Boolean).join(", ") || "—",
    category: body.type || "COMMERCIAL",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab",
    totalUnits: body.totalUnits ?? 0,
    unitsSold: body.unitsSold ?? 0,
    unitsUnsold: body.unitsUnsold ?? 0,
    amcStatus: "ACTIVE",
    amcColor: "text-green-600",
  };
  properties.push(newProp);
  res.status(201).json(newProp);
});

// -----------------------------------------------------------------------------
// ASSETS API
// -----------------------------------------------------------------------------
app.get("/api/assets", (req, res) => {
  res.json({ list: assets, total: 150 });
});

app.get("/api/assets/summary", (req, res) => {
  res.json({ total: 1284, needsAttention: 12, upcomingService: 48, uptimeRate: 99.8 });
});

// -----------------------------------------------------------------------------
// REPORTS API
// -----------------------------------------------------------------------------
app.get("/api/reports", (req, res) => {
  res.json({ list: reports });
});

app.get("/api/reports/analytics", (req, res) => {
  res.json({
    kpis: [
      { label: "TOTAL SPEND", value: "$42,500", trend: "-5.2% vs last month", trendDown: true },
      { label: "TASK COMPLETION", value: "94.2%", trend: "+2.8% vs last month", trendDown: false },
      { label: "ENERGY USAGE", value: "4.2k kWh", trend: "-2.1% efficiency drop", trendDown: true },
    ],
    chartData: {
      costsVsBudget: [
        { name: "Jan", actual: 38, budget: 40 },
        { name: "Feb", actual: 42, budget: 42 },
        { name: "Mar", actual: 45, budget: 44 },
        { name: "Apr", actual: 41, budget: 46 },
      ],
      taskTrends: [
        { name: "WK 1", completed: 24 },
        { name: "WK 2", completed: 28 },
        { name: "WK 3", completed: 22 },
        { name: "WK 4", completed: 30 },
      ],
      energyByProperty: [
        { name: "North Wing", value: 35, color: "#3b82f6" },
        { name: "South Hub", value: 28, color: "#ef4444" },
        { name: "West Plaza", value: 22, color: "#f59e0b" },
        { name: "Other", value: 15, color: "#10b981" },
      ],
    },
  });
});

// -----------------------------------------------------------------------------
// DASHBOARD API
// -----------------------------------------------------------------------------
app.get("/api/dashboard/metrics", (_req, res) => {
  res.json({
    totalProperties: properties.length,
    activeProperties: properties.filter((p) => p.amcStatus === "ACTIVE").length,
    inactiveProperties: properties.filter((p) => p.amcStatus !== "ACTIVE").length,
    propertiesTrend: 4.2,
    totalUsers: users.length,
    admins: users.filter((u) => u.role === "Admin").length,
    staff: users.filter((u) => u.role !== "Admin").length,
    usersTrend: "stable",
    openTasks: 18,
    dueToday: 8,
    attendancePercent: 92,
    attendanceTrend: 2,
  });
});
app.get("/api/dashboard/sales-pipeline", (_req, res) => {
  res.json({
    data: [
      { name: "Leads", value: 28, fill: "#93c5fd" },
      { name: "Proposals", value: 18, fill: "#93c5fd" },
      { name: "Negot.", value: 12, fill: "#93c5fd" },
      { name: "Closed", value: 8, fill: "#93c5fd" },
    ],
    summary: { value: 42000, trend: 12.5, label: "from last month" },
  });
});
app.get("/api/dashboard/revenue", (_req, res) => {
  res.json({
    data: [
      { name: "JAN", revenue: 80, uv: 80 },
      { name: "FEB", revenue: 95, uv: 95 },
      { name: "MAR", revenue: 100, uv: 100 },
      { name: "APR", revenue: 105, uv: 105 },
      { name: "MAY", revenue: 115, uv: 115 },
      { name: "JUN", revenue: 128, uv: 128 },
    ],
    summary: { value: 128500, trend: 8.2, label: "Year-to-date" },
  });
});
app.get("/api/dashboard/alerts", (_req, res) => {
  res.json([
    { id: "1", title: "Elevator Failure - Block A North", reportedBy: "Security (Main Desk)", timeAgo: "12 mins ago", urgency: "URGENT", icon: "building" },
    { id: "2", title: "Light Outage - Hallway Level 4", reportedBy: "Staff (Maintenance)", timeAgo: "1 hour ago", urgency: "MEDIUM", icon: "light" },
    { id: "3", title: "Water Leakage - Basement Parking", reportedBy: "Automated Sensor B12", timeAgo: "3 hours ago", urgency: "URGENT", icon: "water" },
  ]);
});
app.get("/api/dashboard/activity", (_req, res) => {
  res.json([
    { id: "1", text: "Monthly AMC report generated", source: "System", timeAgo: "5 mins ago" },
    { id: "2", text: "John Doe created task #TK-9021", source: "Personnel", timeAgo: "45 mins ago" },
  ]);
});

// -----------------------------------------------------------------------------
// USERS API (for UserManagement - add DB persistence as needed)
// -----------------------------------------------------------------------------
app.get("/api/users", (_req, res) => res.json(users));
app.get("/api/users/:id", (req, res) => {
  const u = users.find((x) => String(x._id) === String(req.params.id));
  if (!u) return res.status(404).json({ error: "User not found" });
  res.json(u);
});

// Health check
app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

const PORT = Number(process.env.PORT || 5001);
app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
