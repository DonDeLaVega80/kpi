import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileText, FileSpreadsheet, Loader2 } from "lucide-react";
import { save } from "@tauri-apps/plugin-dialog";
import { writeTextFile } from "@tauri-apps/plugin-fs";
import { exportMonthlyKPIAsCSV } from "@/lib/tauri";
import type { MonthlyKPI } from "@/types";

interface ExportButtonProps {
  kpi: MonthlyKPI;
  developerName?: string;
  month: number;
  year: number;
}

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function ExportButton({
  kpi,
  developerName = "Team",
  month,
  year,
}: ExportButtonProps) {
  const [isExportingCSV, setIsExportingCSV] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  const handleExportCSV = async () => {
    setIsExportingCSV(true);
    try {
      // Get CSV content from backend
      const csvContent = await exportMonthlyKPIAsCSV(
        kpi.developerId === "all" ? null : kpi.developerId,
        month,
        year
      );

      if (!csvContent) {
        throw new Error("Failed to generate CSV content");
      }

      // Use Tauri dialog to save file
      const filePath = await save({
        defaultPath: `kpi-report-${developerName.replace(/\s+/g, "-")}-${monthNames[month - 1]}-${year}.csv`,
        filters: [
          {
            name: "CSV",
            extensions: ["csv"],
          },
        ],
      });

      if (!filePath) {
        // User cancelled the dialog
        return;
      }

      // Write file using Tauri fs plugin
      // The path from save() is absolute, so we can use it directly
      await writeTextFile(filePath, csvContent);
      
      // Show success message
      alert(`CSV exported successfully to:\n${filePath}`);
    } catch (error) {
      console.error("Failed to export CSV:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      alert(`Failed to export CSV: ${errorMessage}\n\nPlease check the console for details.`);
    } finally {
      setIsExportingCSV(false);
    }
  };

  const handleExportPDF = async () => {
    setIsExportingPDF(true);
    try {
      // Create HTML for PDF/print
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>KPI Report - ${developerName} - ${monthNames[month - 1]} ${year}</title>
            <style>
              @media print {
                @page {
                  margin: 1cm;
                }
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  color: #000;
                  background: #fff;
                }
                .no-print {
                  display: none;
                }
                h1, h2, h3 {
                  color: #000;
                  page-break-after: avoid;
                }
                .card {
                  page-break-inside: avoid;
                  border: 1px solid #ddd;
                  padding: 1rem;
                  margin: 1rem 0;
                }
                table {
                  width: 100%;
                  border-collapse: collapse;
                  margin: 1rem 0;
                }
                th, td {
                  border: 1px solid #ddd;
                  padding: 0.5rem;
                  text-align: left;
                }
                th {
                  background-color: #f5f5f5;
                }
              }
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                padding: 2rem;
                color: #000;
                background: #fff;
              }
              .header {
                text-align: center;
                margin-bottom: 2rem;
                border-bottom: 2px solid #000;
                padding-bottom: 1rem;
              }
              .summary {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 1rem;
                margin: 2rem 0;
              }
              .summary-card {
                border: 1px solid #ddd;
                padding: 1rem;
                text-align: center;
              }
              .summary-card h3 {
                font-size: 0.875rem;
                color: #666;
                margin-bottom: 0.5rem;
              }
              .summary-card .value {
                font-size: 2rem;
                font-weight: bold;
                color: #000;
              }
              .metrics-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 1rem;
                margin: 1rem 0;
              }
              .metric-item {
                display: flex;
                justify-content: space-between;
                padding: 0.5rem;
                border-bottom: 1px solid #eee;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>KPI Report</h1>
              <h2>${developerName} - ${monthNames[month - 1]} ${year}</h2>
              <p>Generated: ${new Date().toLocaleDateString()}</p>
            </div>

            <div class="summary">
              <div class="summary-card">
                <h3>Delivery Score</h3>
                <div class="value">${kpi.deliveryScore.toFixed(1)}%</div>
                <p style="font-size: 0.75rem; color: #666; margin-top: 0.5rem;">
                  ${kpi.onTimeTickets} / ${kpi.completedTickets} on-time
                </p>
              </div>
              <div class="summary-card">
                <h3>Quality Score</h3>
                <div class="value">${kpi.qualityScore.toFixed(1)}%</div>
                <p style="font-size: 0.75rem; color: #666; margin-top: 0.5rem;">
                  ${kpi.totalBugs} bugs (${kpi.developerErrorBugs} errors)
                </p>
              </div>
              <div class="summary-card">
                <h3>Overall Score</h3>
                <div class="value">${kpi.overallScore.toFixed(1)}%</div>
                <p style="font-size: 0.75rem; color: #666; margin-top: 0.5rem;">
                  Weighted average
                </p>
              </div>
            </div>

            <div class="card">
              <h2>Ticket Metrics</h2>
              <div class="metrics-grid">
                <div class="metric-item">
                  <span>Total Tickets:</span>
                  <strong>${kpi.totalTickets}</strong>
                </div>
                <div class="metric-item">
                  <span>Completed:</span>
                  <strong>${kpi.completedTickets}</strong>
                </div>
                <div class="metric-item">
                  <span>On-Time:</span>
                  <strong>${kpi.onTimeTickets}</strong>
                </div>
                <div class="metric-item">
                  <span>Late:</span>
                  <strong>${kpi.lateTickets}</strong>
                </div>
                <div class="metric-item">
                  <span>Reopened:</span>
                  <strong>${kpi.reopenedTickets}</strong>
                </div>
                <div class="metric-item">
                  <span>On-Time Rate:</span>
                  <strong>${kpi.onTimeRate.toFixed(1)}%</strong>
                </div>
                <div class="metric-item">
                  <span>Avg Delivery Time:</span>
                  <strong>${kpi.avgDeliveryTime.toFixed(1)} days</strong>
                </div>
              </div>
            </div>

            <div class="card">
              <h2>Bug Metrics</h2>
              <div class="metrics-grid">
                <div class="metric-item">
                  <span>Total Bugs:</span>
                  <strong>${kpi.totalBugs}</strong>
                </div>
                <div class="metric-item">
                  <span>Developer Errors:</span>
                  <strong>${kpi.developerErrorBugs}</strong>
                </div>
                <div class="metric-item">
                  <span>Conceptual Bugs:</span>
                  <strong>${kpi.conceptualBugs}</strong>
                </div>
                <div class="metric-item">
                  <span>Other Bugs:</span>
                  <strong>${kpi.otherBugs}</strong>
                </div>
              </div>
            </div>
          </body>
        </html>
      `;

      // Use Tauri dialog to save HTML file (user can open and print to PDF)
      const filePath = await save({
        defaultPath: `kpi-report-${developerName.replace(/\s+/g, "-")}-${monthNames[month - 1]}-${year}.html`,
        filters: [
          {
            name: "HTML",
            extensions: ["html"],
          },
        ],
      });

      if (!filePath) {
        // User cancelled the dialog
        return;
      }

      // Write file using Tauri fs plugin
      // The path from save() is absolute, so we can use it directly
      await writeTextFile(filePath, htmlContent);
      
      // Show success message
      alert(`Report saved successfully!\n\nFile: ${filePath}\n\nOpen the HTML file in your browser and use "Print to PDF" to create a PDF.`);
    } catch (error) {
      console.error("Failed to export PDF:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      alert(`Failed to export report: ${errorMessage}\n\nPlease check the console for details.`);
    } finally {
      setIsExportingPDF(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isExportingCSV || isExportingPDF}>
          {isExportingCSV || isExportingPDF ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Export
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportCSV} disabled={isExportingCSV}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportPDF} disabled={isExportingPDF}>
          <FileText className="mr-2 h-4 w-4" />
          Export as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

