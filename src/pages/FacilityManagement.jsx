export default function Issues() {
  return (
    <>
      <div className="page-header">
        <h1>Issue Management</h1>
        <button className="btn-primary">Report Issue</button>
      </div>

      <div className="grid-2">
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Issue</th>
                <th>Priority</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Main Elevator Malfunction</td>
                <td><span className="badge danger">Critical</span></td>
                <td>Open</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="card">
          <h3>Maintenance Scheduler</h3>
          <p>Calendar placeholder</p>
        </div>
      </div>
    </>
  );
}
