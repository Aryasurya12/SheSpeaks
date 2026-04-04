"use client";

import { motion } from "framer-motion";
import { User, ShieldAlert, UserCheck, ArrowRight } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

interface RoleCardProps {
  title: string;
  description: string;
  icon: any;
  href: string;
  color: string;
  delay: number;
}

function RoleCard({ title, description, icon: Icon, href, color, delay }: RoleCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="group"
    >
      <Link href={href} className="block h-full">
        <div className="h-full p-8 rounded-3xl glass-dark border border-white/5 group-hover:border-primary/40 transition-all duration-500 flex flex-col items-center text-center relative overflow-hidden">
          {/* Hover Glow */}
          <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
          
          <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
            <Icon className="w-10 h-10 text-primary" />
          </div>
          
          <h2 className="text-2xl font-bold mb-4 tracking-tight">{title}</h2>
          <p className="text-foreground/50 text-sm leading-relaxed mb-8 flex-1">
            {description}
          </p>
          
          <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest">
            Enter Dashboard <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function LoginSelection() {
  const roles = [
    {
      title: "I am a User",
      description: "Access safety features anonymously. No login required. Report incidents and track status instantly.",
      icon: User,
      href: "/user/dashboard",
      color: "from-[#6D28D9] to-[#EC4899]"
    },
    {
      title: "Police Officer",
      description: "Manage assigned cases, update investigation status, and coordinate with administrative panels.",
      icon: ShieldAlert,
      href: "/police/login",
      color: "from-[#9333EA] to-[#EC4899]"
    },
    {
      title: "Administrator",
      description: "Full system control. Monitor all reports, assign cases to officers, and view platform analytics.",
      icon: UserCheck,
      href: "/admin/login",
      color: "from-[#6D28D9] via-[#9333EA] to-[#EC4899]"
    }
  ];

  return (
    <div className="min-h-screen bg-transparent selection:bg-primary/30">
      <Navbar />
      
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-black mb-6 tracking-tighter"
            >
              Choose Your <span className="text-gradient">Portal</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-foreground/50 max-w-2xl mx-auto"
            >
              Select the appropriate role to continue. Users can proceed anonymously, while authority figures require secure authentication.
            </motion.p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {roles.map((role, idx) => (
              <RoleCard key={idx} {...role} delay={0.2 + idx * 0.1} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
