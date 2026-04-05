"use client";

import { motion } from "framer-motion";
import { X, Download, ShieldCheck, MapPin, Clock, User, Phone, Mail } from "lucide-react";

interface Report {
  id: string;
  type: string;
  location: string;
  status: string;
  assignedTo: string | null;
  createdAt: number;
  description?: string;
  name?: string;
  email?: string;
  phone?: string;
  userId?: string;
}

interface ReportModalProps {
  report: Report | null;
  onClose: () => void;
}

export default function ReportModal({ report, onClose }: ReportModalProps) {
  if (!report) return null;

  const downloadPDF = async () => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    
    // Theme Colors
    const primaryPurple = [109, 40, 217] as [number, number, number]; // #6D28D9
    const accentPink = [236, 72, 153] as [number, number, number]; // #EC4899
    const darkText = [30, 30, 30] as [number, number, number];
    const lightText = [120, 120, 120] as [number, number, number];

    // Background header bar
    doc.setFillColor(...primaryPurple);
    doc.rect(0, 0, 210, 30, 'F');
    
    // Header Text
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.text("SHESPEAKS", 15, 18);
    
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.text("Safety Begins When She Speaks", 15, 25);
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("INCIDENT REPORT", 140, 18);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("CONFIDENTIAL", 140, 25);

    // Section 1: Restoring defaults and writing Incident Details
    doc.setTextColor(...darkText);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...accentPink);
    doc.text("INCIDENT DETAILS", 15, 45);
    
    doc.setDrawColor(...accentPink);
    doc.setLineWidth(0.5);
    doc.line(15, 48, 195, 48);

    doc.setTextColor(...darkText);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Report ID:", 15, 58);
    doc.setFont("helvetica", "normal");
    doc.text(report.id, 45, 58);
    
    doc.setFont("helvetica", "bold");
    doc.text("Timestamp:", 110, 58);
    doc.setFont("helvetica", "normal");
    doc.text(new Date(report.createdAt).toLocaleString(), 135, 58);

    doc.setFont("helvetica", "bold");
    doc.text("Incident Type:", 15, 68);
    doc.setFont("helvetica", "normal");
    doc.text(report.type, 45, 68);
    
    doc.setFont("helvetica", "bold");
    doc.text("Location:", 110, 68);
    doc.setFont("helvetica", "normal");
    doc.text(report.location, 130, 68);

    // Section 2: Reporter Details
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...accentPink);
    doc.text("REPORTER IDENTIFICATION", 15, 85);
    
    doc.setDrawColor(...accentPink);
    doc.line(15, 88, 195, 88);

    doc.setTextColor(...darkText);
    doc.setFontSize(10);

    if (report.name) {
      doc.setFont("helvetica", "bold");
      doc.text("Full Name:", 15, 98);
      doc.setFont("helvetica", "normal");
      doc.text(report.name, 45, 98);
      
      doc.setFont("helvetica", "bold");
      doc.text("Email:", 110, 98);
      doc.setFont("helvetica", "normal");
      doc.text(report.email || "N/A", 125, 98);
      
      doc.setFont("helvetica", "bold");
      doc.text("Phone:", 15, 108);
      doc.setFont("helvetica", "normal");
      doc.text(report.phone || "N/A", 45, 108);
    } else {
      doc.setFillColor(250, 245, 255);
      doc.rect(15, 93, 180, 25, 'F');
      
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...primaryPurple);
      doc.text("ANONYMOUS MODE ACTIVE", 20, 102);
      
      doc.setTextColor(...darkText);
      doc.text("Secure Tracking ID:", 20, 110);
      doc.setFont("helvetica", "normal");
      doc.text(report.userId || "N/A", 60, 110);
    }

    // Section 3: Detailed Description
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...accentPink);
    doc.text("NARRATIVE / DESCRIPTION", 15, 130);
    
    doc.setDrawColor(...accentPink);
    doc.line(15, 133, 195, 133);

    doc.setTextColor(...darkText);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    const splitDesc = doc.splitTextToSize(report.description || "No narrative details provided.", 180);
    doc.text(splitDesc, 15, 143);
    
    const offset = 143 + (splitDesc.length * 5) + 10;

    // Section 4: Assignment Details
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...accentPink);
    doc.text("ASSIGNMENT & STATUS", 15, offset);
    
    doc.setDrawColor(...accentPink);
    doc.line(15, offset + 3, 195, offset + 3);

    doc.setTextColor(...darkText);
    doc.setFontSize(10);
    
    doc.setFont("helvetica", "bold");
    doc.text("Current Status:", 15, offset + 13);
    doc.setFont("helvetica", "normal");
    
    // Color code the status
    if (report.status === "pending") doc.setTextColor(249, 115, 22);
    else if (report.status === "in-progress") doc.setTextColor(...primaryPurple);
    else doc.setTextColor(16, 185, 129);
    
    doc.text(report.status.toUpperCase(), 45, offset + 13);
    
    doc.setTextColor(...darkText);
    doc.setFont("helvetica", "bold");
    doc.text("Assigned Officer:", 110, offset + 13);
    doc.setFont("helvetica", "normal");
    doc.text(report.assignedTo || "Unassigned", 145, offset + 13);

    // Footer
    const pageHeight = doc.internal.pageSize.height;
    doc.setDrawColor(200, 200, 200);
    doc.line(15, pageHeight - 20, 195, pageHeight - 20);
    
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(...lightText);
    doc.text("Generated securely by SheSpeaks Automated Systems.", 15, pageHeight - 15);
    doc.text("This document contains sensitive information. Unauthorized distribution is prohibited.", 15, pageHeight - 10);
    
    doc.save(`SheSpeaks_Official_${report.id}.pdf`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0120]/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-dark border border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative"
      >
        <div className="flex items-center justify-between p-6 border-b border-white/5">
           <h2 className="text-xl font-black uppercase tracking-widest text-primary flex items-center gap-3">
             <ShieldCheck className="w-6 h-6" /> Incident Details
           </h2>
           <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-all">
             <X className="w-5 h-5 text-foreground/50" />
           </button>
        </div>

        <div id="pdf-report" className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
           {/* Header Info */}
           <div className="grid grid-cols-2 gap-6 pb-6 border-b border-white/5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30">Report ID</p>
                <p className="text-lg font-mono text-primary font-bold">{report.id}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30">Current Status</p>
                <p className="text-lg font-black uppercase">{report.status}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 flex items-center gap-2"><MapPin className="w-3 h-3"/> Location</p>
                <p className="font-semibold text-sm">{report.location}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 flex items-center gap-2"><Clock className="w-3 h-3"/> Timestamp</p>
                <p className="font-semibold text-sm">{new Date(report.createdAt).toLocaleString()}</p>
              </div>
           </div>

           {/* Personal Info if available */}
           <div className="p-6 rounded-2xl glass border border-primary/20 bg-primary/5">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-4">Involved Party / Victim</p>
              {report.name ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40 flex items-center gap-2"><User className="w-3 h-3"/> Full Name</p>
                    <p className="font-bold text-sm tracking-tight">{report.name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40 flex items-center gap-2"><Phone className="w-3 h-3"/> Contact</p>
                    <p className="font-bold text-sm tracking-tight">{report.phone || "—"}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40 flex items-center gap-2"><Mail className="w-3 h-3"/> Email</p>
                    <p className="font-bold text-sm tracking-tight">{report.email || "—"}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-bold uppercase tracking-widest text-foreground/40">Anonymous Mode</span>
                  <p className="font-mono text-sm text-foreground/50">Secure ID: <span className="text-primary/70">{report.userId}</span></p>
                </div>
              )}
           </div>

           {/* Description */}
           <div className="space-y-3">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30">Detailed Description</p>
              <div className="p-6 rounded-2xl bg-black/20 border border-white/5 text-sm leading-relaxed text-foreground/80">
                {report.description || "No specific details provided."}
              </div>
           </div>
           
           <div className="space-y-3">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30">Assigned Resources</p>
              <p className="font-bold text-sm">{report.assignedTo || "Unassigned"}</p>
           </div>
        </div>

        <div className="p-6 border-t border-white/5 flex items-center justify-end">
           <button onClick={downloadPDF} className="px-6 py-2 bg-primary/20 hover:bg-primary/30 text-primary font-black rounded-xl text-xs uppercase tracking-widest flex items-center gap-2 transition-all">
             <Download className="w-4 h-4" /> Download Official PDF
           </button>
        </div>
      </motion.div>
    </div>
  );
}
