import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Phone, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CollectionPoint {
  id: string;
  name: string;
  type: string;
  address: string;
  latitude: number;
  longitude: number;
  contact_phone: string | null;
  contact_email: string | null;
  operating_hours: string | null;
  accepted_items: string[] | null;
  description: string | null;
}

const DonationMap = () => {
  const [locations, setLocations] = useState<CollectionPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [MapComponents, setMapComponents] = useState<any>(null);

  useEffect(() => {
    console.log("DonationMap: Component mounted");
    fetchLocations();
    loadMapComponents();
  }, []);

  const loadMapComponents = async () => {
    try {
      console.log("Loading map components...");
      
      // Dynamically import Leaflet to avoid SSR issues
      const L = (await import("leaflet")).default;
      const { MapContainer, TileLayer, Marker, Popup } = await import("react-leaflet");
      
      // Import CSS
      await import("leaflet/dist/leaflet.css");
      
      // Fix for Leaflet marker icons
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
      
      console.log("Map components loaded successfully");
      setMapComponents({ MapContainer, TileLayer, Marker, Popup });
    } catch (err) {
      console.error("Error loading map components:", err);
      setError("Failed to load map. Please refresh the page.");
    }
  };

  const fetchLocations = async () => {
    try {
      console.log("Fetching locations...");
      const { data, error } = await supabase
        .from("collection_points")
        .select("*")
        .eq("is_active", true);

      if (error) throw error;
      console.log("Fetched locations:", data);
      setLocations(data || []);
    } catch (error) {
      console.error("Error fetching locations:", error);
      setError("Failed to load donation locations");
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "ngo":
        return "bg-primary text-primary-foreground";
      case "community_center":
        return "bg-secondary text-secondary-foreground";
      case "drop_off_point":
        return "bg-accent text-accent-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getTypeLabel = (type: string) => {
    return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] bg-muted/30 rounded-lg border-2 border-destructive">
        <p className="text-destructive font-semibold mb-2">Error</p>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (loading || !MapComponents) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-muted/30 rounded-lg animate-pulse">
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    );
  }

  if (locations.length === 0) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-muted/30 rounded-lg">
        <p className="text-muted-foreground">No donation locations available</p>
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker, Popup } = MapComponents;
  const defaultCenter: [number, number] = [28.6139, 77.2090];

  console.log("Rendering map with", locations.length, "locations");

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden shadow-lg border border-border">
      <MapContainer
        center={defaultCenter}
        zoom={12}
        style={{ height: "100%", width: "100%", zIndex: 0 }}
        scrollWheelZoom={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {locations.map((location) => (
          <Marker
            key={location.id}
            position={[Number(location.latitude), Number(location.longitude)]}
          >
            <Popup>
              <div className="p-2 space-y-2 min-w-[200px]">
                <div>
                  <h3 className="font-semibold text-base mb-1">
                    {location.name}
                  </h3>
                  <Badge className={`${getTypeColor(location.type)} text-xs`}>
                    {getTypeLabel(location.type)}
                  </Badge>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    <p>{location.address}</p>
                  </div>

                  {location.contact_phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3 flex-shrink-0" />
                      <p>{location.contact_phone}</p>
                    </div>
                  )}

                  {location.operating_hours && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 flex-shrink-0" />
                      <p>{location.operating_hours}</p>
                    </div>
                  )}
                </div>

                {location.description && (
                  <p className="text-xs border-t pt-2">
                    {location.description}
                  </p>
                )}

                {location.accepted_items && location.accepted_items.length > 0 && (
                  <div className="border-t pt-2">
                    <p className="text-xs font-semibold mb-1">Accepts:</p>
                    <div className="flex flex-wrap gap-1">
                      {location.accepted_items.map((item) => (
                        <span key={item} className="text-xs bg-muted px-2 py-0.5 rounded">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default DonationMap;
