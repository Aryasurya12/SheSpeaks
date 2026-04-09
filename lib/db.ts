import fs from 'fs';
import path from 'path';

const USERS_PATH = path.join(process.cwd(), 'users.json');
const REPORTS_PATH = path.join(process.cwd(), 'reports.json');

const POLICE_PATH = path.join(process.cwd(), 'database', 'police.json');

// Initialize files if they don't exist
const initDB = () => {
  if (!fs.existsSync(USERS_PATH)) fs.writeFileSync(USERS_PATH, JSON.stringify([], null, 2));
  if (!fs.existsSync(REPORTS_PATH)) fs.writeFileSync(REPORTS_PATH, JSON.stringify([], null, 2));
  if (!fs.existsSync(path.join(process.cwd(), 'database'))) fs.mkdirSync(path.join(process.cwd(), 'database'), { recursive: true });
  if (!fs.existsSync(POLICE_PATH)) fs.writeFileSync(POLICE_PATH, JSON.stringify([], null, 2));
};

initDB();

export interface User {
  id: string;
  email?: string;
  password?: string;
  fullName?: string;
  isAnonymous: boolean;
  createdAt: number;
}

export interface Report {
  id: string;
  userId: string;
  type: string;
  description: string;
  location: {
    address: string;
    lat: number;
    lng: number;
  };
  evidence: string[]; // Base64 or URL strings
  status: "pending" | "in-progress" | "resolved";
  assignedTo: string | null;
  createdAt: number;
  updatedAt: number;
  // Metadata for Admin/Police
  name?: string | null;
  email?: string | null;
  phone?: string | null;
}

export interface PoliceOfficer {
  id: string;
  name: string;
  status: "ON_DUTY" | "OFF_DUTY";
  activeCases: number;
  sector: string;
  avatar: string;
}

export const db = {
  // --- USER OPERATIONS ---
  getUsers: (): User[] => JSON.parse(fs.readFileSync(USERS_PATH, 'utf-8')),
  saveUsers: (users: User[]) => fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2)),
  
  addUser: async (user: Omit<User, "id" | "createdAt">) => {
    const users = db.getUsers();
    const prefix = user.isAnonymous ? "ANON" : "USER";
    const newId = `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
    
    const newUser: User = { ...user, id: newId, createdAt: Date.now() };
    users.push(newUser);
    db.saveUsers(users);
    return newUser;
  },

  // --- POLICE OPERATIONS ---
  getPolice: (): PoliceOfficer[] => JSON.parse(fs.readFileSync(POLICE_PATH, 'utf-8')),
  savePolice: (police: PoliceOfficer[]) => fs.writeFileSync(POLICE_PATH, JSON.stringify(police, null, 2)),

  updateOfficerStats: (officerName: string, delta: number) => {
    const police = db.getPolice();
    const idx = police.findIndex(p => p.name === officerName);
    if (idx !== -1) {
      police[idx].activeCases = Math.max(0, police[idx].activeCases + delta);
      db.savePolice(police);
    }
  },

  // --- REPORT OPERATIONS ---
  getReports: (): Report[] => JSON.parse(fs.readFileSync(REPORTS_PATH, 'utf-8')),
  saveReports: (reports: Report[]) => fs.writeFileSync(REPORTS_PATH, JSON.stringify(reports, null, 2)),
  
  addReport: async (report: Omit<Report, "id" | "status" | "assignedTo" | "createdAt" | "updatedAt">) => {
    const reports = db.getReports();
    const newReport: Report = {
      ...report,
      id: `REP-${Math.floor(1000 + Math.random() * 9000)}`,
      status: "pending",
      assignedTo: null,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    reports.unshift(newReport);
    db.saveReports(reports);
    return newReport;
  },

  updateReportStatus: async (id: string, status: Report["status"], assignedTo?: string) => {
    const reports = db.getReports();
    const index = reports.findIndex(r => r.id === id);
    if (index !== -1) {
      const oldReport = reports[index];
      const oldOfficer = oldReport.assignedTo;
      
      // SYNC POLICE STATS
      // 1. If assigned to NEW officer
      if (assignedTo !== undefined && assignedTo !== oldOfficer) {
        if (oldOfficer) db.updateOfficerStats(oldOfficer, -1);
        if (assignedTo) db.updateOfficerStats(assignedTo, 1);
      }
      
      // 2. If status changed to RESOLVED
      if (status === "resolved" && oldReport.status !== "resolved") {
        if (oldReport.assignedTo) db.updateOfficerStats(oldReport.assignedTo, -1);
      } else if (status !== "resolved" && oldReport.status === "resolved") {
        if (oldReport.assignedTo) db.updateOfficerStats(oldReport.assignedTo, 1);
      }

      reports[index] = {
        ...reports[index],
        status,
        assignedTo: assignedTo !== undefined ? assignedTo : reports[index].assignedTo,
        updatedAt: Date.now()
      };
      db.saveReports(reports);
      return reports[index];
    }
    return null;
  },

  deleteReport: async (id: string) => {
    const reports = db.getReports();
    const reportToDelete = reports.find(r => r.id === id);
    if (reportToDelete && reportToDelete.assignedTo && reportToDelete.status !== "resolved") {
      db.updateOfficerStats(reportToDelete.assignedTo, -1);
    }
    const filtered = reports.filter(r => r.id !== id);
    db.saveReports(filtered);
    return true;
  }
};
