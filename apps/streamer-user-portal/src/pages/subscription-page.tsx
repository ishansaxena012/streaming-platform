import { useState } from "react";
import { useAuthStore } from "../store/auth.store";
import { MOCK_PLANS } from "../lib/mock-data";
import { Check, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import type { SubscriptionPlan } from "../types";
import { apiClient } from "../services/api-client";

export function SubscriptionPage() {
  const { user, updateUser } = useAuthStore();
  const [selectedPlanId, setSelectedPlanId] = useState("standard-plan");
  const [subscribing, setSubscribing] = useState(false);

  const handleUpdateSubscription = async () => {
    const selectedPlan = MOCK_PLANS.find((p: SubscriptionPlan) => p.id === selectedPlanId);
    if (!selectedPlan) return;

    setSubscribing(true);
    try {
      if (selectedPlanId === "basic-plan") {
        toast.info("Basic Plan selected. Upgrade to Standard or Premium to activate Premium features.");
        setSubscribing(false);
        return;
      }

      await apiClient.post("/subscriptions/upgrade");
      
      updateUser({
        subscriptionActive: true,
        subscriptionPlanId: selectedPlanId,
      });

      toast.success(`Subscription successfully updated to ${selectedPlan.name}!`);
    } catch (error: any) {
      console.error("Subscription upgrade failure:", error);
      toast.error(error.message || "Failed to update subscription. Verify server connection.");
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <div className="bg-[#08080C] min-h-[80vh] py-12 px-4 sm:px-6 md:px-8 select-none">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Onboarding header summaries */}
        <div className="text-center space-y-3">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Choose the plan that's right for you
          </h2>
          <p className="text-sm sm:text-base text-cinema-gray max-w-xl mx-auto leading-relaxed font-semibold">
            Downgrade, upgrade, or cancel online at any time. Enjoy absolute cinematic freedom.
          </p>
        </div>

        {/* Pricing tiers grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 pt-4">
          {MOCK_PLANS.map((plan: SubscriptionPlan) => {
            const isSelected = selectedPlanId === plan.id;
            
            return (
              <motion.div
                key={plan.id}
                onClick={() => setSelectedPlanId(plan.id)}
                className={`glass-panel p-6 sm:p-8 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between space-y-6 ${
                  isSelected
                    ? "border-netflix-red shadow-[0_0_30px_rgba(229,9,20,0.15)] bg-white/[0.03] scale-102"
                    : "border-white/5 hover:border-white/20"
                }`}
                whileHover={{ y: -5 }}
              >
                {/* Popularity indicator card tag */}
                {plan.id === "standard-plan" && (
                  <span className="absolute top-[-12px] left-1/2 transform -translate-x-1/2 bg-netflix-red text-white text-[9px] font-black py-1 px-3 rounded-full uppercase tracking-wider shadow-lg flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Recommended
                  </span>
                )}

                {/* Cover info */}
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-xl font-extrabold text-white">{plan.name}</h3>
                  </div>

                  <div className="flex items-baseline gap-1.5 py-1">
                    <span className="text-3xl sm:text-4xl font-black text-white">${plan.price}</span>
                    <span className="text-xs text-cinema-gray font-bold uppercase">/ month</span>
                  </div>

                  <div className="h-px bg-white/5" />
                  
                  {/* Features checks list */}
                  <ul className="space-y-3.5 text-xs text-cinema-gray font-semibold">
                    {plan.features.map((feature: string, idx: number) => (
                      <li key={idx} className="flex items-center gap-3 text-white/95">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Select Radio indicators */}
                <div className="pt-2">
                  <div
                    className={`w-full py-2.5 rounded-lg text-center font-bold text-xs uppercase tracking-wider border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-netflix-red border-netflix-red text-white shadow-md shadow-netflix-red/10"
                        : "bg-white/5 border-white/10 text-cinema-gray hover:text-white"
                    }`}
                  >
                    {isSelected ? "Selected" : "Choose Plan"}
                  </div>
                </div>

              </motion.div>
            );
          })}
        </div>

        {/* Subscription confirmation action bar */}
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h4 className="font-bold text-white text-sm sm:text-base">Membership Summary</h4>
            <p className="text-xs text-cinema-gray max-w-md leading-relaxed font-semibold">
              Currently logged in as <span className="text-white font-bold">{user?.email}</span>. Click update to activate selected tier parameters immediately.
            </p>
          </div>
          <button
            onClick={handleUpdateSubscription}
            disabled={subscribing}
            className="w-full md:w-auto py-3 px-8 rounded-lg bg-netflix-red hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider cursor-pointer shadow-lg shadow-netflix-red/20 active:scale-95 transition-all"
          >
            {subscribing ? "Updating parameters..." : "Confirm Selection"}
          </button>
        </div>

      </div>
    </div>
  );
}
export default SubscriptionPage;
