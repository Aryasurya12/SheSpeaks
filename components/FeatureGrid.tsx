"use client";

import { motion } from "framer-motion";
import { type LucideIcon, Target, Shield, Map, Zap, Users, CheckCircle2 } from "lucide-react";
import Section from "./Section";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  index: number;
}

function FeatureCard({ title, description, icon: Icon, index }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="p-8 rounded-3xl glass-dark border border-white/5 hover:border-primary/30 group transition-all duration-300 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
        <Icon className="w-32 h-32 text-primary" />
      </div>
      
      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
        <Icon className="w-8 h-8 text-primary shadow-sm" />
      </div>
      
      <h3 className="text-2xl font-bold mb-4 tracking-tight text-foreground transition-colors group-hover:text-primary">
        {title}
      </h3>
      
      <p className="text-foreground/60 leading-relaxed max-w-sm">
        {description}
      </p>
    </motion.div>
  );
}

export default function FeatureGrid() {
  const steps = [
    {
      title: "How It Works",
      subtitle: "Simple 3-step reporting process",
      features: [
        {
          title: "1. Report Incident",
          description: "Instantly report incidents anonymously through our secure platform with photos and location details.",
          icon: Zap
        },
        {
          title: "2. Real-time Tracking",
          description: "Follow the progress of your report as it's assigned to relevant authorities without revealing your identity.",
          icon: Target
        },
        {
          title: "3. Resolution & Closure",
          description: "Receive updates once the issue is addressed and get peace of mind through a verified closing process.",
          icon: CheckCircle2
        }
      ]
    },
    {
      title: "Platform Features",
      subtitle: "Powerful tools built for your protection",
      features: [
        {
          title: "Panic Button",
          description: "One-tap emergency broadcast to local authorities and pre-set emergency contacts with live location.",
          icon: Shield
        },
        {
          title: "Safety Map",
          description: "Crowdsourced heatmaps indicating safe routes and high-risk zones based on anonymized user reports.",
          icon: Map
        },
        {
          title: "Community Trust",
          description: "Join thousands of users who help make the environment safer through transparent reporting and support.",
          icon: Users
        }
      ]
    }
  ];

  return (
    <div id="features-container">
      {steps.map((section, sectionIdx) => (
        <Section key={sectionIdx} id={sectionIdx === 0 ? "how-it-works" : "features"} className={cn(sectionIdx % 2 === 0 ? "bg-background" : "bg-[rgba(255,255,255,0.02)]")}>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
              {section.title}
            </h2>
            <p className="text-lg text-foreground/50 max-w-2xl mx-auto">
              {section.subtitle}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {section.features.map((feature, idx) => (
              <FeatureCard 
                key={idx} 
                {...feature} 
                index={idx}
              />
            ))}
          </div>
        </Section>
      ))}
    </div>
  );
}
