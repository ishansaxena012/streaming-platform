import { Link, useLocation } from "react-router-dom";
import { Home, Search, CreditCard, Settings } from "lucide-react";
import { ROUTES } from "../../config/routes";

export function MobileNavigation() {
  const location = useLocation();
  
  const navItems = [
    { label: "Home", path: ROUTES.HOME, icon: Home },
    { label: "Search", path: ROUTES.SEARCH, icon: Search },
    { label: "Plans", path: ROUTES.SUBSCRIPTION, icon: CreditCard },
    { label: "Settings", path: ROUTES.SETTINGS, icon: Settings },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#08080C]/95 backdrop-blur-md border-t border-white/5 flex justify-around items-center z-40 px-2 shadow-[0_-5px_15px_rgba(0,0,0,0.5)]">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center gap-1.5 flex-1 py-1 transition-all ${
              isActive
                ? "text-netflix-red scale-105"
                : "text-cinema-gray hover:text-white"
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[9px] font-bold tracking-wider uppercase">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
export default MobileNavigation;
