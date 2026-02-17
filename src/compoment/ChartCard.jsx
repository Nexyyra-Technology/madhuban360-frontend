import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  Tooltip
} from "recharts";

const data = [
  { name: "Jan", value: 400 },
  { name: "Feb", value: 700 },
  { name: "Mar", value: 500 },
  { name: "Apr", value: 900 },
  { name: "May", value: 600 }
];

export default function ChartCard() {
  return (
    <div className="card">
      <h3>Revenue Overview</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <XAxis dataKey="name" />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
