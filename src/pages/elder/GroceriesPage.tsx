import { BookingManager } from './Bookings';
import { useLanguage } from "../../context/LanguageContext";
import { ChevronLeft, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function GroceriesPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleBookGroceries = () => {
    const booking = BookingManager.createBooking(
      t.dailyEssentials || "Groceries Service",
      "grocery",
      {
        notes: "Grocery shopping service",
        estimatedDuration: "1 hour",
        cost: 150
      }
    );
    
    console.log('Booking created:', booking);
    alert(`${t.dailyEssentials} booked successfully! ID: ${booking.id}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="p-3 bg-white rounded-2xl shadow-sm hover:bg-slate-50 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-slate-600" />
          </button>
          <h1 className="text-3xl font-black text-slate-800">
            {t.grocery}
          </h1>
        </div>
        
        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/60 border border-slate-100 text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-emerald-600" />
          </div>
          <p className="text-slate-500 mb-8 font-medium">
            Order fresh groceries and daily essentials delivered directly to your home.
          </p>
          <button
            onClick={handleBookGroceries}
            className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white text-xl font-bold rounded-2xl shadow-lg shadow-emerald-200 transition-all active:scale-[0.98]"
          >
            {t.bookService}
          </button>
        </div>
      </div>
    </div>
  );
}
