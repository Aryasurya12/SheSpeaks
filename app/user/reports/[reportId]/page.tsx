"use client";

import { useState, useEffect, use } from "react";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  AlertCircle,
  FileText,
  User,
  Paperclip,
  CheckCircle2,
  Activity
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ReportDetails() {
  const params = useParams();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.reportId) {
      fetch(`/api/report`)
        .then(res => res.json())
        .then(data => {
          const found = data.find((r: any) => r.id === params.reportId);
          setReport(found);
          setLoading(false);
        });

      // Real-time synchronization
      const channel = supabase.channel(`report_${params.reportId}`)
        .on('broadcast', { event: 'status_update' }, (payload) => {
          // Sync frontend state instantly
          const updated = payload.payload;
          setReport((prev: any) => ({
            ...prev,
            status: updated.status,
            statusHistory: updated.status_history || []
          }));
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [params.reportId]);

  if (loading) return (
     <DashboardLayout role="user">
        <div className="h-[400px] flex items-center justify-center text-primary/30 font-black uppercase tracking-[0.3em] animate-pulse">
          Decrypting Report Data...
        </div>
     </DashboardLayout>
  );

  if (!report) return (
    <DashboardLayout role="user">
       <div className="text-center py-20 px-8 glass rounded-[3rem] border border-white/5 space-y-6">
          <AlertCircle className="w-16 h-16 mx-auto text-red-500" />
          <h2 className="text-3xl font-black uppercase tracking-tighter">Forbidden or Not Found</h2>
          <p className="text-foreground/50 max-w-md mx-auto">This report record either does not exist or you do not have authorization to view it.</p>
          <Link href="/user/reports" className="inline-block text-primary font-black uppercase tracking-widest text-xs border border-primary/20 px-8 py-3 rounded-xl hover:bg-primary/5">Return to Inventory</Link>
       </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout role="user">
       <div className="max-w-5xl mx-auto space-y-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
             <div className="space-y-4">
                <Link href="/user/reports" className="inline-flex items-center gap-2 text-primary text-xs font-black uppercase tracking-widest hover:opacity-70 transition-all">
                   <ArrowLeft className="w-4 h-4" /> Back to List
                </Link>
                <div className="flex flex-wrap items-center gap-6">
                   <h1 className="text-5xl font-black uppercase tracking-tighter font-mono">{report.id}</h1>
                   <div className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      report.status === 'resolved' ? 'bg-green-500/10 border-green-500/20 text-green-500' :
                      report.status === 'in-progress' ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' :
                      'bg-yellow-500/10 border-yellow-500/20 text-yellow-500'
                   }`}>
                      {report.status}
                   </div>
                </div>
             </div>

             <div className="flex items-center gap-4">
               <div className="text-right flex flex-col items-end">
                  <p className="text-[10px] font-black uppercase tracking-widest text-foreground/30 mb-1">Investigation Authority</p>
                  <p className="font-bold text-sm">{report.assignedTo || "Official Unit Pending Assignment"}</p>
               </div>
               <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-primary/50">
                  <ShieldCheck className="w-7 h-7" />
               </div>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
             <div className="lg:col-span-2 space-y-12">
                {/* Information Block */}
                <div className="p-10 rounded-[3rem] glass border border-white/5 relative overflow-hidden space-y-10">
                   <div className="absolute top-0 right-0 p-8 opacity-5">
                      <FileText className="w-48 h-48" />
                   </div>
                   
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 relative z-10">
                      <div className="space-y-3">
                         <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                           <MapPin className="w-3 h-3" /> Location Vector
                         </p>
                         <p className="font-bold text-sm tracking-tight text-foreground/80">{report.location?.address}</p>
                         <p className="text-[10px] font-mono text-foreground/20 italic">GPS: {report.location?.lat.toFixed(4)}, {report.location?.lng.toFixed(4)}</p>
                      </div>
                      <div className="space-y-3">
                         <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                           <Clock className="w-3 h-3" /> Logged On
                         </p>
                         <p className="font-bold text-sm tracking-tight text-foreground/80">{new Date(report.createdAt).toLocaleString()}</p>
                      </div>
                   </div>

                   <div className="space-y-6 relative z-10">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Narrative Record</p>
                      <div className="text-lg leading-relaxed text-foreground/70 font-medium italic border-l-4 border-primary/20 pl-8 py-2">
                         "{report.description}"
                      </div>
                   </div>

                   {/* Evidence Grid */}
                   <div className="space-y-6 relative z-10">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                        <Paperclip className="w-3 h-3" /> Attached Evidence
                      </p>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                         {report.evidence?.length > 0 ? report.evidence.map((ev: any, i: number) => (
                           <div key={i} className="aspect-square bg-white/5 rounded-2xl border border-white/5 overflow-hidden group hover:border-primary/50 transition-all cursor-zoom-in">
                              <img src={ev} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="evidence-file" />
                           </div>
                         )) : (
                            <div className="col-span-full py-10 bg-white/3 border border-dashed border-white/5 rounded-3xl text-center">
                               <p className="text-[10px] font-black uppercase tracking-widest text-foreground/20">No attachments found in this record</p>
                            </div>
                         )}
                      </div>
                   </div>
                </div>
             </div>

             {/* Sidebar Timeline */}
             <div className="space-y-8">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-foreground/30 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" /> Incident Timeline
                </h3>
                <div className="space-y-8 relative">
                   <div className="absolute left-6 top-6 bottom-6 w-[2px] bg-white/5" />
                   
                   <TimelineItem 
                      icon={<CheckCircle2 className="w-3 h-3" />}
                      active={true}
                      title="Report Synced"
                      desc="Case successfully transmitted to central authorities"
                      time={new Date(report.createdAt).toLocaleTimeString()}
                   />

                   {report.statusHistory?.map((entry: any, idx: number) => (
                      <TimelineItem 
                        key={idx}
                        icon={<Activity className="w-3 h-3" />}
                        active={true}
                        title={entry.status.toUpperCase()}
                        desc={entry.message}
                        time={new Date(entry.timestamp).toLocaleTimeString()}
                      />
                    ))}

                    {!report.statusHistory?.some((e: any) => e.status === 'resolved') && (
                      <TimelineItem 
                        icon={<ShieldCheck className="w-3 h-3" />}
                        active={false}
                        title="Final Resolution"
                        desc="Awaiting final supervisor confirmation"
                        time="PENDING"
                      />
                    )}
                </div>

                <div className="p-8 rounded-3xl bg-secondary/10 border border-secondary/20 space-y-4">
                   <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center text-secondary">
                      <User className="w-6 h-6" />
                   </div>
                   <h4 className="font-bold text-sm tracking-tight">Identity Protection</h4>
                   <p className="text-[10px] uppercase tracking-widest text-foreground/40 font-bold leading-relaxed">
                      This report is encrypted with your Secure ID. Only authorized safety units have access to these documents.
                   </p>
                </div>
             </div>
          </div>
       </div>
    </DashboardLayout>
  );
}

function TimelineItem({ icon, active, title, desc, time }: any) {
   return (
      <div className={`relative flex gap-6 group transition-opacity ${active ? 'opacity-100' : 'opacity-20'}`}>
         <div className={`w-12 h-12 rounded-xl border flex items-center justify-center z-10 transition-all ${active ? 'bg-primary border-primary text-white scale-110 shadow-lg shadow-primary/30' : 'bg-white/5 border-white/5 text-foreground/30'}`}>
            {icon}
         </div>
         <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
               <h4 className="font-bold text-sm uppercase tracking-tight">{title}</h4>
               <span className="text-[10px] font-mono opacity-40">{time}</span>
            </div>
            <p className="text-xs text-foreground/40 leading-relaxed font-medium">{desc}</p>
         </div>
      </div>
   );
}
