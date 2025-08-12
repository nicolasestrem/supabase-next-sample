"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Note = { id: string; content: string; created_at: string };

export default function Home() {
  const [email, setEmail] = useState("");
  const [session, setSession] = useState<any>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (!s) setNotes([]);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) loadNotes();
  }, [session]);

  async function sendMagicLink() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin }
    });
    setLoading(false);
    if (error) alert(error.message);
    else alert("Check your email");
  }

  async function signInWithGitHub() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo: window.location.origin }
    });
    if (error) alert(error.message);
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  async function loadNotes() {
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) alert(error.message);
    else setNotes(data as Note[]);
  }

  async function addNote() {
    if (!newNote.trim()) return;
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return alert("Please sign in");
    const { error } = await supabase.from("notes").insert({
      content: newNote,
      user_id: user.id
    });
    if (error) return alert(error.message);
    setNewNote("");
    loadNotes();
  }

  return (
    <main style={{ maxWidth: 560, margin: "40px auto", padding: 16 }}>
      <h1>Supabase plus Next.js sample</h1>

      {!session && (
        <section style={{ marginTop: 24 }}>
          <h2>Sign in</h2>
          <div style={{ display: "grid", gap: 8, maxWidth: 360 }}>
            <input
              type="email"
              placeholder="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ padding: 8, border: "1px solid #ccc", borderRadius: 8 }}
            />
            <button onClick={sendMagicLink} disabled={loading} style={{ padding: 10, borderRadius: 8 }}>
              {loading ? "Sending..." : "Send magic link"}
            </button>
            <button onClick={signInWithGitHub} style={{ padding: 10, borderRadius: 8 }}>
              Sign in with GitHub
            </button>
          </div>
        </section>
      )}

      {session && (
        <section style={{ marginTop: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2>Your notes</h2>
            <button onClick={signOut} style={{ padding: 8, borderRadius: 8 }}>Sign out</button>
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <input
              placeholder="Write a note"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              style={{ flex: 1, padding: 8, border: "1px solid #ccc", borderRadius: 8 }}
            />
            <button onClick={addNote} style={{ padding: 10, borderRadius: 8 }}>Add</button>
          </div>

          <ul style={{ marginTop: 16, padding: 0, listStyle: "none", display: "grid", gap: 8 }}>
            {notes.map((n) => (
              <li key={n.id} style={{ border: "1px solid #eee", borderRadius: 8, padding: 12 }}>
                <div>{n.content}</div>
                <small style={{ color: "#666" }}>{new Date(n.created_at).toLocaleString()}</small>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
