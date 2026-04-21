"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, User, ArrowRight, AlertCircle, Key } from "lucide-react";
import Link from "next/link";

export default function PoliceLogin() {
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
        body: JSON.stringify({ email, password, role: "police" }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("shespeaks_user", JSON.stringify(data.user));
        router.push("/police/dashboard");
      } else {
        setError("Invalid credentials for Police portal.");
      }
    } catch (err) {
      setError("System connection error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-6 bg-[radial-gradient(circle_at_bottom_left,_var(--primary),_transparent_40%)]">
        <Link href="/" className="mb-12 flex items-center gap-2 group">
            <div className="p-3 bg-primary/20 rounded-2xl">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-foreground uppercase">
              Police <span className="text-primary">Unit</span>
            </span>
        </Link>
        
        <div className="w-full max-w-md">
           <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-dark border border-white/5 rounded-[2.5rem] p-10 shadow-2xl"
           >
              <div className="text-center mb-10">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto border border-primary/20">
                  <Key className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight">Officer Authentication</h1>
                <p className="text-foreground/40 text-xs font-bold uppercase tracking-widest mt-2 italic">Official Duty Access Only</p>
              </div>

              {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-foreground/30 ml-2">Badge ID / Email</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/20" />
                    <input 
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="police@shespeaks.com"
                      className="w-full h-14 pl-12 pr-4 rounded-2xl glass-dark border border-border focus:border-primary outline-none transition-all placeholder:text-foreground/10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-foreground/30 ml-2">Access PIN / Password</label>
                  <div className="relative">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/20" />
                    <input 
                      required
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-14 pl-12 pr-4 rounded-2xl glass-dark border border-border focus:border-primary outline-none transition-all"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full h-16 btn-neon flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {loading ? "Verifying..." : "ACCESS DUTY PORTAL"}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </form>
           </motion.div>
           
           <div className="mt-8 flex justify-center gap-6">
              <Link href="/login" className="text-[10px] font-black uppercase tracking-widest text-foreground/20 hover:text-foreground transition-all">Role Selection</Link>
              <Link href="/" className="text-[10px] font-black uppercase tracking-widest text-foreground/20 hover:text-foreground transition-all">Home Page</Link>
           </div>
        </div>
    </div>
  );
}
