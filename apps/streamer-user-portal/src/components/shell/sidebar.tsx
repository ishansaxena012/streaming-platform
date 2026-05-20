import { Link, useLocation } from "react-router-dom";
import { Home, Search, CreditCard, Settings } from "lucide-react";
import { useUiStore } from "../../store/ui.store";
import { ROUTES } from "../../config/routes";
import { motion } from "framer-motion";

export function Sidebar() {
  const location = useLocation();
  const { sidebarExpanded, setSidebarExpanded } = useUiStore();

  const menuItems = [
    { label: "Home Dashboard", path: ROUTES.HOME, icon: Home },
    { label: "Instant Search", path: ROUTES.SEARCH, icon: Search },
    { label: "Subscription Plans", path: ROUTES.SUBSCRIPTION, icon: CreditCard },
    { label: "Account Settings", path: ROUTES.SETTINGS, icon: Settings },
  ];

  return (
    <motion.aside
      onHoverStart={() => setSidebarExpanded(true)}
      onHoverEnd={() => setSidebarExpanded(false)}
      animate={{ width: sidebarExpanded ? 240 : 72 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="hidden md:flex flex-col fixed left-0 top-16 sm:top-20 bottom-0 bg-[#08080C] border-r border-white/5 z-40 overflow-x-hidden shadow-2xl select-none"
    >
      {/* Sidebar Links */}
      <div className="flex flex-col gap-2 py-6 px-3 flex-grow">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 py-3 px-3.5 rounded-lg transition-all ${
                isActive
                  ? "bg-netflix-red text-white shadow-lg shadow-netflix-red/20 font-bold"
                  : "text-cinema-gray hover:text-white hover:bg-white/5"
              }`}
            >
              <div className="flex-shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              
              <motion.span
                animate={{ opacity: sidebarExpanded ? 1 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-xs font-semibold tracking-wider whitespace-nowrap uppercase"
              >
                {item.label}
              </motion.span>
            </Link>
          );
        })}
      </div>
      
      {/* Sidebar Footer info */}
      <div className="p-4 border-t border-white/5 text-[9px] text-cinema-gray text-center font-bold tracking-widest uppercase">
        {sidebarExpanded ? (
          <span className="animate-pulse text-white/50">Portal Streamer Core</span>
        ) : (
          <span>P1</span>
        )}
      </div>
    </motion.aside>
  );
}
export default Sidebar;
