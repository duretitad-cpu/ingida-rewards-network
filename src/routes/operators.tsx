import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { IngidaLogo } from "@/components/brand/ingida-logo";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/operators")({
  head: () => ({
    meta: [
      { title: "ingida Operators — Sign in" },
      { name: "description", content: "Secure sign-in for ingida operators to review invitation requests." },
      { property: "og:title", content: "ingida Operators" },
      { property: "og:description", content: "Secure operator area for the ingida team." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OperatorsPage,
});

type Role = "admin" | "operator" | null;

function OperatorsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      if (data.user) {
        const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", data.user.id);
        const list = (roles ?? []).map((r) => r.role);
        setRole(list.includes("admin") ? "admin" : list.includes("operator") ? "operator" : null);
      } else setRole(null);
      setReady(true);
    };
    load();
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") load();
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-dvh bg-background text-navy-deep">
      <header className="flex items-center justify-between border-b border-border px-6 py-5 md:px-10">
        <Link to="/" aria-label="ingida home"><IngidaLogo className="footer-logo" /></Link>
        <div className="flex items-center gap-4 text-xs uppercase text-muted-foreground">
          <span>Operators</span>
          {user && <Button variant="ghost" size="sm" onClick={() => supabase.auth.signOut()}>Sign out</Button>}
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10 md:px-10">
        {!ready ? <p className="text-sm text-muted-foreground">Loading…</p>
          : !user ? <AuthForm />
          : !role ? <p className="text-sm">This account does not have operator access.</p>
          : <Crm isAdmin={role === "admin"} userId={user.id} />}
      </main>
    </div>
  );
}

function AuthForm() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email") ?? "").trim();
    const password = String(f.get("password") ?? "");
    if (!email || password.length < 8) { setMsg("Enter your email and a password of at least 8 characters."); return; }
    setBusy(true); setMsg("");
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMsg(error.message);
    } else {
      const invite_code = String(f.get("code") ?? "").trim().toUpperCase();
      const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/operators`, data: { invite_code } } });
      setMsg(error ? "Sign-up failed. Check your invite code and try again." : "Check your email to confirm your account, then sign in.");
    }
    setBusy(false);
  };
  return (
    <form onSubmit={submit} className="mx-auto mt-10 max-w-sm space-y-4">
      <h1 className="font-serif text-3xl">{mode === "in" ? "Operator sign in" : "Create operator account"}</h1>
      <input name="email" type="email" required placeholder="Email" autoComplete="email" className="w-full border-b border-border bg-transparent py-3 outline-none focus:border-gold" />
      <input name="password" type="password" required minLength={8} placeholder="Password" autoComplete={mode === "in" ? "current-password" : "new-password"} className="w-full border-b border-border bg-transparent py-3 outline-none focus:border-gold" />
      {mode === "up" && <input name="code" placeholder="Invite code (not needed for the first admin)" maxLength={40} className="w-full border-b border-border bg-transparent py-3 uppercase outline-none focus:border-gold" />}
      <Button type="submit" disabled={busy} className="w-full rounded-none">{busy ? "Please wait…" : mode === "in" ? "Sign in" : "Create account"}</Button>
      {msg && <p role="alert" className="text-sm text-muted-foreground">{msg}</p>}
      <button type="button" className="text-xs text-muted-foreground underline" onClick={() => { setMode(mode === "in" ? "up" : "in"); setMsg(""); }}>
        {mode === "in" ? "Have an invite code? Create an account" : "Already have an account? Sign in"}
      </button>
    </form>
  );
}

type Sub = { id: string; created_at: string; name: string; email: string; phone: string; role: string; business_name: string; wants_alerts: boolean | null; status: string; notes: string };
const STATUSES = ["new", "contacted", "invited", "onboarded", "declined"];

function Crm({ isAdmin, userId }: { isAdmin: boolean; userId: string }) {
  const [rows, setRows] = useState<Sub[]>([]);
  const [filter, setFilter] = useState<"all" | "member" | "merchant">("all");
  const [q, setQ] = useState("");
  const load = useCallback(async () => {
    const { data } = await supabase.from("waitlist_submissions").select("id, created_at, name, email, phone, role, business_name, wants_alerts, status, notes").order("created_at", { ascending: false });
    setRows((data ?? []) as Sub[]);
  }, []);
  useEffect(() => { load(); }, [load]);

  const shown = useMemo(() => rows.filter((r) => (filter === "all" || r.role === filter) &&
    (!q || `${r.name} ${r.email} ${r.phone} ${r.business_name}`.toLowerCase().includes(q.toLowerCase()))), [rows, filter, q]);

  const update = async (id: string, patch: Partial<Pick<Sub, "status" | "notes">>) => {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    await supabase.from("waitlist_submissions").update(patch).eq("id", id);
  };

  const exportCsv = () => {
    const head = ["Date", "Name", "Phone", "Email", "Type", "Business", "Alerts", "Status", "Notes"];
    const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const lines = shown.map((r) => [new Date(r.created_at).toISOString(), r.name, r.phone, r.email, r.role, r.business_name, r.wants_alerts == null ? "" : r.wants_alerts ? "yes" : "no", r.status, r.notes].map((v) => esc(String(v))).join(","));
    const url = URL.createObjectURL(new Blob([[head.join(","), ...lines].join("\n")], { type: "text/csv" }));
    const a = document.createElement("a"); a.href = url; a.download = "ingida-crm.csv"; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-10">
      <section>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl">Invitation CRM</h1>
            <p className="text-sm text-muted-foreground">{rows.length} requests · {rows.filter((r) => r.role === "member").length} members · {rows.filter((r) => r.role === "merchant").length} merchants</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" className="border-b border-border bg-transparent px-1 py-2 text-sm outline-none focus:border-gold" />
            {(["all", "member", "merchant"] as const).map((f) => (
              <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} className="rounded-none capitalize" onClick={() => setFilter(f)}>{f}</Button>
            ))}
            <Button size="sm" variant="outline" className="rounded-none" onClick={exportCsv}>Export CSV</Button>
          </div>
        </div>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="border-b border-border text-xs uppercase text-muted-foreground">
              <tr><th className="py-2">Date</th><th>Name</th><th>Phone</th><th>Email</th><th>Type</th><th>Business / Alerts</th><th>Status</th><th>Notes</th></tr>
            </thead>
            <tbody>
              {shown.map((r) => (
                <tr key={r.id} className="border-b border-border/60 align-top">
                  <td className="py-3 pr-3 text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</td>
                  <td className="pr-3 py-3">{r.name}</td>
                  <td className="pr-3 py-3">{r.phone}</td>
                  <td className="pr-3 py-3">{r.email}</td>
                  <td className="pr-3 py-3 capitalize">{r.role}</td>
                  <td className="pr-3 py-3">{r.role === "merchant" ? r.business_name : r.wants_alerts == null ? "—" : r.wants_alerts ? "Alerts: yes" : "Alerts: no"}</td>
                  <td className="pr-3 py-3">
                    <select value={r.status} onChange={(e) => update(r.id, { status: e.target.value })} className="border border-border bg-background px-2 py-1 text-sm">
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="py-3">
                    <input defaultValue={r.notes} maxLength={500} onBlur={(e) => e.target.value !== r.notes && update(r.id, { notes: e.target.value })} className="w-48 border-b border-border bg-transparent py-1 outline-none focus:border-gold" />
                  </td>
                </tr>
              ))}
              {!shown.length && <tr><td colSpan={8} className="py-8 text-center text-muted-foreground">No requests yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
      {isAdmin && <InviteCodes userId={userId} />}
    </div>
  );
}

type Code = { id: string; code: string; created_at: string; used_by: string | null; used_at: string | null };

function InviteCodes({ userId }: { userId: string }) {
  const [codes, setCodes] = useState<Code[]>([]);
  const load = useCallback(async () => {
    const { data } = await supabase.from("operator_invite_codes").select("id, code, created_at, used_by, used_at").order("created_at", { ascending: false });
    setCodes(data ?? []);
  }, []);
  useEffect(() => { load(); }, [load]);
  const create = async () => {
    const bytes = crypto.getRandomValues(new Uint8Array(6));
    const code = Array.from(bytes, (b) => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[b % 32]).join("");
    await supabase.from("operator_invite_codes").insert({ code: `INGIDA-${code}`, created_by: userId });
    load();
  };
  const remove = async (id: string) => { await supabase.from("operator_invite_codes").delete().eq("id", id); load(); };
  return (
    <section>
      <div className="flex items-end justify-between">
        <div>
          <h2 className="font-serif text-2xl">Operator invite codes</h2>
          <p className="text-sm text-muted-foreground">Each code lets one person create an operator account.</p>
        </div>
        <Button size="sm" className="rounded-none" onClick={create}>New code</Button>
      </div>
      <ul className="mt-4 divide-y divide-border border-y border-border text-sm">
        {codes.map((c) => (
          <li key={c.id} className="flex items-center justify-between py-3">
            <span className="font-mono">{c.code}</span>
            {c.used_by ? <span className="text-muted-foreground">Used {c.used_at ? new Date(c.used_at).toLocaleDateString() : ""}</span>
              : <Button size="sm" variant="ghost" onClick={() => remove(c.id)}>Revoke</Button>}
          </li>
        ))}
        {!codes.length && <li className="py-3 text-muted-foreground">No codes yet.</li>}
      </ul>
    </section>
  );
}
