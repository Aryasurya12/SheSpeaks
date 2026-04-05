"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { Activity, TrendingUp, TrendingDown, Users, FileText, AlertCircle, TrendingUp as MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AnalyticsPage() {
  const reportsData = [
    { label: "Harassment", value: 12, trend: "+12%", color: "text-primary" },
    { label: "Theft", value: 4, trend: "-5%", color: "text-emerald-500" },
    { label: "Assault", value: 2, trend: "-22%", color: "text-red-500" },
    { label: "Other", value: 8, trend: "+3%", color: "text-orange-500" },
  ];

  return (
    <DashboardLayout role="admin" userEmail="admin@shespeaks.com">
       <div className="space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-border pb-10 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                 <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-lg shadow-primary/10">
                   <Activity className="w-8 h-8" />
                 </div>
                 <h1 className="text-4xl md:text-5xl font-black mb-0 tracking-tighter uppercase">Platform <span className="text-primary italic">Intelligence</span></h1>
              </div>
              <p className="text-foreground/50 font-bold uppercase tracking-widest text-[10px] italic">Strategic Data Analytics • Incident Forecasting • Force Allocation Insights</p>
            </div>

            <div className="flex flex-wrap gap-4">
               <div className="px-6 py-4 rounded-[2.5rem] glass-dark border border-white/10 flex items-center gap-6 shadow-2xl">
                 <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground/30">System Efficiency</p>
                    <p className="text-2xl font-black text-primary tracking-tighter uppercase">98.4%</p>
                 </div>
                 <div className="w-[1px] h-10 bg-border/20" />
                 <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground/30">Response Time</p>
                    <p className="text-2xl font-black text-emerald-500 tracking-tighter">4.2m</p>
                 </div>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {reportsData.map((data, idx) => (
              <div key={idx} className="p-10 rounded-[3rem] glass border border-white/5 hover:border-primary/20 transition-all flex flex-col items-center text-center group shadow-2xl relative">
                 <div className={cn("w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform", data.color)}>
                   <Activity className="w-8 h-8" />
                 </div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-foreground/30 mb-2">{data.label}</p>
                 <h3 className="text-4xl font-black tracking-tighter mb-4">{data.value}</h3>
                 <div className={cn("px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/5 border border-white/10 flex items-center gap-3 shadow-lg", data.trend.startsWith('+') ? 'text-primary' : 'text-emerald-500')}>
                    {data.trend.startsWith('+') ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {data.trend}
                 </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
             <div className="p-12 rounded-[3.5rem] glass-dark border border-white/5 shadow-2xl space-y-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-5">
                   <Activity className="w-48 h-48" />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight italic">Incident <span className="text-primary italic">Distribution</span></h3>
                <div className="space-y-10">
                   {reportsData.map((data, i) => (
                     <div key={i} className="space-y-4">
                        <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-foreground/40">
                           <span>{data.label}</span>
                           <span>{data.value * 5}% Density</span>
                        </div>
                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                           <div className={cn("h-full rounded-full w-0 transition-all duration-1000 delay-500 bg-primary shadow-[0_0_15px_rgba(147,51,234,0.4)]", (i == 0 ? "w-[60%]" : i == 1 ? "w-[20%]" : i == 2 ? "w-[10%]" : "w-[40%]"))} />
                        </div>
                     </div>
                   ))}
                </div>
             </div>

             <div className="p-10 rounded-[3.5rem] glass border border-white/5 shadow-2xl flex flex-col items-center justify-center text-center space-y-10 group relative">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center p-6 border border-primary/20 shadow-xl group-hover:scale-110 transition-transform">
                   <AlertCircle className="w-12 h-12 text-primary" />
                </div>
                <div>
                   <h3 className="text-3xl font-black uppercase tracking-tighter mb-4">Strategic <span className="text-primary italic">Heatmap</span></h3>
                   <p className="text-foreground/40 text-sm font-bold uppercase tracking-widest leading-relaxed max-w-sm">Detailed safe-zone analytics and route optimization metrics will be automatically generated as platform data scales proportionally.</p>
                </div>
                <button className="px-10 py-5 btn-neon text-xs">Synchronize Visual Records</button>
             </div>
          </div>
       </div>
    </DashboardLayout>
  );
}
