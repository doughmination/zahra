// Copyright (c) 2026 Clove Twilight
// Licensed under the ESAL-1.3 Licence.
// See LICENCE in the project root for full licence information.

import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const LAST_UPDATED = "25 February 2026";
const CONTACT_EMAIL = "admin@doughmination.win";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <motion.section
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="mb-10"
  >
    <h2 className="text-xl font-semibold text-foreground mb-3 gradient-text">{title}</h2>
    <div className="text-muted-foreground leading-relaxed space-y-3">{children}</div>
  </motion.section>
);

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 pt-32 pb-20 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-mono text-primary mb-4">
            Legal
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-3">
            Privacy <span className="gradient-text">Policy</span>
          </h1>
          <p className="text-muted-foreground text-sm">Last updated: {LAST_UPDATED}</p>
        </motion.div>

        <div className="glass rounded-2xl p-8 sm:p-10 gradient-border">
          <Section title="1. Introduction">
            <p>
              This Privacy Policy explains how Zahra ("we", "our", "the bot", "the service"), operated by Clove
              Nytrix Doughmination Twilight ("the developer"), collects, uses, and stores information when you
              interact with Zahra on Discord or visit our website.
            </p>
            <p>
              By adding Zahra to your server or using any of our services, you agree to the practices described
              in this policy.
            </p>
          </Section>

          <Section title="2. Data We Collect">
            <p>Zahra collects only the minimum data required to deliver its features:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>
                <strong className="text-foreground">Discord Server IDs</strong> — to associate moderation
                cases and settings with the correct server.
              </li>
              <li>
                <strong className="text-foreground">Discord User IDs and usernames (tags)</strong> — stored
                alongside moderation cases (e.g. ban, kick, warn, mute records) to identify the target and
                the moderator.
              </li>
              <li>
                <strong className="text-foreground">Moderation case data</strong> — action type, reason,
                optional duration, and timestamp, stored in our PostgreSQL database.
              </li>
              <li>
                <strong className="text-foreground">Temporary cache data</strong> — recent case lookups are
                cached in Redis for up to 1 hour to improve performance. This data is not persisted beyond
                the cache TTL.
              </li>
            </ul>
            <p>
              We do <strong className="text-foreground">not</strong> collect message content, voice data,
              direct messages, payment information, or any data beyond what is listed above.
            </p>
          </Section>

          <Section title="3. How We Use Your Data">
            <p>Data is used solely to provide and improve the bot's functionality:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>To create, retrieve, and manage moderation cases within a Discord server.</li>
              <li>To allow server moderators to look up case histories for their members.</li>
              <li>To enable the pardon system, allowing cases to be marked inactive.</li>
              <li>To display user information via the <code className="text-primary text-xs bg-primary/10 px-1.5 py-0.5 rounded">/userinfo</code> command using data already available from the Discord API.</li>
            </ul>
            <p>We do not use your data for advertising, profiling, or sale to third parties.</p>
          </Section>

          <Section title="4. Data Retention">
            <p>
              Moderation case records are retained indefinitely by default so that server administrators
              can maintain accurate audit logs. Server administrators may pardon (void) cases using the{" "}
              <code className="text-primary text-xs bg-primary/10 px-1.5 py-0.5 rounded">/pardon</code> command,
              which marks them as inactive.
            </p>
            <p>
              Redis cache entries expire automatically after 1 hour and are not stored permanently.
            </p>
            <p>
              If you wish to request deletion of data associated with your server or user ID, please
              contact us at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline">
                {CONTACT_EMAIL}
              </a>.
            </p>
          </Section>

          <Section title="5. Data Sharing">
            <p>
              We do not sell, rent, or share your data with third parties, except where required by law
              or to operate the service (e.g. our hosting infrastructure). Zahra is self-hostable; if you
              run your own instance, your data never leaves your own infrastructure.
            </p>
          </Section>

          <Section title="6. Security">
            <p>
              Data is stored in a PostgreSQL database and Redis cache, both running in isolated Docker
              containers on our infrastructure. Access is restricted and credentials are managed via
              encrypted environment variables. We take reasonable steps to protect data but cannot
              guarantee absolute security.
            </p>
          </Section>

          <Section title="7. Children's Privacy">
            <p>
              Zahra is intended for users who comply with Discord's Terms of Service. We do not knowingly
              collect data from users under the age of 13 (or the applicable minimum age in your region).
              If you believe data from a minor has been collected, contact us and we will delete it.
            </p>
          </Section>

          <Section title="8. Your Rights">
            <p>Depending on your location, you may have the right to:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Request access to data we hold about you.</li>
              <li>Request correction or deletion of your data.</li>
              <li>Object to processing of your data.</li>
            </ul>
            <p>
              To exercise any of these rights, contact us at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline">
                {CONTACT_EMAIL}
              </a>.
            </p>
          </Section>

          <Section title="9. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. Material changes will be announced in
              our support server. Continued use of Zahra after changes constitutes acceptance of the
              updated policy.
            </p>
          </Section>

          <Section title="10. Contact">
            <p>
              For questions about this Privacy Policy, contact us at:{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline">
                {CONTACT_EMAIL}
              </a>
            </p>
          </Section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;