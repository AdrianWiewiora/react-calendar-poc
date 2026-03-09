import { useState, useRef, useEffect } from 'react';
import type { View, SlotInfo } from 'react-big-calendar';
import { format } from 'date-fns';

import type { WorkShift } from '../../models';
import { mockWorkShifts } from '../../mockData';
import { UniversalCalendar, type CalendarEvent, type EventInteractionArgs } from '../../components/calendar/UniversalCalendar/UniversalCalendar';

import { Modal } from '../../components/common/Modal/Modal';
import { ShiftForm, type ShiftFormData } from '../../components/forms/ShiftForm/ShiftForm';

import './MyCalendar.scss';

export const MyCalendar = () => {
    const [shifts, setShifts] = useState<WorkShift[]>(mockWorkShifts);
    const [calendarView, setCalendarView] = useState<View>('week');
    const [workMode, setWorkMode] = useState<'shifts' | 'tasks'>('shifts');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<{start: Date, end: Date} | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null); // <--- ZAPAMIĘTUJEMY KLIKNIĘTE ZADANIE

    const myShifts = shifts.filter(shift => shift.employeeId === 'emp-1');
    const isTaskMode = (calendarView === 'week' && workMode === 'tasks') || calendarView === 'day';

    let displayEvents: CalendarEvent[] = [];
    let displayBackgroundEvents: CalendarEvent[] = [];

    if (isTaskMode) {
        displayBackgroundEvents = myShifts.map(shift => ({
            id: shift.id,
            title: shift.title,
            start: new Date(shift.startTime),
            end: new Date(shift.endTime),
            status: shift.status,
            eventType: 'shift',
            allDay: shift.isAllDay,
            subTasks: shift.subTasks
        }));

        displayEvents = myShifts.flatMap(shift =>
            (shift.subTasks || []).map(sub => ({
                id: sub.id,
                title: sub.title,
                start: new Date(sub.startTime),
                end: new Date(sub.endTime),
                color: sub.color,
                eventType: 'task',
                allDay: sub.isAllDay,
                subTasks: shift.subTasks
            }))
        );
    } else {
        displayEvents = myShifts.map(shift => ({
            id: shift.id,
            title: shift.title,
            start: new Date(shift.startTime),
            end: new Date(shift.endTime),
            status: shift.status,
            eventType: 'shift',
            allDay: shift.isAllDay,
            subTasks: shift.subTasks
        }));
    }

    const handleSlotClick = (slotInfo: SlotInfo) => {
        setSelectedEvent(null);
        setSelectedSlot({
            start: new Date(slotInfo.start),
            end: new Date(slotInfo.end)
        });
        setIsModalOpen(true);
    };

    const handleEventClick = (event: CalendarEvent) => {
        setSelectedSlot(null);
        setSelectedEvent(event);
        setIsModalOpen(true);
    };

    const handleSaveForm = (data: ShiftFormData) => {
        if (data.id) {
            setShifts(prev => prev.map(shift => {
                if (isTaskMode) {
                    if (shift.subTasks?.some(sub => sub.id === data.id)) {
                        return {
                            ...shift,
                            subTasks: shift.subTasks.map(sub =>
                                sub.id === data.id
                                    ? { ...sub, title: data.title, startTime: data.startTime, endTime: data.endTime, isAllDay: data.isAllDay }
                                    : sub
                            )
                        };
                    }
                } else {
                    if (shift.id === data.id) {
                        return {
                            ...shift,
                            title: data.title,
                            startTime: data.startTime,
                            endTime: data.endTime,
                            status: data.status || 'planned',
                            isAllDay: data.isAllDay,
                            subTasks: data.subTasks || shift.subTasks
                        };
                    }
                }
                return shift;
            }));
        } else {
            if (isTaskMode) {
                setShifts(prev => prev.map(shift => {
                    const shiftStart = new Date(shift.startTime);
                    const shiftEnd = new Date(shift.endTime);
                    const taskStart = new Date(data.startTime);
                    const taskEnd = new Date(data.endTime);

                    const isSameDay = shiftStart.getDate() === taskStart.getDate() && shiftStart.getMonth() === taskStart.getMonth() && shiftStart.getFullYear() === taskStart.getFullYear();

                    if (shift.employeeId === 'emp-1' && ((taskStart >= shiftStart && taskEnd <= shiftEnd) || (data.isAllDay && isSameDay))) {
                        const newTask = {
                            id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                            title: data.title,
                            startTime: data.startTime,
                            endTime: data.endTime,
                            color: data.title.includes('M1') ? '#4a90e2' : '#f5a623',
                            isAllDay: data.isAllDay
                        };
                        return { ...shift, subTasks: [...(shift.subTasks || []), newTask] };
                    }
                    return shift;
                }));
            } else {
                const newShift: WorkShift = {
                    // eslint-disable-next-line react-hooks/purity
                    id: `shift-${Date.now()}`,
                    employeeId: 'emp-1',
                    title: data.title,
                    startTime: data.startTime,
                    endTime: data.endTime,
                    status: data.status || 'planned',
                    subTasks: data.subTasks || [],
                    isAllDay: data.isAllDay
                };
                setShifts(prev => [...prev, newShift]);
            }
        }

        closeModal();
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedSlot(null);
        setSelectedEvent(null);
    };

    const handleEventDrop = ({ event, start, end }: EventInteractionArgs) => {
        const isCopy = isCtrlPressed.current; // Sprawdzamy, czy wciśnięto Ctrl w momencie puszczenia

        const startDate = start instanceof Date ? start : new Date(start);
        const endDate = end instanceof Date ? end : new Date(end);
        const newStart = format(startDate, "yyyy-MM-dd'T'HH:mm:ss");
        const newEnd = format(endDate, "yyyy-MM-dd'T'HH:mm:ss");

        setShifts(prevShifts => {
            if (isCopy) {
                if (isTaskMode) {
                    return prevShifts.map(shift => {
                        const shiftStart = new Date(shift.startTime);
                        const shiftEnd = new Date(shift.endTime);
                        const taskStart = new Date(newStart);
                        const taskEnd = new Date(newEnd);
                        const isSameDay = shiftStart.getDate() === taskStart.getDate() && shiftStart.getMonth() === taskStart.getMonth() && shiftStart.getFullYear() === taskStart.getFullYear();

                        // Znajdujemy zmianę na nowym miejscu i wrzucamy jej KLONA zadania
                        if (shift.employeeId === 'emp-1' && ((taskStart >= shiftStart && taskEnd <= shiftEnd) || (event.allDay && isSameDay))) {
                            const newTask = {
                                id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                                title: event.title,
                                startTime: newStart,
                                endTime: newEnd,
                                color: event.color, // Kopiujemy też kolor!
                                isAllDay: event.allDay
                            };
                            return { ...shift, subTasks: [...(shift.subTasks || []), newTask] };
                        }
                        return shift;
                    });
                } else {
                    // Kopiowanie Głównej Zmiany
                    const newShift: WorkShift = {
                        id: `shift-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                        employeeId: 'emp-1',
                        title: event.title,
                        startTime: newStart,
                        endTime: newEnd,
                        status: (event.status as 'planned' | 'in-progress' | 'completed' | 'absent') || 'planned',
                        subTasks: event.subTasks || [],
                        isAllDay: event.allDay
                    };
                    return [...prevShifts, newShift];
                }
            } else {
                return prevShifts.map(shift => {
                    if (isTaskMode) {
                        if (shift.subTasks) {
                            return {
                                ...shift,
                                subTasks: shift.subTasks.map(sub => sub.id === event.id ? { ...sub, startTime: newStart, endTime: newEnd } : sub)
                            };
                        }
                    } else {
                        if (shift.id === event.id) {
                            return { ...shift, startTime: newStart, endTime: newEnd };
                        }
                    }
                    return shift;
                });
            }
        });
    };

    const handleEventResize = (args: EventInteractionArgs) => {
        const wasCtrlPressed = isCtrlPressed.current;
        isCtrlPressed.current = false;
        handleEventDrop(args);
        isCtrlPressed.current = wasCtrlPressed; // Przywracamy stan na wszelki wypadek
    };
    const isCtrlPressed = useRef(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Control') isCtrlPressed.current = true;
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === 'Control') isCtrlPressed.current = false;
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    return (
        <div className="my-calendar-page">
            <header className="page-header-toggles">
                <h2>Mój Kalendarz: Jan Kowalski</h2>

                {calendarView === 'week' && (
                    <div className="mode-toggle">
                        <button className={workMode === 'shifts' ? 'active' : ''} onClick={() => setWorkMode('shifts')}>Tryb Zmianowy</button>
                        <button className={workMode === 'tasks' ? 'active' : ''} onClick={() => setWorkMode('tasks')}>Tryb Pracy (Zadania)</button>
                    </div>
                )}
            </header>

            <div className="calendar-container">
                <UniversalCalendar
                    events={displayEvents}
                    backgroundEvents={displayBackgroundEvents}
                    onSlotClick={handleSlotClick}
                    onEventClick={handleEventClick}
                    onEventDrop={handleEventDrop}
                    onEventResize={handleEventResize}
                    defaultView="week"
                    onViewChange={setCalendarView}
                    customWrapperClass={isTaskMode ? 'task-mode-active' : ''}
                />
            </div>

            {/* MODAL Z FORMULARZEM */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={selectedEvent ? "Edytuj" : (isTaskMode ? "Dodaj nowe zadanie" : "Dodaj nową zmianę")}
            >
                {(selectedSlot || selectedEvent) && (
                    <ShiftForm
                        key={selectedEvent ? selectedEvent.id : selectedSlot!.start.getTime()}
                        initialStart={selectedEvent ? selectedEvent.start : selectedSlot!.start}
                        initialEnd={selectedEvent ? selectedEvent.end : selectedSlot!.end}
                        isTaskMode={isTaskMode}
                        initialEvent={selectedEvent}
                        onSave={handleSaveForm}
                        onCancel={closeModal}
                    />
                )}
            </Modal>
        </div>
    );
};