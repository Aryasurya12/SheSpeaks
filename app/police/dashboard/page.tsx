"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  FileText, 
  MapPin, 
  Clock, 
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  MoreHorizontal
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import ReportModal from "@/components/ReportModal";
import { cn } from "@/lib/utils";

interface Report {
  id: string;
  type: string;
  location: string;
  status: string;
  description?: string;
  assignedTo: string | null;
  createdAt: number;
  name?: string;
  email?: string;
  phone?: string;
  userId?: string;
}

export default function PoliceDashboard() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/report")
      .then(res => res.json())
      .then(data => {
        // Mocking: Only show cases that are assigned to "Officer Smith" for demo
        setReports(data.filter((r: any) => r.assignedTo === "Officer Smith" || r.status === "in-progress" || r.status === "resolved"));
        setLoading(false);
      });
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    setOpenMenuId(null);
    await fetch("/api/report", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    // Optimistic Update
    setReports(reports.map(r => r.id === id ? { ...r, status } : r));
  };

  return (
    <DashboardLayout role="police" userEmail="officer.smith@unit.gov">
      <div className="space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-border pb-10 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-secondary/20 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-secondary" />
              </div>
              <h1 className="text-4xl font-black tracking-tighter uppercase">My Assigned <span className="text-secondary">Cases</span></h1>
            </div>
            <p className="text-foreground/50 font-bold uppercase tracking-widest text-xs italic ml-14">Active Status: On-Duty / Officer Smith</p>
          </div>
          
          <div className="flex gap-4">
             <div className="px-6 py-3 rounded-2xl glass-dark border border-white/5 flex items-center gap-4">
               <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-foreground/30">Active Cases</p>
                  <p className="text-2xl font-black tracking-tighter">{reports.filter(r => r.status !== 'resolved').length}</p>
               </div>
               <div className="w-[1px] h-10 bg-border" />
               <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-foreground/30">Priority</p>
                  <p className="text-2xl font-black text-red-500 tracking-tighter">High</p>
               </div>
             </div>
          </div>
        </div>

        {loading ? (
           <div className="h-96 flex flex-col items-center justify-center text-foreground/20 animate-pulse">
              <ShieldCheck className="w-12 h-12 mb-4" />
              <p className="font-bold uppercase tracking-widest text-sm">Syncing with secure server...</p>
           </div>
        ) : reports.length === 0 ? (
           <div className="h-96 flex flex-col items-center justify-center text-foreground/10">
              <CheckCircle className="w-20 h-20 mb-8" />
              <p className="text-2xl font-black tracking-tighter uppercase">No assigned incidents.</p>
              <p className="text-sm font-bold uppercase tracking-[0.2em] mt-2 opacity-50">You're cleared for now, Officer.</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {reports.map((report) => (
              <motion.div 
                key={report.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-dark rounded-[2.5rem] border border-white/5 flex flex-col shadow-2xl relative"
              >
                <div className="absolute top-8 right-8">
                  <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full">
                    <AlertTriangle className="w-3 h-3 text-red-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-red-400">Critical</span>
                  </div>
                </div>

                <div className="p-10 pb-6 border-b border-white/5">
                   <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-primary/10 rounded-xl text-primary">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30">Incident ID</p>
                        <h3 className="text-lg font-bold tracking-tight text-primary font-mono italic">{report.id}</h3>
                      </div>
                   </div>

                   <h2 className="text-2xl font-black mb-4 tracking-tighter uppercase">{report.type}</h2>
                   <p className="text-foreground/60 text-sm leading-relaxed mb-8 line-clamp-2">
                     {report.description}
                   </p>

                   <div className="flex flex-col gap-4 text-xs font-bold uppercase tracking-widest text-foreground/40">
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span>{report.location}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-orange-500" />
                        <span>{new Date(report.createdAt).toLocaleString()}</span>
                      </div>
                   </div>
                </div>

                <div className="p-8 bg-black/20 flex items-center justify-between gap-4 mt-auto">
                   <div className="flex items-center gap-3">
                      <span className={cn(
                        "w-2.5 h-2.5 rounded-full",
                        report.status === "in-progress" ? "bg-primary" : "bg-emerald-500"
                      )} />
                      <span className="text-xs font-black uppercase tracking-widest text-foreground/60">{report.status}</span>
                   </div>
                   
                   <div className="flex gap-2">
                      {report.status !== "resolved" && (
                        <button 
                          onClick={() => handleUpdateStatus(report.id, "resolved")}
                          className="px-6 py-2.5 bg-emerald-600 text-white font-black rounded-xl text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20"
                        >
                          Mark Resolved <CheckCircle className="w-3 h-3" />
                        </button>
                      )}
                    <div className="relative">
                      <button 
                        onClick={() => setOpenMenuId(openMenuId === report.id ? null : report.id)}
                        className="p-2.5 glass rounded-xl text-foreground/40 hover:text-white transition-all relative z-10"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      
                      {openMenuId === report.id && (
                        <>
                          <div className="fixed inset-0 z-10 hidden sm:block" onClick={() => setOpenMenuId(null)} />
                          <div className="absolute right-0 bottom-12 w-48 glass-dark border border-white/10 rounded-2xl shadow-2xl z-50 pointer-events-auto text-left text-sm py-2">
                            <button onClick={() => { setSelectedReport(report); setOpenMenuId(null); }} className="w-full text-left px-4 py-2 hover:bg-white/5 font-bold transition-all">
                              View Report Details
                            </button>
                            {report.status !== "in-progress" && report.status !== "resolved" && (
                              <>
                                <div className="h-[1px] bg-white/5 my-1" />
                                <button onClick={() => handleUpdateStatus(report.id, "in-progress")} className="w-full text-left px-4 py-2 hover:bg-white/5 text-emerald-400 transition-all">
                                  Mark In-Progress
                                </button>
                              </>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                   </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <ReportModal report={selectedReport} onClose={() => setSelectedReport(null)} />
    </DashboardLayout>
  );
}
