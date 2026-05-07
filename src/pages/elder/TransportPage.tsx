import { BookingManager } from './Bookings';
import { useLanguage } from "../../context/LanguageContext";
import { ChevronLeft, Car } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function TransportPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleBookTransport = () => {
    const booking = BookingManager.createBooking(
      t.bookRides || "Transport Service",
      "transport",
      {
        notes: "Booked a ride service",
        estimatedDuration: "Variable",
        cost: 100
      }
    );
    
    alert(`${t.bookRides} booked successfully! ID: ${booking.id}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-4 mb-6 md:mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 md:p-3 bg-white rounded-xl md:rounded-2xl shadow-sm hover:bg-slate-50 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-slate-600" />
          </button>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800">
            {t.ride}
          </h1>
        </div>
        
        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/60 border border-slate-100 text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Car className="w-10 h-10 text-blue-600" />
          </div>
          <p className="text-slate-500 mb-8 font-medium">
            Safe and reliable transportation for your medical appointments or personal needs.
          </p>
          <button
            onClick={handleBookTransport}
            className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white text-xl font-bold rounded-2xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
          >
            {t.bookService}
          </button>
        </div>
      </div>
    </div>
  );
}
