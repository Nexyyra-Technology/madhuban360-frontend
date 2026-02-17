<<<<<<< HEAD
export default function Calendar() {
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="card">
      <h3>October 2023</h3>
      <div className="calendar">
        {days.map(day => (
          <div key={day} className="calendar-day">
            {day}
          </div>
        ))}
      </div>
    </div>
  );
}
=======
export default function Calendar() {
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="card">
      <h3>October 2023</h3>
      <div className="calendar">
        {days.map(day => (
          <div key={day} className="calendar-day">
            {day}
          </div>
        ))}
      </div>
    </div>
  );
}
>>>>>>> 7ff153fd9903c7bdd2dfd4b33e67df74f3f33c8f
