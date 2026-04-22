"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert,
  MapPin,
  History,
  Settings,
  BellRing,
  ArrowRight,
  Search,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import ReportForm from "@/components/ReportForm";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function UserDashboard() {
  const [panicLoading, setPanicLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [recentReports, setRecentReports] = useState<any[]>([]);
  const [searchId, setSearchId] = useState("");
  const [searchResults, setSearchResults] = useState<any>(null);
  const [anonymousMode, setAnonymousMode] = useState(true);

  useEffect(() => {
    const settingsStr = localStorage.getItem("sheSpeaksSettings");
    if (settingsStr) {
      setAnonymousMode(JSON.parse(settingsStr).anonymityMode);
    }
  }, []);

  const toggleAnonymousMode = () => {
    const newMode = !anonymousMode;
    setAnonymousMode(newMode);
    const settingsStr = localStorage.getItem("sheSpeaksSettings");
    const settings = settingsStr ? JSON.parse(settingsStr) : {
      panicAutoLocation: true,
      encryptionEnabled: true,
      autoSelfDestruct: false
    };
    settings.anonymityMode = newMode;
    localStorage.setItem("sheSpeaksSettings", JSON.stringify(settings));
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("shespeaks_user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchRecentReports(parsedUser.id);
    }
  }, []);

  const fetchRecentReports = async (userId: string) => {
    try {
      const res = await fetch(`/api/report?userId=${userId}`);
      const data = await res.json();
      setRecentReports(data.slice(0, 5));
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    }
  };

  const handlePanic = async () => {
    const settingsStr = localStorage.getItem("sheSpeaksSettings");
    const settings = settingsStr ? JSON.parse(settingsStr) : {
      panicAutoLocation: true,
      anonymityMode: true,
      silentSOS: false
    };

    setPanicLoading(true);

    const transmitSignal = async (pos: { lat: number, lng: number } | null) => {
      const payload = {
        type: "PANIC ALERT",
        description: `EMERGENCY: User triggered panic button! [MODES: ${settings.silentSOS ? "SILENT" : "LOUD"}]`,
        userId: settings.anonymityMode ? `ANON-PANIC-${user?.id?.split('-')[1] || "0"}` : user?.id,
        location: {
          address: pos ? "Live GPS Coordinates" : "Location Permission Denied",
          lat: pos?.lat || 0,
          lng: pos?.lng || 0
        },
        name: settings.anonymityMode ? "ANONYMOUS-PANIC-SIGNAL" : user?.fullName,
        email: settings.anonymityMode ? "ENCRYPTED" : user?.email,
      };

      const optimisticId = `REP-PANIC-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      const optimisticReport = { 
        ...payload, 
        id: optimisticId, 
        createdAt: Date.now(), 
        status: "pending",
        isAnonymous: settings.anonymityMode
      };

      // Optimistic UI Update - Instantly show in user's recently filed items
      setRecentReports(prev => [optimisticReport, ...prev].slice(0, 5));

      try {
        // High-velocity Real-time Broadcast to Police/Admin terminals
        const channel = supabase.channel('emergency_signals');
        channel.subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await channel.send({
              type: 'broadcast',
              event: 'panic_alert',
              payload: optimisticReport
            });
            setTimeout(() => supabase.removeChannel(channel), 1000);
          }
        });

        // Non-blocking database commit in the background
        fetch("/api/report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).then(() => fetchRecentReports(user?.id));

        alert(`EMERGENCY SIGNAL TRANSMITTED! ${pos ? "Location tracked." : "GPS disabled."} Authorities are responding.`);
      } catch (error) {
        console.error("Panic failed:", error);
      } finally {
        setPanicLoading(false);
      }
    };

    if (settings.panicAutoLocation) {
      if (!navigator.geolocation) {
        await transmitSignal(null);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => transmitSignal({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => transmitSignal(null),
        { enableHighAccuracy: true }
      );
    } else {
      const allow = confirm("Emergency Signal: Attach live GPS coordinates for faster response?");
      if (allow && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => transmitSignal({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          () => transmitSignal(null),
          { enableHighAccuracy: true }
        );
      } else {
        await transmitSignal(null);
      }
    }
  };

  const handleSearch = async () => {
    if (!searchId) return;
    try {
      const res = await fetch(`/api/report`);
      const data = await res.json();
      const found = data.find((r: any) => r.id.toLowerCase() === searchId.toLowerCase());
      setSearchResults(found || { error: "No report found with this ID" });
    } catch (err) {
      setSearchResults({ error: "Search failed" });
    }
  };

  return (
    <DashboardLayout role="user" userEmail={user?.id}>
      <div className="space-y-12">
        {/* Welcome Block */}
        <div className="relative p-12 rounded-[3.5rem] bg-[#0B0120] border border-white/5 overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 blur-[120px] rounded-full pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-8 text-center md:text-left">
              <button 
                onClick={toggleAnonymousMode} 
                className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-[0.2em] transition-all cursor-pointer ${
                  anonymousMode 
                    ? 'bg-green-500/20 border-green-500/30 text-green-400' 
                    : 'bg-purple-500/20 border-purple-500/30 text-purple-400'
                }`}
              >
                <ShieldCheck className="w-3 h-3" /> 
                {anonymousMode ? "🟢 Anonymous Reporting Enabled" : "🟣 Identity Verified Reporting Enabled"}
              </button>
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-[1.1]">
                Hello, <span className="text-gradient">
                  {anonymousMode ? user?.id : user?.fullName?.split(" ")[0] || "User"}
                </span>
              </h1>
              <p className="text-xl text-foreground/50 font-medium max-w-xl leading-relaxed">
                Your safety is our priority. Access emergency tools or file reports through your encrypted command center.
              </p>

              <div className="flex flex-wrap justify-center md:justify-start gap-6 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePanic}
                  disabled={panicLoading}
                  className="px-10 py-5 bg-red-500 text-white font-black rounded-3xl flex items-center gap-3 shadow-2xl shadow-red-500/40 hover:bg-red-600 transition-all uppercase tracking-widest text-xs disabled:opacity-50 group"
                >
                  <BellRing className="w-6 h-6 group-hover:animate-ping" />
                  {panicLoading ? "TRANSMITTING..." : "Trigger Panic Button"}
                </motion.button>
              </div>
            </div>

            <div className="w-full max-w-sm space-y-6">
              <div className="glass-dark border border-white/5 p-8 rounded-[2.5rem] space-y-6 shadow-2xl">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-foreground/30 flex items-center gap-2">
                  <Search className="w-3 h-3 text-primary" /> Track Report ID
                </h3>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. REP-4829"
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl pl-6 pr-14 text-sm font-bold placeholder:text-white/10 outline-none focus:border-primary transition-all"
                  />
                  <button
                    onClick={handleSearch}
                    className="absolute right-2 top-2 w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary hover:bg-primary/30 transition-all"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
                <AnimatePresence>
                  {searchResults && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className={`p-4 rounded-xl border text-xs font-bold uppercase tracking-widest ${searchResults.error ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-green-500/10 border-green-500/20 text-green-400 cursor-pointer hover:bg-green-500/20'}`}
                      onClick={() => !searchResults.error && (window.location.href = `/user/reports/${searchResults.id}`)}
                    >
                      {searchResults.error ? searchResults.error : `Found: ${searchResults.status}`}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Actions */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black tracking-tight uppercase">Emergency <span className="text-primary italic">Filing</span></h2>
              <div className="h-[2px] flex-1 bg-gradient-to-r from-border to-transparent mx-8" />
            </div>
            <ReportForm />
          </div>

          {/* Side History */}
          <div className="space-y-8">
            <h2 className="text-2xl font-black tracking-tight uppercase">Recent <span className="text-secondary italic">History</span></h2>
            <div className="space-y-4">
              {recentReports.length > 0 ? recentReports.map((report) => (
                <Link
                  key={report.id}
                  href={`/user/reports/${report.id}`}
                  className="flex items-center gap-4 p-5 rounded-2xl glass border border-white/5 hover:border-primary/20 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    {report.status === 'resolved' ? <CheckCircle2 className="w-6 h-6 text-green-500" /> : <Clock className="w-6 h-6" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground/30">{report.id}</p>
                    <h4 className="font-bold text-sm truncate">{report.type}</h4>
                  </div>
                  <ExternalLink className="w-4 h-4 text-foreground/20 group-hover:text-primary transition-colors" />
                </Link>
              )) : (
                <div className="p-8 rounded-2xl border-2 border-dashed border-white/5 text-center space-y-3 opacity-30">
                  <History className="w-8 h-8 mx-auto" />
                  <p className="text-xs font-bold uppercase tracking-widest leading-loose">No recent reports found <br /> in your current session.</p>
                </div>
              )}
              <Link href="/user/reports" className="block text-center p-4 rounded-xl border border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 hover:text-primary transition-colors">
                View Full Report History
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
