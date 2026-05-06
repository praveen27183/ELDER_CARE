import React, { useState, useEffect } from "react";
import { ArrowLeft, Wallet, QrCode, CreditCard, Plus, ArrowUpRight, ArrowDownLeft, CheckCircle, Search, History, X, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../../context/LanguageContext";

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  title: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

type PaymentStage = 'idle' | 'selecting' | 'scanning' | 'verifying' | 'success';

export default function Payment() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  /* =========================
     STATE
  ========================== */
  const [wallet, setWallet] = useState(0);
  const [upiId, setUpiId] = useState("");
  const [showQR, setShowQR] = useState(false);
  
  // Add Money Flow States
  const [paymentStage, setPaymentStage] = useState<PaymentStage>('idle');
  const [addAmount, setAddAmount] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showSuccess, setShowSuccess] = useState<{title: string, amount: number} | null>(null);

  useEffect(() => {
    const savedWallet = localStorage.getItem("wallet");
    const savedTransactions = localStorage.getItem("transactions");
    
    if (savedWallet) setWallet(Number(savedWallet));
    if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
  }, []);

  const addTransaction = (type: 'credit' | 'debit', amount: number, title: string) => {
    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      amount,
      title,
      date: new Date().toLocaleString(),
      status: 'completed'
    };
    const updated = [newTx, ...transactions].slice(0, 20); // Keep last 20
    setTransactions(updated);
    localStorage.setItem("transactions", JSON.stringify(updated));
  };

  const updateWallet = (amount: number, title: string, isCredit: boolean) => {
    const newBalance = isCredit ? wallet + amount : wallet - amount;
    if (newBalance < 0) {
      alert("Insufficient funds in wallet");
      return false;
    }
    setWallet(newBalance);
    localStorage.setItem("wallet", String(newBalance));
    addTransaction(isCredit ? 'credit' : 'debit', amount, title);
    return true;
  };

  /* =========================
     ACTIONS
  ========================== */
  const startAddMoney = () => {
    setPaymentStage('selecting');
  };

  const proceedToQR = () => {
    if (Number(addAmount) > 0) {
      setPaymentStage('scanning');
    }
  };

  const simulateVerification = () => {
    setPaymentStage('verifying');
    
    // Simulate API call to check payment status
    setTimeout(() => {
      setPaymentStage('success');
      
      // Update wallet after success animation
      setTimeout(() => {
        const amt = Number(addAmount);
        updateWallet(amt, "Wallet Top-up", true);
        setPaymentStage('idle');
        setAddAmount("");
        setShowSuccess({title: t.moneyAdded || "Money Added Successfully", amount: amt});
      }, 1500);
    }, 2000);
  };

  const handleUPIPayment = () => {
    if (!upiId || !upiId.includes("@")) {
      alert("Please enter a valid UPI ID (e.g., name@okaxis)");
      return;
    }
    // Simulate a fixed payment for a service
    setShowSuccess({title: "Payment Requested via UPI", amount: 0});
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans">

      {/* HEADER */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-4 flex items-center gap-4">
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(-1)} 
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-slate-600" />
        </motion.button>
        <h1 className="text-xl font-bold text-slate-800">{t.myWallet}</h1>
      </div>

      <div className="max-w-md mx-auto">
        
        {/* WALLET CARD */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="m-4 bg-gradient-to-br from-emerald-500 to-teal-700 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden"
        >
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-emerald-100 text-xs font-medium uppercase tracking-widest mb-1">{t.balance}</p>
                <h2 className="text-4xl font-black">₹{wallet.toLocaleString()}</h2>
              </div>
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md border border-white/10">
                <Wallet className="w-6 h-6 text-white" />
              </div>
            </div>

            <button
              onClick={startAddMoney}
              className="w-full bg-white text-emerald-700 py-3 rounded-2xl font-bold shadow-lg hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              {t.addMoney}
            </button>
          </div>
        </motion.div>

        {/* PAYMENT METHODS */}
        <div className="px-4 mb-6">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">{t.paymentMethods || "Payment Methods"}</h3>
          
          <div className="grid gap-3">
            {/* UPI */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                </div>
                <span className="font-bold text-slate-700">UPI Payment</span>
              </div>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. user@okaxis"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
                <button
                  onClick={handleUPIPayment}
                  className="bg-blue-600 text-white px-4 rounded-xl font-bold text-sm shadow-sm hover:bg-blue-700 transition-colors"
                >
                  {t.pay || "Pay"}
                </button>
              </div>
            </div>

            {/* QR CODE */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <button 
                onClick={() => setShowQR(!showQR)}
                className="w-full flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <QrCode className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="font-bold text-slate-700">{t.scanToPay || "Scan QR to Pay"}</span>
                </div>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                  {showQR ? t.hide || "HIDE" : t.show || "SHOW"}
                </span>
              </button>

              <AnimatePresence>
                {showQR && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 p-4 bg-slate-50 rounded-2xl flex flex-col items-center gap-4 border border-slate-100">
                      <QRCode value="upi://pay?pa=elder@upi&pn=ElderCare" size={140} />
                      <p className="text-[10px] text-slate-400 font-mono">Scan this to pay directly to ElderCare</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* CASH */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-50 rounded-lg">
                  <div className="w-5 h-5 text-amber-600 font-bold flex items-center justify-center text-lg">₹</div>
                </div>
                <div>
                  <span className="font-bold text-slate-700 block">{t.cashOnDelivery || "Cash on Delivery"}</span>
                  <span className="text-xs text-slate-400">Pay volunteer after service</span>
                </div>
              </div>
              <div className="w-6 h-6 rounded-full border-2 border-emerald-500 flex items-center justify-center">
                <div className="w-3 h-3 bg-emerald-500 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* RECENT TRANSACTIONS */}
        <div className="px-4">
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">{t.recentTransactions}</h3>
            <History className="w-4 h-4 text-slate-300" />
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            {transactions.length > 0 ? (
              <div className="divide-y divide-slate-50">
                {transactions.map((tx) => (
                  <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${tx.type === 'credit' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>
                        {tx.type === 'credit' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 text-sm block">{tx.title}</span>
                        <span className="text-[10px] text-slate-400 uppercase font-medium">{tx.date}</span>
                      </div>
                    </div>
                    <span className={`font-black text-sm ${tx.type === 'credit' ? 'text-emerald-600' : 'text-slate-800'}`}>
                      {tx.type === 'credit' ? '+' : '-'} ₹{tx.amount}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400">
                <p className="text-sm">{t.noTransactions || "No transactions yet"}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MULTI-STEP ADD MONEY MODAL */}
      <AnimatePresence>
        {paymentStage !== 'idle' && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="bg-white rounded-t-[2.5rem] sm:rounded-3xl w-full max-w-sm p-8 shadow-2xl relative overflow-hidden min-h-[400px] flex flex-col justify-center"
            >
              {paymentStage !== 'verifying' && paymentStage !== 'success' && (
                <button 
                  onClick={() => setPaymentStage('idle')}
                  className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              )}

              <AnimatePresence mode="wait">
                {/* STAGE 1: SELECT AMOUNT */}
                {paymentStage === 'selecting' && (
                  <motion.div
                    key="selecting"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="w-full"
                  >
                    <h2 className="text-2xl font-black text-slate-800 mb-6">{t.addMoney}</h2>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">{t.enterAmount || "Enter Amount"} (₹)</label>
                        <input
                          autoFocus
                          type="number"
                          placeholder="0.00"
                          value={addAmount}
                          onChange={(e) => setAddAmount(e.target.value)}
                          className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl text-3xl font-black text-slate-800 focus:border-emerald-500 focus:outline-none transition-all"
                        />
                      </div>

                      <div className="flex gap-2">
                        {['100', '500', '1000'].map(amt => (
                          <button
                            key={amt}
                            onClick={() => setAddAmount(amt)}
                            className="flex-1 py-3 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl text-sm font-black transition-all"
                          >
                            ₹{amt}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={proceedToQR}
                        disabled={!addAmount || Number(addAmount) <= 0}
                        className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        {t.proceed || "Proceed"}
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* STAGE 2: SCAN QR */}
                {paymentStage === 'scanning' && (
                  <motion.div
                    key="scanning"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="w-full text-center"
                  >
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Paytm_Logo_%28standalone%29.svg/1200px-Paytm_Logo_%28standalone%29.svg.png" alt="Paytm" className="h-6" />
                      <h2 className="text-xl font-black text-slate-800">{t.scanToPay || "Scan to Pay"}</h2>
                    </div>
                    <p className="text-sm text-slate-500 mb-6 font-medium">Paying <span className="text-slate-800 font-bold">₹{addAmount}</span> to ElderCare</p>
                    
                    <div className="bg-white p-6 rounded-3xl border-2 border-slate-100 inline-block mb-6 shadow-sm">
                      <QRCode 
                        value={`upi://pay?pa=elder@paytm&pn=ElderCare&am=${addAmount}&cu=INR`} 
                        size={180} 
                      />
                    </div>

                    <p className="text-xs text-slate-400 mb-8 font-mono">ELDER-PAY-{(Math.random() * 10000).toFixed(0)}</p>

                    <button
                      onClick={simulateVerification}
                      className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                    >
                      {t.verifyPayment}
                    </button>
                  </motion.div>
                )}

                {/* STAGE 3: VERIFYING */}
                {paymentStage === 'verifying' && (
                  <motion.div
                    key="verifying"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="w-full text-center"
                  >
                    <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full"
                      />
                      <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 mb-2">{t.verifyPayment}</h2>
                    <p className="text-slate-500 font-medium px-8">We are checking with your bank. Please do not close this window.</p>
                  </motion.div>
                )}

                {/* STAGE 4: SUCCESS (PAID ANIMATION) */}
                {paymentStage === 'success' && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full text-center"
                  >
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", damping: 12, stiffness: 200 }}
                      className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-200"
                    >
                      <CheckCircle className="w-14 h-14 text-white" />
                    </motion.div>
                    <motion.h2 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-3xl font-black text-slate-800 mb-2"
                    >
                      {t.paid}
                    </motion.h2>
                    <motion.p 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-emerald-600 font-black text-xl mb-4"
                    >
                      ₹{addAmount}
                    </motion.p>
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ delay: 0.4, duration: 1 }}
                      className="h-1 bg-emerald-100 rounded-full w-full max-w-[150px] mx-auto"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TRANSACTION SUCCESS TOAST/MODAL */}
      <AnimatePresence>
        {showSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-sm p-8 text-center shadow-2xl border-t-8 border-emerald-500"
            >
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-emerald-500" />
              </div>

              <h2 className="text-2xl font-black text-slate-800 mb-2">{showSuccess.title}</h2>
              {showSuccess.amount > 0 && (
                <p className="text-3xl font-black text-emerald-600 mb-4">₹{showSuccess.amount}</p>
              )}
              <p className="text-slate-500 mb-8 font-medium">Your wallet balance has been updated and is ready to use.</p>

              <button
                onClick={() => setShowSuccess(null)}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 transition-colors shadow-lg"
              >
                Got it
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}