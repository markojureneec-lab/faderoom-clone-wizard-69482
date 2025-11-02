import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Team from "@/components/Team";
import Gallery from "@/components/Gallery";
import Location from "@/components/Location";
import Contact from "@/components/Contact";
import AdminReservationDialog from "@/components/AdminReservationDialog";
import { Plus } from "lucide-react";

const Index = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAddReservation, setShowAddReservation] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();
      
      setIsAdmin(!!data);
    };

    checkAdmin();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        checkAdmin();
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      <Services />
      <Team />
      <Gallery />
      <Location />
      <Contact />
      
      {isAdmin && (
        <>
          <Button
            onClick={() => setShowAddReservation(true)}
            className="fixed bottom-8 right-8 rounded-full w-14 h-14 shadow-lg z-40"
            size="icon"
          >
            <Plus size={24} />
          </Button>
          
          <AdminReservationDialog 
            open={showAddReservation} 
            onOpenChange={setShowAddReservation}
          />
        </>
      )}
      
      <footer className="py-8 text-center text-muted-foreground border-t border-border">
        <p>© 2025 The Lock Room. Sva prava pridržana.</p>
      </footer>
    </div>
  );
};

export default Index;