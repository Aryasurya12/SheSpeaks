import { motion } from "framer-motion";
import { Phone, Copy, CheckCircle2, Bookmark } from "lucide-react";
import { useState } from "react";

export default function DirectoryCard({ icon: Icon, title, number, verified = false }: any) {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div 
      whileHover={{ y: -2 }}
      className="p-4 rounded-[1.5rem] bg-[#1a0b2e]/60 backdrop-blur-sm border border-pink-500/20 hover:border-pink-500/50 transition-all shadow-lg text-left"
    >
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-500">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              {title}
              {verified && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
            </h4>
            <p className="text-xl font-black tracking-widest text-pink-400 font-mono mt-0.5">{number}</p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
        <a 
          href={`tel:${number}`}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 transition-colors text-white text-[10px] font-black uppercase tracking-widest"
        >
          <Phone className="w-3 h-3" />
          Call Now
        </a>
        <button 
          onClick={handleCopy}
          className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-white"
          title="Copy Number"
        >
          {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
        </button>
        <button 
          onClick={() => setSaved(!saved)}
          className={`p-2.5 rounded-xl ${saved ? 'bg-pink-500/20 text-pink-500' : 'bg-white/5 hover:bg-white/10 text-white'} transition-colors`}
          title="Save Favorite"
        >
          <Bookmark className="w-4 h-4" fill={saved ? "currentColor" : "none"} />
        </button>
      </div>
    </motion.div>
  );
}
