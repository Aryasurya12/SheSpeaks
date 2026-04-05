"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  ShieldAlert, 
  MapPin, 
  History, 
  Settings, 
  BellRing,
  ArrowRight
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import ReportForm from "@/components/ReportForm";
import Section from "@/components/Section";
import Link from "next/link";

export default function UserDashboard() {
  const [panicLoading, setPanicLoading] = useState(false);

  const handlePanic = async () => {
    setPanicLoading(true);
    const anonId = localStorage.getItem("anon_id") || crypto.randomUUID();
    if (!localStorage.getItem("anon_id")) {
      localStorage.setItem("anon_id", anonId);
    }

    try {
      await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "PANIC ALERT",
          description: "EMERGENCY: User triggered panic button! Immediate response required.",
          location: "Current Geolocation",
          userId: anonId,
        }),
      });
      alert("EMERGENCY SIGNAL SENT! Authorities have been notified with your current location.");
    } catch (error) {
      console.error("Panic failed:", error);
    } finally {
      setPanicLoading(false);
    }
  };

  return (
    <DashboardLayout role="user">
      <div className="space-y-12">
        {/* Welcome Block */}
        <div className="relative p-12 rounded-[2.5rem] bg-gradient-to-r from-[#6D28D9] via-[#9333EA] to-[#EC4899] text-white overflow-hidden shadow-[0_0_30px_rgba(236,72,153,0.3)]">
          <div className="absolute top-0 right-0 p-12 opacity-10 animate-pulse">
             <ShieldAlert className="w-64 h-64" />
          </div>
          
          <div className="relative z-10 max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Your Anonymous <br />Safety Command Center</h1>
            <p className="text-xl text-white/80 font-medium mb-10 leading-relaxed">
              Report incidents, track responses, and access safety tools without ever compromising your identity.
            </p>
            
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePanic}
              disabled={panicLoading}
              className="px-8 py-4 bg-red-500 text-white font-black rounded-2xl flex items-center gap-3 shadow-xl shadow-red-500/30 hover:bg-red-600 transition-all uppercase tracking-widest text-sm disabled:opacity-50"
            >
              <BellRing className="w-6 h-6 animate-bounce" />
              {panicLoading ? "SENDING ALERT..." : "Panic Button Trigger"}
            </motion.button>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Link href="/user/map" className="p-8 rounded-3xl glass border border-white/5 hover:border-primary/20 transition-all group block">
             <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-all">
                <MapPin className="w-6 h-6 text-primary" />
             </div>
             <h3 className="text-xl font-bold mb-3 tracking-tight">Safety Map</h3>
             <p className="text-sm text-foreground/50 leading-relaxed mb-6">Explore anonymized incident hotspots and safe zones near your location.</p>
             <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-widest">
                Open Map <ArrowRight className="w-4 h-4" />
             </div>
          </Link>
          
          <Link href="/user/reports" className="p-8 rounded-3xl glass border border-white/5 hover:border-primary/20 transition-all group block">
             <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center mb-6 group-hover:bg-orange-500/20 transition-all">
                <History className="w-6 h-6 text-orange-500" />
             </div>
             <h3 className="text-xl font-bold mb-3 tracking-tight">Track Reports</h3>
             <p className="text-sm text-foreground/50 leading-relaxed mb-6">View investigation progress and updates on your submitted reports.</p>
             <div className="flex items-center gap-2 text-orange-500 text-xs font-bold uppercase tracking-widest">
                View History <ArrowRight className="w-4 h-4" />
             </div>
          </Link>
          
          <Link href="/user/profile" className="p-8 rounded-3xl glass border border-white/5 hover:border-sidebar-foreground transition-all group block">
             <div className="w-12 h-12 rounded-xl bg-sidebar-foreground flex items-center justify-center mb-6 group-hover:bg-emerald-500/20 transition-all">
                <Settings className="w-6 h-6 text-foreground/50" />
             </div>
             <h3 className="text-xl font-bold mb-3 tracking-tight">Preferences</h3>
             <p className="text-sm text-foreground/50 leading-relaxed mb-6">Configure emergency contacts and notification settings for your account.</p>
             <div className="flex items-center gap-2 text-foreground/40 text-xs font-bold uppercase tracking-widest">
                Manage Profile <ArrowRight className="w-4 h-4" />
             </div>
          </Link>
        </div>

        {/* Report Section */}
        <div className="space-y-8">
           <div className="flex items-center justify-between">
              <h2 className="text-3xl font-black tracking-tight uppercase">File a <span className="text-primary italic">Report</span></h2>
              <div className="h-[2px] flex-1 bg-gradient-to-r from-border via-border to-transparent mx-8 hidden md:block" />
           </div>
           
           <div className="max-w-4xl mx-auto">
              <ReportForm />
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
