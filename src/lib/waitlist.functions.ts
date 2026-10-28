import { createServerFn } from "@tanstack/react-start";
import { waitlistSchema } from "./waitlist-schema";

export const submitWaitlist = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => waitlistSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { website: _website, ...entry } = data;
    const { error } = await supabaseAdmin.from("waitlist_submissions").insert(entry);
    // An existing request is already stored; never disclose the matching person's details.
    if (error && error.code !== "23505") {
      console.error("Waitlist storage failed", error.code);
      throw new Error("Your request could not be saved. Please try again.");
    }
    return { saved: true };
  });