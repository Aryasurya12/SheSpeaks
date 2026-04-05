"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  FileText, 
  Users, 
  ShieldCheck, 
  TrendingUp, 
  AlertCircle,
  MoreVertical,
  CheckCircle2,
  Clock,
  ArrowUpRight
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import ReportModal from "@/components/ReportModal";
import { cn } from "@/lib/utils";

interface Report {
  id: string;
  type: string;
  location: string;
  status: string;
  assignedTo: string | null;
  createdAt: number;
  description?: string;
  name?: string;
  email?: string;
  phone?: string;
  userId?: string;
}

export default function AdminDashboard() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/report")
      .then(res => res.json())
      .then(data => {
        setReports(data);
        setLoading(false);
      });
  }, []);

  const stats = [
    { label: "Total Reports", value: reports.length, icon: FileText, color: "text-primary", bg: "bg-primary/10" },
    { label: "Active Officers", value: "12", icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Resolved Cases", value: reports.filter(r => r.status === "resolved").length, icon: CheckCircle2, color: "text-indigo-500", bg: "bg-indigo-500/10" },
    { label: "Pending Issues", value: reports.filter(r => r.status === "pending").length, icon: Clock, color: "text-orange-500", bg: "bg-orange-500/10" },
  ];

  const handleUpdate = async (id: string, updates: Partial<Report>) => {
    setOpenMenuId(null);
    try {
      const res = await fetch("/api/report", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates }),
      });
      if (res.ok) {
        setReports(reports.map(r => r.id === id ? { ...r, ...updates } : r));
      }
    } catch (error) {
      console.error("Failed to update report", error);
    }
  };

  return (
    <DashboardLayout role="admin" userEmail="admin@shespeaks.com">
      <div className="max-w-7xl mx-auto px-6 overflow-hidden space-y-10 pb-48">
        {/* Top Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black mb-2 tracking-tighter uppercase">Central Command <span className="text-primary">Overview</span></h1>
            <p className="text-foreground/50 font-medium text-lg leading-snug">System-wide monitoring and resource allocation dashboard.</p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-2xl flex items-center gap-2 shadow-lg shadow-primary/20 text-sm"
          >
            Export All Records <ArrowUpRight className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
           {stats.map((stat, idx) => (
             <motion.div 
               key={idx}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: idx * 0.1 }}
               className="p-8 rounded-[2.5rem] glass border border-white/5 hover:border-primary/20 transition-all group"
             >
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm", stat.bg)}>
                  <stat.icon className={cn("w-7 h-7", stat.color)} />
                </div>
                <p className="text-sm font-bold text-foreground/30 uppercase tracking-widest mb-1">{stat.label}</p>
                <div className="flex items-end gap-3">
                  <h3 className="text-4xl font-black tracking-tighter">{stat.value}</h3>
                  <div className="flex items-center gap-1 text-emerald-500 font-bold text-xs mb-1">
                    <TrendingUp className="w-3 h-3" />
                    +12%
                  </div>
                </div>
             </motion.div>
           ))}
        </div>

        {/* Recent Reports Table */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
             <h2 className="text-2xl font-black uppercase tracking-tight italic">Live <span className="text-primary italic">Incident Feed</span></h2>
             <button className="text-xs font-bold uppercase tracking-widest text-primary hover:underline">View All Records</button>
          </div>
          
          <div className="glass shadow-2xl rounded-[2.5rem] border border-white/5">
            <div className="w-full overflow-x-auto min-h-[300px]">
              <table className="min-w-full table-auto text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-border">
                    <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">Report ID</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">Type</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">Location</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">Status</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">Officer</th>
                    <th className="p-6 text-right text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="p-20 text-center text-foreground/30 font-bold uppercase tracking-widest animate-pulse">
                        Synchronizing with secure database...
                      </td>
                    </tr>
                  ) : reports.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-20 text-center text-foreground/30 font-bold uppercase tracking-widest">
                        Zero active incidents detected.
                      </td>
                    </tr>
                  ) : reports.map((report) => (
                    <tr key={report.id} className="hover:bg-white/[0.02] transition-all group">
                      <td className="p-6">
                        <span className="font-mono text-sm font-bold text-primary">{report.id}</span>
                      </td>
                      <td className="p-6">
                        <span className="font-bold text-sm tracking-tight">{report.type}</span>
                      </td>
                      <td className="p-6">
                        <span className="text-xs font-semibold text-foreground/50">{report.location}</span>
                      </td>
                      <td className="p-6">
                        <span className={cn(
                          "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-2",
                          report.status === "pending" ? "bg-orange-500/10 text-orange-500 border border-orange-500/20" :
                          report.status === "in-progress" ? "bg-primary/10 text-primary border border-primary/20" :
                          "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                        )}>
                          <div className={cn("w-1.5 h-1.5 rounded-full", 
                            report.status === "pending" ? "bg-orange-500 animate-pulse" :
                            report.status === "in-progress" ? "bg-primary" : "bg-emerald-500"
                          )} />
                          {report.status}
                        </span>
                      </td>
                      <td className="p-6">
                         <span className="text-xs font-bold text-foreground/60">{report.assignedTo || "—"}</span>
                      </td>
                      <td className="p-6 text-right relative">
                        <button 
                          onClick={() => setOpenMenuId(openMenuId === report.id ? null : report.id)}
                          className="p-2 rounded-xl hover:bg-white/5 transition-all text-foreground/30 hover:text-primary relative z-10"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        
                        {openMenuId === report.id && (
                           <>
                             <div className="fixed inset-0 z-10 hidden sm:block" onClick={() => setOpenMenuId(null)} />
                             <div className="absolute right-0 top-10 w-48 glass-dark border border-white/10 rounded-2xl shadow-2xl z-50 pointer-events-auto text-left text-sm py-2">
                               <button onClick={() => { setSelectedReport(report); setOpenMenuId(null); }} className="w-full text-left px-4 py-2 hover:bg-white/5 font-bold transition-all">
                                 View Report Details
                               </button>
                               <div className="h-[1px] bg-white/5 my-1" />
                               <div className="px-4 py-1 text-[10px] uppercase font-black tracking-widest text-foreground/40">Assign</div>
                               <button onClick={() => handleUpdate(report.id, { assignedTo: "Officer Smith" })} disabled={!!report.assignedTo} className="w-full text-left px-4 py-2 hover:bg-white/5 text-primary/80 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                                 To Unit 01 (Police)
                               </button>
                               <div className="h-[1px] bg-white/5 my-1" />
                               <div className="px-4 py-1 text-[10px] uppercase font-black tracking-widest text-foreground/40">Status</div>
                               {report.status !== 'in-progress' && (
                                 <button onClick={() => handleUpdate(report.id, { status: "in-progress" })} className="w-full text-left px-4 py-2 hover:bg-white/5 text-emerald-400 transition-all">
                                   Mark In-Progress
                                 </button>
                               )}
                               {report.status !== 'resolved' && (
                                 <button onClick={() => handleUpdate(report.id, { status: "resolved" })} className="w-full text-left px-4 py-2 hover:bg-white/5 text-indigo-400 transition-all">
                                   Mark Resolved
                                 </button>
                               )}
                             </div>
                           </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <ReportModal report={selectedReport} onClose={() => setSelectedReport(null)} />
    </DashboardLayout>
  );
}
