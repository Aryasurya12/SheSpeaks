"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Activity, TrendingUp, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
} from 'recharts';

export default function AnalyticsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    fetch("/api/report")
      .then(res => res.json())
      .then(data => {
        setReports(data || []);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getCount = (type: string) => reports.filter(r => r.type.toLowerCase().includes(type.toLowerCase())).length;
  
  const total = reports.length || 1;
  
  const reportsData = [
    { label: "Harassment", value: getCount("harassment"), color: "#9333ea", density: Math.round((getCount("harassment") / total) * 100) },
    { label: "Theft", value: getCount("theft"), color: "#10b981", density: Math.round((getCount("theft") / total) * 100) },
    { label: "Assault", value: getCount("assault"), color: "#ef4444", density: Math.round((getCount("assault") / total) * 100) },
    { label: "Other", value: reports.length - (getCount("harassment") + getCount("theft") + getCount("assault")), color: "#f59e0b", density: Math.round(((reports.length - (getCount("harassment") + getCount("theft") + getCount("assault"))) / total) * 100) },
  ];

  const processTrendData = () => {
    // Generate last 7 days including today
    const dates = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toLocaleDateString();
    });

    return dates.map(date => {
      const daily = reports.filter(r => new Date(r.createdAt).toLocaleDateString() === date);
      return {
        name: date.split('/')[0] + '/' + date.split('/')[1],
        Harassment: daily.filter(r => r.type.toLowerCase() === 'harassment').length,
        Theft: daily.filter(r => r.type.toLowerCase() === 'theft').length,
        Assault: daily.filter(r => r.type.toLowerCase() === 'assault').length,
        Other: daily.filter(r => r.type.toLowerCase() === 'other' || !['harassment', 'theft', 'assault'].includes(r.type.toLowerCase())).length
      };
    });
  };

  return (
    <DashboardLayout role="admin" userEmail="admin@shespeaks.com">
       <div className="space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/5 pb-10 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                 <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-lg shadow-primary/10">
                   <Activity className="w-8 h-8" />
                 </div>
                 <h1 className="text-4xl md:text-5xl font-black mb-0 tracking-tighter uppercase leading-tight">Platform <span className="text-primary italic">Intelligence</span></h1>
              </div>
              <p className="text-foreground/50 font-bold uppercase tracking-widest text-[10px] italic">Strategic Data Analytics • Incident Forecasting • Force Allocation Insights</p>
            </div>

            <div className="flex flex-wrap gap-4">
               <div className="px-6 py-4 rounded-[2.5rem] glass-dark border border-white/10 flex items-center gap-6 shadow-2xl">
                 <div className="space-y-1 text-center md:text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground/30">System Efficiency</p>
                    <p className="text-2xl font-black text-primary tracking-tighter uppercase">98.4%</p>
                 </div>
                 <div className="hidden md:block w-[1px] h-10 bg-border/20" />
                 <div className="space-y-1 text-center md:text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground/30">Response Time</p>
                    <p className="text-2xl font-black text-emerald-500 tracking-tighter">4.2m</p>
                 </div>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center sm:text-left">
            {reportsData.map((data, idx) => (
              <div key={idx} className="p-10 rounded-[3rem] glass border border-white/5 hover:border-primary/20 transition-all flex flex-col items-center group shadow-2xl relative">
                 <div 
                   className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform"
                   style={{ color: data.color }}
                 >
                   <Activity className="w-8 h-8" />
                 </div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-foreground/30 mb-2 italic tracking-[0.2em]">{data.label}</p>
                 <h3 className="text-4xl font-black tracking-tighter mb-4 italic">{loading ? "..." : data.value}</h3>
                 <div className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/5 border border-white/10 flex items-center gap-3 shadow-lg opacity-50">
                    <TrendingUp className="w-3 h-3" />
                    TREND ACTIVE
                 </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
             <div className="p-10 md:p-12 rounded-[3.5rem] glass-dark border border-white/5 shadow-2xl space-y-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                   <Activity className="w-48 h-48" />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight italic">Incident <span className="text-primary italic">Distribution</span></h3>
                <div className="space-y-10">
                   {reportsData.map((data, i) => (
                     <div key={i} className="space-y-4">
                        <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-foreground/40">
                           <span>{data.label}</span>
                           <span className="font-black" style={{ color: data.color }}>{loading ? "0" : data.density}% Density</span>
                        </div>
                        <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden p-0.5">
                           <div 
                             className="h-full rounded-full transition-all duration-1000 delay-300" 
                             style={{ 
                               width: loading ? '0%' : `${data.density}%`,
                               backgroundColor: data.color,
                               boxShadow: `0 0 20px ${data.color}66`
                             }} 
                           />
                        </div>
                     </div>
                   ))}
                </div>
             </div>

             <div className="p-10 rounded-[3.5rem] glass border border-white/5 shadow-2xl flex flex-col space-y-8 group relative border-2 border-primary/5 min-h-[550px]">
                <div className="flex items-center justify-between px-2">
                   <div>
                      <h3 className="text-2xl font-black uppercase tracking-tighter italic">Strategic <span className="text-primary italic">Analysis</span></h3>
                      <p className="text-[10px] font-black uppercase tracking-widest text-foreground/30 italic">Live Incident Trend Data (Last 7 Days)</p>
                   </div>
                </div>

                <div className="flex-1 w-full relative min-h-[300px] mt-4">
                  {loading ? (
                    <div className="inset-0 absolute flex items-center justify-center font-mono text-xs uppercase tracking-widest text-primary/30 animate-pulse">
                      Synchronizing Real-Time Vectors...
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={processTrendData()}>
                        <defs>
                          <linearGradient id="colorH" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#9333ea" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#9333ea" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorT" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorA" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis 
                          dataKey="name" 
                          stroke="rgba(255,255,255,0.2)" 
                          fontSize={10} 
                          tickLine={false} 
                          axisLine={false} 
                        />
                        <YAxis 
                          stroke="rgba(255,255,255,0.2)" 
                          fontSize={10} 
                          tickLine={false} 
                          axisLine={false} 
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#0B0120', 
                            border: '1px solid rgba(255,255,255,0.1)', 
                            borderRadius: '12px',
                            fontSize: '10px',
                            fontWeight: 'bold'
                          }}
                          itemStyle={{ padding: '2px 0' }}
                        />
                        <Area type="monotone" dataKey="Harassment" stroke="#9333ea" strokeWidth={3} fillOpacity={1} fill="url(#colorH)" />
                        <Area type="monotone" dataKey="Theft" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorT)" />
                        <Area type="monotone" dataKey="Assault" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorA)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 bg-white/3 rounded-[2rem] border border-white/5">
                   {reportsData.map((data, i) => (
                     <div key={i} className="space-y-1">
                        <div className="flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full" style={{ backgroundColor: data.color }} />
                           <p className="text-[10px] font-black uppercase text-foreground/40 tracking-tight">{data.label}</p>
                        </div>
                        <p className="text-xl font-black tracking-tighter" style={{ color: data.color }}>{data.value}</p>
                     </div>
                   ))}
                </div>

                <div className="pt-4 flex justify-center">
                  <button 
                    onClick={fetchData}
                    className="px-10 py-5 btn-neon text-[10px] font-black uppercase tracking-widest flex items-center gap-3 shadow-xl"
                  >
                    <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                    Synchronize Visual Records
                  </button>
                </div>
             </div>
          </div>
       </div>
    </DashboardLayout>
  );
}
