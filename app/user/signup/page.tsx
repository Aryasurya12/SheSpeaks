"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldPlus, ArrowRight, User as UserIcon, Mail, Lock, UserPlus } from "lucide-react";
import Link from "next/link";

export default function UserSignup() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    isAnonymous: false
  });
  const [error, setError] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem("shespeaks_user", JSON.stringify(data.user));
        router.push("/user/dashboard");
      } else {
        setError(data.message || "Signup failed");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymous = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAnonymous: true })
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem("shespeaks_user", JSON.stringify(data.user));
        router.push("/user/dashboard");
      } else {
        setError(data.message || "Anonymous signup failed");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-6 bg-[radial-gradient(circle_at_bottom_left,_var(--primary),_transparent_40%)]">
        <Link href="/" className="mb-12 flex items-center gap-2 group">
            <div className="p-3 bg-primary/20 rounded-2xl">
              <ShieldPlus className="w-8 h-8 text-primary" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-foreground uppercase">
              She <span className="text-primary italic">Speaks</span>
            </span>
        </Link>
        
        <div className="w-full max-w-md">
           <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-dark border border-white/5 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden"
           >
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#EC4899]/10 blur-[100px] rounded-full pointer-events-none" />
              
              <div className="text-center mb-10 relative z-10">
                <h1 className="text-3xl font-black mb-3 tracking-tighter">Create Identity</h1>
                <p className="text-foreground/50 text-xs font-bold uppercase tracking-widest leading-relaxed">
                  Join the safety network secure & anonymously
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold text-center">
                  {error}
                </div>
              )}

              <form onSubmit={handleSignup} className="space-y-4 relative z-10">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-4">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/50" />
                    <input 
                      type="text" 
                      required 
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      placeholder="Jaya Sharma"
                      className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl pl-12 pr-4 text-sm focus:border-primary outline-none transition-all placeholder:text-white/10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-4">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/50" />
                    <input 
                      type="email" 
                      required 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="jaya@secure.com"
                      className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl pl-12 pr-4 text-sm focus:border-primary outline-none transition-all placeholder:text-white/10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-4">Secure Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/50" />
                    <input 
                      type="password" 
                      required 
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      placeholder="••••••••"
                      className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl pl-12 pr-4 text-sm focus:border-primary outline-none transition-all placeholder:text-white/10"
                    />
                  </div>
                </div>
                
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full h-16 btn-neon flex items-center justify-center gap-3 disabled:opacity-50 mt-4"
                >
                  {loading ? "Securing Account..." : "SIGN UP SECURELY"}
                  <UserPlus className="w-5 h-5" />
                </button>
                
                <div className="flex items-center gap-4 my-6">
                  <div className="flex-1 h-[1px] bg-white/10" />
                  <span className="text-[10px] font-black text-foreground/20 uppercase tracking-widest">or</span>
                  <div className="flex-1 h-[1px] bg-white/10" />
                </div>

                <button 
                  type="button"
                  onClick={handleAnonymous}
                  disabled={loading}
                  className="w-full h-16 glass hover:bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center gap-3 text-sm font-bold uppercase tracking-widest transition-all"
                >
                  Continue as Anonymous
                </button>

                <div className="pt-6 text-center">
                  <p className="text-xs text-foreground/40 font-bold uppercase tracking-widest">
                    Already have an account? <Link href="/user/login" className="text-primary hover:underline ml-1">Log In</Link>
                  </p>
                </div>
              </form>
           </motion.div>
        </div>
    </div>
  );
}
