// src/mockData.ts
import type { Employee, WorkShift } from './models';

export const mockEmployees: Employee[] = [
    { id: 'emp-1', firstName: 'Jan', lastName: 'Kowalski', department: 'Produkcja' },
    { id: 'emp-2', firstName: 'Anna', lastName: 'Nowak', department: 'Magazyn' },
];

export const mockWorkShifts: WorkShift[] = [
    // --- TYDZIEŃ 1 (2.03 - 6.03): I Zmiana (06:00 - 14:00) ---
    {
        id: 'shift-1', employeeId: 'emp-1', title: 'I Zmiana', startTime: '2026-03-02T06:00:00', endTime: '2026-03-02T14:00:00', status: 'planned',
        subTasks: [
            { id: 'sub-1-1', title: 'Maszyna M1 - Frezowanie', startTime: '2026-03-02T06:00:00', endTime: '2026-03-02T10:00:00', color: '#4a90e2' },
            { id: 'sub-1-2', title: 'Maszyna M2 - Cięcie', startTime: '2026-03-02T10:00:00', endTime: '2026-03-02T14:00:00', color: '#7ed321' }
        ]
    },
    {
        id: 'shift-2', employeeId: 'emp-1', title: 'I Zmiana', startTime: '2026-03-03T06:00:00', endTime: '2026-03-03T14:00:00', status: 'planned',
        subTasks: [
            { id: 'sub-2-1', title: 'Maszyna M1 - Frezowanie', startTime: '2026-03-03T06:00:00', endTime: '2026-03-03T10:00:00', color: '#4a90e2' },
            { id: 'sub-2-2', title: 'Maszyna M2 - Cięcie', startTime: '2026-03-03T10:00:00', endTime: '2026-03-03T14:00:00', color: '#7ed321' }
        ]
    },
    {
        id: 'shift-3', employeeId: 'emp-1', title: 'I Zmiana', startTime: '2026-03-04T06:00:00', endTime: '2026-03-04T14:00:00', status: 'planned',
        subTasks: [
            { id: 'sub-3-1', title: 'Maszyna M3 - Tokarka', startTime: '2026-03-04T06:00:00', endTime: '2026-03-04T12:00:00', color: '#f5a623' },
            { id: 'sub-3-2', title: 'Spotkanie: Ustalanie grafików', startTime: '2026-03-04T12:00:00', endTime: '2026-03-04T14:00:00', color: '#9013fe' }
        ]
    },
    {
        id: 'shift-4', employeeId: 'emp-1', title: 'I Zmiana', startTime: '2026-03-05T06:00:00', endTime: '2026-03-05T14:00:00', status: 'planned',
        subTasks: [
            { id: 'sub-4-1', title: 'Maszyna M1 - Frezowanie', startTime: '2026-03-05T06:00:00', endTime: '2026-03-05T10:00:00', color: '#4a90e2' },
            { id: 'sub-4-2', title: 'Maszyna M2 - Cięcie', startTime: '2026-03-05T10:00:00', endTime: '2026-03-05T14:00:00', color: '#7ed321' }
        ]
    },
    {
        id: 'shift-5', employeeId: 'emp-1', title: 'I Zmiana', startTime: '2026-03-06T06:00:00', endTime: '2026-03-06T14:00:00', status: 'planned',
        subTasks: [
            { id: 'sub-5-1', title: 'Szkolenie BHP', startTime: '2026-03-06T06:00:00', endTime: '2026-03-06T08:00:00', color: '#d0021b' },
            { id: 'sub-5-2', title: 'Maszyna M1 - Frezowanie', startTime: '2026-03-06T08:00:00', endTime: '2026-03-06T14:00:00', color: '#4a90e2' }
        ]
    },

    // --- TYDZIEŃ 2 (9.03 - 13.03): II Zmiana (14:00 - 22:00) i Urlop ---
    {
        id: 'shift-6', employeeId: 'emp-1', title: 'II Zmiana', startTime: '2026-03-09T14:00:00', endTime: '2026-03-09T22:00:00', status: 'planned',
        subTasks: [
            { id: 'sub-6-1', title: 'Maszyna M1 - Frezowanie', startTime: '2026-03-09T14:00:00', endTime: '2026-03-09T18:00:00', color: '#4a90e2' },
            { id: 'sub-6-2', title: 'Maszyna M2 - Cięcie', startTime: '2026-03-09T18:00:00', endTime: '2026-03-09T22:00:00', color: '#7ed321' }
        ]
    },
    {
        id: 'shift-7', employeeId: 'emp-1', title: 'II Zmiana', startTime: '2026-03-10T14:00:00', endTime: '2026-03-10T22:00:00', status: 'planned',
        subTasks: [
            { id: 'sub-7-1', title: 'Pakowanie', startTime: '2026-03-10T14:00:00', endTime: '2026-03-10T18:30:00', color: '#bd10e0' },
            { id: 'sub-7-2', title: 'Maszyna M3 - Tokarka', startTime: '2026-03-10T18:30:00', endTime: '2026-03-10T22:00:00', color: '#f5a623' }
        ]
    },

    // ŚRODA: URLOP WYPOCZYNKOWY (Status: absent)
    { id: 'shift-8', employeeId: 'emp-1', title: 'Urlop (UW)', startTime: '2026-03-11T14:00:00', endTime: '2026-03-11T22:00:00', status: 'absent', subTasks: [] },

    {
        id: 'shift-9', employeeId: 'emp-1', title: 'II Zmiana', startTime: '2026-03-12T14:00:00', endTime: '2026-03-12T22:00:00', status: 'planned',
        subTasks: [
            { id: 'sub-9-1', title: 'Maszyna M1 - Frezowanie', startTime: '2026-03-12T14:00:00', endTime: '2026-03-12T18:00:00', color: '#4a90e2' },
            { id: 'sub-9-2', title: 'Maszyna M2 - Cięcie', startTime: '2026-03-12T18:00:00', endTime: '2026-03-12T22:00:00', color: '#7ed321' }
        ]
    },
    {
        id: 'shift-10', employeeId: 'emp-1', title: 'II Zmiana', startTime: '2026-03-13T14:00:00', endTime: '2026-03-13T22:00:00', status: 'planned',
        subTasks: [
            { id: 'sub-10-1', title: 'Przegląd maszyn', startTime: '2026-03-13T14:00:00', endTime: '2026-03-13T16:00:00', color: '#d0021b' },
            { id: 'sub-10-2', title: 'Maszyna M1 - Frezowanie', startTime: '2026-03-13T16:00:00', endTime: '2026-03-13T22:00:00', color: '#4a90e2' }
        ]
    },
];