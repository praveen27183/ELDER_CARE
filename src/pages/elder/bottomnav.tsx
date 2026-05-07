import { Home, ClipboardList, Tag, User, AlertTriangle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { motion } from "framer-motion";

export default function BottomNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  const navItems = [
    { icon: Home, label: t.home, path: "/elder" },
    { icon: ClipboardList, label: t.bookings, path: "/elder/bookings" },
    { icon: Tag, label: t.offers, path: "/elder/rewards" },
    { icon: User, label: t.profile, path: "/elder/profile" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-2 pb-4 pointer-events-none">
      {/* NAV BAR */}
      <div className="max-w-lg mx-auto bg-white border border-gray-200 shadow-2xl rounded-3xl px-2 py-3 flex justify-between items-center relative pointer-events-auto">
        {/* LEFT SIDE */}
        <div className="flex flex-1 justify-around pr-6 md:pr-10">
          {navItems.slice(0, 2).map((item, i) => (
            <button
              key={i}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center flex-1 min-w-0 px-1 transition-transform active:scale-90"
            >
              <item.icon
                className={`w-6 h-6 mb-1 shrink-0 ${
                  isActive(item.path) ? "text-blue-600" : "text-gray-400"
                }`}
              />
              <span
                className={`font-medium text-[10px] leading-tight text-center truncate w-full ${
                  isActive(item.path) ? "text-blue-600" : "text-gray-400"
                }`}
              >
                {item.label}
              </span>
            </button>
          ))}
        </div>

        {/* CENTER SOS BUTTON */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-8 z-10">
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate("/elder/sos")}
              className="w-16 h-16 md:w-20 md:h-20 bg-red-600 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.5)] border-4 border-white relative overflow-hidden group"
            >
              {/* Internal Shine Effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
              
              
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
              >
                <AlertTriangle className="text-white w-8 h-8 md:w-10 md:h-10 drop-shadow-md" />
              </motion.div>
              
              
            </motion.button>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex flex-1 justify-around pl-6 md:pl-10">
          {navItems.slice(2).map((item, i) => (
            <button
              key={i}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center flex-1 min-w-0 px-1 transition-transform active:scale-90"
            >
              <item.icon
                className={`w-6 h-6 mb-1 shrink-0 ${
                  isActive(item.path) ? "text-blue-600" : "text-gray-400"
                }`}
              />
              <span
                className={`font-medium text-[10px] leading-tight text-center truncate w-full ${
                  isActive(item.path) ? "text-blue-600" : "text-gray-400"
                }`}
              >
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}