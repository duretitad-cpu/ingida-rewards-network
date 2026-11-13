import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, List, Mail } from "@/components/legal/legal-page";

export const Route = createFileRoute("/cookies")({
  head: () => ({ meta: [
    { title: "Cookie Policy — ingida" },
    { name: "description", content: "What the ingida website stores on your device and how visits are measured." },
    { property: "og:title", content: "Cookie Policy — ingida" },
    { property: "og:description", content: "What the ingida website stores on your device and how visits are measured." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: () => (
    <LegalPage title="Cookie Policy" sections={[
      { h: "Cookies on This Website", body: <p>The public Ingida website does not use advertising or tracking cookies.</p> },
      { h: "Visitor Analytics", body: <><p>We use Lovable's visitor analytics to understand how the website is used. It uses no cookies, stores nothing on your device, doesn't keep IP addresses and doesn't identify visitors. Lovable collects this data for us. <a href="https://lovable.dev/privacy" className="text-gold underline">Lovable's privacy policy</a> explains how it handles it.</p><p>It records:</p><List items={["The pages visited and where visitors came from", "Country, browser, operating system and device type", "How long visitors stay, how fast pages load, and errors", "Which buttons and links are clicked"]} /><p>This is recorded for every visitor. Detailed data is kept for 90 days and daily summaries for a year.</p></> },
      { h: "Operator Sign-In", body: <p>When an authorised Ingida team member signs in to the operator area, their sign-in session is kept in their browser's storage so they stay signed in. Visitors who do not sign in are not affected.</p> },
      { h: "Contact", body: <p>For questions about this policy, contact <Mail />.</p> },
    ]} />
  ),
});
