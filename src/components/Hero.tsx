import { ChevronDown } from "lucide-react";
import barberPole from "@/assets/barber-pole.png";
const Hero = () => {
  const scrollToServices = () => {
    const element = document.getElementById("usluge");
    element?.scrollIntoView({
      behavior: "smooth"
    });
  };
  return <section id="hero" className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-secondary/20" />
      
      <div className="relative z-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="mb-6 flex justify-center">
          
        </div>
        
        <div className="mb-4 text-sm tracking-[0.3em] text-muted-foreground">EST. 2020</div>
        
        <h1 className="text-6xl md:text-8xl font-bold mb-6 tracking-tight">
          THE
          <br />
          <span className="text-gradient">LOCK ROOM</span>
        </h1>
        
        <p className="text-xl md:text-2xl tracking-[0.2em] text-muted-foreground mb-8">
          BARBERSHOP
        </p>
      </div>

      <button onClick={scrollToServices} className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce text-primary z-10" aria-label="Scroll to services">
        <ChevronDown size={32} />
      </button>
    </section>;
};
export default Hero;