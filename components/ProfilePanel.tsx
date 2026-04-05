"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Camera, Save, User, Mail, Phone, Hash, Shield, EyeOff, Eye } from "lucide-react";

interface ProfilePanelProps {
  role: "user" | "admin" | "police";
}

export default function ProfilePanel({ role }: ProfilePanelProps) {
  const [profile, setProfile] = useState({
    fullName: "",
    username: "",
    email: "",
    mobile: "",
    isAnonymous: true,
    anonId: "",
  });
  
  const [toast, setToast] = useState("");

  useEffect(() => {
    // Load from local storage
    const stored = localStorage.getItem(`shespeaks_profile_${role}`);
    const anonId = localStorage.getItem("anon_id") || `ANON-${Math.floor(100000 + Math.random() * 900000)}`;
    
    if (!localStorage.getItem("anon_id")) {
      localStorage.setItem("anon_id", anonId);
    }

    if (stored) {
      setProfile({ ...JSON.parse(stored), anonId });
    } else {
      setProfile(p => ({ ...p, anonId }));
    }
  }, [role]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem(`shespeaks_profile_${role}`, JSON.stringify(profile));
    showToast("Profile updated successfully");
  };

  const toggleAnonymous = () => {
    const newStatus = !profile.isAnonymous;
    setProfile(p => ({ ...p, isAnonymous: newStatus }));
    localStorage.setItem(`shespeaks_profile_${role}`, JSON.stringify({ ...profile, isAnonymous: newStatus }));
    showToast(newStatus ? "Anonymous mode enabled" : "Anonymous mode disabled");
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {toast && (
        <motion.div 
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="fixed top-24 right-8 z-50 glass-dark border border-primary/50 text-white px-6 py-4 rounded-2xl shadow-[0_0_30px_rgba(236,72,153,0.3)] flex items-center gap-3"
        >
          <Shield className="w-5 h-5 text-primary" />
          <span className="font-bold text-sm">{toast}</span>
        </motion.div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight">System <span className="text-primary italic">Identity</span></h1>
           <p className="text-foreground/50 text-sm font-bold uppercase tracking-widest mt-2">{role} Access Control Profile</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Avatar Section */}
        <div className="col-span-1">
          <div className="glass-dark border border-white/5 rounded-3xl p-8 flex flex-col items-center text-center">
            <div className="w-32 h-32 rounded-full glass border border-white/10 mb-6 flex items-center justify-center relative overflow-hidden group">
               <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${profile.fullName || role}`} alt="Avatar" className="w-full h-full object-cover" />
               <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                  <Camera className="w-8 h-8 text-white" />
               </div>
            </div>
            <h3 className="text-xl font-bold mb-1">{profile.fullName || "Update Profile"}</h3>
            <p className="text-foreground/40 text-xs font-bold uppercase tracking-widest mb-8">{role.toUpperCase()}</p>
            
            <button className="w-full py-3 glass hover:bg-white/5 border border-white/10 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2">
               <Camera className="w-4 h-4" /> Change Avatar
            </button>
          </div>
        </div>

        {/* Right: Info Section */}
        <div className="col-span-1 lg:col-span-2 space-y-8">
           
           {/* Privacy Control (Only for User) */}
           {role === "user" && (
             <div className="glass flex flex-col sm:flex-row items-center justify-between p-8 rounded-3xl border border-primary/30 shadow-[0_0_40px_rgba(236,72,153,0.1)] relative overflow-hidden gap-6">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
                <div className="relative z-10 space-y-2 flex-1">
                   <h3 className="text-xl font-black flex items-center gap-3">
                     {profile.isAnonymous ? <EyeOff className="w-6 h-6 text-primary" /> : <Eye className="w-6 h-6 text-orange-500" />}
                     Enable Anonymous Mode
                   </h3>
                   <p className="text-sm text-foreground/60 max-w-md">
                     {profile.isAnonymous 
                       ? "Your personal data is encrypted and hidden. Reports will NOT include your identity." 
                       : "Your identity is visible. Reports will be accompanied by your personal data."}
                   </p>
                </div>
                <div className="relative z-10">
                   <button 
                     type="button"
                     onClick={toggleAnonymous}
                     className={`w-16 h-8 rounded-full p-1 transition-colors duration-300 flex items-center ${profile.isAnonymous ? 'bg-primary' : 'bg-white/10'}`}
                   >
                     <motion.div 
                       layout
                       className="w-6 h-6 bg-white rounded-full shadow-md"
                       animate={{ x: profile.isAnonymous ? 32 : 0 }}
                       transition={{ type: "spring", stiffness: 500, damping: 30 }}
                     />
                   </button>
                </div>
             </div>
           )}

           {/* Profile Form */}
           <form onSubmit={handleSave} className="glass-dark border border-white/5 rounded-3xl p-8 space-y-6 relative overflow-hidden">
              <h3 className="text-lg font-bold pb-4 border-b border-white/5">Personal Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-foreground/40 ml-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
                    <input 
                      type="text" 
                      required
                      value={profile.fullName}
                      onChange={e => setProfile({...profile, fullName: e.target.value})}
                      className="w-full h-12 pl-12 pr-4 rounded-xl glass bg-transparent border border-white/10 focus:border-primary outline-none text-sm transition-all"
                      placeholder="Enter full name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-foreground/40 ml-2">Username</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
                    <input 
                      type="text" 
                      required
                      value={profile.username}
                      onChange={e => setProfile({...profile, username: e.target.value})}
                      className="w-full h-12 pl-12 pr-4 rounded-xl glass bg-transparent border border-white/10 focus:border-primary outline-none text-sm transition-all"
                      placeholder="@username"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-foreground/40 ml-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
                    <input 
                      type="email" 
                      required
                      value={profile.email}
                      onChange={e => setProfile({...profile, email: e.target.value})}
                      className="w-full h-12 pl-12 pr-4 rounded-xl glass bg-transparent border border-white/10 focus:border-primary outline-none text-sm transition-all"
                      placeholder="user@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-foreground/40 ml-2">Mobile Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
                    <input 
                      type="tel" 
                      required
                      value={profile.mobile}
                      onChange={e => setProfile({...profile, mobile: e.target.value})}
                      className="w-full h-12 pl-12 pr-4 rounded-xl glass bg-transparent border border-white/10 focus:border-primary outline-none text-sm transition-all"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>
              </div>

              {/* Immutable Identity Box */}
              <div className="pt-6">
                <div className="p-5 rounded-2xl border border-primary/20 bg-primary/5 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                     <div className="p-3 bg-primary/20 rounded-xl">
                       <Hash className="w-6 h-6 text-primary" />
                     </div>
                     <div>
                       <p className="text-[10px] uppercase font-black tracking-widest text-foreground/40">Secure Identity Code</p>
                       <p className="text-lg font-mono font-bold text-primary tracking-wider">{profile.anonId}</p>
                     </div>
                   </div>
                   <div className="px-4 py-1.5 rounded-full border border-primary/30 text-[10px] uppercase font-black tracking-widest text-primary bg-primary/10">
                     Read Only
                   </div>
                </div>
              </div>

              <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5">
                <button type="button" className="text-[10px] text-foreground/30 uppercase tracking-[0.2em] hover:text-primary transition-colors font-bold">
                  Require MFA
                </button>
                <button type="submit" className="w-full sm:w-auto px-8 py-3 btn-neon rounded-xl flex items-center justify-center gap-2">
                   <Save className="w-5 h-5" /> Save Changes
                </button>
              </div>
           </form>

        </div>
      </div>
    </div>
  );
}
