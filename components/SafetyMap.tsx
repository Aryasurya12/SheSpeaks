"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet marker icon issue in Next.js
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function MapRecenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
}

export default function SafetyMap() {
  const [reports, setReports] = useState<any[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number]>([19.0760, 72.8777]); // Default to Mumbai
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch reports
    fetch("/api/report")
      .then(res => res.json())
      .then(data => {
        setReports(data || []);
        setLoading(false);
      });

    // Get user location
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error("Geolocation error:", error);
        }
      );
    }
  }, []);

  if (loading) {
     return (
        <div className="w-full h-[600px] rounded-[3rem] bg-white/5 border border-white/5 animate-pulse flex items-center justify-center text-foreground/20 italic uppercase tracking-[0.2em] font-black">
           Synchronizing Satellite Data...
        </div>
     );
  }

  return (
    <div className="w-full h-[600px] rounded-[3rem] overflow-hidden border-2 border-primary/20 shadow-2xl relative">
      <MapContainer 
        center={userLocation} 
        zoom={13} 
        style={{ height: "100%", width: "100%" }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapRecenter center={userLocation} />
        
        {/* User Location Marker */}
        <Marker position={userLocation} icon={defaultIcon}>
          <Popup>
            <div className="p-2">
              <p className="font-bold text-primary">Your Location</p>
              <p className="text-xs">Safe zone detection active.</p>
            </div>
          </Popup>
        </Marker>

        {/* Report Markers */}
        {reports.map((report) => {
          const lat = report.location?.lat || report.lat || 19.0760;
          const lng = report.location?.lng || report.lng || 72.8777;
          const address = typeof report.location === 'object' ? report.location.address : report.location;

          return (
            <Marker 
              key={report.id} 
              position={[lat, lng]} 
              icon={defaultIcon}
            >
              <Popup>
                <div className="p-2 min-w-[150px]">
                  <div className="flex items-center justify-between mb-2">
                     <p className="text-[10px] font-black uppercase tracking-widest text-primary">{report.id}</p>
                     <p className="text-[10px] font-black uppercase tracking-widest text-orange-500">{report.status}</p>
                  </div>
                  <h4 className="font-bold text-base mb-1">{report.type}</h4>
                  <p className="text-xs text-slate-500 mb-2 truncate">{report.description}</p>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                     <span>{address || 'Unknown Location'}</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      
      <div className="absolute bottom-8 left-8 z-10 glass-dark p-6 rounded-3xl border border-white/10 shadow-2xl space-y-4 max-w-xs">
         <h4 className="font-black uppercase tracking-widest text-xs text-primary flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
            Live Safety Radar
         </h4>
         <div className="space-y-3">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-foreground/50">
               <span>Active Incidents</span>
               <span className="text-primary">{reports.length}</span>
            </div>
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
               <div className="h-full bg-primary w-[30%]" />
            </div>
            <p className="text-[10px] text-foreground/30 font-medium italic">Showing reports within 5km radius</p>
         </div>
      </div>
    </div>
  );
}
