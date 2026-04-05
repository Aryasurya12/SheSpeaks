"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { User, Mail, Shield, UserCheck, Key, LogOut } from "lucide-react";
import Link from "next/link";

export default function AdminProfile() {
  return (
    <DashboardLayout role="admin" userEmail="admin@shespeaks.com">
       <div className="max-w-4xl mx-auto space-y-10">
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">Administrator <span className="text-primary italic">Profile</span></h1>
            <p className="text-foreground/50 font-bold uppercase tracking-widest text-xs italic">System Management Access / Admin Unit</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="md:col-span-1 flex flex-col items-center">
              <div className="w-56 h-56 rounded-[3rem] bg-gradient-to-br from-[#6D28D9] to-[#EC4899] p-[3px] mb-8 shadow-2xl shadow-primary/20">
                <div className="w-full h-full bg-[#0B0120] rounded-[2.8rem] flex items-center justify-center overflow-hidden">
                   <img src="https://api.dicebear.com/7.x/initials/svg?seed=Admin" alt="Admin" />
                </div>
              </div>
              <p className="text-xl font-bold tracking-tight">Main Administrator</p>
              <p className="text-xs font-black uppercase tracking-widest text-foreground/30 mt-2">Access Level: Full Auth</p>
              <button className="mt-8 px-8 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-xs font-black uppercase tracking-widest transition-all">Update Avatar</button>
            </div>

            <div className="md:col-span-2 space-y-8">
               <div className="p-10 rounded-[2.5rem] glass border border-white/5 space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30">Official Email</label>
                      <div className="flex items-center gap-4 p-5 bg-white/5 rounded-3xl border border-white/10">
                        <Mail className="w-5 h-5 text-primary" />
                        <span className="font-bold text-sm tracking-tight text-foreground/80">admin@shespeaks.com</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30">Admin ID</label>
                      <div className="flex items-center gap-4 p-5 bg-white/5 rounded-3xl border border-white/10">
                        <UserCheck className="w-5 h-5 text-primary" />
                        <span className="font-mono text-sm tracking-tight text-foreground/80">ADM-90210</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30">Security Clearance</label>
                    <div className="flex items-center gap-4 p-5 bg-primary/10 rounded-3xl border border-primary/20">
                      <Shield className="w-5 h-5 text-primary" />
                      <span className="font-bold text-sm uppercase tracking-widest text-primary">Level 4 — Direct Oversight</span>
                    </div>
                  </div>

                  <div className="pt-10 border-t border-white/10 flex flex-wrap gap-4">
                     <button className="px-10 py-5 btn-neon text-xs">Save System Sync</button>
                     <button className="px-10 py-5 glass text-xs font-black uppercase tracking-widest">Reset Master PIN</button>
                  </div>
               </div>

               <Link href="/" className="p-8 rounded-[2.5rem] bg-red-500/10 border border-red-500/20 flex items-center justify-between group">
                  <div className="flex items-center gap-6">
                     <div className="p-4 bg-red-500/20 rounded-2xl group-hover:bg-red-500/30 transition-all">
                        <LogOut className="w-6 h-6 text-red-500" />
                     </div>
                     <div>
                        <h4 className="font-black uppercase tracking-widest text-red-500 text-sm">System Decoupling</h4>
                        <p className="text-xs text-red-500/40 font-bold uppercase tracking-widest mt-1">End existing secure administrator session</p>
                     </div>
                  </div>
                  <div className="w-12 h-12 rounded-full border border-red-500/30 flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-all text-red-500">
                    <Key className="w-5 h-5" />
                  </div>
               </Link>
            </div>
          </div>
       </div>
    </DashboardLayout>
  );
}
