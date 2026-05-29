import { Outlet, NavLink } from "react-router";

const AppLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b">
        <div className="mx-auto max-w-6xl flex items-center justify-between p-4">
          <div className="text-lg font-semibold">Smart Mirror</div>
          <nav className="space-x-4">
            <NavLink to="/" end className={({ isActive }) => (isActive ? "text-blue-600 font-medium" : "text-gray-700")}>
              Home
            </NavLink>
            <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "text-blue-600 font-medium" : "text-gray-700")}>
              Dashboard
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
