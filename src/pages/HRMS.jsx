export default function Attendance() {
  const days = Array.from({length:31}, (_,i)=>i+1);

  return (
    <>
      <div className="page-header">
        <h1>Attendance Dashboard</h1>
      </div>

      <div className="card">
        <h3>October 2023</h3>
        <div className="calendar">
          {days.map(day => <div key={day}>{day}</div>)}
        </div>
      </div>
    </>
  );
}
