import { motion } from "framer-motion";
import { Shield, Zap, Music, BarChart3, Settings, MessageSquare } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Moderation",
    description: "Auto-mod, warnings, bans, mutes and full audit logging to keep your server safe.",
  },
  {
    icon: Zap,
    title: "Automation",
    description: "Custom auto-roles, welcome messages, reaction roles and scheduled actions.",
  },
  {
    icon: Settings,
    title: "Easy Config",
    description: "Configure everything through the online dashboard, commands optional.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-32 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-5xl font-bold mb-4">
            Everything you need,{" "}
            <span className="gradient-text">nothing you don't</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Packed with features, zero bloat. No premium tiers, no locked commands.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-xl p-6 group hover:border-primary/30 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
