"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  History, 
  Search, 
  Filter, 
  ArrowLeft, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  ChevronRight,
  Shield
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";

export default function UserReports() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("shespeaks_user") || "{}");
    if (user.id) {
      fetch(`/api/report?userId=${user.id}`)
        .then(res => res.json())
        .then(data => {
          setReports(data);
          setLoading(false);
        });
    }
  }, []);

  const filteredReports = reports.filter(r => 
    filter === "all" ? true : r.status === filter
  );

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'resolved': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'in-progress': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      default: return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'resolved': return <CheckCircle2 className="w-4 h-4" />;
      case 'in-progress': return <Shield className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <DashboardLayout role="user">
       <div className="space-y-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
             <div className="space-y-4">
                <Link href="/user/dashboard" className="inline-flex items-center gap-2 text-primary text-xs font-black uppercase tracking-widest hover:opacity-70 transition-all">
                   <ArrowLeft className="w-4 h-4" /> Go Back
                </Link>
                <h1 className="text-4xl font-black uppercase tracking-tight">Report <span className="text-primary italic">Inventory</span></h1>
                <p className="text-foreground/40 text-sm font-medium">History of your reported incidents and their real-time responses.</p>
             </div>

             <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/5">
                {['all', 'pending', 'in-progress', 'resolved'].map((s) => (
                   <button
                    key={s}
                    onClick={() => setFilter(s)}
                    className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === s ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-foreground/40 hover:bg-white/5'}`}
                   >
                    {s}
                   </button>
                ))}
             </div>
          </div>

          {/* List */}
          <div className="space-y-6">
             {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {[1,2,3,4].map(i => <div key={i} className="h-48 rounded-[2.5rem] bg-white/5 animate-pulse" />)}
                </div>
             ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                   {filteredReports.map((report) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        key={report.id}
                        className="group relative"
                      >
                         <Link href={`/user/reports/${report.id}`} className="block h-full p-8 rounded-[2.5rem] glass border border-white/5 hover:border-primary/30 transition-all shadow-xl hover:shadow-primary/5">
                            <div className="flex items-center justify-between mb-8">
                               <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border ${getStatusColor(report.status)}`}>
                                  {getStatusIcon(report.status)} {report.status}
                               </span>
                               <span className="text-[10px] font-black text-foreground/20 font-mono italic">{new Date(report.createdAt).toLocaleDateString()}</span>
                            </div>

                            <h3 className="text-xl font-bold mb-4 tracking-tight group-hover:text-primary transition-colors truncate">{report.id}</h3>
                            <div className="space-y-2 mb-8">
                               <p className="text-[10px] font-black uppercase tracking-widest text-foreground/30 flex items-center gap-2"><Filter className="w-3 h-3"/> Type</p>
                               <p className="text-sm font-bold text-foreground/70 uppercase tracking-tight">{report.type}</p>
                            </div>

                            <div className="pt-6 border-t border-white/5 flex items-center justify-between text-xs font-bold uppercase tracking-widest text-foreground/40">
                               <div className="flex items-center gap-2">
                                  <ChevronRight className="w-4 h-4 text-primary" /> Details
                               </div>
                               <span className="italic">{report.assignedTo ? 'Investigator Assigned' : 'Unassigned'}</span>
                            </div>
                         </Link>
                      </motion.div>
                   ))}
                </div>
             )}

             {!loading && filteredReports.length === 0 && (
                <div className="p-20 text-center space-y-6 glass rounded-[3rem] border border-dashed border-white/10 opacity-30">
                   <AlertTriangle className="w-16 h-16 mx-auto text-primary" />
                   <h3 className="text-2xl font-black uppercase tracking-tighter">No Documentation Found</h3>
                   <p className="text-sm font-bold uppercase tracking-widest">Reports matching this status are not present in your records.</p>
                </div>
             )}
          </div>
       </div>
    </DashboardLayout>
  );
}
