import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../store/auth.store";
import { ROUTES } from "../../../config/routes";
import { APP_CONSTANTS } from "../../../config/constants";
import { Plus, Check, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export function ProfileSelect() {
  const navigate = useNavigate();
  const { profiles, setActiveProfile, addProfile, deleteProfile } = useAuthStore();
  const [isManaging, setIsManaging] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");
  const [newProfileIsKids, setNewProfileIsKids] = useState(false);
  
  // Explicitly wide to string to avoid literal union mismatches from constants
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState<string>(APP_CONSTANTS.DEFAULT_AVATARS[0].url);

  const handleSelectProfile = (profile: any) => {
    if (isManaging) return;
    setActiveProfile(profile);
    toast.success(`Welcome back, ${profile.name}!`);
    navigate(ROUTES.HOME);
  };

  const handleCreateProfile = () => {
    if (!newProfileName.trim()) {
      toast.error("Profile name is required");
      return;
    }
    
    if (profiles.length >= APP_CONSTANTS.MAX_PROFILES) {
      toast.error(`Maximum of ${APP_CONSTANTS.MAX_PROFILES} profiles reached`);
      return;
    }

    const newProfile = {
      id: "prof-" + Math.random().toString(36).substring(7),
      name: newProfileName.trim(),
      avatarUrl: selectedAvatarUrl,
      isKids: newProfileIsKids,
    };

    addProfile(newProfile);
    toast.success("Profile created successfully!");
    
    // Reset Form
    setNewProfileName("");
    setNewProfileIsKids(false);
    setShowAddModal(false);
  };

  const handleDeleteProfile = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteProfile(id);
    toast.success("Profile deleted");
  };

  return (
    <div className="min-h-screen bg-[#08080C] text-white flex flex-col items-center justify-center py-12 px-6 select-none">
      <div className="max-w-4xl w-full text-center space-y-10">
        
        {/* Onboarding Heading Title */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-wide text-white">
            {isManaging ? "Manage Profiles" : "Who's watching?"}
          </h1>
          <p className="text-sm sm:text-base text-cinema-gray font-semibold">
            {isManaging ? "Configure customized settings or delete members" : "Select profile to begin streaming"}
          </p>
        </div>

        {/* Profile Avatars Grid Cards */}
        <div className="flex flex-wrap justify-center gap-8 sm:gap-10 py-6">
          {profiles.map((profile) => (
            <motion.div
              key={profile.id}
              onClick={() => handleSelectProfile(profile)}
              className="flex flex-col items-center gap-4 group cursor-pointer relative"
              whileHover={{ scale: isManaging ? 1 : 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Profile Card Frame */}
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-lg overflow-hidden border-2 border-transparent group-hover:border-white transition-all shadow-xl relative">
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-350"
                />
                
                {/* Delete / Edit overlay inside management toggles */}
                {isManaging && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2">
                    <button
                      onClick={(e) => handleDeleteProfile(e, profile.id)}
                      className="p-2 rounded-full bg-red-600/90 text-white hover:bg-red-700 hover:scale-110 active:scale-90 transition-all cursor-pointer shadow-md"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Kids Tag Indicator */}
                {profile.isKids && (
                  <span className="absolute bottom-1 right-1 bg-amber-500 text-black font-extrabold text-[8px] px-1.5 py-0.5 rounded uppercase tracking-wider shadow-md">
                    Kids
                  </span>
                )}
              </div>
              
              {/* Profile Name */}
              <span className="text-sm sm:text-base text-cinema-gray group-hover:text-white transition-colors truncate max-w-[120px] font-semibold">
                {profile.name}
              </span>
            </motion.div>
          ))}

          {/* Add Profile placeholder card */}
          {profiles.length < APP_CONSTANTS.MAX_PROFILES && (
            <motion.div
              onClick={() => setShowAddModal(true)}
              className="flex flex-col items-center gap-4 cursor-pointer group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-lg bg-white/5 border-2 border-dashed border-white/10 group-hover:border-white group-hover:bg-white/[0.08] transition-all flex items-center justify-center shadow-lg">
                <Plus className="w-8 h-8 text-cinema-gray group-hover:text-white transition-all" />
              </div>
              <span className="text-sm sm:text-base text-cinema-gray group-hover:text-white transition-colors font-semibold">
                Add Profile
              </span>
            </motion.div>
          )}

        </div>

        {/* Action controllers buttons */}
        <div className="pt-6">
          <button
            onClick={() => setIsManaging(!isManaging)}
            className="border-2 border-cinema-gray hover:border-white text-cinema-gray hover:text-white py-2.5 px-8 font-semibold tracking-wider text-xs uppercase transition-all rounded hover:bg-white/5 active:scale-95 cursor-pointer"
          >
            {isManaging ? "Done Configuring" : "Manage Profiles"}
          </button>
        </div>

      </div>

      {/* Onboarding Profile Add Overlay Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-4 select-none"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-md w-full glass-panel-heavy p-6 rounded-2xl border border-white/10 space-y-6 shadow-2xl"
            >
              <h3 className="text-xl font-bold tracking-wide text-white">Create New Profile</h3>
              
              <div className="space-y-4">
                {/* Profile Name Inputs */}
                <div className="space-y-1.5">
                  <label className="text-xs text-cinema-gray font-bold uppercase tracking-wider">Profile Name</label>
                  <input
                    type="text"
                    value={newProfileName}
                    onChange={(e) => setNewProfileName(e.target.value)}
                    placeholder="Enter profile title..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-4 text-xs text-white placeholder-cinema-gray focus:outline-none focus:border-netflix-red focus:bg-white/[0.08]"
                  />
                </div>

                {/* Kids Tag Toggle checkbox */}
                <div className="flex items-center gap-3 py-1">
                  <input
                    type="checkbox"
                    id="isKidsCheckbox"
                    checked={newProfileIsKids}
                    onChange={(e) => setNewProfileIsKids(e.target.checked)}
                    className="w-4 h-4 rounded accent-netflix-red focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="isKidsCheckbox" className="text-xs text-white/90 font-semibold cursor-pointer">
                    Is this a Kids viewing profile?
                  </label>
                </div>

                {/* Avatar Icon select grid */}
                <div className="space-y-2">
                  <label className="text-xs text-cinema-gray font-bold uppercase tracking-wider block">Select Avatar</label>
                  <div className="flex gap-4 overflow-x-auto py-1">
                    {APP_CONSTANTS.DEFAULT_AVATARS.map((avatar) => (
                      <div
                        key={avatar.name}
                        onClick={() => setSelectedAvatarUrl(avatar.url)}
                        className={`w-14 h-14 sm:w-16 sm:h-16 rounded-md overflow-hidden flex-shrink-0 cursor-pointer relative border-2 transition-all ${
                          selectedAvatarUrl === avatar.url ? "border-netflix-red scale-103 shadow-lg shadow-netflix-red/20" : "border-transparent"
                        }`}
                      >
                        <img src={avatar.url} alt={avatar.name} className="w-full h-full object-cover" />
                        {selectedAvatarUrl === avatar.url && (
                          <div className="absolute inset-0 bg-netflix-red/30 flex items-center justify-center">
                            <Check className="w-5 h-5 text-white" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Form buttons */}
              <div className="flex gap-4 pt-2">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-grow py-2 px-4 border border-white/10 hover:border-white rounded-md text-white font-semibold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateProfile}
                  className="flex-grow py-2 px-4 bg-netflix-red hover:bg-red-700 rounded-md text-white font-bold text-xs transition-colors shadow-lg shadow-netflix-red/20 cursor-pointer"
                >
                  Save Profile
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
export default ProfileSelect;
