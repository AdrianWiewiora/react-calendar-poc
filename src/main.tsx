// src/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';

// Style
import './index.scss';
import './components/layout/Layout.scss';

import { Topbar } from './components/layout/Topbar';
import { Sidebar } from './components/layout/Sidebar';
import { MyCalendar } from './pages/MyCalendar/MyCalendar.tsx';
import { TeamSchedule } from './pages/TeamSchedule/TeamSchedule';
import { Machines } from './pages/Machines/Machines';
import {RawCalendar} from "./pages/RawCalendar/RawCalendar.tsx";

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <HashRouter>
            <div className="app-container">
                <Topbar />
                <div className="main-wrapper">
                    <Sidebar />
                    <main className="content-area">
                        <Routes>
                            <Route path="/" element={<MyCalendar />} />
                            <Route path="/team" element={<TeamSchedule />} />
                            <Route path="/machines" element={<Machines />} />
                            <Route path="/raw" element={<RawCalendar />} />
                        </Routes>
                    </main>
                </div>
            </div>
        </HashRouter>
    </StrictMode>,
);