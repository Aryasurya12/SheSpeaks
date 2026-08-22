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
  UserCircle2,
  Camera,
  Eye,
  Radio
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import ReportModal from "@/components/ReportModal";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

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
  evidence?: string[];
  deviceId?: string;
  isIotTrigger?: boolean;
}

export default function PoliceDashboard() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [activeOfficer, setActiveOfficer] = useState("");
  const [officerList, setOfficerList] = useState<any[]>([]);
  const [filterMode, setFilterMode] = useState<"assigned" | "all">("all");

  const fetchReports = () => {
    setLoading(true);
    fetch("/api/report")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          if (filterMode === "assigned" && activeOfficer) {
            setReports(data.filter((r: any) => r.assignedTo === activeOfficer));
          } else {
            // "all" shows assigned to active officer OR unassigned / emergency alerts
            setReports(data.filter((r: any) => !r.assignedTo || r.assignedTo === activeOfficer || r.isIotTrigger || r.type === "Harassment"));
          }
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching reports:", err);
        setLoading(false);
      });
  };

  const fetchOfficers = () => {
    fetch("/api/police")
      .then(res => res.json())
      .then(data => {
        setOfficerList(data || []);
        if (data && data.length > 0 && !activeOfficer) {
           setActiveOfficer(data[0].id);
        }
      })
      .catch(err => console.error("Error fetching officers:", err));
  };

  useEffect(() => {
    fetchReports();
    fetchOfficers();

    // High-velocity real-time listener for incoming Panic & IoT Camera Signals
    const channel = supabase.channel('emergency_signals')
      .on('broadcast', { event: 'panic_alert' }, (payload) => {
        const newIncident = payload.payload;
        console.log("🚨 [POLICE REALTIME] New Emergency Incident Received:", newIncident);
        // Inject directly into feed if not already present
        setReports(prev => [newIncident, ...prev].filter((v, i, a) => a.findIndex(t => t.id === v.id) === i));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeOfficer, filterMode]);

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
              <h1 className="text-4xl font-black tracking-tighter uppercase leading-tight">
                Police <span className="text-secondary">Dispatch</span> Console
              </h1>
            </div>
            <p className="text-foreground/50 font-bold uppercase tracking-widest text-xs italic ml-14">
              Live Sensor Ingestion & Emergency Incident Response
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-6">
             <div className="flex items-center gap-4 bg-white/5 p-4 rounded-3xl border border-white/5 shadow-2xl">
               <UserCircle2 className="w-8 h-8 text-secondary" />
               <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-foreground/30">Duty Officer</p>
                  <select 
                    value={activeOfficer}
                    onChange={(e) => setActiveOfficer(e.target.value)}
                    className="bg-transparent text-sm font-black uppercase tracking-tight text-white outline-none cursor-pointer"
                  >
                    {officerList.map(o => <option key={o.id} value={o.id} className="bg-[#0B0120]">{o.name}</option>)}
                  </select>
               </div>
             </div>

             <div className="flex items-center bg-white/5 p-1 rounded-2xl border border-white/10">
               <button
                 onClick={() => setFilterMode("all")}
                 className={cn(
                   "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
                   filterMode === "all" ? "bg-secondary text-black shadow-lg" : "text-foreground/50 hover:text-white"
                 )}
               >
                 All Sector Alerts
               </button>
               <button
                 onClick={() => setFilterMode("assigned")}
                 className={cn(
                   "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
                   filterMode === "assigned" ? "bg-secondary text-black shadow-lg" : "text-foreground/50 hover:text-white"
                 )}
               >
                 My Cases
               </button>
             </div>

             <div className="px-8 py-4 rounded-3xl glass-dark border border-white/5 flex items-center gap-6 shadow-2xl">
               <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-foreground/30">Active Load</p>
                  <p className="text-2xl font-black tracking-tighter">{reports.filter(r => r.status !== 'resolved').length}</p>
               </div>
               <div className="w-[1px] h-10 bg-white/10" />
               <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-foreground/30">IoT Stream</p>
                  <p className="text-2xl font-black text-emerald-400 tracking-tighter uppercase italic flex items-center gap-2">
                    <Radio className="w-4 h-4 animate-pulse text-emerald-400" /> Live
                  </p>
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
               <p className="text-2xl font-black tracking-tighter uppercase italic">No active incidents.</p>
               <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-2 opacity-30 italic">Sector is Clear. Standby for Dispatch.</p>
            </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <AnimatePresence>
              {reports.map((report) => {
                const evidenceList = report.evidence || [];
                const hasEvidence = evidenceList.length > 0;
                const isHarassment = report.type === 'Harassment';

                return (
                  <motion.div 
                    layout
                    key={report.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "glass-dark rounded-[3rem] border flex flex-col shadow-2xl relative group transition-all overflow-hidden",
                      isHarassment 
                        ? "border-amber-500/30 hover:border-amber-400/60 shadow-amber-500/5" 
                        : "border-white/5 hover:border-secondary/30"
                    )}
                  >
                    <div className="absolute top-8 right-8 flex items-center gap-2 z-10">
                      {hasEvidence && (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full">
                          <Camera className="w-3 h-3 text-amber-400" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Photo Evidence</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full">
                        <AlertTriangle className="w-3 h-3 text-red-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-red-400">Critical</span>
                      </div>
                    </div>

                    {/* Camera Evidence Preview Strip if photo attached */}
                    {hasEvidence && (
                      <div 
                        className="relative h-44 w-full bg-black/50 border-b border-white/5 cursor-pointer overflow-hidden group/img"
                        onClick={() => setSelectedReport(report)}
                      >
                        <img 
                          src={evidenceList[0]} 
                          alt="IoT Camera Evidence"
                          className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500 opacity-80 hover:opacity-100"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0120] via-transparent to-black/40" />
                        <div className="absolute bottom-3 left-8 flex items-center gap-2 text-xs font-bold text-amber-300 bg-black/60 px-3 py-1 rounded-xl backdrop-blur-sm border border-amber-500/20">
                          <Camera className="w-3.5 h-3.5 text-amber-400" />
                          <span>IoT Sensor Snapshot</span>
                        </div>
                      </div>
                    )}

                    <div className="p-10 pb-6 border-b border-white/5">
                      <div className="flex items-center gap-3 mb-6">
                          <div className={cn(
                            "p-3 rounded-2xl shadow-lg",
                            isHarassment ? "bg-amber-500/20 text-amber-400" : "bg-secondary/10 text-secondary"
                          )}>
                            {hasEvidence ? <Camera className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/20">Operational ID</p>
                            <h3 className="text-sm font-bold tracking-tight text-white font-mono">{report.id}</h3>
                          </div>
                      </div>

                      <div className="flex items-center gap-3 mb-3">
                        <h2 className="text-2xl font-black tracking-tighter uppercase text-white">{report.type}</h2>
                        {report.deviceId && (
                          <span className="text-[10px] font-mono text-foreground/40 bg-white/5 px-2 py-0.5 rounded-lg border border-white/10">
                            {report.deviceId}
                          </span>
                        )}
                      </div>

                      <p className="text-foreground/60 text-sm leading-relaxed mb-6 line-clamp-2 italic">
                        {report.description || "Incident reported via emergency sensor"}
                      </p>

                      <div className="flex flex-col gap-4 text-[11px] font-black uppercase tracking-widest text-foreground/40">
                          <div className="flex items-center gap-3">
                            <MapPin className="w-4 h-4 text-secondary" />
                            {typeof report.location === 'object' && report.location !== null && report.location.lat && report.location.lng ? (
                              <a 
                                href={`https://www.google.com/maps/search/?api=1&query=${report.location.lat},${report.location.lng}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="truncate max-w-[250px] hover:text-secondary hover:underline transition-colors cursor-pointer"
                              >
                                {report.location.address || `${report.location.lat.toFixed(4)}, ${report.location.lng.toFixed(4)}`}
                              </a>
                            ) : (
                              <span className="truncate max-w-[250px]">
                                {typeof report.location === 'object' && report.location !== null ? report.location.address : report.location || "Coordinates Available"}
                              </span>
                            )}
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
                          <button
                            onClick={() => setSelectedReport(report)}
                            className="px-4 py-2.5 glass border border-white/10 hover:border-secondary/50 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all"
                          >
                            <Eye className="w-3.5 h-3.5" /> View Photo & Details
                          </button>
                          
                          {report.status !== "resolved" && (
                            <button 
                              onClick={() => handleUpdateStatus(report.id, "resolved")}
                              className="px-5 py-2.5 bg-emerald-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-500/20"
                            >
                              Resolve <CheckCircle className="w-3.5 h-3.5" />
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
                                  View Full Evidence
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
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
      <ReportModal report={selectedReport} onClose={() => setSelectedReport(null)} />
    </DashboardLayout>
  );
}
