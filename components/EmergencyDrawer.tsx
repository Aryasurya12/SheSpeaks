import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldAlert, PhoneCall, Building2, Stethoscope, Scale, HeartHandshake } from "lucide-react";
import LocationDropdown from "./LocationDropdown";
import DirectoryCard from "./DirectoryCard";

export default function EmergencyDrawer({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#0B0120]/60 backdrop-blur-sm z-[100]"
          />
          
          {/* Drawer */}
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full md:w-[380px] bg-[#0B0120]/95 backdrop-blur-2xl border-l border-pink-500/30 z-[101] shadow-[0_0_50px_rgba(236,72,153,0.15)] flex flex-col md:rounded-l-[2rem] overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10 bg-white/5 sticky top-0 z-10 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <PhoneCall className="w-5 h-5 text-pink-500" />
                  Emergency Directory
                </h2>
                <button 
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors text-foreground/50 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-pink-500/80">Quick verified help contacts near you</p>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-transparent">
              <LocationDropdown />

              <div className="space-y-4">
                <DirectoryCard 
                  icon={ShieldAlert} 
                  title="Women Helpline" 
                  number="1091" 
                  verified={true}
                />
                <DirectoryCard 
                  icon={PhoneCall} 
                  title="National Emergency" 
                  number="112" 
                  verified={true}
                />
                <DirectoryCard 
                  icon={Building2} 
                  title="Nearby Police Station" 
                  number="100" 
                  verified={true}
                />
                <DirectoryCard 
                  icon={Stethoscope} 
                  title="Nearest Hospital" 
                  number="108" 
                  verified={true}
                />
                <DirectoryCard 
                  icon={Scale} 
                  title="Legal Aid Support" 
                  number="+91-8901234567" 
                />
                <DirectoryCard 
                  icon={HeartHandshake} 
                  title="Mental Health Support" 
                  number="9152987821" 
                />
              </div>

              {/* Mini Map Snippet Placeholder */}
              <div className="mt-8 p-5 rounded-[1.5rem] border border-white/10 bg-[#1a0b2e]/40 flex flex-col items-center justify-center gap-3 text-center opacity-90 pb-6 shadow-inner">
                 <div className="w-12 h-12 rounded-full bg-pink-500/10 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-pink-500" />
                 </div>
                 <p className="text-xs font-semibold text-foreground/80 mt-1">Nearest Safe Zone: Police Station<br/><span className="text-xs font-normal text-foreground/50">0.8 km away</span></p>
                 <button 
                   onClick={() => {
                     if (navigator.geolocation) {
                       navigator.geolocation.getCurrentPosition(
                         (pos) => {
                           window.open(`https://www.google.com/maps/dir/?api=1&origin=${pos.coords.latitude},${pos.coords.longitude}&destination=nearest+police+station`, '_blank');
                         },
                         () => {
                           window.open('https://www.google.com/maps/search/nearest+police+station', '_blank');
                         }
                       );
                     } else {
                       window.open('https://www.google.com/maps/search/nearest+police+station', '_blank');
                     }
                   }}
                   className="text-[10px] font-black text-pink-400 mt-2 uppercase tracking-widest hover:text-pink-300 transition-colors bg-pink-500/10 px-4 py-2 rounded-lg cursor-pointer"
                 >
                   Get Directions
                 </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
