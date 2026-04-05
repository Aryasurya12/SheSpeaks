"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { Users, ShieldCheck, Mail, ShieldAlert, Key, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ManagePolice() {
  const officers = [
    { name: "Officer Smith", badge: "2890-SMT", status: "on-duty", cases: 2, unit: "Sector 71" },
    { name: "Officer Jones", badge: "1024-JNS", status: "off-duty", cases: 0, unit: "Sector 12" },
    { name: "Officer Davis", badge: "4829-DVS", status: "on-duty", cases: 1, unit: "Sector 01" },
    { name: "Officer Wilson", badge: "7721-WLS", status: "on-duty", cases: 5, unit: "Sector 01" },
  ];

  return (
    <DashboardLayout role="admin" userEmail="admin@shespeaks.com">
       <div className="space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-border">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                 <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-lg shadow-emerald-500/10">
                   <Users className="w-8 h-8" />
                 </div>
                 <h1 className="text-4xl md:text-5xl font-black mb-0 tracking-tighter uppercase">Deployed <span className="text-emerald-500 italic">Units</span></h1>
              </div>
              <p className="text-foreground/50 font-bold uppercase tracking-widest text-[10px] italic">Active Police Personnel Management • Security Clearances • Assignment Logs</p>
            </div>
            
            <button className="px-10 py-5 bg-emerald-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-[2rem] shadow-xl shadow-emerald-500/20 hover:scale-105 transition-all flex items-center gap-4">
               Register New Officer <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {officers.map((officer) => (
              <div key={officer.badge} className="p-10 rounded-[3rem] glass-dark border border-white/5 hover:border-emerald-500/20 transition-all flex flex-col relative group shadow-2xl overflow-hidden">
                 <div className="absolute top-0 right-0 p-10 opacity-5">
                    <ShieldCheck className="w-32 h-32" />
                 </div>
                 
                 <div className="flex items-center gap-6 mb-10">
                    <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-emerald-500 to-indigo-500 p-[3px] shadow-xl group-hover:scale-110 transition-transform">
                       <div className="w-full h-full bg-[#0B0120] rounded-[1.8rem] flex items-center justify-center overflow-hidden">
                          <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${officer.name}`} alt={officer.name} />
                       </div>
                    </div>
                    <div>
                       <h3 className="text-2xl font-black tracking-tight uppercase">{officer.name}</h3>
                       <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-foreground/30 mt-1">
                          <Key className="w-3 h-3 text-emerald-500" />
                          <span>{officer.badge}</span>
                       </div>
                    </div>
                 </div>

                 <div className="space-y-4 mb-10">
                    <div className="flex items-center justify-between p-5 bg-white/5 rounded-3xl border border-white/10">
                       <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Duty Status</span>
                       <span className={cn(
                         "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest",
                         officer.status === "on-duty" ? "text-emerald-500 bg-emerald-500/10 border border-emerald-500/20" : "text-foreground/30 bg-white/5 border border-white/10"
                       )}>{officer.status}</span>
                    </div>
                    <div className="flex items-center justify-between p-5 bg-white/5 rounded-3xl border border-white/10">
                       <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Active Cases</span>
                       <span className="text-lg font-black tracking-tight text-white">{officer.cases}</span>
                    </div>
                    <div className="flex items-center justify-between p-5 bg-white/5 rounded-3xl border border-white/10">
                       <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Assigned Sector</span>
                       <span className="text-[10px] font-black uppercase tracking-widest text-foreground/60">{officer.unit}</span>
                    </div>
                 </div>

                 <div className="mt-auto flex gap-4">
                    <button className="flex-1 px-6 py-4 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 text-xs font-black uppercase tracking-widest rounded-2xl border border-emerald-500/10 transition-all transition-duration-300">Case Logs</button>
                    <button className="flex-1 px-6 py-4 glass hover:bg-white/10 text-foreground/40 hover:text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all">Details</button>
                 </div>
              </div>
            ))}
          </div>
       </div>
    </DashboardLayout>
  );
}
