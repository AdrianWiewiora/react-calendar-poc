import { useState, useEffect } from 'react';
import { format, startOfWeek, addDays, isSameDay, subWeeks, addWeeks } from 'date-fns';
import { pl } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import type { WorkShift } from '../../models';
import { mockEmployees, mockWorkShifts } from '../../mockData';

import { Modal } from '../../components/common/Modal/Modal';
import { ShiftForm, type ShiftFormData } from '../../components/forms/ShiftForm/ShiftForm';

import './TeamSchedule.scss';

export const TeamSchedule = () => {
    const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 2));
    const [shifts, setShifts] = useState<WorkShift[]>(mockWorkShifts);

    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 5 }).map((_, i) => addDays(weekStart, i));

    // ==========================================
    // ZAAWANSOWANE ZAZNACZANIE (2D BOX + CTRL)
    // ==========================================
    // Przechowujemy zbiór ID w formacie "emp-1|2026-03-02T00..."
    const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
    const [dragStart, setDragStart] = useState<{ empIdx: number, dayIdx: number } | null>(null);
    const [dragCurrent, setDragCurrent] = useState<{ empIdx: number, dayIdx: number } | null>(null);

    // ==========================================
    // STANY MODALA
    // ==========================================
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [slotsToSchedule, setSlotsToSchedule] = useState<{ employeeId: string, date: Date }[]>([]);
    const [selectedShift, setSelectedShift] = useState<WorkShift | null>(null);

    const handlePrevWeek = () => setCurrentDate(subWeeks(currentDate, 1));
    const handleNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));

    // --- LOGIKA MYSZY DO ZAZNACZANIA ---
    const handleMouseDown = (e: React.MouseEvent, empIdx: number, dayIdx: number) => {
        if (e.button !== 0) return; // Tylko lewy przycisk
        setDragStart({ empIdx, dayIdx });
        setDragCurrent({ empIdx, dayIdx });

        // Jeśli NIE trzymamy Ctrl, czyścimy poprzednie zaznaczenia
        if (!e.ctrlKey && !e.shiftKey) {
            setSelectedCells(new Set());
        }
    };

    const handleMouseEnter = (empIdx: number, dayIdx: number) => {
        if (dragStart) {
            setDragCurrent({ empIdx, dayIdx });
        }
    };

    // Globalny nasłuch na puszczenie przycisku myszy (nawet poza tabelą!)
    useEffect(() => {
        const handleMouseUpGlobal = (e: MouseEvent) => {
            setDragStart(prevStart => {
                if (!prevStart) return null;

                setDragCurrent(prevCurrent => {
                    if (!prevCurrent) return null;

                    setSelectedCells(prevSelected => {
                        const newCells = new Set(e.ctrlKey ? prevSelected : []);

                        // Obliczamy pole prostokąta 2D (wspiera ciągnięcie w górę, w dół, w lewo i prawo)
                        const minEmp = Math.min(prevStart.empIdx, prevCurrent.empIdx);
                        const maxEmp = Math.max(prevStart.empIdx, prevCurrent.empIdx);
                        const minDay = Math.min(prevStart.dayIdx, prevCurrent.dayIdx);
                        const maxDay = Math.max(prevStart.dayIdx, prevCurrent.dayIdx);

                        for (let i = minEmp; i <= maxEmp; i++) {
                            for (let j = minDay; j <= maxDay; j++) {
                                newCells.add(`${mockEmployees[i].id}|${weekDays[j].toISOString()}`);
                            }
                        }
                        return newCells;
                    });
                    return null;
                });
                return null;
            });
        };

        window.addEventListener('mouseup', handleMouseUpGlobal);
        return () => window.removeEventListener('mouseup', handleMouseUpGlobal);
    }, [weekDays]);


    // --- PRZECIĄGANIE ISTNIEJĄCYCH ZMIAN ---
    const handleDragStartEvent = (e: React.DragEvent, shiftId: string) => {
        e.dataTransfer.setData('shiftId', shiftId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDrop = (e: React.DragEvent, targetEmployeeId: string, targetDate: Date) => {
        e.preventDefault();
        const shiftId = e.dataTransfer.getData('shiftId');
        if (!shiftId) return;

        setShifts(prev => prev.map(shift => {
            if (shift.id === shiftId) {
                const oldStart = new Date(shift.startTime);
                const oldEnd = new Date(shift.endTime);
                const newStart = new Date(targetDate); newStart.setHours(oldStart.getHours(), oldStart.getMinutes(), 0, 0);
                const newEnd = new Date(targetDate); newEnd.setHours(oldEnd.getHours(), oldEnd.getMinutes(), 0, 0);
                if (oldEnd.getDate() !== oldStart.getDate()) newEnd.setDate(newEnd.getDate() + 1);

                return { ...shift, employeeId: targetEmployeeId, startTime: format(newStart, "yyyy-MM-dd'T'HH:mm:ss"), endTime: format(newEnd, "yyyy-MM-dd'T'HH:mm:ss") };
            }
            return shift;
        }));
    };

    // --- OTWIERANIE MODALA DO HURTOWEGO DODANIA ---
    const openMultiScheduleModal = () => {
        const slots = Array.from(selectedCells).map(key => {
            const [employeeId, dateStr] = key.split('|');
            return { employeeId, date: new Date(dateStr) };
        });
        setSelectedShift(null);
        setSlotsToSchedule(slots);
        setIsModalOpen(true);
    };

    // --- ZAPIS FORMULARZA ---
    const handleSaveForm = (data: ShiftFormData) => {
        if (selectedShift) {
            setShifts(prev => prev.map(shift => shift.id === selectedShift.id
                ? { ...shift, title: data.title, startTime: data.startTime, endTime: data.endTime, status: data.status || 'planned', isAllDay: data.isAllDay, subTasks: data.subTasks || shift.subTasks }
                : shift
            ));
        } else if (slotsToSchedule.length > 0) {
            const startObj = new Date(data.startTime);
            const endObj = new Date(data.endTime);
            const durationMs = endObj.getTime() - startObj.getTime();

            const newShifts: WorkShift[] = slotsToSchedule.map((slot, index) => {
                const shiftStart = new Date(slot.date);
                shiftStart.setHours(startObj.getHours(), startObj.getMinutes(), 0, 0);
                const shiftEnd = new Date(shiftStart.getTime() + durationMs);

                return {
                    id: `shift-${Date.now()}-${index}`,
                    employeeId: slot.employeeId,
                    title: data.title,
                    startTime: format(shiftStart, "yyyy-MM-dd'T'HH:mm:ss"),
                    endTime: format(shiftEnd, "yyyy-MM-dd'T'HH:mm:ss"),
                    status: data.status || 'planned',
                    subTasks: data.subTasks || [],
                    isAllDay: data.isAllDay
                };
            });
            setShifts(prev => [...prev, ...newShifts]);
        }
        setIsModalOpen(false);
        setSelectedCells(new Set()); // Czyścimy po udanym zapisie!
    };

    return (
        <div className="team-schedule-page">
            <header className="page-header">
                <h2>Grafik Zespołu (Tygodniowy)</h2>
                <div className="week-navigation">
                    <button onClick={handlePrevWeek}><ChevronLeft size={20} /></button>
                    <span className="current-week">
                        {format(weekStart, 'd MMMM', { locale: pl })} - {format(weekDays[4], 'd MMMM yyyy', { locale: pl })}
                    </span>
                    <button onClick={handleNextWeek}><ChevronRight size={20} /></button>
                </div>
            </header>

            <div className="matrix-container" style={{ userSelect: 'none' }}>
                <table className="schedule-matrix">
                    <thead>
                    <tr>
                        <th className="employee-col">Pracownik</th>
                        {weekDays.map(day => (
                            <th key={day.toString()} className="day-col">
                                <div className="day-name">{format(day, 'EEEE', { locale: pl })}</div>
                                <div className="day-date">{format(day, 'dd.MM')}</div>
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {mockEmployees.map((employee, empIdx) => (
                        <tr key={employee.id}>
                            <td className="employee-cell">
                                <strong>{employee.firstName} {employee.lastName}</strong>
                                <span className="department">{employee.department}</span>
                            </td>

                            {weekDays.map((day, dayIdx) => {
                                const shift = shifts.find(s => s.employeeId === employee.id && isSameDay(new Date(s.startTime), day));
                                const cellKey = `${employee.id}|${day.toISOString()}`;

                                // Sprawdzamy czy komórka jest w aktywnym przeciąganiu LUB zapisana w Set
                                let isHighlighted = selectedCells.has(cellKey);

                                if (dragStart && dragCurrent) {
                                    const minEmp = Math.min(dragStart.empIdx, dragCurrent.empIdx);
                                    const maxEmp = Math.max(dragStart.empIdx, dragCurrent.empIdx);
                                    const minDay = Math.min(dragStart.dayIdx, dragCurrent.dayIdx);
                                    const maxDay = Math.max(dragStart.dayIdx, dragCurrent.dayIdx);

                                    if (empIdx >= minEmp && empIdx <= maxEmp && dayIdx >= minDay && dayIdx <= maxDay) {
                                        isHighlighted = true;
                                    }
                                }

                                return (
                                    <td
                                        key={day.toString()}
                                        className={`shift-cell ${isHighlighted ? 'selected-range' : ''}`}
                                        onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                                        onDrop={(e) => handleDrop(e, employee.id, day)}
                                        onMouseDown={(e) => handleMouseDown(e, empIdx, dayIdx)}
                                        onMouseEnter={() => handleMouseEnter(empIdx, dayIdx)}
                                    >
                                        {shift ? (
                                            <div
                                                className={`shift-block ${shift.status === 'absent' ? 'absent' : 'planned'}`}
                                                draggable
                                                onDragStart={(e) => handleDragStartEvent(e, shift.id)}
                                                onMouseDown={(e) => e.stopPropagation()} // KLIKNIĘCIE W ZMIANĘ NIE ZAZNACZA KOMÓRKI
                                                onClick={(e) => { e.stopPropagation(); setSelectedShift(shift); setIsModalOpen(true); }}
                                            >
                                                <div className="shift-title">{shift.title}</div>
                                                <div className="shift-time">
                                                    {format(new Date(shift.startTime), 'HH:mm')} - {format(new Date(shift.endTime), 'HH:mm')}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="empty-shift">+</div>
                                        )}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* PŁYWAJĄCY PASEK AKCJI (Floating Action Bar) */}
            {selectedCells.size > 0 && !dragStart && (
                <div className="floating-action-bar">
                    <span>Wybrano {selectedCells.size} komórek</span>
                    <button className="btn-plan" onClick={openMultiScheduleModal}>Zaplanuj zmiany</button>
                    <button className="btn-cancel" onClick={() => setSelectedCells(new Set())}>Odznacz wszystko</button>
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedShift ? "Edytuj zmianę" : `Zaplanuj hurtowo (${slotsToSchedule.length} zmian)`}>
                {(slotsToSchedule.length > 0 || selectedShift) && (() => {
                    const baseDate = selectedShift ? new Date(selectedShift.startTime) : slotsToSchedule[0].date;
                    const defaultStart = new Date(baseDate); defaultStart.setHours(6, 0, 0, 0);
                    const defaultEnd = new Date(baseDate); defaultEnd.setHours(14, 0, 0, 0);

                    return (
                        <ShiftForm
                            key={selectedShift ? selectedShift.id : baseDate.getTime()}
                            initialStart={selectedShift ? new Date(selectedShift.startTime) : defaultStart}
                            initialEnd={selectedShift ? new Date(selectedShift.endTime) : defaultEnd}
                            isTaskMode={false}
                            initialEvent={selectedShift ? { id: selectedShift.id, title: selectedShift.title, start: new Date(selectedShift.startTime), end: new Date(selectedShift.endTime), eventType: 'shift', status: selectedShift.status, allDay: selectedShift.isAllDay, subTasks: selectedShift.subTasks } : null}
                            onSave={handleSaveForm}
                            onCancel={() => setIsModalOpen(false)}
                        />
                    );
                })()}
            </Modal>
        </div>
    );
};