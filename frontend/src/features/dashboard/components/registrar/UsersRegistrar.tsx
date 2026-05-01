import React from "react";

export default function UsersRegistrar() {
  // Simple mock users for the registrar dashboard
  const users = [
	{ id: 1, name: "Alice Johnson", email: "alice.johnson@example.com", role: "STUDENT" },
	{ id: 2, name: "Bob Smith", email: "bob.smith@example.com", role: "TEACHER" },
	{ id: 3, name: "Carol Lee", email: "carol.lee@example.com", role: "REGISTRAR" },
  ];

  return (
	<div className="w-full">
	  <div className="card bg-base-100 shadow-sm p-4">
		<h3 className="text-xl font-bold mb-2">Users</h3>
		<p className="text-sm text-base-content/70 mb-4">A simple list of users for the registrar.</p>

		<div className="overflow-x-auto">
		  <table className="table table-compact w-full">
			<thead>
			  <tr>
				<th>ID</th>
				<th>Name</th>
				<th>Email</th>
				<th>Role</th>
			  </tr>
			</thead>
			<tbody>
			  {users.map((u) => (
				<tr key={u.id}>
				  <td>{u.id}</td>
				  <td>{u.name}</td>
				  <td>{u.email}</td>
				  <td>
					<span className="badge badge-outline">{u.role}</span>
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
