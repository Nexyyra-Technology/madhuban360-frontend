export default function Tasks() {
  return (
    <>
      <div className="page-header">
        <h1>Task Pipeline</h1>
        <button className="btn-primary">Create Task</button>
      </div>

      <div className="kanban">
        <div className="kanban-column">
          <h3>TO-DO</h3>
          <div className="task-card">HVAC Repair</div>
        </div>
        <div className="kanban-column">
          <h3>IN PROGRESS</h3>
          <div className="task-card">Deep Cleaning</div>
        </div>
        <div className="kanban-column">
          <h3>REVIEW</h3>
          <div className="task-card">Roof Inspection</div>
        </div>
      </div>
    </>
  );
}
