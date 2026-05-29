import { Outlet } from "react-router";
import Sidebar from "../components/layout/Sidebar/Sidebar";

const Dashboard = () => {
  return (
    <div className="relative isolate flex min-h-screen w-full max-lg:flex-col bg-gray-200">
      <Sidebar />
      <main className="flex flex-1 flex-col pb-2 lg:min-w-0 lg:pt-2 lg:pr-2 lg:pl-64">
        <div className="grow p-6 bg-gray-100 lg:rounded-lg lg:p-10 lg:shadow-xs lg:ring-1 lg:ring-zinc-950/5">
          <div className="mx-auto max-w-6xl">
            <div className="mt-6">
              <Outlet />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
