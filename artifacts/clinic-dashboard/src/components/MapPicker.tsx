import { useEffect, useRef, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

const OMAN_CENTER: [number, number] = [23.588, 58.3829];
const DEFAULT_ZOOM = 13;

interface MapPickerProps {
  latitude: number | null | undefined;
  longitude: number | null | undefined;
  onChange: (lat: number, lng: number) => void;
}

function ClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  const prevRef = useRef({ lat, lng });

  useEffect(() => {
    if (prevRef.current.lat !== lat || prevRef.current.lng !== lng) {
      map.setView([lat, lng], map.getZoom(), { animate: true });
      prevRef.current = { lat, lng };
    }
  }, [lat, lng, map]);

  return null;
}

export default function MapPicker({ latitude, longitude, onChange }: MapPickerProps) {
  const hasCoords = latitude != null && longitude != null && !isNaN(latitude) && !isNaN(longitude);
  const center: [number, number] = hasCoords ? [latitude, longitude] : OMAN_CENTER;

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchError("");
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&countrycodes=om`
      );
      const data = await res.json();
      if (data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        onChange(lat, lng);
      } else {
        setSearchError("لم يتم العثور على الموقع");
      }
    } catch {
      setSearchError("خطأ في البحث");
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, onChange]);

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSearch();
            }
          }}
          placeholder="ابحث عن موقع في عُمان..."
          className="flex-1 p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm"
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={isSearching}
          className="px-4 py-3 rounded-xl font-bold text-primary-foreground bg-primary hover:bg-primary/90 transition-all disabled:opacity-50 text-sm whitespace-nowrap"
        >
          {isSearching ? "جاري البحث..." : "بحث"}
        </button>
      </div>
      {searchError && (
        <p className="text-sm text-destructive">{searchError}</p>
      )}

      <div className="rounded-xl overflow-hidden border border-border" style={{ height: 300 }}>
        <MapContainer
          center={center}
          zoom={DEFAULT_ZOOM}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onClick={(lat, lng) => onChange(lat, lng)} />
          {hasCoords && (
            <>
              <Marker position={[latitude, longitude]} />
              <RecenterMap lat={latitude} lng={longitude} />
            </>
          )}
        </MapContainer>
      </div>

      <p className="text-xs text-muted-foreground">
        اضغط على الخريطة لتحديد موقع العيادة أو استخدم البحث
      </p>
    </div>
  );
}
