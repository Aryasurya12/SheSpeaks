"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Users, ShieldCheck, Mail, ShieldAlert, Key, Plus, Activity, Briefcase, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function ManagePolice() {
  const [officers, setOfficers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOfficer, setSelectedOfficer] = useState<any>(null);
  const [officerReports, setOfficerReports] = useState<any[]>([]);
  const [showLogs, setShowLogs] = useState(false);

  const fetchPolice = () => {
    fetch("/api/police")
      .then(res => res.json())
      .then(data => {
        setOfficers(data || []);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPolice();
  }, []);

  const toggleStatus = async (id: string, current: string) => {
    const next = current === "ON_DUTY" ? "OFF_DUTY" : "ON_DUTY";
    await fetch("/api/police", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: next }),
    });
    fetchPolice();
  };

  const fetchOfficerLogs = async (officer: any) => {
    setSelectedOfficer(officer);
    setShowLogs(true);
    const res = await fetch("/api/report");
    const all = await res.json();
    const assigned = all.filter((r: any) => r.assignedTo === officer.name);
    setOfficerReports(assigned);
  };

  return (
    <DashboardLayout role="admin" userEmail="admin@shespeaks.com">
       <div className="space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-white/5">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                 <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-lg shadow-emerald-500/10">
                   <Users className="w-8 h-8" />
                 </div>
                 <h1 className="text-4xl md:text-5xl font-black mb-0 tracking-tighter uppercase leading-tight">Deployed <span className="text-emerald-500 italic">Units</span></h1>
              </div>
              <p className="text-foreground/50 font-bold uppercase tracking-widest text-[10px] italic">Active Police Personnel Management • Security Clearances • Assignment Logs</p>
            </div>
            
            <button className="w-full md:w-auto px-10 py-5 bg-emerald-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-[2rem] shadow-xl shadow-emerald-500/20 hover:scale-105 transition-all flex items-center justify-center gap-4">
               Register New Officer <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              <div className="col-span-full p-20 text-center animate-pulse text-foreground/20 italic font-black uppercase tracking-[0.2em]">Synchronizing Force Database...</div>
            ) : officers.map((officer) => (
              <div key={officer.id} className="p-10 rounded-[3rem] glass-dark border border-white/5 hover:border-emerald-500/20 transition-all flex flex-col relative group shadow-2xl overflow-hidden min-h-[500px]">
                 <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                    <ShieldCheck className="w-32 h-32 text-emerald-500" />
                 </div>
                 
                 <div className="flex items-center gap-6 mb-10">
                    <div className="w-20 h-20 rounded-[2.2rem] bg-gradient-to-br from-emerald-500/20 to-indigo-500/20 p-[2px] shadow-xl group-hover:scale-110 transition-transform">
                       <div className="w-full h-full bg-[#0B0120] rounded-[2.1rem] flex items-center justify-center overflow-hidden">
                          <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${officer.name}&backgroundColor=0B0120`} alt={officer.name} className="w-full h-full object-cover" />
                       </div>
                    </div>
                    <div>
                       <h3 className="text-2xl font-black tracking-tighter uppercase">{officer.name}</h3>
                       <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-foreground/30 mt-1">
                          <Key className="w-3 h-3 text-emerald-500" />
                          <span>{officer.id}</span>
                       </div>
                    </div>
                 </div>

                 <div className="space-y-4 mb-10">
                    <div className="flex items-center justify-between p-5 bg-white/5 rounded-[2rem] border border-white/5">
                       <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Duty Status</span>
                       <button 
                         onClick={() => toggleStatus(officer.id, officer.status)}
                         className={cn(
                           "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                           officer.status === "ON_DUTY" ? "text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]" : "text-foreground/30 bg-white/5 border border-white/10"
                         )}
                       >
                         {officer.status === "ON_DUTY" ? "Active" : "Inactive"}
                       </button>
                    </div>
                    <div className="flex items-center justify-between p-5 bg-white/5 rounded-[2rem] border border-white/5">
                       <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Active Cases</span>
                       <span className="text-xl font-black tracking-tight text-white">{officer.activeCases}</span>
                    </div>
                    <div className="flex items-center justify-between p-5 bg-white/5 rounded-[2rem] border border-white/5">
                       <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Assigned Sector</span>
                       <span className="text-[10px] font-black uppercase tracking-widest text-foreground/60">{officer.sector}</span>
                    </div>
                 </div>

                 <div className="mt-auto flex gap-4">
                    <button 
                      onClick={() => fetchOfficerLogs(officer)}
                      className="flex-1 px-6 py-5 bg-emerald-500/10 hover:bg-emerald-600 text-emerald-500 hover:text-white text-[10px] font-black uppercase tracking-widest rounded-2xl border border-emerald-500/10 transition-all shadow-lg"
                    >
                      Case Logs
                    </button>
                    <button 
                      onClick={() => setSelectedOfficer(officer)}
                      className="flex-1 px-6 py-5 glass-dark hover:bg-white/10 text-foreground/40 hover:text-white text-[10px] font-black uppercase tracking-widest rounded-2xl border border-white/5 transition-all"
                    >
                      Details
                    </button>
                 </div>
              </div>
            ))}
          </div>
       </div>

       {/* Case Logs Modal */}
       <AnimatePresence>
         {showLogs && selectedOfficer && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
              <motion.div 
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }}
                className="w-full max-w-2xl glass-dark border border-white/10 rounded-[3rem] p-10 space-y-8 max-h-[85vh] overflow-y-auto"
              >
                  <div className="flex items-center justify-between border-b border-white/5 pb-8">
                     <div className="flex items-center gap-4">
                        <Activity className="w-10 h-10 text-emerald-500" />
                        <div>
                           <h2 className="text-3xl font-black uppercase tracking-tighter italic">Operational <span className="text-emerald-500">Logs</span></h2>
                           <p className="text-[10px] font-black uppercase tracking-widest text-foreground/30 italic">Force ID: {selectedOfficer.id} • {selectedOfficer.name}</p>
                        </div>
                     </div>
                     <button onClick={() => setShowLogs(false)} className="p-3 bg-white/5 hover:bg-red-500/20 hover:text-red-500 rounded-2xl transition-all">
                        <X className="w-6 h-6" />
                     </button>
                  </div>

                  <div className="space-y-4">
                    {officerReports.length === 0 ? (
                      <div className="p-10 text-center text-foreground/30 font-bold uppercase tracking-widest text-xs border-2 border-dashed border-white/5 rounded-3xl">No cases assigned to this unit.</div>
                    ) : officerReports.map(report => (
                      <div key={report.id} className="p-6 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-between group hover:border-emerald-500/20 transition-all">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-mono font-bold text-xs ring-2 ring-emerald-500/20 ring-offset-4 ring-offset-[#0B0120]">
                               {report.id.split('-')[1]}
                            </div>
                            <div>
                               <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500/60 ">{report.type}</p>
                               <p className="text-sm font-bold uppercase tracking-tight">{report.status}</p>
                            </div>
                         </div>
                         <div className="text-right">
                           <p className="text-[10px] font-black uppercase tracking-widest text-foreground/30">{new Date(report.createdAt).toLocaleDateString()}</p>
                           <ChevronRight className="w-5 h-5 ml-auto text-foreground/20 group-hover:text-emerald-500 transition-all" />
                         </div>
                      </div>
                    ))}
                  </div>
              </motion.div>
           </div>
         )}
       </AnimatePresence>
    </DashboardLayout>
  );
}
