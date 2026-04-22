import { useState } from "react";
import { MapPin, ChevronDown, Crosshair } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LocationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState("Choose Area");
  const areas = ["Mumbai", "Navi Mumbai", "Pune", "Delhi", "Bangalore", "Chennai", "Hyderabad"];

  return (
    <div className="relative mb-6">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between p-4 rounded-2xl glass-dark border border-white/10 hover:border-pink-500/50 cursor-pointer transition-all bg-[#0a0118]/80 backdrop-blur-md"
      >
        <div className="flex items-center gap-3">
          <MapPin className="w-5 h-5 text-pink-500" />
          <span className="font-semibold text-sm text-white">{selected}</span>
        </div>
        <ChevronDown className="w-5 h-5 text-foreground/50" />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 w-full mt-2 bg-[#0a0118]/95 border border-white/10 rounded-2xl overflow-hidden z-50 shadow-2xl backdrop-blur-xl"
          >
            <button 
              onClick={() => { setSelected("Auto Detected"); setIsOpen(false); }}
              className="w-full flex items-center gap-3 p-4 hover:bg-pink-500/20 transition-all text-left border-b border-white/5"
            >
              <Crosshair className="w-4 h-4 text-pink-500" />
              <span className="text-sm font-bold text-pink-500">Auto Detect My Location</span>
            </button>
            <div className="max-h-48 overflow-y-auto custom-scrollbar">
              {areas.map(area => (
                <button 
                  key={area}
                  onClick={() => { setSelected(area); setIsOpen(false); }}
                  className="w-full text-left p-3 px-4 hover:bg-white/5 transition-all text-sm font-medium text-foreground/80 text-white"
                >
                  {area}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
