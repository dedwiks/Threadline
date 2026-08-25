export default function LoadingWakeup() {
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
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          border: "2.5px solid var(--border)",
          borderTopColor: "var(--accent)",
          animation: "threadline-spin 0.8s linear infinite",
        }}
      />
      <div style={{ fontSize: 14, color: "var(--text-secondary)" }}>
        Waking up the server — this can take up to a minute
      </div>
      <style>{`
        @keyframes threadline-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
