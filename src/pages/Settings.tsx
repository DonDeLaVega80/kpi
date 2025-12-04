import { Card } from "@/components/ui/card";
import { Settings as SettingsIcon, Sliders, Database, Palette } from "lucide-react";

export function Settings() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Configure application preferences and KPI calculation parameters
        </p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {/* KPI Configuration Section */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <Sliders className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">KPI Configuration</h2>
              <p className="text-sm text-muted-foreground">
                Adjust how KPI scores are calculated
              </p>
            </div>
          </div>
          <div className="pl-14">
            <p className="text-sm text-muted-foreground">
              Configure delivery and quality score weights, and bug severity penalties.
              <br />
              <span className="text-xs italic">Coming in Phase 9.2</span>
            </p>
          </div>
        </Card>

        {/* Data Management Section */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
              <Database className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Data Management</h2>
              <p className="text-sm text-muted-foreground">
                Backup, restore, and manage your data
              </p>
            </div>
          </div>
          <div className="pl-14">
            <p className="text-sm text-muted-foreground">
              Create backups, export/import data, and manage your database.
              <br />
              <span className="text-xs italic">Coming in Phase 9.3</span>
            </p>
          </div>
        </Card>

        {/* App Preferences Section */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
              <Palette className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">App Preferences</h2>
              <p className="text-sm text-muted-foreground">
                Customize application appearance and behavior
              </p>
            </div>
          </div>
          <div className="pl-14">
            <p className="text-sm text-muted-foreground">
              Configure theme, date formats, and other application preferences.
              <br />
              <span className="text-xs italic">Coming in Phase 9.4</span>
            </p>
          </div>
        </Card>

        {/* About Section */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-500/10">
              <SettingsIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">About</h2>
              <p className="text-sm text-muted-foreground">
                Application information and version
              </p>
            </div>
          </div>
          <div className="pl-14 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Version</span>
              <span className="text-sm text-muted-foreground">0.1.0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Database Location</span>
              <span className="text-sm text-muted-foreground font-mono text-xs">
                ~/Library/Application Support/kpi-tool/kpi.db
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Framework</span>
              <span className="text-sm text-muted-foreground">Tauri 2.x</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
