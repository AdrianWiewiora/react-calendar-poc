import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { pl } from 'date-fns/locale';

import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = { pl: pl };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

const myEventsList = [
    { title: 'Spotkanie', start: new Date(2026, 2, 2, 10, 0), end: new Date(2026, 2, 2, 12, 0) },
    { title: 'Przerwa', start: new Date(2026, 2, 3, 14, 0), end: new Date(2026, 2, 3, 15, 0) },
];

export const RawCalendar = () => {
    return (
        <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: '20px' }}>
                <h2>Czysty moduł react-big-calendar</h2>
                <p style={{ color: '#666' }}>Oto jak wygląda i (nie) działa ten moduł prosto z pudełka, bez naszej logiki, drag&drop, styli i customowych widoków.</p>
            </div>
            <div style={{ flex: 1 }}>
                <Calendar
                    localizer={localizer}
                    events={myEventsList}
                    startAccessor="start"
                    endAccessor="end"
                    culture="pl"
                    style={{ height: '100%' }}
                />
            </div>
        </div>
    );
};