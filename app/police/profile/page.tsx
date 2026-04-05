"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { User, Mail, Shield, ShieldAlert, Key, LogOut } from "lucide-react";
import Link from "next/link";

export default function PoliceProfile() {
  return (
    <DashboardLayout role="police" userEmail="officer.smith@unit.gov">
       <div className="max-w-4xl mx-auto space-y-12">
          <div className="border-b border-border pb-10">
            <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">Officer <span className="text-secondary italic">Credentials</span></h1>
            <p className="text-foreground/50 font-bold uppercase tracking-widest text-xs italic">Duty Identification — Officer Smith (Badge #1024)</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="md:col-span-1 flex flex-col items-center">
               <div className="w-56 h-56 rounded-full bg-secondary/20 p-[4px] mb-8 shadow-2xl shadow-secondary/10">
                <div className="w-full h-full bg-[#0B0120] rounded-full flex items-center justify-center overflow-hidden border-2 border-secondary/30">
                   <img src="https://api.dicebear.com/7.x/initials/svg?seed=Officer" alt="Officer" />
                </div>
              </div>
              <p className="text-2xl font-black tracking-tight text-secondary lowercase">officer.smith</p>
              <div className="mt-8 flex gap-3">
                 <button className="px-6 py-2.5 bg-white/5 hover:bg-white/10 rounded-2xl text-xs font-black uppercase tracking-widest transition-all">Identity Update</button>
              </div>
            </div>

            <div className="md:col-span-2 space-y-10">
               <div className="p-10 rounded-[3rem] glass-dark border border-white/5 space-y-10 shadow-2xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30">Secure Duty Email</label>
                      <div className="flex items-center gap-4 p-5 bg-white/5 rounded-[2rem] border border-white/10">
                        <Mail className="w-5 h-5 text-secondary" />
                        <span className="font-bold text-sm tracking-tight text-foreground/80 lowercase italic font-mono">officer.smith@unit.gov</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30">Badge Number</label>
                      <div className="flex items-center gap-4 p-5 bg-white/5 rounded-[2rem] border border-white/10">
                        <Key className="w-5 h-5 text-secondary" />
                        <span className="font-mono text-sm tracking-tight text-foreground/80">#2890-SMT</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30">Deployment Status</label>
                    <div className="flex items-center justify-between gap-4 p-6 bg-secondary/10 rounded-[2.5rem] border border-secondary/20">
                      <div className="flex items-center gap-4 font-bold text-sm uppercase tracking-widest text-secondary">
                        <Shield className="w-6 h-6 text-secondary" />
                        <span>Active Response Zone — Sector 71</span>
                      </div>
                      <div className="px-4 py-1.5 rounded-full bg-secondary/20 text-secondary text-[10px] font-black uppercase tracking-widest border border-secondary/30">On-Duty</div>
                    </div>
                  </div>

                  <div className="pt-10 border-t border-white/10 flex flex-wrap gap-4">
                     <button className="px-10 py-5 bg-secondary text-secondary-foreground font-black text-xs uppercase tracking-widest rounded-3xl shadow-xl shadow-secondary/20 hover:scale-105 transition-all">Submit Duty Log</button>
                     <button className="px-10 py-5 glass text-xs font-black uppercase tracking-widest rounded-3xl">Access PIN Sync</button>
                  </div>
               </div>

               <Link href="/" className="p-8 rounded-[3rem] bg-red-500/10 border border-red-500/20 flex items-center justify-between group shadow-xl transition-all hover:scale-[1.02]">
                  <div className="flex items-center gap-6">
                     <div className="p-4 bg-red-500/20 rounded-[2rem] group-hover:bg-red-500/40 transition-all font-black uppercase tracking-widest text-red-500 text-sm">
                        End Duty
                     </div>
                     <p className="text-xs text-red-500/40 font-bold uppercase tracking-widest">Mark as Off-Duty and Log Out</p>
                  </div>
                  <LogOut className="w-6 h-6 text-red-500" />
               </Link>
            </div>
          </div>
       </div>
    </DashboardLayout>
  );
}
