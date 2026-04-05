"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldCheck, ArrowRight, User as UserIcon } from "lucide-react";
import Link from "next/link";

export default function UserLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Determine anonymity identity
    const anonId = localStorage.getItem("anon_id") || `ANON-${Math.floor(100000 + Math.random() * 900000)}`;
    if (!localStorage.getItem("anon_id")) {
      localStorage.setItem("anon_id", anonId);
    }
    
    // Build default profile if none exists
    const stored = localStorage.getItem("shespeaks_profile_user");
    if (!stored) {
      localStorage.setItem("shespeaks_profile_user", JSON.stringify({
        fullName: "",
        username: "",
        email: "",
        mobile: "",
        isAnonymous: true,
        anonId,
      }));
    }

    setTimeout(() => {
      router.push("/user/dashboard");
    }, 1000);
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
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-dark border border-white/5 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden"
           >
              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#EC4899]/10 blur-[100px] rounded-full pointer-events-none" />
              
              <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-8 mx-auto border border-white/5">
                <UserIcon className="w-10 h-10 text-primary drop-shadow-[0_0_15px_rgba(236,72,153,0.5)]" />
              </div>
              
              <div className="text-center mb-10 relative z-10">
                <h1 className="text-3xl font-black mb-3 tracking-tighter">Enter Community</h1>
                <p className="text-foreground/50 text-xs font-bold uppercase tracking-widest leading-relaxed">
                  Join securely or continue fully anonymous
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6 relative z-10">
                
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full h-16 btn-neon flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {loading ? "Establishing Secure Connection..." : "ENTER DASHBOARD"}
                  <ArrowRight className="w-5 h-5" />
                </button>
                
                <div className="pt-6 border-t border-white/5 text-center">
                  <p className="text-xs text-foreground/40 font-bold max-w-[250px] mx-auto italic">
                    By entering, an anonymous digital identity will be secured for you automatically.
                  </p>
                </div>
              </form>
           </motion.div>
        </div>
    </div>
  );
}
