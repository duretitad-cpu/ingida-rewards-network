import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ALLOWED = ["https://www.ingida.com", "https://ingida.com", "https://ingida-rewards-network.lovable.app"];
function safeRedirect(raw: string) {
  try {
    const u = new URL(raw);
    if (ALLOWED.includes(u.origin) || u.hostname.endsWith(".lovable.app")) return `${u.origin}/operators`;
  } catch { /* fall through */ }
  return "https://www.ingida.com/operators";
}

/** Admin-only: records an admin invitation and emails a sign-in invite link. */
export const sendAdminInvite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { email: string; redirectTo: string }) => ({
    email: z.string().trim().toLowerCase().email().max(255).parse(input.email),
    redirectTo: safeRedirect(input.redirectTo),
  }))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Only admins can send invitations.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error: insErr } = await supabaseAdmin.from("admin_invites")
      .upsert({ email: data.email, invited_by: context.userId }, { onConflict: "email" });
    if (insErr) throw new Error("Could not record the invitation.");
    const { error } = await supabaseAdmin.auth.admin.inviteUserByEmail(data.email, { redirectTo: data.redirectTo });
    if (error) throw new Error(error.message.includes("already") ? "That email already has an account." : "The invitation email could not be sent.");
    return { sent: true };
  });
