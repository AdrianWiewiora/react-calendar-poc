import { useState } from 'react';
import { format } from 'date-fns';
import type { CalendarEvent } from '../../calendar/UniversalCalendar/UniversalCalendar'; // <-- IMPORTUJEMY TYP
import './ShiftForm.scss';

export interface ShiftFormData {
    id?: string; // <--- NOWE: Opcjonalne ID (jeśli edytujemy)
    title: string;
    startTime: string;
    endTime: string;
    mpk?: string;
    status?: 'planned' | 'in-progress' | 'completed' | 'absent';
    isAllDay?: boolean;
}

interface ShiftFormProps {
    initialStart: Date;
    initialEnd: Date;
    isTaskMode: boolean;
    initialEvent?: CalendarEvent | null; // <--- NOWE: Przekazujemy kliknięte zdarzenie
    onSave: (data: ShiftFormData) => void;
    onCancel: () => void;
}

export const ShiftForm = ({ initialStart, initialEnd, isTaskMode, initialEvent, onSave, onCancel }: ShiftFormProps) => {
    const baseDate = format(initialStart, 'yyyy-MM-dd');
    const isSlotAllDay = initialStart.getHours() === 0 && initialEnd.getHours() === 0 && initialStart.getTime() !== initialEnd.getTime();

    // 1. Inicjalizacja: Czytamy z initialEvent (jeśli jest), a jak nie, to z pustego kliknięcia
    const [isAllDay, setIsAllDay] = useState(initialEvent ? !!initialEvent.allDay : isSlotAllDay);

    const defaultShiftStart = !isTaskMode ? `${baseDate}T06:00` : format(initialStart, "yyyy-MM-dd'T'HH:mm");
    const defaultShiftEnd = !isTaskMode ? `${baseDate}T14:00` : format(initialEnd, "yyyy-MM-dd'T'HH:mm");

    const [startTime, setStartTime] = useState(initialEvent ? format(initialEvent.start, "yyyy-MM-dd'T'HH:mm") : defaultShiftStart);
    const [endTime, setEndTime] = useState(initialEvent ? format(initialEvent.end, "yyyy-MM-dd'T'HH:mm") : defaultShiftEnd);

    // 2. Odtwarzanie wyboru z dropdownów przy edycji
    let initShiftType = '1';
    if (initialEvent && !isTaskMode) {
        if (initialEvent.status === 'absent') initShiftType = 'uw';
        else if (initialEvent.title.includes('II Zmiana')) initShiftType = '2';
    }
    const [shiftType, setShiftType] = useState(initShiftType);
    const [taskMachine, setTaskMachine] = useState(initialEvent && isTaskMode ? initialEvent.title : 'M1 - Frezowanie');

    const [mpk, setMpk] = useState('PROD-001');

    const handleShiftChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const type = e.target.value;
        setShiftType(type);

        if (type === '1') { setStartTime(`${baseDate}T06:00`); setEndTime(`${baseDate}T14:00`); }
        else if (type === '2') { setStartTime(`${baseDate}T14:00`); setEndTime(`${baseDate}T22:00`); }
        else if (type === 'uw') { setStartTime(`${baseDate}T08:00`); setEndTime(`${baseDate}T16:00`); }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const finalTitle = isTaskMode
            ? taskMachine
            : shiftType === '1' ? 'I Zmiana' : shiftType === '2' ? 'II Zmiana' : 'Urlop (UW)';

        const finalStatus: 'absent' | 'planned' = shiftType === 'uw' ? 'absent' : 'planned';

        const finalStart = isAllDay ? `${startTime.split('T')[0]}T00:00:00` : startTime;
        const finalEnd = isAllDay ? `${endTime.split('T')[0]}T23:59:59` : endTime;

        onSave({
            id: initialEvent?.id, // <--- Jeśli to edycja, wysyłamy ID wyżej!
            title: finalTitle,
            startTime: finalStart,
            endTime: finalEnd,
            mpk,
            status: finalStatus,
            isAllDay
        });
    };

    return (
        // ... (Cały return z HTML/JSX zostaje bez żadnych zmian!)
        <form onSubmit={handleSubmit} className="shift-form">
            <div className="form-group">
                <label>{isTaskMode ? 'Wybór stanowiska' : 'Rodzaj Zmiany'}</label>
                {!isTaskMode ? (
                    <select value={shiftType} onChange={handleShiftChange}>
                        <option value="1">I Zmiana (06:00 - 14:00)</option>
                        <option value="2">II Zmiana (14:00 - 22:00)</option>
                        <option value="uw">Urlop Wypoczynkowy (UW)</option>
                    </select>
                ) : (
                    <select value={taskMachine} onChange={e => setTaskMachine(e.target.value)}>
                        <option value="M1 - Frezowanie">Maszyna M1 - Frezowanie</option>
                        <option value="M2 - Cięcie">Maszyna M2 - Cięcie</option>
                        <option value="Maszyna M3 - Tokarka">Maszyna M3 - Tokarka</option>
                        <option value="Pakowanie">Strefa Pakowania</option>
                        <option value="Szkolenie BHP">Szkolenie BHP</option>
                        <option value="Audyt Jakości">Audyt Jakości</option>
                        <option value="Spotkanie: Ustalanie grafików">Spotkanie</option>
                    </select>
                )}
            </div>

            <div className="form-group">
                <label>{isTaskMode ? 'Zlecenie Produkcyjne' : 'MPK (Koszty)'}</label>
                <input type="text" value={mpk} onChange={e => setMpk(e.target.value)} placeholder="np. PROD-001" />
            </div>

            <div className="form-group checkbox-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" id="allDayCheck" checked={isAllDay} onChange={e => setIsAllDay(e.target.checked)} style={{ width: 'auto' }} />
                <label htmlFor="allDayCheck" style={{ margin: 0, cursor: 'pointer' }}>Wydarzenie całodniowe</label>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Od</label>
                    <input type={isAllDay ? "date" : "datetime-local"} value={isAllDay ? startTime.split('T')[0] : startTime} onChange={e => setStartTime(isAllDay ? `${e.target.value}T00:00` : e.target.value)} required />
                </div>
                <div className="form-group">
                    <label>Do</label>
                    <input type={isAllDay ? "date" : "datetime-local"} value={isAllDay ? endTime.split('T')[0] : endTime} onChange={e => setEndTime(isAllDay ? `${e.target.value}T23:59` : e.target.value)} required />
                </div>
            </div>

            <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={onCancel}>Anuluj</button>
                <button type="submit" className="btn-submit">Zapisz</button>
            </div>
        </form>
    );
};