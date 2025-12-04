import { useTickets } from "@/hooks/useTickets";

const statusColors: Record<string, string> = {
  assigned: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  review: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  reopened: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export function Tickets() {
  const { tickets, loading, error } = useTickets();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tickets</h1>
          <p className="text-muted-foreground">
            Track ticket assignments and progress
          </p>
        </div>
        <button className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          + Create Ticket
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading tickets...</p>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {!loading && !error && tickets.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <span className="text-4xl">🎫</span>
          <h3 className="mt-4 text-lg font-semibold">No tickets yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first ticket to start tracking work
          </p>
        </div>
      )}

      {!loading && !error && tickets.length > 0 && (
        <div className="rounded-lg border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-medium">Title</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Due Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Complexity</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Reopens</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="border-b last:border-0">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">{ticket.title}</p>
                      {ticket.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {ticket.description}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        statusColors[ticket.status] || statusColors.assigned
                      }`}
                    >
                      {ticket.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {ticket.dueDate}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm capitalize">{ticket.complexity}</span>
                  </td>
                  <td className="px-4 py-3">
                    {ticket.reopenCount > 0 ? (
                      <span className="text-red-600 dark:text-red-400">
                        {ticket.reopenCount}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
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
