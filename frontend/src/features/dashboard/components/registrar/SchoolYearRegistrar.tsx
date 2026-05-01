export default function SchoolYearRegistrar() {
  const years = [
	{ id: 1, name: "2024-2025", start: "2024-08-01", end: "2025-05-31", status: "Active" },
	{ id: 2, name: "2023-2024", start: "2023-08-01", end: "2024-05-31", status: "Closed" },
  ];

  return (
	<div className="w-full">
	  <div className="card bg-base-100 shadow-sm p-4">
		<h3 className="text-xl font-bold mb-2">School Years</h3>
		<p className="text-sm text-base-content/70 mb-4">Manage school years for enrollment and scheduling.</p>

		<div className="overflow-x-auto">
		  <table className="table table-compact w-full">
			<thead>
			  <tr>
				<th>ID</th>
				<th>Year</th>
				<th>Start</th>
				<th>End</th>
				<th>Status</th>
			  </tr>
			</thead>
			<tbody>
			  {years.map((y) => (
				<tr key={y.id}>
				  <td>{y.id}</td>
				  <td>{y.name}</td>
				  <td>{y.start}</td>
				  <td>{y.end}</td>
				  <td>
					<span className="badge badge-outline">{y.status}</span>
				  </td>
				</tr>
			  ))}
			</tbody>
		  </table>
		</div>
	  </div>
	</div>
  );
}



