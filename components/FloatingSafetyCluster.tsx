"use client";

import { useState } from "react";
import { ShieldAlert, BookOpen, AlertOctagon } from "lucide-react";
import { motion } from "framer-motion";
import EmergencyDrawer from "./EmergencyDrawer";
import { useRouter } from "next/navigation";

export default function FloatingSafetyCluster() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const router = useRouter();

  const handleSOS = () => {
    alert("SOS Protocol Activated! Sending emergency alerts to contacts...");
  };

  const handleReport = () => {
    router.push("/user/dashboard");
  };

  return (
    <>
      <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-4 items-center">
        {/* Report Button */}
        <motion.button
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleReport}
          className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#1a0b2e]/90 backdrop-blur-xl border border-pink-500/30 shadow-[0_4px_20px_rgba(236,72,153,0.15)] flex items-center justify-center text-pink-400 hover:text-white hover:bg-pink-500/30 hover:border-pink-500/60 transition-all group"
          title="New Report"
        >
          <BookOpen className="w-5 h-5 md:w-6 md:h-6" />
        </motion.button>

        {/* Directory Button */}
        <motion.button
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsDrawerOpen(true)}
          className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#1a0b2e]/90 backdrop-blur-xl border border-pink-500/30 shadow-[0_4px_20px_rgba(236,72,153,0.15)] flex items-center justify-center text-pink-400 hover:text-white hover:bg-pink-500/30 hover:border-pink-500/60 transition-all"
          title="Safety Directory"
        >
          <ShieldAlert className="w-5 h-5 md:w-6 md:h-6" />
        </motion.button>

        {/* SOS Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSOS}
          className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-pink-600 border-2 border-pink-400 shadow-[0_0_30px_rgba(236,72,153,0.4)] flex items-center justify-center text-white relative group overflow-hidden mt-1"
          title="Emergency SOS"
        >
          {/* Subtle pulse effect */}
          <div className="absolute inset-0 rounded-full animate-ping bg-pink-400/50" style={{ animationDuration: '2.5s' }} />
          <AlertOctagon className="w-8 h-8 md:w-10 md:h-10 relative z-10" />
        </motion.button>
      </div>

      <EmergencyDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </>
  );
}
