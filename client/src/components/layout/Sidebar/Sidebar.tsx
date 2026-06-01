import React from "react";
import { NavLink } from "react-router";

const linkClass = "block text-gray-700 px-3 py-2 rounded hover:bg-gray-100";
const activeClass = "bg-gray-200 font-medium";

type SidebarProps = {
    mobileOpen?: boolean;
    onNavigate?: () => void;
};

const Sidebar: React.FC<SidebarProps> = ({ mobileOpen = false, onNavigate }) => {
    const handleClick = () => {
        onNavigate?.();
    };

    return (
        <>
            {mobileOpen ? (
                <button
                    type="button"
                    aria-label="Close sidebar"
                    className="fixed inset-0 z-30 bg-black/40 lg:hidden"
                    onClick={handleClick}
                />
            ) : null}

            <aside
                className={[
                    "fixed inset-y-0 bg-gray-100 left-0 z-40 w-64  p-4 shadow-xl transition-transform duration-300 lg:static lg:z-auto lg:flex lg:flex-col lg:translate-x-0 lg:shadow-none",
                    mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
                ].join(" ")}
            >
                <div className="text-xl font-semibold mb-6">
                    <NavLink to="/">
                        Smart Mirror
                    </NavLink>
                    </div>
                <nav className="flex-1 space-y-2">
                    <NavLink to="/dashboard/overview" className={({ isActive }) => `${linkClass} ${isActive ? activeClass : ""}`} onClick={handleClick}>
                        Overview
                    </NavLink>
                    <NavLink to="/dashboard/face-recognition" className={({ isActive }) => `${linkClass} ${isActive ? activeClass : ""}`} onClick={handleClick}>
                        Face Recognition
                    </NavLink>
                    <NavLink to="/dashboard/skin-analysis" className={({ isActive }) => `${linkClass} ${isActive ? activeClass : ""}`} onClick={handleClick}>
                        Skin Analysis
                    </NavLink>
                    <NavLink to="/dashboard/audio-processor" className={({ isActive }) => `${linkClass} ${isActive ? activeClass : ""}`} onClick={handleClick}>
                        Audio Processor
                    </NavLink>
                </nav>
                <div className="mt-6 text-sm text-gray-500">v0.1</div>
            </aside>
        </>
    );
};

export default Sidebar;
