import { useRegistrarUsers } from "../../hooks/useRegistrarUsers";

export default function UsersRegistrar() {
  const { data, isLoading, isError, isFetching, params, setParams } = useRegistrarUsers({ page: 1, limit: 10 });

  const onPrev = () => {
	setParams((p) => ({ ...(p ?? {}), page: Math.max((p?.page ?? 1) - 1, 1) }));
  };

  const onNext = () => {
	setParams((p) => ({ ...(p ?? {}), page: (p?.page ?? 1) + 1 }));
  };

  return (
	<div className="w-full">
	  <div className="card bg-base-100 shadow-sm p-4">
		<h3 className="text-xl font-bold mb-2">Users</h3>
		<p className="text-sm text-base-content/70 mb-4">A list of users for the registrar.</p>

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
			  {isLoading ? (
				<tr>
				  <td colSpan={4} className="text-center py-4">Loading...</td>
				</tr>
			  ) : isError ? (
				<tr>
				  <td colSpan={4} className="text-center py-4">Error loading users.</td>
				</tr>
			  ) : (
				(data?.data ?? []).map((item) => (
				  <tr key={item.user.id}>
					<td>{item.user.accountNumber}</td>
					<td>{`${item.userProfile.firstName} ${item.userProfile.middleName ?? ""} ${item.userProfile.lastName}`.replace(/\s+/g, " ").trim()}</td>
					<td>{item.user.email}</td>
					<td>
					  <span className="badge badge-outline">{item.user.role}</span>
					</td>
				  </tr>
				))
			  )}
			</tbody>
		  </table>
		</div>

		<div className="mt-4 flex items-center gap-2">
		  {/* Safely derive currentPage and totalPages with fallbacks to avoid TS2532 */}
		  {(() => {
			const currentPage = data?.meta?.currentPage ?? params?.page ?? 1;
			const totalPages = data?.meta?.totalPages ?? 1;
			return (
			  <>
				<button className="btn btn-sm" onClick={onPrev} disabled={currentPage <= 1 || isFetching}>
				  Prev
				</button>
				<span className="text-sm">Page {currentPage}</span>
				<button className="btn btn-sm" onClick={onNext} disabled={currentPage >= totalPages || isFetching}>
				  Next
				</button>
			  </>
			);
		  })()}
		</div>
	  </div>
	</div>
  );
}
