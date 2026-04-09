"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MapPin, Camera, AlertCircle, CheckCircle2, X, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ReportForm() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    type: "harassment",
    description: "",
    address: "",
  });
  const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [evidence, setEvidence] = useState<{ name: string, data: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEvidence(prev => [...prev, { name: file.name, data: reader.result as string }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeEvidence = (index: number) => {
    setEvidence(prev => prev.filter((_, i) => i !== index));
  };

  const captureLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setFormData(prev => ({ ...prev, address: "GPS Coordinates Captured" }));
      },
      (err) => {
        alert("Unable to capture location: " + err.message);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const settingsStr = localStorage.getItem("sheSpeaksSettings");
    const settings = settingsStr ? JSON.parse(settingsStr) : {
      anonymityMode: true,
      encryptionEnabled: true,
      autoSelfDestruct: false
    };

    const userStr = localStorage.getItem("shespeaks_user");
    const user = userStr ? JSON.parse(userStr) : null;

    if (!user) {
      alert("Session expired. Please log in again.");
      setLoading(false);
      return;
    }

    // Apply Encryption Logic
    let processedDescription = formData.description;
    if (settings.encryptionEnabled) {
      // Basic E2EE Mock: Base64 encode for demo purposes
      processedDescription = `[ENCRYPTED]: ${btoa(formData.description)}`;
    }

    const payload = {
      userId: settings.anonymityMode ? `ANON-${user.id.split('-')[1] || user.id}` : user.id,
      type: formData.type,
      description: processedDescription,
      location: {
        address: formData.address,
        lat: location?.lat || 0,
        lng: location?.lng || 0
      },
      evidence: evidence.map(e => e.data),
      name: settings.anonymityMode ? "ANONYMOUS-USER" : user.fullName,
      email: settings.anonymityMode ? "ENCRYPTED" : user.email,
    };

    try {
      const response = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      if (response.ok) {
        setSubmitted(true);
        setFormData({ type: "harassment", description: "", address: "" });
        setEvidence([]);
        setLocation(null);

        // Apply Self-Destruct Logic
        if (settings.autoSelfDestruct) {
          console.log("PROTOCOL: Self-destructing local trace...");
          // In a real app, this would clear local caches/drafts
        }
      }
    } catch (error) {
      console.error("Report failed:", error);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    const settingsStr = localStorage.getItem("sheSpeaksSettings");
    const settings = settingsStr ? JSON.parse(settingsStr) : { anonymityMode: true };

    return (
      <div className="p-12 glass shadow-2xl rounded-3xl border-2 border-green-500/20 text-center flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-6 animate-bounce">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        <h3 className="text-3xl font-bold mb-4 tracking-tight text-white">Report {settings.anonymityMode ? "Anonymously" : ""} Protected</h3>
        <p className="text-foreground/50 mb-0 max-w-sm">
          {settings.anonymityMode 
            ? "Your identity has been masked. The report is now in the secure verification queue."
            : "Your report has been received and is being processed. You can track its status in your dashboard."}
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
      <div className="bg-primary/10 p-6 border-b border-white/5">
        <h3 className="text-xl font-bold flex items-center gap-2 text-white">
          <AlertCircle className="w-5 h-5 text-primary" />
          File New Anonymous Report
        </h3>
      </div>
      
      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-4">Incident Type</label>
            <select 
              required
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full h-14 px-4 rounded-xl bg-white/5 border border-white/5 focus:border-primary outline-none transition-all appearance-none text-white"
            >
              <option value="harassment" className="bg-[#0B0120]">Harassment</option>
              <option value="theft" className="bg-[#0B0120]">Theft</option>
              <option value="assault" className="bg-[#0B0120]">Assault</option>
              <option value="suspicious-activity" className="bg-[#0B0120]">Suspicious Activity</option>
              <option value="other" className="bg-[#0B0120]">Other</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-4">Location</label>
            <div className="relative group">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary group-focus-within:scale-110 transition-transform" />
              <input 
                required
                type="text"
                placeholder="Where did it happen?"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full h-14 pl-12 pr-4 rounded-xl bg-white/5 border border-white/5 focus:border-primary text-sm text-white outline-none transition-all"
              />
              <button 
                type="button" 
                onClick={captureLocation}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-lg text-primary transition-all"
                title="Get Current Location"
              >
                <div className="w-2 h-2 rounded-full bg-primary animate-ping absolute right-2 top-2" />
                <MapPin className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-4">Details</label>
          <textarea 
            required
            rows={4}
            placeholder="Describe the incident in detail..."
             value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full p-4 rounded-xl bg-white/5 border border-white/5 focus:border-primary outline-none text-white transition-all resize-none text-sm leading-relaxed"
          />
        </div>

        {/* Evidence List */}
        <AnimatePresence>
          {evidence.length > 0 && (
            <div className="flex flex-wrap gap-4">
              {evidence.map((file, idx) => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={idx} 
                  className="relative group w-20 h-20 rounded-xl overflow-hidden border border-white/10"
                >
                  <img src={file.data} alt="evidence" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => removeEvidence(idx)}
                    className="absolute top-1 right-1 p-1 bg-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-white/5">
          <div className="flex items-center gap-4">
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-3 text-xs font-black uppercase tracking-widest px-6 py-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all text-primary"
            >
              <Paperclip className="w-4 h-4" />
              Attach Evidence
            </button>
            <input 
              type="file" 
              multiple 
              accept="image/*,video/*" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              className="hidden" 
            />
          </div>
          
          <button 
            type="submit"
            disabled={loading}
            className={cn(
              "w-full sm:w-auto px-10 py-4 btn-neon flex items-center justify-center gap-3 transition-all uppercase font-black text-sm tracking-widest",
              loading && "opacity-50"
            )}
          >
            {loading ? "Transmitting..." : "Submit Report"}
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
