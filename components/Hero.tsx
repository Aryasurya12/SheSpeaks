"use client";

import { motion } from "framer-motion";
import { ShieldCheck, ArrowRight, MousePointer2 } from "lucide-react";
import Link from "next/link";
import Section from "./Section";

export default function Hero() {
  return (
    <Section className="pt-40 pb-20 overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
            <ShieldCheck className="w-4 h-4" />
            100% Anonymous & Secure
          </div>

          <p className="text-secondary font-black uppercase tracking-[0.3em] text-[10px] mb-8 italic opacity-70 flex items-center gap-3">
            <span className="w-8 h-[1px] bg-secondary/30"></span>
            Safety Begins When She Speaks
          </p>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
            Your Voice <br />
            <span className="text-gradient">Our Shield</span>
          </h1>
          
          <p className="text-xl text-foreground/70 mb-10 max-w-2xl leading-relaxed">
            Report incidents safely, track responses in real-time, and stay protected with our anonymous safety platform designed specifically for women.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-5 items-center">
            <Link 
              href="/login" 
              className="w-full sm:w-auto px-8 py-4 btn-neon flex items-center justify-center gap-3"
            >
              Get Started Now <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="#how-it-works"
              className="w-full sm:w-auto px-8 py-4 glass hover:bg-white/20 font-bold rounded-2xl flex items-center justify-center gap-3 transition-all"
            >
              See How It Works
            </Link>
          </div>
          
          <div className="mt-12 flex items-center gap-6 text-sm text-foreground/50">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={`w-8 h-8 rounded-full border-2 border-background bg-white/5 flex items-center justify-center overflow-hidden`}>
                   <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i * 3}`} alt="User Avatar" />
                </div>
              ))}
              <div className="w-8 h-8 rounded-full border-2 border-background bg-primary flex items-center justify-center text-[10px] font-bold text-white tracking-tighter">
                10k+
              </div>
            </div>
            <span>Trusted by thousands of users worldwide</span>
          </div>
        </motion.div>

        {/* Right Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: 10 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          className="relative order-first lg:order-last"
        >
          <div className="relative aspect-square w-full max-w-[500px] mx-auto">
            {/* Background Glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/20 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-secondary/20 blur-[100px] rounded-full animate-pulse-slow" />
            
            {/* Main Visual */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                 <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-3xl bg-[rgba(255,255,255,0.02)] backdrop-blur-md border border-[rgba(147,51,234,0.3)] shadow-[0_0_40px_rgba(236,72,153,0.15)] flex items-center justify-center relative overflow-hidden group">
                    <ShieldCheck className="w-24 h-24 sm:w-32 sm:h-32 text-primary group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute top-4 right-4 animate-bounce">
                      <MousePointer2 className="w-6 h-6 text-secondary fill-secondary" />
                    </div>
                    {/* Abstract Grid */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(var(--border) 1px, transparent 0)', backgroundSize: '16px 16px' }} />
                 </div>
                 {/* Floating Cards */}
                 <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -top-10 -right-10 glass p-4 rounded-xl border border-border shadow-lg hidden md:block"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-green-400" />
                      <span className="text-xs font-bold whitespace-nowrap">Report Active</span>
                    </div>
                 </motion.div>
                 
                 <motion.div 
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                    className="absolute -bottom-6 -left-12 glass p-4 rounded-xl border border-border shadow-lg hidden md:block"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <ShieldCheck className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-foreground/50 uppercase tracking-tighter">Status</p>
                        <p className="text-sm font-bold">Secure Connection</p>
                      </div>
                    </div>
                 </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </Section>
  );
}
