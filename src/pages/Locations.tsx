import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Phone, Clock, ExternalLink } from "lucide-react";

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

const Locations = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [locations, setLocations] = useState<CollectionPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    fetchLocations();

    return () => subscription.unsubscribe();
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

  const openInMaps = (lat: number, lng: number, name: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${encodeURIComponent(name)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(user ? "/dashboard" : "/")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                <MapPin className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Donation Locations
                </h1>
              </div>
            </div>
            {!user && (
              <Button onClick={() => navigate("/auth")} variant="default">
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Info Section */}
          <Card>
            <CardHeader>
              <CardTitle>Find Donation Centers Near You</CardTitle>
              <CardDescription>
                Discover NGOs, community centers, and drop-off points where you can
                donate food, clothes, books, and more.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Legend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Location Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-primary" />
                  <span className="text-sm text-muted-foreground">NGO Centers</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-secondary" />
                  <span className="text-sm text-muted-foreground">
                    Community Centers
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-accent" />
                  <span className="text-sm text-muted-foreground">
                    Drop-off Points
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Locations List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Loading locations...</p>
            </div>
          ) : locations.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <MapPin className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No donation locations available</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {locations.map((location) => (
                <Card key={location.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{location.name}</CardTitle>
                        <Badge className={`${getTypeColor(location.type)} mb-2`}>
                          {getTypeLabel(location.type)}
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          openInMaps(
                            Number(location.latitude),
                            Number(location.longitude),
                            location.name
                          )
                        }
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Directions
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {location.description && (
                      <p className="text-sm text-muted-foreground">
                        {location.description}
                      </p>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                        <span>{location.address}</span>
                      </div>

                      {location.contact_phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <a
                            href={`tel:${location.contact_phone}`}
                            className="hover:text-primary"
                          >
                            {location.contact_phone}
                          </a>
                        </div>
                      )}

                      {location.operating_hours && (
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span>{location.operating_hours}</span>
                        </div>
                      )}
                    </div>

                    {location.accepted_items && location.accepted_items.length > 0 && (
                      <div className="pt-2 border-t">
                        <p className="text-xs font-semibold mb-2">Accepts:</p>
                        <div className="flex flex-wrap gap-1">
                          {location.accepted_items.map((item) => (
                            <Badge key={item} variant="secondary" className="text-xs">
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Locations;
