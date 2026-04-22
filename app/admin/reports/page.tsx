"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ReportModal from "@/components/ReportModal";
import { 
  FileText, 
  MoreVertical, 
  Shield, 
  User, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  Trash2,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminReports() {
  const [reports, setReports] = useState<any[]>([]);
  const [police, setPolice] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<any>(null);

  const fetchReports = () => {
    fetch("/api/report")
      .then(res => res.json())
      .then(data => {
        setReports(data || []);
        setLoading(false);
      });
  };

  const fetchPolice = () => {
    fetch("/api/police")
      .then(res => res.json())
      .then(data => setPolice(data || []));
  };

  useEffect(() => {
    fetchReports();
    fetchPolice();
  }, []);

  const handleUpdate = async (id: string, status: string, assignedTo?: string) => {
    await fetch("/api/report", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, assignedTo }),
    });
    fetchReports();
    setActiveMenu(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to PERMANENTLY Expunge this record?")) {
      await fetch(`/api/report?id=${id}`, { method: "DELETE" });
      fetchReports();
      setActiveMenu(null);
    }
  };

  return (
    <DashboardLayout role="admin" userEmail="admin@shespeaks.com">
       <div className="space-y-10">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">Internal <span className="text-primary italic">Incident Log</span></h1>
              <p className="text-foreground/50 font-bold uppercase tracking-widest text-xs italic">Administrative Case Management & Officer Assignment</p>
            </div>
            <div className="hidden md:flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-foreground/30">
               <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-500" /> Pending</div>
               <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-primary" /> Active</div>
               <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Resolved</div>
            </div>
          </div>

          <div className="glass-dark border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10 uppercase text-[10px] font-black tracking-widest text-foreground/40">
                    <th className="p-8">ID</th>
                    <th className="p-8">Type</th>
                    <th className="p-8">Status</th>
                    <th className="p-8">Assignment</th>
                    <th className="p-8 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    <tr><td colSpan={5} className="p-20 text-center animate-pulse tracking-widest font-black uppercase text-foreground/20 italic">Synchronizing Visual Records...</td></tr>
                  ) : reports.length === 0 ? (
                    <tr><td colSpan={5} className="p-20 text-center opacity-30">Zero Reports logged in system.</td></tr>
                  ) : (
                    reports.map(report => (
                      <tr key={report.id} className="hover:bg-white/[0.02] transition-colors relative group">
                        <td className="p-8 font-mono font-bold text-primary text-sm shrink-0 whitespace-nowrap">{report.id}</td>
                        <td className="p-8 min-w-[200px]">
                           <p className="font-bold tracking-tight text-sm uppercase">{report.type}</p>
                           <p className="text-[9px] text-foreground/30 mt-1 uppercase font-bold tracking-widest truncate max-w-[250px]">
                             {typeof report.location === 'object' && report.location !== null ? report.location.address : report.location}
                           </p>
                        </td>
                        <td className="p-8">
                           <select 
                             value={report.status}
                             onChange={(e) => handleUpdate(report.id, e.target.value)}
                             className={cn(
                               "px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border outline-none bg-black/40 cursor-pointer transition-all hover:bg-black/60",
                               report.status === "pending" ? "text-orange-500 border-orange-500/20" :
                               report.status === "in-progress" ? "text-white bg-primary/40 border-primary/40" :
                               "text-emerald-500 border-emerald-500/20"
                             )}
                           >
                             <option value="pending" className="bg-[#0B0120]">Pending</option>
                             <option value="in-progress" className="bg-[#0B0120]">In-Progress</option>
                             <option value="resolved" className="bg-[#0B0120]">Resolved</option>
                           </select>
                        </td>
                        <td className="p-8">
                             <select 
                               value={report.assignedTo || ""}
                               onChange={(e) => handleUpdate(report.id, report.status, e.target.value)}
                               className="px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10 outline-none bg-black/40 text-foreground/60 focus:border-primary cursor-pointer transition-all hover:bg-black/60 w-full"
                             >
                               <option value="" className="bg-[#0B0120]">Unit Unassigned</option>
                               {police.map(o => (
                                 <option key={o.id} value={o.id} className="bg-[#0B0120]">{o.name} ({o.sector})</option>
                               ))}
                             </select>
                        </td>
                        <td className="p-8 text-right relative">
                           <button 
                             onClick={() => setActiveMenu(activeMenu === report.id ? null : report.id)}
                             className={cn(
                               "p-3 rounded-2xl transition-all",
                               activeMenu === report.id ? "bg-primary text-white" : "text-foreground/20 hover:text-primary hover:bg-primary/10"
                             )}
                           >
                             <MoreVertical className="w-5 h-5" />
                           </button>

                           {/* Dropdown Menu */}
                           <AnimatePresence>
                             {activeMenu === report.id && (
                               <motion.div 
                                 initial={{ opacity: 0, scale: 0.9, x: 20 }}
                                 animate={{ opacity: 1, scale: 1, x: 0 }}
                                 exit={{ opacity: 0, scale: 0.9, x: 20 }}
                                 className="absolute right-20 top-8 z-50 w-56 glass-dark border border-white/10 rounded-[2rem] shadow-2xl p-3 space-y-1"
                               >
                                  <button 
                                    onClick={() => { setSelectedReport(report); setActiveMenu(null); }}
                                    className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-white/5 text-xs font-bold uppercase tracking-widest text-foreground/60 transition-all hover:text-primary"
                                  >
                                    <Eye className="w-4 h-4" /> View Details
                                  </button>
                                  <div className="h-[1px] bg-white/5 mx-4" />
                                  <button 
                                    onClick={() => handleDelete(report.id)}
                                    className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-red-500/10 text-xs font-bold uppercase tracking-widest text-red-500/60 transition-all hover:text-red-500"
                                  >
                                    <Trash2 className="w-4 h-4" /> Expunge Record
                                  </button>
                               </motion.div>
                             )}
                           </AnimatePresence>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
       </div>

       {/* Detailed Report Modal */}
       {selectedReport && (
         <ReportModal 
           onClose={() => setSelectedReport(null)} 
           report={selectedReport} 
         />
       )}
    </DashboardLayout>
  );
}
