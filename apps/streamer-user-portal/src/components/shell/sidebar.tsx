import { Link, useLocation } from "react-router-dom";
import { Home, Search, CreditCard, Settings } from "lucide-react";
import { useUiStore } from "../../store/ui.store";
import { ROUTES } from "../../config/routes";
import { motion } from "framer-motion";

export function Sidebar() {
  const location = useLocation();
  const { sidebarExpanded, setSidebarExpanded } = useUiStore();

  const menuItems = [
    { label: "Home", path: ROUTES.HOME, icon: Home },
    { label: "Search", path: ROUTES.SEARCH, icon: Search },
    { label: "Subscription", path: ROUTES.SUBSCRIPTION, icon: CreditCard },
    { label: "Settings", path: ROUTES.SETTINGS, icon: Settings },
  ];

  return (
    <motion.aside
      onHoverStart={() => setSidebarExpanded(true)}
      onHoverEnd={() => setSidebarExpanded(false)}
      animate={{ width: sidebarExpanded ? 240 : 72 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="hidden md:flex flex-col fixed left-0 top-16 sm:top-20 bottom-0 bg-[#08080C] border-r border-white/5 z-40 overflow-x-hidden shadow-2xl select-none"
    >
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
                className="text-xs font-semibold whitespace-nowrap"
              >
                {item.label}
              </motion.span>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-white/5 text-center">
        {sidebarExpanded ? (
          <span className="text-[10px] font-bold tracking-wide text-white/30">MARQUEE</span>
        ) : (
          <span className="text-[10px] font-black text-white/30">M</span>
        )}
      </div>
    </motion.aside>
  );
}
export default Sidebar;
