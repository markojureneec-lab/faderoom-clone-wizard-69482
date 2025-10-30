import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import ReservationsTab from "@/components/admin/ReservationsTab";
import WorkingHoursTab from "@/components/admin/WorkingHoursTab";
import AnalyticsTab from "@/components/admin/AnalyticsTab";
import { LogOut, Calendar, Clock, BarChart3 } from "lucide-react";

const Admin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast.error("Morate biti prijavljeni");
      navigate("/auth");
      return;
    }

    const { data: userRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "admin")
      .single();

    if (!userRole) {
      toast.error("Nemate administratorske privilegije");
      navigate("/");
      return;
    }

    setIsAdmin(true);
    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Uspješna odjava");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Učitavanje...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gradient mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">The Fade Room</p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => navigate("/")}>
              Početna
            </Button>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="mr-2" size={16} />
              Odjava
            </Button>
          </div>
        </div>

        <Card className="p-6">
          <Tabs defaultValue="analytics">
            <TabsList className="mb-6">
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 size={16} />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="reservations" className="flex items-center gap-2">
                <Calendar size={16} />
                Rezervacije
              </TabsTrigger>
              <TabsTrigger value="hours" className="flex items-center gap-2">
                <Clock size={16} />
                Radno vrijeme
              </TabsTrigger>
            </TabsList>

            <TabsContent value="analytics">
              <AnalyticsTab />
            </TabsContent>

            <TabsContent value="reservations">
              <ReservationsTab />
            </TabsContent>

            <TabsContent value="hours">
              <WorkingHoursTab />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
