import { Card } from "@/components/ui/card";
import { Phone, Instagram, Mail } from "lucide-react";
const Contact = () => {
  return <section id="kontakt" className="py-24 px-4">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
          Kontaktirajte nas
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-8 text-center hover:border-primary transition-smooth hover:shadow-gold group">
            <Phone className="mx-auto mb-4 text-primary group-hover:scale-110 transition-smooth" size={32} />
            <h3 className="text-lg font-bold mb-2">Telefon</h3>
            <a href="tel:+385916403860" className="text-muted-foreground hover:text-primary transition-smooth">(+385) 91 234 5678</a>
          </Card>

          <Card className="p-8 text-center hover:border-primary transition-smooth hover:shadow-gold group">
            <Instagram className="mx-auto mb-4 text-primary group-hover:scale-110 transition-smooth" size={32} />
            <h3 className="text-lg font-bold mb-2">Instagram</h3>
            <a href="https://instagram.com/the_fade_room_barbershop" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-smooth">@lock_room</a>
          </Card>

          <Card className="p-8 text-center hover:border-primary transition-smooth hover:shadow-gold group">
            <Mail className="mx-auto mb-4 text-primary group-hover:scale-110 transition-smooth" size={32} />
            <h3 className="text-lg font-bold mb-2">Email</h3>
            <a href="mailto:thefaderoom66@gmail.com" className="text-muted-foreground hover:text-primary transition-smooth break-all">lockroom@gmail.com</a>
          </Card>
        </div>
      </div>
    </section>;
};
export default Contact;