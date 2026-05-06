import React from 'react';
import { useLanguage } from "../../../context/LanguageContext";


import medicineImg from "../image/medicine.png";
import groceryImg from "../image/grocery.png";
import callImg from "../image/call.png";
import homeImg from "../image/home.png";
import rideImg from "../image/ride.png";

interface ServiceItem {
  id: number;
  name: string;
  description: string;
  icon: React.ReactNode;
  borderColor: string;
  serviceType: "medicine" | "grocery" | "transport" | "home" | "call";
}

interface ServiceGridProps {
  onServiceClick?: (service: ServiceItem) => void;
}

export default function ServiceGrid({ onServiceClick }: ServiceGridProps) {
  const { t } = useLanguage();

  const services: ServiceItem[] = [
  {
    id: 1,
    name: t.medicine,
    icon: <img src={medicineImg} alt="Medicine" className="w-full h-full object-contain" />,
    borderColor: "border-green-500/20",
    serviceType: "medicine",
  },
  {
    id: 2,
    name: t.grocery,
    icon: <img src={groceryImg} alt="Grocery" className="w-full h-full object-contain" />,
    borderColor: "border-orange-500/20",
    serviceType: "grocery",
  },
  {
    id: 3,
    name: t.call,
    icon: <img src={callImg} alt="Call" className="w-full h-full object-contain" />,
    borderColor: "border-purple-500/20",
    serviceType: "call",
  },
  {
    id: 4,
    name: t.help,
    icon: <img src={homeImg} alt="Home" className="w-full h-full object-contain" />,
    borderColor: "border-blue-500/20",
    serviceType: "home",
  },
  {
    id: 5,
    name: t.ride,
    icon: <img src={rideImg} alt="Ride" className="w-full h-full object-contain" />,
    borderColor: "border-blue-500/20",
    serviceType: "transport",
  },
];


  return (
    <div className="w-full">
      {/* HEADING */}
      <h2 className="text-3xl md:text-4xl font-black mb-10 text-slate-800 text-center lg:text-left tracking-tight">
        {t.services}
      </h2>

      {/* GRID */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
        {services.map((service) =>
          service.serviceType === "transport" ? (
            /* LARGE TRANSPORT CARD */
            <button
              key={service.id}
              onClick={() => onServiceClick?.(service)}
              className={`col-span-2 md:col-span-3 lg:col-span-4 bg-white rounded-[3.5rem] p-4 md:p-6 shadow-xl hover:shadow-2xl border-2 ${service.borderColor} flex items-center gap-6 md:gap-10 active:scale-[0.98] transition-all duration-300 group`}
            >
              {/* ICON */}
              <div className="w-24 h-24 md:w-40 md:h-40 flex items-center justify-center transition-all duration-300 transform group-hover:scale-110">
                <div className="w-full h-full p-2">
                   {service.icon}
                </div>
              </div>

              {/* TEXT */}
              <div className="text-left flex-1">
                <h3 className="text-3xl md:text-4xl font-black text-slate-800 group-hover:text-red-600 transition-colors duration-300">
                  {service.name}
                </h3>
                <p className="text-lg md:text-xl text-slate-500 mt-2 md:mt-3 leading-relaxed font-semibold">
                  {service.description}
                </p>
              </div>
            </button>
          ) : (
            /* NORMAL SERVICE CARDS */
            <button
              key={service.id}
              onClick={() => onServiceClick?.(service)}
              className={`bg-white rounded-[3rem] p-4 md:p-8 shadow-lg hover:shadow-2xl active:scale-95 transition-all duration-300 text-center flex flex-col items-center justify-center border-2 ${service.borderColor} group`}
            >
              {/* ICON */}
              <div className="w-24 h-24 md:w-44 md:h-44 flex items-center justify-center mb-2 md:mb-4 transition-all duration-300 transform group-hover:scale-110">
                <div className="w-full h-full p-1">
                  {service.icon}
                </div>
              </div>

              {/* TITLE */}
              <h3 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
                {service.name}
              </h3>

              {/* DESCRIPTION */}
              <p className="text-sm md:text-base text-slate-500 mt-2 font-bold leading-tight line-clamp-2 px-2">
                {service.description}
              </p>
            </button>
          )
        )}
      </div>
    </div>
  );
}