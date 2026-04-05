"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { FileText, Clock, MapPin, CheckCircle2, Search, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function UserReports() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const anonId = localStorage.getItem("anon_id");
    fetch("/api/report")
      .then(res => res.json())
      .then(data => {
        // Filter by user's anonymous ID
        if (anonId) {
          setReports(data.filter((r: any) => r.userId === anonId));
        } else {
          setReports(data); // For demo show all if no ID yet
        }
        setLoading(false);
      });
  }, []);

  return (
    <DashboardLayout role="user">
       <div className="space-y-10">
          <div className="flex items-end justify-between border-b border-border pb-8 gap-4">
            <div>
              <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">My Secure <span className="text-primary italic">Reports</span></h1>
              <p className="text-foreground/50 font-bold uppercase tracking-widest text-xs italic">Live Investigation Access / Tracking</p>
            </div>
            
            <div className="relative hidden md:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
              <input 
                type="text" 
                placeholder="Search report ID..." 
                className="pl-12 pr-6 py-3 bg-white/5 border border-border rounded-2xl text-xs font-bold uppercase tracking-widest outline-none focus:border-primary transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="h-64 rounded-[2.5rem] glass-dark border border-white/5 animate-pulse" />
              ))
            ) : reports.length === 0 ? (
              <div className="col-span-full h-96 flex flex-col items-center justify-center text-foreground/20 italic">
                <FileText className="w-20 h-20 mb-6 opacity-10" />
                <p className="text-xl font-bold uppercase tracking-widest">No reports filed yet.</p>
                <p className="text-sm font-medium mt-2">Your safety records will appear here.</p>
              </div>
            ) : (
              reports.map((report) => (
                <div key={report.id} className="p-8 rounded-[2.5rem] glass border border-white/5 hover:border-primary/20 transition-all flex flex-col group relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-8 opacity-5">
                      <FileText className="w-32 h-32" />
                   </div>
                   
                   <div className="flex items-center justify-between mb-8">
                      <div className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">{report.id}</div>
                      <div className={cn(
                        "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                        report.status === "pending" ? "bg-orange-500/10 text-orange-500 border-orange-500/20" :
                        report.status === "in-progress" ? "bg-primary/10 text-primary border-primary/20" :
                        "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                      )}>
                        {report.status}
                      </div>
                   </div>

                   <h3 className="text-2xl font-black mb-4 tracking-tighter uppercase">{report.type}</h3>
                   <div className="space-y-3 mb-8">
                      <div className="flex items-center gap-3 text-xs font-bold text-foreground/40 uppercase tracking-widest">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span>{report.location}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs font-bold text-foreground/40 uppercase tracking-widest">
                        <Clock className="w-4 h-4 text-orange-500" />
                        <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                      </div>
                   </div>

                   <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">Last Update: Just now</span>
                      <button className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-primary hover:border-primary hover:text-white transition-all">
                        <ArrowRight className="w-4 h-4" />
                      </button>
                   </div>
                </div>
              ))
            )}
          </div>
       </div>
    </DashboardLayout>
  );
}
