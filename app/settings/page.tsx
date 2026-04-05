"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { Settings, Shield, Bell, Lock, Globe, User, ShieldCheck, Key } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const settingsGroups = [
    {
      title: "Security & Privacy",
      icon: Shield,
      items: [
        { label: "Anonymity Mode", description: "Mask all device identifiers during reporting", active: true },
        { label: "End-to-End Encryption", description: "Secure all communication between user and police", active: true },
        { label: "Auto-Self Destruct Reports", description: "Delete local device logs after submission", active: false },
      ]
    },
    {
      title: "Emergency Response",
      icon: Bell,
      items: [
        { label: "Panic Button Auto-Location", description: "Instantly share GPS on panic trigger", active: true },
        { label: "Rapid Auth Connection", description: "Priority signal to nearest mobile units", active: true },
        { label: "Silent SOS Recording", description: "Start background audio on emergency signal", active: false },
      ]
    }
  ];

  return (
    <DashboardLayout role="user">
       <div className="max-w-4xl mx-auto space-y-12">
          <div className="flex items-center gap-6 border-b border-white/5 pb-10">
             <div className="w-16 h-16 rounded-[2.5rem] bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-lg shadow-emerald-500/10">
                <Settings className="w-10 h-10" />
             </div>
             <div>
                <h1 className="text-4xl md:text-5xl font-black mb-0 tracking-tighter uppercase">System <span className="text-emerald-500 italic">Preferences</span></h1>
                <p className="text-foreground/50 font-bold uppercase tracking-widest text-[10px] italic">Global Configuration • Security Protocols • User Experience Tuning</p>
             </div>
          </div>

          <div className="space-y-12 pb-20">
             {settingsGroups.map((group, idx) => (
               <div key={idx} className="space-y-8">
                  <div className="flex items-center gap-4">
                     <group.icon className="w-6 h-6 text-emerald-500/50" />
                     <h3 className="text-sm font-black uppercase tracking-[0.3em] text-foreground/40">{group.title}</h3>
                  </div>
                  
                  <div className="space-y-4">
                     {group.items.map((item, i) => (
                       <div key={i} className="p-8 rounded-[3.1rem] glass-dark border border-white/5 hover:border-emerald-500/10 transition-all flex items-center justify-between group shadow-2xl relative">
                          <div className="space-y-2">
                             <h4 className="font-bold tracking-tight text-lg">{item.label}</h4>
                             <p className="text-xs text-foreground/30 font-medium">{item.description}</p>
                          </div>
                          <button 
                            className={cn(
                              "w-16 h-8 rounded-full relative transition-all duration-500",
                              item.active ? "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "bg-white/5"
                            )}
                          >
                             <div className={cn(
                               "absolute top-1 w-6 h-6 rounded-full bg-white transition-all duration-500 shadow-xl",
                               item.active ? "left-9" : "left-1 shadow-black/20"
                             )} />
                          </button>
                       </div>
                     ))}
                  </div>
               </div>
             ))}
             
             <div className="p-10 rounded-[3rem] bg-indigo-500/10 border border-indigo-500/20 space-y-6 shadow-2xl">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-indigo-500/20 rounded-2xl">
                      <Key className="w-6 h-6 text-indigo-500" />
                   </div>
                   <h4 className="font-bold text-indigo-100 uppercase tracking-tight">Security Access Update</h4>
                </div>
                <p className="text-sm text-indigo-100/40 font-bold uppercase tracking-widest leading-relaxed max-w-sm">Secure authorization requires re-authentication for critical system-level modifications.</p>
                <div className="pt-4">
                   <button className="px-8 py-4 bg-indigo-500 text-white font-black text-[10px] uppercase tracking-widest rounded-3xl hover:scale-105 transition-all shadow-xl shadow-indigo-500/20">Authorize Root Access</button>
                </div>
             </div>
          </div>
       </div>
    </DashboardLayout>
  );
}
