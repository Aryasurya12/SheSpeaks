"use client";

import dynamic from "next/dynamic";
import DashboardLayout from "@/components/DashboardLayout";
import { Shield, MapPin, AlertCircle, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const SafetyMap = dynamic(() => import("@/components/SafetyMap"), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] rounded-[3rem] bg-white/5 border border-white/5 animate-pulse flex items-center justify-center text-foreground/20 italic uppercase tracking-[0.2em] font-black">
       Initializing Secure Map Protocols...
    </div>
  )
});

export default function UserMapPage() {
  return (
    <DashboardLayout role="user">
       <div className="space-y-12">
          {/* Map Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-border pb-10 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                 <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-lg shadow-primary/10">
                   <MapPin className="w-8 h-8" />
                 </div>
                 <h1 className="text-4xl md:text-5xl font-black mb-0 tracking-tighter uppercase">Safety <span className="text-primary italic">Radar</span></h1>
              </div>
              <p className="text-foreground/50 font-bold uppercase tracking-widest text-[10px] italic ml-1 focus-within:">Live Incident Mapping • Proximity Warnings Enabled • Anonymous Community Data</p>
            </div>
            
            <div className="flex flex-wrap gap-4">
               <div className="px-6 py-4 rounded-[2rem] glass-dark border border-white/10 flex items-center gap-6 shadow-xl">
                 <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground/30">Local Risk</p>
                    <p className="text-xl font-black text-emerald-500 tracking-tighter uppercase whitespace-nowrap">Low Stable</p>
                 </div>
                 <div className="w-[1px] h-10 bg-border/20" />
                 <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground/30">Active Feed</p>
                    <p className="text-xl font-black text-primary tracking-tighter">18s ago</p>
                 </div>
               </div>
            </div>
          </div>

          {/* Map Content */}
          <div className="max-w-6xl mx-auto space-y-8">
             <SafetyMap />
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="p-8 rounded-[2.5rem] glass border border-white/10 hover:border-primary/30 transition-all flex items-center gap-6 group">
                   <div className="w-12 h-12 rounded-2xl bg-[#6D28D9]/20 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-primary/10">
                      <Shield className="w-6 h-6 text-primary" />
                   </div>
                   <div className="space-y-1">
                      <h4 className="font-bold tracking-tight">Verified Hotspots</h4>
                      <p className="text-xs text-foreground/40 font-medium">Synced with Police Unit 01</p>
                   </div>
                </div>
                
                <div className="p-8 rounded-[2.5rem] glass border border-white/10 hover:border-sidebar-foreground transition-all flex items-center gap-6 group">
                   <div className="w-12 h-12 rounded-2xl bg-[#9333EA]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <AlertCircle className="w-6 h-6 text-[#9333EA]" />
                   </div>
                   <div className="space-y-1">
                      <h4 className="font-bold tracking-tight">Rapid Alert Zones</h4>
                      <p className="text-xs text-foreground/40 font-medium">Automatic SOS triggers enabled</p>
                   </div>
                </div>
                
                <div className="p-8 rounded-[2.5rem] glass border border-white/10 hover:border-secondary transition-all flex items-center gap-6 group">
                   <div className="w-12 h-12 rounded-2xl bg-secondary/20 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-pink-500/10">
                      <TrendingUp className="w-6 h-6 text-secondary" />
                   </div>
                   <div className="space-y-1">
                      <h4 className="font-bold tracking-tight">Safety Trends</h4>
                      <p className="text-xs text-foreground/40 font-medium">Incident reduction of 12.4%</p>
                   </div>
                </div>
             </div>
          </div>
       </div>
    </DashboardLayout>
  );
}
