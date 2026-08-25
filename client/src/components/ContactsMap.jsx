import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const isDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;

const TILE_URL = isDark
  ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
  : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

function pinIcon(color) {
  const svg = `
    <svg width="26" height="34" viewBox="0 0 26 34" xmlns="http://www.w3.org/2000/svg">
      <path d="M13 0C5.8 0 0 5.8 0 13c0 9.5 13 21 13 21s13-11.5 13-21C26 5.8 20.2 0 13 0z" fill="${color}"/>
      <circle cx="13" cy="13" r="5" fill="#fff"/>
    </svg>`;
  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [26, 34],
    iconAnchor: [13, 34],
    popupAnchor: [0, -30],
  });
}

export default function ContactsMap({ contacts, onSelect }) {
  const accent = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#2f6fed";
  const matchedIcon = useMemo(() => pinIcon(accent), [accent]);
  const unmatchedIcon = useMemo(() => pinIcon("#8a8f98"), []);

  const center = contacts.length
    ? [contacts.reduce((s, c) => s + c.location.lat, 0) / contacts.length, contacts.reduce((s, c) => s + c.location.lng, 0) / contacts.length]
    : [20, 0];
  const zoom = contacts.length ? 3 : 2;

  return (
    <MapContainer center={center} zoom={zoom} style={{ width: "100%", height: "100%" }} scrollWheelZoom>
      <TileLayer url={TILE_URL} attribution={ATTRIBUTION} />
      {contacts.map((contact) => (
        <Marker
          key={contact._id}
          position={[contact.location.lat, contact.location.lng]}
          icon={contact.matchedUserId ? matchedIcon : unmatchedIcon}
          eventHandlers={{ click: () => onSelect?.(contact) }}
        >
          <Popup>
            <div style={{ fontFamily: "var(--font)", minWidth: 140 }}>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{contact.name}</div>
              {(contact.profession || contact.company) && (
                <div style={{ fontSize: 12, color: "#6c6c70", marginTop: 2 }}>
                  {[contact.profession, contact.company].filter(Boolean).join(" · ")}
                </div>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
