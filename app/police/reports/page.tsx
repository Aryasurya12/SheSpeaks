"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { FileText, ShieldCheck, MapPin, Clock, CheckCircle, AlertTriangle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PoliceReports() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = () => {
    fetch("/api/report")
      .then(res => res.json())
      .then(data => {
        // Filter by officer's name
        setReports(data.filter((r: any) => r.assignedTo === "Officer Smith"));
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    await fetch("/api/report", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    fetchReports();
  };

  return (
    <DashboardLayout role="police" userEmail="officer.smith@unit.gov">
       <div className="space-y-12">
          <div className="border-b border-border pb-10">
            <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">My Duty <span className="text-secondary italic">Manifest</span></h1>
            <p className="text-foreground/50 font-bold uppercase tracking-widest text-xs italic">Live Investigation Response Queue / Sector 71</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-10">
            {loading ? (
              Array(2).fill(0).map((_, i) => <div key={i} className="h-96 rounded-[3rem] glass-dark border border-white/5 animate-pulse" />)
            ) : reports.length === 0 ? (
              <div className="col-span-full h-[500px] flex flex-col items-center justify-center text-foreground/10 italic">
                <ShieldCheck className="w-24 h-24 mb-8 opacity-5" />
                <p className="text-2xl font-black tracking-tighter uppercase">Zero assigned incidents.</p>
                <p className="text-sm font-bold uppercase tracking-[0.2em] mt-2 opacity-50">Sector 71 is Clear, Officer.</p>
              </div>
            ) : (
              reports.map((report) => (
                <div key={report.id} className="glass-dark rounded-[3rem] border border-white/5 overflow-hidden flex flex-col relative group hover:border-secondary/30 transition-all shadow-2xl">
                   <div className="p-10 border-b border-white/5 space-y-8">
                      <div className="flex items-center justify-between">
                         <div className="px-5 py-2 bg-secondary/10 border border-secondary/20 text-secondary text-[10px] font-black uppercase tracking-widest rounded-2xl">{report.id}</div>
                         <div className={cn(
                           "flex items-center gap-2",
                           report.status === "in-progress" ? "text-primary" : "text-emerald-500"
                         )}>
                            <div className={cn("w-2 h-2 rounded-full", report.status === "in-progress" ? "bg-primary animate-pulse" : "bg-emerald-500")} />
                            <span className="text-[10px] font-black uppercase tracking-widest">{report.status}</span>
                         </div>
                      </div>

                      <div>
                         <h3 className="text-3xl font-black mb-4 tracking-tighter uppercase">{report.type}</h3>
                         <p className="text-foreground/60 text-sm leading-relaxed mb-8">{report.description}</p>
                      </div>

                      <div className="flex gap-8 text-[11px] font-bold uppercase tracking-widest text-foreground/40">
                         <div className="flex items-center gap-3">
                            <MapPin className="w-4 h-4 text-secondary" />
                            <span>{report.location}</span>
                         </div>
                         <div className="flex items-center gap-3">
                            <Clock className="w-4 h-4 text-orange-500" />
                            <span>{new Date(report.createdAt).toLocaleTimeString()}</span>
                         </div>
                      </div>
                   </div>

                   <div className="p-8 bg-black/40 flex items-center justify-between gap-6">
                      <div className="flex items-center gap-4">
                         <div className={cn(
                           "p-4 rounded-2xl font-black uppercase tracking-widest text-[10px]",
                           report.status === "in-progress" ? "bg-primary/20 text-primary border border-primary/20" : "bg-emerald-500/20 text-emerald-500 border border-emerald-500/20"
                         )}>Case Active</div>
                      </div>
                      
                      <div className="flex gap-4">
                         {report.status !== "resolved" ? (
                           <button 
                             onClick={() => handleUpdateStatus(report.id, "resolved")}
                             className="px-8 py-3.5 bg-emerald-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-500/20"
                           >
                             Close Inquiry <CheckCircle className="w-4 h-4 inline-block ml-2" />
                           </button>
                         ) : (
                           <div className="px-8 py-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-black rounded-2xl text-[10px] uppercase tracking-widest flex items-center gap-3">
                             <CheckCircle className="w-4 h-4" /> Finalized
                           </div>
                         )}
                         <button className="px-8 py-3.5 glass hover:bg-white/10 text-foreground/40 hover:text-white font-black rounded-2xl text-[10px] uppercase tracking-widest transition-all">Report PDF</button>
                      </div>
                   </div>
                </div>
              ))
            )}
          </div>
       </div>
    </DashboardLayout>
  );
}
