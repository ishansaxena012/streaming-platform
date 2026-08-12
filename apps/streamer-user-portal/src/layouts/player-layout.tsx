import { Outlet } from "react-router-dom";

export function PlayerLayout() {
  return (
    <div className="min-h-screen w-full bg-black text-white relative overflow-hidden flex flex-col">
      <Outlet />
    </div>
  );
}
export default PlayerLayout;
