import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Heart, Coffee, ExternalLink } from "lucide-react";

const DonateSection = () => {
  return (
    <section id="donate" className="py-32 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center glass rounded-2xl p-10 sm:p-14 gradient-border"
        >
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-6">
            <Heart className="w-7 h-7 text-primary" />
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Love Zahra? <span className="gradient-text">Support us</span>
          </h2>

          <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
            Zahra will always be free with no paywalls. If you'd like to help cover hosting costs
            and fuel development, donations are always appreciated — never required.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="hero" size="lg" asChild>
              <a href="https://ko-fi.com/doughmination">
                <Coffee className="h-4 w-4" /> Buy us a Coffee
              </a>
            </Button>
            <Button variant="hero-outline" size="lg" asChild>
              <a href="https://github.com/sponsors/doughmination">
                GitHub Sponsors <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DonateSection;
