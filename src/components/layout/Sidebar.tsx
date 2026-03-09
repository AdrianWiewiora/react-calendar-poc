import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Calendar as CalendarIcon, Users, Menu, ChevronLeft, Cpu, Layout } from 'lucide-react';
import './Sidebar.scss';

export const Sidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-toggle" onClick={() => setIsCollapsed(!isCollapsed)}>
                {isCollapsed ? <Menu size={24} /> : <ChevronLeft size={24} />}
            </div>

            <nav className="sidebar-nav">
                <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <CalendarIcon size={24} className="nav-icon" />
                    <span className="nav-text">Mój Kalendarz</span>
                </NavLink>

                <NavLink to="/team" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <Users size={24} className="nav-icon" />
                    <span className="nav-text">Grafik Zespołu</span>
                </NavLink>

                <NavLink to="/machines" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <Cpu size={24} className="nav-icon" />
                    <span className="nav-text">Maszyny / Stanowiska</span>
                </NavLink>
                <NavLink to="/raw" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <Layout size={24} className="nav-icon" />
                    <span className="nav-text">Surowy Kalendarz</span>
                </NavLink>
            </nav>
        </aside>
    );
};