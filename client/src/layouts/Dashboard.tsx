import { Outlet } from "react-router";
import { useState } from "react";
import Sidebar from "../components/layout/Sidebar/Sidebar";

const Dashboard = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="relative isolate flex min-h-screen w-full bg-gray-100">
      <Sidebar mobileOpen={mobileSidebarOpen} onNavigate={() => setMobileSidebarOpen(false)} />
      <main className="flex flex-1 flex-col min-w-0 lg:p-2">
        <div className="flex items-center justify-between border-b border-zinc-950/5 bg-gray-100 px-4 py-3 lg:hidden">
          <button
            type="button"
            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-zinc-950/10"
            onClick={() => setMobileSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            Menu
          </button>
          <div className="text-sm font-medium text-gray-600">Dashboard</div>
        </div>
        <div className="flex-1 p-4 bg-gray-100 lg:p-8 lg:rounded-lg lg:shadow-xs lg:ring-1 lg:ring-zinc-950/5">
          <div className="mx-auto w-full max-w-7xl h-full">
            <div>
              <Outlet />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
