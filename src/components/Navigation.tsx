import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { User, LogOut } from "lucide-react";
import { toast } from "sonner";
const Navigation = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const checkAdmin = async (userId: string) => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();
      
      setIsAdmin(!!data);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user);
      if (session?.user) {
        checkAdmin(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user);
      if (session?.user) {
        checkAdmin(session.user.id);
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({
      behavior: "smooth"
    });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Uspješna odjava");
  };
  return <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-background/95 backdrop-blur-sm shadow-lg" : "bg-transparent"}`}>
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <button onClick={() => scrollToSection("hero")} className="text-xl font-bold tracking-wider hover:text-primary transition-smooth">LOCK ROOM</button>

        <div className="hidden md:flex items-center gap-8">
          <button onClick={() => scrollToSection("hero")} className="text-sm hover:text-primary transition-smooth">
            Početna
          </button>
          <button onClick={() => scrollToSection("usluge")} className="text-sm hover:text-primary transition-smooth">
            Usluge
          </button>
          <button onClick={() => scrollToSection("zaposlenici")} className="text-sm hover:text-primary transition-smooth">
            Zaposlenici
          </button>
          <button onClick={() => scrollToSection("prostor")} className="text-sm hover:text-primary transition-smooth">
            Naš prostor
          </button>
          <button onClick={() => scrollToSection("lokacija")} className="text-sm hover:text-primary transition-smooth">
            Pronađite nas
          </button>
          <button onClick={() => scrollToSection("kontakt")} className="text-sm hover:text-primary transition-smooth">
            Kontakt
          </button>
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm">
                <User size={16} />
                <span className="text-muted-foreground">{user.email}</span>
              </div>
              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/admin")}
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  Admin
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                <LogOut size={16} className="mr-2" />
                Odjava
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={() => navigate("/auth")}
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              Prijava
            </Button>
          )}
        </div>
      </div>
    </nav>;
};
export default Navigation;