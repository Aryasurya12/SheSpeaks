"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { FileText, MoreVertical, Shield, User, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminReports() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = () => {
    fetch("/api/report")
      .then(res => res.json())
      .then(data => {
        setReports(data || []);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleUpdate = async (id: string, status: string, assignedTo?: string) => {
    await fetch("/api/report", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, assignedTo }),
    });
    fetchReports();
  };

  const policeOfficers = ["Officer Smith", "Officer Jones", "Officer Davis", "Officer Wilson"];

  return (
    <DashboardLayout role="admin" userEmail="admin@shespeaks.com">
       <div className="space-y-10">
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">Internal <span className="text-primary italic">Incident Log</span></h1>
            <p className="text-foreground/50 font-bold uppercase tracking-widest text-xs italic">Administrative Case Management & Officer Assignment</p>
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
                    <tr><td colSpan={5} className="p-20 text-center animate-pulse">Synchronizing Data...</td></tr>
                  ) : reports.length === 0 ? (
                    <tr><td colSpan={5} className="p-20 text-center opacity-30">Zero Reports loggeed in system.</td></tr>
                  ) : (
                    reports.map(report => (
                      <tr key={report.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-8 font-mono font-bold text-primary text-sm">{report.id}</td>
                        <td className="p-8">
                           <p className="font-bold tracking-tight text-sm">{report.type}</p>
                           <p className="text-[10px] text-foreground/30 mt-1 uppercase font-bold">{report.location}</p>
                        </td>
                        <td className="p-8">
                           <select 
                             value={report.status}
                             onChange={(e) => handleUpdate(report.id, e.target.value)}
                             className={cn(
                               "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border outline-none bg-black/40",
                               report.status === "pending" ? "text-orange-500 border-orange-500/20" :
                               report.status === "in-progress" ? "text-primary border-primary/20" :
                               "text-emerald-500 border-emerald-500/20"
                             )}
                           >
                             <option value="pending">Pending</option>
                             <option value="in-progress">In-Progress</option>
                             <option value="resolved">Resolved</option>
                           </select>
                        </td>
                        <td className="p-8">
                           <select 
                             value={report.assignedTo || ""}
                             onChange={(e) => handleUpdate(report.id, report.status, e.target.value)}
                             className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10 outline-none bg-black/40 text-foreground/60 focus:border-primary"
                           >
                             <option value="">Unassigned</option>
                             {policeOfficers.map(o => <option key={o} value={o}>{o}</option>)}
                           </select>
                        </td>
                        <td className="p-8 text-right">
                           <button className="p-3 hover:bg-primary/10 rounded-2xl transition-all text-foreground/20 hover:text-primary">
                             <MoreVertical className="w-5 h-5" />
                           </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
       </div>
    </DashboardLayout>
  );
}
