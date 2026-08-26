import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import Navbar from "../components/Navbar";
import FilterPanel from "../components/FilterPanel";
import NetworkGraph from "../components/NetworkGraph";
import LoadingWakeup from "../components/LoadingWakeup";

const EMPTY_FILTERS = { profession: [], company: "", tag: [], location: "" };

function buildQuery(filters) {
  const params = new URLSearchParams();
  if (filters.profession.length) params.set("profession", filters.profession.join(","));
  if (filters.company) params.set("company", filters.company);
  if (filters.tag.length) params.set("tag", filters.tag.join(","));
  if (filters.location) params.set("location", filters.location);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export default function GraphPage() {
  const navigate = useNavigate();
  const [allContacts, setAllContacts] = useState(null);
  const [graphData, setGraphData] = useState(null);
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  useEffect(() => {
    api.get("/api/contacts").then(({ contacts }) => setAllContacts(contacts));
  }, []);

  useEffect(() => {
    setGraphData(null);
    api.get(`/api/graph${buildQuery(filters)}`).then(setGraphData);
  }, [filters]);

  const professionOptions = useMemo(
    () => [...new Set((allContacts || []).map((c) => c.profession).filter(Boolean))],
    [allContacts],
  );
  const tagOptions = useMemo(() => [...new Set((allContacts || []).flatMap((c) => c.tags || []))], [allContacts]);

  const loading = allContacts === null || graphData === null;
  const hasAnyContacts = (allContacts?.length || 0) > 0;
  const hasGraphNodes = (graphData?.nodes.length || 0) > 1;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <div
        style={{
          position: "relative",
          flex: 1,
          background: "radial-gradient(circle, rgba(127,127,127,0.14) 1px, transparent 1px) 0 0/22px 22px, var(--bg)",
          overflow: "hidden",
        }}
      >
        {loading ? (
          <LoadingWakeup />
        ) : hasGraphNodes ? (
          <NetworkGraph
            graphData={graphData}
            onNodeClick={(node) => {
              if (node.id !== "self") navigate(`/contacts/${node.id}`);
            }}
          />
        ) : (
          <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)", fontSize: 14 }}>
            {hasAnyContacts ? "No contacts match these filters." : "Add a few contacts to see your network graph."}
          </div>
        )}

        {!loading && hasAnyContacts && (
          <div style={{ position: "absolute", right: 24, top: 24 }}>
            <FilterPanel professionOptions={professionOptions} tagOptions={tagOptions} value={filters} onChange={setFilters} />
          </div>
        )}

        {!loading && hasGraphNodes && (
          <div
            style={{
              position: "absolute",
              left: 24,
              bottom: 24,
              background: "var(--panel-bg-opaque)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              padding: "16px 20px",
              display: "flex",
              flexDirection: "column",
              gap: 9,
              boxShadow: "var(--shadow-md)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "var(--text-secondary)" }}>
              <svg width="26" height="8">
                <line x1="0" y1="4" x2="26" y2="4" stroke="var(--accent)" strokeWidth="2.4" />
              </svg>
              You &amp; manual connections
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "var(--text-secondary)" }}>
              <svg width="26" height="8">
                <line x1="0" y1="4" x2="26" y2="4" stroke="var(--accent)" strokeWidth="2.4" strokeDasharray="4 4" />
              </svg>
              Auto-detected mutual connection
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
