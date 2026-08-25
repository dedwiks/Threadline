import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import Navbar from "../components/Navbar";
import TagInput from "../components/TagInput";

const EMPTY = {
  name: "",
  email: "",
  phone: "",
  linkedin: "",
  instagram: "",
  twitter: "",
  profession: "",
  company: "",
  location: { text: "" },
  tags: [],
  howWeMet: "",
  metDate: "",
  notes: "",
};

function Field({ label, ...props }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
        {label}
      </span>
      <input
        {...props}
        style={{
          height: 42,
          padding: "0 14px",
          borderRadius: "var(--radius-sm)",
          border: "1px solid var(--border)",
          background: "var(--surface-2)",
          fontSize: 14,
          color: "var(--text)",
          fontFamily: "var(--font)",
        }}
      />
    </label>
  );
}

export default function ContactFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/api/contacts/${id}`).then(({ contact }) => {
      setForm({
        ...EMPTY,
        ...contact,
        location: { text: contact.location?.text || "" },
        metDate: contact.metDate ? contact.metDate.slice(0, 10) : "",
      });
      setLoading(false);
    });
  }, [id, isEdit]);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    setError("");
    try {
      if (isEdit) {
        await api.put(`/api/contacts/${id}`, form);
        navigate(`/contacts/${id}`);
      } else {
        const { contact } = await api.post("/api/contacts", form);
        navigate(`/contacts/${contact._id}`);
      }
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div>
        <Navbar />
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div style={{ display: "flex", justifyContent: "center", padding: "40px 24px 60px" }}>
        <form onSubmit={onSubmit} style={{ width: "100%", maxWidth: 620, display: "flex", flexDirection: "column", gap: 20 }}>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 650, letterSpacing: "-0.02em" }}>{isEdit ? "Edit contact" : "Add contact"}</h1>

          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "24px 28px", display: "flex", flexDirection: "column", gap: 16 }}>
            <Field label="Name" value={form.name} onChange={(e) => set("name", e.target.value)} required />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 16 }}>
              <Field label="Profession" value={form.profession} onChange={(e) => set("profession", e.target.value)} />
              <Field label="Company" value={form.company} onChange={(e) => set("company", e.target.value)} />
            </div>
            <Field label="Location" placeholder="City, Country" value={form.location.text} onChange={(e) => set("location", { text: e.target.value })} />
          </div>

          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "24px 28px", display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 16 }}>
              <Field label="Email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
              <Field label="Phone" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 16 }}>
              <Field label="LinkedIn" value={form.linkedin} onChange={(e) => set("linkedin", e.target.value)} />
              <Field label="Instagram" value={form.instagram} onChange={(e) => set("instagram", e.target.value)} />
              <Field label="Twitter / X" value={form.twitter} onChange={(e) => set("twitter", e.target.value)} />
            </div>
          </div>

          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "24px 28px", display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Tags</span>
              <div style={{ marginTop: 8 }}>
                <TagInput tags={form.tags} onChange={(tags) => set("tags", tags)} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 180px", gap: 16 }}>
              <Field label="How we met" value={form.howWeMet} onChange={(e) => set("howWeMet", e.target.value)} />
              <Field label="Date" type="date" value={form.metDate} onChange={(e) => set("metDate", e.target.value)} />
            </div>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Notes</span>
              <textarea
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                rows={3}
                style={{ padding: 14, borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--surface-2)", fontSize: 14, color: "var(--text)", fontFamily: "var(--font)", resize: "vertical" }}
              />
            </label>
          </div>

          {error && <div style={{ fontSize: 13, color: "var(--danger)" }}>{error}</div>}

          <div style={{ display: "flex", gap: 12 }}>
            <button
              type="button"
              onClick={() => navigate(-1)}
              style={{ flex: 1, height: 44, borderRadius: "var(--radius-md)", border: "1px solid var(--border)", background: "var(--surface-2)", color: "var(--text-secondary)", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{ flex: 1, height: 44, borderRadius: "var(--radius-md)", border: "none", background: "var(--accent)", color: "var(--accent-contrast)", fontSize: 14, fontWeight: 600, cursor: "pointer", opacity: saving ? 0.6 : 1 }}
            >
              {isEdit ? "Save changes" : "Add contact"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
