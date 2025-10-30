import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Card } from "@/components/ui/card";

const Auth = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 p-4">
      <Card className="w-full max-w-md p-8 shadow-glow">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent">
            Welcome to HUSON
          </h1>
          <p className="text-muted-foreground mt-2">
            Join us in turning surplus into social impact
          </p>
        </div>
        
        <SupabaseAuth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: "hsl(158 64% 52%)",
                  brandAccent: "hsl(158 64% 42%)",
                },
              },
            },
          }}
          providers={[]}
          redirectTo={`${window.location.origin}/dashboard`}
        />
      </Card>
    </div>
  );
};

export default Auth;