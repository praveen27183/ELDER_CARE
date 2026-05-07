import { useState, useEffect } from "react";
import { ArrowLeft, Crown, Check, Star, Zap, Gift, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../../context/LanguageContext";
import api from "../../services/api";

interface Plan {
  name: string;
  price: number;
  duration: string;
  description: string;
  features: string[];
  recommended?: boolean;
}

export default function Membership() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [currentPlan, setCurrentPlan] = useState("Free");
  const [showSuccess, setShowSuccess] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      if (parsedUser.membership?.plan) {
        setCurrentPlan(parsedUser.membership.plan);
      }
    }
  }, []);

  const upgradePlan = async (planName: string) => {
    try {
      if (!user?._id) return;

      const res = await api.patch("/elders/membership", {
        plan: planName,
        userId: user._id
      });

      // Update local storage user
      const updatedUser = { ...user, membership: res.data.membership };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      setCurrentPlan(planName);
      setShowSuccess(true);
    } catch (err) {
      console.error("Failed to upgrade plan", err);
      alert("Failed to process payment. Please try again.");
    }
  };

  const plans: Plan[] = [
    {
      name: t.monthly || "Monthly",
      price: 499,
      duration: "/ month",
      description: "Perfect for short-term assistance",
      features: [
        t.fastestHelp || "Priority Response",
        "10% Service Discounts",
        t.exclusiveGifts || "Monthly Gift Redemption",
        "Standard Support"
      ]
    },
    {
      name: t.sixMonth || "6 Months",
      price: 2499,
      duration: "/ 6 months",
      description: "Best value for long-term care",
      features: [
        "Instant Response (Priority #1)",
        "20% Service Discounts",
        "Premium Monthly Gifts",
        "Dedicated Care Manager",
        "Emergency SOS Priority"
      ],
      recommended: true
    }
  ];

  const comparison = [
    { feature: "Help Response Time", free: "Standard", premium: "Instant" },
    { feature: "Service Discounts", free: "None", premium: "Up to 20%" },
    { feature: "Monthly Gifts", free: "❌", premium: "✅" },
    { feature: "Priority SOS", free: "❌", premium: "✅" },
    { feature: "Home Checkups", free: "Paid", premium: "2 Free / mo" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      
      {/* HEADER */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-100 px-4 pt-6 pb-4 flex items-center gap-4">
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(-1)} 
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-slate-600" />
        </motion.button>
        <h1 className="text-2xl font-black text-slate-800">{t.membership}</h1>
      </div>

      <div className="max-w-md mx-auto p-4">
        
        {/* CURRENT STATUS */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-8 flex items-center justify-between"
        >
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t.yourStatus || "Your Status"}</p>
            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
              {currentPlan} {currentPlan !== "Free" && <Crown className="w-6 h-6 text-yellow-500 fill-yellow-500" />}
            </h2>
          </div>
          <div className={`p-4 rounded-2xl ${currentPlan === 'Free' ? 'bg-slate-100 text-slate-400' : 'bg-yellow-100 text-yellow-700'}`}>
            <ShieldCheck className="w-8 h-8" />
          </div>
        </motion.div>

        {/* PRICING TITLES */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-slate-800 mb-2">{t.upgradeToPremium}</h2>
          <p className="text-slate-500">Get the care you deserve with priority access and exclusive rewards.</p>
        </div>

        {/* PLANS */}
        <div className="space-y-6 mb-12">
          {plans.map((p) => (
            <motion.div
              key={p.name}
              whileHover={{ y: -5 }}
              className={`relative bg-white rounded-[2.5rem] p-8 shadow-xl border-2 transition-all ${
                p.recommended ? "border-indigo-600 ring-4 ring-indigo-50" : "border-slate-100"
              }`}
            >
              {p.recommended && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full shadow-lg">
                  {t.mostPopular || "Most Popular"}
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-800 mb-1">{p.name}</h3>
                <p className="text-xs text-slate-400 font-medium">{p.description}</p>
              </div>

              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-black text-slate-900">₹{p.price}</span>
                <span className="text-slate-400 font-bold">{p.duration}</span>
              </div>

              <ul className="space-y-4 mb-8">
                {p.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-medium text-slate-600">
                    <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => upgradePlan(p.name)}
                disabled={currentPlan === p.name}
                className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${
                  currentPlan === p.name
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : p.recommended
                  ? "bg-indigo-600 text-white shadow-[0_10px_20px_-5px_rgba(79,70,229,0.4)] hover:bg-indigo-700"
                  : "bg-slate-800 text-white hover:bg-slate-900 shadow-lg"
                }`}
              >
                {currentPlan === p.name ? t.currentPlan || "Current Plan" : t.choosePlan || "Choose Plan"}
              </button>
            </motion.div>
          ))}
        </div>

        {/* COMPARISON TABLE */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-12">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-600 fill-indigo-600" />
            {t.planComparison || "Plan Comparison"}
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-3 text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">
              <span>{t.benefit || "Benefit"}</span>
              <span className="text-center">{t.free || "Free"}</span>
              <span className="text-center text-indigo-600">{t.premium || "Premium"}</span>
            </div>
            
            {comparison.map((item, i) => (
              <div key={i} className="grid grid-cols-3 items-center py-3 border-t border-slate-50 px-2">
                <span className="text-xs font-bold text-slate-600">{item.feature}</span>
                <span className="text-xs font-medium text-slate-400 text-center">{item.free}</span>
                <span className="text-xs font-black text-indigo-700 text-center">{item.premium}</span>
              </div>
            ))}
          </div>
        </div>

        {/* REWARDS TEASER */}
        <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-20 transform translate-x-1/4 translate-y-1/4">
            <Gift className="w-32 h-32" />
          </div>
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-2">{t.exclusiveGifts}</h3>
            <p className="text-sm text-orange-50 text-opacity-90 mb-4 leading-relaxed">
              Premium members can redeem special surprise gifts at the end of every month. Join today to start collecting!
            </p>
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
              <Star className="w-3 h-3 fill-white" />
              Next Gift in 12 Days
            </div>
          </div>
        </div>

      </div>

      {/* SUCCESS MODAL */}
      <AnimatePresence>
        {showSuccess && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2.5rem] w-full max-w-sm p-8 text-center shadow-2xl relative overflow-hidden mb-24 md:mb-auto"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 to-orange-500" />
              
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Crown className="w-12 h-12 text-yellow-600 fill-yellow-600" />
              </div>

              <h2 className="text-2xl font-bold text-slate-800 mb-2">Welcome to Premium!</h2>
              <p className="text-slate-500 mb-8 leading-relaxed">
                You are now a <span className="font-black text-indigo-600">{currentPlan}</span> member. 
                Enjoy priority help and exclusive discounts!
              </p>

              <button
                onClick={() => setShowSuccess(false)}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-colors shadow-lg"
              >
                {t.startExploring || "Start Exploring"}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}