import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Clock, Euro } from "lucide-react";
import ReservationDialog from "@/components/ReservationDialog";
import { serviceData } from "@/data/services";

const Services = () => {
  const [reservationOpen, setReservationOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<{ name: string; duration: number; price: number } | null>(null);

  const openReservation = (name: string, duration: number, price: number) => {
    setSelectedService({ name, duration, price });
    setReservationOpen(true);
  };

  return (
    <section id="usluge" className="py-24 px-4">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
          Usluge
        </h2>

        <div className="space-y-16">
          {serviceData.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              <h3 className="text-2xl font-bold mb-8 text-primary">
                {category.title}
              </h3>
              
              <div className="grid gap-6 md:grid-cols-2">
                {category.services.map((service, serviceIndex) => (
                  <Card
                    key={serviceIndex}
                    className="p-6 hover:border-primary transition-smooth hover:shadow-gold group"
                  >
                    <h4 className="text-lg font-semibold mb-4 group-hover:text-primary transition-smooth">
                      {service.name}
                    </h4>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Euro size={16} />
                        <span className="text-xl font-bold text-foreground">
                          {service.price}.00
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock size={16} />
                        <span>{service.duration} min</span>
                      </div>
                    </div>
                    
                    <Button
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={() => openReservation(service.name, service.duration, service.price)}
                    >
                      Rezervirajte termin
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <ReservationDialog
        open={reservationOpen}
        onOpenChange={setReservationOpen}
        serviceName={selectedService?.name}
        serviceDuration={selectedService?.duration}
        servicePrice={selectedService?.price}
      />
    </section>
  );
};

export default Services;
