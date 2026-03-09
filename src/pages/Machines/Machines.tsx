import { useState } from 'react';

import { mockEmployees, mockWorkShifts } from '../../mockData';
import { UniversalCalendar, type CalendarEvent } from '../../components/calendar/UniversalCalendar/UniversalCalendar';

import './Machines.scss';

const MACHINES_LIST = [
    'Maszyna M1 - Frezowanie',
    'Maszyna M2 - Cięcie',
    'Maszyna M3 - Tokarka',
    'Pakowanie'
];

export const Machines = () => {
    const [selectedMachine, setSelectedMachine] = useState(MACHINES_LIST[0]);

    const machineEvents: CalendarEvent[] = [];

    mockWorkShifts.forEach(shift => {
        const employee = mockEmployees.find(emp => emp.id === shift.employeeId);
        const empName = employee ? `${employee.firstName} ${employee.lastName}` : 'Nieznany pracownik';

        shift.subTasks?.forEach(task => {
            if (task.title.includes(selectedMachine) || selectedMachine.includes(task.title)) {
                machineEvents.push({
                    id: task.id,
                    title: `${empName}`,
                    start: new Date(task.startTime),
                    end: new Date(task.endTime),
                    eventType: 'task',
                    color: task.color
                });
            }
        });
    });

    return (
        <div className="machines-page">
            <header className="page-header-toggles">
                <h2>Obciążenie Maszyn</h2>

                <div className="machine-selector">
                    <label>Filtruj zasób: </label>
                    <select
                        value={selectedMachine}
                        onChange={(e) => setSelectedMachine(e.target.value)}
                    >
                        {MACHINES_LIST.map(machine => (
                            <option key={machine} value={machine}>{machine}</option>
                        ))}
                    </select>
                </div>
            </header>

            <div className="calendar-container">
                <UniversalCalendar
                    events={machineEvents}
                    defaultView="week"
                />
            </div>
        </div>
    );
};