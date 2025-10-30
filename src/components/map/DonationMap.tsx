import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Phone, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icons in react-leaflet
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

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

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const { data, error } = await supabase
        .from("collection_points")
        .select("*")
        .eq("is_active", true);

      if (error) throw error;
      setLocations(data || []);
    } catch (error) {
      console.error("Error fetching locations:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "ngo":
        return "bg-primary";
      case "community_center":
        return "bg-secondary";
      case "drop_off_point":
        return "bg-accent";
      default:
        return "bg-muted";
    }
  };

  const getTypeLabel = (type: string) => {
    return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  if (loading) {
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

  // Default center (Delhi coordinates)
  const defaultCenter: [number, number] = [28.6139, 77.2090];

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden shadow-lg border border-border">
      <MapContainer
        center={defaultCenter}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {locations.map((location) => (
          <Marker
            key={location.id}
            position={[Number(location.latitude), Number(location.longitude)]}
          >
            <Popup>
              <div className="p-2 space-y-2">
                <div>
                  <h3 className="font-semibold text-lg text-foreground">
                    {location.name}
                  </h3>
                  <Badge className={`${getTypeColor(location.type)} text-xs mt-1`}>
                    {getTypeLabel(location.type)}
                  </Badge>
                </div>

                <div className="space-y-1 text-sm">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <p className="text-muted-foreground">{location.address}</p>
                  </div>

                  {location.contact_phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <p className="text-muted-foreground">{location.contact_phone}</p>
                    </div>
                  )}

                  {location.operating_hours && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <p className="text-muted-foreground">{location.operating_hours}</p>
                    </div>
                  )}
                </div>

                {location.description && (
                  <p className="text-sm text-muted-foreground border-t border-border pt-2">
                    {location.description}
                  </p>
                )}

                {location.accepted_items && location.accepted_items.length > 0 && (
                  <div className="border-t border-border pt-2">
                    <p className="text-xs font-semibold text-foreground mb-1">
                      Accepts:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {location.accepted_items.map((item) => (
                        <Badge key={item} variant="secondary" className="text-xs">
                          {item}
                        </Badge>
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
