// src/models.ts

// 1. Model Pracownika
export interface Employee {
    id: string;
    firstName: string;
    lastName: string;
    department: string; // np. "Produkcja", "Magazyn"
}

// 2. Model Podzadania (Najmniejsza jednostka - np. praca na maszynie)
export interface SubTask {
    id: string;
    title: string;      // np. "Maszyna CNC", "Wózek widłowy"
    startTime: string;  // Używamy stringów (format ISO), bo tak dane przychodzą z JSON/API
    endTime: string;
    color?: string;     // Opcjonalny kolor do odróżnienia stanowisk na kalendarzu
    isAllDay?: boolean;
}

// 3. Model Głównego Zadania (Cała zmiana pracownika w danym dniu)
export interface WorkShift {
    id: string;
    employeeId: string; // Powiązanie z pracownikiem
    title: string;      // np. "Zmiana A" lub "Praca w standardowych godzinach"
    startTime: string;
    endTime: string;
    status: 'planned' | 'in-progress' | 'completed' | 'absent'; // Przydatne pod integrację z RCP!
    subTasks: SubTask[]; // To jest to nasze zagnieżdżenie! Lista podzadań wewnątrz zmiany.
    isAllDay?: boolean;
}