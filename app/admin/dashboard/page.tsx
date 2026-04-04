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
import { cn } from "@/lib/utils";

interface Report {
  id: string;
  type: string;
  location: string;
  status: string;
  assignedTo: string | null;
  createdAt: number;
}

export default function AdminDashboard() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <DashboardLayout role="admin" userEmail="admin@shespeaks.com">
      <div className="space-y-10">
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
          
          <div className="glass shadow-2xl rounded-[2.5rem] border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
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
                      <td className="p-6 text-right">
                        <button className="p-2 rounded-xl hover:bg-white/5 transition-all text-foreground/30 hover:text-primary">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
