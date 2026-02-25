// Copyright (c) 2026 Clove Twilight
// Licensed under the ESAL-1.3 Licence.
// See LICENCE in the project root for full licence information.

import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const LAST_UPDATED = "25 February 2026";
const CONTACT_EMAIL = "admin@doughmination.win";
const SUPPORT_SERVER = "https://discord.gg/RQDRzK3VBe";

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

const TermsOfService = () => {
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
            Terms of <span className="gradient-text">Service</span>
          </h1>
          <p className="text-muted-foreground text-sm">Last updated: {LAST_UPDATED}</p>
        </motion.div>

        <div className="glass rounded-2xl p-8 sm:p-10 gradient-border">
          <Section title="1. Acceptance of Terms">
            <p>
              By adding Zahra to your Discord server, using any of its commands, or accessing our website,
              you agree to be bound by these Terms of Service ("Terms"). If you do not agree, do not use
              Zahra.
            </p>
            <p>
              These Terms apply to all users, including server administrators, moderators, and end users.
            </p>
          </Section>

          <Section title="2. Description of Service">
            <p>
              Zahra is a free, open-source Discord bot providing moderation tools including — but not
              limited to — bans, kicks, warnings, mutes, case management, purging, and server information
              commands. Zahra is provided "as is" and is free to use under the terms of the{" "}
              <strong className="text-foreground">Estrogen Source-Available Licence (ESAL-1.3)</strong>.
            </p>
          </Section>

          <Section title="3. Eligibility">
            <p>
              You must comply with Discord's own Terms of Service to use Zahra. You must be of the minimum
              age required by Discord in your region. By using Zahra, you represent that you meet these
              requirements.
            </p>
          </Section>

          <Section title="4. Acceptable Use">
            <p>You agree not to use Zahra to:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Harass, threaten, or harm any individual or group.</li>
              <li>Violate any applicable laws or regulations.</li>
              <li>Abuse the bot to spam Discord's API or disrupt other users.</li>
              <li>Attempt to exploit, reverse-engineer, or attack the bot's infrastructure.</li>
              <li>
                Use the bot in a manner that violates Discord's{" "}
                <a
                  href="https://discord.com/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Terms of Service
                </a>{" "}
                or{" "}
                <a
                  href="https://discord.com/guidelines"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Community Guidelines
                </a>.
              </li>
            </ul>
            <p>
              We reserve the right to block any server or user from accessing Zahra for violations of
              these Terms, at our sole discretion.
            </p>
          </Section>

          <Section title="5. Moderation Data and Server Administrators">
            <p>
              Server administrators who add Zahra take responsibility for how the bot is used within
              their server. Moderation actions (bans, kicks, warnings, etc.) are recorded and attributed
              to the Discord user who issued them. Zahra stores this data as described in our{" "}
              <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>.
            </p>
            <p>
              Administrators are responsible for ensuring their use of Zahra's moderation features
              complies with applicable laws (including data protection laws in their jurisdiction) and
              Discord's policies.
            </p>
          </Section>

          <Section title="6. Availability and Uptime">
            <p>
              Zahra is provided free of charge with no uptime guarantees. We aim for high availability
              but do not warrant that the service will be uninterrupted, error-free, or available at any
              particular time. Scheduled or unscheduled maintenance may occur without notice.
            </p>
          </Section>

          <Section title="7. Open Source and Self-Hosting">
            <p>
              Zahra's source code is available under the ESAL-1.3 licence. Non-commercial self-hosting
              is permitted subject to the licence terms. For commercial use, contact us at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline">
                {CONTACT_EMAIL}
              </a>.
            </p>
            <p>
              Self-hosted instances are operated by their respective hosts. We are not responsible for
              data handling or conduct in self-hosted deployments.
            </p>
          </Section>

          <Section title="8. Intellectual Property">
            <p>
              Zahra, its source code, branding, and associated materials are the intellectual property
              of Clove Nytrix Doughmination Twilight, subject to the ESAL-1.3 licence. The{" "}
              <strong className="text-foreground">Doughmination System®</strong> trademark (UK
              registration UK00004263144) and other marks are reserved. You may not use our trademarks
              without prior written permission.
            </p>
          </Section>

          <Section title="9. Disclaimer of Warranties">
            <p>
              Zahra is provided <strong className="text-foreground">"as is"</strong> without any
              warranties of any kind, express or implied, including but not limited to warranties of
              merchantability, fitness for a particular purpose, or non-infringement. We do not warrant
              that the service will meet your requirements or that it will be free of errors.
            </p>
          </Section>

          <Section title="10. Limitation of Liability">
            <p>
              To the fullest extent permitted by law, Clove Nytrix Doughmination Twilight shall not be
              liable for any indirect, incidental, special, consequential, or punitive damages, or any
              loss of data, revenue, or profits, arising from your use of or inability to use Zahra,
              even if advised of the possibility of such damages.
            </p>
          </Section>

          <Section title="11. Changes to the Service or Terms">
            <p>
              We reserve the right to modify, suspend, or discontinue Zahra (or any part of it) at any
              time without notice. We may also update these Terms at any time. Material changes will be
              announced in our{" "}
              <a href={SUPPORT_SERVER} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                support server
              </a>
              . Continued use of Zahra after changes constitutes acceptance of the revised Terms.
            </p>
          </Section>

          <Section title="12. Governing Law">
            <p>
              These Terms are governed by and construed in accordance with the laws of{" "}
              <strong className="text-foreground">England and Wales</strong>, without regard to
              conflict-of-law principles. Any disputes shall be subject to the exclusive jurisdiction
              of the courts of England and Wales.
            </p>
          </Section>

          <Section title="13. Contact">
            <p>
              For questions about these Terms, contact us at:{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline">
                {CONTACT_EMAIL}
              </a>
              {" "}or join our{" "}
              <a href={SUPPORT_SERVER} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                support server
              </a>.
            </p>
          </Section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsOfService;