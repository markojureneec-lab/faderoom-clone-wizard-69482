import { Card } from "@/components/ui/card";
import { MapPin, Clock } from "lucide-react";

const Location = () => {
  return (
    <section id="lokacija" className="py-24 px-4 bg-secondary/30">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
          Pronađite nas
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="p-8">
            <div className="flex items-start gap-4 mb-6">
              <MapPin className="text-primary flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="text-xl font-bold mb-2">Adresa</h3>
                <a
                  href="https://www.google.com/maps/place/Ilica,+Zagreb"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-smooth"
                >
                  Ilica<br />
                  Zagreb
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Clock className="text-primary flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="text-xl font-bold mb-2">Radno vrijeme</h3>
                <div className="text-muted-foreground space-y-1">
                  <p>Pon: 09:00-16:00</p>
                  <p>Uto, Sri: 10:00-17:00</p>
                  <p>Čet: 11:00-18:00</p>
                  <p>Pet: 12:00-19:00</p>
                  <p>Sub: 09:00-14:00</p>
                </div>
              </div>
            </div>
          </Card>

          <div className="rounded-lg overflow-hidden h-[400px]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3932.702995917145!2d15.934618977539202!3d45.814443504924135!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4765d6d11c6fdb69%3A0x204c02d70dca4125!2sIlica%2C%20Zagreb!5e0!3m2!1shr!2shr!4v1761142246101!5m2!1shr!2shr"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="The Fade Room Location"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Location;
