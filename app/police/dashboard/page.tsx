"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, 
  MapPin, 
  Clock, 
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  MoreHorizontal,
  UserCircle2
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import ReportModal from "@/components/ReportModal";
import { cn } from "@/lib/utils";

interface Report {
  id: string;
  type: string;
  location: any;
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
  const [activeOfficer, setActiveOfficer] = useState("Officer Smith");
  const [officerList, setOfficerList] = useState<any[]>([]);

  const fetchReports = () => {
    setLoading(true);
    fetch("/api/report")
      .then(res => res.json())
      .then(data => {
        setReports(data.filter((r: any) => r.assignedTo === activeOfficer));
        setLoading(false);
      });
  };

  const fetchOfficers = () => {
    fetch("/api/police")
      .then(res => res.json())
      .then(data => setOfficerList(data || []));
  };

  useEffect(() => {
    fetchReports();
    fetchOfficers();
  }, [activeOfficer]);

  const handleUpdateStatus = async (id: string, status: string) => {
    setOpenMenuId(null);
    await fetch("/api/report", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    fetchReports();
  };

  return (
    <DashboardLayout role="police" userEmail={activeOfficer}>
      <div className="space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/5 pb-10 gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-secondary/20 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-secondary" />
              </div>
              <h1 className="text-4xl font-black tracking-tighter uppercase leading-tight">My Assigned <span className="text-secondary">Cases</span></h1>
            </div>
            <p className="text-foreground/50 font-bold uppercase tracking-widest text-xs italic ml-14">Sector Response Console • Investigative Command</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-6">
             <div className="flex items-center gap-4 bg-white/5 p-4 rounded-3xl border border-white/5 shadow-2xl">
               <UserCircle2 className="w-8 h-8 text-secondary" />
               <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-foreground/30">Investigator Session</p>
                  <select 
                    value={activeOfficer}
                    onChange={(e) => setActiveOfficer(e.target.value)}
                    className="bg-transparent text-sm font-black uppercase tracking-tight text-white outline-none cursor-pointer"
                  >
                    {officerList.map(o => <option key={o.id} value={o.name} className="bg-[#0B0120]">{o.name}</option>)}
                  </select>
               </div>
             </div>

             <div className="px-8 py-4 rounded-3xl glass-dark border border-white/5 flex items-center gap-6 shadow-2xl">
               <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-foreground/30">Active Load</p>
                  <p className="text-2xl font-black tracking-tighter">{reports.filter(r => r.status !== 'resolved').length}</p>
               </div>
               <div className="w-[1px] h-10 bg-white/10" />
               <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-foreground/30">Priority</p>
                  <p className="text-2xl font-black text-red-500 tracking-tighter uppercase italic">High</p>
               </div>
             </div>
          </div>
        </div>

        {loading ? (
            <div className="h-96 flex flex-col items-center justify-center text-foreground/10 animate-pulse">
               <ShieldCheck className="w-16 h-16 mb-6 opacity-5" />
               <p className="font-black uppercase tracking-[0.3em] text-[10px] italic">Synchronizing Operational Hub...</p>
            </div>
        ) : reports.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-96 flex flex-col items-center justify-center text-foreground/10"
            >
               <CheckCircle className="w-20 h-20 mb-8 opacity-5" />
               <p className="text-2xl font-black tracking-tighter uppercase italic">No assigned incidents.</p>
               <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-2 opacity-30 italic">Sector is Clear. Standby for Dispatch.</p>
            </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <AnimatePresence>
              {reports.map((report) => (
                <motion.div 
                  layout
                  key={report.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-dark rounded-[3rem] border border-white/5 flex flex-col shadow-2xl relative group hover:border-secondary/30 transition-all overflow-hidden"
                >
                  <div className="absolute top-8 right-8">
                    <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full">
                      <AlertTriangle className="w-3 h-3 text-red-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-red-400">Critical</span>
                    </div>
                  </div>

                  <div className="p-10 pb-6 border-b border-white/5">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 bg-secondary/10 rounded-2xl text-secondary shadow-lg">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/20">Operational ID</p>
                          <h3 className="text-lg font-bold tracking-tight text-white font-mono italic">{report.id}</h3>
                        </div>
                    </div>

                    <h2 className="text-3xl font-black mb-4 tracking-tighter uppercase">{report.type}</h2>
                    <p className="text-foreground/50 text-sm leading-relaxed mb-10 line-clamp-2 italic">
                      {report.description}
                    </p>

                    <div className="flex flex-col gap-5 text-[11px] font-black uppercase tracking-widest text-foreground/30">
                        <div className="flex items-center gap-3">
                          <MapPin className="w-4 h-4 text-secondary" />
                          <span className="truncate max-w-[250px]">{typeof report.location === 'object' && report.location !== null ? report.location.address : report.location}</span>
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
                          "w-3 h-3 rounded-full shadow-[0_0_10px_currentColor]",
                          report.status === "in-progress" ? "bg-primary text-primary" : 
                          report.status === "resolved" ? "bg-emerald-500 text-emerald-500" : "bg-orange-500 text-orange-500"
                        )} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">{report.status}</span>
                    </div>
                    
                    <div className="flex gap-3">
                        {report.status !== "resolved" && (
                          <button 
                            onClick={() => handleUpdateStatus(report.id, "resolved")}
                            className="px-6 py-3 bg-emerald-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-500/20"
                          >
                            Close Case <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                      <div className="relative">
                        <button 
                          onClick={() => setOpenMenuId(openMenuId === report.id ? null : report.id)}
                          className="p-3 glass-dark border border-white/5 rounded-2xl text-foreground/20 hover:text-white transition-all relative z-10"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        
                        <AnimatePresence>
                          {openMenuId === report.id && (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.9, y: 10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.9, y: 10 }}
                              className="absolute right-0 bottom-16 w-56 glass-dark border border-white/10 rounded-[2rem] shadow-2xl z-50 p-4 space-y-2"
                            >
                              <button 
                                onClick={() => { setSelectedReport(report); setOpenMenuId(null); }} 
                                className="w-full text-left p-4 rounded-xl hover:bg-white/5 text-[10px] font-black uppercase tracking-widest text-foreground/60 hover:text-white transition-all"
                              >
                                View Tactical Details
                              </button>
                              {report.status !== "in-progress" && report.status !== "resolved" && (
                                <>
                                  <div className="h-[1px] bg-white/5 mx-2" />
                                  <button onClick={() => handleUpdateStatus(report.id, "in-progress")} className="w-full text-left p-4 rounded-xl hover:bg-primary/10 text-[10px] font-black uppercase tracking-widest text-primary transition-all">
                                    Initiate Investigation
                                  </button>
                                </>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
      <ReportModal report={selectedReport} onClose={() => setSelectedReport(null)} />
    </DashboardLayout>
  );
}
