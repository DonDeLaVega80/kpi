import { useState, useMemo } from "react";
import { useDevelopers } from "@/hooks/useDevelopers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DataTable,
  Column,
  StatusBadge,
  DeveloperRoleBadge,
  ConfirmDialog,
} from "@/components/ui/";
import { DeveloperFormDialog, DeveloperCard } from "@/components/developers";
import type { Developer, CreateDeveloperInput, UpdateDeveloperInput } from "@/types";

export function Developers() {
  const { developers, loading, error, createDeveloper, updateDeveloper, deleteDeveloper, refresh } = useDevelopers();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDeveloper, setEditingDeveloper] = useState<Developer | undefined>();
  const [viewingDeveloper, setViewingDeveloper] = useState<Developer | undefined>();
  const [deactivatingDeveloper, setDeactivatingDeveloper] = useState<Developer | undefined>();
  const [isDeactivating, setIsDeactivating] = useState(false);

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
    {
      key: "actions",
      header: "",
      className: "w-[100px]",
      cell: (dev) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(dev);
            }}
          >
            ✏️
          </Button>
          {dev.isActive && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setDeactivatingDeveloper(dev);
              }}
            >
              🚫
            </Button>
          )}
        </div>
      ),
    },
  ];

  const handleRowClick = (developer: Developer) => {
    setViewingDeveloper(developer);
  };

  const handleEdit = (developer: Developer) => {
    setViewingDeveloper(undefined); // Close detail card if open
    setEditingDeveloper(developer);
    setIsFormOpen(true);
  };

  const handleCreateOrUpdate = async (data: CreateDeveloperInput | UpdateDeveloperInput) => {
    if (editingDeveloper) {
      // Edit mode
      await updateDeveloper({
        id: editingDeveloper.id,
        ...data,
      } as UpdateDeveloperInput);
    } else {
      // Create mode
      await createDeveloper(data as CreateDeveloperInput);
    }
    setIsFormOpen(false);
    setEditingDeveloper(undefined);
  };

  const handleDeactivate = async () => {
    if (!deactivatingDeveloper) return;
    
    setIsDeactivating(true);
    try {
      await deleteDeveloper(deactivatingDeveloper.id);
      setDeactivatingDeveloper(undefined);
      setViewingDeveloper(undefined); // Close detail card if the deactivated developer was being viewed
    } finally {
      setIsDeactivating(false);
    }
  };

  const handleFormClose = (open: boolean) => {
    setIsFormOpen(open);
    if (!open) {
      setEditingDeveloper(undefined);
    }
  };

  const handleDeactivateFromCard = () => {
    if (viewingDeveloper) {
      setDeactivatingDeveloper(viewingDeveloper);
    }
  };

  if (error) {
    const isCorrupted = error.toLowerCase().includes("corrupt") || 
                        error.toLowerCase().includes("malformed") ||
                        error.toLowerCase().includes("not a database");
    
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Developers</h1>
          <p className="text-muted-foreground">Manage your team members</p>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800 mb-2">
            {isCorrupted ? "Database Corruption Detected" : "Error"}
          </p>
          <p className="text-sm text-red-600 mb-3">{error}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={refresh}>
              Try Again
            </Button>
            {isCorrupted && (
              <Button 
                variant="default" 
                size="sm" 
                onClick={() => window.location.href = "/settings"}
              >
                Go to Settings to Restore
              </Button>
            )}
          </div>
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
        onRowClick={handleRowClick}
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

      {/* Developer Detail Card */}
      {viewingDeveloper && (
        <DeveloperCard
          developer={viewingDeveloper}
          open={!!viewingDeveloper}
          onOpenChange={(open) => !open && setViewingDeveloper(undefined)}
          onEdit={() => handleEdit(viewingDeveloper)}
          onDeactivate={handleDeactivateFromCard}
        />
      )}

      {/* Create/Edit Developer Dialog */}
      <DeveloperFormDialog
        open={isFormOpen}
        onOpenChange={handleFormClose}
        onSubmit={handleCreateOrUpdate}
        developer={editingDeveloper}
      />

      {/* Deactivate Confirmation Dialog */}
      <ConfirmDialog
        open={!!deactivatingDeveloper}
        onOpenChange={(open) => !open && setDeactivatingDeveloper(undefined)}
        title="Deactivate Developer"
        description={`Are you sure you want to deactivate ${deactivatingDeveloper?.name}? They will no longer appear in active lists, but their historical data will be preserved.`}
        confirmText="Deactivate"
        variant="destructive"
        onConfirm={handleDeactivate}
        loading={isDeactivating}
      />
    </div>
  );
}
