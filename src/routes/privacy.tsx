import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, List, Mail } from "@/components/legal/legal-page";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [
    { title: "Privacy Policy — ingida" },
    { name: "description", content: "How ingida collects and uses information submitted through its website." },
    { property: "og:title", content: "Privacy Policy — ingida" },
    { property: "og:description", content: "How ingida collects and uses information submitted through its website." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: () => (
    <LegalPage title="Privacy Policy" sections={[
      { h: "Information We Collect", body: <><p>Ingida respects your privacy. When you request an invitation, we may collect:</p><List items={["Full name", "Phone number", "Email address", "Registration type (Member or Merchant)", "Your preference to receive updates and alerts"]} /></> },
      { h: "How We Use Your Information", body: <List items={["Process your invitation request.", "Contact you regarding Ingida and early access.", "Share updates and announcements where you have opted in.", "Improve our website and registration experience."]} /> },
      { h: "Information Sharing", body: <p>We do not sell your personal information. Information may be shared with service providers strictly where necessary to operate the website and manage registration requests.</p> },
      { h: "Data Protection", body: <p>We take reasonable measures to protect submitted information against unauthorized access, loss or misuse.</p> },
      { h: "Your Rights", body: <p>You may request access to, correction of or deletion of your personal information. You may also withdraw your consent to receive promotional updates at any time.</p> },
      { h: "Contact", body: <p>For privacy-related requests, contact <Mail />.</p> },
    ]} />
  ),
});
