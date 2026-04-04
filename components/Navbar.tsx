"use client";

import Link from "next/link";
import { Shield } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function Navbar() {
  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 glass-dark border-b border-border/50"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="p-2 bg-primary/20 rounded-xl group-hover:bg-primary/30 transition-colors">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground uppercase">
            She <span className="text-primary">Speaks</span>
          </span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8">
          <Link href="/#about" className="text-sm font-medium hover:text-primary transition-colors">
            About
          </Link>
          <Link href="/#how-it-works" className="text-sm font-medium hover:text-primary transition-colors">
            How It Works
          </Link>
          <Link href="/#features" className="text-sm font-medium hover:text-primary transition-colors">
            Features
          </Link>
          <Link 
            href="/login" 
            className="px-5 py-2.5 btn-neon"
          >
            Get Started
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}
