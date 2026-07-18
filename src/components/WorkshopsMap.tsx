"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

import "leaflet/dist/leaflet.css";

const userIcon = L.divIcon({
  html: '<div style="font-size:26px;line-height:1;transform:translate(-50%,-90%)">📍</div>',
  className: "",
  iconSize: [0, 0],
});

const workshopIcon = L.divIcon({
  html: '<div style="font-size:24px;line-height:1;transform:translate(-50%,-90%)">🔧</div>',
  className: "",
  iconSize: [0, 0],
});

export default function WorkshopsMap({
  userLocation,
  workshops,
}: {
  userLocation: { lat: number; lng: number };
  workshops: { id: string; name: string; lat: number; lng: number; distanceKm?: number }[];
}) {
  return (
    <MapContainer
      center={[userLocation.lat, userLocation.lng]}
      zoom={11}
      style={{ height: 320, width: "100%", borderRadius: "var(--gx-radius-sm)" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
        <Popup>You are here</Popup>
      </Marker>

      {workshops.map((w) => (
        <Marker key={w.id} position={[w.lat, w.lng]} icon={workshopIcon}>
          <Popup>
            {w.name}
            {typeof w.distanceKm === "number" ? ` — ${w.distanceKm.toFixed(1)} km` : ""}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
