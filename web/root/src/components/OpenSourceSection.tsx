import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Github, Star, GitFork, Code } from "lucide-react";

const OpenSourceSection = () => {
  return (
    <section id="open-source" className="py-32 relative">
      <div className="container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-mono text-primary mb-6">
            <Code className="w-3 h-3" /> Open Source
          </div>

          <h2 className="text-3xl sm:text-5xl font-bold mb-6">
            Built in the open,{" "}
            <span className="gradient-text">for everyone</span>
          </h2>

          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Zahra is fully open-source under the ESAL-1.3 license. Read the code, contribute features,
            report bugs, or self-host your own instance. Transparency is in our DNA.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button variant="hero" size="lg" asChild>
              <a href="https://github.com/doughmination/zahra" target="_blank" rel="noopener noreferrer">
                <Github className="h-5 w-5" /> View on GitHub
              </a>
            </Button>
          </div>

          <div className="flex items-center justify-center gap-8 mt-12 text-muted-foreground text-sm">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-primary" />
              <span>ESAL-1.3 License</span>
            </div>
            <div className="flex items-center gap-2">
              <GitFork className="h-4 w-4 text-primary" />
              <span>Self-hostable</span>
            </div>
            <div className="flex items-center gap-2">
              <Github className="h-4 w-4 text-primary" />
              <span>Community Driven</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default OpenSourceSection;
