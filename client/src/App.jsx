import { useEffect, useState } from "react";
import { api } from "./api";

function App() {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    api
      .get("/api/health")
      .then(() => setStatus("connected"))
      .catch(() => setStatus("unreachable"));
  }, []);

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "var(--space-3)",
      }}
    >
      <div style={{ fontSize: "20px", fontWeight: 650, letterSpacing: "-0.02em" }}>Threadline</div>
      <div style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
        Server: <strong style={{ color: "var(--text)" }}>{status}</strong>
      </div>
    </div>
  );
}

export default App;
