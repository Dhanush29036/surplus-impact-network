import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LogOut, Plus, TrendingUp, Package, Clock } from "lucide-react";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session) {
        navigate("/auth");
      }
    });

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session) {
        navigate("/auth");
      } else {
        fetchDonations(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchDonations = async (userId: string) => {
    const { data, error } = await supabase
      .from("donations")
      .select("*")
      .eq("donor_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching donations:", error);
    } else {
      setDonations(data || []);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-xl">Loading...</div>
      </div>
    );
  }

  const stats = {
    total: donations.length,
    delivered: donations.filter(d => d.status === "delivered").length,
    pending: donations.filter(d => d.status === "pending").length,
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-card border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
            HUSON Dashboard
          </h1>
          <div className="flex gap-3">
            <Button onClick={() => navigate("/donate")} className="shadow-glow">
              <Plus className="h-4 w-4 mr-2" />
              New Donation
            </Button>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back!</h2>
          <p className="text-muted-foreground">
            Track your impact and manage your donations
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-3xl font-bold">{stats.total}</div>
                <div className="text-muted-foreground">Total Donations</div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-secondary/10 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <div className="text-3xl font-bold">{stats.delivered}</div>
                <div className="text-muted-foreground">Delivered</div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-accent/10 p-3 rounded-full">
                <Clock className="h-6 w-6 text-accent" />
              </div>
              <div>
                <div className="text-3xl font-bold">{stats.pending}</div>
                <div className="text-muted-foreground">Pending</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Donations */}
        <Card className="p-6">
          <h3 className="text-2xl font-bold mb-6">Recent Donations</h3>
          {donations.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-xl text-muted-foreground mb-4">
                No donations yet
              </p>
              <Button onClick={() => navigate("/donate")}>
                Make Your First Donation
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {donations.map((donation) => (
                <div
                  key={donation.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-smooth"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">{donation.item_name}</h4>
                    <p className="text-muted-foreground">
                      {donation.quantity} {donation.unit} • {donation.item_type}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(donation.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        donation.status === "delivered"
                          ? "bg-primary/10 text-primary"
                          : donation.status === "pending"
                          ? "bg-accent/10 text-accent"
                          : "bg-secondary/10 text-secondary"
                      }`}
                    >
                      {donation.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;