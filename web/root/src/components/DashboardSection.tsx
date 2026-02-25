import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ExternalLink, Layout } from "lucide-react";

const DashboardSection = () => {
  return (
    <section id="dashboard" className="py-32 relative">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-mono text-primary mb-6">
              <Layout className="w-3 h-3" /> Online Dashboard
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold mb-6">
              Configure with a{" "}
              <span className="gradient-text">beautiful dashboard</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              No need to memorize commands. Our modern web dashboard lets you manage 
              moderation, automod, welcome messages, roles, and every feature 
              all from your browser.
            </p>
            <Button variant="hero" asChild>
              <a href="#">
                Open Dashboard <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Mock dashboard UI */}
            <div className="glass rounded-2xl p-1 gradient-border">
              <div className="bg-card rounded-xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50">
                  <div className="w-3 h-3 rounded-full bg-destructive/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
                  <span className="text-xs text-muted-foreground ml-2 font-mono">dashboard.url</span>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex gap-4">
                    <div className="w-1/3 space-y-3">
                      <div className="h-8 rounded-md bg-primary/10" />
                      <div className="h-6 rounded-md bg-secondary" />
                      <div className="h-6 rounded-md bg-secondary" />
                      <div className="h-6 rounded-md bg-secondary" />
                      <div className="h-6 rounded-md bg-primary/5" />
                    </div>
                    <div className="w-2/3 space-y-3">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="h-20 rounded-lg bg-primary/10 flex items-center justify-center">
                          <span className="text-primary text-xl font-bold">247</span>
                        </div>
                        <div className="h-20 rounded-lg bg-accent/10 flex items-center justify-center">
                          <span className="text-accent text-xl font-bold">1.2K</span>
                        </div>
                        <div className="h-20 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                          <span className="text-emerald-400 text-xl font-bold">99%</span>
                        </div>
                      </div>
                      <div className="h-32 rounded-lg bg-secondary/50 flex items-end p-4 gap-1">
                        {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 95, 80].map((h, i) => (
                          <div
                            key={i}
                            className="flex-1 bg-primary/30 rounded-t"
                            style={{ height: `${h}%` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -z-10 inset-0 bg-primary/5 blur-3xl rounded-full" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default DashboardSection;
