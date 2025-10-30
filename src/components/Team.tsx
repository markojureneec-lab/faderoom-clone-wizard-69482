import { Card } from "@/components/ui/card";
import { Instagram } from "lucide-react";
import barberTeam from "@/assets/barber-team.jpg";
const Team = () => {
  return <section id="zaposlenici" className="py-24 px-4 bg-secondary/30">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
          Zaposlenici
        </h2>

        <div className="flex justify-center">
          <Card className="max-w-md overflow-hidden hover:shadow-gold transition-smooth">
            <div className="aspect-[3/4] overflow-hidden">
              <img src={barberTeam} alt="Andrijana" className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
            </div>
            
            <div className="p-6 text-center">
              <h3 className="text-2xl font-bold mb-4">Lana</h3>
              
              <a href="https://www.instagram.com/andrijanaaa_/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-smooth">
                <Instagram size={20} />
                <span>@lana
              </span>
              </a>
            </div>
          </Card>
        </div>
      </div>
    </section>;
};
export default Team;