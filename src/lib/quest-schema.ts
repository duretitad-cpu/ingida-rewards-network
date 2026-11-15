import { z } from "zod";
import { formatEthiopianPhone } from "./phone";

export const questSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name.").max(100),
  phone: z.string().trim().max(30).transform((value, ctx) => {
    const formatted = formatEthiopianPhone(value);
    if (!formatted) {
      ctx.addIssue({ code: "custom", message: "Use an Ethiopian number, e.g. +251 911 234 567." });
      return z.NEVER;
    }
    return formatted;
  }),
});