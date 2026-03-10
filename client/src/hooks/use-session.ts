import { useState, useEffect } from "react";

const SESSION_KEY = "pia_session_id";

async function createSession(): Promise<number> {
  const res = await fetch("/api/chat/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ title: `Session ${new Date().toLocaleString()}` }),
  });
  if (!res.ok) throw new Error("Failed to create session");
  const data = await res.json();
  return data.id as number;
}

export function useSession() {
  const [sessionId, setSessionId] = useState<number | undefined>(undefined);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const stored = sessionStorage.getItem(SESSION_KEY);
        if (stored) {
          setSessionId(Number(stored));
          setIsReady(true);
          return;
        }
        const id = await createSession();
        sessionStorage.setItem(SESSION_KEY, String(id));
        setSessionId(id);
      } catch (e) {
        console.error("Session init failed:", e);
      } finally {
        setIsReady(true);
      }
    }
    init();
  }, []);

  const newSession = async () => {
    try {
      const id = await createSession();
      sessionStorage.setItem(SESSION_KEY, String(id));
      setSessionId(id);
      return id;
    } catch (e) {
      console.error("Failed to create new session:", e);
    }
  };

  const switchSession = (id: number) => {
    sessionStorage.setItem(SESSION_KEY, String(id));
    setSessionId(id);
  };

  return { sessionId, isReady, newSession, switchSession };
}
