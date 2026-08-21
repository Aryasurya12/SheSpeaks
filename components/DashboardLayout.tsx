"use client";

import { ReactNode, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  Shield, 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings, 
  LogOut, 
  Bell, 
  Search,
  Map,
  Activity,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import FloatingSafetyCluster from "./FloatingSafetyCluster";

interface SidebarLinkProps {
  href: string;
  icon: any;
  label: string;
  active?: boolean;
}

function SidebarLink({ href, icon: Icon, label, active, onClick }: SidebarLinkProps & { onClick?: () => void }) {
  return (
    <Link 
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group",
        active 
          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
          : "hover:bg-white/5 text-foreground/60 hover:text-foreground"
      )}
    >
      <Icon className={cn("w-5 h-5", active ? "text-primary-foreground" : "text-primary/50 group-hover:text-primary")} />
      <span className="font-semibold text-sm tracking-tight">{label}</span>
    </Link>
  );
}

interface DashboardLayoutProps {
  children: ReactNode;
  role: "user" | "admin" | "police";
  userEmail?: string;
}

export default function DashboardLayout({ children, role, userEmail: propUserEmail }: DashboardLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState(propUserEmail);
  const [userName, setUserName] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetch("/api/report")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Sort by newest first
          const sorted = data.sort((a, b) => b.createdAt - a.createdAt);
          setNotifications(sorted.slice(0, 5));
        }
      })
      .catch(e => console.error("Error fetching notifications", e));
  }, []);

  useEffect(() => {
    const storedAuth = localStorage.getItem("shespeaks_user");
    const storedProfile = localStorage.getItem(`shespeaks_profile_${role}`);
    
    if (storedAuth) {
      const authUser = JSON.parse(storedAuth);
      const profileUser = storedProfile ? JSON.parse(storedProfile) : {};
      
      if (!userEmail) {
        setUserEmail(profileUser.email || authUser.email || authUser.anonId || "Anonymous");
      }
      setUserName(profileUser.username || profileUser.fullName || authUser.fullName || authUser.name || "");
    }
  }, [userEmail, role]);

  const handleLogout = () => {
    localStorage.removeItem("shespeaks_user");
  };

  const menuItems = {
    user: [
      { href: "/user/dashboard", icon: LayoutDashboard, label: "Home" },
      { href: "/user/reports", icon: FileText, label: "My Reports" },
      { href: "/user/map", icon: Map, label: "Safety Map" },
    ],
    admin: [
      { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Overview' },
      { href: '/admin/reports', icon: FileText, label: 'All Reports' },
      { href: '/admin/iot', icon: Activity, label: 'IoT Feed' },
      { href: '/admin/police', icon: Users, label: 'Manage Police' },
      { href: '/admin/analytics', icon: Activity, label: 'Analytics' },
    ],
    police: [
      { href: "/police/dashboard", icon: LayoutDashboard, label: "Task List" },
      { href: "/police/reports", icon: FileText, label: "Assigned Cases" },
    ]
  };

  return (
    <div className="flex min-h-screen bg-transparent overflow-hidden selection:bg-primary/30 selection:text-primary-foreground">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-[#0B0120]/80 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -300 }}
        animate={{ x: mobileMenuOpen ? 0 : (typeof window !== "undefined" && window.innerWidth >= 1024 ? 0 : -300) }}
        className={cn(
          "w-72 flex flex-col border-r border-border glass-dark fixed h-full z-50 transition-transform duration-300",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="p-8 border-b border-border mb-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-primary/20 rounded-xl">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground uppercase">
              She <span className="text-primary">Speaks</span>
            </span>
          </Link>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          <div className="mb-4">
            <p className="px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/30 mb-4">Main Menu</p>
            {menuItems[role].map((item: any) => (
              <SidebarLink key={item.href} {...item} onClick={() => setMobileMenuOpen(false)} />
            ))}
          </div>
          
          <div className="mt-auto pt-4 pb-8 border-t border-border">
            <p className="px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/30 mb-4">System</p>
             <SidebarLink href="/settings" icon={Settings} label="Settings" onClick={() => setMobileMenuOpen(false)} />
             <Link 
              href="/" 
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-red-500/80 hover:bg-red-500/10 transition-all font-semibold text-sm mt-2"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </Link>
          </div>
        </nav>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-72 min-h-screen relative overflow-y-auto">
        {/* Header */}
        <header className="h-20 glass-dark border-b border-border sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-4 group">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 lg:hidden rounded-xl hover:bg-white/5 active:scale-95 transition-all text-primary"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
            </button>
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-transparent border border-border/50 rounded-xl pl-10 pr-4 py-2 text-sm outline-none w-64 focus:border-primary transition-all focus:ring-4 ring-primary/5"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl hover:bg-white/5 transition-all outline-none"
              >
                <Bell className="w-5 h-5 text-foreground/50" />
                {notifications.length > 0 && (
                  <>
                    <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full animate-ping" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />
                  </>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-12 w-80 glass-dark border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
                  >
                    <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                      <h3 className="font-bold text-sm tracking-tight">Notifications</h3>
                      {notifications.length > 0 && (
                        <span className="text-[10px] font-bold bg-primary/20 text-primary px-2 py-1 rounded-full">{notifications.length} New</span>
                      )}
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notif, idx) => (
                          <div key={notif.id || idx} className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group">
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-red-500/10 rounded-xl text-red-500 mt-1 group-hover:scale-110 transition-transform">
                                <AlertTriangle className="w-4 h-4" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-bold tracking-tight">{notif.type || 'System Alert'}</p>
                                <p className="text-xs text-foreground/60 mt-1 line-clamp-2 leading-relaxed">{notif.description || 'New activity detected on the network.'}</p>
                                <p className="text-[10px] font-bold text-foreground/30 mt-2 uppercase tracking-wider">{notif.createdAt ? new Date(notif.createdAt).toLocaleDateString() : 'Just now'}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 flex flex-col items-center justify-center text-center text-sm text-foreground/50">
                          <CheckCircle className="w-8 h-8 mb-3 opacity-20" />
                          <p className="font-semibold">All caught up</p>
                          <p className="text-xs opacity-50 mt-1">No new notifications at this time.</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Link href={`/${role}/profile`} className="flex items-center gap-3 pl-2 lg:pl-6 border-l border-border hover:opacity-80 transition-opacity">
              <div className="text-right hidden md:block">
                <p className="text-xs font-bold text-foreground uppercase">
                  {userName || `${role} USER`}
                </p>
                <p className="text-[10px] text-foreground/30 font-medium truncate max-w-[150px]">
                  {userEmail || "Anonymous Session"}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 p-[2px]">
                <div className="w-full h-full bg-[#0B0120] rounded-[10px] flex items-center justify-center overflow-hidden">
                   <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${userName || role}`} alt={role} />
                </div>
              </div>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {children}
          </motion.div>
        </div>
      </main>
      {role === "user" && <FloatingSafetyCluster />}
    </div>
  );
}
