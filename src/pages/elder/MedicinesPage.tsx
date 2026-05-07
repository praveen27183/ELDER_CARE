import { useState } from 'react';
import { BookingManager } from './Bookings';
import { useLanguage } from "../../context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function MedicinesPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleBookMedicines = () => {
    setShowConfirmation(true);
  };

  const handleConfirmBooking = () => {
    const booking = BookingManager.createBooking(
      t.orderMedicines || "Medicines Service",
      "medicine",
      {
        notes: "Medicine delivery service",
        estimatedDuration: "30 mins",
        cost: 50
      }
    );
    
    console.log('Booking created:', booking);
    alert(`${t.orderMedicines} booked successfully! ID: ${booking.id}`);
    setShowConfirmation(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {!showConfirmation ? (
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-4 mb-6 md:mb-8">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 md:p-3 bg-white rounded-xl md:rounded-2xl shadow-sm hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-slate-600" />
            </button>
            <h1 className="text-2xl md:text-3xl font-black text-slate-800">
              {t.medicine}
            </h1>
          </div>
          
          <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/60 border border-slate-100 text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-blue-600" />
            </div>
            <p className="text-slate-500 mb-8 font-medium">
              Get your medicines delivered right to your doorstep by our verified volunteers.
            </p>
            <button
              onClick={handleBookMedicines}
              className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white text-xl font-bold rounded-2xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
            >
              {t.bookService}
            </button>
          </div>
        </div>
      ) : (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 z-[100]">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 text-center shadow-2xl border border-slate-100 mb-24 md:mb-auto"
          >
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-2 leading-tight">
              {t.bookService}<br/>
              <span className="text-emerald-600">{t.medicine}</span>
            </h2>
            <p className="text-slate-500 mb-8 font-medium px-4">
              {t.nearbyVolunteer}
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleConfirmBooking}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-lg font-bold transition-all shadow-lg shadow-emerald-200 active:scale-[0.98]"
              >
                {t.acceptBook}
              </button>
              <button
                onClick={() => setShowConfirmation(false)}
                className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-2xl text-lg font-bold transition-all active:scale-[0.98]"
              >
                {t.cancel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
