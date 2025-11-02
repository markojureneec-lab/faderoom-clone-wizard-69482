export interface Service {
  name: string;
  price: number;
  duration: number;
}

export interface ServiceCategory {
  title: string;
  services: Service[];
}

export const serviceData: ServiceCategory[] = [
  {
    title: "Kosa",
    services: [
      { name: "Fade ili klasično šišanje", price: 15, duration: 30 },
      { name: "Fade ili klasično šišanje i pranje", price: 20, duration: 30 },
      { name: "Dječje šišanje (do 10 godina)", price: 10, duration: 30 },
      { name: "Šišanje mašinicom na nulu i uređivanje brade", price: 20, duration: 30 },
      { name: "Kreativno šišanje (duga kosa)", price: 30, duration: 60 },
    ],
  },
  {
    title: "Brada",
    services: [{ name: "Uređivanje brade", price: 10, duration: 30 }],
  },
  {
    title: "Kosa i Brada",
    services: [
      { name: "Šišanje i uređivanje brade (brada na jednu dužinu i crte)", price: 20, duration: 30 },
      { name: "Fade ili klasično šišanje i uređivanje brade", price: 25, duration: 45 },
      { name: "Šišanje, uređivanje brade, pranje i masaža vlasišta", price: 30, duration: 60 },
      { name: "Fade ili klasično šišanje, uređivanje brade i pranje", price: 30, duration: 60 },
    ],
  },
];

// Flattened list for easier selection
export const allServices = serviceData.flatMap(category => 
  category.services
);
