// Simple mock database for demonstration in a single session
// In production, this would be MongoDB or PostgreSQL

export interface Report {
  id: string;
  userId: string;
  type: string;
  description: string;
  location: string;
  status: "pending" | "in-progress" | "resolved";
  assignedTo: string | null;
  createdAt: number;
}

// Memory-based storage for the demo
let reports: Report[] = [
  {
    id: "REP-1024",
    userId: "anon-uuid-1",
    type: "Harassment",
    description: "Verbal harassment at the central park entrance.",
    location: "Central Park West",
    status: "pending",
    assignedTo: null,
    createdAt: Date.now() - 3600000 * 2,
  },
  {
    id: "REP-1025",
    userId: "anon-uuid-2",
    type: "Suspicious Activity",
    description: "Unidentified individual following people near the metro station.",
    location: "Downtown Metro",
    status: "in-progress",
    assignedTo: "Officer Smith",
    createdAt: Date.now() - 3600000 * 5,
  }
];

export const db = {
  getReports: () => reports,
  addReport: (report: Omit<Report, "id" | "status" | "assignedTo" | "createdAt">) => {
    const newReport: Report = {
      ...report,
      id: `REP-${Math.floor(1000 + Math.random() * 9000)}`,
      status: "pending",
      assignedTo: null,
      createdAt: Date.now(),
    };
    reports = [newReport, ...reports];
    return newReport;
  },
  updateReportStatus: (id: string, status: Report["status"], assignedTo?: string) => {
    reports = reports.map(r => 
      r.id === id ? { ...r, status, assignedTo: assignedTo !== undefined ? assignedTo : r.assignedTo } : r
    );
    return reports.find(r => r.id === id);
  }
};
