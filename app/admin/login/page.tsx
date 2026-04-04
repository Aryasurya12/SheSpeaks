"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Mail, ShieldCheck, ArrowRight, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role: "admin" }),
      });

      if (response.ok) {
        router.push("/admin/dashboard");
      } else {
        setError("Invalid admin credentials. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-6 selection:bg-primary/30">
        <Link href="/" className="absolute top-10 left-10 flex items-center gap-2 group">
            <div className="p-2 bg-primary/20 rounded-xl">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm font-bold tracking-tight text-foreground uppercase opacity-50 group-hover:opacity-100 transition-all">
              She <span className="text-primary">Speaks</span>
            </span>
        </Link>
        
        <div className="w-full max-w-md">
           <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-dark border border-white/5 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden"
           >
              {/* Background Glow */}
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 blur-[100px] rounded-full" />
              
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-8 mx-auto">
                <Lock className="w-8 h-8 text-primary shadow-sm" />
              </div>
              
              <div className="text-center mb-10">
                <h1 className="text-3xl font-black mb-3 tracking-tighter">Admin Portal</h1>
                <p className="text-foreground/50 text-sm font-semibold uppercase tracking-widest leading-relaxed italic">
                  Secure Identity Authentication Required
                </p>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-500 text-sm font-bold"
                >
                  <AlertCircle className="w-5 h-5" />
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-[0.2em] text-foreground/30 ml-4">Authorized Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/20" />
                    <input 
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@shespeaks.com"
                      className="w-full h-14 pl-12 pr-4 rounded-2xl glass-dark border border-border focus:border-primary outline-none transition-all group"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-[0.2em] text-foreground/30 ml-4">Secure Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/20" />
                    <input 
                      required
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-14 pl-12 pr-4 rounded-2xl glass-dark border border-border focus:border-primary outline-none transition-all group"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full h-16 btn-neon flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {loading ? "Authenticating..." : "AUTHORIZE ACCESS"}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </form>
           </motion.div>
           
           <div className="text-center mt-12">
              <p className="text-[10px] uppercase font-bold text-foreground/30 tracking-[0.3em] italic">
                Unauthorized access is strictly monitored and recorded.
              </p>
           </div>
        </div>
    </div>
  );
}
