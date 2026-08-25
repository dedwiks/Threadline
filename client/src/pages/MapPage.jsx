import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import Navbar from "../components/Navbar";
import FilterPanel from "../components/FilterPanel";
import ContactsMap from "../components/ContactsMap";

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

export default function MapPage() {
  const navigate = useNavigate();
  const [allContacts, setAllContacts] = useState([]);
  const [mapContacts, setMapContacts] = useState(null);
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  useEffect(() => {
    api.get("/api/contacts").then(({ contacts }) => setAllContacts(contacts));
  }, []);

  useEffect(() => {
    api.get(`/api/map/contacts${buildQuery(filters)}`).then(({ contacts }) => setMapContacts(contacts));
  }, [filters]);

  const professionOptions = useMemo(
    () => [...new Set(allContacts.map((c) => c.profession).filter(Boolean))],
    [allContacts],
  );
  const tagOptions = useMemo(() => [...new Set(allContacts.flatMap((c) => c.tags || []))], [allContacts]);
  const withoutLocation = allContacts.length - allContacts.filter((c) => c.location?.lat != null).length;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <div style={{ position: "relative", flex: 1, overflow: "hidden" }}>
        {mapContacts?.length > 0 ? (
          <ContactsMap contacts={mapContacts} onSelect={(c) => navigate(`/contacts/${c._id}`)} />
        ) : (
          <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)", fontSize: 14, background: "var(--bg)" }}>
            {allContacts.length === 0
              ? "Add a few contacts to see them on the map."
              : withoutLocation > 0
                ? "Add a location to a contact to see them on the map."
                : "No contacts match these filters."}
          </div>
        )}

        <div style={{ position: "absolute", right: 24, top: 24, zIndex: 1000 }}>
          <FilterPanel professionOptions={professionOptions} tagOptions={tagOptions} value={filters} onChange={setFilters} />
        </div>
      </div>
    </div>
  );
}
