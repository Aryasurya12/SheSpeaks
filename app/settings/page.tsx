"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Settings, Shield, Bell, Lock, Globe, User, ShieldCheck, Key, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    anonymityMode: true,
    encryptionEnabled: true,
    autoSelfDestruct: false,
    panicAutoLocation: true,
    rapidAuthConnection: true,
    silentSOS: false
  });

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [password, setPassword] = useState("");
  const [showToast, setShowToast] = useState(false);

  // Load Settings
  useEffect(() => {
    const saved = localStorage.getItem("sheSpeaksSettings");
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load settings", e);
      }
    }
  }, []);

  // Save Settings
  const toggleSetting = (key: keyof typeof settings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    localStorage.setItem("sheSpeaksSettings", JSON.stringify(newSettings));
    
    // Show quick feedback
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const handleAuthorize = () => {
    if (password === "admin123") { // Mock password
      setIsAuthorized(true);
      setShowAuthModal(false);
      setPassword("");
    } else {
      alert("Invalid Security Code");
    }
  };

  const settingsGroups = [
    {
      title: "Security & Privacy",
      icon: Shield,
      items: [
        { id: "anonymityMode" as const, label: "Anonymity Mode", description: "Mask all device identifiers during reporting" },
        { id: "encryptionEnabled" as const, label: "End-to-End Encryption", description: "Secure all communication between user and police" },
        { id: "autoSelfDestruct" as const, label: "Auto-Self Destruct Reports", description: "Delete local device logs after submission" },
      ]
    },
    {
      title: "Emergency Response",
      icon: Bell,
      items: [
        { id: "panicAutoLocation" as const, label: "Panic Button Auto-Location", description: "Instantly share GPS on panic trigger" },
        { id: "rapidAuthConnection" as const, label: "Rapid Auth Connection", description: "Priority signal to nearest mobile units" },
        { id: "silentSOS" as const, label: "Silent SOS Recording", description: "Start background audio on emergency signal" },
      ]
    }
  ];

  return (
    <DashboardLayout role="user">
       <div className="max-w-4xl mx-auto px-4 md:px-0 space-y-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 border-b border-white/5 pb-10">
             <div className="w-16 h-16 rounded-[2.5rem] bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-lg shadow-emerald-500/10 shrink-0">
                <Settings className="w-10 h-10" />
             </div>
             <div>
                <h1 className="text-4xl md:text-5xl font-black mb-0 tracking-tighter uppercase leading-tight">System <span className="text-emerald-500 italic">Preferences</span></h1>
                <p className="text-foreground/50 font-bold uppercase tracking-widest text-[10px] italic">Global Configuration • Security Protocols • User Experience Tuning</p>
             </div>
          </div>

          {/* Toast Notification */}
          <AnimatePresence>
            {showToast && (
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="fixed bottom-8 right-8 z-50 px-6 py-4 glass-dark border border-emerald-500/30 rounded-2xl flex items-center gap-3 shadow-2xl shadow-emerald-500/10"
              >
                <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                   <Check className="w-3 h-3 text-white" />
                </div>
                <p className="text-xs font-black uppercase tracking-widest">Protocol Updated</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-12 pb-20">
             {settingsGroups.map((group, idx) => (
               <div key={idx} className="space-y-8">
                  <div className="flex items-center gap-4">
                     <group.icon className="w-6 h-6 text-emerald-500/50" />
                     <h3 className="text-sm font-black uppercase tracking-[0.3em] text-foreground/40">{group.title}</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                     {group.items.map((item, i) => {
                       const isActive = settings[item.id];
                       return (
                         <div key={i} className="p-6 md:p-8 rounded-[2.5rem] md:rounded-[3.1rem] glass-dark border border-white/5 hover:border-emerald-500/10 transition-all flex flex-col md:flex-row items-center justify-between group shadow-2xl relative gap-6">
                            <div className="text-center md:text-left space-y-2">
                               <h4 className="font-bold tracking-tight text-lg">{item.label}</h4>
                               <p className="text-xs text-foreground/30 font-medium">{item.description}</p>
                            </div>
                            <button 
                              onClick={() => toggleSetting(item.id)}
                              className={cn(
                                "w-16 h-8 rounded-full relative transition-all duration-500 shrink-0",
                                isActive ? "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "bg-white/5"
                              )}
                            >
                               <div className={cn(
                                 "absolute top-1 w-6 h-6 rounded-full bg-white transition-all duration-500 shadow-xl",
                                 isActive ? "left-9" : "left-1 shadow-black/20"
                               )} />
                            </button>
                         </div>
                       );
                     })}
                  </div>
               </div>
             ))}
             
             {/* Security Box */}
             <div className="p-8 md:p-10 rounded-[2.5rem] md:rounded-[3.1rem] bg-indigo-500/10 border border-indigo-500/20 space-y-6 shadow-2xl">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-indigo-500/20 rounded-2xl shrink-0">
                      <Key className="w-6 h-6 text-indigo-500" />
                   </div>
                   <h4 className="font-bold text-indigo-100 uppercase tracking-tight">Security Access Update</h4>
                </div>
                <p className="text-sm text-indigo-100/40 font-bold uppercase tracking-widest leading-relaxed max-w-sm">Secure authorization requires re-authentication for critical system-level modifications.</p>
                <div className="pt-4">
                   {isAuthorized ? (
                     <div className="flex items-center gap-3 text-emerald-500">
                        <ShieldCheck className="w-5 h-5" />
                        <p className="font-black text-[10px] uppercase tracking-widest text-emerald-400">Root Access Authorized</p>
                     </div>
                   ) : (
                     <button 
                       onClick={() => setShowAuthModal(true)}
                       className="w-full md:w-auto px-8 py-4 bg-indigo-500 text-white font-black text-[10px] uppercase tracking-widest rounded-3xl hover:scale-105 transition-all shadow-xl shadow-indigo-500/20"
                     >
                       Authorize Root Access
                     </button>
                   )}
                </div>
             </div>
          </div>
       </div>

       {/* Auth Modal */}
       <AnimatePresence>
         {showAuthModal && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full max-w-md glass-dark border border-white/10 rounded-[3rem] p-10 space-y-8 relative shadow-2xl"
              >
                  <button onClick={() => setShowAuthModal(false)} className="absolute top-8 right-8 text-foreground/20 hover:text-white transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                  
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-indigo-500/20 rounded-[2rem] flex items-center justify-center text-indigo-500 mx-auto">
                      <Lock className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter">Clearance Level 3</h2>
                    <p className="text-xs font-bold uppercase tracking-widest text-foreground/30 leading-relaxed italic">Enter your security fragment to proceed.</p>
                  </div>

                  <div className="space-y-4">
                    <input 
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Fragments Pattern..."
                      className="w-full p-5 rounded-2xl bg-white/5 border border-white/10 outline-none focus:border-indigo-500 transition-all font-mono"
                    />
                    <button 
                      onClick={handleAuthorize}
                      className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-indigo-500/20 transition-all"
                    >
                      Authenticate Now
                    </button>
                  </div>
              </motion.div>
           </div>
         )}
       </AnimatePresence>
    </DashboardLayout>
  );
}
