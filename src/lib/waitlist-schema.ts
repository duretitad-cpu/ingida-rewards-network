import { z } from "zod";

export const waitlistSchema = z
  .object({
    name: z.string().trim().min(1, "Please enter your name.").max(100),
    email: z.string().trim().email("Please enter a valid email.").max(255).transform((v) => v.toLowerCase()),
    phone: z.string().trim().min(7, "Please enter a valid phone number.").max(30).regex(/^[+\d\s().-]+$/, "Please enter a valid phone number."),
    role: z.enum(["member", "merchant"]),
    business_name: z.string().trim().max(120).optional().default(""),
    alerts: z.enum(["yes", "no"]).optional(),
    website: z.string().max(0, "Unable to submit this request.").optional(),
  })
  .superRefine((v, ctx) => {
    if (v.role === "merchant" && !v.business_name) ctx.addIssue({ code: "custom", path: ["business_name"], message: "Please enter your business name." });
    if (v.role === "member" && !v.alerts) ctx.addIssue({ code: "custom", path: ["alerts"], message: "Please choose whether to receive alerts." });
  })
  .transform(({ alerts, ...v }) => ({
    ...v,
    business_name: v.role === "merchant" ? v.business_name : "",
    wants_alerts: v.role === "member" ? alerts === "yes" : null,
  }));
