// src/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Style
import './index.scss';
import './components/layout/Layout.scss';

// Komponenty i Strony
import { Topbar } from './components/layout/Topbar';
import { Sidebar } from './components/layout/Sidebar';
import { MyCalendar } from './pages/MyCalendar/MyCalendar.tsx';
import { TeamSchedule } from './pages/TeamSchedule/TeamSchedule';
import { Machines } from './pages/Machines/Machines';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <BrowserRouter>
            <div className="app-container">
                <Topbar />
                <div className="main-wrapper">
                    <Sidebar />
                    <main className="content-area">
                        <Routes>
                            <Route path="/" element={<MyCalendar />} />
                            <Route path="/team" element={<TeamSchedule />} />
                            <Route path="/machines" element={<Machines />} />
                        </Routes>
                    </main>
                </div>
            </div>
        </BrowserRouter>
    </StrictMode>,
);