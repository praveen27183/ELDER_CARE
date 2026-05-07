import { ArrowLeft, Gift, Star, Ticket, Trophy, Calendar, CheckCircle, History, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import QRCode from "react-qr-code";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../../context/LanguageContext";

interface RedeemedReward {
  id: string;
  title: string;
  code: string;
  date: string;
  points: number;
}

export default function Rewards() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  /* =========================
     STATE
  ========================== */
  const [points, setPoints] = useState(0);
  const [lastClaim, setLastClaim] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [redeemedHistory, setRedeemedHistory] = useState<RedeemedReward[]>([]);
  const [showRedeemSuccess, setShowRedeemSuccess] = useState<RedeemedReward | null>(null);
  const [activeTab, setActiveTab] = useState<"available" | "history">("available");

  useEffect(() => {
    const savedPoints = localStorage.getItem("points");
    const savedDate = localStorage.getItem("lastClaim");
    const savedStreak = localStorage.getItem("streak");
    const savedHistory = localStorage.getItem("redeemedHistory");

    if (savedPoints) setPoints(Number(savedPoints));
    if (savedDate) setLastClaim(savedDate);
    if (savedStreak) setStreak(Number(savedStreak));
    if (savedHistory) setRedeemedHistory(JSON.parse(savedHistory));
  }, []);

  const updatePoints = (newPoints: number) => {
    setPoints(newPoints);
    localStorage.setItem("points", String(newPoints));
  };

  /* =========================
     DAILY REWARD LOGIC
  ========================== */
  const claimDaily = () => {
    const today = new Date();
    const todayStr = today.toDateString();

    if (lastClaim === todayStr) return;

    let newStreak = streak;
    if (lastClaim) {
      const lastDate = new Date(lastClaim);
      const diffTime = Math.abs(today.setHours(0,0,0,0) - lastDate.setHours(0,0,0,0));
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        newStreak += 1;
      } else if (diffDays > 1) {
        newStreak = 1;
      }
    } else {
      newStreak = 1;
    }

    const bonus = newStreak > 5 ? 30 : 20; // Extra points for long streaks
    const newPoints = points + bonus;
    
    updatePoints(newPoints);
    setStreak(newStreak);
    setLastClaim(todayStr);
    localStorage.setItem("streak", String(newStreak));
    localStorage.setItem("lastClaim", todayStr);
  };

  /* =========================
     REWARDS DATA
  ========================== */
  const rewards = [
    { id: 1, title: "10% Healthcare Discount", points: 50, icon: <Gift />, color: "text-blue-500", bg: "bg-blue-50" },
    { id: 2, title: "Free Home Cleaning", points: 200, icon: <Star />, color: "text-amber-500", bg: "bg-amber-50" },
    { id: 3, title: "₹100 Pharmacy Voucher", points: 80, icon: <Ticket />, color: "text-emerald-500", bg: "bg-emerald-50" },
    { id: 4, title: "Priority Support Access", points: 150, icon: <Trophy />, color: "text-purple-500", bg: "bg-purple-50" },
  ];

  const redeemReward = (cost: number, title: string) => {
    if (points < cost) return;

    const newPoints = points - cost;
    updatePoints(newPoints);

    const newRedemption: RedeemedReward = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      code: `ELDER-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      date: new Date().toLocaleDateString(),
      points: cost
    };

    const newHistory = [newRedemption, ...redeemedHistory];
    setRedeemedHistory(newHistory);
    localStorage.setItem("redeemedHistory", JSON.stringify(newHistory));
    setShowRedeemSuccess(newRedemption);
  };

  /* =========================
     PROGRESS CALCULATIONS
  ========================== */
  const nextGoal = 300;
  const progress = Math.min((points / nextGoal) * 100, 100);
  const isClaimedToday = lastClaim === new Date().toDateString();

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans">
      
      {/* HEADER */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-100 px-4 pt-6 pb-4 flex items-center gap-4">
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(-1)} 
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-slate-600" />
        </motion.button>
        <h1 className="text-2xl font-black text-slate-800">{t.myRewards}</h1>
      </div>

      <div className="max-w-md mx-auto">
        
        {/* POINTS CARD */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="m-4 md:mx-0 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden"
        >
          {/* Decorative Circles */}
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-indigo-400/20 rounded-full blur-3xl" />
          
          <div className="relative z-10 text-center">
            <p className="text-indigo-100 text-sm font-medium uppercase tracking-wider mb-1">{t.balance || "Available Balance"}</p>
            <div className="flex items-center justify-center gap-2">
              <Trophy className="w-8 h-8 text-yellow-400 fill-yellow-400" />
              <h2 className="text-5xl font-black">{points}</h2>
            </div>
            
            {/* PROGRESS BAR */}
            <div className="mt-6 px-2">
              <div className="flex justify-between text-xs mb-2 text-indigo-100">
                <span>Bronze Level</span>
                <span>Silver Level (300 pts)</span>
              </div>
              <div className="bg-white/20 rounded-full h-3 overflow-hidden backdrop-blur-sm border border-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="bg-gradient-to-r from-yellow-300 to-yellow-500 h-full rounded-full shadow-[0_0_15px_rgba(253,224,71,0.5)]"
                />
              </div>
              <p className="text-xs mt-3 text-indigo-100 italic">
                {nextGoal - points > 0
                  ? `Keep going! ${nextGoal - points} more points for Silver Level`
                  : "Congratulations! You've reached Silver Level! 🎉"}
              </p>
            </div>
          </div>
        </motion.div>

        {/* DAILY REWARD SECTION */}
        <div className="px-4 mb-8">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={claimDaily}
            disabled={isClaimedToday}
            className={`w-full relative overflow-hidden group py-4 rounded-2xl font-bold shadow-lg transition-all flex items-center justify-center gap-3 ${
              isClaimedToday 
              ? "bg-slate-200 text-slate-500 cursor-not-allowed shadow-none" 
              : "bg-gradient-to-r from-amber-400 to-orange-500 text-white"
            }`}
          >
            {isClaimedToday ? (
              <>
                <CheckCircle className="w-5 h-5" />
                <span>{t.claimed || "Daily Reward Claimed"}</span>
              </>
            ) : (
              <>
                <Calendar className="w-5 h-5 animate-bounce" />
                <span>{t.claimDaily || "Claim Daily Reward"} (+20 pts)</span>
                <Sparkles className="w-4 h-4 absolute top-2 right-4 opacity-50 group-hover:animate-pulse" />
              </>
            )}
          </motion.button>
          
          {streak > 0 && (
            <p className="text-center mt-2 text-sm font-medium text-slate-500 flex items-center justify-center gap-1">
              🔥 <span className="text-orange-600 font-bold">{streak} {t.dailyStreak || "Day Streak!"}</span>
            </p>
          )}
        </div>

        {/* TABS */}
        <div className="px-4 mb-4 flex gap-2">
          <button 
            onClick={() => setActiveTab("available")}
            className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === "available" ? "bg-indigo-600 text-white shadow-md" : "bg-white text-slate-600 border border-slate-200"
            }`}
          >
            {t.availableRewards || "Available Rewards"}
          </button>
          <button 
            onClick={() => setActiveTab("history")}
            className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "history" ? "bg-indigo-600 text-white shadow-md" : "bg-white text-slate-600 border border-slate-200"
            }`}
          >
            <History className="w-4 h-4" />
            {t.myCoupons}
          </button>
        </div>

        {/* CONTENT AREA */}
        <AnimatePresence mode="wait">
          {activeTab === "available" ? (
            <motion.div 
              key="available"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-4 grid gap-4"
            >
              {rewards.map((reward, index) => (
                <motion.div
                  key={reward.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex justify-between items-center group hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-4 items-center">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${reward.bg} ${reward.color}`}>
                      {reward.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">{reward.title}</h3>
                      <div className="flex items-center gap-1 text-sm font-medium text-slate-500">
                        <Trophy className="w-3 h-3 text-yellow-500" />
                        <span>{reward.points} {t.points}</span>
                      </div>
                    </div>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    disabled={points < reward.points}
                    onClick={() => redeemReward(reward.points, reward.title)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                      points >= reward.points
                      ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                      : "bg-slate-100 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    {t.redeem}
                  </motion.button>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="history"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-4 flex flex-col gap-4"
            >
              {redeemedHistory.length > 0 ? (
                redeemedHistory.map((item) => (
                  <div key={item.id} className="bg-white rounded-2xl p-4 border-2 border-dashed border-indigo-100 flex flex-col gap-3 relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-12 h-12 bg-indigo-50 rounded-full" />
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-slate-800">{item.title}</h3>
                        <p className="text-xs text-slate-500">Redeemed on {item.date}</p>
                      </div>
                      <div className="bg-indigo-100 text-indigo-700 text-xs font-black px-2 py-1 rounded">
                        USED
                      </div>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 text-center font-mono font-bold text-indigo-600 tracking-widest">
                      {item.code}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Ticket className="w-8 h-8" />
                  </div>
                  <p>{t.noCoupons || "No coupons yet. Start redeeming!"}</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* SUCCESS MODAL */}
      <AnimatePresence>
        {showRedeemSuccess && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-sm p-8 text-center shadow-2xl relative overflow-hidden mb-24 md:mb-auto"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-violet-500" />
              
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>

              <h2 className="text-2xl font-bold text-slate-800 mb-2">{t.redemptionSuccess || "Redemption Successful!"}</h2>
              <p className="text-slate-500 mb-6">Your coupon for <span className="font-bold text-slate-700">{showRedeemSuccess.title}</span> is ready.</p>

              <div className="bg-slate-50 p-6 rounded-2xl mb-6 flex flex-col items-center gap-4 border border-slate-100">
                <QRCode value={showRedeemSuccess.code} size={150} />
                <p className="font-mono font-bold text-xl text-indigo-600 tracking-[0.2em]">{showRedeemSuccess.code}</p>
              </div>

              <button
                onClick={() => setShowRedeemSuccess(null)}
                className="w-full bg-slate-800 text-white py-4 rounded-2xl font-bold hover:bg-slate-700 transition-colors shadow-lg"
              >
                {t.gotIt || "Got it!"}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}