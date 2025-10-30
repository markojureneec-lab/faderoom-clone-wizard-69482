import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { hr } from "date-fns/locale";

interface TimeSlot {
  time: string;
  available: boolean;
}

interface ReservationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceName?: string;
  serviceDuration?: number;
  servicePrice?: number;
}

const ReservationDialog = ({ open, onOpenChange, serviceName, serviceDuration = 30, servicePrice }: ReservationDialogProps) => {
  const [date, setDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>();
  const [notes, setNotes] = useState("");
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [isClosedDay, setIsClosedDay] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (date) {
      loadTimeSlots(date);
    }
  }, [date]);

  const loadTimeSlots = async (selectedDate: Date) => {
    setSlotsLoading(true);
    setIsClosedDay(null);
    setTimeSlots([]);

    const dayOfWeek = selectedDate.getDay();
    
    const { data: workingHours, error: hoursError } = await supabase
      .from("working_hours")
      .select("*")
      .eq("day_of_week", dayOfWeek)
      .maybeSingle();

    if (hoursError) {
      console.error("Error loading working hours:", hoursError);
      toast.error("Greška pri učitavanju radnog vremena");
      setSlotsLoading(false);
      return;
    }

    if (!workingHours) {
      setIsClosedDay(true);
      setSlotsLoading(false);
      return;
    }

    if (workingHours.is_closed) {
      setIsClosedDay(true);
      setSlotsLoading(false);
      return;
    }

    const { data: existingReservations, error: reservationsError } = await supabase
      .from("reservations")
      .select("reservation_time")
      .eq("reservation_date", format(selectedDate, "yyyy-MM-dd"))
      .eq("status", "confirmed");

    if (reservationsError) {
      console.error("Error loading reservations:", reservationsError);
      toast.error("Greška pri učitavanju rezervacija");
      setSlotsLoading(false);
      return;
    }

    const bookedTimes = new Set(existingReservations?.map(r => r.reservation_time) || []);
    
    const slots: TimeSlot[] = [];
    const startHour = parseInt(workingHours.start_time.split(":")[0]);
    const endHour = parseInt(workingHours.end_time.split(":")[0]);

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}:00`;
        slots.push({
          time,
          available: !bookedTimes.has(time),
        });
      }
    }

    setIsClosedDay(false);
    setTimeSlots(slots);
    setSlotsLoading(false);
  };

  const handleReservation = async () => {
    if (!date || !selectedTime) {
      toast.error("Molimo odaberite datum i vrijeme");
      return;
    }

    // If user is not logged in, save reservation details and redirect to auth
    if (!user) {
      const pendingReservation = {
        reservation_date: format(date, "yyyy-MM-dd"),
        reservation_time: selectedTime,
        notes: notes || null,
        serviceName: serviceName,
      };
      sessionStorage.setItem("pendingReservation", JSON.stringify(pendingReservation));
      window.location.href = "/auth";
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from("reservations").insert({
        user_id: user.id,
        reservation_date: format(date, "yyyy-MM-dd"),
        reservation_time: selectedTime,
        notes: notes || null,
        status: "pending",
        service_name: serviceName || null,
        service_price: servicePrice || null,
      });

      if (error) throw error;

      toast.success("Rezervacija uspješno kreirana!");
      onOpenChange(false);
      setDate(undefined);
      setSelectedTime(undefined);
      setNotes("");
    } catch (error: any) {
      toast.error(error.message || "Greška pri kreiranju rezervacije");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Rezervirajte termin</DialogTitle>
          {serviceName && (
            <p className="text-muted-foreground">Usluga: {serviceName}</p>
          )}
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label className="text-base mb-2 block">Odaberite datum</Label>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
              className="rounded-md border mx-auto"
            />
          </div>

          {date && (
            <div>
              <Label className="text-base mb-2 block">
                Dostupni termini za {format(date, "dd. MMMM yyyy", { locale: hr })}
              </Label>
              {slotsLoading ? (
                <p className="text-muted-foreground">Učitavanje termina...</p>
              ) : isClosedDay ? (
                <p className="text-muted-foreground">Zatvoreno ovog dana</p>
              ) : timeSlots.length === 0 ? (
                <p className="text-muted-foreground">Nema dostupnih termina</p>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {timeSlots.map((slot) => (
                    <Button
                      key={slot.time}
                      variant={selectedTime === slot.time ? "default" : "outline"}
                      disabled={!slot.available}
                      onClick={() => setSelectedTime(slot.time)}
                      className="h-12"
                    >
                      {slot.time.substring(0, 5)}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}

          {selectedTime && (
            <div>
              <Label htmlFor="notes" className="text-base">
                Napomena (opcionalno)
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Dodatne informacije..."
                className="mt-2"
              />
            </div>
          )}

          <Button
            onClick={handleReservation}
            disabled={!date || !selectedTime || loading}
            className="w-full"
            size="lg"
          >
            {loading ? "Učitavanje..." : "Potvrdi rezervaciju"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReservationDialog;
