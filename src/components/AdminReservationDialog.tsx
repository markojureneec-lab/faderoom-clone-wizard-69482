import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { hr } from "date-fns/locale";
import { serviceData } from "@/data/services";

interface TimeSlot {
  time: string;
  available: boolean;
}

interface AdminReservationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AdminReservationDialog = ({ open, onOpenChange }: AdminReservationDialogProps) => {
  const [date, setDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>();
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [servicePrice, setServicePrice] = useState("");
  const [isCustomService, setIsCustomService] = useState(false);
  const [notes, setNotes] = useState("");
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [isClosedDay, setIsClosedDay] = useState<boolean | null>(null);

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

    if (!workingHours || workingHours.is_closed) {
      setIsClosedDay(true);
      setSlotsLoading(false);
      return;
    }

    const { data: existingReservations, error: reservationsError } = await supabase
      .from("reservations")
      .select("reservation_time")
      .eq("reservation_date", format(selectedDate, "yyyy-MM-dd"))
      .in("status", ["pending", "confirmed"]);

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

    if (!customerName.trim() || !customerPhone.trim()) {
      toast.error("Molimo unesite ime i telefon klijenta");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from("reservations").insert({
        user_id: null,
        reservation_date: format(date, "yyyy-MM-dd"),
        reservation_time: selectedTime,
        notes: notes.trim() ? `Klijent: ${customerName} (${customerPhone}). ${notes}` : `Klijent: ${customerName} (${customerPhone})`,
        status: "confirmed",
        service_name: serviceName.trim() || null,
        service_price: servicePrice ? parseFloat(servicePrice) : null,
      });

      if (error) throw error;

      toast.success("Rezervacija uspješno kreirana!");
      onOpenChange(false);
      
      // Reset form
      setDate(undefined);
      setSelectedTime(undefined);
      setCustomerName("");
      setCustomerPhone("");
      setServiceName("");
      setServicePrice("");
      setIsCustomService(false);
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
          <DialogTitle className="text-2xl">Dodaj prilagođenu rezervaciju</DialogTitle>
          <p className="text-muted-foreground">Kreirajte rezervaciju za klijenta</p>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customerName" className="text-base">
                Ime klijenta *
              </Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Unesite ime..."
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="customerPhone" className="text-base">
                Telefon *
              </Label>
              <Input
                id="customerPhone"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Unesite broj..."
                className="mt-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="serviceName" className="text-base">
                Usluga (opcionalno)
              </Label>
              <Select
                value={isCustomService ? "custom" : serviceName}
                onValueChange={(value) => {
                  if (value === "custom") {
                    setIsCustomService(true);
                    setServiceName("");
                    setServicePrice("");
                  } else {
                    setIsCustomService(false);
                    setServiceName(value);
                    const service = serviceData
                      .flatMap(cat => cat.services)
                      .find(s => s.name === value);
                    if (service) {
                      setServicePrice(service.price.toString());
                    }
                  }
                }}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Odaberite uslugu" />
                </SelectTrigger>
                <SelectContent>
                  {serviceData.map((category) => (
                    <div key={category.title}>
                      <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                        {category.title}
                      </div>
                      {category.services.map((service) => (
                        <SelectItem key={service.name} value={service.name}>
                          {service.name} - €{service.price}
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                  <SelectItem value="custom">Prilagođeno</SelectItem>
                </SelectContent>
              </Select>
              
              {isCustomService && (
                <Input
                  placeholder="Unesite naziv usluge"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  className="mt-2"
                />
              )}
            </div>

            <div>
              <Label htmlFor="servicePrice" className="text-base">
                Cijena (opcionalno)
              </Label>
              <Input
                id="servicePrice"
                type="number"
                value={servicePrice}
                onChange={(e) => setServicePrice(e.target.value)}
                placeholder="0.00"
                className="mt-2"
                disabled={!isCustomService && serviceName !== ""}
              />
            </div>
          </div>

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
            disabled={!date || !selectedTime || !customerName.trim() || !customerPhone.trim() || loading}
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

export default AdminReservationDialog;
