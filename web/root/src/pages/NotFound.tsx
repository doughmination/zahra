import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const NotFound = () => {
  const location = useLocation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    setMounted(true);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background overflow-hidden relative">
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Glow orb */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 500,
          height: 500,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background:
            "radial-gradient(circle, hsl(var(--primary) / 0.08) 0%, hsl(var(--accent) / 0.05) 50%, transparent 70%)",
        }}
      />

      {/* Content */}
      <div
        className="relative z-10 text-center px-6 transition-all duration-700"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(20px)",
        }}
      >
        {/* 404 number */}
        <div className="relative inline-block">
          <h1
            className="gradient-text glow-text font-bold leading-none select-none"
            style={{
              fontFamily: "'Comic Code', 'JetBrains Mono', monospace",
              fontSize: "clamp(100px, 20vw, 180px)",
              letterSpacing: "-0.04em",
            }}
          >
            404
          </h1>
          {/* Scanner line */}
          <div
            className="absolute left-0 right-0 pointer-events-none"
            style={{
              height: 2,
              background: "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.8), hsl(var(--accent) / 0.6), transparent)",
              boxShadow: "0 0 8px hsl(var(--primary) / 0.6), 0 0 20px hsl(var(--primary) / 0.3)",
              animation: "scan 3s ease-in-out infinite",
            }}
          />
          <style>{`
            @keyframes scan {
              0%   { top: 0%;   opacity: 0; }
              5%   { opacity: 1; }
              95%  { opacity: 1; }
              100% { top: 100%; opacity: 0; }
            }
          `}</style>
        </div>

        {/* Divider */}
        <div className="mx-auto my-5 h-px w-12 bg-gradient-to-r from-primary to-accent opacity-60" />

        {/* Card */}
        <div className="glass rounded-xl px-8 py-6 max-w-sm mx-auto gradient-border">
          <p
            className="text-foreground font-semibold text-lg mb-1"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Page not found
          </p>
          <p className="text-muted-foreground text-sm mb-4">
            Nothing lives at{" "}
            <code
              className="text-primary text-xs px-1.5 py-0.5 rounded bg-primary/10"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {location.pathname}
            </code>
          </p>

          <a
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold glow-primary transition-all duration-200 hover:opacity-90 hover:scale-105 active:scale-95"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            ← Back to home
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFound;