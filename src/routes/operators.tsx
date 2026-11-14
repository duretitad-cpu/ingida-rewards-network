import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { IngidaLogo } from "@/components/brand/ingida-logo";
import { Button } from "@/components/ui/button";
import { NfcCards } from "@/components/operators/nfc-cards";
import { Inventory } from "@/components/operators/inventory";

function OperatorTabs({ isAdmin, userId }: { isAdmin: boolean; userId: string }) {
  const [tab, setTab] = useState<"crm" | "nfc" | "inv">("crm");
  return (
    <div className="space-y-8">
      <div className="flex gap-2">
        <Button size="sm" variant={tab === "crm" ? "default" : "outline"} className="rounded-none" onClick={() => setTab("crm")}>Invitation CRM</Button>
        <Button size="sm" variant={tab === "nfc" ? "default" : "outline"} className="rounded-none" onClick={() => setTab("nfc")}>NFC Smart Cards</Button>
        <Button size="sm" variant={tab === "inv" ? "default" : "outline"} className="rounded-none" onClick={() => setTab("inv")}>Inventory</Button>
      </div>
      {tab === "crm" ? <Crm isAdmin={isAdmin} userId={userId} /> : tab === "nfc" ? <NfcCards isAdmin={isAdmin} /> : <Inventory isAdmin={isAdmin} userId={userId} />}
    </div>
  );
}

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
          : <OperatorTabs isAdmin={role === "admin"} userId={user.id} />}
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

type Row = { id: string; kind: "wl" | "nfc"; created_at: string; name: string; email: string; phone: string; type: string; source: string; detail: string; notes: string };
const TYPES = [["member", "User"], ["merchant", "Merchant"], ["stakeholder", "Stakeholder"]] as const;
const SOURCES: Record<string, string> = { website: "Website", nfc: "NFC", other: "Other Links" };

function Crm({ isAdmin, userId }: { isAdmin: boolean; userId: string }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [filter, setFilter] = useState("all");
  const [src, setSrc] = useState("all");
  const [q, setQ] = useState("");
  const load = useCallback(async () => {
    const [w, n] = await Promise.all([
      supabase.from("waitlist_submissions").select("id, created_at, name, email, phone, role, business_name, wants_alerts, source, notes").order("created_at", { ascending: false }),
      supabase.from("nfc_contacts").select("id, created_at, full_name, email, phone, company, contact_type, notes"),
    ]);
    const a: Row[] = (w.data ?? []).map((r) => ({ id: r.id, kind: "wl", created_at: r.created_at, name: r.name, email: r.email, phone: r.phone, type: r.role, source: r.source, notes: r.notes,
      detail: r.role === "merchant" ? r.business_name : r.wants_alerts == null ? "—" : r.wants_alerts ? "Alerts: yes" : "Alerts: no" }));
    const b: Row[] = (n.data ?? []).map((r) => ({ id: r.id, kind: "nfc", created_at: r.created_at, name: r.full_name, email: r.email, phone: r.phone, type: r.contact_type, source: "nfc", notes: r.notes, detail: r.company || "—" }));
    setRows([...a, ...b].sort((x, y) => y.created_at.localeCompare(x.created_at)));
  }, []);
  useEffect(() => { load(); }, [load]);

  const shown = useMemo(() => rows.filter((r) => (filter === "all" || r.type === filter) && (src === "all" || r.source === src) &&
    (!q || `${r.name} ${r.email} ${r.phone} ${r.detail}`.toLowerCase().includes(q.toLowerCase()))), [rows, filter, src, q]);

  const update = async (r: Row, patch: { type?: string; notes?: string }) => {
    setRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, ...patch } : x)));
    if (r.kind === "wl") await supabase.from("waitlist_submissions").update({ ...(patch.type ? { role: patch.type } : {}), ...(patch.notes != null ? { notes: patch.notes } : {}) }).eq("id", r.id);
    else await supabase.from("nfc_contacts").update({ ...(patch.type ? { contact_type: patch.type } : {}), ...(patch.notes != null ? { notes: patch.notes } : {}) }).eq("id", r.id);
  };
  const label = (t: string) => TYPES.find(([v]) => v === t)?.[1] ?? t;

  const exportCsv = () => {
    const head = ["Date", "Name", "Phone", "Email", "Type", "Signed up from", "Details", "Notes"];
    const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const lines = shown.map((r) => [new Date(r.created_at).toISOString(), r.name, r.phone, r.email, label(r.type), SOURCES[r.source] ?? r.source, r.detail, r.notes].map((v) => esc(String(v))).join(","));
    const url = URL.createObjectURL(new Blob([[head.join(","), ...lines].join("\n")], { type: "text/csv" }));
    const a = document.createElement("a"); a.href = url; a.download = "ingida-crm.csv"; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-10">
      <section>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl">CRM</h1>
            <p className="text-sm text-muted-foreground">{rows.length} contacts · {TYPES.map(([v, l]) => `${rows.filter((r) => r.type === v).length} ${l}`).join(" · ")}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" className="border-b border-border bg-transparent px-1 py-2 text-sm outline-none focus:border-gold" />
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="border border-border bg-background px-2 text-sm"><option value="all">All types</option>{TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
            <select value={src} onChange={(e) => setSrc(e.target.value)} className="border border-border bg-background px-2 text-sm"><option value="all">All sources</option>{Object.entries(SOURCES).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
            <Button size="sm" variant="outline" className="rounded-none" onClick={exportCsv}>Export CSV</Button>
          </div>
        </div>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="border-b border-border text-xs uppercase text-muted-foreground">
              <tr><th className="py-2">Date</th><th>Name</th><th>Phone</th><th>Email</th><th>Type</th><th>Signed up from</th><th>Details</th><th>Notes</th></tr>
            </thead>
            <tbody>
              {shown.map((r) => (
                <tr key={r.id} className="border-b border-border/60 align-top">
                  <td className="py-3 pr-3 text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</td>
                  <td className="pr-3 py-3">{r.name}</td>
                  <td className="pr-3 py-3">{r.phone}</td>
                  <td className="pr-3 py-3">{r.email}</td>
                  <td className="pr-3 py-3">
                    <select value={r.type} onChange={(e) => update(r, { type: e.target.value })} className="border border-border bg-background px-2 py-1 text-sm">
                      {TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </td>
                  <td className="pr-3 py-3">{SOURCES[r.source] ?? r.source}</td>
                  <td className="pr-3 py-3">{r.detail}</td>
                  <td className="py-3"><input defaultValue={r.notes} maxLength={500} onBlur={(e) => e.target.value !== r.notes && update(r, { notes: e.target.value })} className="w-48 border-b border-border bg-transparent py-1 outline-none focus:border-gold" /></td>
                </tr>
              ))}
              {!shown.length && <tr><td colSpan={8} className="py-8 text-center text-muted-foreground">No contacts yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
      {isAdmin && <AdminInvites userId={userId} />}
    </div>
  );
}

type Invite = { id: string; email: string; created_at: string; accepted_at: string | null };

function AdminInvites({ userId }: { userId: string }) {
  const [list, setList] = useState<Invite[]>([]);
  const [email, setEmail] = useState("connect@ingida.com");
  const [msg, setMsg] = useState("");
  const load = useCallback(async () => {
    const { data } = await supabase.from("admin_invites").select("id, email, created_at, accepted_at").order("created_at", { ascending: false });
    setList(data ?? []);
  }, []);
  useEffect(() => { load(); }, [load]);
  const send = async (e: FormEvent) => {
    e.preventDefault();
    const v = email.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) { setMsg("Enter a valid email."); return; }
    const { error } = await supabase.from("admin_invites").insert({ email: v, invited_by: userId });
    setMsg(error ? "Could not invite (maybe already invited)." : `Invited ${v}. They can now create an account on this page with that email.`);
    load();
  };
  const remove = async (id: string) => { await supabase.from("admin_invites").delete().eq("id", id); load(); };
  return (
    <section>
      <h2 className="font-serif text-2xl">Admin invites</h2>
      <p className="text-sm text-muted-foreground">An invited email becomes an admin when it creates an account here.</p>
      <form onSubmit={send} className="mt-3 flex flex-wrap gap-2">
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="border-b border-border bg-transparent px-1 py-2 text-sm outline-none focus:border-gold" />
        <Button size="sm" type="submit" className="rounded-none">Send admin invite</Button>
      </form>
      {msg && <p className="mt-2 text-sm text-muted-foreground">{msg}</p>}
      <ul className="mt-4 divide-y divide-border border-y border-border text-sm">
        {list.map((c) => (
          <li key={c.id} className="flex items-center justify-between py-3">
            <span>{c.email}</span>
            {c.accepted_at ? <span className="text-muted-foreground">Joined {new Date(c.accepted_at).toLocaleDateString()}</span>
              : <Button size="sm" variant="ghost" onClick={() => remove(c.id)}>Revoke</Button>}
          </li>
        ))}
        {!list.length && <li className="py-3 text-muted-foreground">No invites yet.</li>}
      </ul>
    </section>
  );
}
