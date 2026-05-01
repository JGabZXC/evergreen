
export default function RoomsRegistrar() {
  const rooms = [
    { id: 1, name: "Auditorium", capacity: 200, building: "Main" },
    { id: 2, name: "Room 101", capacity: 35, building: "Science Wing" },
    { id: 3, name: "Lab A", capacity: 24, building: "Tech Block" },
  ];

  return (
    <div className="w-full">
      <div className="card bg-base-100 shadow-sm p-4">
        <h3 className="text-xl font-bold mb-2">Rooms</h3>
        <p className="text-sm text-base-content/70 mb-4">A simple list of rooms managed by the registrar.</p>

        <div className="overflow-x-auto">
          <table className="table table-compact w-full">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Capacity</th>
                <th>Building</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{r.name}</td>
                  <td>{r.capacity}</td>
                  <td>{r.building}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

