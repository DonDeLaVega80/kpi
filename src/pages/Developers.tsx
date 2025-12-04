import { useState, useMemo } from "react";
import { useDevelopers } from "@/hooks/useDevelopers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DataTable,
  Column,
  StatusBadge,
  DeveloperRoleBadge,
} from "@/components/ui/";
import { DeveloperFormDialog } from "@/components/developers/DeveloperFormDialog";
import type { Developer, CreateDeveloperInput, UpdateDeveloperInput } from "@/types";

export function Developers() {
  const { developers, loading, error, createDeveloper, refresh } = useDevelopers();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Filter developers based on search and status
  const filteredDevelopers = useMemo(() => {
    return developers.filter((dev) => {
      // Search filter
      const searchLower = search.toLowerCase();
      const matchesSearch =
        !search ||
        dev.name.toLowerCase().includes(searchLower) ||
        dev.email.toLowerCase().includes(searchLower) ||
        dev.team?.toLowerCase().includes(searchLower);

      // Status filter
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && dev.isActive) ||
        (statusFilter === "inactive" && !dev.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [developers, search, statusFilter]);

  // Table columns configuration
  const columns: Column<Developer>[] = [
    {
      key: "name",
      header: "Name",
      cell: (dev) => (
        <div>
          <p className="font-medium">{dev.name}</p>
          <p className="text-sm text-muted-foreground">{dev.email}</p>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      cell: (dev) => <DeveloperRoleBadge role={dev.role} />,
    },
    {
      key: "team",
      header: "Team",
      cell: (dev) => (
        <span className="text-muted-foreground">{dev.team || "—"}</span>
      ),
    },
    {
      key: "startDate",
      header: "Start Date",
      cell: (dev) => (
        <span className="text-muted-foreground">{dev.startDate}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (dev) => (
        <StatusBadge
          status={dev.isActive ? "Active" : "Inactive"}
          variant={dev.isActive ? "success" : "default"}
        />
      ),
    },
  ];

  const handleCreateDeveloper = async (data: CreateDeveloperInput | UpdateDeveloperInput) => {
    // For create mode, we only receive CreateDeveloperInput
    await createDeveloper(data as CreateDeveloperInput);
    setIsFormOpen(false);
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Developers</h1>
          <p className="text-muted-foreground">Manage your team members</p>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          <Button variant="outline" size="sm" className="mt-2" onClick={refresh}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Developers</h1>
          <p className="text-muted-foreground">
            Manage your team members ({filteredDevelopers.length} of {developers.length})
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>+ Add Developer</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex-1">
          <Input
            placeholder="Search by name, email, or team..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={statusFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("all")}
          >
            All
          </Button>
          <Button
            variant={statusFilter === "active" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("active")}
          >
            Active
          </Button>
          <Button
            variant={statusFilter === "inactive" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("inactive")}
          >
            Inactive
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={filteredDevelopers}
        columns={columns}
        loading={loading}
        getRowKey={(dev) => dev.id}
        emptyState={{
          icon: "👥",
          title: search || statusFilter !== "all" ? "No developers found" : "No developers yet",
          description:
            search || statusFilter !== "all"
              ? "Try adjusting your search or filter criteria"
              : "Get started by adding your first team member",
          action:
            !search && statusFilter === "all" ? (
              <Button onClick={() => setIsFormOpen(true)}>+ Add Developer</Button>
            ) : undefined,
        }}
      />

      {/* Create Developer Dialog */}
      <DeveloperFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleCreateDeveloper}
      />
    </div>
  );
}
