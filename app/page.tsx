import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FeatureGrid from "@/components/FeatureGrid";
import Section from "@/components/Section";
import Link from "next/link";
import { Shield, Lock, MapPin, Search, ArrowRight, CheckCircle2 } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main>
        {/* Hero Section */}
        <Hero />

        {/* About Section */}
        <Section id="about" className="bg-[rgba(255,255,255,0.02)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="relative">
              <div className="aspect-[4/5] rounded-[2.5rem] bg-gradient-to-br from-[#6D28D9]/30 to-[#EC4899]/30 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-[#0B0120]/80 backdrop-blur-3xl m-1 rounded-[2.4rem] p-12 flex flex-col justify-center border border-[rgba(147,51,234,0.3)]">
                    <div className="w-20 h-20 rounded-3xl bg-primary/20 flex items-center justify-center mb-8 border border-primary/20 group-hover:scale-110 transition-transform duration-500">
                      <Shield className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="text-3xl font-bold mb-6 tracking-tight">Our Mission</h3>
                    <p className="text-lg text-foreground/60 leading-relaxed max-w-sm mb-8">
                      We're building a world where every woman feels safe, empowered, and heard. 
                    </p>
                    <div className="space-y-4">
                      {[
                        "Identity Protection guaranteed",
                        "Direct connection to local authorities",
                        "Community-driven safety insights"
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                            <CheckCircle2 className="w-3 h-3 text-green-500" />
                          </div>
                          <span className="text-sm font-semibold text-foreground/80">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
              </div>
            </div>
            
            <div className="space-y-8">
              <div className="inline-block px-4 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-[10px] font-bold uppercase tracking-widest italic mb-2">
                Why She Speaks?
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
                Breaking the Silence Through <span className="text-primary italic">Secure Technology</span>
              </h2>
              <p className="text-xl text-foreground/60 leading-relaxed max-w-xl">
                Reporting incidents traditionally can be intimidating. She Speaks eliminates that barrier by providing a 100% anonymous, encrypted channel for reporting.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-6">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-border">
                    <Lock className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-bold text-lg">Zero Identification</h4>
                  <p className="text-sm text-foreground/50 leading-relaxed">No personal data required. Your anonymity is baked into our core architecture.</p>
                </div>
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-border">
                    <MapPin className="w-6 h-6 text-secondary" />
                  </div>
                  <h4 className="font-bold text-lg">Hyper-local Data</h4>
                  <p className="text-sm text-foreground/50 leading-relaxed">Specific location tracking ensures the right authorities respond exactly where needed.</p>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* How it Works & Features Integrated */}
        <FeatureGrid />

        {/* Trust Indicators */}
        <Section className="bg-[rgba(255,255,255,0.02)] overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-border to-transparent" />
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-border to-transparent" />
          
          <div className="flex flex-col items-center text-center">
            <h3 className="text-sm font-bold uppercase tracking-[0.3em] text-foreground/30 mb-12">Trusted & Verified By</h3>
            <div className="flex flex-wrap justify-center items-center gap-16 opacity-30 grayscale hover:grayscale-0 transition-all duration-500">
               {/* Placeholders for logos */}
               <div className="flex items-center gap-2 font-black text-2xl tracking-tighter">GLOBAL <span className="text-primary">SAFETY</span></div>
               <div className="flex items-center gap-2 font-black text-2xl tracking-tighter">WOMEN <span className="text-secondary">COUNCIL</span></div>
               <div className="flex items-center gap-2 font-black text-2xl tracking-tighter">TECH <span className="text-indigo-400">HEROES</span></div>
               <div className="flex items-center gap-2 font-black text-2xl tracking-tighter">UNITY <span className="text-green-400">POLICE</span></div>
            </div>
          </div>
        </Section>

        {/* CTA Section */}
        <Section className="py-24 relative">
          <div className="max-w-5xl mx-auto rounded-[3rem] bg-[#0B0120] border border-[rgba(147,51,234,0.3)] p-16 relative overflow-hidden flex flex-col items-center text-center shadow-[0_0_50px_rgba(236,72,153,0.15)]">
             {/* Background glow shadow */}
             <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
             <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-secondary/10 blur-[100px] rounded-full pointer-events-none" />
             
             <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tighter max-w-3xl leading-[1.1]">
                Ready to make a <span className="text-gradient">Real Difference?</span>
             </h2>
             <p className="text-xl text-foreground/60 mb-12 max-w-2xl leading-relaxed">
                Join our network of safe users and help us build a more secure environment for everyone, one anonymous report at a time.
             </p>
             <div className="flex flex-col sm:flex-row gap-6">
                <Link 
                  href="/login"
                  className="px-10 py-5 btn-neon flex items-center gap-3"
                >
                  START REPORTING NOW <ArrowRight className="w-6 h-6" />
                </Link>
                <Link 
                  href="/login"
                  className="px-10 py-5 glass hover:bg-white/10 font-bold rounded-2xl flex items-center gap-3 transition-all"
                >
                  ACCESS DASHBOARD
                </Link>
             </div>
          </div>
        </Section>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-border bg-transparent">
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-black tracking-tight text-foreground uppercase">
              She <span className="text-primary tracking-normal font-bold">Speaks</span>
            </span>
          </div>
          <div className="flex gap-10 text-sm font-semibold text-foreground/40 uppercase tracking-widest">
            <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-primary transition-colors">Terms</Link>
            <Link href="#" className="hover:text-primary transition-colors">Contact</Link>
          </div>
          <p className="text-sm text-foreground/30 font-medium">
            © 2026 SHE SPEAKS — Built for safety.
          </p>
        </div>
      </footer>
    </div>
  );
}
