import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { hr } from "date-fns/locale";

interface Reservation {
  id: string;
  reservation_date: string;
  reservation_time: string;
  status: string;
  notes: string | null;
  profiles: {
    full_name: string;
    phone_number: string;
  };
}

const ReservationsTab = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReservations();

    const channel = supabase
      .channel("reservations-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "reservations",
        },
        () => {
          loadReservations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadReservations = async () => {
    const { data, error } = await supabase
      .from("reservations")
      .select(`
        *,
        profiles (
          full_name,
          phone_number
        )
      `)
      .order("reservation_date", { ascending: true })
      .order("reservation_time", { ascending: true });

    if (error) {
      toast.error("Greška pri učitavanju rezervacija");
      return;
    }

    setReservations(data || []);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("reservations")
      .update({ status })
      .eq("id", id);

    if (error) {
      toast.error("Greška pri ažuriranju statusa");
      return;
    }

    toast.success("Status uspješno ažuriran");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500/20 text-green-500 border-green-500/50";
      case "completed":
        return "bg-blue-500/20 text-blue-500 border-blue-500/50";
      case "cancelled":
        return "bg-red-500/20 text-red-500 border-red-500/50";
      default:
        return "bg-yellow-500/20 text-yellow-500 border-yellow-500/50";
    }
  };

  if (loading) {
    return <p className="text-muted-foreground">Učitavanje rezervacija...</p>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Sve rezervacije</h2>
      
      {reservations.length === 0 ? (
        <p className="text-muted-foreground">Nema rezervacija</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Datum</TableHead>
                <TableHead>Vrijeme</TableHead>
                <TableHead>Ime</TableHead>
                <TableHead>Telefon</TableHead>
                <TableHead>Napomena</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Akcije</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservations.map((reservation) => (
                <TableRow key={reservation.id}>
                  <TableCell>
                    {format(new Date(reservation.reservation_date), "dd. MMM yyyy", { locale: hr })}
                  </TableCell>
                  <TableCell>{reservation.reservation_time.substring(0, 5)}</TableCell>
                  <TableCell className="font-medium">{reservation.profiles.full_name}</TableCell>
                  <TableCell>{reservation.profiles.phone_number}</TableCell>
                  <TableCell className="max-w-xs truncate">{reservation.notes || "-"}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(reservation.status)}>
                      {reservation.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {reservation.status === "pending" && (
                        <Button
                          size="sm"
                          onClick={() => updateStatus(reservation.id, "confirmed")}
                        >
                          Potvrdi
                        </Button>
                      )}
                      {reservation.status === "confirmed" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatus(reservation.id, "completed")}
                        >
                          Završi
                        </Button>
                      )}
                      {(reservation.status === "pending" || reservation.status === "confirmed") && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => updateStatus(reservation.id, "cancelled")}
                        >
                          Otkaži
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default ReservationsTab;
