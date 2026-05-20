import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search, Bell, ChevronDown, LogOut, Settings, CreditCard, Users, X } from "lucide-react";
import { useAuthStore } from "../../store/auth.store";
import { useUiStore } from "../../store/ui.store";
import { ROUTES } from "../../config/routes";
import { useScroll } from "../../hooks/use-scroll";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isScrolled = useScroll(20);
  
  const { user, activeProfile, logout } = useAuthStore();
  const { searchQuery, setSearchQuery } = useUiStore();
  
  const [searchOpen, setSearchOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside clicks
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleSignOut = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  const handleSearchToggle = () => {
    setSearchOpen(!searchOpen);
    if (searchOpen) {
      setSearchQuery("");
    } else {
      navigate(ROUTES.SEARCH);
    }
  };

  const navLinks = [
    { label: "Home", path: ROUTES.HOME },
    { label: "Search", path: ROUTES.SEARCH },
    { label: "Subscription", path: ROUTES.SUBSCRIPTION },
    { label: "Settings", path: ROUTES.SETTINGS },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 h-16 sm:h-20 z-45 transition-all duration-500 ${
        isScrolled
          ? "bg-[#08080C]/90 backdrop-blur-md border-b border-white/5 shadow-lg"
          : "bg-gradient-to-b from-black/80 via-black/20 to-transparent"
      }`}
    >
      <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 flex items-center justify-between">
        
        {/* Left Side: Brand Logo + Horizontal Nav Directory */}
        <div className="flex items-center gap-8">
          <Link
            to={ROUTES.HOME}
            className="text-2xl sm:text-3xl font-black tracking-wider text-netflix-red drop-shadow-[0_0_8px_rgba(229,9,20,0.3)] transition-transform hover:scale-103"
          >
            PORTAL
          </Link>
          
          <nav className="hidden md:flex items-center gap-6 text-sm">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`font-semibold transition-all hover:text-white ${
                    isActive ? "text-white" : "text-cinema-gray"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Side: Actions (Search, Notifications, Profile Switcher) */}
        <div className="flex items-center gap-4 sm:gap-6">
          
          {/* Animated Search Panel */}
          <div className="relative flex items-center">
            <motion.div
              initial={false}
              animate={{ width: searchOpen ? 220 : 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden flex items-center"
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Titles, genres, directors..."
                className="bg-white/5 border border-white/10 rounded-md py-1.5 px-3 pl-8 text-xs text-white focus:outline-none focus:border-netflix-red w-full h-8"
              />
            </motion.div>
            
            <button
              onClick={handleSearchToggle}
              className="absolute left-2 text-cinema-gray hover:text-white cursor-pointer"
            >
              <Search className="w-4 h-4" />
            </button>
            
            {searchOpen && (
              <button
                onClick={handleSearchToggle}
                className="absolute right-2 text-cinema-gray hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Notifications Popover */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="text-cinema-gray hover:text-white relative cursor-pointer p-1"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-netflix-red rounded-full shadow-[0_0_5px_#E50914]" />
            </button>

            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-3 w-72 glass-panel-heavy p-4 rounded-xl shadow-2xl border border-white/10 z-50 text-xs"
                >
                  <h4 className="font-bold text-white mb-3">Recent Notifications</h4>
                  <div className="space-y-3">
                    <div className="border-b border-white/5 pb-2">
                      <p className="text-white font-medium">New Release: Neon Horizon</p>
                      <p className="text-white/40 text-[10px] mt-0.5">Now streaming in 4K Ultra HD</p>
                    </div>
                    <div className="border-b border-white/5 pb-2">
                      <p className="text-white font-medium">Subscription Invoice Paid</p>
                      <p className="text-white/40 text-[10px] mt-0.5">Standard Portal billing success</p>
                    </div>
                    <div>
                      <p className="text-white font-medium">Stranger Currents 5 Released</p>
                      <p className="text-white/40 text-[10px] mt-0.5 font-normal">Trailer added to your dashboard</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile Picker Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 cursor-pointer focus:outline-none"
            >
              <div
                className="w-8 h-8 rounded border border-white/15 overflow-hidden flex items-center justify-center font-bold text-sm text-white"
                style={{ backgroundColor: activeProfile?.avatarUrl ? "transparent" : "#E50914" }}
              >
                {activeProfile?.avatarUrl ? (
                  <img
                    src={activeProfile.avatarUrl}
                    alt={activeProfile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  activeProfile?.name[0].toUpperCase() || "U"
                )}
              </div>
              <ChevronDown className={`w-4 h-4 text-cinema-gray transition-transform duration-300 ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-3 w-56 glass-panel-heavy p-2 rounded-xl shadow-2xl border border-white/10 z-50 text-sm overflow-hidden"
                >
                  <div className="px-3 py-2 border-b border-white/5 mb-1.5">
                    <p className="text-white font-bold truncate">{activeProfile?.name || "Viewer Profile"}</p>
                    <p className="text-[10px] text-cinema-gray truncate">{user?.email || "viewer@portal.com"}</p>
                  </div>
                  
                  <Link
                    to={ROUTES.PROFILES}
                    className="flex items-center gap-2.5 px-3 py-2 text-cinema-gray hover:text-white hover:bg-white/5 rounded-md transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <Users className="w-4 h-4" />
                    <span>Switch Profiles</span>
                  </Link>

                  <Link
                    to={ROUTES.SUBSCRIPTION}
                    className="flex items-center gap-2.5 px-3 py-2 text-cinema-gray hover:text-white hover:bg-white/5 rounded-md transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Subscription Details</span>
                  </Link>

                  <Link
                    to={ROUTES.SETTINGS}
                    className="flex items-center gap-2.5 px-3 py-2 text-cinema-gray hover:text-white hover:bg-white/5 rounded-md transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <Settings className="w-4 h-4" />
                    <span>Account Settings</span>
                  </Link>
                  
                  <div className="h-px bg-white/5 my-1.5" />

                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-md transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>
    </header>
  );
}
export default Navbar;
