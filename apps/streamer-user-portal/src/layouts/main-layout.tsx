import { Outlet } from "react-router-dom";
import { Navbar } from "../components/shell/navbar";
import { Sidebar } from "../components/shell/sidebar";
import { MobileNavigation } from "../components/shell/mobile-navigation";
import { Footer } from "../components/shell/footer";
import { useUiStore } from "../store/ui.store";

export function MainLayout() {
  const sidebarExpanded = useUiStore((state) => state.sidebarExpanded);

  return (
    <div className="flex flex-col min-h-screen bg-[#08080C] text-white overflow-x-hidden">
      {/* Sticky top header */}
      <Navbar />
      
      {/* Collapsible hover sidebar */}
      <Sidebar />
      
      {/* Dynamic left padding adjusting on desktop sizes to accommodate the sidebar */}
      <div
        className={`flex-grow transition-all duration-300 ease-in-out ${
          sidebarExpanded ? "md:pl-[240px]" : "md:pl-[72px]"
        }`}
      >
        <div className="flex flex-col min-h-screen pt-16 sm:pt-20 pb-16 md:pb-0">
          <main className="flex-grow">
            <Outlet />
          </main>
          {/* Cinema category footer */}
          <Footer />
        </div>
      </div>
      
      {/* Smartphone navigation bottom navigation tab bar */}
      <MobileNavigation />
    </div>
  );
}
export default MainLayout;
