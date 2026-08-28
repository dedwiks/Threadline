import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

const CONNECTION_NOTIFICATION_TYPES = ["connection_request", "introduction_request", "connection_accepted", "connection_declined"];

function timeAgo(dateStr) {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  function load() {
    api.get("/api/notifications").then(({ notifications }) => setNotifications(notifications));
  }

  useEffect(load, []);

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const unread = notifications.filter((n) => !n.read);

  async function toggleOpen() {
    const next = !open;
    setOpen(next);
    if (next && unread.length > 0) {
      await Promise.all(unread.map((n) => api.patch(`/api/notifications/${n._id}/read`)));
      load();
    }
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={toggleOpen}
        className="tl-btn-ghost"
        style={{
          position: "relative",
          width: 36,
          height: 36,
          borderRadius: "50%",
          border: "none",
          background: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unread.length > 0 && (
          <div style={{ position: "absolute", top: 6, right: 6, width: 8, height: 8, borderRadius: "50%", background: "var(--danger)", border: "2px solid var(--surface)" }} />
        )}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 44,
            width: 320,
            maxHeight: 360,
            overflowY: "auto",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-md)",
            zIndex: 10,
          }}
        >
          {notifications.length === 0 ? (
            <div style={{ padding: 20, fontSize: 13, color: "var(--text-tertiary)", textAlign: "center" }}>No notifications yet</div>
          ) : (
            notifications.map((n) => {
              const isConnection = CONNECTION_NOTIFICATION_TYPES.includes(n.type);
              const Wrapper = isConnection ? "button" : "div";
              return (
                <Wrapper
                  key={n._id}
                  type={isConnection ? "button" : undefined}
                  onClick={
                    isConnection
                      ? () => {
                          setOpen(false);
                          navigate("/connections");
                        }
                      : undefined
                  }
                  className={isConnection ? "tl-row" : undefined}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    padding: "12px 16px",
                    borderBottom: "1px solid var(--border)",
                    width: "100%",
                    textAlign: "left",
                    background: "none",
                    border: "none",
                    borderBottomWidth: 1,
                    borderBottomStyle: "solid",
                    borderBottomColor: "var(--border)",
                    cursor: isConnection ? "pointer" : "default",
                  }}
                >
                  <div style={{ fontSize: 13, color: "var(--text)" }}>{n.message}</div>
                  <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>{timeAgo(n.createdAt)}</div>
                </Wrapper>
              );
            })
          )}

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              navigate("/connections");
            }}
            className="tl-text-link"
            style={{ display: "block", width: "100%", textAlign: "center", padding: "12px 16px", border: "none", background: "none", fontSize: 12, fontWeight: 600, color: "var(--accent)" }}
          >
            View all requests
          </button>
        </div>
      )}
    </div>
  );
}
