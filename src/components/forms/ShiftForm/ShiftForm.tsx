import { useState } from 'react';
import { format } from 'date-fns';
import type { CalendarEvent } from '../../calendar/UniversalCalendar/UniversalCalendar';
import './ShiftForm.scss';

export interface TaskDraft {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    color?: string;
}

export interface ShiftFormData {
    id?: string;
    title: string;
    startTime: string;
    endTime: string;
    mpk?: string;
    status?: 'planned' | 'in-progress' | 'completed' | 'absent';
    isAllDay?: boolean;
    subTasks?: TaskDraft[];
}

interface ShiftFormProps {
    initialStart: Date;
    initialEnd: Date;
    isTaskMode: boolean;
    initialEvent?: CalendarEvent | null;
    onSave: (data: ShiftFormData) => void;
    onCancel: () => void;
}

export const ShiftForm = ({ initialStart, initialEnd, isTaskMode, initialEvent, onSave, onCancel }: ShiftFormProps) => {
    const baseDate = format(initialStart, 'yyyy-MM-dd');
    const isSlotAllDay = initialStart.getHours() === 0 && initialEnd.getHours() === 0 && initialStart.getTime() !== initialEnd.getTime();

    const [isAllDay, setIsAllDay] = useState(initialEvent ? !!initialEvent.allDay : isSlotAllDay);

    const defaultShiftStart = !isTaskMode ? `${baseDate}T06:00` : format(initialStart, "yyyy-MM-dd'T'HH:mm");
    const defaultShiftEnd = !isTaskMode ? `${baseDate}T14:00` : format(initialEnd, "yyyy-MM-dd'T'HH:mm");

    const [startTime, setStartTime] = useState(initialEvent ? format(initialEvent.start, "yyyy-MM-dd'T'HH:mm") : defaultShiftStart);
    const [endTime, setEndTime] = useState(initialEvent ? format(initialEvent.end, "yyyy-MM-dd'T'HH:mm") : defaultShiftEnd);

    let initShiftType = '1';
    if (initialEvent && !isTaskMode) {
        if (initialEvent.status === 'absent') initShiftType = 'uw';
        else if (initialEvent.title.includes('II Zmiana')) initShiftType = '2';
    }
    const [shiftType, setShiftType] = useState(initShiftType);
    const [taskMachine, setTaskMachine] = useState(initialEvent && isTaskMode ? initialEvent.title : 'M1 - Frezowanie');

    // --- TUTAJ JEST STAN MPK ---
    const [mpk, setMpk] = useState('PROD-001');

    const [localTasks, setLocalTasks] = useState<TaskDraft[]>(initialEvent?.subTasks ? [...initialEvent.subTasks] : []);
    const [isAddingTask, setIsAddingTask] = useState(false);

    const [newTaskTitle, setNewTaskTitle] = useState('M1 - Frezowanie');
    const [newTaskStart, setNewTaskStart] = useState(startTime);
    const [newTaskEnd, setNewTaskEnd] = useState(endTime);

    const handleAddTask = () => {
        const color = newTaskTitle.includes('M1') ? '#4a90e2' : newTaskTitle.includes('M2') ? '#7ed321' : '#f5a623';

        const newTask: TaskDraft = {
            id: `sub-${Date.now()}`,
            title: newTaskTitle,
            startTime: newTaskStart,
            endTime: newTaskEnd,
            color
        };

        setLocalTasks(prev => [...prev, newTask].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()));
        setIsAddingTask(false);
    };

    const handleRemoveTask = (taskId: string) => {
        setLocalTasks(prev => prev.filter(t => t.id !== taskId));
    };

    const handleShiftChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const type = e.target.value;
        setShiftType(type);
        if (type === '1') { setStartTime(`${baseDate}T06:00`); setEndTime(`${baseDate}T14:00`); }
        else if (type === '2') { setStartTime(`${baseDate}T14:00`); setEndTime(`${baseDate}T22:00`); }
        else if (type === 'uw') { setStartTime(`${baseDate}T08:00`); setEndTime(`${baseDate}T16:00`); }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalTitle = isTaskMode ? taskMachine : shiftType === '1' ? 'I Zmiana' : shiftType === '2' ? 'II Zmiana' : 'Urlop (UW)';
        const finalStatus: 'absent' | 'planned' = shiftType === 'uw' ? 'absent' : 'planned';
        const finalStart = isAllDay ? `${startTime.split('T')[0]}T00:00:00` : startTime;
        const finalEnd = isAllDay ? `${endTime.split('T')[0]}T23:59:59` : endTime;

        onSave({
            id: initialEvent?.id,
            title: finalTitle,
            startTime: finalStart,
            endTime: finalEnd,
            mpk,
            status: finalStatus,
            isAllDay,
            subTasks: localTasks
        });
    };

    return (
        <div className="shift-form-wrapper">
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
                        </select>
                    )}
                </div>

                <div className="form-group">
                    <label>MPK / Zlecenie</label>
                    <input type="text" value={mpk} onChange={e => setMpk(e.target.value)} />
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
                    <button type="submit" className="btn-submit">Zapisz całość</button>
                </div>
            </form>

            {!isTaskMode && (
                <div className="shift-tasks-sidebar">
                    <h4>Plan dnia (Zadania)</h4>
                    <div className="tasks-timeline">
                        {localTasks.map(task => (
                            <div key={task.id} className="mini-task-card" style={{ borderLeftColor: task.color || '#4a90e2' }}>
                                <div className="task-header-row">
                                    <div className="task-title">{task.title}</div>
                                    <button type="button" className="btn-remove-task" onClick={() => handleRemoveTask(task.id)}>×</button>
                                </div>
                                <div className="task-time">
                                    {format(new Date(task.startTime), 'HH:mm')} - {format(new Date(task.endTime), 'HH:mm')}
                                </div>
                            </div>
                        ))}
                        {localTasks.length === 0 && !isAddingTask && <div className="no-tasks">Brak zaplanowanych zadań.</div>}
                    </div>

                    {isAddingTask ? (
                        <div className="mini-task-form">
                            <select value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} className="mini-input">
                                <option value="M1 - Frezowanie">M1 - Frezowanie</option>
                                <option value="M2 - Cięcie">M2 - Cięcie</option>
                                <option value="Maszyna M3 - Tokarka">M3 - Tokarka</option>
                                <option value="Pakowanie">Pakowanie</option>
                                <option value="Szkolenie BHP">Szkolenie BHP</option>
                            </select>
                            <div className="mini-time-row">
                                <input type="time" value={newTaskStart.split('T')[1]?.substring(0,5)} onChange={e => setNewTaskStart(`${baseDate}T${e.target.value}`)} className="mini-input" />
                                <span>-</span>
                                <input type="time" value={newTaskEnd.split('T')[1]?.substring(0,5)} onChange={e => setNewTaskEnd(`${baseDate}T${e.target.value}`)} className="mini-input" />
                            </div>
                            <div className="mini-form-actions">
                                <button type="button" onClick={() => setIsAddingTask(false)} className="btn-mini-cancel">Anuluj</button>
                                <button type="button" onClick={handleAddTask} className="btn-mini-add">Dodaj</button>
                            </div>
                        </div>
                    ) : (
                        <button type="button" className="btn-add-task-trigger" onClick={() => {
                            setNewTaskStart(startTime);
                            setNewTaskEnd(endTime);
                            setIsAddingTask(true);
                        }}>
                            + Dodaj zadanie
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};