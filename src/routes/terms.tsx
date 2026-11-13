import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, Mail } from "@/components/legal/legal-page";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [
    { title: "Terms of Use — ingida" },
    { name: "description", content: "Terms for using the ingida website and requesting an invitation." },
    { property: "og:title", content: "Terms of Use — ingida" },
    { property: "og:description", content: "Terms for using the ingida website and requesting an invitation." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: () => (
    <LegalPage title="Terms of Use" sections={[
      { h: "Website Use", body: <><p>Welcome to Ingida. By accessing this website or submitting an invitation request, you agree to these Terms of Use.</p><p>This website provides information about Ingida and allows individuals and businesses to register their interest in joining the platform.</p></> },
      { h: "Sign-Up Requests", body: <p>Submitting your details does not guarantee membership, access or acceptance. Ingida may contact you regarding early access, invitations and future services.</p> },
      { h: "Accuracy of Information", body: <p>You agree to provide accurate and up-to-date information when submitting a registration request.</p> },
      { h: "Website Changes", body: <p>Ingida may update website content, features and these Terms as the platform develops.</p> },
      { h: "Contact", body: <p>For questions, contact us at <Mail />.</p> },
    ]} />
  ),
});
