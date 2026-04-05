"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { User, Mail, Shield, ShieldAlert, Key } from "lucide-react";

export default function UserProfile() {
  return (
    <DashboardLayout role="user">
       <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">My <span className="text-primary italic">Profile</span></h1>
            <p className="text-foreground/50 font-bold uppercase tracking-widest text-xs italic">Anonymous Session Data</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1 flex flex-col items-center">
              <div className="w-48 h-48 rounded-[3rem] bg-gradient-to-br from-purple-500 to-pink-500 p-[3px] mb-6 shadow-2xl shadow-primary/20">
                <div className="w-full h-full bg-[#0B0120] rounded-[2.8rem] flex items-center justify-center overflow-hidden">
                   <img src="https://api.dicebear.com/7.x/initials/svg?seed=User" alt="User" />
                </div>
              </div>
              <button className="px-6 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-black uppercase tracking-widest transition-all">Change Avatar</button>
            </div>

            <div className="md:col-span-2 space-y-6">
               <div className="p-8 rounded-[2rem] glass border border-white/5 space-y-6">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30">Anonymous User ID</label>
                    <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                      <Shield className="w-5 h-5 text-primary" />
                      <span className="font-mono text-sm">ANON-SHA-256-4829</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30">Email (Optional)</label>
                    <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                      <Mail className="w-5 h-5 text-primary/50" />
                      <span className="text-sm text-foreground/30 italic">Not provided - Total Anonymity</span>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/5 flex gap-4">
                     <button className="px-8 py-4 btn-neon text-xs">Update Profile</button>
                     <button className="px-8 py-4 glass text-xs font-black uppercase tracking-widest">Enable MFA</button>
                  </div>
               </div>

               <div className="p-6 rounded-[2rem] bg-red-500/10 border border-red-500/20">
                  <div className="flex items-start gap-4">
                     <div className="p-3 bg-red-500/20 rounded-xl">
                        <ShieldAlert className="w-6 h-6 text-red-500" />
                     </div>
                     <div>
                        <h4 className="font-bold text-red-500">Identity Protection</h4>
                        <p className="text-sm text-red-500/60 leading-relaxed mt-1">Your data is currently encrypted with end-to-end anonymity. No personal identifying information is being shared with authorities.</p>
                     </div>
                  </div>
               </div>
            </div>
          </div>
       </div>
    </DashboardLayout>
  );
}
