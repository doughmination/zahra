# Privacy Policy

**Last updated: 25 February 2026**

---

## 1. Introduction

This Privacy Policy explains how Zahra ("we", "our", "the bot", "the service"), operated by Clove Nytrix Doughmination Twilight ("the developer"), collects, uses, and stores information when you interact with Zahra on Discord or visit our website.

By adding Zahra to your server or using any of our services, you agree to the practices described in this policy.

---

## 2. Data We Collect

Zahra collects only the minimum data required to deliver its features:

- **Discord Server IDs** — to associate moderation cases and settings with the correct server.
- **Discord User IDs and usernames (tags)** — stored alongside moderation cases (e.g. ban, kick, warn, mute records) to identify the target and the moderator.
- **Moderation case data** — action type, reason, optional duration, and timestamp, stored in our PostgreSQL database.
- **Temporary cache data** — recent case lookups are cached in Redis for up to 1 hour to improve performance. This data is not persisted beyond the cache TTL.

We do **not** collect message content, voice data, direct messages, payment information, or any data beyond what is listed above.

---

## 3. How We Use Your Data

Data is used solely to provide and improve the bot's functionality:

- To create, retrieve, and manage moderation cases within a Discord server.
- To allow server moderators to look up case histories for their members.
- To enable the pardon system, allowing cases to be marked inactive.
- To display user information via the `/userinfo` command using data already available from the Discord API.

We do not use your data for advertising, profiling, or sale to third parties.

---

## 4. Data Retention

Moderation case records are retained indefinitely by default so that server administrators can maintain accurate audit logs. Server administrators may pardon (void) cases using the `/pardon` command, which marks them as inactive.

Redis cache entries expire automatically after 1 hour and are not stored permanently.

If you wish to request deletion of data associated with your server or user ID, please contact us at [admin@doughmination.win](mailto:admin@doughmination.win).

---

## 5. Data Sharing

We do not sell, rent, or share your data with third parties, except where required by law or to operate the service (e.g. our hosting infrastructure). Zahra is self-hostable; if you run your own instance, your data never leaves your own infrastructure.

---

## 6. Security

Data is stored in a PostgreSQL database and Redis cache, both running in isolated Docker containers on our infrastructure. Access is restricted and credentials are managed via encrypted environment variables. We take reasonable steps to protect data but cannot guarantee absolute security.

---

## 7. Children's Privacy

Zahra is intended for users who comply with Discord's Terms of Service. We do not knowingly collect data from users under the age of 13 (or the applicable minimum age in your region). If you believe data from a minor has been collected, contact us and we will delete it.

---

## 8. Your Rights

Depending on your location, you may have the right to:

- Request access to data we hold about you.
- Request correction or deletion of your data.
- Object to processing of your data.

To exercise any of these rights, contact us at [admin@clovelib.win](mailto:admin@clovelib.win).

---

## 9. Changes to This Policy

We may update this Privacy Policy from time to time. Material changes will be announced in our support server. Continued use of Zahra after changes constitutes acceptance of the updated policy.

---

## 10. Contact

For questions about this Privacy Policy, contact us at: [admin@clovelib.win](mailto:admin@clovelib.win)