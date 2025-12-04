import { useDevelopers } from "@/hooks/useDevelopers";

export function Developers() {
  const { developers, loading, error } = useDevelopers();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Developers</h1>
          <p className="text-muted-foreground">
            Manage your team members
          </p>
        </div>
        <button className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          + Add Developer
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading developers...</p>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {!loading && !error && developers.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <span className="text-4xl">👥</span>
          <h3 className="mt-4 text-lg font-semibold">No developers yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Get started by adding your first team member
          </p>
        </div>
      )}

      {!loading && !error && developers.length > 0 && (
        <div className="rounded-lg border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Role</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Team</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {developers.map((dev) => (
                <tr key={dev.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium">{dev.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{dev.email}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {dev.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {dev.team || "-"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        dev.isActive
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                      }`}
                    >
                      {dev.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
