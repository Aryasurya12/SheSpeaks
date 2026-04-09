"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldCheck, ArrowRight, Mail, Lock, LogIn } from "lucide-react";
import Link from "next/link";

export default function UserLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem("shespeaks_user", JSON.stringify(data.user));
        router.push("/user/dashboard");
      } else {
        setError(data.message || "Invalid credentials");
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
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-foreground uppercase">
              She <span className="text-primary italic">Speaks</span>
            </span>
        </Link>
        
        <div className="w-full max-w-md">
           <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-dark border border-white/5 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden"
           >
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
              
              <div className="text-center mb-10 relative z-10">
                <h1 className="text-4xl font-black mb-3 tracking-tighter">Welcome</h1>
                <p className="text-foreground/50 text-[10px] font-bold uppercase tracking-[0.3em] leading-relaxed">
                  Enter your secure credentials
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold text-center">
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4 relative z-10">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-4">Email</label>
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
                  <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-4">Password</label>
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
                  {loading ? "Verifying..." : "ACCESS PORTAL"}
                  <LogIn className="w-5 h-5" />
                </button>
                
                <div className="pt-8 text-center">
                  <p className="text-xs text-foreground/40 font-bold uppercase tracking-widest leading-loose">
                    New to SheSpeaks? <br />
                    <Link href="/user/signup" className="text-primary hover:underline">Create Secure Account</Link>
                  </p>
                </div>
              </form>
           </motion.div>
        </div>
    </div>
  );
}
