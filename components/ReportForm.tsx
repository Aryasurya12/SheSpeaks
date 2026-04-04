"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MapPin, Camera, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ReportForm() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    type: "harassment",
    description: "",
    location: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const anonymousId = localStorage.getItem("anon_id") || crypto.randomUUID();
    if (!localStorage.getItem("anon_id")) {
      localStorage.setItem("anon_id", anonymousId);
    }

    // Mock API Call
    try {
      const response = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          userId: anonymousId,
        }),
      });
      
      if (response.ok) {
        setSubmitted(true);
        setFormData({ type: "harassment", description: "", location: "" });
      }
    } catch (error) {
      console.error("Report failed:", error);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="p-12 glass shadow-2xl rounded-3xl border-2 border-green-500/20 text-center flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-6 animate-bounce">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        <h3 className="text-3xl font-bold mb-4 tracking-tight">Report Submitted Successfully</h3>
        <p className="text-foreground/50 mb-0 max-w-sm">
          Your report has been received and is being processed anonymously. You can track its status in your dashboard.
        </p>
        <button 
          onClick={() => setSubmitted(false)}
          className="mt-8 text-primary font-bold hover:underline"
        >
          Submit another report
        </button>
      </div>
    );
  }

  return (
    <div className="glass shadow-2xl rounded-3xl border border-white/10 overflow-hidden">
      <div className="bg-primary/10 p-6 border-b border-border">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-primary" />
          File New Anonymous Report
        </h3>
      </div>
      
      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold uppercase tracking-widest text-foreground/50">Incident Type</label>
            <select 
              required
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full h-14 px-4 rounded-xl glass-dark border border-border focus:border-primary outline-none transition-all appearance-none bg-no-repeat bg-[right_1rem_center]"
            >
              <option value="harassment">Harassment</option>
              <option value="theft">Theft</option>
              <option value="assault">Assault</option>
              <option value="suspicious-activity">Suspicious Activity</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-bold uppercase tracking-widest text-foreground/50">Location</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/30" />
              <input 
                required
                type="text"
                placeholder="Where did it happen?"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full h-14 pl-12 pr-4 rounded-xl glass-dark border border-border focus:border-primary outline-none transition-all"
              />
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-bold uppercase tracking-widest text-foreground/50">Details</label>
          <textarea 
            required
            rows={4}
            placeholder="Describe the incident in detail..."
             value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full p-4 rounded-xl glass-dark border border-border focus:border-primary outline-none transition-all resize-none"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border/50">
          <button 
            type="button"
            className="flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-lg hover:bg-white/5 transition-all"
          >
            <Camera className="w-5 h-5 text-primary" />
            Attach Evidence
          </button>
          
          <button 
            type="submit"
            disabled={loading}
            className={cn(
              "w-full sm:w-auto px-8 py-4 btn-neon flex items-center justify-center gap-3 transition-all",
              loading && "animate-pulse"
            )}
          >
            {loading ? "Sending..." : "Submit Anonymous Report"}
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
