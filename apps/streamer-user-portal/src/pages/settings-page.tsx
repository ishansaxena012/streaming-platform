import { useState } from "react";
import { useAuthStore } from "../store/auth.store";
import { Link } from "react-router-dom";
import { ROUTES } from "../config/routes";
import { User, CreditCard, Shield, Sparkles, Check } from "lucide-react";
import { toast } from "sonner";

export function SettingsPage() {
  const { user, activeProfile, profiles } = useAuthStore();
  const [updating, setUpdating] = useState(false);
  const [emailValue, setEmailValue] = useState(user?.email || "viewer@portal.com");
  const [nameValue, setNameValue] = useState(user?.name || "Viewer");

  const handleUpdateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setTimeout(() => {
      setUpdating(false);
      toast.success("Account metrics successfully updated!");
    }, 700);
  };

  return (
    <div className="bg-[#08080C] min-h-[80vh] py-12 px-4 sm:px-6 md:px-8 select-none text-white">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Onboarding Heading */}
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">Account Settings</h2>
          <p className="text-xs sm:text-sm text-cinema-gray">Manage credentials, profile statistics, and active subscriptions.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
          
          {/* Left panel options: Quick links */}
          <div className="space-y-4">
            
            <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-4">
              <span className="text-[10px] font-black uppercase tracking-wider text-cinema-gray">System Status</span>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-netflix-red/10 border border-netflix-red/20 text-netflix-red">
                  <Shield className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-white">Security Rating</p>
                  <p className="text-[10px] text-green-500 font-extrabold uppercase">Premium Core Valid</p>
                </div>
              </div>
              
              <div className="h-px bg-white/5" />
              
              <div className="space-y-2">
                <p className="text-[10px] text-cinema-gray font-semibold leading-relaxed">
                  Active member since: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}
                </p>
                <p className="text-[10px] text-cinema-gray font-semibold">
                  Unique User Token ID: <span className="font-mono text-[9px] text-white/55">{user?.id || "usr-stub"}</span>
                </p>
              </div>
            </div>

            <Link
              to={ROUTES.SUBSCRIPTION}
              className="glass-panel p-5 rounded-2xl border border-white/5 flex justify-between items-center hover:bg-white/[0.02] hover:border-white/20 transition-all block group"
            >
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-cinema-gray group-hover:text-white transition-colors" />
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-white">Upgrade Plan</p>
                  <p className="text-[10px] text-cinema-gray font-semibold">Switch resolve tier parameters</p>
                </div>
              </div>
              <span className="text-[10px] text-netflix-red font-bold uppercase group-hover:underline">Update</span>
            </Link>

          </div>

          {/* Right panel details: Form settings */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Account Credentials Form */}
            <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/5 space-y-6">
              <h3 className="text-base sm:text-lg font-extrabold flex items-center gap-2">
                <User className="w-5 h-5 text-netflix-red" />
                Personal Profile Metrics
              </h3>
              
              <form onSubmit={handleUpdateAccount} className="space-y-4 text-xs font-semibold text-cinema-gray">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-wider">Account Holder Name</label>
                    <input
                      type="text"
                      value={nameValue}
                      onChange={(e) => setNameValue(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-4 text-xs text-white focus:outline-none focus:border-netflix-red focus:bg-white/[0.08]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-wider">Email Address</label>
                    <input
                      type="email"
                      value={emailValue}
                      onChange={(e) => setEmailValue(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-4 text-xs text-white focus:outline-none focus:border-netflix-red focus:bg-white/[0.08]"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={updating}
                    className="py-2.5 px-6 rounded-md bg-netflix-red hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider cursor-pointer shadow-lg shadow-netflix-red/10 active:scale-95 transition-all"
                  >
                    {updating ? "Saving Changes..." : "Save Account Settings"}
                  </button>
                </div>
              </form>
            </div>

            {/* Profile avatars overview */}
            <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/5 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-base sm:text-lg font-extrabold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-netflix-red" />
                  Active Profiles ({profiles.length})
                </h3>
                <Link to={ROUTES.PROFILES} className="text-xs text-netflix-red font-bold hover:underline uppercase tracking-wider">
                  Manage
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {profiles.map((profile) => {
                  const isActive = activeProfile?.id === profile.id;
                  
                  return (
                    <div
                      key={profile.id}
                      className={`p-4 rounded-xl border flex flex-col items-center gap-3 relative ${
                        isActive ? "border-netflix-red bg-white/[0.02]" : "border-white/5 bg-black/20"
                      }`}
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/10">
                        <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-xs font-bold text-white truncate max-w-[80px]">{profile.name}</span>
                      
                      {isActive && (
                        <span className="absolute top-1.5 right-1.5 p-0.5 rounded-full bg-netflix-red text-white">
                          <Check className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
export default SettingsPage;
