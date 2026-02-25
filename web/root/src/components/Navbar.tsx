import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ExternalLink, Github, Menu, X } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/30"
    >
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <a href="#" className="flex items-center gap-3">
          <img src="/favicon.png" alt="Zahra" className="h-8" />
        </a>

        <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#dashboard" className="hover:text-foreground transition-colors">Dashboard</a>
          <a href="#open-source" className="hover:text-foreground transition-colors">Open Source</a>
          <a href="#donate" className="hover:text-foreground transition-colors">Donate</a>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <a href="https://github.com/doughmination/web" target="_blank" rel="noopener noreferrer">
              <Github className="h-4 w-4" />
            </a>
          </Button>
          <Button variant="hero" size="sm" asChild>
            <a href="https://discord.com/oauth2/authorize?client_id=1475052462410043514">
              Add to Discord <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
        </div>

        <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X /> : <Menu />}
        </button>
      </div>

      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="md:hidden glass border-t border-border/30 px-4 pb-4"
        >
          <div className="flex flex-col gap-3 pt-3 text-sm text-muted-foreground">
            <a href="#features" onClick={() => setMobileOpen(false)} className="hover:text-foreground">Features</a>
            <a href="#dashboard" onClick={() => setMobileOpen(false)} className="hover:text-foreground">Dashboard</a>
            <a href="#open-source" onClick={() => setMobileOpen(false)} className="hover:text-foreground">Open Source</a>
            <a href="#donate" onClick={() => setMobileOpen(false)} className="hover:text-foreground">Donate</a>
            <Button variant="hero" size="sm" className="w-full mt-2" asChild>
              <a href="https://discord.com/oauth2/authorize?client_id=1475052462410043514">Add to Discord</a>
            </Button>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;
