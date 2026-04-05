import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'db.json');

export interface Report {
  id: string;
  userId: string;
  type: string;
  description: string;
  location: string;
  status: "pending" | "in-progress" | "resolved";
  assignedTo: string | null;
  createdAt: number;
  lat?: number;
  lng?: number;
}

const getDB = () => {
  if (!fs.existsSync(DB_PATH)) {
    return { reports: [] };
  }
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
};

const saveDB = (data: { reports: Report[] }) => {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
};

export const db = {
  getReports: async () => {
    return getDB().reports;
  },
  addReport: async (report: Omit<Report, "id" | "status" | "assignedTo" | "createdAt">) => {
    const data = getDB();
    const newReport: Report = {
      ...report,
      id: `REP-${Math.floor(1000 + Math.random() * 9000)}`,
      status: "pending",
      assignedTo: null,
      createdAt: Date.now(),
      // Add random coordinates near Mumbai for demo if not provided
      lat: report.lat || 19.0760 + (Math.random() - 0.5) * 0.1,
      lng: report.lng || 72.8777 + (Math.random() - 0.5) * 0.1,
    };
    data.reports = [newReport, ...data.reports];
    saveDB(data);
    return newReport;
  },
  updateReportStatus: async (id: string, status: Report["status"], assignedTo?: string) => {
    const data = getDB();
    data.reports = data.reports.map((r: any) => 
      r.id === id ? { ...r, status, assignedTo: assignedTo !== undefined ? assignedTo : r.assignedTo } : r
    );
    saveDB(data);
    return data.reports.find((r: any) => r.id === id);
  }
};
