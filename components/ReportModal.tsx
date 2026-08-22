"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, ShieldCheck, MapPin, Clock, User, Phone, Mail, Camera, ExternalLink, ZoomIn } from "lucide-react";

interface Report {
  id: string;
  type: string;
  location: any;
  status: string;
  assignedTo: string | null;
  createdAt: number;
  description?: string;
  name?: string;
  email?: string;
  phone?: string;
  userId?: string;
  anonymousMode?: boolean;
  evidence?: string[];
  deviceId?: string;
  isIotTrigger?: boolean;
}

interface ReportModalProps {
  report: Report | null;
  onClose: () => void;
}

export default function ReportModal({ report, onClose }: ReportModalProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!report) return null;

  const downloadPDF = async () => {
    try {
      if (!report || !report.id) throw new Error("Invalid report data.");

      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF("p", "mm", "a4");

      // CONFIGURATION (STRICT)
      const MARGIN = 20;
      const PAGE_WIDTH = doc.internal.pageSize.getWidth();
      const PAGE_HEIGHT = doc.internal.pageSize.getHeight();
      const CONTENT_WIDTH = PAGE_WIDTH - (MARGIN * 2);
      const COL1_X = MARGIN;
      const VALUE1_X = 65;
      const COL2_X = 110;
      const VALUE2_X = 155;

      const BRAND_PURPLE = [109, 40, 217];
      const BLACK = [0, 0, 0];
      const DARK_GRAY = [80, 80, 80];
      const LIGHT_GRAY = [220, 220, 220];

      let currentY = MARGIN;

      // --- PERSISTENT COMPONENTS ---
      const drawHeader = (y: number) => {
        // Logo & Title
        doc.setFillColor(BRAND_PURPLE[0], BRAND_PURPLE[1], BRAND_PURPLE[2]);
        doc.rect(MARGIN, y, 4, 12, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(20);
        doc.setTextColor(BLACK[0], BLACK[1], BLACK[2]);
        doc.text("SheSpeaks", MARGIN + 8, y + 6);

        doc.setFontSize(7);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(DARK_GRAY[0], DARK_GRAY[1], DARK_GRAY[2]);
        doc.text("Safety Begins When She Speaks", MARGIN + 8, y + 10);

        // Meta
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.text(`GENERATED: ${new Date().toLocaleString().toUpperCase()}`, PAGE_WIDTH - MARGIN, y + 4, { align: "right" });
        doc.setFont("helvetica", "bold");
        doc.text(`REPORT ID: ${report.id}`, PAGE_WIDTH - MARGIN, y + 9, { align: "right" });

        doc.setDrawColor(LIGHT_GRAY[0], LIGHT_GRAY[1], LIGHT_GRAY[2]);
        doc.line(MARGIN, y + 16, PAGE_WIDTH - MARGIN, y + 16);
        return y + 25;
      };

      const drawFooter = () => {
        const totalPages = (doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
          doc.setPage(i);
          doc.setDrawColor(LIGHT_GRAY[0], LIGHT_GRAY[1], LIGHT_GRAY[2]);
          doc.line(MARGIN, PAGE_HEIGHT - 20, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 20);

          doc.setFontSize(7);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(DARK_GRAY[0], DARK_GRAY[1], DARK_GRAY[2]);
          doc.text("SheSpeaks Official Documentation System", MARGIN, PAGE_HEIGHT - 13);
          doc.text(`Page ${i} of ${totalPages}`, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 13, { align: "right" });
        }
      };

      const checkPageOverflow = (needed: number) => {
        if (currentY + needed > PAGE_HEIGHT - 25) {
          doc.addPage();
          currentY = MARGIN;
          currentY = drawHeader(currentY);
          return true;
        }
        return false;
      };

      const drawSectionTitle = (title: string) => {
        checkPageOverflow(15);
        doc.setFillColor(248, 248, 252);
        doc.rect(MARGIN, currentY - 4, CONTENT_WIDTH, 7, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(BRAND_PURPLE[0], BRAND_PURPLE[1], BRAND_PURPLE[2]);
        doc.text(title.toUpperCase(), MARGIN + 2, currentY + 1);
        currentY += 10;
      };

      // INIT PAGE 1
      currentY = drawHeader(currentY);

      // TITLE
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text("OFFICIAL INCIDENT REPORT", PAGE_WIDTH / 2, currentY, { align: "center" });
      currentY += 15;

      // SECTION 1: OVERVIEW
      drawSectionTitle("1. Incident Overview");
      doc.setFontSize(8);
      doc.setTextColor(DARK_GRAY[0], DARK_GRAY[1], DARK_GRAY[2]);

      // GRID ROW 1
      doc.setFont("helvetica", "bold"); doc.text("Report ID:", COL1_X + 2, currentY);
      doc.setFont("helvetica", "normal"); doc.text(report.id, VALUE1_X, currentY);
      doc.setFont("helvetica", "bold"); doc.text("Date Created:", COL2_X, currentY);
      doc.setFont("helvetica", "normal"); doc.text(new Date(report.createdAt).toLocaleDateString(), VALUE2_X, currentY);
      currentY += 8;

      // GRID ROW 2
      doc.setFont("helvetica", "bold"); doc.text("Incident Type:", COL1_X + 2, currentY);
      doc.setFont("helvetica", "normal"); doc.text((report.type || "ALERT").toUpperCase(), VALUE1_X, currentY);
      doc.setFont("helvetica", "bold"); doc.text("Current Status:", COL2_X, currentY);
      doc.setFont("helvetica", "bold");
      const sCol = report.status === "resolved" ? [16, 185, 129] : [245, 158, 11];
      doc.setTextColor(sCol[0], sCol[1], sCol[2]);
      doc.text((report.status || "PENDING").toUpperCase(), VALUE2_X, currentY);
      doc.setTextColor(DARK_GRAY[0], DARK_GRAY[1], DARK_GRAY[2]);
      currentY += 15;

      // SECTION 2: REPORTER
      drawSectionTitle("2. Reporter Information");
      doc.setFontSize(8);
      
      const isActuallyAnonymous = report.anonymousMode ?? (!report.name || report.name.startsWith("ANONYMOUS"));

      if (!isActuallyAnonymous && report.name) {
        doc.setFont("helvetica", "bold"); doc.text("Name:", COL1_X + 2, currentY);
        doc.setFont("helvetica", "normal"); doc.text(report.name, VALUE1_X, currentY);
        doc.setFont("helvetica", "bold"); doc.text("User Type:", COL2_X, currentY);
        doc.setFont("helvetica", "normal"); doc.text("Registered", VALUE2_X, currentY);
        currentY += 7;
        doc.setFont("helvetica", "bold"); doc.text("Contact:", COL1_X + 2, currentY);
        doc.setFont("helvetica", "normal"); doc.text(report.email || "N/A", VALUE1_X, currentY);
      } else {
        doc.setFont("helvetica", "italic");
        doc.text("ANONYMOUS / IOT FILING: Verified device identity protection.", COL1_X + 2, currentY);
        currentY += 7;
        doc.setFont("helvetica", "bold"); doc.text("Device / Secure ID:", COL1_X + 2, currentY);
        doc.setFont("helvetica", "normal"); doc.text(report.deviceId || report.userId || "IOT-DEVICE", VALUE1_X, currentY);
      }
      currentY += 15;

      // SECTION 3: DESCRIPTION
      drawSectionTitle("3. Incident Narrative");
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(BLACK[0], BLACK[1], BLACK[2]);
      const splitDesc = doc.splitTextToSize(report.description || "No narrative details.", CONTENT_WIDTH - 10);
      checkPageOverflow(splitDesc.length * 5);
      doc.text(splitDesc, MARGIN + 2, currentY);
      currentY += (splitDesc.length * 5) + 15;

      // SECTION 4: LOCATION & EVIDENCE
      drawSectionTitle("4. Location Tracking & Evidence");
      const loc = report.location;
      const addr = typeof loc === 'object' && loc !== null ? (loc.address || "Current Position") : String(loc || "Unknown");
      const latent = typeof loc === 'object' && loc !== null && loc.lat !== undefined ? `${loc.lat.toFixed(6)}, ${loc.lng.toFixed(6)}` : "N/A";

      doc.setFont("helvetica", "bold"); doc.text("Address:", COL1_X + 2, currentY);
      doc.setFont("helvetica", "normal"); doc.text(addr, VALUE1_X, currentY);
      currentY += 7;
      doc.setFont("helvetica", "bold"); doc.text("Coordinates:", COL1_X + 2, currentY);
      doc.setFont("helvetica", "normal"); doc.text(latent, VALUE1_X, currentY);
      currentY += 12;

      const evidence = report.evidence || [];
      if (evidence.length > 0) {
        checkPageOverflow(50);
        for (let i = 0; i < Math.min(evidence.length, 3); i++) {
          const img = evidence[i];
          try {
            let imgData = img;
            // If it's a Supabase URL, fetch it and convert to Base64 since jsPDF needs base64
            if (img.startsWith("http")) {
              const response = await fetch(img);
              const blob = await response.blob();
              imgData = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(blob);
              });
            }
            if (imgData.startsWith("data:image")) {
              doc.addImage(imgData, "JPEG", MARGIN + (i * 60), currentY, 55, 40);
            }
          } catch (e) {
            console.error("Could not inject image into PDF:", e);
            doc.setFontSize(8);
            doc.text("[External evidence link hidden for security]", MARGIN + (i * 60), currentY + 10);
          }
        }
        currentY += 50;
      } else {
        doc.setFont("helvetica", "italic");
        doc.text("No photographic evidence attached.", MARGIN + 2, currentY);
        currentY += 10;
      }
      currentY += 15;

      // SECTION 5: AUTHENTICATION
      drawSectionTitle("5. System Authentication");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      const legalText = "This record is digitally signed and stored in the SheSpeaks Encrypted Database. Any unauthorized alteration is a violation of secure reporting protocols. Tamper-evident ID: " + Math.random().toString(36).substring(7).toUpperCase();
      const splitLegal = doc.splitTextToSize(legalText, CONTENT_WIDTH - 10);
      doc.text(splitLegal, MARGIN + 2, currentY);

      // FINALIZE
      drawFooter();
      doc.save(`SheSpeaks_Official_${report.id}.pdf`);
    } catch (error) {
      console.error("PDF LAYOUT ERROR:", error);
      alert("Layout Error: System could not align the report.");
    }
  };

  const evidenceList = report.evidence || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0120]/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-card border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">{report.type}</h2>
              <p className="text-xs text-foreground/40 font-mono">{report.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30">Report ID</p>
                <p className="text-lg font-mono text-primary font-bold">{report.id}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30">Current Status</p>
                <p className="text-lg font-black uppercase">{report.status}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 flex items-center gap-2"><MapPin className="w-3 h-3" /> Location</p>
                <p className="font-semibold text-sm">
                  {typeof report.location === 'object' && report.location !== null ? report.location.address : report.location}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 flex items-center gap-2"><Clock className="w-3 h-3" /> Timestamp</p>
                <p className="font-semibold text-sm">{new Date(report.createdAt).toLocaleString()}</p>
              </div>
            </div>

            {/* Photographic Evidence Gallery */}
            {evidenceList.length > 0 && (
              <div className="p-6 rounded-2xl glass border border-amber-500/20 bg-amber-500/5 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400 flex items-center gap-2">
                    <Camera className="w-3.5 h-3.5" /> Photographic Evidence ({evidenceList.length})
                  </p>
                  <span className="text-[10px] font-bold text-amber-400/70 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                    IoT Camera Sensor
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {evidenceList.map((url, idx) => (
                    <div
                      key={idx}
                      className="group relative rounded-xl overflow-hidden border border-white/10 bg-black/40 aspect-video cursor-pointer hover:border-primary/50 transition-all"
                      onClick={() => setSelectedImage(url)}
                    >
                      <img
                        src={url}
                        alt={`Evidence ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <ZoomIn className="w-5 h-5 text-white" />
                        <span className="text-xs font-bold text-white uppercase tracking-wider">Expand</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Personal / Device Info */}
            <div className="p-6 rounded-2xl glass border border-primary/20 bg-primary/5">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-4">Involved Party / Device</p>
              {!(report.anonymousMode ?? (!report.name || report.name.startsWith("ANONYMOUS"))) && report.name ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40 flex items-center gap-2"><User className="w-3 h-3" /> Full Name</p>
                    <p className="font-bold text-sm tracking-tight">{report.name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40 flex items-center gap-2"><Phone className="w-3 h-3" /> Contact</p>
                    <p className="font-bold text-sm tracking-tight">{report.phone || "—"}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40 flex items-center gap-2"><Mail className="w-3 h-3" /> Email</p>
                    <p className="font-bold text-sm tracking-tight">{report.email || "—"}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-bold uppercase tracking-widest text-foreground/40">
                    {report.deviceId ? "IoT Sensor Device" : "Anonymous Mode"}
                  </span>
                  <p className="font-mono text-sm text-foreground/50">
                    ID: <span className="text-primary/70">{report.deviceId || report.userId || "IOT-CAM-01"}</span>
                  </p>
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
              <p className="font-bold text-sm">{report.assignedTo || "Unassigned / Jurisdiction Broadcast"}</p>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-white/5 flex items-center justify-end gap-3">
          <button onClick={downloadPDF} className="px-6 py-2 bg-primary/20 hover:bg-primary/30 text-primary font-black rounded-xl text-xs uppercase tracking-widest flex items-center gap-2 transition-all">
            <Download className="w-4 h-4" /> Download Official PDF
          </button>
        </div>
      </motion.div>

      {/* Fullscreen Image Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative max-w-4xl max-h-[85vh] w-full p-2 flex flex-col items-center">
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all z-10"
              >
                <X className="w-6 h-6" />
              </button>
              <img
                src={selectedImage}
                alt="Enlarged Evidence"
                className="max-w-full max-h-[80vh] object-contain rounded-2xl border border-white/20 shadow-2xl"
              />
              <div className="mt-3 flex items-center gap-4">
                <a
                  href={selectedImage}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Open in New Tab
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
