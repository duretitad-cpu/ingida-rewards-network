import { z } from "zod";

export const waitlistSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name.").max(100),
  email: z.string().trim().email("Please enter a valid email.").max(255).transform(v => v.toLowerCase()),
  phone: z.string().trim().min(7, "Please enter a valid phone number.").max(30).regex(/^[+\d\s().-]+$/, "Please enter a valid phone number."),
  city: z.string().trim().max(100).default(""),
  role: z.enum(["member", "merchant"]),
  website: z.string().max(0, "Unable to submit this request.").optional(),
});