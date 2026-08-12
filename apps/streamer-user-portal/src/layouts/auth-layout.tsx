import { Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <div
      className="min-h-screen w-full bg-cover bg-center flex items-center justify-center relative px-4 select-none"
      style={{
        backgroundImage: `linear-gradient(rgba(8, 8, 12, 0.8), rgba(8, 8, 12, 0.8)), url('https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1920&q=80')`,
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-[#08080C] via-transparent to-[#08080C]/85 pointer-events-none" />

      <div className="absolute top-8 left-6 sm:left-10">
        <span className="text-2xl sm:text-3xl font-black tracking-wide text-netflix-red drop-shadow-[0_0_8px_#E50914]">
          MARQUEE
        </span>
      </div>

      <div className="w-full max-w-md z-10 py-12">
        <Outlet />
      </div>
    </div>
  );
}
export default AuthLayout;
