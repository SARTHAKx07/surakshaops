import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export const Route = createFileRoute("/supabase-check")({
  component: SupabaseCheck,
});

function SupabaseCheck() {
  const [message, setMessage] = useState("Testing Supabase connection...");

  useEffect(() => {
    async function checkConnection() {
      const { error } = await supabase
        .from("profiles")
        .select("id")
        .limit(1);

      setMessage(
        error
          ? `Connection test failed: ${error.message}`
          : "Supabase connection successful!"
      );
    }

    void checkConnection();
  }, []);

  return (
    <main style={{ padding: 32, fontFamily: "sans-serif" }}>
      <h1>SurakshaOps — Connection Test</h1>
      <p>{message}</p>
    </main>
  );
}