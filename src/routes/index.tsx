import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  Utensils,
  BedDouble,
  ShoppingBasket,
  Palmtree,
  Ticket,
  Instagram,
  Linkedin,
  Music2,
} from "lucide-react";

import appPhones from "@/assets/ingida-wallet-navy.jpg";
import { IngidaLogo } from "@/components/brand/ingida-logo";
import { Button } from "@/components/ui/button";
import { useServerFn } from "@tanstack/react-start";
import { submitWaitlist } from "@/lib/waitlist.functions";
import { waitlistSchema } from "@/lib/waitlist-schema";

const skylineLoop = "/Web.mp4";
const skylinePoster = "/Visit.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ingida — Ethiopian Hospitality & Rewards Wallet" },
      { name: "description", content: "Explore Addis Ababa and Ethiopia with ingida’s hospitality rewards network. Discover dining, stays, tourism and local merchants. Join the rewards wallet waitlist." },
      { property: "og:title", content: "ingida — Ethiopian Hospitality & Rewards Wallet" },
      { property: "og:description", content: "Discover Ethiopia’s cities, dining, stays and local merchants with ingida. A hospitality network and rewards wallet, made in Addis Ababa." },
      { name: "twitter:title", content: "ingida — Ethiopian Hospitality & Rewards Wallet" },
      { name: "twitter:description", content: "Explore Ethiopia’s hospitality, tourism and local merchants. Join ingida’s rewards wallet waitlist." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

// ...rest of file unchanged...
