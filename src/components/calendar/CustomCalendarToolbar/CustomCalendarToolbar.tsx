// src/components/calendar/CustomCalendarToolbar/CustomCalendarToolbar.tsx
// src/components/calendar/CustomCalendarToolbar/CustomCalendarToolbar.tsx
import type {ToolbarProps} from 'react-big-calendar';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './CustomCalendarToolbar.scss';

export const CustomCalendarToolbar = <T extends object>(props: ToolbarProps<T>) => {
    // onNavigate wywołuje funkcję handleNavigate z pliku Schedule.tsx!
    const { label, onNavigate, onView, view } = props;

    return (
        <div className="custom-calendar-toolbar">
            <div className="toolbar-left">
                <div className="view-switcher">
                    <button className={view === 'day' ? 'active' : ''} onClick={() => onView('day')}>Dzień</button>
                    <button className={view === 'week' ? 'active' : ''} onClick={() => onView('week')}>Tydzień</button>
                    <button className={view === 'month' ? 'active' : ''} onClick={() => onView('month')}>Miesiąc</button>
                </div>
            </div>

            <div className="toolbar-center">
                <button className="icon-btn" onClick={() => onNavigate('PREV')}>
                    <ChevronLeft size={20} />
                </button>

                <span className="toolbar-label">{label}</span>

                <button className="icon-btn" onClick={() => onNavigate('NEXT')}>
                    <ChevronRight size={20} />
                </button>

                {/* Zmieniono napis na "Dzisiaj", kliknięcie wywołuje wbudowaną logikę szukania obecnej daty */}
                <button className="today-btn" onClick={() => onNavigate('TODAY')}>Dzisiaj</button>
            </div>

            <div className="toolbar-right">
                <div className="filter-placeholders">
                    <select><option>Wszystkie Maszyny</option></select>
                    <select><option>Status: Zaplanowane</option></select>
                </div>
            </div>
        </div>
    );
};