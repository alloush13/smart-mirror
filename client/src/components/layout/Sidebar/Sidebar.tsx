import React from "react";
import { NavLink } from "react-router";

const linkClass = "block text-gray-700 px-3 py-2 rounded hover:bg-gray-100";
const activeClass = "bg-gray-100 font-medium";

const Sidebar: React.FC = () => {
    return (
        <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r p-4">
            <div className="text-xl font-semibold mb-6">Smart Mirror</div>
            <nav className="flex-1 space-y-2">
                <NavLink to="/" end className={({ isActive }) => `${linkClass} ${isActive ? activeClass : ""}`}>
                    Home
                </NavLink>
                <NavLink to="/dashboard" className={({ isActive }) => `${linkClass} ${isActive ? activeClass : ""}`}>
                    Dashboard
                </NavLink>
                <NavLink to="/dashboard/audio-processor" className={({ isActive }) => `${linkClass} ${isActive ? activeClass : ""}`}>
                    Audio Processor
                </NavLink>
                <NavLink to="/dashboard/health" className={({ isActive }) => `${linkClass} ${isActive ? activeClass : ""}`}>
                    Health
                </NavLink>
            </nav>
            <div className="mt-6 text-sm text-gray-500">v0.1</div>
        </aside>
    );
};

export default Sidebar;
