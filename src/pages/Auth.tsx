import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { z } from "zod";

const signUpSchema = z.object({
  fullName: z.string().trim().min(2, "Ime mora imati najmanje 2 znaka").max(100),
  phoneNumber: z.string().trim().min(8, "Broj telefona je obavezan i mora imati najmanje 8 znakova").max(20),
  email: z.string().trim().email("Unesite valjanu email adresu").max(255),
  password: z.string().min(6, "Lozinka mora imati najmanje 6 znakova").max(100),
});

const signInSchema = z.object({
  email: z.string().trim().email("Unesite valjanu email adresu"),
  password: z.string().min(1, "Unesite lozinku"),
});

const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [signUpData, setSignUpData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    password: "",
  });
  const [signInData, setSignInData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    const checkPendingReservation = async (userId: string) => {
      const pendingReservation = sessionStorage.getItem("pendingReservation");
      if (pendingReservation) {
        try {
          const reservation = JSON.parse(pendingReservation);
          const { error } = await supabase.from("reservations").insert({
            user_id: userId,
            reservation_date: reservation.reservation_date,
            reservation_time: reservation.reservation_time,
            notes: reservation.notes,
            status: "pending",
          });

          if (error) throw error;

          sessionStorage.removeItem("pendingReservation");
          toast.success("Rezervacija uspješno kreirana!");
        } catch (error: any) {
          toast.error(error.message || "Greška pri kreiranju rezervacije");
          sessionStorage.removeItem("pendingReservation");
        }
      }
      // Always redirect to home after login
      navigate("/");
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        checkPendingReservation(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
        checkPendingReservation(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validated = signUpSchema.parse(signUpData);
      const redirectUrl = `${window.location.origin}/`;

      const { error } = await supabase.auth.signUp({
        email: validated.email,
        password: validated.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: validated.fullName,
            phone_number: validated.phoneNumber,
          },
        },
      });

      if (error) throw error;

      toast.success("Registracija uspješna! Možete se prijaviti.");
      setSignUpData({ fullName: "", phoneNumber: "", email: "", password: "" });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error(error.message || "Greška pri registraciji");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validated = signInSchema.parse(signInData);

      const { error } = await supabase.auth.signInWithPassword({
        email: validated.email,
        password: validated.password,
      });

      if (error) throw error;

      toast.success("Uspješna prijava!");
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error(error.message || "Greška pri prijavi");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gradient">The Fade Room</h1>
        
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="signin">Prijava</TabsTrigger>
            <TabsTrigger value="signup">Registracija</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <Label htmlFor="signin-email">Email</Label>
                <Input
                  id="signin-email"
                  type="email"
                  value={signInData.email}
                  onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="signin-password">Lozinka</Label>
                <Input
                  id="signin-password"
                  type="password"
                  value={signInData.password}
                  onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Učitavanje..." : "Prijava"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <Label htmlFor="signup-name">Ime i prezime</Label>
                <Input
                  id="signup-name"
                  type="text"
                  value={signUpData.fullName}
                  onChange={(e) => setSignUpData({ ...signUpData, fullName: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="signup-phone">Telefon</Label>
                <Input
                  id="signup-phone"
                  type="tel"
                  value={signUpData.phoneNumber}
                  onChange={(e) => setSignUpData({ ...signUpData, phoneNumber: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  value={signUpData.email}
                  onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="signup-password">Lozinka</Label>
                <Input
                  id="signup-password"
                  type="password"
                  value={signUpData.password}
                  onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Učitavanje..." : "Registracija"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <Button
          variant="ghost"
          className="w-full mt-4"
          onClick={() => navigate("/")}
        >
          Povratak na početnu
        </Button>
      </Card>
    </div>
  );
};

export default Auth;
