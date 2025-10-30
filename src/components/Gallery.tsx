import barbershopInterior from "@/assets/barbershop-interior.jpg";

const Gallery = () => {
  return (
    <section id="prostor" className="py-24 px-4">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
          Naš prostor
        </h2>

        <div className="max-w-4xl mx-auto overflow-hidden rounded-lg">
          <img
            src={barbershopInterior}
            alt="Barbershop interior"
            className="w-full h-auto object-cover"
          />
        </div>
      </div>
    </section>
  );
};

export default Gallery;
